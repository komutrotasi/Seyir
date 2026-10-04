"""İlk kurulum çevrimdışı kabuğu, önbellek sınırı ve yanlış gün/konum koruması."""
import os,shutil,json
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 c=b.new_context(timezone_id='Europe/Istanbul'); c.route('https://**/*',lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/index.html');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_timeout(300)
 page.evaluate("caches.open('unrelated-app-test').then(c=>c.put('/unrelated-test',new Response('keep')))")
 page.evaluate("""async () => { for(let i=0;i<80;i++) await fetch('data/data.json?t='+i); }""")
 page.evaluate("""async()=>{for(let i=0;i<70;i++) await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src='img/seyir-icon-192.png?test='+i})}""")
 sizes=page.evaluate("""async()=>Object.fromEntries(await Promise.all((await caches.keys()).map(async k=>[k,(await (await caches.open(k)).keys()).length])))""")
 assert sizes['unrelated-app-test']==1
 assert all(n<=64 for k,n in sizes.items() if 'runtime' in k),sizes
 awaiter=page.context.new_cdp_session(page);awaiter.send('Network.enable');awaiter.send('Network.setCacheDisabled',{'cacheDisabled':True})
 c.set_offline(True)
 for path in ['/admin.html','/index.html']:
  page.goto(BASE+path);page.wait_for_timeout(300)
  assert page.evaluate("typeof SeyirDataPolicy")=='object'
  assert page.evaluate("document.styleSheets.length")>=2
 page.evaluate("""() => {
 const data=SeyirDataPolicy.emptyTemplate();data.konum={sehir:'Test',ilce:'Test',enlem:40,boylam:30};
 localStorage.setItem('seyir_public_data',JSON.stringify(data));
 localStorage.setItem('seyir_cached_weather_v1',JSON.stringify({temp:99,desc:'ESKI',key:'wrong',ts:Date.now()}));
 localStorage.setItem('seyir_cached_namaz_v1',JSON.stringify({gun:'yesterday',vakitler:Array.from({length:6},()=>({name:'ESKI',time:'01:23'}))}));
 }""")
 page.reload();page.wait_for_timeout(500)
 assert '99' not in page.locator('#header-weather-temp').inner_text()
 assert page.locator('#namaz-vakit-adi').inner_text()=='Güncel vakit yok'
 assert errors==[],errors
 print('HTTP önbelleği kapalı ilk çevrimdışı açılış, sınırlı önbellek, yabancı önbellek ve eski konum/gün testleri geçti.',sizes)
 b.close()
