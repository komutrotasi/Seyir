#!/usr/bin/env node
/* Kaynak deposundan yalnızca yayın için gereken dosyaları yeni bir klasöre kopyalar. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = process.argv[2] && path.resolve(process.argv[2]);
if (!target || target === root || target.startsWith(root + path.sep) || fs.existsSync(target)) {
    console.error('Kullanım: node tools/dagitim-hazirla.js /yeni/bos/yayin-klasoru (depo dışında, mevcut olmayan bir yol)');
    process.exit(1);
}
const files = ['index.html','admin.html','admin.php','sw.js','manifest.json','.htaccess','LICENSE',
    'fetch-haberler.php','fetch-gorsel.php','lib/meb-parser.php','lib/rate-limit.php',
    'img/seyir-icon.svg','img/seyir-icon-192.png','img/seyir-icon-512.png',
    'data/data.json','data/dini_icerik.json','data/meb_haberler.json'];
for (const dir of ['css','js','webfonts']) {
    function scan(rel) {
        for (const name of fs.readdirSync(path.join(root, rel))) {
            if (name.startsWith('.') || /\.private\.json$/i.test(name)) continue;
            const file = path.join(rel, name), stat = fs.lstatSync(path.join(root, file));
            if (stat.isDirectory()) scan(file);
            else if (stat.isFile() && /\.(?:js|css|woff2?|ttf|otf|txt)$/i.test(name)) files.push(file);
        }
    }
    scan(dir);
}
const template = JSON.parse(fs.readFileSync(path.join(root,'data/data.json'),'utf8'));
const policy = require('../js/data-policy.js');
if (JSON.stringify(template) !== JSON.stringify(policy.emptyTemplate())) throw new Error('Dağıtım verisi temiz şablon değil.');
fs.mkdirSync(target,{recursive:true});
for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(target,file)),{recursive:true});
    fs.copyFileSync(path.join(root,file),path.join(target,file));
}
console.log(`${files.length} izin verilen dosya hazırlandı: ${target}`);
