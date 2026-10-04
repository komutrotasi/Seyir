"""Kayıtlı verinin yenilemede korunması ve MEB haberlerinin otomatik tazelenmesi."""
import json,os,shutil
from playwright.sync_api import sync_playwright

BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
PASSWORD='Synthetic-News-123!'

with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 c=b.new_context();page=c.new_page();errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 def haber_yaniti(route):
  requests.append(route.request.post_data or '')
  route.fulfill(status=200,content_type='application/json; charset=utf-8',body=json.dumps({
   'durum':'basarili',
   'haberler':[{'tip':'slider','baslik':'Sentetik Haber Kaydı','gorsel':'fetch-gorsel.php?url=https%3A%2F%2Fornek.meb.k12.tr%2Fresim.jpg','link':'https://ornek.meb.k12.tr/icerikler/haber_1.html'}],
   'istatistik':{'toplam':1,'gorselli':1}
  },ensure_ascii=False))
 page.route('**/fetch-haberler.php',haber_yaniti)
 page.goto(BASE+'/admin.html')
 page.locator('#local-auth-password').fill(PASSWORD);page.locator('#local-auth-password-repeat').fill(PASSWORD)
 page.locator('#local-auth-submit').click();page.wait_for_function('() => window.dataReady && !!window.editorRelease')
 page.evaluate("""()=>{
  appData.okulAdi='Sentetik Test Okulu';
  appData.okulWebSiteUrl='https://ornek.meb.k12.tr/';
  appData.tumOgretmenler=['Sentetik Öğretmen'];
  appData.mebHaberler=[];
  localStorage.removeItem('seyir_news_refresh_v1');
  saveData();
 }""")
 page.reload();page.wait_for_function("() => window.dataReady && appData.mebHaberler.length === 1")
 assert page.evaluate("appData.okulAdi")=='Sentetik Test Okulu'
 assert page.evaluate("appData.tumOgretmenler[0]")=='Sentetik Öğretmen'
 assert page.evaluate("appData.mebHaberler[0].baslik")=='Sentetik Haber Kaydı'
 assert page.evaluate("appData.mebHaberler[0].gorsel.startsWith('fetch-gorsel.php?url=')")
 assert len(requests)==1,requests
 page.reload();page.wait_for_function('() => window.dataReady')
 page.wait_for_timeout(300)
 assert len(requests)==1,requests
 assert page.evaluate("JSON.parse(localStorage.getItem('seyir_admin_data')).okulAdi")=='Sentetik Test Okulu'
 assert errors==[],errors
 c.close();b.close()
print('Kayıt yenilemede korundu; haberler otomatik ve saat sınırlı yenilendi.')
