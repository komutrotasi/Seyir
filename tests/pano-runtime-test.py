import json,shutil,datetime,os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome'),headless=True,args=['--no-sandbox'])
 c=b.new_context(timezone_id='Europe/Istanbul',viewport={'width':1920,'height':1080});c.route('https://**/*',lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.clock.set_fixed_time(datetime.datetime(2026,10,5,6,20,tzinfo=datetime.timezone.utc))
 page.goto(BASE+'/index.html');page.wait_for_function('() => typeof PanoTV!=="undefined" && PanoTV.getData()')
 page.evaluate('''()=>{const d=SeyirDataPolicy.emptyTemplate();d.ayarlar.screensaver.aktif=false;
 d.dersProgramiOrtaokul=[{ders:'1. Ders',saat:'09:00-10:00'}];
 d.dersProgramiLise=[{ders:'1. Ders',saat:'09:00-09:15'},{ders:'2. Ders',saat:'09:20-10:00'}];
 d.dersProgramiDetay={'5/A':{Pazartesi:[{ders:'ORTA_BIR'}]},'9/A':{Pazartesi:[{ders:'LISE_BIR'},{ders:'LISE_IKI'}]}};
 d.zilYonetimi.aktif=true;d.zilYonetimi.cizelge=[{saat:'09:20',baslik:'SENTETIK_ZIL',tur:'ogrenci',aktif:true,sure:1}];
 d.zilYonetimi.torenMuzikleri=[{saat:'09:20',baslik:'SENTETIK_TOREN',audioId:'test',gunler:[1],aktif:true}];
 window.__bell=0;window.__ceremony=0;
 seyirPanoZilEngine.playMelody=()=>window.__bell++;
 SeyirAudioStore.playAudio=async()=>{window.__ceremony++;return {pause(){}}};
 localStorage.setItem('seyir_public_data',JSON.stringify(d));dispatchEvent(new StorageEvent('storage',{key:'seyir_public_data'}));}''')
 page.wait_for_timeout(1600)
 active=page.evaluate('PanoTV.getData().aktifDersler');assert [d['ders'] for d in active]==['ORTA_BIR','LISE_IKI'],active
 assert page.evaluate('window.__bell')==1
 assert page.evaluate('window.__ceremony')==1
 page.wait_for_timeout(1100);assert page.evaluate('window.__bell')==1
 page.clock.set_fixed_time(datetime.datetime(2026,10,6,6,20,tzinfo=datetime.timezone.utc));page.wait_for_timeout(1100)
 assert page.evaluate('window.__bell')==2
 assert page.evaluate('window.__ceremony')==1
 page.clock.set_fixed_time(datetime.datetime(2026,10,10,6,20,tzinfo=datetime.timezone.utc));page.wait_for_timeout(1100)
 assert page.evaluate('window.__bell')==2
 assert errors==[],errors
 for w,h in [(1920,1080),(1366,768),(3840,2160),(1024,768)]:
  page.set_viewport_size({'width':w,'height':h})
  page.wait_for_function(f"""() => {{
    const el = document.getElementById('pano-scale-wrapper');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width <= {w+1} && r.height <= {h+1};
  }}""")
  r=page.locator('#pano-scale-wrapper').bounding_box();assert r['width']<=w+1 and r['height']<=h+1,r
 print('Kademeler, zil/tören tetikleme, tekrar önleme, ertesi gün, hafta sonu ve dört çözünürlük geçti.')
 b.close()
