#!/usr/bin/env python3
"""Depoyu değiştirmeyen bütünleşik kontroller; izole profil ve loopback sunucusu."""
from pathlib import Path
import importlib.util,os,sys,subprocess,socket,time,tempfile,urllib.request
ROOT=Path(__file__).resolve().parent.parent
os.chdir(ROOT)
if importlib.util.find_spec('playwright') is None:
 print('Eksik test bağımlılığı: python3 -m pip install -r requirements-dev.txt',file=sys.stderr)
 sys.exit(2)
commands=[['node','tools/encoding-kontrol.js'],['node','tools/guvenlik-kontrol.js'],['node','tools/surum-guncelle.js','--kontrol'],['node','tests/data-policy-test.js'],['node','tests/local-auth-test.js']]
commands += [['node','--check',str(f)] for f in [*Path('js').glob('*.js'),*Path('tools').glob('*.js'),Path('sw.js')]]
commands += [['php','-l',str(f)] for f in Path('.').rglob('*.php') if '.git' not in f.parts]
commands += [['php','tests/meb-parser-test.php']]
for command in commands:
 print('Kontrol:', ' '.join(command),flush=True);subprocess.run(command,check=True)
with socket.socket() as s:
 s.bind(('127.0.0.1',0));port=s.getsockname()[1]
base=f'http://127.0.0.1:{port}'
with tempfile.TemporaryFile() as log:
 server=subprocess.Popen(['php','-S',f'127.0.0.1:{port}','-t','.', 'tools/dev-router.php'],stdout=log,stderr=log)
 try:
  for attempt in range(50):
   try:
    urllib.request.urlopen(base+'/index.html',timeout=1);break
   except OSError:time.sleep(.1)
  for route in ['/.git/HEAD','/README.md','/tests/data-policy-test.js','/data/test.private.json','/%2e%2e/.git/HEAD','/tools/dev-router.php']:
   try: urllib.request.urlopen(base+route);raise AssertionError('Dosya açığa çıktı: '+route)
   except urllib.error.HTTPError as e: assert e.code==404,(route,e.code)
  for route in ['/fetch-haberler.php','/fetch-gorsel.php']:
   try: urllib.request.urlopen(base+route);raise AssertionError('Geçersiz aracı isteği kabul edildi: '+route)
   except urllib.error.HTTPError as e: assert e.code in [400,403,405],(route,e.code)
  env={**os.environ,'SEYIR_TEST_URL':base}
  for file,args in [('browser-regression.py',['3']),('pano-runtime-test.py',[]),('offline-freshness-test.py',[]),('storage-backup-test.py',[]),('auto-backup-test.py',[]),('session-test.py',[]),('resource-lifecycle-test.py',[]),('api-freshness-test.py',[]),('remediation-2026-10-04-test.py',[]),('news-persistence-test.py',[])]:
   print('Tarayıcı:',file,flush=True);subprocess.run([sys.executable,'tests/'+file,*args],env=env,check=True)
 finally:
  server.terminate();server.wait(timeout=5)
print('Bütün otomatik kontroller geçti. Gerçek cihaz/ses ve uzun süreli saha kabulü ayrıca gereklidir.')
