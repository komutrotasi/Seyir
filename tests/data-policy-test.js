const assert = require('node:assert/strict');
const policy = require('../js/data-policy.js');
const marker = 'SENTETIK_OZEL_KAYIT';
const output = policy.projectPublic({
    okulAdi: 'Sentetik Okul', tumOgretmenler: [marker],
    yedekGecmisi: [{ veri: { tumOgretmenler: [marker] } }],
    ayarlar: { karuselSuresi: 5000, ozel: marker },
    dersProgramiDetay: { '9/A': { Pazartesi: [{ ders: 'Matematik', ozel: marker }] } },
    mebHaberler: [{ baslik: 'Haber', yedek: marker }],
    zilYonetimi: { cizelge: [{ saat: '08:30', ozel: marker }], gecmis: [marker] }
});
assert.equal(JSON.stringify(output).includes(marker), false);
assert.equal(output.okulAdi, 'Sentetik Okul');
assert.equal(output.dersProgramiDetay['9/A'].Pazartesi[0].ders, 'Matematik');
assert.equal(output.zilYonetimi.cizelge[0].saat, '08:30');
console.log('Açık veri izin listesi: iç içe özel alanlar ve geçmiş temiz.');
assert.throws(() => policy.validate({ duyurular: 42 }), /liste/);
assert.throws(() => policy.validate([]), /nesne/);
assert.throws(() => policy.validate({ otomatikYedek: { saat: '<img>' } }), /saat/);
assert.throws(() => policy.validate({ dersProgramiLise: [{ ders: 'Test', saat: '09:00-08:00' }] }), /aralığı/);
assert.throws(() => policy.validate({ dersProgramiDetay: { '9/A': { Pazartesi: 'bozuk' } } }), /liste/);
assert.throws(() => policy.validate({ _meta: { surum: 999 } }), /sürümü/);
assert.deepEqual(policy.validate({ dersProgramiLise: {} }).dersProgramiLise, []);
assert.equal(policy.validate({ tumOgretmenler: [] }).tumOgretmenler.length, 0);
console.log('JSON tipi, iç içe alanlar, saat aralıkları, sürüm ve boş şablon testleri geçti.');

assert.throws(() => policy.validate({ zilYonetimi: { gecmis: 42 } }), /liste/);
assert.throws(() => policy.validate({ ayarlar: { tickerBaslik: null } }), /metin/);
assert.throws(() => policy.validate({ karuselVideolar: [{youtubeId:'" onload=alert(1)'}] }), /YouTube/);

assert.equal(policy.validate({zilYonetimi:{customAudioOgrenci:null}}).zilYonetimi.customAudioOgrenci,null);
