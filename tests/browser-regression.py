"""Yalnızca yerel test sunucusu ve geçici tarayıcı profilleri kullanılır."""
import json,os,sys,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SEYIR_TEST_URL','http://127.0.0.1:18765')
STAGE=int(sys.argv[1]) if len(sys.argv)>1 else 2
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    c=b.new_context(viewport={'width':1920,'height':1080})
    c.route('https://**/*',lambda r:r.abort())
    page=c.new_page();errors=[];dialogs=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:(dialogs.append(d.message),d.accept()))
    page.goto(BASE+'/admin.html')
    page.locator('#local-auth-password').fill('Sentetik-Test-123!')
    page.locator('#local-auth-password-repeat').fill('Sentetik-Test-123!')
    page.locator('#local-auth-submit').click();page.wait_for_timeout(500)
    assert page.locator('#admin-dashboard').is_visible()
    assert page.evaluate('appData.tumOgretmenler.length')==0
    old=page.evaluate('localStorage.getItem("seyir_admin_data")')
    page.locator('#inp-json-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':json.dumps({'okulAdi':'BOZUK','duyurular':42}).encode()})
    page.wait_for_timeout(200)
    assert page.evaluate('localStorage.getItem("seyir_admin_data")')==old
    assert any('duyurular' in d for d in dialogs)
    valid=page.evaluate('JSON.parse(JSON.stringify(appData))')
    valid['sinifListesi']=["9/A');window.__testXss=1;//"]
    page.locator('#inp-json-file').set_input_files({'name':'classes.json','mimeType':'application/json','buffer':json.dumps(valid).encode()});page.wait_for_timeout(300)
    page.locator('[data-target="tab-sinav"]').click()
    page.locator('#hizli-sinif-cipleri [data-sinif-sec]').click(force=True)
    assert page.evaluate('window.__testXss===1') is False
    assert page.evaluate("JSON.stringify(panoIcinAcikVeriOlustur({yedekGecmisi:[{veri:{tumOgretmenler:['PRIVATE_MARKER']}}]},true)).includes('PRIVATE_MARKER')") is False
    page.reload();page.wait_for_timeout(400)
    assert page.evaluate('appData.tumOgretmenler.length')==0
    print('Aşama 1–2: XSS, özel veri çıkışı, hatalı import, boş kadro ve tekrar açılış geçti.')
    if STAGE>=3:
        for nav in page.locator('.nav-item[data-target]').all():
            nav.click();page.wait_for_timeout(50)
        assert errors==[],errors
        page.goto(BASE+'/index.html');page.wait_for_timeout(1500)
        assert errors==[],errors
        print('Aşama 3: bütün panel sekmeleri ve pano zamanlayıcısı hatasız.')
    b.close()
