"""Açık panelde süre dolunca etkileşim ve kayıt engellenir."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 c=b.new_context();c.route('https://**/*',lambda r:r.abort());page=c.new_page()
 page.goto(BASE+'/admin.html');page.locator('#local-auth-password').fill('Session-Test-123!');page.locator('#local-auth-password-repeat').fill('Session-Test-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(400)
 old=page.evaluate("localStorage.getItem('seyir_admin_data')")
 assert page.evaluate("""()=>{sessionStorage.setItem('seyir_local_session',JSON.stringify({authenticated:true,expiresAt:Date.now()-1}));try{appData.slogan='EXPIRED';saveData();return false}catch(e){return true}}""")
 assert page.evaluate("localStorage.getItem('seyir_admin_data')")==old
 assert page.locator('#login-screen').is_visible()
 assert not page.locator('#admin-dashboard').is_visible()
 page.locator('#local-auth-password').fill('Session-Test-123!');page.locator('#local-auth-submit').click();page.wait_for_timeout(400)
 assert page.locator('#admin-dashboard').is_visible()
 page.evaluate("sessionStorage.setItem('seyir_local_session',JSON.stringify({authenticated:true,expiresAt:Date.now()-1}))")
 page.wait_for_timeout(1200)
 assert page.locator('#login-screen').is_visible()
 assert page.evaluate("localStorage.getItem('seyir_admin_data')")==old
 print('Süresi dolan açık oturumda kayıt engeli, otomatik kilit ve tekrar giriş geçti.')
 b.close()
