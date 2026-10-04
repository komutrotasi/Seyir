from playwright.sync_api import sync_playwright
import json,pathlib,os,shutil,datetime
BASE_URL=os.environ.get('SEYIR_AUDIT_URL','http://127.0.0.1:18765').rstrip('/')
CHROME=os.environ.get('SEYIR_AUDIT_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
if not CHROME: raise SystemExit('Chrome/Chromium bulunamadı; SEYIR_AUDIT_CHROME ayarlayın.')
out={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=CHROME,headless=True,args=['--no-sandbox'])
 c=b.new_context();c.route('https://**/*',lambda r:r.abort());page=c.new_page();page.on('dialog',lambda d:d.accept())
 page.goto(BASE_URL+'/admin.html');page.locator('#local-auth-password').fill('Audit-Fictional-123!');page.locator('#local-auth-password-repeat').fill('Audit-Fictional-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(700)
 base=page.evaluate('JSON.parse(JSON.stringify(appData))');base['dersHavuzuOrtaokul']=[];base['dersHavuzuLise']=[]
 # These are valid app data fields; prevent an unrelated missing-default error from masking the import vulnerability.
 base['otomatikYedek']={'aktif':True,'saat':'<img src="x" onerror="window.__seyirAuditAuto=1">'}
 page.locator('#inp-json-file').set_input_files({'name':'synthetic-auto.json','mimeType':'application/json','buffer':json.dumps(base).encode()});page.wait_for_timeout(700)
 out['automatic_import_xss']=page.evaluate('window.__seyirAuditAuto===1')
 page.clock.set_fixed_time(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=3))
 out['expired_session']=page.evaluate('({authenticated:SeyirLocalAuth.isAuthenticated(),dashboardVisible:getComputedStyle(document.querySelector("#admin-dashboard")).display!=="none"})')
 page.locator('.nav-item[data-target="tab-genel"]').click();page.locator('#inp-okulAdi').fill('SENTETIK_OTURUM_SURESI')
 page.locator('#btn-save-json').click();page.wait_for_timeout(250)
 out['expired_session']['savedAfterExpiry']=page.evaluate('JSON.parse(localStorage.getItem("seyir_admin_data")).okulAdi==="SENTETIK_OTURUM_SURESI"')
 page.evaluate('''async()=>{await SeyirAudioStore.saveAudio('audit_backup_blob',new Blob(['SYNTHETIC_MEDIA_CONTENT'],{type:'video/mp4'}));appData.karuselVideolar=[{tur:'mp4-file',mediaId:'audit_backup_blob',baslik:'SENTETIK_VIDEO',aktif:true}];saveData()}''')
 with page.expect_download() as di:page.locator('.btn-download-private-json').first.dispatch_event('click')
 backup=json.loads(pathlib.Path(di.value.path()).read_text())
 out['backup_media']={'containsReference':backup['karuselVideolar'][0]['mediaId']=='audit_backup_blob','containsMediaContent':'SYNTHETIC_MEDIA_CONTENT' in json.dumps(backup)}
 # Retention helper should remove history too if it promises removal of expired personnel.
 out['retention_history']=page.evaluate('''()=>{const d={tumOgretmenler:['SENTETIK_KISI_001'],yedekGecmisi:[{veri:{tumOgretmenler:['SENTETIK_KISI_001']}}]};kisiselAlanlariTemizle(d);return {topLevelEmpty:d.tumOgretmenler.length===0,historyStillContainsMarker:JSON.stringify(d).includes('SENTETIK_KISI_001')}}''')
 out['retention_reset_on_unrelated_save']=page.evaluate('''()=>{appData.veriYonetimi={sonGozdenGecirme:'2000-01-01T00:00:00Z'};saveData();return appData.veriYonetimi.sonGozdenGecirme!=='2000-01-01T00:00:00Z'}''')
 b.close()
pathlib.Path(os.environ.get('SEYIR_AUDIT_OUTPUT','/tmp/seyir-extra-results.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
