"""04 Ekim denetimindeki Y01–Y10 için izole tarayıcı kabul testleri."""
import datetime,json,os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18766')
PASSWORD='Synthetic-Fix-123!'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 def setup():
  c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort())
  page=c.new_page();errors=[];dialogs=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:(dialogs.append(d.message),d.accept()))
  page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill(PASSWORD);page.locator('#local-auth-password-repeat').fill(PASSWORD);page.locator('#local-auth-submit').click()
  page.wait_for_function('() => window.dataReady && !!window.editorRelease')
  return c,page,errors,dialogs
 def upload(page,data):
  page.locator('#inp-json-file').set_input_files({'name':'synthetic.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
  page.wait_for_timeout(3500)
 # Y01: actual JSON input -> editor/preview; both prevention and output escaping.
 c,page,errors,dialogs=setup();before=page.evaluate("localStorage.getItem('seyir_admin_data')")
 payload='<img src=x onerror="window.__xss=1">'
 upload(page,{'tamamlamaAtamalari':{'Pazartesi':[{'saat':payload,'sinif':'9A','dersAdi':'Test'}]}})
 assert page.evaluate("localStorage.getItem('seyir_admin_data')")==before
 assert any('indeksi' in d for d in dialogs),dialogs
 upload(page,{'sinavlar':[{'id':'exam','ders':'Test','siniflar':'9A','tarih':'05.10.2026','saat':'10:00','dersSaati':payload,'tur':'Test'}]})
 page.evaluate('editSinav(0)');page.wait_for_timeout(150)
 assert not page.evaluate('window.__xss===1')
 assert page.locator('#prev-sinav-tarih-saat img').count()==0
 assert payload in page.locator('#prev-sinav-tarih-saat').inner_text()
 # renderer remains safe even for unvalidated in-memory data
 page.evaluate("v=>{appData.tamamlamaAtamalari={Pazartesi:[{saat:v,sinif:'9A'}]};renderTamamlama('Pazartesi')}",payload)
 assert page.locator('#tamamlama-atananlar-body img').count()==0
 assert errors==[],errors;c.close();print('Y01: iki XSS yolu engellendi.',flush=True)
 # Y02: genuine UI producers, gaps/deletion, reload, public, full backup restore.
 c,page,errors,dialogs=setup()
 page.evaluate("""()=>{appData.sinifListesi=['9A'];currentProgramSinif='9A';updateProgramCellLesson('9A','Pazartesi',2,'Matematik');updateProgramCellLesson('9A','Pazartesi',4,'Fen');clearProgramCell('9A','Pazartesi',2);updateProgramCellTeacher('9A','Pazartesi',4,'SYNTHETIC_TEACHER')}""")
 slots=page.evaluate("JSON.parse(localStorage.getItem('seyir_public_data')).dersProgramiDetay['9A'].Pazartesi")
 assert len(slots)==5 and slots[2]=={} and slots[4]['ders']=='Fen',slots
 page.reload();page.wait_for_function('() => window.dataReady')
 assert page.evaluate("appData.dersProgramiDetay['9A'].Pazartesi[4].ogretmen")=='SYNTHETIC_TEACHER'
 bundle=page.evaluate('SeyirBackup.create(appData)');page.evaluate("appData.dersProgramiDetay={};saveData()")
 upload(page,bundle);assert page.evaluate("appData.dersProgramiDetay['9A'].Pazartesi[4].ders")=='Fen'
 page.goto(BASE+'/index.html');page.wait_for_function("() => window.PanoTV && PanoTV.getData()?.dersProgramiDetay?.['9A']")
 assert page.evaluate("PanoTV.getData().dersProgramiDetay['9A'].Pazartesi[4].ders")=='Fen'
 assert errors==[],errors;c.close();print('Y02: program, boş saat, silme, yeniden açma, pano ve yedek dönüşü geçti.',flush=True)
 # Y03: 11 MB real Blob, hash + decode, import into clean browser profile.
 c,page,errors,dialogs=setup()
 bundle=page.evaluate("""async()=>{await SeyirAudioStore.saveAudio('large',new Blob([new Uint8Array(11000000)],{type:'video/mp4'}));appData.karuselVideolar=[{id:'v',tur:'mp4-file',mediaId:'large',dosyaBoyut:11000000}];saveData();return await SeyirBackup.create(appData)}""")
 c2,other,_,_=setup();upload(other,bundle)
 assert other.evaluate("SeyirAudioStore.getAudio('large').then(r=>r.blob.size)")==11000000
 assert other.evaluate("appData.karuselVideolar[0].dosyaBoyut")==11000000
 assert other.evaluate("""async()=>{try{await SeyirAudioStore.saveAudio('oversize',new Blob([new Uint8Array(SeyirDataPolicy.MAX_MEDIA+1)],{type:'video/mp4'}));return false}catch(e){return !(await SeyirAudioStore.getAudio('oversize'))}}""")
 c2.close();c.close();print('Y03: 11 MB medya yeni profile taşındı; üst sınır reddedildi.',flush=True)
 # Y04: failed deletion preserves blob+both configs, shared references protected.
 c,page,errors,dialogs=setup()
 assert page.evaluate("""async()=>{
 await SeyirAudioStore.saveAudio('shared',new Blob(['ORIGINAL'],{type:'video/mp4'}));
 appData.karuselVideolar=[{id:'a',mediaId:'shared',tur:'mp4-file'},{id:'b',mediaId:'shared',tur:'mp4-file'}];saveData();
 const old=localStorage.getItem('seyir_admin_data'),pub=localStorage.getItem('seyir_public_data');
 const original=Storage.prototype.setItem;let fail=true;
 Storage.prototype.setItem=function(k,v){if(k==='seyir_public_data'&&fail){fail=false;throw new DOMException('test quota','QuotaExceededError')}return original.call(this,k,v)};
 let rejected=false;try{await silVideo(0)}catch(e){rejected=true}finally{Storage.prototype.setItem=original}
 if(!rejected||old!==localStorage.getItem('seyir_admin_data')||pub!==localStorage.getItem('seyir_public_data')||!(await SeyirAudioStore.getAudio('shared')))return false;
 await silVideo(0);if(!(await SeyirAudioStore.getAudio('shared')))return false;
 await silVideo(0);return !(await SeyirAudioStore.getAudio('shared'));
 }""")
 assert errors==[],errors;c.close();print('Y04: kota geri alma ve paylaşılan medya silme geçti.',flush=True)
 # Y05: no admin present; live clock rollover then reload, and unknown legacy expiry.
 for legacy in [False,True]:
  c,page,errors,dialogs=setup()
  page.evaluate("""()=>{appData.gizlilik.personelAdiGosterim='tam';appData.gizlilik.nobetciGoster=true;appData.gizlilik.saklamaSuresiGun=1;appData.nobetciOgretmenler=['SYNTHETIC_RETAIN'];appData.nobetciGunluk={Pazartesi:['SYNTHETIC_RETAIN']};saveData()}""")
  if legacy: page.evaluate("let d=JSON.parse(localStorage.getItem('seyir_public_data'));delete d._meta;localStorage.setItem('seyir_public_data',JSON.stringify(d))")
  page.goto(BASE+'/index.html');page.wait_for_function('() => window.PanoTV && PanoTV.getData()')
  if not legacy:
   assert page.evaluate("JSON.stringify(PanoTV.getData()).includes('SYNTHETIC_RETAIN')")
   page.clock.set_fixed_time(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=7));page.wait_for_timeout(1200)
  for reload in [False,True]:
   if reload: page.reload();page.wait_for_function('() => window.PanoTV && PanoTV.getData()')
   assert not page.evaluate("JSON.stringify(PanoTV.getData()).includes('SYNTHETIC_RETAIN')")
   assert not page.evaluate("localStorage.getItem('seyir_public_data').includes('SYNTHETIC_RETAIN')")
   assert 'SYNTHETIC_RETAIN' not in page.locator('body').inner_text()
  c.close()
 print('Y05: açık panoda süre aşımı, yeniden açılış ve eski kayıt temizliği geçti.',flush=True)
 # Y06: lock contention and explicit handoff; committed A data cannot be overwritten by B.
 c,page,errors,dialogs=setup();other=c.new_page();other.goto(BASE+'/admin.html')
 other.locator('#local-auth-password').fill(PASSWORD);other.locator('#local-auth-submit').click();other.wait_for_timeout(300)
 assert 'başka bir sekmede' in other.locator('#local-auth-message').inner_text()
 page.evaluate("appData.slogan='FIRST_TAB_NEW';saveData()")
 assert other.evaluate("()=>{try{appData.okulAdi='STALE';saveData();return false}catch(e){return true}}")
 assert other.evaluate("JSON.parse(localStorage.getItem('seyir_admin_data')).slogan")=='FIRST_TAB_NEW'
 page.close();other.locator('#local-auth-password').fill(PASSWORD);other.locator('#local-auth-submit').click();other.wait_for_function('() => window.dataReady')
 other.evaluate("appData.okulAdi='SECOND_TAB';saveData()")
 assert other.evaluate("JSON.parse(localStorage.getItem('seyir_admin_data')).slogan")=='FIRST_TAB_NEW'
 c.close();print('Y06: eşzamanlı sekme kilidi, veri koruma ve kilit devri geçti.',flush=True)
 # Y07: delete the first *displayed* sorted row, persist original later row.
 c,page,errors,dialogs=setup()
 page.evaluate("appData.tamamlamaAtamalari={Pazartesi:[{saat:5,sinif:'LATE',dersAdi:'Test'},{saat:1,sinif:'EARLY',dersAdi:'Test'}]};saveData();renderTamamlama('Pazartesi')")
 page.locator('#tamamlama-atananlar-body button').first.evaluate('e=>e.click()')
 assert page.evaluate("JSON.parse(localStorage.getItem('seyir_admin_data')).tamamlamaAtamalari.Pazartesi.map(x=>x.sinif)")==['LATE']
 assert errors==[],errors;c.close();print('Y07: sıralanmış listede doğru atama silindi.',flush=True)
 # Y08: old overlay cannot fire at obsolete hard-coded time, disabled and weekend.
 for active in [False,True]:
  c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort());page=c.new_page()
  page.clock.set_fixed_time(datetime.datetime(2026,10,10,6,0,tzinfo=datetime.timezone.utc));page.goto(BASE+'/index.html');page.wait_for_function('() => window.PanoTV && PanoTV.getData()')
  page.evaluate("active=>{const d=SeyirDataPolicy.emptyTemplate();d.zilYonetimi.aktif=active;d.zilYonetimi.haftasonuSessiz=true;d.zilYonetimi.cizelge=[{saat:'09:00',aktif:true,baslik:'TEST'}];localStorage.setItem('seyir_public_data',JSON.stringify(d));dispatchEvent(new StorageEvent('storage',{key:'seyir_public_data'}))}",active)
  page.wait_for_timeout(1200)
  assert not page.locator('#bell-anons-overlay').evaluate("e=>e.classList.contains('active')")
  assert not page.locator('#seyir-live-bell-banner').is_visible()
  c.close()
 print('Y08: kapalı sistem ve hafta sonu tüm zil bildirimleri sessiz.',flush=True)
 # Y09: outside modal closes, inputs clear, media mutation and pending file operation fail.
 c,page,errors,dialogs=setup()
 page.locator('#btn-edit-teachers').evaluate('e=>e.click()');page.locator('#inp-teachers-pool').fill('SYNTHETIC_PRIVATE')
 old=page.evaluate("localStorage.getItem('seyir_admin_data')")
 page.evaluate("sessionStorage.setItem('seyir_local_session',JSON.stringify({authenticated:true,expiresAt:Date.now()-1}))")
 page.wait_for_timeout(1200)
 assert page.locator('#login-screen').is_visible() and not page.locator('#modal-teachers').is_visible()
 assert page.locator('#inp-teachers-pool').input_value()==''
 assert page.evaluate("async()=>{try{await SeyirAudioStore.saveAudio('expired',new Blob(['x'],{type:'audio/wav'}));return false}catch(e){return !(await SeyirAudioStore.getAudio('expired'))}}")
 assert page.evaluate("localStorage.getItem('seyir_admin_data')")==old
 page.locator('#local-auth-password').fill(PASSWORD);page.locator('#local-auth-submit').click();page.wait_for_function('() => window.dataReady')
 assert page.evaluate("""async()=>{const original=seyirAssertMediaWrite;let calls=0;window.seyirAssertMediaWrite=()=>{if(++calls===2)sessionStorage.setItem('seyir_local_session',JSON.stringify({authenticated:true,expiresAt:Date.now()-1}));original()};try{await SeyirAudioStore.saveAudio('pending',new Blob(['x'],{type:'audio/wav'}));return false}catch(e){return !(await SeyirAudioStore.getAudio('pending'))}finally{window.seyirAssertMediaWrite=original}}""")
 assert errors==[],errors;c.close();print('Y09: dış modal, tekrar giriş ve bekleyen medya işleminde oturum kontrolü geçti.',flush=True)
 # Y10: visit affected UI with real fonts, no brand font request and no missing assets.
 c,page,errors,dialogs=setup();missing=[]
 page.on('response',lambda r:missing.append(r.url) if r.status==404 and ('webfonts' in r.url or '.woff' in r.url) else None)
 for nav in page.locator('.nav-item[data-target]').all():nav.click();page.wait_for_timeout(30)
 page.evaluate('document.fonts.ready');assert page.locator('.fa-brands').count()==0
 assert missing==[],missing;assert errors==[],errors;c.close();print('Y10: ilgili sekmelerde eksik marka fontu isteği yok.',flush=True)
 b.close()
print('Y01–Y10 kabul senaryoları başarılı.')
