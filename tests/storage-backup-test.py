"""Medya paketinin yeni profile taşınması, bozuk yedek, kota, saklama ve tam silme."""
import os,shutil,json
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 def setup():
  c=b.new_context();c.route('https://**/*',lambda r:r.abort());page=c.new_page();page.on('dialog',lambda d:d.accept())
  page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill('Test-Storage-123!');page.locator('#local-auth-password-repeat').fill('Test-Storage-123!');page.locator('#local-auth-submit').click();page.wait_for_function("() => localStorage.getItem('seyir_admin_data') !== null")
  return c,page
 c,page=setup()
 bundle=page.evaluate("""async()=>{
 await SeyirAudioStore.saveAudio('test_audio',new Blob(['SYNTHETIC_AUDIO'],{type:'audio/wav'}),'test.wav');
 await SeyirAudioStore.saveAudio('test_video',new Blob(['SYNTHETIC_VIDEO'],{type:'video/mp4'}),'test.mp4');
 appData.karuselVideolar=[{id:'v1',tur:'mp4-file',mediaId:'test_video',baslik:'Test',aktif:false}];
 appData.zilYonetimi.torenMuzikleri=[{id:'a1',audioId:'test_audio',baslik:'Test',saat:'09:00',gunler:[1],aktif:false}];
 saveData(); return await SeyirBackup.create(appData);
 }""")
 assert len(bundle['medya'])==2
 c2,page2=setup()
 def upload(data):
  page2.locator('#inp-json-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page2.wait_for_timeout(500)
 upload(bundle)
 assert page2.evaluate("SeyirAudioStore.getAudio('test_video').then(r=>r.blob.text())")=='SYNTHETIC_VIDEO'
 assert page2.evaluate("SeyirAudioStore.getAudio('test_audio').then(r=>r.blob.text())")=='SYNTHETIC_AUDIO'
 old=page2.evaluate("localStorage.getItem('seyir_admin_data')")
 bundle['medya'][0]['sha256']='0'*64;upload(bundle)
 assert page2.evaluate("localStorage.getItem('seyir_admin_data')")==old
 quota=page2.evaluate("""()=>{
 const privateOld=localStorage.getItem('seyir_admin_data'),publicOld=localStorage.getItem('seyir_public_data');
 const original=Storage.prototype.setItem;let fail=true;
 Storage.prototype.setItem=function(k,v){if(k==='seyir_public_data' && fail){fail=false;throw new DOMException('test quota','QuotaExceededError')}return original.call(this,k,v)};
 let rejected=false;try{appData.okulAdi='SHOULD_NOT_SAVE';saveData()}catch(e){rejected=true}finally{Storage.prototype.setItem=original}
 return rejected && privateOld===localStorage.getItem('seyir_admin_data') && publicOld===localStorage.getItem('seyir_public_data') && appData.okulAdi!=='SHOULD_NOT_SAVE';
 }""");assert quota
 retention=page2.evaluate("""()=>{
 const since=new Date(Date.now()-86400000).toISOString();appData.veriYonetimi.sonGozdenGecirme=since;saveData();appData.slogan='Unrelated';saveData();
 const unchanged=appData.veriYonetimi.sonGozdenGecirme===since;
 appData.tumOgretmenler=['SYNTHETIC_PRIVATE'];appData.yedekGecmisi=[{veri:{tumOgretmenler:['SYNTHETIC_PRIVATE']}}];
 appData.veriYonetimi.sonGozdenGecirme='2000-01-01T00:00:00.000Z';saveData();
 return unchanged && appData.tumOgretmenler.length===0 && appData.yedekGecmisi.length===0 && !localStorage.getItem('seyir_public_data').includes('SYNTHETIC_PRIVATE');
 }""");assert retention
 page2.evaluate("caches.open('foreign-cache').then(c=>c.put('/foreign',new Response('keep')))")
 page2.evaluate('SeyirLocalAuth.clearAll()')
 assert page2.evaluate('SeyirAudioStore.listAll().then(a=>a.length)')==0
 assert page2.evaluate("localStorage.getItem('seyir_admin_data')") is None
 assert page2.evaluate("caches.has('foreign-cache')")
 print('Ses/video yeni profile taşındı; hash, kota geri alma, sabit saklama tarihi, geçmiş temizliği ve tam silme geçti.')
 b.close()
