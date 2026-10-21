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

const tarihli = { '2026-10-19': ['Sentetik Öğretmen (Bahçe)'], '2026-11-16': [] };
assert.deepEqual(policy.projectPublic({ nobetciTarihli: tarihli }).nobetciTarihli, tarihli);
assert.deepEqual(policy.validate({ nobetciTarihli: tarihli }).nobetciTarihli, tarihli);
assert.throws(() => policy.validate({ nobetciTarihli: { '2026-02-30': [] } }), /tarih/);
assert.throws(() => policy.validate({ nobetciTarihli: { 'Pazartesi': [] } }), /tarih/);
assert.throws(() => policy.validate({ nobetciTarihli: { '2026-10-19': [42] } }), /geçersiz değer/);
assert.deepEqual(policy.clearPersonnel({ nobetciTarihli: tarihli }).nobetciTarihli, {});
console.log('Tarihli nöbet çizelgesi: açık kopya, tarih doğrulaması ve saklama temizliği testleri geçti.');

const kulupler = ['Sentetik Öğretmen : Spor Kulübü'];
assert.equal('ogretmenKulupleri' in policy.projectPublic({ ogretmenKulupleri: kulupler }), false);
assert.deepEqual(policy.validate({ ogretmenKulupleri: kulupler }).ogretmenKulupleri, kulupler);
assert.throws(() => policy.validate({ ogretmenKulupleri: [{ ad: 'x' }] }), /liste/);
assert.deepEqual(policy.clearPersonnel({ ogretmenKulupleri: kulupler }).ogretmenKulupleri, []);
console.log('Öğretmen kulüpleri: yalnızca yönetimde kalma, doğrulama ve saklama temizliği testleri geçti.');
