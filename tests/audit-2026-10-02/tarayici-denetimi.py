from playwright.sync_api import sync_playwright
import json,pathlib,os,shutil
BASE_URL=os.environ.get('SEYIR_AUDIT_URL','http://127.0.0.1:18765').rstrip('/')
CHROME=os.environ.get('SEYIR_AUDIT_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
if not CHROME: raise SystemExit('Chrome/Chromium bulunamadı; SEYIR_AUDIT_CHROME ayarlayın.')
out={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=CHROME,headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':1000});c.route('https://**/*',lambda r:r.abort())
 page=c.new_page();errors=[];logs=[]
 page.on('pageerror',lambda e:errors.append(e.stack));page.on('console',lambda m:logs.append({'type':m.type,'text':m.text[:300]}) if m.type=='error' else None)
 page.on('dialog',lambda d:d.accept())
 page.goto(BASE_URL+'/admin.html')
 page.locator('#local-auth-password').fill('Audit-Fictional-123!');page.locator('#local-auth-password-repeat').fill('Audit-Fictional-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(800)
 baseline=page.evaluate('JSON.parse(JSON.stringify(appData))')
 out['tabs']=[]
 for tab in page.locator('.nav-item[data-target]').all():
  name=tab.get_attribute('data-target');before=len(errors);tab.click();page.wait_for_timeout(150)
  out['tabs'].append({'tab':name,'visible':page.locator('#'+name).is_visible(),'errors':errors[before:]})
 out['privacy_projection']=page.evaluate('''()=>{const data={tumOgretmenler:['SENTETIK_KISI_001'],yedekGecmisi:[{veri:{tumOgretmenler:['SENTETIK_KISI_001'],sinifRehberlik:{'9/A':'SENTETIK_KISI_001'}}}],gizlilik:{personelAdiGosterim:'gizli'}};const output=panoIcinAcikVeriOlustur(data,true);return {topLevelRemoved:!output.tumOgretmenler,privateMarkerPresent:JSON.stringify(output).includes('SENTETIK_KISI_001'),meta:output._meta};}''')
 # Import a harmless proof of script execution through the actual file input.
 xss=json.loads(json.dumps(baseline));xss['otomatikYedek']={'aktif':True,'saat':'<img src="x" onerror="window.__seyirAuditXss=1">'}
 page.locator('#inp-json-file').set_input_files({'name':'synthetic-audit.json','mimeType':'application/json','buffer':json.dumps(xss).encode()});page.wait_for_timeout(800)
 out['import_xss']=page.evaluate('({executed:window.__seyirAuditXss===1,persisted:localStorage.getItem("seyir_admin_data").includes("__seyirAuditXss")})')
 xss2=json.loads(json.dumps(baseline));xss2['sinifListesi']=["9/A');window.__seyirAuditClass=1;//"]
 page.locator('#inp-json-file').set_input_files({'name':'synthetic-class.json','mimeType':'application/json','buffer':json.dumps(xss2).encode()});page.wait_for_timeout(600)
 page.locator('.nav-item[data-target="tab-sinav"]').click();page.wait_for_timeout(200)
 chips=page.locator('#hizli-sinif-cipleri .btn-sinif-chip');out['class_chips']=chips.count()
 if chips.count(): chips.last.click(force=True)
 out['class_xss']=page.evaluate('window.__seyirAuditClass===1')
 out['clear_all']=page.evaluate('''async()=>{await SeyirAudioStore.saveAudio('audit_synthetic_blob',new Blob(['synthetic'],{type:'audio/wav'}));const cache=await caches.open('seyir-audit-synthetic');await cache.put('/synthetic-audit-cache',new Response('synthetic'));SeyirLocalAuth.clearAll();return {localKeys:Object.keys(localStorage),audioSurvives:!!(await SeyirAudioStore.getAudio('audit_synthetic_blob')),cacheSurvives:!!(await caches.match('/synthetic-audit-cache'))};}''')
 # Save failure injected only for the second write, without touching project files.
 out['non_atomic_save']=page.evaluate('''()=>{localStorage.setItem('seyir_public_data',JSON.stringify({okulAdi:'SYNTHETIC_OLD'}));appData={okulAdi:'SYNTHETIC_NEW'};const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='seyir_public_data')throw new DOMException('audit quota','QuotaExceededError');return original.call(this,k,v)};let error;try{saveData()}catch(e){error=e.name}finally{Storage.prototype.setItem=original}return {error,privateValue:JSON.parse(localStorage.getItem('seyir_admin_data')).okulAdi,publicValue:JSON.parse(localStorage.getItem('seyir_public_data')).okulAdi};}''')
 # Test loading wrong-shaped JSON through the real import path.
 bad={'okulAdi':'SYNTHETIC_INVALID_IMPORT','duyurular':42,'tumOgretmenler':['SENTETIK_KISI_001']}
 page.locator('#inp-json-file').set_input_files({'name':'synthetic-invalid.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});page.wait_for_timeout(600)
 out['bad_import']=page.evaluate('({savedSchool:JSON.parse(localStorage.getItem("seyir_admin_data")).okulAdi,savedAnnouncements:JSON.parse(localStorage.getItem("seyir_admin_data")).duyurular,toasts:document.body.innerText.includes("JSON verileri başarıyla")})')
 out['errors']=errors;out['error_logs']=logs
 c.close()
 # Clean profile and service worker first-install, browser HTTP cache explicitly disabled.
 c=b.new_context(viewport={'width':1920,'height':1080});c.route('https://**/*',lambda r:r.abort());page=c.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(e.stack))
 cd=c.new_cdp_session(page);cd.send('Network.enable');cd.send('Network.setCacheDisabled',{'cacheDisabled':True})
 page.goto(BASE_URL+'/index.html');page.wait_for_timeout(1800)
 await_ready=page.evaluate('async()=>{await navigator.serviceWorker.ready;return !!navigator.serviceWorker.controller}')
 out['pano_runtime_errors']=errors.copy()
 out['scale_checks']=[]
 for w,h in [(1920,1080),(1366,768),(3840,2160),(1024,768)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(600)
  out['scale_checks'].append({'viewport':[w,h],'rect':page.locator('#pano-scale-wrapper').evaluate('(e)=>e.getBoundingClientRect().toJSON()')})
 out['sw_precache']=page.evaluate('async()=>({versionedMain:!!(await caches.match(document.querySelector("script[src*=\\"seyir.js\\"]").src)),plainMain:!!(await caches.match("./js/seyir.js"))})')
 c.set_offline(True);page.reload(wait_until='load');page.wait_for_timeout(400)
 out['offline_clean']={'mainLoaded':page.evaluate('typeof PanoTV'), 'cssLoaded':page.evaluate('[...document.styleSheets].some(s=>(s.href||"").includes("seyir.css"))')}
 b.close()
pathlib.Path(os.environ.get('SEYIR_AUDIT_OUTPUT','/tmp/seyir-deep-results.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False,indent=2))
