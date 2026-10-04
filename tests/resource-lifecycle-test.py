"""Durdurulan ses ve kapatılan video önizlemesi blob URL'lerini bırakır."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 c=b.new_context();c.route('https://**/*',lambda r:r.abort());page=c.new_page()
 page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill('Lifecycle-Test-123!');page.locator('#local-auth-password-repeat').fill('Lifecycle-Test-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(400)
 result=page.evaluate("""async()=>{
 const created=new Set(),released=new Set();const make=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
 URL.createObjectURL=blob=>{const url=make(blob);created.add(url);return url};URL.revokeObjectURL=url=>{released.add(url);revoke(url)};
 const RealAudio=window.Audio;
 window.Audio=class extends EventTarget {async play(){} pause(){}};
 await SeyirAudioStore.saveAudio('life-audio',new Blob(['test'],{type:'audio/wav'}));
 for(let i=0;i<10;i++){await SeyirAudioStore.playAudio('life-audio');SeyirAudioStore.stopAll()}
 window.Audio=RealAudio;
 await SeyirAudioStore.saveAudio('life-video',new Blob(['test'],{type:'video/mp4'}));
 appData.karuselVideolar=[{id:'life',tur:'mp4-file',mediaId:'life-video'}];
 for(let i=0;i<10;i++){await onPreviewVideo(0);closeVideoPreview()}
 return {created:created.size,released:released.size};
 }""")
 assert result=={'created':20,'released':20},result
 # İçe aktarmanın dışında bellekteki bozuk kayıt da HTML'e dönüşmemeli.
 page.evaluate("""async()=>{appData.karuselVideolar=[{tur:'youtube',youtubeId:'x\" onload=\"window.__unsafePreview=1'}];await onPreviewVideo(0)}""")
 assert page.locator('#wrap-preview-video-player iframe').get_attribute('onload') is None
 assert page.evaluate('window.__unsafePreview===1') is False
 print('10 ses durdurma + 10 video kapatma: 20/20 blob URL serbest. Video önizlemesi HTML kaçışı geçti.')
 b.close()
