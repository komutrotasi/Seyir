import os,shutil,json,datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18766');out={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome'),args=['--no-sandbox'])
 def setup():
  c=b.new_context(timezone_id='Europe/Istanbul');c.route('https://**/*',lambda r:r.abort());page=c.new_page();page.on('dialog',lambda d:d.accept());page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill('Extra-Audit-123!');page.locator('#local-auth-password-repeat').fill('Extra-Audit-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(400);return c,page
 c,page=setup()
 payload={'sinavlar':[{'ders':'Test','tarih':'05.10.2026','saat':'10:00','dersSaati':'<img src=x onerror="window.__examXss=1">'}]}
 page.locator('#inp-json-file').set_input_files({'name':'exam.json','mimeType':'application/json','buffer':json.dumps(payload).encode()});page.wait_for_timeout(300);page.evaluate('editSinav(0)');page.wait_for_timeout(300)
 out['exam_preview_xss']={'executed':page.evaluate('window.__examXss===1')};c.close()
 c,page=setup()
 out['outside_modals']=page.evaluate("""()=>[...document.querySelectorAll('[id^="modal-"]')].filter(el=>!document.getElementById('admin-dashboard').contains(el)).map(el=>el.id)""")
 page.evaluate("document.getElementById('inp-teachers-pool').value='SYNTHETIC_LOCKED_PERSON';document.getElementById('btn-edit-teachers').click();sessionStorage.setItem('seyir_local_session',JSON.stringify({authenticated:true,expiresAt:Date.now()-1}))")
 page.wait_for_timeout(1200)
 out['expired_open_modal']={'loginVisible':page.locator('#login-screen').is_visible(),'modalVisible':page.locator('#modal-teachers').is_visible(),'nameVisible':page.locator('#inp-teachers-pool').is_visible()};c.close()
 c,page=setup();statuses=[];page.on('response',lambda r:statuses.append({'url':r.url,'status':r.status}) if '/webfonts/' in r.url else None)
 try: page.evaluate("document.fonts.load('16px \\\"Font Awesome 6 Brands\\\"')")
 except Exception as e: out['fontLoadError']=str(e).splitlines()[0]
 page.wait_for_timeout(300);out['fontRequests']=statuses;c.close()
 b.close()
Path(__file__).with_name('ek-sonuclar.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
