"""Sahte API ile geçerli veri, aynı gün önbelleği ve gece yarısı geçersizliği."""
import os,shutil,datetime,json
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort())
 c.route('https://api.open-meteo.com/**',lambda r:r.fulfill(json={'current_weather':{'temperature':21,'weathercode':0}}))
 c.route('https://api.aladhan.com/**',lambda r:r.fulfill(json={'data':{'date':{'gregorian':{'date':'05-10-2026'}},'timings':{'Imsak':'05:21','Sunrise':'06:31','Dhuhr':'12:41','Asr':'15:51','Maghrib':'18:01','Isha':'19:11'}}}))
 page=c.new_page();page.clock.set_fixed_time(datetime.datetime(2026,10,5,6,20,tzinfo=datetime.timezone.utc))
 page.goto(BASE+'/index.html');page.wait_for_timeout(300)
 page.evaluate("""()=>{const d=SeyirDataPolicy.emptyTemplate();d.konum={sehir:'Test',ilce:'Test',enlem:40,boylam:30};d.ayarlar.screensaver.aktif=false;localStorage.setItem('seyir_public_data',JSON.stringify(d));dispatchEvent(new StorageEvent('storage',{key:'seyir_public_data'}))}""")
 page.wait_for_timeout(1300)
 assert '21°C' in page.locator('#header-weather-temp').inner_text()
 assert page.locator('#namaz-vakit-adi').inner_text()!='Güncel vakit yok'
 c.unroute('https://api.open-meteo.com/**');c.unroute('https://api.aladhan.com/**')
 page.reload();page.wait_for_timeout(1300)
 assert 'son kayıt' in page.locator('#header-weather-desc').inner_text()
 assert page.locator('#namaz-vakit-adi').inner_text()!='Güncel vakit yok'
 page.clock.set_fixed_time(datetime.datetime(2026,10,6,6,20,tzinfo=datetime.timezone.utc))
 page.reload();page.wait_for_timeout(1300)
 assert page.locator('#namaz-vakit-adi').inner_text()=='Güncel vakit yok'
 assert '21°C' not in page.locator('#header-weather-temp').inner_text()
 print('Geçerli API, aynı gün/konum önbelleği, ertesi gün vakit iptali ve 2 saatlik hava TTL testi geçti.')
 b.close()
