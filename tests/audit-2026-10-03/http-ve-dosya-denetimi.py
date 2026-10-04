"""Yerel HTTP olumsuz durumları, kaynak envanteri ve anahtar örüntüleri. Uzak hedef taramaz."""
import json,os,re,socket,subprocess,tempfile,time,urllib.request,urllib.error,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];os.chdir(ROOT);out={'http':[]}
with tempfile.TemporaryDirectory(prefix='seyir-audit-http-') as temp:
 with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
 base=f'http://127.0.0.1:{port}'
 with open(Path(temp)/'server.log','w') as log:
  server=subprocess.Popen(['php','-S',f'127.0.0.1:{port}','-t','.', 'tools/dev-router.php'],stdout=log,stderr=log,env={**os.environ,'SEYIR_RATE_LIMIT_DIR':temp})
  try:
   time.sleep(.3)
   cases=[('index','/index.html',None,{},200),('git','/.git/HEAD',None,{},404),('encoded-git','/%2egit/config',None,{},404),('private','/data/example.private.json',None,{},404),('config','/config/nginx-seyir.conf.example',None,{},404),('tools','/tools/dev-router.php',None,{},404),('news-method','/fetch-haberler.php',None,{},405),('news-origin','/fetch-haberler.php',b'url=https://127.0.0.1',{'Origin':'https://other.invalid'},403),('news-ssrf-ip','/fetch-haberler.php',b'url=https://127.0.0.1',{'Origin':base},400),('news-domain-suffix','/fetch-haberler.php',b'url=https://meb.gov.tr.attacker.invalid',{'Origin':base},400),('news-size','/fetch-haberler.php',b'x='+b'a'*9000,{'Origin':base},413),('image-referrer','/fetch-gorsel.php?url=https://127.0.0.1',None,{},403),('image-ssrf','/fetch-gorsel.php?url=https://127.0.0.1',None,{'Referer':base+'/'},400)]
   for name,path,body,headers,expected in cases:
    try:
     r=urllib.request.urlopen(urllib.request.Request(base+path,data=body,headers=headers),timeout=3);status=r.status
    except urllib.error.HTTPError as e:status=e.code
    out['http'].append({'name':name,'status':status,'expected':expected,'passed':status==expected})
   counts=[]
   for i in range(14):
    try:urllib.request.urlopen(urllib.request.Request(base+'/fetch-haberler.php',data=b'url=https://127.0.0.1',headers={'Origin':base}),timeout=3);counts.append(200)
    except urllib.error.HTTPError as e:counts.append(e.code)
   out['rateLimitStatuses']=counts
  finally:server.terminate();server.wait(timeout=5)
files=[f for f in ROOT.rglob('*') if f.is_file() and '.git' not in f.parts and f.suffix in ['.js','.php','.html','.css','.json','.md','.sh','.bat']]
patterns={'aws_access_id':r'AKIA[0-9A-Z]{16}','private_key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----','github_token':r'gh[pousr]_[A-Za-z0-9]{30,}','google_api_key':r'AIza[0-9A-Za-z_-]{35}'}
findings=[];encoding=[]
for f in files:
 raw=f.read_bytes()
 try:text=raw.decode('utf-8')
 except UnicodeDecodeError:encoding.append(str(f.relative_to(ROOT)));continue
 if raw.startswith(b'\xef\xbb\xbf'):encoding.append(str(f.relative_to(ROOT)))
 for kind,pattern in patterns.items():
  for m in re.finditer(pattern,text):findings.append({'file':str(f.relative_to(ROOT)),'line':text.count('\n',0,m.start())+1,'type':kind})
out['scannedTextFiles']=len(files);out['encodingIssues']=encoding;out['secretPatternMatches']=findings
out['scope']='Örüntü taraması sır bulunmadığını kanıtlamaz; genel ağa aktif test yapılmadı.'
Path(__file__).with_name('http-dosya-sonuclari.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
