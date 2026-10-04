"""Kaçırılan günlük yedeğin telafisini ve klasör kolunun kalıcılığını doğrular."""
import datetime,os,shutil
from playwright.sync_api import sync_playwright

BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
PASSWORD='Synthetic-Backup-123!'

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 context=browser.new_context(accept_downloads=True)
 page=context.new_page();errors=[];bad_responses=[];favicon_requests=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.on('response',lambda response:bad_responses.append((response.status,response.url)) if response.status>=400 else None)
 page.on('request',lambda request:favicon_requests.append(request.url) if request.url.endswith('/favicon.ico') else None)
 page.goto(BASE+'/admin.html')
 page.locator('#local-auth-password').fill(PASSWORD)
 page.locator('#local-auth-password-repeat').fill(PASSWORD)
 page.locator('#local-auth-submit').click()
 page.wait_for_function('() => window.dataReady && !!window.editorRelease')

 # Gelecekteki saat seçildiğinde en son planlı çalışma dündür; yeniden açılış bunu telafi etmelidir.
 future=(datetime.datetime.now()+datetime.timedelta(hours=1)).strftime('%H:%M')
 page.evaluate("""future=>{
  appData.otomatikYedek={aktif:true,saat:future,hedefTur:'dahili',klasorAdi:'',sonYedekTarihi:'',sonYedekZamani:''};
  appData.yedekGecmisi=[];
  saveData();
 }""",future)
 page.reload();page.wait_for_function("() => window.dataReady && appData.yedekGecmisi.length === 1")
 assert page.evaluate("appData.yedekGecmisi[0].tur")=='Otomatik'
 first_date=page.evaluate("appData.otomatikYedek.sonYedekTarihi")
 page.reload();page.wait_for_function('() => window.dataReady')
 page.wait_for_timeout(500)
 assert page.evaluate("appData.yedekGecmisi.length")==1
 assert page.evaluate("appData.otomatikYedek.sonYedekTarihi")==first_date

 # FileSystemDirectoryHandle yapılandırma IndexedDB'sinde yenilemeden sonra da okunabilmelidir.
 stored_name=page.evaluate("""async()=>{
  const handle=await navigator.storage.getDirectory();
  await window.SeyirBackupHandleStore.save(handle);
  return handle.name;
 }""")
 page.reload();page.wait_for_function('() => window.dataReady')
 restored_name=page.evaluate("async()=> (await window.SeyirBackupHandleStore.get()).name")
 assert restored_name==stored_name
 assert errors==[],errors
 assert bad_responses==[],bad_responses
 assert favicon_requests==[],favicon_requests
 context.close();browser.close()

print('Kaçırılan günlük yedek telafi edildi; tekrar oluşturulmadı ve klasör kolu kalıcı.')
