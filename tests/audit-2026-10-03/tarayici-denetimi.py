"""Bulguları kaydeder; üretim kodunu değiştirmez. Yalnızca izole test profilleri."""
import json,os,shutil,datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18766')
OUT=Path(__file__).parent
results={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 def setup():
  c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort());page=c.new_page();errors=[];dialogs=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:(dialogs.append(d.message),d.accept()))
  page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill('Audit-Synthetic-123!');page.locator('#local-auth-password-repeat').fill('Audit-Synthetic-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(400)
  return c,page,errors,dialogs
 def run(name,fn):
  try: results[name]=fn();print(name,json.dumps(results[name],ensure_ascii=False),flush=True)
  except Exception as e: results[name]={'probe_error':str(e)};print(name,str(e),flush=True)
  (OUT/'sonuclar.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 def xss():
  c,page,errors,dialogs=setup()
  data={'tamamlamaAtamalari':{'Pazartesi':[{'saat':'<img src=x onerror="window.__auditXss=1">','sinif':'9A','dersAdi':'Test','nobetci':'SENTETIK'}]}}
  page.locator('#inp-json-file').set_input_files({'name':'synthetic.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page.wait_for_timeout(500)
  page.evaluate("renderTamamlama('Pazartesi')");page.wait_for_timeout(300)
  out={'script_executed':page.evaluate('window.__auditXss===1'),'persisted':page.evaluate("localStorage.getItem('seyir_admin_data').includes('onerror')"),'dialogs':dialogs,'errors':errors};c.close();return out
 run('tamamlama_stored_xss',xss)
 def program():
  c,page,errors,dialogs=setup()
  out=page.evaluate("""()=>{appData.sinifListesi=['9A'];window.currentProgramSinif='9A';updateProgramCellLesson('9A','Pazartesi',2,'Matematik');const stored=JSON.parse(localStorage.getItem('seyir_admin_data'));let validation;try{SeyirDataPolicy.validate(stored);validation='OK'}catch(e){validation=e.message}return {privateDay:stored.dersProgramiDetay['9A'].Pazartesi,publicDay:JSON.parse(localStorage.getItem('seyir_public_data')).dersProgramiDetay['9A'].Pazartesi,validation}}""")
  page.reload();page.wait_for_timeout(500);out['afterReloadClassCount']=page.evaluate('appData.sinifListesi?.length || 0');out['errors']=errors;c.close();return out
 run('ui_program_roundtrip',program)
 def media():
  c,page,errors,dialogs=setup()
  out=page.evaluate("""async()=>{await SeyirAudioStore.saveAudio('large',new Blob([new Uint8Array(11000000)],{type:'video/mp4'}));appData.karuselVideolar=[{id:'large',tur:'mp4-file',mediaId:'large',dosyaBoyut:11000000}];saveData();let backup;try{await SeyirBackup.create(appData);backup='OK'}catch(e){backup=e.message}let validation;try{SeyirDataPolicy.validate(JSON.parse(localStorage.getItem('seyir_admin_data')));validation='OK'}catch(e){validation=e.message}return {saveSucceeded:true,backup,validation}}""");c.close();return out
 run('large_media_roundtrip',media)
 def retention():
  c,page,errors,dialogs=setup()
  page.evaluate("""()=>{appData.gizlilik.personelAdiGosterim='tam';appData.gizlilik.nobetciGoster=true;appData.gizlilik.saklamaSuresiGun=1;appData.nobetciGunluk={'Pazartesi':['SYNTHETIC_RETAIN (Kat)']};appData.nobetciOgretmenler=['SYNTHETIC_RETAIN (Kat)'];appData.veriYonetimi.sonGozdenGecirme=new Date().toISOString();saveData()}""")
  page.goto(BASE+'/index.html');page.clock.set_fixed_time(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=7));page.reload();page.wait_for_timeout(500)
  out={'publicStillContainsName':page.evaluate("localStorage.getItem('seyir_public_data').includes('SYNTHETIC_RETAIN')"),'panoDataContainsName':page.evaluate("JSON.stringify(PanoTV.getData()).includes('SYNTHETIC_RETAIN')"),'renderedName':page.locator('body').inner_text().find('SYNTHETIC_RETAIN')>=0};c.close();return out
 run('pano_retention',retention)
 def bell():
  c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort());page=c.new_page();page.clock.set_fixed_time(datetime.datetime(2026,10,10,6,0,0,tzinfo=datetime.timezone.utc));page.goto(BASE+'/index.html');page.wait_for_timeout(1500)
  out={'day':'Saturday','configuredActive':page.evaluate('PanoTV.getData().zilYonetimi.aktif'),'overlayActive':page.locator('#bell-anons-overlay').evaluate("e=>e.classList.contains('active')"),'title':page.locator('#bell-anons-title').inner_text()};c.close();return out
 run('disabled_weekend_bell_banner',bell)
 def multitab():
  c,page,errors,dialogs=setup();other=c.new_page();other.goto(BASE+'/admin.html');other.locator('#local-auth-password').fill('Audit-Synthetic-123!');other.locator('#local-auth-submit').click();other.wait_for_timeout(400)
  page.evaluate("appData.slogan='FIRST_TAB_NEW';saveData()");other.wait_for_timeout(200);other.evaluate("appData.okulAdi='SECOND_TAB';saveData()")
  out={'persistedSlogan':other.evaluate("JSON.parse(localStorage.getItem('seyir_admin_data')).slogan"),'expected':'FIRST_TAB_NEW'};c.close();return out
 run('concurrent_admin_lost_update',multitab)
 def deletequota():
  c,page,errors,dialogs=setup()
  out=page.evaluate("""async()=>{
   await SeyirAudioStore.saveAudio('q-video',new Blob(['ORIGINAL_MEDIA'],{type:'video/mp4'}));
   appData.karuselVideolar=[{id:'q1',mediaId:'q-video',tur:'mp4-file',baslik:'Test'}];saveData();
   const original=Storage.prototype.setItem;let fail=true;
   Storage.prototype.setItem=function(k,v){if(k==='seyir_public_data' && fail){fail=false;throw new DOMException('simulated quota','QuotaExceededError')}return original.call(this,k,v)};
   let message;try{await silVideo(0);message='OK'}catch(e){message=e.message}finally{Storage.prototype.setItem=original}
   return {message,referenceRemains:JSON.parse(localStorage.getItem('seyir_admin_data')).karuselVideolar.some(v=>v.mediaId==='q-video'),mediaExists:!!(await SeyirAudioStore.getAudio('q-video'))};
  }""");c.close();return out
 run('delete_media_quota_rollback',deletequota)
 def sorteddelete():
  c,page,errors,dialogs=setup()
  page.evaluate("""()=>{appData.tamamlamaAtamalari={Pazartesi:[{saat:5,sinif:'LATE',dersAdi:'Test'},{saat:1,sinif:'EARLY',dersAdi:'Test'}]};saveData();renderTamamlama('Pazartesi')}""")
  before=page.locator('#tamamlama-atananlar-body tr').all_text_contents()
  page.locator('#tamamlama-atananlar-body button').first.evaluate('el=>el.click()')
  after=page.evaluate("appData.tamamlamaAtamalari.Pazartesi")
  c.close();return {'firstDisplayedRow':before[0].strip(),'remaining':after}
 run('sorted_assignment_delete',sorteddelete)
 def missingfonts():
  c,page,errors,dialogs=setup();statuses=[];page.on('response',lambda r:statuses.append({'url':r.url,'status':r.status}) if '/webfonts/' in r.url else None)
  try: page.evaluate("document.fonts.load('16px \"Font Awesome 6 Brands\"')")
  except Exception: pass
  page.wait_for_timeout(300);c.close();return statuses
 run('brand_fonts',missingfonts)
 b.close()
