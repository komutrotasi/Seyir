
// Fallback for BhUI if not defined in Seyir admin panel
if (typeof window.BhUI === 'undefined') {
    window.BhUI = {
        toast: function (msg, type) {
            // A simple implementation of toast since bh-ui.js is missing
            console.log('[' + type + ']', msg);

            let toastContainer = document.getElementById('bhui-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'bhui-toast-container';
                toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
                document.body.appendChild(toastContainer);
            }

            const toast = document.createElement('div');
            const bgColor = type === 'success' ? '#10b981' : type === 'error' || type === 'danger' ? '#ef4444' : '#3b82f6';
            toast.style.cssText = `background: ${bgColor}; color: white; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; font-size: 14px; opacity: 0; transform: translateY(20px); transition: all 0.3s ease;`;
            toast.textContent = msg;

            toastContainer.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            }, 10);

            // Animate out
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };
}

// Global toggle for menu help guides ("Nasıl Kullanılır?")
function toggleHelpGuide(btn) {
    if (!btn) return;
    const container = btn.closest('.tab-guide-container');
    if (!container) return;
    const card = container.querySelector('.tab-guide-card');
    const arrow = btn.querySelector('.guide-arrow');
    if (!card) return;
    if (card.style.display === 'none' || !card.style.display) {
        card.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        card.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}
window.toggleHelpGuide = toggleHelpGuide;

// --- TEMA BAŞLATICI (AGENTS.md Kural 4.1 — Varsayılan: Light Mode) ---
// NOT: HTML'de data-theme="light" zaten tanımlı. localStorage'da önceki tercih
// varsa onu uygularız; yoksa light kalır (fabrika varsayılanı: light).
(function initAdminTheme() {
    const savedTheme = localStorage.getItem('seyir_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    // 'light' veya kayıt yoksa HTML'deki data-theme="light" geçerlidir.
    // Tema butonunu mevcut duruma göre güncelle
    document.addEventListener('DOMContentLoaded', () => {
        const themeBtn = document.getElementById('btn-theme-toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        if (themeBtn) {
            themeBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    });
})();

// --- PREMIUM HEADER & SIDEBAR ACTIONS (AGENTS.md Rule 6) ---
function toggleAdminFullscreen() {
    const icon = document.getElementById('icon-fullscreen');
    const btn = document.getElementById('btn-fullscreen-toggle');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            if (icon) icon.className = 'fa-solid fa-compress';
            if (btn) btn.title = 'Tam Ekrandan Çık';
        }).catch(err => {
            if (typeof BhUI !== 'undefined') BhUI.toast("Tam ekran moduna geçilemedi: " + err.message, "warning");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                if (icon) icon.className = 'fa-solid fa-expand';
                if (btn) btn.title = 'Tam Ekran';
            }).catch(() => {});
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('icon-fullscreen');
    const btn = document.getElementById('btn-fullscreen-toggle');
    if (document.fullscreenElement) {
        if (icon) icon.className = 'fa-solid fa-compress';
        if (btn) btn.title = 'Tam Ekrandan Çık';
    } else {
        if (icon) icon.className = 'fa-solid fa-expand';
        if (btn) btn.title = 'Tam Ekran';
    }
});
function toggleAdminTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('seyir_theme', newTheme);

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
        themeBtn.title = newTheme === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç';
    }
    if (typeof BhUI !== 'undefined') {
        BhUI.toast(`Tema ${newTheme === 'light' ? 'Açık Mod' : 'Koyu Mod'} olarak güncellendi.`, 'success');
    }
}

function toggleAdminSidebarMobile() {
    const sidebar = document.getElementById('admin-sidebar');
    const icon = document.getElementById('admin-hamburger-icon');
    if (!sidebar) return;
    sidebar.classList.toggle('mobile-open');
    if (icon) {
        if (sidebar.classList.contains('mobile-open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    }
}

function renderNotificationsDropdown() {
    const list = document.getElementById('notif-dropdown-list');
    if (!list) return;

    const items = [];

    // 1. Zil Durumu
    const zilData = appData.zilYonetimi || {};
    if (zilData.aktif !== false) {
        items.push({
            icon: '🔔',
            title: 'Okul Zili Sistemi Aktif',
            desc: (zilData.cizelge && zilData.cizelge.length > 0)
                ? `${zilData.cizelge.length} adet zil tanımlı, zamanı gelince otomatik çalacak.`
                : 'Zil motoru hazır. Henüz ders zili eşlenmedi.',
            time: 'Canlı Servis'
        });
    } else {
        items.push({
            icon: '🔕',
            title: 'Okul Zili Sistemi Kapalı',
            desc: 'Zil Yönetimi menüsünden zilleri aktif edebilirsiniz.',
            time: 'Pasif'
        });
    }

    // 2. Yedekleme
    const yedek = appData.otomatikYedek || {};
    if (yedek && yedek.aktif) {
        items.push({
            icon: '💾',
            title: 'Otomatik Yedekleme Devrede',
            desc: `Her gün saat ${yedek.saat || '17:00'}'de veri tabanı otomatik indirilecek.`,
            time: 'Aktif Zamanlayıcı'
        });
    } else {
        items.push({
            icon: '📁',
            title: 'Yedekleme Hatırlatması',
            desc: 'Veri Yönetimi menüsünden otomatik günlük yedeklemeyi açabilirsiniz.',
            time: 'Öneri'
        });
    }

    // 3. Kayan Yazılar
    const kayan = Array.isArray(appData.kayanYazi) ? appData.kayanYazi : [];
    items.push({
        icon: '🏃‍♂️',
        title: 'Pano Kayan Duyuruları',
        desc: `${kayan.length} adet kayan yazı akıllı pano ekranında yayında.`,
        time: 'Canlı Pano'
    });

    // 4. Sistem Durumu
    items.push({
        icon: '🛡️',
        title: 'Sistem Durumu Normal',
        desc: 'Cihaz-yerel parola kilidi ve çevrimdışı motorlar sorunsuz çalışıyor.',
        time: 'Çevrimdışı Mod'
    });

    let html = '';
    items.forEach(it => {
        html += `
            <div class="notif-item">
                <div class="notif-item-icon">${it.icon}</div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${escapeHtml(it.title)}</div>
                    <div class="notif-item-desc">${escapeHtml(it.desc)}</div>
                    <div class="notif-item-time">${escapeHtml(it.time)}</div>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function toggleNotificationsMenu(btn) {
    const dropdown = document.getElementById('dropdown-notifications');
    if (!dropdown) return;

    const isOpen = dropdown.style.display === 'block';
    if (isOpen) {
        dropdown.style.display = 'none';
    } else {
        renderNotificationsDropdown();
        dropdown.style.display = 'block';
    }
}

function clearNotificationBadge() {
    const dot = document.getElementById('header-notif-dot');
    if (dot) dot.style.display = 'none';
    const dropdown = document.getElementById('dropdown-notifications');
    if (dropdown) dropdown.style.display = 'none';
    if (typeof BhUI !== 'undefined') BhUI.toast('Bildirimler okundu olarak işaretlendi.', 'info');
}

function openQuickSettings() {
    const genelNav = document.querySelector('.nav-item[data-target="tab-genel"]');
    if (genelNav) {
        genelNav.click();
        const mainContent = document.querySelector('.content-scrollable');
        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof BhUI !== 'undefined') {
            BhUI.toast('⚙️ Genel Ayarlar sekmesine yönlendirildiniz.', 'info');
        }
    }
}

// Dışarı tıklandığında bildirim açılır panelini kapat
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.notif-dropdown-wrapper');
    const dropdown = document.getElementById('dropdown-notifications');
    if (dropdown && dropdown.style.display === 'block' && wrapper && !wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

window.toggleAdminFullscreen = toggleAdminFullscreen;
window.toggleAdminTheme = toggleAdminTheme;
window.toggleAdminSidebarMobile = toggleAdminSidebarMobile;
window.toggleNotificationsMenu = toggleNotificationsMenu;
window.clearNotificationBadge = clearNotificationBadge;
window.openQuickSettings = openQuickSettings;
window.showSettingsToast = openQuickSettings;

// --- XSS KORUMASI (AGENTS.md Seyir Kural 4.2) ---
/** Kullanıcı girdisini HTML gövdesine güvenle basmak için kaçış uygular. */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * onclick="fn('...')" gibi satır içi olay niteliklerine değer gömerken kullanılır.
 * Önce JS string kaçışı, sonra HTML kaçışı uygulanır. Böylece hem XSS engellenir hem de
 * içinde kesme işareti bulunan değerler (örn. "Kur'an-ı Kerim") butonları bozmaz.
 */
function escapeJsAttr(str) {
    if (str === null || str === undefined) return '';
    const jsSafe = String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
    return escapeHtml(jsSafe);
}

const SEYIR_MAX_EXCEL_BYTES = 10 * 1024 * 1024;

/**
 * Kullanıcı tarafından seçilen çalışma kitaplarını sınırlı ve pasif içerik
 * seçenekleriyle ayrıştırır. Tüm Excel içe aktarma akışları bu kapıdan geçer.
 */
function guvenliExcelOku(data) {
    const byteLength = data && Number(data.byteLength);
    if (!Number.isFinite(byteLength) || byteLength <= 0) {
        throw new Error('Excel dosyası boş veya okunamıyor.');
    }
    if (byteLength > SEYIR_MAX_EXCEL_BYTES) {
        throw new Error('Excel dosyası 10 MB sınırını aşıyor.');
    }
    if (typeof XLSX === 'undefined' || typeof XLSX.read !== 'function') {
        throw new Error('Excel kütüphanesi yüklenmedi.');
    }
    return XLSX.read(data, {
        type: 'array',
        cellFormula: false,
        cellHTML: false,
        cellStyles: false,
        bookVBA: false,
        WTF: false
    });
}

function guvenliIceAktarmaNesnesi(deger, derinlik = 0) {
    if (derinlik > 40) throw new Error('JSON iç içe veri sınırını aşıyor.');
    if (deger === null || typeof deger !== 'object') return deger;
    if (Array.isArray(deger)) {
        if (deger.length > 50000) throw new Error('JSON dizi sınırını aşıyor.');
        return deger.map(item => guvenliIceAktarmaNesnesi(item, derinlik + 1));
    }

    const temiz = Object.create(null);
    for (const [anahtar, altDeger] of Object.entries(deger)) {
        if (anahtar === '__proto__' || anahtar === 'prototype' || anahtar === 'constructor') continue;
        temiz[anahtar] = guvenliIceAktarmaNesnesi(altDeger, derinlik + 1);
    }
    return temiz;
}

function yedekGecmisiniKucult(veri) {
    if (!veri || !Array.isArray(veri.yedekGecmisi)) return false;
    let degisti = veri.yedekGecmisi.length > 15;
    veri.yedekGecmisi = veri.yedekGecmisi.slice(0, 15).map(item => {
        if (!item || typeof item !== 'object') {
            degisti = true;
            return null;
        }
        const kayit = Object.assign({}, item);
        if (kayit.veri && typeof kayit.veri === 'object' && kayit.veri.yedekGecmisi) {
            kayit.veri = Object.assign({}, kayit.veri);
            delete kayit.veri.yedekGecmisi;
            degisti = true;
        }
        return kayit;
    }).filter(Boolean);
    return degisti;
}

window.escapeHtml = escapeHtml;
window.escapeJsAttr = escapeJsAttr;

// Her okulun hesabı ve verileri yalnızca o bilgisayarın tarayıcı profilinde tutulur.
const SEYIR_LOCAL_AUTH = window.SeyirLocalAuth;
const SEYIR_PRIVATE_STORAGE_KEY = 'seyir_admin_data';
const SEYIR_PUBLIC_STORAGE_KEY = 'seyir_public_data';
let appData = {};

const BASLANGIC_HABER_GORSELLERI = [
    { anahtar: '17671892', yol: 'img/cache-haber/1f7b850ded319eae7fd316971f12edbf.jpg' },
    { anahtar: '17651353', yol: 'img/cache-haber/aa37a2d7e85bc9260d6b90520044e1a9.jpg' },
    { anahtar: '17641455', yol: 'img/cache-haber/5838e94d73f6e588e7c5e20c37312ef9.jpg' },
    { anahtar: '17630148', yol: 'img/cache-haber/14203116_whatsappimage20250710at22.31.50.jpg' },
    { anahtar: '17627027', yol: 'img/cache-haber/dc47059d84dc535622c58a4fee7da05b.jpg' }
];

function baslangicHaberGorselleriniDuzelt(haberler) {
    let degisti = false;
    (Array.isArray(haberler) ? haberler : []).forEach(haber => {
        const aramaMetni = String(haber.link || '') + ' ' + String(haber.gorsel || '');
        const yerel = BASLANGIC_HABER_GORSELLERI.find(kayit => aramaMetni.includes(kayit.anahtar));
        if (yerel && haber.gorsel !== yerel.yol) {
            haber.gorsel = yerel.yol;
            degisti = true;
        }
    });
    return degisti;
}

function varsayilanGizlilikAyarlari() {
    return {
        personelAdiGosterim: 'gorev',
        nobetciGoster: true,
        rehberOgretmenGoster: false,
        dersOgretmeniGoster: false,
        saklamaSuresiGun: 365
    };
}

function gizlilikAyarlari(veri) {
    return Object.assign(varsayilanGizlilikAyarlari(), (veri && veri.gizlilik) || {});
}

function basHarfliAd(ad) {
    return String(ad || '').trim().split(/\s+/u).filter(Boolean).map(parca => {
        const ilk = Array.from(parca)[0] || '';
        return ilk ? ilk.toLocaleUpperCase('tr-TR') + '.' : '';
    }).join(' ');
}

function kisiAdiniBicimle(ad, mod, gorev) {
    const temiz = String(ad || '').trim();
    if (!temiz || mod === 'gizli') return '';
    if (mod === 'gorev') return gorev || 'Öğretmen';
    if (mod === 'basHarf') return basHarfliAd(temiz);
    return temiz;
}

function nobetKaydiniBicimle(kayit, mod, sira) {
    const metin = String(kayit || '').trim();
    const eslesme = metin.match(/^(.*?)\s*\(([^()]*)\)\s*$/u);
    const ad = eslesme ? eslesme[1] : metin;
    const yer = eslesme ? eslesme[2] : '';
    const gorunen = kisiAdiniBicimle(ad, mod, 'Nöbetçi Öğretmen ' + (sira + 1));
    return gorunen ? gorunen + (yer ? ` (${yer})` : '') : '';
}

function kisiselAlanlariTemizle(veri) {
    if (!veri || typeof veri !== 'object') return veri;
    veri.tumOgretmenler = [];
    veri.ogretmenler = [];
    veri.ogretmenBranslar = [];
    veri.nobetciOgretmenler = [];
    veri.nobetciGunluk = {};
    veri.sinifRehberlik = {};
    veri.sinifDersOgretmen = {};
    veri.tamamlamaAtamalari = {};

    Object.values(veri.dersProgramiDetay || {}).forEach(gunler => {
        Object.values(gunler || {}).forEach(dersler => {
            (Array.isArray(dersler) ? dersler : []).forEach(ders => {
                if (ders && typeof ders === 'object') {
                    delete ders.hoca;
                    delete ders.ogretmen;
                }
            });
        });
    });
    return veri;
}

function panoIcinAcikVeriOlustur(kaynak, dosyayaAktar = false) {
    const acik = JSON.parse(JSON.stringify(kaynak || {}));
    const gizlilik = gizlilikAyarlari(acik);
    // data.json hiçbir zaman tam personel adı içermez; yerel pano için okulun
    // açık seçimi geçerli olabilir, dosya aktarımında en fazla baş harf kullanılır.
    const mod = dosyayaAktar && gizlilik.personelAdiGosterim === 'tam'
        ? 'basHarf'
        : gizlilik.personelAdiGosterim;

    delete acik.tumOgretmenler;
    delete acik.ogretmenler;
    delete acik.ogretmenBranslar;
    delete acik.sinifDersOgretmen;
    delete acik.bransListesi;
    delete acik.veriYonetimi;

    if (!gizlilik.nobetciGoster) {
        acik.nobetciOgretmenler = [];
        acik.nobetciGunluk = {};
    } else {
        acik.nobetciOgretmenler = (Array.isArray(acik.nobetciOgretmenler) ? acik.nobetciOgretmenler : [])
            .map((kayit, i) => nobetKaydiniBicimle(kayit, mod, i)).filter(Boolean);
        Object.keys(acik.nobetciGunluk || {}).forEach(gun => {
            acik.nobetciGunluk[gun] = (Array.isArray(acik.nobetciGunluk[gun]) ? acik.nobetciGunluk[gun] : [])
                .map((kayit, i) => nobetKaydiniBicimle(kayit, mod, i)).filter(Boolean);
        });
    }

    if (!gizlilik.rehberOgretmenGoster) {
        acik.sinifRehberlik = {};
    } else {
        Object.keys(acik.sinifRehberlik || {}).forEach(sinif => {
            acik.sinifRehberlik[sinif] = kisiAdiniBicimle(acik.sinifRehberlik[sinif], mod, 'Rehber Öğretmen');
        });
    }

    Object.values(acik.dersProgramiDetay || {}).forEach(gunler => {
        Object.values(gunler || {}).forEach(dersler => {
            (Array.isArray(dersler) ? dersler : []).forEach(ders => {
                if (!ders || typeof ders !== 'object') return;
                if (!gizlilik.dersOgretmeniGoster) {
                    delete ders.hoca;
                    delete ders.ogretmen;
                } else {
                    if (ders.hoca) ders.hoca = kisiAdiniBicimle(ders.hoca, mod, 'Ders Öğretmeni');
                    if (ders.ogretmen) ders.ogretmen = kisiAdiniBicimle(ders.ogretmen, mod, 'Ders Öğretmeni');
                }
            });
        });
    });

    Object.keys(acik.tamamlamaAtamalari || {}).forEach(gun => {
        acik.tamamlamaAtamalari[gun] = (Array.isArray(acik.tamamlamaAtamalari[gun]) ? acik.tamamlamaAtamalari[gun] : [])
            .map(atama => {
                const sonuc = Object.assign({}, atama);
                delete sonuc.izinli;
                sonuc.nobetci = gizlilik.dersOgretmeniGoster
                    ? kisiAdiniBicimle(sonuc.nobetci, mod, 'Ders Tamamlama Öğretmeni')
                    : '';
                return sonuc;
            });
    });

    acik.gizlilik = gizlilik;
    acik._meta = {
        tur: 'seyir-public',
        surum: 1,
        anonimlestirilmis: mod !== 'tam',
        olusturmaZamani: new Date().toISOString()
    };
    return acik;
}

function acikPanoVerisiniYayinla() {
    localStorage.setItem(SEYIR_PUBLIC_STORAGE_KEY, JSON.stringify(panoIcinAcikVeriOlustur(appData, false)));
}

function saveData() {
    if (!appData.veriYonetimi) appData.veriYonetimi = {};
    appData.veriYonetimi.sonGozdenGecirme = new Date().toISOString();
    localStorage.setItem(SEYIR_PRIVATE_STORAGE_KEY, JSON.stringify(appData));
    acikPanoVerisiniYayinla();
    if (typeof window.updateVeriKPIs === 'function') window.updateVeriKPIs();
}

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const authForm = document.getElementById('local-auth-form');
    const authTitle = document.getElementById('local-auth-title');
    const authSubtitle = document.getElementById('local-auth-subtitle');
    const passwordInput = document.getElementById('local-auth-password');
    const repeatInput = document.getElementById('local-auth-password-repeat');
    const repeatWrapper = document.getElementById('local-auth-repeat-wrapper');
    const authSubmit = document.getElementById('local-auth-submit');
    const authMessage = document.getElementById('local-auth-message');
    const authReset = document.getElementById('local-auth-reset');

    function updateLoginMode() {
        const configured = SEYIR_LOCAL_AUTH && SEYIR_LOCAL_AUTH.isConfigured();
        authTitle.textContent = configured ? 'Güvenli Giriş' : 'İlk Kullanım';
        authSubtitle.textContent = configured
            ? 'Bu cihazdaki Seyir yönetim paneline parolanızla giriş yapın.'
            : 'Bu okul bilgisayarı için bir yönetici parolası belirleyin.';
        repeatWrapper.style.display = configured ? 'none' : 'block';
        repeatInput.required = !configured;
        passwordInput.autocomplete = configured ? 'current-password' : 'new-password';
        authSubmit.querySelector('span').textContent = configured ? 'Giriş Yap' : 'Parola Oluştur ve Başla';
        const eskiVeriVar = SEYIR_LOCAL_AUTH && SEYIR_LOCAL_AUTH.hasLocalData();
        authReset.style.display = configured || eskiVeriVar ? 'block' : 'none';
        authReset.textContent = configured
            ? 'Parolayı unuttum / bu cihazı sıfırla'
            : 'Bu cihazdaki eski Seyir verilerini temizle';
    }

    function openDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        passwordInput.value = '';
        repeatInput.value = '';
        loadData();
    }

    updateLoginMode();
    if (SEYIR_LOCAL_AUTH && SEYIR_LOCAL_AUTH.isAuthenticated()) openDashboard();

    authForm.addEventListener('submit', async event => {
        event.preventDefault();
        authMessage.textContent = '';
        authSubmit.disabled = true;
        try {
            if (!SEYIR_LOCAL_AUTH) throw new Error('Yerel giriş bileşeni yüklenemedi. Sayfayı yenileyin.');
            if (!SEYIR_LOCAL_AUTH.isConfigured()) {
                if (passwordInput.value !== repeatInput.value) throw new Error('Parolalar eşleşmiyor.');
                await SEYIR_LOCAL_AUTH.createPassword(passwordInput.value);
                openDashboard();
                BhUI.toast('Bu cihaz için yönetici parolası oluşturuldu.', 'success');
            } else {
                await SEYIR_LOCAL_AUTH.login(passwordInput.value);
                openDashboard();
            }
        } catch (error) {
            authMessage.textContent = error.message || 'Giriş işlemi tamamlanamadı.';
            const card = document.getElementById('login-card');
            card.classList.remove('shake-card');
            void card.offsetWidth;
            card.classList.add('shake-card');
        } finally {
            authSubmit.disabled = false;
        }
    });

    document.querySelectorAll('[data-password-target]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordTarget);
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            const icon = button.querySelector('i');
            if (icon) icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        });
    });

    authReset.addEventListener('click', () => {
        if (!confirm('Bu işlem parolayla birlikte bu bilgisayardaki TÜM okul verilerini kalıcı olarak silecek. Devam edilsin mi?')) return;
        if (!confirm('Son onay: Okul ayarları, logo, programlar ve parola silinecek.')) return;
        SEYIR_LOCAL_AUTH.clearAll();
        window.location.reload();
    });

    const passwordChangeButton = document.getElementById('btn-local-password-change');
    if (passwordChangeButton) {
        passwordChangeButton.addEventListener('click', async () => {
            const current = document.getElementById('local-current-password');
            const next = document.getElementById('local-new-password');
            const repeat = document.getElementById('local-new-password-repeat');
            if (next.value !== repeat.value) {
                BhUI.toast('Yeni parolalar eşleşmiyor.', 'error');
                return;
            }
            passwordChangeButton.disabled = true;
            try {
                await SEYIR_LOCAL_AUTH.changePassword(current.value, next.value);
                current.value = '';
                next.value = '';
                repeat.value = '';
                BhUI.toast('Yönetici parolası bu cihazda değiştirildi.', 'success');
            } catch (error) {
                BhUI.toast(error.message || 'Parola değiştirilemedi.', 'error');
            } finally {
                passwordChangeButton.disabled = false;
            }
        });
    }

    // Yalnızca bu sekmedeki yerel yönetim oturumunu kapat.
    window.logoutAdmin = function () {
        if (SEYIR_LOCAL_AUTH) SEYIR_LOCAL_AUTH.logout();
        window.location.href = 'index.html';
    };

    // Admin Mobil Hamburger Menü Logic
    const adminMobileToggle = document.getElementById('admin-mobile-toggle');
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminHamburgerIcon = document.getElementById('admin-hamburger-icon');

    if (adminMobileToggle && adminSidebar) {
        adminMobileToggle.addEventListener('click', () => {
            const isOpen = adminSidebar.classList.toggle('mobile-open');
            if (adminHamburgerIcon) {
                adminHamburgerIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });
    }

    // ─── Kayan Yazı Olay Bağlayıcıları (Madde 2.4 & Gelişmiş Ticker) ───
    const btnAddKayan = document.getElementById('btn-add-kayan');
    const btnCancelKayan = document.getElementById('btn-cancel-kayan');
    const inpKayanYeni = document.getElementById('inp-kayan-yeni');
    const taKayan = document.getElementById('inp-kayan');
    const btnClearKayanInput = document.getElementById('btn-clear-kayan-input');
    const inpKayanTxtFile = document.getElementById('inp-kayan-txt-file');
    const btnSimPlayPause = document.getElementById('btn-sim-play-pause');
    const chkTickerActive = document.getElementById('chk-ticker-active');
    const inpTickerBaslik = document.getElementById('inp-ticker-baslik');

    if (btnAddKayan) btnAddKayan.addEventListener('click', kaydetKayanYazi);
    if (btnCancelKayan) btnCancelKayan.addEventListener('click', iptalKayanDuzenleme);
    if (inpKayanYeni) {
        inpKayanYeni.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); kaydetKayanYazi(); }
        });
        inpKayanYeni.addEventListener('input', updateKayanCharCount);
    }
    if (btnClearKayanInput) {
        btnClearKayanInput.addEventListener('click', () => {
            if (inpKayanYeni) {
                inpKayanYeni.value = '';
                inpKayanYeni.focus();
                updateKayanCharCount();
            }
        });
    }

    // Simülatör Oynat / Duraklat
    if (btnSimPlayPause) {
        btnSimPlayPause.addEventListener('click', () => {
            const simText = document.getElementById('sim-ticker-text');
            if (!simText) return;
            const isPaused = simText.classList.toggle('paused');
            btnSimPlayPause.innerHTML = isPaused
                ? '<i class="fa-solid fa-play"></i> <span>Oynat</span>'
                : '<i class="fa-solid fa-pause"></i> <span>Duraklat</span>';
        });
    }

    // Şerit Gösterim Durumu Switch
    if (chkTickerActive) {
        chkTickerActive.addEventListener('change', (e) => {
            if (!appData.ayarlar) appData.ayarlar = {};
            appData.ayarlar.tickerDurum = e.target.checked;
            saveData();
            updateKayanKPIs();
            syncKayanSimulator();
            BhUI.toast(e.target.checked ? 'Kayan yazı şeridi panoda aktif edildi.' : 'Kayan yazı şeridi panodan gizlendi.', 'info');
        });
    }

    // Şerit Başlığı Canlı Giriş
    if (inpTickerBaslik) {
        inpTickerBaslik.addEventListener('input', (e) => {
            if (!appData.ayarlar) appData.ayarlar = {};
            appData.ayarlar.tickerBaslik = e.target.value.trim() || 'DUYURULAR';
            const simLabel = document.getElementById('sim-label-text');
            if (simLabel) simLabel.textContent = appData.ayarlar.tickerBaslik;
        });
        inpTickerBaslik.addEventListener('change', () => saveData());
    }

    // TXT Dosyasından İçe Aktarma
    if (inpKayanTxtFile) {
        inpKayanTxtFile.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target.result;
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    if (lines.length === 0) {
                        BhUI.toast('Seçilen dosyada geçerli metin satırı bulunamadı.', 'warning');
                        return;
                    }
                    if (!appData.kayanYazi) appData.kayanYazi = [];
                    appData.kayanYazi.push(...lines);
                    kayanDegisti();
                    BhUI.toast(`${lines.length} adet kayan yazı TXT dosyasından içe aktarıldı.`, 'success');
                } catch (err) {
                    BhUI.toast('Dosya okuma hatası: ' + err.message, 'error');
                }
                inpKayanTxtFile.value = '';
            };
            reader.readAsText(file, 'UTF-8');
        });
    }

    // Toplu düzenleme alanı → liste (çift yönlü senkron)
    if (taKayan) {
        taKayan.addEventListener('input', () => {
            appData.kayanYazi = taKayan.value.split('\n').map(x => x.trim()).filter(x => x);
            iptalKayanDuzenleme();
            renderKayanYazilar();
        });
        // Alandan çıkıldığında kalıcılaştır
        taKayan.addEventListener('change', () => saveData());
    }

    // ─── Akıllı İl ve İlçe Seçici (SeyirKonum 81 İl ve 972 İlçe Desteği) ───
    const inpSehirEl = document.getElementById('inp-sehir');
    const inpIlceEl = document.getElementById('inp-ilce');
    const ilceDatalist = document.getElementById('ilce-listesi');

    function ilceDatalistGuncelle(sehirAdi) {
        if (!ilceDatalist || typeof SeyirKonum === 'undefined') return;
        ilceDatalist.innerHTML = '';
        const ilceler = SeyirKonum.ilceListesi(sehirAdi);
        ilceler.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.ad;
            ilceDatalist.appendChild(opt);
        });
    }

    if (inpSehirEl) {
        const sehirDegisti = () => {
            const girilen = inpSehirEl.value.trim();
            if (girilen && typeof SeyirKonum !== 'undefined') {
                const eslesen = SeyirKonum.bulSehir(girilen);
                if (eslesen) {
                    inpSehirEl.value = eslesen.ad;
                    ilceDatalistGuncelle(eslesen.ad);

                    // Eğer ilçe seçilmişse ve yeni şehre aitse koru, değilse temizle
                    const ilceGirilen = inpIlceEl ? inpIlceEl.value.trim() : '';
                    const ilceEslesen = ilceGirilen ? SeyirKonum.bulIlce(eslesen.ad, ilceGirilen) : null;
                    if (inpIlceEl) {
                        inpIlceEl.value = ilceEslesen ? ilceEslesen.ad : '';
                    }

                    const hedefKonum = ilceEslesen ? SeyirKonum.koordinatGetir(eslesen.ad, ilceEslesen.ad) : SeyirKonum.koordinatGetir(eslesen.ad);
                    if (hedefKonum) {
                        const enlemEl = document.getElementById('inp-enlem');
                        const boylamEl = document.getElementById('inp-boylam');
                        if (enlemEl) enlemEl.value = hedefKonum.enlem;
                        if (boylamEl) boylamEl.value = hedefKonum.boylam;
                        const baslik = hedefKonum.ilce ? `${hedefKonum.sehir} / ${hedefKonum.ilce}` : hedefKonum.sehir;
                        if (typeof BhUI !== 'undefined' && BhUI.toast) {
                            BhUI.toast(`📍 Konum eşlendi: ${baslik} (${hedefKonum.enlem}, ${hedefKonum.boylam})`, 'info');
                        }
                    }
                }
            }
        };
        inpSehirEl.addEventListener('change', sehirDegisti);
        inpSehirEl.addEventListener('input', () => {
            const girilen = inpSehirEl.value.trim();
            if (girilen && typeof SeyirKonum !== 'undefined') {
                const tamEslesen = SeyirKonum.SEHIRLER.find(s => s.ad.toLowerCase() === girilen.toLowerCase() || String(s.plaka) === girilen);
                if (tamEslesen) sehirDegisti();
            }
        });
    }

    if (inpIlceEl) {
        const ilceDegisti = () => {
            const sehirGirilen = inpSehirEl ? inpSehirEl.value.trim() : '';
            const ilceGirilen = inpIlceEl.value.trim();
            if (sehirGirilen && ilceGirilen && typeof SeyirKonum !== 'undefined') {
                const koordinat = SeyirKonum.koordinatGetir(sehirGirilen, ilceGirilen);
                if (koordinat && koordinat.ilce) {
                    inpIlceEl.value = koordinat.ilce;
                    const enlemEl = document.getElementById('inp-enlem');
                    const boylamEl = document.getElementById('inp-boylam');
                    if (enlemEl) enlemEl.value = koordinat.enlem;
                    if (boylamEl) boylamEl.value = koordinat.boylam;
                    if (typeof BhUI !== 'undefined' && BhUI.toast) {
                        BhUI.toast(`📍 İlçe koordinatları tanımlandı: ${koordinat.sehir} / ${koordinat.ilce} (${koordinat.enlem}, ${koordinat.boylam})`, 'info');
                    }
                }
            }
        };
        inpIlceEl.addEventListener('change', ilceDegisti);
        inpIlceEl.addEventListener('input', () => {
            const sehirGirilen = inpSehirEl ? inpSehirEl.value.trim() : '';
            const ilceGirilen = inpIlceEl.value.trim();
            if (sehirGirilen && ilceGirilen && typeof SeyirKonum !== 'undefined') {
                const sehir = SeyirKonum.bulSehir(sehirGirilen);
                if (sehir && sehir.ilceler) {
                    const tamEslesen = sehir.ilceler.find(d => d.ad.toLowerCase() === ilceGirilen.toLowerCase());
                    if (tamEslesen) ilceDegisti();
                }
            }
        });
    }

    // Tabs Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') === 'index.html') return;
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(t => t.classList.remove('active'));

            item.classList.add('active');
            const target = item.getAttribute('data-target');
            if (target && document.getElementById(target)) {
                document.getElementById(target).classList.add('active');
            }

            if (target === 'tab-program') {
                if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
                if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
                if (typeof updateProgramStats === 'function') updateProgramStats();
                if (typeof renderHavuzTags === 'function') renderHavuzTags();
            } else if (target === 'tab-veri') {
                if (typeof updateVeriKPIs === 'function') updateVeriKPIs();
                if (typeof syncAutoBackupFormUI === 'function') syncAutoBackupFormUI();
                if (typeof renderBackupHistory === 'function') renderBackupHistory();
            } else if (target === 'tab-kayan') {
                if (typeof renderKayanYazilar === 'function') renderKayanYazilar();
                if (typeof updateKayanKPIs === 'function') updateKayanKPIs();
                if (typeof syncKayanSimulator === 'function') syncKayanSimulator();
            } else if (target === 'tab-zil') {
                if (typeof renderZilUI === 'function') renderZilUI();
            } else if (target === 'tab-medya') {
                if (typeof renderKaruselVideoUI === 'function') renderKaruselVideoUI();
            }

            // Update Topbar Title
            document.getElementById('active-tab-title').textContent = item.textContent.trim();

            // Mobilde sekme seçilince menüyü kapat
            if (adminSidebar) {
                adminSidebar.classList.remove('mobile-open');
                if (adminHamburgerIcon) adminHamburgerIcon.className = 'fa-solid fa-bars';
            }
        });
    });

    // Load Data
    function getBosSablon() {
        return {
            okulAdi: "Mahmud Celaleddin Ökten",
            okulTuru: "Anadolu İmam Hatip Lisesi",
            okulLogo: "img/okul_logo.png",
            daktiloYazilari: ["Medya Okulu"],
            mebHaberler: [],
            okulWebSiteUrl: "https://konyamcosihl.meb.k12.tr/",
            konum: { sehir: "Konya", ilce: "Karatay", enlem: 37.8874, boylam: 32.5334 },
            ayarlar: { karuselSuresi: 5000, temaOtomatik: true, tickerDurum: true, tickerBaslik: "⚡ DUYURULAR", tickerHiz: "normal", tickerAyrac: "⚡" },
            gizlilik: varsayilanGizlilikAyarlari(),
            veriYonetimi: { sonGozdenGecirme: new Date().toISOString() },
            duyurular: [],
            sinavlar: [],
            kayanYazi: [],
            tumOgretmenler: [],
            ogretmenBranslar: [],
            dersProgrami: {},
            nobetciOgretmenler: {},
            nobetciGunluk: {},
            otomatikYedek: {
                aktif: false,
                saat: "17:00",
                hedefTur: "indir",
                klasorAdi: "",
                sonYedekTarihi: "",
                sonYedekZamani: ""
            },
            yedekGecmisi: [],
            zilYonetimi: {
                aktif: true,
                melodiOgrenci: "modern",
                melodiOgretmen: "chime",
                melodiCikis: "westminster",
                sesSeviyesi: 80,
                calmaSuresi: 8,
                haftasonuSessiz: true,
                sesliAnons: false,
                cizelge: [
                    { id: "zil_1", saat: "08:28", tur: "ogretmen", baslik: "1. Ders Öğretmen Zili", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_2", saat: "08:30", tur: "ogrenci", baslik: "1. Ders Giriş Zili", melodi: "varsayilan", sure: 8, aktif: true, anons: "1. ders başlamıştır. İyi dersler dileriz." },
                    { id: "zil_3", saat: "09:10", tur: "cikis", baslik: "1. Ders Çıkış / Teneffüs", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_4", saat: "09:18", tur: "ogretmen", baslik: "2. Ders Öğretmen Zili", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_5", saat: "09:20", tur: "ogrenci", baslik: "2. Ders Giriş Zili", melodi: "varsayilan", sure: 8, aktif: true, anons: "2. ders başlamıştır." },
                    { id: "zil_6", saat: "10:00", tur: "cikis", baslik: "2. Ders Çıkış / Teneffüs", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_7", saat: "10:08", tur: "ogretmen", baslik: "3. Ders Öğretmen Zili", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_8", saat: "10:10", tur: "ogrenci", baslik: "3. Ders Giriş Zili", melodi: "varsayilan", sure: 8, aktif: true, anons: "" },
                    { id: "zil_9", saat: "10:50", tur: "cikis", baslik: "3. Ders Çıkış / Teneffüs", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_10", saat: "10:58", tur: "ogretmen", baslik: "4. Ders Öğretmen Zili", melodi: "varsayilan", sure: 6, aktif: true, anons: "" },
                    { id: "zil_11", saat: "11:00", tur: "ogrenci", baslik: "4. Ders Giriş Zili", melodi: "varsayilan", sure: 8, aktif: true, anons: "" },
                    { id: "zil_12", saat: "11:40", tur: "cikis", baslik: "4. Ders Çıkış / Öğle Arası", melodi: "varsayilan", sure: 7, aktif: true, anons: "Öğle arası başlamıştır. Afiyet olsun." }
                ],
                gecmis: []
            },
            karuselVideolar: []
        };
    }

    async function baslangicVerisiniOku() {
        try {
            const res = await fetch('data/data.json?t=' + new Date().getTime());
            if (!res.ok) return null;
            const veri = await res.json();
            return veri && typeof veri === 'object' ? veri : null;
        } catch (e) {
            console.info('data/data.json okunamadı, yerel şablon kullanılıyor:', e.message);
            return null;
        }
    }

    /**
     * Verileri yükler.
     * @param {boolean} dosyadanTohumla localStorage boşken data/data.json içeriğiyle
     *        başlangıç verisini doldur. Panonun (index.html) okuduğu dosya ile
     *        admin panelinin aynı içeriği göstermesini sağlar.
     *        "Verileri Sıfırla" akışında false verilir (gerçekten boş duruma dönmek için).
     */
    async function loadData(dosyadanTohumla = true) {
        try {
            const dosyaVerisi = dosyadanTohumla ? await baslangicVerisiniOku() : null;
            const local = localStorage.getItem(SEYIR_PRIVATE_STORAGE_KEY);
            let kimlikMigrasyonu = false;
            if (local) {
                appData = JSON.parse(local);
                const bosEskiKimlik = (!appData.okulAdi || appData.okulAdi === 'Seyir Dijital Pano') &&
                    !String(appData.okulWebSiteUrl || '').trim() &&
                    !String(appData.okulLogo || '').trim() &&
                    (!Array.isArray(appData.mebHaberler) || appData.mebHaberler.length === 0);
                if (bosEskiKimlik && dosyaVerisi) {
                    const yerelKopya = Object.assign({}, appData);
                    ['okulAdi', 'okulLogo', 'slogan', 'daktiloYazilari', 'okulWebSiteUrl', 'mebHaberler', 'konum']
                        .forEach(alan => delete yerelKopya[alan]);
                    appData = Object.assign(getBosSablon(), dosyaVerisi, yerelKopya);
                    kimlikMigrasyonu = true;
                } else if (dosyaVerisi && String(appData.okulWebSiteUrl || '').replace(/\/+$/, '') === 'https://konyamcosihl.meb.k12.tr') {
                    if (!Array.isArray(appData.mebHaberler) || appData.mebHaberler.length === 0) {
                        appData.mebHaberler = dosyaVerisi.mebHaberler || [];
                        kimlikMigrasyonu = true;
                    }
                    if (!String(appData.okulLogo || '').trim()) {
                        appData.okulLogo = dosyaVerisi.okulLogo || 'img/okul_logo.png';
                        kimlikMigrasyonu = true;
                    }
                }
            } else {
                appData = Object.assign(getBosSablon(), dosyaVerisi || {});
            }
            if (yedekGecmisiniKucult(appData)) kimlikMigrasyonu = true;
            if (baslangicHaberGorselleriniDuzelt(appData.mebHaberler)) kimlikMigrasyonu = true;

            // Sayfa ilk açılışında (oturum zaten açıksa) loadData, DOMContentLoaded
            // geri çağrımının ORTASINDA senkron çalışır. Oysa renderDersler /
            // renderOgretmenTable / renderKayanYazilar gibi çiziciler dosyanın
            // ilerisinde "window.x = function" ile ATANIR — bu atamalar hoist
            // edilmez. Aşağıdaki mikro görev sınırı, populateForms'u geri çağrımın
            // tamamı bittikten sonraya erteleyerek tüm çizicilerin tanımlı
            // olmasını garanti eder.
            await Promise.resolve();

            const gizlilik = gizlilikAyarlari(appData);
            appData.gizlilik = gizlilik;
            if (kimlikMigrasyonu) saveData();
            const son = Date.parse((appData.veriYonetimi && appData.veriYonetimi.sonGozdenGecirme) || '');
            const sureMs = Math.max(1, Number(gizlilik.saklamaSuresiGun) || 365) * 86400000;
            if (Number.isFinite(son) && Date.now() - son > sureMs) {
                kisiselAlanlariTemizle(appData);
                saveData();
                BhUI.toast('Saklama süresi dolan personel verileri otomatik temizlendi.', 'warning');
            } else {
                if (!appData.veriYonetimi) appData.veriYonetimi = { sonGozdenGecirme: new Date().toISOString() };
                acikPanoVerisiniYayinla();
            }

            populateForms();
        } catch (e) {
            console.error("Veri yüklenemedi", e);
        }
    }

    function populateForms() {
        // Genel Ayarlar & Okul Kimliği
        if (!appData.okulTuru && appData.okulAdi) {
            const bilinenTurler = [
                "Fen ve Sosyal Bilimler Proje Anadolu İmam Hatip Lisesi",
                "Uluslararası Anadolu İmam Hatip Lisesi",
                "Hafızlık Projesi İmam Hatip Ortaokulu",
                "Musiki ve Geleneksel Sanatlar Proje AİHL",
                "Spor Proje Anadolu İmam Hatip Lisesi",
                "Mesleki Program Uygulayan AİHL",
                "Anadolu İmam Hatip Lisesi",
                "İmam Hatip Ortaokulu",
                "İmam Hatip Lisesi",
                "Mesleki ve Teknik Anadolu Lisesi",
                "Sosyal Bilimler Lisesi",
                "Çok Programlı Anadolu Lisesi",
                "Anadolu Lisesi",
                "Fen Lisesi",
                "Ortaokul",
                "İlkokul",
                "Anaokulu",
                "Bilim ve Sanat Merkezi (BİLSEM)",
                "Halk Eğitimi Merkezi"
            ];
            for (const tur of bilinenTurler) {
                if (appData.okulAdi.endsWith(tur)) {
                    appData.okulTuru = tur;
                    appData.okulAdi = appData.okulAdi.slice(0, -tur.length).trim();
                    break;
                }
            }
        }
        document.getElementById('inp-okulAdi').value = appData.okulAdi || "";
        const elOkulTuru = document.getElementById('inp-okulTuru');
        if (elOkulTuru) elOkulTuru.value = appData.okulTuru || "İmam Hatip Ortaokulu";
        document.getElementById('inp-webUrl').value = appData.okulWebSiteUrl || "";
        const konum = Object.assign({ sehir: "", ilce: "", enlem: null, boylam: null }, appData.konum || {});
        // Eğer enlem/boylam boşsa ancak şehir veya ilçe varsa SeyirKonum ile koordinatları otomatik çöz
        if ((konum.enlem === null || konum.boylam === null || konum.enlem === '' || konum.boylam === '') && konum.sehir && typeof SeyirKonum !== 'undefined') {
            const eslesen = SeyirKonum.koordinatGetir(konum.sehir, konum.ilce);
            if (eslesen) {
                konum.enlem = eslesen.enlem;
                konum.boylam = eslesen.boylam;
                if (!konum.sehir) konum.sehir = eslesen.sehir;
                if (eslesen.ilce && !konum.ilce) konum.ilce = eslesen.ilce;
            }
        }
        document.getElementById('inp-sehir').value = konum.sehir || "";
        const inpIlce = document.getElementById('inp-ilce');
        if (inpIlce) inpIlce.value = konum.ilce || "";
        document.getElementById('inp-enlem').value = (konum.enlem !== null && konum.enlem !== undefined) ? konum.enlem : "";
        document.getElementById('inp-boylam').value = (konum.boylam !== null && konum.boylam !== undefined) ? konum.boylam : "";

        // Şehir datalist'ini 81 il ile doldur
        const sehirDatalist = document.getElementById('sehir-listesi');
        if (sehirDatalist && typeof SeyirKonum !== 'undefined' && sehirDatalist.children.length === 0) {
            SeyirKonum.SEHIRLER.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.ad;
                opt.label = `${s.plaka} - ${s.ad}`;
                sehirDatalist.appendChild(opt);
            });
        }
        // Seçili il varsa ilçe datalist'ini doldur
        if (konum.sehir && typeof ilceDatalistGuncelle === 'function') {
            ilceDatalistGuncelle(konum.sehir);
        }
        if (appData.ayarlar) {
            document.getElementById('inp-karuselSuresi').value = appData.ayarlar.karuselSuresi || 5000;
            document.getElementById('inp-temaOtomatik').value = appData.ayarlar.temaOtomatik ? "true" : "false";
        }
        const gizlilik = gizlilikAyarlari(appData);
        const personelModu = document.getElementById('inp-personel-gosterim');
        if (personelModu) personelModu.value = gizlilik.personelAdiGosterim;
        const nobetciGoster = document.getElementById('inp-nobetci-goster');
        if (nobetciGoster) nobetciGoster.checked = !!gizlilik.nobetciGoster;
        const rehberGoster = document.getElementById('inp-rehber-goster');
        if (rehberGoster) rehberGoster.checked = !!gizlilik.rehberOgretmenGoster;
        const dersOgretmeniGoster = document.getElementById('inp-ders-ogretmeni-goster');
        if (dersOgretmeniGoster) dersOgretmeniGoster.checked = !!gizlilik.dersOgretmeniGoster;
        const saklamaSuresi = document.getElementById('inp-saklama-suresi');
        if (saklamaSuresi) saklamaSuresi.value = gizlilik.saklamaSuresiGun;

        // Okul Logosu Önizlemesi (Madde 3.1 & Özel Logo)
        const logoPreview = document.getElementById('img-okulLogo-preview');
        if (logoPreview) {
            logoPreview.src = appData.okulLogo || "img/okul_logo.png";
        }

        // Nöbetçi
        renderNobetciDnD();

        // Kayan Yazılar (liste + toplu düzenleme alanı)
        syncKayanTextarea();

        // Not: Aşağıdaki çiziciler "window.x = function" ile atandığı için
        // hoist edilmez; biri tanımsız kalsa bile diğerlerinin çizilmesini
        // engellememesi adına hepsi typeof ile korunur.
        if (typeof renderKayanYazilar === 'function') renderKayanYazilar();

        // Duyurular ve Ders Programı
        renderDuyurular();
        if (typeof renderDersler === 'function') renderDersler();
        if (typeof updateZamanStats === 'function') updateZamanStats();
        if (typeof renderOgretmenTable === 'function') renderOgretmenTable();
        if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
        if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
        if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
        if (typeof renderHavuzTags === 'function') renderHavuzTags();
        if (typeof updateProgramStats === 'function') updateProgramStats();
        if (typeof renderSinavlar === 'function') renderSinavlar();
        if (typeof updateVeriKPIs === 'function') updateVeriKPIs();
        if (typeof syncAutoBackupFormUI === 'function') syncAutoBackupFormUI();
        if (typeof renderBackupHistory === 'function') renderBackupHistory();
        if (typeof updateKayanKPIs === 'function') updateKayanKPIs();
        if (typeof syncKayanSimulator === 'function') syncKayanSimulator();

        // Kayan Yazı / Ticker Ayarları Doldurma
        const chkTicker = document.getElementById('chk-ticker-active');
        if (chkTicker && appData.ayarlar) chkTicker.checked = appData.ayarlar.tickerDurum !== false;
        const inpTickerBaslik = document.getElementById('inp-ticker-baslik');
        if (inpTickerBaslik && appData.ayarlar) inpTickerBaslik.value = appData.ayarlar.tickerBaslik || '⚡ DUYURULAR';
        const inpTickerHiz = document.getElementById('inp-ticker-hiz-val');
        if (inpTickerHiz && appData.ayarlar) {
            const h = appData.ayarlar.tickerHiz || 'normal';
            inpTickerHiz.value = h;
            document.querySelectorAll('.ticker-speed-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-speed') === h));
        }
        const inpTickerAyrac = document.getElementById('inp-ticker-ayrac-val');
        if (inpTickerAyrac && appData.ayarlar) {
            const a = appData.ayarlar.tickerAyrac || '⚡';
            inpTickerAyrac.value = a;
            document.querySelectorAll('.ticker-sep-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-sep') === a));
        }

        // Zil Yönetimi Senkronizasyonu
        if (typeof syncZilFormUI === 'function') syncZilFormUI();
        if (typeof renderZilTablo === 'function') renderZilTablo();
        if (typeof renderZilKPIs === 'function') renderZilKPIs();

        // Karusel Video Senkronizasyonu
        if (!Array.isArray(appData.karuselVideolar)) appData.karuselVideolar = [];
        if (typeof renderKaruselVideoUI === 'function') renderKaruselVideoUI();
    }

    // ─── KAYAN YAZILAR (TICKER) YÖNETİMİ — Madde 2.4 & Gelişmiş Motor ───
    let editingKayanIndex = -1;

    function getKayanListesi() {
        if (!Array.isArray(appData.kayanYazi)) appData.kayanYazi = [];
        return appData.kayanYazi;
    }

    function parseKayanCategory(text) {
        const t = String(text || '').trim();
        if (t.includes('[Duyuru]') || t.startsWith('📢')) {
            return { name: 'Duyuru', icon: 'fa-solid fa-bullhorn', bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' };
        }
        if (t.includes('[Tebrik]') || t.startsWith('🏆')) {
            return { name: 'Tebrik', icon: 'fa-solid fa-trophy', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' };
        }
        if (t.includes('[Ayet/Hadis]') || t.startsWith('📖')) {
            return { name: 'Ayet & Hadis', icon: 'fa-solid fa-book-quran', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' };
        }
        if (t.includes('[Günün Sözü]') || t.startsWith('💡')) {
            return { name: 'Günün Sözü', icon: 'fa-solid fa-lightbulb', bg: 'rgba(14, 165, 233, 0.12)', color: '#0284c7' };
        }
        if (t.includes('[Hatırlatma]') || t.startsWith('⏰')) {
            return { name: 'Hatırlatma', icon: 'fa-solid fa-clock', bg: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' };
        }
        if (t.includes('[Önemli]') || t.includes('[Acil]') || t.startsWith('🚨')) {
            return { name: 'Önemli', icon: 'fa-solid fa-triangle-exclamation', bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' };
        }
        return { name: 'Genel', icon: 'fa-solid fa-comment-dots', bg: 'rgba(100, 116, 139, 0.12)', color: '#475569' };
    }

    function syncKayanTextarea() {
        const ta = document.getElementById('inp-kayan');
        if (ta) ta.value = getKayanListesi().join('\n');
    }

    window.updateKayanKPIs = function updateKayanKPIs() {
        const yazilar = getKayanListesi();
        const totalChars = yazilar.join(' ').length;

        const kpiCount = document.getElementById('kpi-ticker-count');
        const kpiChars = document.getElementById('kpi-ticker-chars');
        if (kpiCount) kpiCount.textContent = `${yazilar.length} Yazı`;
        if (kpiChars) kpiChars.textContent = `Toplam ${totalChars} Karakter`;

        const ayarlar = appData.ayarlar || {};
        const hiz = ayarlar.tickerHiz || 'normal';
        let baseSec = hiz === 'yavas' ? 50 : hiz === 'hizli' ? 22 : 35;
        if (totalChars > 400) {
            baseSec = Math.max(baseSec, Math.round(totalChars * 0.1));
        }

        const kpiDuration = document.getElementById('kpi-ticker-duration');
        if (kpiDuration) {
            kpiDuration.textContent = yazilar.length === 0 ? '0 sn' : `~${baseSec} sn`;
        }

        const kpiSpeedText = document.getElementById('kpi-ticker-speed-text');
        const kpiSepText = document.getElementById('kpi-ticker-sep-text');
        const ayrac = ayarlar.tickerAyrac || '⚡';
        if (kpiSpeedText) {
            const hizAd = hiz === 'yavas' ? 'Yavaş (50s)' : hiz === 'hizli' ? 'Hızlı (22s)' : 'Normal (35s)';
            kpiSpeedText.textContent = hizAd;
        }
        if (kpiSepText) {
            kpiSepText.textContent = `Ayraç: ${ayrac}`;
        }

        const kpiStatus = document.getElementById('kpi-ticker-status');
        const kpiStatusSub = document.getElementById('kpi-ticker-status-sub');
        const isAktif = ayarlar.tickerDurum !== false;
        if (kpiStatus) {
            if (isAktif && yazilar.length > 0) {
                kpiStatus.textContent = 'Aktif (Yayında)';
                kpiStatus.style.color = '#10b981';
                if (kpiStatusSub) kpiStatusSub.textContent = 'Canlı panoda kesintisiz akıyor';
            } else if (isAktif && yazilar.length === 0) {
                kpiStatus.textContent = 'Beklemede (Boş)';
                kpiStatus.style.color = '#f59e0b';
                if (kpiStatusSub) kpiStatusSub.textContent = 'Yazı eklendiğinde yayına girecek';
            } else {
                kpiStatus.textContent = 'Panoda Gizli';
                kpiStatus.style.color = '#ef4444';
                if (kpiStatusSub) kpiStatusSub.textContent = 'Şerit gösterimi kapalı';
            }
        }
    };

    window.syncKayanSimulator = function syncKayanSimulator() {
        const simLabel = document.getElementById('sim-label-text');
        const simText = document.getElementById('sim-ticker-text');
        const speedBadge = document.getElementById('badge-sim-speed');

        const ayarlar = appData.ayarlar || {};
        const baslik = ayarlar.tickerBaslik || '⚡ DUYURULAR';
        const hiz = ayarlar.tickerHiz || 'normal';
        const ayrac = ayarlar.tickerAyrac || '⚡';

        if (simLabel) simLabel.textContent = baslik;

        let duration = hiz === 'yavas' ? 50 : hiz === 'hizli' ? 22 : 35;
        if (speedBadge) {
            const hizAd = hiz === 'yavas' ? 'Yavaş (50s)' : hiz === 'hizli' ? 'Hızlı (22s)' : 'Normal (35s)';
            speedBadge.textContent = `Hız: ${hizAd}`;
        }

        if (simText) {
            const yazilar = getKayanListesi();
            if (yazilar.length === 0) {
                simText.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Henüz kayan yazı eklenmedi. Aşağıdaki formdan ekleyebilirsiniz.</span>`;
                simText.style.animation = 'none';
            } else {
                const totalChars = yazilar.join(' ').length;
                if (totalChars > 400) {
                    duration = Math.max(duration, Math.round(totalChars * 0.1));
                }
                const itemsHtml = yazilar.map(y => `<span>${escapeHtml(y)}</span>`).join(`<span style="margin: 0 30px; color: #6366f1; font-weight: 800; font-size: 1.15rem;">${escapeHtml(ayrac)}</span>`);
                simText.innerHTML = itemsHtml;
                simText.style.animation = `adminTickerMove ${duration}s linear infinite`;
            }
        }
    };

    window.renderKayanYazilar = function () {
        const list = document.getElementById('kayan-listesi');
        if (!list) return;

        const yazilar = getKayanListesi();
        list.innerHTML = '';

        if (yazilar.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 36px 20px; background: #f8fafc; border-radius: 12px; border: 1.5px dashed var(--sidebar-border);">
                    <div style="font-size: 2.2rem; color: #6366f1; opacity: 0.6; margin-bottom: 8px;">
                        <i class="fa-solid fa-bullhorn"></i>
                    </div>
                    <h4 style="margin: 0 0 6px 0; font-size: 1rem; color: var(--text-main); font-weight: 700;">Henüz Kayan Yazı Eklenmedi</h4>
                    <p style="margin: 0; font-size: 0.82rem; color: var(--text-muted); max-width: 420px; margin: 0 auto;">
                        Yukarıdaki formdan hemen yeni bir duyuru yazabilir veya <strong>Hazır Şablonlar</strong> kütüphanesinden tek tıkla resmi mesajları ekleyebilirsiniz.
                    </p>
                </div>
            `;
            syncKayanSimulator();
            updateKayanKPIs();
            return;
        }

        yazilar.forEach((metin, i) => {
            const cat = parseKayanCategory(metin);
            const isEditing = (editingKayanIndex === i);
            const charCount = metin.length;

            const div = document.createElement('div');
            div.className = `ticker-item-card ${isEditing ? 'editing' : ''}`;
            div.innerHTML = `
                <div class="ticker-item-num">#${i + 1}</div>
                <div class="ticker-item-content">
                    <div class="ticker-item-meta">
                        <span class="ticker-item-cat" style="background: ${cat.bg}; color: ${cat.color};">
                            <i class="${cat.icon}"></i> ${cat.name}
                        </span>
                        <span class="ticker-item-chars">${charCount} Karakter</span>
                    </div>
                    <p class="ticker-item-text">${escapeHtml(metin)}</p>
                </div>
                <div class="ticker-item-actions">
                    <button type="button" class="btn-icon" onclick="duplicateKayanYazi(${i})" title="Bu Yazıyı Kopyala/Çoğalt">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button type="button" class="btn-icon" onclick="moveKayanYazi(${i}, -1)" title="Yukarı Taşı" ${i === 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" class="btn-icon" onclick="moveKayanYazi(${i}, 1)" title="Aşağı Taşı" ${i === yazilar.length - 1 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                    <button type="button" class="btn-icon" onclick="editKayanYazi(${i})" title="Düzenle">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-icon danger" onclick="deleteKayanYazi(${i})" title="Sil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });

        syncKayanSimulator();
        updateKayanKPIs();
    };

    function kayanDegisti() {
        saveData();
        syncKayanTextarea();
        renderKayanYazilar();
    }

    window.moveKayanYazi = function (index, yon) {
        const yazilar = getKayanListesi();
        const hedef = index + yon;
        if (index < 0 || index >= yazilar.length || hedef < 0 || hedef >= yazilar.length) return;
        const tmp = yazilar[index];
        yazilar[index] = yazilar[hedef];
        yazilar[hedef] = tmp;
        if (editingKayanIndex === index) editingKayanIndex = hedef;
        else if (editingKayanIndex === hedef) editingKayanIndex = index;
        kayanDegisti();
    };

    window.duplicateKayanYazi = function (index) {
        const yazilar = getKayanListesi();
        if (index < 0 || index >= yazilar.length) return;
        const copyText = yazilar[index];
        yazilar.splice(index + 1, 0, copyText);
        kayanDegisti();
        BhUI.toast('Kayan yazı kopyalandı.', 'success');
    };

    window.deleteKayanYazi = function (index) {
        const yazilar = getKayanListesi();
        if (index < 0 || index >= yazilar.length) return;
        if (!confirm('Bu kayan yazıyı silmek istediğinize emin misiniz?')) return;
        yazilar.splice(index, 1);
        if (editingKayanIndex === index) iptalKayanDuzenleme();
        else if (editingKayanIndex > index) editingKayanIndex--;
        kayanDegisti();
        BhUI.toast('Kayan yazı silindi.', 'success');
    };

    window.editKayanYazi = function (index) {
        const yazilar = getKayanListesi();
        if (index < 0 || index >= yazilar.length) return;
        editingKayanIndex = index;
        const inp = document.getElementById('inp-kayan-yeni');
        if (inp) {
            inp.value = yazilar[index];
            inp.focus();
            updateKayanCharCount();
        }
        const titleForm = document.getElementById('title-kayan-form');
        if (titleForm) titleForm.textContent = `Kayan Yazıyı Düzenle (#${index + 1})`;
        const btnText = document.getElementById('text-add-kayan');
        if (btnText) btnText.textContent = 'Güncelle';
        const btnCancel = document.getElementById('btn-cancel-kayan');
        if (btnCancel) btnCancel.style.display = 'inline-flex';
        renderKayanYazilar();
    };

    function iptalKayanDuzenleme() {
        editingKayanIndex = -1;
        const inp = document.getElementById('inp-kayan-yeni');
        if (inp) {
            inp.value = '';
            updateKayanCharCount();
        }
        const titleForm = document.getElementById('title-kayan-form');
        if (titleForm) titleForm.textContent = 'Yeni Kayan Yazı Ekle';
        const btnText = document.getElementById('text-add-kayan');
        if (btnText) btnText.textContent = 'Listeye Ekle';
        const btnCancel = document.getElementById('btn-cancel-kayan');
        if (btnCancel) btnCancel.style.display = 'none';
        renderKayanYazilar();
    }

    function kaydetKayanYazi() {
        const inp = document.getElementById('inp-kayan-yeni');
        if (!inp) return;
        const metin = inp.value.trim();
        if (!metin) {
            BhUI.toast('Lütfen bir metin girin.', 'warning');
            inp.focus();
            return;
        }

        const yazilar = getKayanListesi();
        if (editingKayanIndex >= 0 && editingKayanIndex < yazilar.length) {
            yazilar[editingKayanIndex] = metin;
            BhUI.toast('Kayan yazı güncellendi.', 'success');
        } else {
            yazilar.push(metin);
            BhUI.toast('Kayan yazı listeye eklendi.', 'success');
        }
        iptalKayanDuzenleme();
        kayanDegisti();
    }

    window.useKayanTemplate = function (btn, prefix) {
        const itemBox = btn ? btn.closest('.ticker-tpl-item') : null;
        if (!itemBox) return;
        const textEl = itemBox.querySelector('.ticker-tpl-text');
        if (!textEl) return;

        let fullText = textEl.textContent.trim();
        if (prefix && !fullText.startsWith(prefix)) {
            fullText = `${prefix} ${fullText}`;
        }

        const yazilar = getKayanListesi();
        yazilar.push(fullText);
        kayanDegisti();
        BhUI.toast('Şablon başarıyla listeye eklendi!', 'success');
    };

    window.appendCategoryPrefix = function (prefix) {
        const inp = document.getElementById('inp-kayan-yeni');
        if (!inp) return;
        let current = inp.value.trim();
        const catRegex = /^(📢|🏆|📖|💡|⏰|🚨)?\s*(\[(Duyuru|Tebrik|Ayet\/Hadis|Günün Sözü|Hatırlatma|Önemli|Acil)\])?\s*/;
        current = current.replace(catRegex, '').trim();
        inp.value = `${prefix} ${current}`.trim();
        inp.focus();
        updateKayanCharCount();
    };

    window.insertEmoji = function (emoji) {
        const inp = document.getElementById('inp-kayan-yeni');
        if (!inp) return;
        const start = inp.selectionStart || 0;
        const end = inp.selectionEnd || 0;
        const val = inp.value;
        inp.value = val.substring(0, start) + emoji + val.substring(end);
        inp.focus();
        inp.setSelectionRange(start + emoji.length, start + emoji.length);
        updateKayanCharCount();
    };

    function updateKayanCharCount() {
        const inp = document.getElementById('inp-kayan-yeni');
        const counter = document.getElementById('char-count-kayan');
        if (!inp || !counter) return;
        const len = inp.value.length;
        counter.textContent = `${len} / 300 Karakter`;
        counter.style.color = len > 280 ? '#ef4444' : 'var(--text-muted)';
    }

    window.setTickerSpeed = function (speed) {
        if (!appData.ayarlar) appData.ayarlar = {};
        appData.ayarlar.tickerHiz = speed;

        const hiddenInp = document.getElementById('inp-ticker-hiz-val');
        if (hiddenInp) hiddenInp.value = speed;

        const info = document.getElementById('txt-ticker-hiz-info');
        if (info) {
            info.textContent = speed === 'yavas' ? '50 Saniye (Yavaş)' : speed === 'hizli' ? '22 Saniye (Hızlı)' : '35 Saniye (Normal)';
        }

        document.querySelectorAll('.ticker-speed-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-speed') === speed);
        });

        saveData();
        syncKayanSimulator();
        updateKayanKPIs();
        BhUI.toast(`Akış hızı ${speed === 'yavas' ? 'Yavaş' : speed === 'hizli' ? 'Hızlı' : 'Normal'} olarak ayarlandı.`, 'info');
    };

    window.setTickerSep = function (sep) {
        if (!appData.ayarlar) appData.ayarlar = {};
        appData.ayarlar.tickerAyrac = sep;

        const hiddenInp = document.getElementById('inp-ticker-ayrac-val');
        if (hiddenInp) hiddenInp.value = sep;

        document.querySelectorAll('.ticker-sep-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-sep') === sep);
        });

        saveData();
        syncKayanSimulator();
        updateKayanKPIs();
        BhUI.toast(`Yazı ayırıcı simge güncellendi: ${sep}`, 'info');
    };

    window.setTickerBaslikPreset = function (preset) {
        const inp = document.getElementById('inp-ticker-baslik');
        if (inp) {
            inp.value = preset;
            if (!appData.ayarlar) appData.ayarlar = {};
            appData.ayarlar.tickerBaslik = preset;
            saveData();
            syncKayanSimulator();
            BhUI.toast(`Şerit başlığı "${preset}" yapıldı.`, 'info');
        }
    };

    window.copyAllKayanYazilar = function () {
        const yazilar = getKayanListesi();
        if (yazilar.length === 0) {
            BhUI.toast('Kopyalanacak kayan yazı bulunmuyor.', 'warning');
            return;
        }
        navigator.clipboard.writeText(yazilar.join('\n')).then(() => {
            BhUI.toast('Tüm kayan yazılar panoya kopyalandı.', 'success');
        }).catch(err => {
            BhUI.toast('Panoya kopyalanamadı: ' + err.message, 'warning');
        });
    };

    window.clearAllKayanYazilar = function () {
        const yazilar = getKayanListesi();
        if (yazilar.length === 0) return;
        if (!confirm('Tüm kayan yazıları kalıcı olarak silmek istediğinize emin misiniz?')) return;
        appData.kayanYazi = [];
        iptalKayanDuzenleme();
        kayanDegisti();
        BhUI.toast('Tüm kayan yazılar temizlendi.', 'success');
    };

    window.exportKayanTxt = function () {
        const yazilar = getKayanListesi();
        if (yazilar.length === 0) {
            BhUI.toast('Dışa aktarılacak kayan yazı bulunamadı.', 'warning');
            return;
        }
        const text = yazilar.join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seyir-kayan-yazilar-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        BhUI.toast('Kayan yazılar TXT olarak indirildi.', 'success');
    };

    // ─── DUYURULAR YÖNETİMİ & CANLI ÖNİZLEME (Madde 2.5) ───

    // Duyuru Renk & Görsel Meta Yardımcısı
    function getDuyuruRenkMeta(renk, oncelik) {
        const r = String(renk || '').toLowerCase();
        if (oncelik === 'acil' || r === 'danger' || r === 'acil' || r === 'kirmizi') {
            return {
                color: '#ef4444',
                bgGrad: 'linear-gradient(135deg, #2d0e0e 0%, #0f172a 100%)',
                bgLight: '#fef2f2',
                border: 'rgba(239, 68, 68, 0.55)',
                badgeBg: '#fef2f2',
                badgeColor: '#b91c1c',
                badgeBorder: '#fecaca',
                badgeTitle: 'Acil İlan',
                badgeLabel: '🔴 Kırmızı (Acil İlan)',
                emoji: '🚨'
            };
        }
        if (r === 'secondary' || r === 'success' || r === 'yesil' || r === 'green') {
            return {
                color: '#10b981',
                bgGrad: 'linear-gradient(135deg, #062e22 0%, #0f172a 100%)',
                bgLight: '#f0fdf4',
                border: 'rgba(16, 185, 129, 0.55)',
                badgeBg: '#ecfdf5',
                badgeColor: '#047857',
                badgeBorder: '#a7f3d0',
                badgeTitle: 'Genel Bilgilendirme',
                badgeLabel: '🟢 Yeşil (Bilgilendirme)',
                emoji: '🌿'
            };
        }
        if (r === 'accent' || r === 'warning' || r === 'turuncu' || r === 'orange') {
            return {
                color: '#f59e0b',
                bgGrad: 'linear-gradient(135deg, #2b1804 0%, #0f172a 100%)',
                bgLight: '#fffbeb',
                border: 'rgba(245, 158, 11, 0.55)',
                badgeBg: '#fffbeb',
                badgeColor: '#b45309',
                badgeBorder: '#fde68a',
                badgeTitle: 'Önemli Duyuru',
                badgeLabel: '🟠 Turuncu (Önemli)',
                emoji: '⚡'
            };
        }
        if (r === 'purple' || r === 'mor' || r === 'violet') {
            return {
                color: '#a855f7',
                bgGrad: 'linear-gradient(135deg, #230b3b 0%, #0f172a 100%)',
                bgLight: '#faf5ff',
                border: 'rgba(168, 85, 247, 0.55)',
                badgeBg: '#faf5ff',
                badgeColor: '#7e22ce',
                badgeBorder: '#e9d5ff',
                badgeTitle: 'Özel Etkinlik',
                badgeLabel: '🟣 Mor (Özel Etkinlik)',
                emoji: '✨'
            };
        }
        // Default: Primary / Mavi
        return {
            color: '#3b82f6',
            bgGrad: 'linear-gradient(135deg, #0c2340 0%, #0f172a 100%)',
            bgLight: '#eff6ff',
            border: 'rgba(59, 130, 246, 0.5)',
            badgeBg: '#eff6ff',
            badgeColor: '#1d4ed8',
            badgeBorder: '#bfdbfe',
            badgeTitle: 'Genel Duyuru',
            badgeLabel: '🔵 Mavi (Genel)',
            emoji: '📢'
        };
    }

    // Duyuru Canlı Önizleme Güncelleyici
    function updateDuyuruLivePreview() {
        const baslikInput = document.getElementById('inline-d-baslik');
        const icerikInput = document.getElementById('inline-d-icerik');
        const renkInput = document.getElementById('inline-d-renk');

        const baslik = (baslikInput && baslikInput.value.trim()) || 'Duyuru Başlığı';
        const icerik = (icerikInput && icerikInput.value.trim()) || 'Duyuru içeriği burada akıllı tahtadaki görünümüyle canlı olarak önizlenecektir...';
        const renk = (renkInput && renkInput.value) || 'secondary';

        const meta = getDuyuruRenkMeta(renk);

        const cardEl = document.getElementById('duyuru-live-preview-card');
        const emojiBox = document.getElementById('prev-card-emoji-box');
        const baslikEl = document.getElementById('prev-card-baslik');
        const badgeEl = document.getElementById('prev-card-badge');
        const icerikEl = document.getElementById('prev-card-icerik');

        if (cardEl) {
            cardEl.style.background = meta.bgGrad;
            cardEl.style.border = `1.5px solid ${meta.border}`;
            cardEl.style.borderLeft = `5px solid ${meta.color}`;
        }
        if (emojiBox) {
            emojiBox.style.background = `${meta.color}22`;
            emojiBox.style.color = meta.color;
            emojiBox.style.borderColor = `${meta.color}50`;
            emojiBox.textContent = meta.emoji;
        }
        if (baslikEl) {
            baslikEl.textContent = baslik;
        }
        if (badgeEl) {
            badgeEl.style.color = meta.color;
            badgeEl.style.background = `${meta.color}22`;
            badgeEl.style.borderColor = `${meta.color}50`;
            badgeEl.textContent = `${meta.emoji} ${meta.badgeTitle}`;
        }
        if (icerikEl) {
            icerikEl.textContent = icerik;
            icerikEl.style.borderTopColor = `${meta.color}40`;
        }

        // Karakter sayaçları
        const baslikSayac = document.getElementById('d-baslik-sayac');
        if (baslikSayac && baslikInput) {
            baslikSayac.textContent = `${baslikInput.value.length} / 70`;
        }
        const icerikSayac = document.getElementById('d-icerik-sayac');
        if (icerikSayac && icerikInput) {
            icerikSayac.textContent = `${icerikInput.value.length} / 250`;
        }
    }

    // Hızlı Şablon Uygulayıcı
    window.applyDuyuruSablon = function (tip) {
        const baslikEl = document.getElementById('inline-d-baslik');
        const icerikEl = document.getElementById('inline-d-icerik');
        const renkEl = document.getElementById('inline-d-renk');

        const sablonlar = {
            kurs: {
                baslik: 'Hafta Sonu DYK Kursları',
                renk: 'secondary', // Yeşil
                icerik: 'Hafta sonu Destekleme ve Yetiştirme Kurslarımız cumartesi ve pazar günleri saat 09:00\'da başlayacaktır. Tüm öğrencilerimizin dersliklerinde hazır bulunmaları rica olunur.'
            },
            veli: {
                baslik: '1. Dönem Genel Veli Toplantısı',
                renk: 'primary', // Mavi
                icerik: 'Öğrencilerimizin akademik ve sosyal gelişimlerini değerlendirmek üzere pazar günü saat 13:00\'te okulumuz konferans salonunda genel veli toplantısı yapılacaktır.'
            },
            etkinlik: {
                baslik: 'TÜBİTAK ve TEKNOFEST Başarımız',
                renk: 'purple', // Mor
                icerik: 'Okulumuz teknoloji takımı, TEKNOFEST bölge finallerinde dereceye girerek Türkiye finallerine katılmaya hak kazanmıştır. Öğrenci ve danışman öğretmenlerimizi tebrik ederiz.'
            },
            acil: {
                baslik: 'Önemli İdari Duyuru',
                renk: 'danger', // Kırmızı
                icerik: 'Hava muhalefeti sebebiyle yarın okulumuzda eğitim-öğretime bir (1) gün ara verilmiştir. Tüm veli ve öğrencilerimize önemle duyurulur.'
            },
            tatil: {
                baslik: 'Ara Tatil Başlangıcı',
                renk: 'accent', // Turuncu
                icerik: '1. Dönem ara tatili Cuma günü ders bitimiyle başlayacaktır. Tüm öğrencilerimize ve öğretmenlerimize verimli ve dinlendirici bir tatil dileriz.'
            }
        };

        const sablon = sablonlar[tip];
        if (!sablon) return;

        if (baslikEl) baslikEl.value = sablon.baslik;
        if (icerikEl) icerikEl.value = sablon.icerik;
        if (renkEl) renkEl.value = sablon.renk;

        updateDuyuruLivePreview();
        if (icerikEl) icerikEl.focus();
    };

    // Duyuru Render
    function renderDuyurular() {
        const list = document.getElementById('duyurular-listesi');
        if (!list) return;

        const countEl = document.getElementById('duyuru-toplam-sayi');
        const toplamSayi = (appData.duyurular && Array.isArray(appData.duyurular)) ? appData.duyurular.length : 0;
        if (countEl) countEl.textContent = `${toplamSayi} Duyuru`;

        list.innerHTML = "";
        if (!appData.duyurular || appData.duyurular.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 35px 20px; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 14px; margin: 10px 0;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">📢</div>
                    <div style="font-weight: 800; font-size: 1rem; color: #1e293b;">Henüz Özel Duyuru Eklenmedi</div>
                    <div style="font-size: 0.86rem; color: #64748b; margin-top: 4px;">Yukarıdaki formu kullanarak veya hızlı şablonlardan seçerek ilk duyurunuzu ekleyin.</div>
                </div>
            `;
            updateDuyuruLivePreview();
            return;
        }

        const aramaEl = document.getElementById('duyuru-arama-input');
        const aramaFiltresi = (aramaEl && aramaEl.value) ? aramaEl.value.trim().toLowerCase() : '';

        // En son eklenenleri üstte gösterelim
        const reversed = [...appData.duyurular].reverse();
        let gorunenSayisi = 0;

        reversed.forEach((d, reversedIndex) => {
            const index = appData.duyurular.length - 1 - reversedIndex;

            if (aramaFiltresi) {
                const b = (d.baslik || '').toLowerCase();
                const ic = (d.icerik || '').toLowerCase();
                if (!b.includes(aramaFiltresi) && !ic.includes(aramaFiltresi)) {
                    return;
                }
            }
            gorunenSayisi++;

            const meta = getDuyuruRenkMeta(d.renk, d.oncelik);

            list.innerHTML += `
                <div class="list-item" style="border: 1px solid #e2e8f0; border-left: 5px solid ${meta.color}; background: ${meta.bgLight}; margin-bottom: 12px; border-radius: 12px; padding: 14px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                    <div class="list-item-content">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                            <h4 style="margin: 0; color: #0f172a; font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                                <span>${meta.emoji}</span>
                                <span>${escapeHtml(d.baslik)}</span>
                            </h4>
                            <span style="background: ${meta.badgeBg}; color: ${meta.badgeColor}; border: 1px solid ${meta.badgeBorder}; padding: 3px 9px; border-radius: 6px; font-size: 0.76rem; font-weight: 800;">
                                ${meta.badgeLabel}
                            </span>
                        </div>
                        <p style="margin: 0 0 10px 0; color: #334155; font-size: 0.9rem; line-height: 1.5;">${escapeHtml(d.icerik || '')}</p>
                        <div style="display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: #64748b;">
                            <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(d.tarih || '')}</span>
                        </div>
                    </div>
                    <div class="list-item-actions" style="margin-left: 15px; display: flex; gap: 6px;">
                        <button type="button" class="btn-icon" onclick="editDuyuru(${index})" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="btn-icon danger" onclick="deleteDuyuru(${index})" title="Sil"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });

        if (gorunenSayisi === 0 && aramaFiltresi) {
            list.innerHTML = `
                <div style="text-align: center; padding: 25px; background: #f8fafc; border-radius: 10px; color: #64748b; font-size: 0.9rem;">
                    🔍 "<strong>${escapeHtml(aramaFiltresi)}</strong>" aramasına uygun duyuru bulunamadı.
                </div>
            `;
        }

        updateDuyuruLivePreview();
    }

    window.editDuyuru = (index) => {
        editingDuyuruIndex = index;
        const d = appData.duyurular[index];
        const baslikEl = document.getElementById('inline-d-baslik');
        const icerikEl = document.getElementById('inline-d-icerik');
        const renkEl = document.getElementById('inline-d-renk');

        if (baslikEl) baslikEl.value = d.baslik || '';
        if (icerikEl) icerikEl.value = d.icerik || '';
        if (renkEl) renkEl.value = d.renk || 'secondary';

        const textAdd = document.getElementById('text-add-inline-duyuru');
        if (textAdd) textAdd.textContent = "Güncelle";
        const iconAdd = document.getElementById('icon-add-inline-duyuru');
        if (iconAdd) iconAdd.className = "fa-solid fa-check";

        const btnCancel = document.getElementById('btn-cancel-inline-duyuru');
        if (btnCancel) btnCancel.style.display = "inline-flex";

        const editAlert = document.getElementById('duyuru-edit-alert');
        if (editAlert) editAlert.style.display = "flex";

        updateDuyuruLivePreview();
        if (baslikEl) baslikEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.deleteDuyuru = (index) => {
        if (confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
            appData.duyurular.splice(index, 1);
            if (editingDuyuruIndex === index) {
                document.getElementById('btn-cancel-inline-duyuru').click();
            }
            renderDuyurular();
        }
    };

    let editingDuyuruIndex = -1;

    // Yeni veya Düzenlenen Duyuru Ekle (Inline)
    const btnAddInlineDuyuru = document.getElementById('btn-add-inline-duyuru');
    if (btnAddInlineDuyuru) {
        btnAddInlineDuyuru.addEventListener('click', () => {
            const baslik = (document.getElementById('inline-d-baslik').value || '').trim();
            const icerik = (document.getElementById('inline-d-icerik').value || '').trim();
            const renk = document.getElementById('inline-d-renk').value || 'secondary';

            if (!baslik) return alert("Başlık boş olamaz.");

            if (!appData.duyurular) appData.duyurular = [];

            const now = new Date();
            const dateStr = now.toLocaleDateString('tr-TR') + " " + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            const duyuruObj = {
                baslik: baslik,
                icerik: icerik,
                tarih: dateStr,
                gorsel: "",
                renk: renk,
                oncelik: (renk === 'danger' ? 'acil' : 'normal')
            };

            if (editingDuyuruIndex !== -1) {
                // Güncelleme Modu
                appData.duyurular[editingDuyuruIndex] = duyuruObj;
                editingDuyuruIndex = -1;
                const textAdd = document.getElementById('text-add-inline-duyuru');
                if (textAdd) textAdd.textContent = "Duyuru Ekle";
                const iconAdd = document.getElementById('icon-add-inline-duyuru');
                if (iconAdd) iconAdd.className = "fa-solid fa-plus";
                const btnCancel = document.getElementById('btn-cancel-inline-duyuru');
                if (btnCancel) btnCancel.style.display = "none";
                const editAlert = document.getElementById('duyuru-edit-alert');
                if (editAlert) editAlert.style.display = "none";
            } else {
                // Ekleme Modu
                appData.duyurular.push(duyuruObj);
                if (appData.duyurular.length > 20) {
                    appData.duyurular = appData.duyurular.slice(-20);
                }
            }

            // Temizle
            document.getElementById('inline-d-baslik').value = "";
            document.getElementById('inline-d-icerik').value = "";
            document.getElementById('inline-d-renk').value = "secondary";

            renderDuyurular();
        });
    }

    const btnCancelInlineDuyuru = document.getElementById('btn-cancel-inline-duyuru');
    if (btnCancelInlineDuyuru) {
        btnCancelInlineDuyuru.addEventListener('click', () => {
            editingDuyuruIndex = -1;
            document.getElementById('inline-d-baslik').value = "";
            document.getElementById('inline-d-icerik').value = "";
            document.getElementById('inline-d-renk').value = "secondary";
            const textAdd = document.getElementById('text-add-inline-duyuru');
            if (textAdd) textAdd.textContent = "Duyuru Ekle";
            const iconAdd = document.getElementById('icon-add-inline-duyuru');
            if (iconAdd) iconAdd.className = "fa-solid fa-plus";
            btnCancelInlineDuyuru.style.display = "none";
            const editAlert = document.getElementById('duyuru-edit-alert');
            if (editAlert) editAlert.style.display = "none";
            updateDuyuruLivePreview();
        });
    }

    // Canlı önizleme dinleyicileri
    const inpBaslikEl = document.getElementById('inline-d-baslik');
    if (inpBaslikEl) inpBaslikEl.addEventListener('input', updateDuyuruLivePreview);
    const inpIcerikEl = document.getElementById('inline-d-icerik');
    if (inpIcerikEl) inpIcerikEl.addEventListener('input', updateDuyuruLivePreview);
    const inpRenkEl = document.getElementById('inline-d-renk');
    if (inpRenkEl) inpRenkEl.addEventListener('change', updateDuyuruLivePreview);

    const aramaInputEl = document.getElementById('duyuru-arama-input');
    if (aramaInputEl) aramaInputEl.addEventListener('input', renderDuyurular);

    // ─── SINAV YÖNETİMİ & CANLI ÖNİZLEME (Madde 2.6) ───

    function parseSinavTarihi(dateStr) {
        if (!dateStr) return 0;
        try {
            const clean = String(dateStr).trim().split(' ')[0];
            if (clean.includes('.')) {
                const p = clean.split('.');
                if (p.length === 3) return new Date(`${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`).getTime();
            } else if (clean.includes('-')) {
                const p = clean.split('-');
                if (p.length === 3) return new Date(`${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`).getTime();
            }
        } catch (e) { }
        return 0;
    }

    function getSinavZamanDurumu(tarihStr) {
        const ts = parseSinavTarihi(tarihStr);
        if (!ts) return { text: 'Tarih Belirsiz', cls: 'sinav-status-upcoming', diff: 999 };
        const today = new Date().setHours(0, 0, 0, 0);
        const diff = Math.round((ts - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) {
            return { text: `Geçti (${Math.abs(diff)} gün önce)`, cls: 'sinav-status-past', isPast: true, diff };
        }
        if (diff === 0) {
            return { text: '🔴 BUGÜN!', cls: 'sinav-status-today', isToday: true, diff: 0 };
        }
        if (diff === 1) {
            return { text: '🟠 YARIN!', cls: 'sinav-status-tomorrow', isTomorrow: true, diff: 1 };
        }
        return { text: `⏳ ${diff} gün kaldı`, cls: 'sinav-status-upcoming', diff };
    }

    // Canlı Pano Önizleme Kartı Güncelleyici
    function updateSinavLivePreview() {
        const dersEl = document.getElementById('inline-s-ders');
        const siniflarEl = document.getElementById('inline-s-siniflar');
        const tarihEl = document.getElementById('inline-s-tarih');
        const saatEl = document.getElementById('inline-s-saat');
        const turEl = document.getElementById('inline-s-tur');
        const dersSaatiEl = document.getElementById('inline-s-ders-saati');

        const ders = (dersEl && dersEl.value.trim()) || 'Matematik';
        const siniflar = (siniflarEl && siniflarEl.value.trim()) || '9A, 9B, 10A';
        const rawTarih = (tarihEl && tarihEl.value) || '';
        const saat = (saatEl && saatEl.value) || '10:30';
        const tur = (turEl && turEl.value) || '1. Dönem 1. Ortak Yazılı';
        const dersSaati = (dersSaatiEl && dersSaatiEl.value) || '';

        let gosterimTarih = 'GG.AA.YYYY';
        let gunAdi = '';
        if (rawTarih) {
            try {
                const dObj = new Date(rawTarih);
                if (!isNaN(dObj.getTime())) {
                    gosterimTarih = ("0" + dObj.getDate()).slice(-2) + "." + ("0" + (dObj.getMonth() + 1)).slice(-2) + "." + dObj.getFullYear();
                    gunAdi = dObj.toLocaleDateString('tr-TR', { weekday: 'long' });
                }
            } catch (e) { }
        }

        const prevDers = document.getElementById('prev-sinav-ders');
        if (prevDers) prevDers.textContent = `${ders} Sınavı`;

        const prevTur = document.getElementById('prev-sinav-tur-badge');
        if (prevTur) prevTur.textContent = tur;

        const prevSinif = document.getElementById('prev-sinav-siniflar');
        if (prevSinif) prevSinif.innerHTML = `<b>Sınıflar:</b> ${escapeHtml(siniflar)}`;

        const saatMetni = dersSaati ? `${saat} (${dersSaati})` : saat;
        const prevTarih = document.getElementById('prev-sinav-tarih-saat');
        if (prevTarih) {
            const gunEk = gunAdi ? ` (${gunAdi})` : '';
            prevTarih.innerHTML = `<b>Tarih & Saat:</b> ⏰ ${gosterimTarih} - ${saatMetni}${gunEk}`;
        }

        const prevKalan = document.getElementById('prev-sinav-kalan');
        if (prevKalan) {
            if (rawTarih) {
                const zDurum = getSinavZamanDurumu(gosterimTarih);
                prevKalan.textContent = zDurum.text;
                if (zDurum.isToday) prevKalan.style.color = '#ef4444';
                else if (zDurum.isTomorrow) prevKalan.style.color = '#f59e0b';
                else if (zDurum.isPast) prevKalan.style.color = '#94a3b8';
                else prevKalan.style.color = '#38bdf8';
            } else {
                prevKalan.textContent = '⏳ Tarih seçiniz';
                prevKalan.style.color = '#94a3b8';
            }
        }
    }

    // Hızlı Seçim Yardımcıları
    window.hizliDersSec = function (dersAdi) {
        const el = document.getElementById('inline-s-ders');
        if (el) {
            el.value = dersAdi;
            updateSinavLivePreview();
        }
    };

    window.hizliDersSaatiSec = function (dersSaati, saat) {
        const saatEl = document.getElementById('inline-s-saat');
        const dersSaatiEl = document.getElementById('inline-s-ders-saati');
        if (saatEl) saatEl.value = saat;
        if (dersSaatiEl) dersSaatiEl.value = dersSaati;
        updateSinavLivePreview();
    };

    window.hizliTarihAyarla = function (tip) {
        const tarihEl = document.getElementById('inline-s-tarih');
        if (!tarihEl) return;
        const now = new Date();
        if (tip === 'yarin') {
            now.setDate(now.getDate() + 1);
        }
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        tarihEl.value = `${yyyy}-${mm}-${dd}`;
        updateSinavLivePreview();
    };

    // Hızlı Sınıf Butonları Oluşturucu ve Seçim Toggle
    window.toggleSinifSecimi = function (sinifAdi) {
        const input = document.getElementById('inline-s-siniflar');
        if (!input) return;
        let mevcutlar = input.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const idx = mevcutlar.indexOf(sinifAdi);
        if (idx >= 0) {
            mevcutlar.splice(idx, 1);
        } else {
            mevcutlar.push(sinifAdi);
        }
        input.value = mevcutlar.join(', ');
        renderHizliSinifCipleri();
        updateSinavLivePreview();
    };

    window.topluSinifEkle = function (seviye) {
        const input = document.getElementById('inline-s-siniflar');
        if (!input) return;
        let mevcutlar = input.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const hedefSiniflar = [];

        // appData.sinifListesi varsa oradan seviyeye uyanları al
        const sinifHavuzu = (appData.sinifListesi && appData.sinifListesi.length > 0)
            ? appData.sinifListesi
            : ['9A', '9B', '9C', '10A', '10B', '10C', '11A', '11B', '11C', '12A', '12B', '12C'];

        sinifHavuzu.forEach(s => {
            if (s.startsWith(String(seviye))) {
                hedefSiniflar.push(s);
            }
        });

        // Hepsi zaten seçili mi?
        const hepsiSecili = hedefSiniflar.length > 0 && hedefSiniflar.every(s => mevcutlar.includes(s));
        if (hepsiSecili) {
            mevcutlar = mevcutlar.filter(s => !hedefSiniflar.includes(s));
        } else {
            hedefSiniflar.forEach(s => {
                if (!mevcutlar.includes(s)) mevcutlar.push(s);
            });
        }

        input.value = mevcutlar.join(', ');
        renderHizliSinifCipleri();
        updateSinavLivePreview();
    };

    function renderHizliSinifCipleri() {
        const container = document.getElementById('hizli-sinif-cipleri');
        if (!container) return;

        const input = document.getElementById('inline-s-siniflar');
        const seciliSiniflar = input ? input.value.split(',').map(s => s.trim()) : [];

        let sinifHavuzu = (appData.sinifListesi && appData.sinifListesi.length > 0)
            ? [...appData.sinifListesi]
            : ['9A', '9B', '9C', '10A', '10B', '10C', '11A', '11B', '12A', '12B'];

        let html = '';
        // Grup butonları
        ['9', '10', '11', '12'].forEach(sev => {
            const hasClass = sinifHavuzu.some(s => s.startsWith(sev));
            if (hasClass) {
                html += `<button type="button" class="btn-sinif-chip" style="background: #e0f2fe; border-color: #7dd3fc; color: #0369a1; font-weight: 800;" onclick="topluSinifEkle('${sev}')">Tüm ${sev}'lar</button>`;
            }
        });

        // Bireysel sınıflar
        sinifHavuzu.slice(0, 15).forEach(sinif => {
            const isSel = seciliSiniflar.includes(sinif);
            const activeCls = isSel ? ' active' : '';
            html += `<button type="button" class="btn-sinif-chip${activeCls}" onclick="toggleSinifSecimi('${escapeHtml(sinif)}')">${escapeHtml(sinif)}</button>`;
        });

        container.innerHTML = html;
    }

    // Geçmiş Sınavları Toplu Temizleme
    window.temizleGecmisSinavlar = function () {
        if (!appData.sinavlar || appData.sinavlar.length === 0) {
            return alert("Kayıtlı sınav bulunmuyor.");
        }
        const today = new Date().setHours(0, 0, 0, 0);
        const gecmisler = appData.sinavlar.filter(s => {
            const ts = parseSinavTarihi(s.tarih);
            return ts > 0 && ts < today;
        });

        if (gecmisler.length === 0) {
            return alert("Geçmiş tarihte kalan sınav bulunmuyor. Tüm kayıtlar güncel.");
        }

        if (confirm(`Geçmiş tarihe ait ${gecmisler.length} adet sınav kaydını takvimden silmek istediğinize emin misiniz?`)) {
            appData.sinavlar = appData.sinavlar.filter(s => {
                const ts = parseSinavTarihi(s.tarih);
                return ts === 0 || ts >= today;
            });
            renderSinavlar();
            alert(`${gecmisler.length} adet geçmiş sınav başarıyla temizlendi. Sağ üstteki "💾 Kaydet" butonuna basarak pano verilerinizi güncelleyin.`);
        }
    };

    // Sınav Render
    window.renderSinavlar = function () {
        const list = document.getElementById('sinavlar-listesi');
        if (!list) return;

        const countEl = document.getElementById('sinav-toplam-sayi');
        const toplamSayi = (appData.sinavlar && Array.isArray(appData.sinavlar)) ? appData.sinavlar.length : 0;
        if (countEl) countEl.textContent = `${toplamSayi} Sınav`;

        list.innerHTML = "";
        if (!appData.sinavlar || appData.sinavlar.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 35px 20px; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 14px; margin: 10px 0;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">📝</div>
                    <div style="font-weight: 800; font-size: 1rem; color: #1e293b;">Henüz Sınav Kaydı Eklenmedi</div>
                    <div style="font-size: 0.86rem; color: #64748b; margin-top: 4px;">Yukarıdaki formu kullanarak veya Excel ile içeri aktararak sınav takviminizi oluşturun.</div>
                </div>
            `;
            updateSinavLivePreview();
            renderHizliSinifCipleri();
            return;
        }

        const aramaEl = document.getElementById('sinav-arama-input');
        const aramaFiltresi = (aramaEl && aramaEl.value) ? aramaEl.value.trim().toLowerCase() : '';

        const filtreDurumEl = document.getElementById('sinav-filtre-durum');
        const filtreDurum = (filtreDurumEl && filtreDurumEl.value) ? filtreDurumEl.value : 'all';

        // Sınavları kronolojik olarak sırala: yaklaşan sınavlar en üstte, geçmiş sınavlar altta
        const todayZero = new Date().setHours(0, 0, 0, 0);

        // Her sınava orijinal index ekleyelim ki düzenleme/silme doğru indexe etki etsin
        const indexedSinavlar = appData.sinavlar.map((s, idx) => ({ ...s, _origIndex: idx }));

        const sorted = [...indexedSinavlar].sort((a, b) => {
            const tsA = parseSinavTarihi(a.tarih);
            const tsB = parseSinavTarihi(b.tarih);
            const aGelecek = tsA >= todayZero;
            const bGelecek = tsB >= todayZero;
            if (aGelecek && !bGelecek) return -1;
            if (!aGelecek && bGelecek) return 1;
            if (aGelecek && bGelecek) return tsA - tsB; // En yakın yaklaşan ilk
            return tsB - tsA; // Geçmişlerde en son geçen ilk
        });

        let gorunenSayisi = 0;

        sorted.forEach((s) => {
            const origIndex = s._origIndex;
            const zDurum = getSinavZamanDurumu(s.tarih);

            // Filtreleme
            if (filtreDurum === 'upcoming' && zDurum.isPast) return;
            if (filtreDurum === 'today' && !zDurum.isToday) return;
            if (filtreDurum === 'past' && !zDurum.isPast) return;

            if (aramaFiltresi) {
                const d = (s.ders || '').toLowerCase();
                const sin = (s.siniflar || '').toLowerCase();
                const tur = (s.tur || '').toLowerCase();
                if (!d.includes(aramaFiltresi) && !sin.includes(aramaFiltresi) && !tur.includes(aramaFiltresi)) {
                    return;
                }
            }
            gorunenSayisi++;

            const turBadge = s.tur ? `<span style="background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.3); font-size: 0.74rem; font-weight: 700; padding: 2px 7px; border-radius: 5px;">${escapeHtml(s.tur)}</span>` : '';
            const saatMetni = s.dersSaati ? `${escapeHtml(s.saat || '')} (${escapeHtml(s.dersSaati)})` : escapeHtml(s.saat || '');

            list.innerHTML += `
                <div class="list-item" style="border: 1px solid #e2e8f0; border-left: 5px solid #3b82f6; background: #ffffff; margin-bottom: 12px; border-radius: 12px; padding: 14px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                    <div class="list-item-content">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                            <h4 style="margin: 0; color: #0f172a; font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                                <span>📝</span>
                                <span>${escapeHtml(s.ders)} Sınavı</span>
                                ${turBadge}
                            </h4>
                            <span class="sinav-status-badge ${zDurum.cls}">
                                ${zDurum.text}
                            </span>
                        </div>
                        <p style="margin: 0 0 8px 0; color: #334155; font-size: 0.9rem; line-height: 1.5;">
                            <strong>👥 Sınıflar:</strong> <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 5px; font-weight: 700; color: #0369a1;">${escapeHtml(s.siniflar || 'Tüm Sınıflar')}</span>
                        </p>
                        <div style="display: flex; align-items: center; gap: 14px; font-size: 0.82rem; color: #64748b; flex-wrap: wrap;">
                            <span><i class="fa-regular fa-calendar"></i> <strong>${escapeHtml(s.tarih || '')}</strong></span>
                            <span><i class="fa-regular fa-clock"></i> <strong>${saatMetni}</strong></span>
                        </div>
                    </div>
                    <div class="list-item-actions" style="margin-left: 15px; display: flex; gap: 6px;">
                        <button type="button" class="btn-icon" onclick="editSinav(${origIndex})" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="btn-icon danger" onclick="deleteSinav(${origIndex})" title="Sil"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });

        if (gorunenSayisi === 0 && (aramaFiltresi || filtreDurum !== 'all')) {
            list.innerHTML = `
                <div style="text-align: center; padding: 25px; background: #f8fafc; border-radius: 10px; color: #64748b; font-size: 0.9rem;">
                    🔍 Seçilen filtreye uygun sınav kaydı bulunamadı.
                </div>
            `;
        }

        updateSinavLivePreview();
        renderHizliSinifCipleri();
    };

    let editingSinavIndex = -1;

    window.editSinav = (index) => {
        editingSinavIndex = index;
        const s = appData.sinavlar[index];
        const dersEl = document.getElementById('inline-s-ders');
        const siniflarEl = document.getElementById('inline-s-siniflar');
        const tarihEl = document.getElementById('inline-s-tarih');
        const saatEl = document.getElementById('inline-s-saat');
        const turEl = document.getElementById('inline-s-tur');
        const dersSaatiEl = document.getElementById('inline-s-ders-saati');

        if (dersEl) dersEl.value = s.ders || "";
        if (siniflarEl) siniflarEl.value = s.siniflar || "";
        if (turEl && s.tur) turEl.value = s.tur;
        if (dersSaatiEl) dersSaatiEl.value = s.dersSaati || "";

        // Tarih formatı dönüşümü (DD.MM.YYYY -> YYYY-MM-DD if needed, HTML5 date input requires YYYY-MM-DD)
        let dateVal = s.tarih || "";
        if (dateVal.includes('.')) {
            const parts = dateVal.split('.');
            if (parts.length === 3) dateVal = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (tarihEl) tarihEl.value = dateVal;
        if (saatEl) saatEl.value = s.saat || "";

        const textAdd = document.getElementById('text-add-inline-sinav');
        if (textAdd) textAdd.textContent = "Sınavı Güncelle";
        const iconAdd = document.getElementById('icon-add-inline-sinav');
        if (iconAdd) iconAdd.className = "fa-solid fa-check";

        const cancelBtn = document.getElementById('btn-cancel-inline-sinav');
        if (cancelBtn) cancelBtn.style.display = "inline-flex";

        const editAlert = document.getElementById('sinav-edit-alert');
        if (editAlert) editAlert.style.display = "flex";

        updateSinavLivePreview();
        renderHizliSinifCipleri();
        if (dersEl) dersEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.deleteSinav = (index) => {
        if (confirm("Bu sınav tarihini silmek istediğinize emin misiniz?")) {
            appData.sinavlar.splice(index, 1);
            if (editingSinavIndex === index) {
                const cancelBtn = document.getElementById('btn-cancel-inline-sinav');
                if (cancelBtn) cancelBtn.click();
            }
            renderSinavlar();
        }
    };

    const btnAddInlineSinav = document.getElementById('btn-add-inline-sinav');
    if (btnAddInlineSinav) {
        btnAddInlineSinav.addEventListener('click', () => {
            const ders = (document.getElementById('inline-s-ders').value || '').trim();
            const siniflar = (document.getElementById('inline-s-siniflar').value || '').trim();
            let tarih = (document.getElementById('inline-s-tarih').value || '').trim();
            const saat = (document.getElementById('inline-s-saat').value || '').trim();
            const turEl = document.getElementById('inline-s-tur');
            const tur = turEl ? turEl.value : '1. Dönem 1. Ortak Yazılı';
            const dersSaatiEl = document.getElementById('inline-s-ders-saati');
            const dersSaati = dersSaatiEl ? dersSaatiEl.value : '';

            if (!ders || !tarih) return alert("Ders adı ve Tarih zorunludur.");

            // HTML5 Date'den DD.MM.YYYY formatına
            if (tarih.includes('-')) {
                const parts = tarih.split('-');
                if (parts.length === 3) tarih = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }

            if (!appData.sinavlar) appData.sinavlar = [];

            const sinavObj = {
                ders: ders,
                siniflar: siniflar,
                tarih: tarih,
                saat: saat,
                tur: tur,
                dersSaati: dersSaati
            };

            if (editingSinavIndex !== -1) {
                appData.sinavlar[editingSinavIndex] = sinavObj;
                editingSinavIndex = -1;
                const textAdd = document.getElementById('text-add-inline-sinav');
                if (textAdd) textAdd.textContent = "Sınavı Takvime Ekle";
                const iconAdd = document.getElementById('icon-add-inline-sinav');
                if (iconAdd) iconAdd.className = "fa-solid fa-plus";
                const cancelBtn = document.getElementById('btn-cancel-inline-sinav');
                if (cancelBtn) cancelBtn.style.display = "none";
                const editAlert = document.getElementById('sinav-edit-alert');
                if (editAlert) editAlert.style.display = "none";
            } else {
                appData.sinavlar.push(sinavObj);
            }

            document.getElementById('inline-s-ders').value = "";
            document.getElementById('inline-s-siniflar').value = "";
            document.getElementById('inline-s-tarih').value = "";
            document.getElementById('inline-s-saat').value = "";
            if (dersSaatiEl) dersSaatiEl.value = "";

            renderSinavlar();
        });
    }

    const btnCancelInlineSinav = document.getElementById('btn-cancel-inline-sinav');
    if (btnCancelInlineSinav) {
        btnCancelInlineSinav.addEventListener('click', () => {
            editingSinavIndex = -1;
            document.getElementById('inline-s-ders').value = "";
            document.getElementById('inline-s-siniflar').value = "";
            document.getElementById('inline-s-tarih').value = "";
            document.getElementById('inline-s-saat').value = "";
            const dersSaatiEl = document.getElementById('inline-s-ders-saati');
            if (dersSaatiEl) dersSaatiEl.value = "";
            const textAdd = document.getElementById('text-add-inline-sinav');
            if (textAdd) textAdd.textContent = "Sınavı Takvime Ekle";
            const iconAdd = document.getElementById('icon-add-inline-sinav');
            if (iconAdd) iconAdd.className = "fa-solid fa-plus";
            btnCancelInlineSinav.style.display = "none";
            const editAlert = document.getElementById('sinav-edit-alert');
            if (editAlert) editAlert.style.display = "none";
            updateSinavLivePreview();
            renderHizliSinifCipleri();
        });
    }

    // Sınav canlı önizleme dinleyicileri
    const inpSDersEl = document.getElementById('inline-s-ders');
    if (inpSDersEl) inpSDersEl.addEventListener('input', updateSinavLivePreview);
    const inpSSiniflarEl = document.getElementById('inline-s-siniflar');
    if (inpSSiniflarEl) {
        inpSSiniflarEl.addEventListener('input', () => {
            updateSinavLivePreview();
            renderHizliSinifCipleri();
        });
    }
    const inpSTarihEl = document.getElementById('inline-s-tarih');
    if (inpSTarihEl) inpSTarihEl.addEventListener('input', updateSinavLivePreview);
    const inpSSaatEl = document.getElementById('inline-s-saat');
    if (inpSSaatEl) inpSSaatEl.addEventListener('input', updateSinavLivePreview);
    const inpSTurEl = document.getElementById('inline-s-tur');
    if (inpSTurEl) inpSTurEl.addEventListener('change', updateSinavLivePreview);

    const sinavAramaEl = document.getElementById('sinav-arama-input');
    if (sinavAramaEl) sinavAramaEl.addEventListener('input', renderSinavlar);
    const sinavFiltreDurumEl = document.getElementById('sinav-filtre-durum');
    if (sinavFiltreDurumEl) sinavFiltreDurumEl.addEventListener('change', renderSinavlar);

    // Dersler Render


    // -------------------------------------------------------------
    // ÖĞRETMEN & BRANŞ YÖNETİMİ GELİŞMİŞ SİSTEMİ
    // -------------------------------------------------------------
    let activeOgretmenBransFilter = '__all__';
    let activeOgretmenSearchQuery = '';

    window.getTeacherWeeklyLessonCount = function (teacherName) {
        if (!appData.dersProgramiDetay || !teacherName) return 0;
        let count = 0;
        const tTrim = teacherName.trim().toLowerCase();
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            if (!gunlerObj || typeof gunlerObj !== 'object') continue;
            for (const [gun, derslerObj] of Object.entries(gunlerObj)) {
                if (!derslerObj || typeof derslerObj !== 'object') continue;
                for (const [saatIdx, item] of Object.entries(derslerObj)) {
                    if (item && item.type === 'ders' && item.ogretmen && item.ogretmen.trim().toLowerCase() === tTrim) {
                        count++;
                    }
                }
            }
        }
        return count;
    };

    window.getTeacherInitials = function (teacherName) {
        if (!teacherName) return '??';
        const parts = teacherName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    window.renderOgretmenTable = function () {
        const tbody = document.getElementById('ogretmen-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!appData.bransListesi) appData.bransListesi = [];
        const ogretmenBranslar = appData.ogretmenBranslar || [];

        // Mevcut atamalardan branş listesini senkronize et
        ogretmenBranslar.forEach(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                const brans = parts[1].trim();
                if (brans && !appData.bransListesi.includes(brans)) {
                    appData.bransListesi.push(brans);
                }
            }
        });
        if (appData.bransListesi.length === 0) {
            appData.bransListesi = [
                'Beden Eğitimi', 'Bilişim Teknolojileri', 'Biyoloji', 'Coğrafya', 'Din Kültürü ve Ahlak Bilgisi',
                'Felsefe', 'Fizik', 'Görsel Sanatlar', 'İngilizce', 'Kimya', 'Matematik', 'Müzik',
                'Tarih', 'Türk Dili ve Edebiyatı'
            ];
        }

        // Alfabetik Türkçe Sıralama
        appData.bransListesi.sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));

        // Hızlı Ekleme ve Modal Branş Seçicilerini Doldur
        const selYeni = document.getElementById('sel-yeni-ogretmen-brans');
        if (selYeni) {
            const curVal = selYeni.value;
            selYeni.innerHTML = '<option value="">Branş Seçin...</option>';
            appData.bransListesi.forEach(b => {
                selYeni.innerHTML += `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`;
            });
            if (curVal) selYeni.value = curVal;
        }

        const selToplu = document.getElementById('sel-toplu-varsayilan-brans');
        if (selToplu) {
            const curVal = selToplu.value;
            selToplu.innerHTML = '<option value="">(Belirtilmemişse boş bırak)</option>';
            appData.bransListesi.forEach(b => {
                selToplu.innerHTML += `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`;
            });
            if (curVal) selToplu.value = curVal;
        }

        const selEdit = document.getElementById('sel-edit-ogretmen-brans');
        if (selEdit) {
            selEdit.innerHTML = '<option value="">(Branş Yok / Seçilmedi)</option>';
            appData.bransListesi.forEach(b => {
                selEdit.innerHTML += `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`;
            });
        }

        renderBransModalListesi();

        let allTeachers = [...(appData.tumOgretmenler || [])];
        const nobetciGunluk = appData.nobetciGunluk || {};
        const sinifRehberlik = appData.sinifRehberlik || {};

        // İstatistiklerin Hesaplanması
        const totalCount = allTeachers.length;
        let bransliCount = 0;
        let rehberCount = 0;
        const bransCounts = {};

        allTeachers.forEach(t => {
            const assignment = ogretmenBranslar.find(item => item.startsWith(t + ' :'));
            if (assignment && assignment.split(':')[1]?.trim()) {
                bransliCount++;
                const b = assignment.split(':')[1].trim();
                bransCounts[b] = (bransCounts[b] || 0) + 1;
            }
            for (const [sinif, hoca] of Object.entries(sinifRehberlik)) {
                if (hoca === t) {
                    rehberCount++;
                    break;
                }
            }
        });

        const branssizCount = totalCount - bransliCount;

        // İstatistik Kartlarını Güncelle
        const elStatToplam = document.getElementById('stat-ogretmen-toplam');
        if (elStatToplam) elStatToplam.textContent = totalCount;
        const elStatBransli = document.getElementById('stat-ogretmen-bransli');
        if (elStatBransli) {
            const pct = totalCount > 0 ? Math.round((bransliCount / totalCount) * 100) : 0;
            elStatBransli.textContent = `${bransliCount} (%${pct})`;
        }
        const elStatBranssiz = document.getElementById('stat-ogretmen-branssiz');
        if (elStatBranssiz) elStatBranssiz.textContent = branssizCount;
        const elStatRehber = document.getElementById('stat-ogretmen-rehber');
        if (elStatRehber) elStatRehber.textContent = rehberCount;
        const elStatBranslar = document.getElementById('stat-ogretmen-branslar');
        if (elStatBranslar) elStatBranslar.textContent = appData.bransListesi.length;

        // Filtre Çiplerini Render Et
        renderOgretmenBransChips(totalCount, bransCounts, branssizCount, rehberCount);

        // Doğal Türkçe Sıralama
        allTeachers.sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));

        // Arama ve Filtreleme
        const filteredTeachers = allTeachers.filter(t => {
            const assignment = ogretmenBranslar.find(item => item.startsWith(t + ' :'));
            const currentBrans = assignment ? assignment.split(':')[1].trim() : '';

            let rehberSinif = '';
            for (const [sinif, hoca] of Object.entries(sinifRehberlik)) {
                if (hoca === t) {
                    rehberSinif = sinif;
                    break;
                }
            }

            // Branş filtresi
            if (activeOgretmenBransFilter === '__branssiz__') {
                if (currentBrans) return false;
            } else if (activeOgretmenBransFilter === '__rehber__') {
                if (!rehberSinif) return false;
            } else if (activeOgretmenBransFilter === '__nobet__') {
                let hasNobet = false;
                for (const [gun, liste] of Object.entries(nobetciGunluk)) {
                    if (liste.some(kayit => kayit.startsWith(t + ' (') && !kayit.includes('(Diğer)') && !kayit.includes('(İzinli)') && !kayit.includes('(Ders Tamamlama)'))) {
                        hasNobet = true;
                        break;
                    }
                }
                if (!hasNobet) return false;
            } else if (activeOgretmenBransFilter !== '__all__') {
                if (currentBrans !== activeOgretmenBransFilter) return false;
            }

            // Arama sorgusu
            if (activeOgretmenSearchQuery) {
                const q = activeOgretmenSearchQuery.toLowerCase();
                const matchName = t.toLowerCase().includes(q);
                const matchBrans = currentBrans.toLowerCase().includes(q);
                const matchRehber = rehberSinif.toLowerCase().includes(q);
                if (!matchName && !matchBrans && !matchRehber) return false;
            }

            return true;
        });

        if (filteredTeachers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
                        <i class="fa-solid fa-user-slash" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                        <span style="font-weight: 600; font-size: 0.95rem;">Eşleşen öğretmen bulunamadı.</span>
                        <div style="font-size: 0.82rem; margin-top: 4px; color: var(--text-muted);">Arama metnini değiştirebilir veya filtre çiplerinden "Tümü" seçeneğine tıklayabilirsiniz.</div>
                    </td>
                </tr>
            `;
            return;
        }

        filteredTeachers.forEach(t => {
            const assignment = ogretmenBranslar.find(item => item.startsWith(t + ' :'));
            const currentBrans = assignment ? assignment.split(':')[1].trim() : '';

            // Rehberlik Bul
            let rehberSinif = "-";
            for (const [sinif, hoca] of Object.entries(sinifRehberlik)) {
                if (hoca === t) {
                    rehberSinif = sinif;
                    break;
                }
            }

            // Nöbet Günlerini Bul
            let nobetGunleri = [];
            for (const [gun, liste] of Object.entries(nobetciGunluk)) {
                const found = liste.find(kayit => kayit.startsWith(t + ' (') && !kayit.includes('(Diğer)') && !kayit.includes('(İzinli)') && !kayit.includes('(Ders Tamamlama)'));
                if (found) {
                    let alanAdi = '';
                    const m = found.match(/\((.*?)\)/);
                    if (m) alanAdi = m[1];
                    nobetGunleri.push({ gun, alan: alanAdi });
                }
            }

            let nobetBadge = nobetGunleri.length > 0
                ? nobetGunleri.map(nb => `<span style="background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.25); padding: 2px 7px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; margin-right: 4px; display: inline-flex; align-items: center; gap: 3px;" title="${escapeHtml(nb.alan)}">🛡️ ${escapeHtml(nb.gun)}</span>`).join('')
                : '<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>';

            // Haftalık Ders Saati
            const dersSaati = getTeacherWeeklyLessonCount(t);
            const dersBadge = dersSaati > 0
                ? `<span class="ders-yuku-badge active-hours">📚 ${dersSaati} Saat</span>`
                : `<span class="ders-yuku-badge">0 Saat</span>`;

            // Rehberlik Badge
            const rehberBadge = rehberSinif !== '-'
                ? `<span style="background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.25); padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">🎓 ${escapeHtml(rehberSinif)}</span>`
                : '<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>';

            // Branş Seçenekleri
            let bransOptions = '<option value="">(Branş Seçin)</option>';
            appData.bransListesi.forEach(b => {
                const selected = b === currentBrans ? 'selected' : '';
                bransOptions += `<option value="${escapeHtml(b)}" ${selected}>${escapeHtml(b)}</option>`;
            });

            const initials = getTeacherInitials(t);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="ogretmen-avatar">${initials}</div>
                        <div>
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${escapeHtml(t)}</div>
                            ${currentBrans ? `<span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(currentBrans)}</span>` : '<span style="font-size: 0.75rem; color: #dc2626; font-weight: 600;">⚠️ Branş Yok</span>'}
                        </div>
                    </div>
                </td>
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;">
                    <select class="form-control form-sm" onchange="updateTeacherBrans('${escapeJsAttr(t)}', this.value)" style="max-width: 200px; background: #ffffff;">
                        ${bransOptions}
                    </select>
                </td>
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;">
                    ${rehberBadge}
                </td>
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;">
                    ${nobetBadge}
                </td>
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;">
                    ${dersBadge}
                </td>
                <td style="padding: 10px 16px; border-bottom: 1px solid var(--sidebar-border); text-align: right; vertical-align: middle;">
                    <div style="display: inline-flex; gap: 5px; justify-content: flex-end;">
                        <button type="button" class="btn-secondary btn-sm" onclick="gitOgretmenProgramina('${escapeJsAttr(t)}')" title="Haftalık Ders Programını Gör" style="padding: 4px 8px; font-size: 0.8rem; font-weight: 600;">
                            <i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> Program
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="openEditOgretmenModal('${escapeJsAttr(t)}')" title="Bilgileri Düzenle" style="padding: 4px 8px; font-size: 0.8rem;">
                            <i class="fa-solid fa-pen-to-square" style="color: #6366f1;"></i>
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="deleteTeacher('${escapeJsAttr(t)}')" title="Kadroden Sil" style="padding: 4px 8px; font-size: 0.8rem; background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    function renderOgretmenBransChips(totalCount, bransCounts, branssizCount, rehberCount) {
        const container = document.getElementById('ogretmen-brans-chips');
        if (!container) return;

        // Sırala: En çok öğretmeni olan branşlar önce
        const sortedBranslar = Object.entries(bransCounts).sort((a, b) => b[1] - a[1]);

        let chipsHtml = `
            <button type="button" class="btn-ogretmen-filter ${activeOgretmenBransFilter === '__all__' ? 'active' : ''}" onclick="setOgretmenBransFiltresi('__all__')">
                Tümü (${totalCount})
            </button>
        `;

        sortedBranslar.forEach(([b, cnt]) => {
            const isActive = activeOgretmenBransFilter === b;
            chipsHtml += `
                <button type="button" class="btn-ogretmen-filter ${isActive ? 'active' : ''}" onclick="setOgretmenBransFiltresi('${escapeJsAttr(b)}')">
                    ${escapeHtml(b)} (${cnt})
                </button>
            `;
        });

        if (branssizCount > 0) {
            const isActive = activeOgretmenBransFilter === '__branssiz__';
            chipsHtml += `
                <button type="button" class="btn-ogretmen-filter ${isActive ? 'active' : ''}" onclick="setOgretmenBransFiltresi('__branssiz__')" style="border-color: #f59e0b; color: #d97706;">
                    ⚠️ Branşsızlar (${branssizCount})
                </button>
            `;
        }

        chipsHtml += `
            <button type="button" class="btn-ogretmen-filter ${activeOgretmenBransFilter === '__rehber__' ? 'active' : ''}" onclick="setOgretmenBransFiltresi('__rehber__')">
                🎓 Rehber Öğretmenler (${rehberCount})
            </button>
            <button type="button" class="btn-ogretmen-filter ${activeOgretmenBransFilter === '__nobet__' ? 'active' : ''}" onclick="setOgretmenBransFiltresi('__nobet__')">
                🛡️ Nöbetçiler
            </button>
        `;

        container.innerHTML = chipsHtml;
    }

    window.setOgretmenBransFiltresi = function (brans) {
        activeOgretmenBransFilter = brans;
        renderOgretmenTable();
    };

    window.filterOgretmenler = function () {
        const inp = document.getElementById('inp-search-ogretmen');
        activeOgretmenSearchQuery = inp ? inp.value.trim() : '';
        renderOgretmenTable();
    };

    window.updateTeacherBrans = function (teacherName, newBrans) {
        let ogretmenBranslar = appData.ogretmenBranslar || [];
        ogretmenBranslar = ogretmenBranslar.filter(item => !item.startsWith(teacherName + ' :'));
        if (newBrans) {
            ogretmenBranslar.push(teacherName + ' : ' + newBrans);
        }
        appData.ogretmenBranslar = ogretmenBranslar;
        saveData();
        renderOgretmenTable();
        if (typeof renderDersler === 'function') renderDersler();
        BhUI.toast(teacherName + ' branşı güncellendi.', 'success');
    };

    window.deleteTeacher = function (teacherName) {
        if (confirm(teacherName + ' isimli öğretmeni silmek istediğinize emin misiniz?')) {
            appData.tumOgretmenler = (appData.tumOgretmenler || []).filter(t => t !== teacherName);
            appData.ogretmenBranslar = (appData.ogretmenBranslar || []).filter(item => !item.startsWith(teacherName + ' :'));
            saveData();
            renderOgretmenTable();
            if (typeof renderDersler === 'function') renderDersler();
            if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
            if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
            BhUI.toast(teacherName + ' kadrodan silindi.', 'success');
        }
    };

    // Cascade İsim Güncelleme
    window.renameTeacher = function (oldName, newName) {
        if (!oldName || !newName || oldName === newName) return;

        // 1. tumOgretmenler
        if (Array.isArray(appData.tumOgretmenler)) {
            appData.tumOgretmenler = appData.tumOgretmenler.map(t => t === oldName ? newName : t);
        }

        // 2. ogretmenBranslar
        if (Array.isArray(appData.ogretmenBranslar)) {
            appData.ogretmenBranslar = appData.ogretmenBranslar.map(item => {
                if (item.startsWith(oldName + ' :')) {
                    return item.replace(oldName + ' :', newName + ' :');
                }
                return item;
            });
        }

        // 3. sinifRehberlik
        if (appData.sinifRehberlik && typeof appData.sinifRehberlik === 'object') {
            for (const [sinif, hoca] of Object.entries(appData.sinifRehberlik)) {
                if (hoca === oldName) {
                    appData.sinifRehberlik[sinif] = newName;
                }
            }
        }

        // 4. nobetciGunluk
        if (appData.nobetciGunluk && typeof appData.nobetciGunluk === 'object') {
            for (const [gun, liste] of Object.entries(appData.nobetciGunluk)) {
                if (Array.isArray(liste)) {
                    appData.nobetciGunluk[gun] = liste.map(kayit => {
                        if (kayit.startsWith(oldName + ' (')) {
                            return newName + kayit.substring(oldName.length);
                        }
                        return kayit;
                    });
                }
            }
        }

        // 5. dersProgramiDetay
        if (appData.dersProgramiDetay && typeof appData.dersProgramiDetay === 'object') {
            for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
                if (gunlerObj && typeof gunlerObj === 'object') {
                    for (const [gun, derslerObj] of Object.entries(gunlerObj)) {
                        if (derslerObj && typeof derslerObj === 'object') {
                            for (const [saatIdx, item] of Object.entries(derslerObj)) {
                                if (item && item.ogretmen === oldName) {
                                    item.ogretmen = newName;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    // --- ÖĞRETMEN DÜZENLEME MODALI ---
    window.openEditOgretmenModal = function (teacherName) {
        const modal = document.getElementById('modal-edit-ogretmen');
        const inpOld = document.getElementById('inp-edit-ogretmen-old-ad');
        const inpAd = document.getElementById('inp-edit-ogretmen-ad');
        const selBrans = document.getElementById('sel-edit-ogretmen-brans');

        if (!modal || !inpOld || !inpAd) return;

        inpOld.value = teacherName;
        inpAd.value = teacherName;

        const assignment = (appData.ogretmenBranslar || []).find(item => item.startsWith(teacherName + ' :'));
        const currentBrans = assignment ? assignment.split(':')[1].trim() : '';

        if (selBrans) {
            selBrans.innerHTML = '<option value="">(Branş Yok / Seçilmedi)</option>';
            (appData.bransListesi || []).forEach(b => {
                const sel = b === currentBrans ? 'selected' : '';
                selBrans.innerHTML += `<option value="${escapeHtml(b)}" ${sel}>${escapeHtml(b)}</option>`;
            });
        }

        modal.style.display = 'flex';
        inpAd.focus();
    };

    window.closeEditOgretmenModal = function () {
        const modal = document.getElementById('modal-edit-ogretmen');
        if (modal) modal.style.display = 'none';
    };

    window.kaydetEditOgretmen = function () {
        const oldName = document.getElementById('inp-edit-ogretmen-old-ad')?.value.trim();
        const newName = document.getElementById('inp-edit-ogretmen-ad')?.value.trim();
        const newBrans = document.getElementById('sel-edit-ogretmen-brans')?.value.trim();

        if (!newName) {
            BhUI.toast('Lütfen öğretmen adını girin.', 'warning');
            return;
        }

        if (newName !== oldName) {
            if ((appData.tumOgretmenler || []).includes(newName)) {
                BhUI.toast('Bu isimde başka bir öğretmen zaten kayıtlı!', 'warning');
                return;
            }
            renameTeacher(oldName, newName);
        }

        // Branşı güncelle
        let ogretmenBranslar = appData.ogretmenBranslar || [];
        ogretmenBranslar = ogretmenBranslar.filter(item => !item.startsWith(newName + ' :'));
        if (newBrans) {
            ogretmenBranslar.push(newName + ' : ' + newBrans);
        }
        appData.ogretmenBranslar = ogretmenBranslar;

        saveData();
        renderOgretmenTable();
        if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
        if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();

        closeEditOgretmenModal();
        BhUI.toast('Öğretmen bilgileri başarıyla güncellendi.', 'success');
    };

    // --- TOPLU ÖĞRETMEN SİHİRBAZI ---
    window.openTopluOgretmenModal = function () {
        const modal = document.getElementById('modal-toplu-ogretmen');
        if (modal) {
            modal.style.display = 'flex';
            const txt = document.getElementById('txt-toplu-ogretmen');
            if (txt) {
                txt.focus();
                updateTopluOgretmenPreview();
            }
        }
    };

    window.closeTopluOgretmenModal = function () {
        const modal = document.getElementById('modal-toplu-ogretmen');
        if (modal) modal.style.display = 'none';
    };

    window.updateTopluOgretmenPreview = function () {
        const txt = document.getElementById('txt-toplu-ogretmen');
        const preview = document.getElementById('toplu-ogretmen-preview-text');
        if (!txt || !preview) return;

        const lines = txt.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let bransli = 0;
        let branssiz = 0;

        lines.forEach(line => {
            const hasDelim = line.includes('-') || line.includes(':') || line.includes(',') || line.includes('\t');
            if (hasDelim) bransli++;
            else branssiz++;
        });

        preview.innerHTML = `<strong>${lines.length}</strong> öğretmen satırı (${bransli} branşlı, ${branssiz} sade isim).`;
    };

    window.kaydetTopluOgretmenler = function () {
        const txt = document.getElementById('txt-toplu-ogretmen');
        const selDefault = document.getElementById('sel-toplu-varsayilan-brans');
        const defaultBrans = selDefault ? selDefault.value.trim() : '';

        if (!txt || !txt.value.trim()) {
            BhUI.toast('Lütfen eklenecek öğretmen listesini yapıştırın.', 'warning');
            return;
        }

        const lines = txt.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) {
            BhUI.toast('Geçerli bir öğretmen kaydı bulunamadı.', 'warning');
            return;
        }

        if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
        if (!appData.ogretmenBranslar) appData.ogretmenBranslar = [];
        if (!appData.bransListesi) appData.bransListesi = [];

        let addedCount = 0;
        let bransCount = 0;

        lines.forEach(line => {
            let hocaAdi = '';
            let brans = '';

            let delim = null;
            if (line.includes('\t')) delim = '\t';
            else if (line.includes(' - ')) delim = ' - ';
            else if (line.includes(':')) delim = ':';
            else if (line.includes('-')) delim = '-';
            else if (line.includes(',')) delim = ',';

            if (delim) {
                const parts = line.split(delim);
                hocaAdi = parts[0].trim();
                brans = parts.slice(1).join(delim).trim();
            } else {
                hocaAdi = line.trim();
                brans = defaultBrans;
            }

            if (hocaAdi.length < 2) return;

            if (!appData.tumOgretmenler.includes(hocaAdi)) {
                appData.tumOgretmenler.push(hocaAdi);
                addedCount++;
            }

            if (brans) {
                if (!appData.bransListesi.includes(brans)) {
                    appData.bransListesi.push(brans);
                }
                appData.ogretmenBranslar = appData.ogretmenBranslar.filter(item => !item.startsWith(hocaAdi + ' :'));
                appData.ogretmenBranslar.push(hocaAdi + ' : ' + brans);
                bransCount++;
            }
        });

        saveData();
        renderOgretmenTable();
        if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
        if (typeof renderSiniflarTable === 'function') renderSiniflarTable();

        txt.value = '';
        closeTopluOgretmenModal();
        BhUI.toast(`${addedCount} yeni öğretmen kadroya eklendi, ${bransCount} branş tanımlandı.`, 'success');
    };

    // --- BRANŞ YÖNETİMİ MODALI ---
    window.openBransYonetimModal = function () {
        const modal = document.getElementById('modal-brans-yonetim');
        if (modal) {
            modal.style.display = 'flex';
            renderBransModalListesi();
        }
    };

    window.closeBransYonetimModal = function () {
        const modal = document.getElementById('modal-brans-yonetim');
        if (modal) modal.style.display = 'none';
    };

    function renderBransModalListesi() {
        const list = document.getElementById('brans-modal-listesi');
        if (!list) return;

        const branslar = appData.bransListesi || [];
        if (branslar.length === 0) {
            list.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Henüz kayıtlı branş bulunmuyor.</div>';
            return;
        }

        let html = '';
        branslar.forEach(b => {
            // Kaç öğretmende var
            const count = (appData.ogretmenBranslar || []).filter(item => {
                const parts = item.split(':');
                return parts[1] && parts[1].trim() === b;
            }).length;

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${escapeHtml(b)}</span>
                        <span style="font-size: 0.76rem; color: var(--text-muted); background: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px;">${count} Öğretmen</span>
                    </div>
                    <button type="button" class="btn-secondary btn-sm" onclick="silBrans('${escapeJsAttr(b)}')" style="padding: 2px 7px; color: #ef4444; border-color: #fca5a5; background: #fef2f2;" title="Branşı Sil">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    window.ekleYeniBransModal = function () {
        const inp = document.getElementById('inp-yeni-brans-modal');
        const val = inp ? inp.value.trim() : '';
        if (!val) {
            BhUI.toast('Lütfen bir branş adı yazın.', 'warning');
            return;
        }

        if (!appData.bransListesi) appData.bransListesi = [];
        if (appData.bransListesi.includes(val)) {
            BhUI.toast('Bu branş zaten kayıtlı!', 'warning');
            return;
        }

        appData.bransListesi.push(val);
        appData.bransListesi.sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));
        saveData();
        renderBransModalListesi();
        renderOgretmenTable();
        inp.value = '';
        BhUI.toast(val + ' branşı eklendi.', 'success');
    };

    window.silBrans = function (bransAdi) {
        if (!bransAdi) return;
        if (confirm(`"${bransAdi}" branşını silmek istediğinize emin misiniz? Bu branşa sahip öğretmenlerin branş bilgisi sıfırlanacaktır.`)) {
            appData.bransListesi = (appData.bransListesi || []).filter(b => b !== bransAdi);
            appData.ogretmenBranslar = (appData.ogretmenBranslar || []).filter(item => {
                const b = item.split(':')[1];
                return b && b.trim() !== bransAdi;
            });
            saveData();
            renderBransModalListesi();
            renderOgretmenTable();
            BhUI.toast(bransAdi + ' branşı silindi.', 'success');
        }
    };

    // --- EXCEL ENTEGRASYONU: ÖĞRETMEN KADROSU ---
    window.exportExcelOgretmenler = function () {
        if (typeof XLSX === 'undefined') {
            BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi. İnternet bağlantınızı kontrol edin.', 'error');
            return;
        }

        const allTeachers = [...(appData.tumOgretmenler || [])];
        if (allTeachers.length === 0) {
            BhUI.toast('Dışa aktarılacak öğretmen kaydı bulunamadı.', 'warning');
            return;
        }

        allTeachers.sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));

        const ogretmenBranslar = appData.ogretmenBranslar || [];
        const sinifRehberlik = appData.sinifRehberlik || {};
        const nobetciGunluk = appData.nobetciGunluk || {};

        const okulAdi = (appData.okulAdi || 'Okul') + ' ' + (appData.okulTuru || '');
        const bugun = new Date().toLocaleDateString('tr-TR');

        const ws_data = [
            [okulAdi],
            ['ÖĞRETMEN KADROSU, BRANŞ VE DERS YÜKÜ LİSTESİ'],
            [`Rapor Tarihi: ${bugun}`],
            [],
            ['Sıra No', 'Öğretmen Adı Soyadı', 'Branşı', 'Sınıf Rehberliği', 'Nöbet Günleri & Alanı', 'Haftalık Ders Saati']
        ];

        allTeachers.forEach((t, i) => {
            const assignment = ogretmenBranslar.find(item => item.startsWith(t + ' :'));
            const brans = assignment ? assignment.split(':')[1].trim() : '-';

            let rehberSinif = '-';
            for (const [sinif, hoca] of Object.entries(sinifRehberlik)) {
                if (hoca === t) {
                    rehberSinif = sinif;
                    break;
                }
            }

            let nobetler = [];
            for (const [gun, liste] of Object.entries(nobetciGunluk)) {
                const found = liste.find(kayit => kayit.startsWith(t + ' (') && !kayit.includes('(Diğer)') && !kayit.includes('(İzinli)') && !kayit.includes('(Ders Tamamlama)'));
                if (found) {
                    let alan = '';
                    const m = found.match(/\((.*?)\)/);
                    if (m) alan = ` (${m[1]})`;
                    nobetler.push(`${gun}${alan}`);
                }
            }
            const nobetStr = nobetler.length > 0 ? nobetler.join(', ') : '-';
            const dersSaati = getTeacherWeeklyLessonCount(t);

            ws_data.push([
                i + 1,
                t,
                brans,
                rehberSinif,
                nobetStr,
                dersSaati
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [
            { wch: 8 },
            { wch: 28 },
            { wch: 22 },
            { wch: 18 },
            { wch: 30 },
            { wch: 18 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Öğretmenler');
        const safeSchool = (appData.okulAdi || 'Seyir').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
        XLSX.writeFile(wb, `${safeSchool}_Ogretmen_Kadrosu.xlsx`);
        BhUI.toast('Öğretmen kadrosu Excel olarak indirildi.', 'success');
    };

    window.importExcelOgretmenler = function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (typeof XLSX === 'undefined') {
            BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi.', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = guvenliExcelOku(data);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rows || rows.length < 2) {
                    BhUI.toast('Excel dosyasında veri satırı bulunamadı.', 'warning');
                    return;
                }

                // Başlık satırını bul
                let headerRowIdx = -1;
                let adColIdx = -1;
                let bransColIdx = -1;

                for (let r = 0; r < Math.min(10, rows.length); r++) {
                    const row = rows[r];
                    if (!Array.isArray(row)) continue;
                    for (let c = 0; c < row.length; c++) {
                        const cell = String(row[c] || '').trim().toLowerCase();
                        if (cell.includes('öğretmen') || cell.includes('ad soyad') || cell.includes('adı soyadı') || cell === 'isim' || cell === 'ad') {
                            headerRowIdx = r;
                            adColIdx = c;
                        }
                        if (cell.includes('branş')) {
                            bransColIdx = c;
                        }
                    }
                    if (adColIdx !== -1) break;
                }

                if (adColIdx === -1) {
                    headerRowIdx = 0;
                    adColIdx = 0;
                    bransColIdx = 1;
                }

                if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
                if (!appData.ogretmenBranslar) appData.ogretmenBranslar = [];
                if (!appData.bransListesi) appData.bransListesi = [];

                let addedCount = 0;
                let updatedBransCount = 0;

                for (let r = headerRowIdx + 1; r < rows.length; r++) {
                    const row = rows[r];
                    if (!Array.isArray(row) || row.length === 0) continue;

                    let hocaAdi = String(row[adColIdx] || '').trim();
                    let brans = bransColIdx !== -1 ? String(row[bransColIdx] || '').trim() : '';

                    if (!hocaAdi || /^\d+$/.test(hocaAdi) || hocaAdi.length < 2) continue;

                    if (!appData.tumOgretmenler.includes(hocaAdi)) {
                        appData.tumOgretmenler.push(hocaAdi);
                        addedCount++;
                    }

                    if (brans) {
                        if (!appData.bransListesi.includes(brans)) {
                            appData.bransListesi.push(brans);
                        }
                        appData.ogretmenBranslar = appData.ogretmenBranslar.filter(item => !item.startsWith(hocaAdi + ' :'));
                        appData.ogretmenBranslar.push(hocaAdi + ' : ' + brans);
                        updatedBransCount++;
                    }
                }

                saveData();
                renderOgretmenTable();
                if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
                if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
                BhUI.toast(`${addedCount} yeni öğretmen eklendi, ${updatedBransCount} branş güncellendi.`, 'success');
            } catch (err) {
                console.error('Excel içe aktarım hatası:', err);
                BhUI.toast('Excel dosyası işlenirken hata oluştu: ' + err.message, 'error');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Yeni Öğretmen Ekleme (Hızlı Bar)
    document.getElementById('btn-add-ogretmen-manuel')?.addEventListener('click', () => {
        const input = document.getElementById('inp-yeni-ogretmen');
        const selBrans = document.getElementById('sel-yeni-ogretmen-brans');
        const val = input ? input.value.trim() : '';
        const brans = selBrans ? selBrans.value.trim() : '';
        if (val) {
            if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
            if (!appData.tumOgretmenler.includes(val)) {
                appData.tumOgretmenler.push(val);
                if (brans) {
                    if (!appData.ogretmenBranslar) appData.ogretmenBranslar = [];
                    appData.ogretmenBranslar.push(val + ' : ' + brans);
                }
                saveData();
                renderOgretmenTable();
                if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
                if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
                input.value = '';
                if (selBrans) selBrans.value = '';
                BhUI.toast(val + ' kadroya eklendi.', 'success');
            } else {
                BhUI.toast('Bu öğretmen zaten mevcut!', 'warning');
            }
        } else {
            BhUI.toast('Lütfen öğretmen adını girin.', 'warning');
        }
    });

    document.getElementById('inp-yeni-ogretmen')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('btn-add-ogretmen-manuel')?.click();
        }
    });



    // -------------------------------------------------------------
    // ZAMAN YÖNETİMİ GELİŞMİŞ SİSTEMİ (DERS & TENEFFÜS VAKİTLERİ)
    // -------------------------------------------------------------
    window.parseTimeRange = function (saatStr) {
        if (!saatStr || typeof saatStr !== 'string') return null;
        const parts = saatStr.split('-').map(s => s.trim());
        if (parts.length !== 2) return null;
        const sParts = parts[0].split(':').map(Number);
        const eParts = parts[1].split(':').map(Number);
        if (sParts.length < 2 || eParts.length < 2 || isNaN(sParts[0]) || isNaN(sParts[1]) || isNaN(eParts[0]) || isNaN(eParts[1])) return null;
        const startM = sParts[0] * 60 + sParts[1];
        const endM = eParts[0] * 60 + eParts[1];
        return {
            startStr: parts[0],
            endStr: parts[1],
            startM,
            endM,
            durationM: endM - startM
        };
    };

    window.formatMinutesToTime = function (mins) {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    window.updateDersTime = function (type, index, field, value) {
        const list = type === 'orta' ? appData.dersProgramiOrtaokul : appData.dersProgramiLise;
        if (!list || !list[index]) return;

        if (field === 'ders') {
            list[index].ders = value.trim();
        } else if (field === 'start' || field === 'end') {
            const parsed = parseTimeRange(list[index].saat) || { startStr: '08:30', endStr: '09:10' };
            const newStart = field === 'start' ? value : parsed.startStr;
            const newEnd = field === 'end' ? value : parsed.endStr;
            list[index].saat = `${newStart} - ${newEnd}`;
        } else if (field === 'saat') {
            list[index].saat = value.trim();
        }

        saveData();
        renderDersler();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
        BhUI.toast('Vakit güncellendi.', 'success');
    };

    window.moveVakit = function (type, index, direction) {
        const list = type === 'orta' ? appData.dersProgramiOrtaokul : appData.dersProgramiLise;
        if (!list || !list[index]) return;
        const targetIdx = index + direction;
        if (targetIdx < 0 || targetIdx >= list.length) return;

        const temp = list[index];
        list[index] = list[targetIdx];
        list[targetIdx] = temp;

        saveData();
        renderDersler();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
    };

    window.renderDersler = function () {
        if (Array.isArray(appData.dersProgrami) && !Array.isArray(appData.dersProgramiOrtaokul)) {
            appData.dersProgramiOrtaokul = [...appData.dersProgrami];
        }
        if (!Array.isArray(appData.dersProgramiOrtaokul) || appData.dersProgramiOrtaokul.length === 0) {
            appData.dersProgramiOrtaokul = [
                { ders: "1. Ders", saat: "08:40 - 09:20" },
                { ders: "2. Ders", saat: "09:35 - 10:15" },
                { ders: "3. Ders", saat: "10:30 - 11:10" },
                { ders: "4. Ders", saat: "11:25 - 12:05" },
                { ders: "Öğle Arası", saat: "12:05 - 12:45" },
                { ders: "5. Ders", saat: "12:45 - 13:25" },
                { ders: "6. Ders", saat: "13:40 - 14:20" },
                { ders: "7. Ders", saat: "14:35 - 15:15" }
            ];
            saveData();
        }
        if (!Array.isArray(appData.dersProgramiLise) || appData.dersProgramiLise.length <= 1) {
            appData.dersProgramiLise = [
                { ders: "1. Ders", saat: "08:30 - 09:10" },
                { ders: "2. Ders", saat: "09:20 - 10:00" },
                { ders: "3. Ders", saat: "10:10 - 10:50" },
                { ders: "4. Ders", saat: "11:00 - 11:40" },
                { ders: "5. Ders", saat: "11:50 - 12:30" },
                { ders: "Öğle Arası", saat: "12:30 - 13:15" },
                { ders: "6. Ders", saat: "13:15 - 13:55" },
                { ders: "7. Ders", saat: "14:05 - 14:45" },
                { ders: "8. Ders", saat: "14:55 - 15:35" }
            ];
            saveData();
        }

        renderKademeListesi('orta', appData.dersProgramiOrtaokul);
        renderKademeListesi('lise', appData.dersProgramiLise);
        renderTimelineBar('orta', appData.dersProgramiOrtaokul);
        renderTimelineBar('lise', appData.dersProgramiLise);
        updateZamanStats();
    };

    function renderKademeListesi(type, list) {
        const container = document.getElementById(type === 'orta' ? 'ders-listesi-orta' : 'ders-listesi-lise');
        const ozetEl = document.getElementById(type === 'orta' ? 'orta-vakit-ozet' : 'lise-vakit-ozet');
        if (!container) return;

        if (ozetEl) {
            const dersAdet = list.filter(d => !d.ders.toLowerCase().includes('öğle') && !d.ders.toLowerCase().includes('teneffüs')).length;
            ozetEl.textContent = `${list.length} Periyot (${dersAdet} Ders)`;
        }

        if (list.length === 0) {
            container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">Henüz vakit eklenmedi. Yukarıdaki "+ Vakit Ekle" veya "Otomatik Vakit Sihirbazı" ile oluşturabilirsiniz.</div>';
            return;
        }

        let html = '';
        list.forEach((d, i) => {
            const parsed = parseTimeRange(d.saat) || { startStr: '08:30', endStr: '09:10', durationM: 40 };
            const isLunch = d.ders.toLowerCase().includes('öğle');
            const badgeClass = isLunch ? 'badge-lunch' : 'badge-lesson';
            const badgeIcon = isLunch ? '🍱' : '📖';

            // Sonraki derse kadar olan teneffüs kontrolü
            let connectorHtml = '';
            if (i < list.length - 1) {
                const nextParsed = parseTimeRange(list[i + 1].saat);
                if (nextParsed) {
                    const gap = nextParsed.startM - parsed.endM;
                    if (gap > 0) {
                        connectorHtml = `
                            <div class="zaman-recess-connector">
                                <span>☕ ${gap} Dk Teneffüs / Ara</span>
                            </div>
                        `;
                    } else if (gap < 0) {
                        connectorHtml = `
                            <div class="zaman-recess-connector">
                                <span style="background: #fef2f2; border-color: #fca5a5; color: #dc2626;">⚠️ ${Math.abs(gap)} Dk ÇAKIŞMA (Saat Hatası)!</span>
                            </div>
                        `;
                    }
                }
            }

            html += `
                <div class="zaman-period-item ${isLunch ? 'is-lunch' : ''}">
                    <div style="display: flex; align-items: center; gap: 8px; flex: 1.2; min-width: 130px;">
                        <span class="zaman-period-badge ${badgeClass}">${badgeIcon}</span>
                        <input type="text" class="form-control form-sm" value="${escapeHtml(d.ders)}"
                            onchange="updateDersTime('${type}', ${i}, 'ders', this.value)"
                            style="font-weight: 700; flex: 1; background: #ffffff;" />
                    </div>

                    <div style="display: flex; align-items: center; gap: 4px;">
                        <input type="time" class="form-control form-sm" value="${escapeHtml(parsed.startStr)}"
                            onchange="updateDersTime('${type}', ${i}, 'start', this.value)"
                            style="width: 82px; padding: 3px 6px; font-size: 0.82rem; background: #ffffff;" />
                        <span style="color: var(--text-muted); font-weight: bold;">-</span>
                        <input type="time" class="form-control form-sm" value="${escapeHtml(parsed.endStr)}"
                            onchange="updateDersTime('${type}', ${i}, 'end', this.value)"
                            style="width: 82px; padding: 3px 6px; font-size: 0.82rem; background: #ffffff;" />
                    </div>

                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); background: #f1f5f9; padding: 3px 7px; border-radius: 6px; white-space: nowrap;">
                            ⏱️ ${parsed.durationM} dk
                        </span>
                        <button type="button" class="btn-secondary btn-sm" onclick="moveVakit('${type}', ${i}, -1)" ${i === 0 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;" title="Yukarı Taşı">
                            ⬆️
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="moveVakit('${type}', ${i}, 1)" ${i === list.length - 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 0.75rem;" title="Aşağı Taşı">
                            ⬇️
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="silDers('${type}', ${i})" style="padding: 2px 6px; font-size: 0.75rem; color: #ef4444; background: #fef2f2; border: 1px solid #fca5a5;" title="Sil">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${connectorHtml}
            `;
        });
        container.innerHTML = html;
    }

    function renderTimelineBar(type, list) {
        const bar = document.getElementById(type === 'orta' ? 'timeline-bar-orta' : 'timeline-bar-lise');
        if (!bar || list.length === 0) return;

        const parsedList = list.map(d => parseTimeRange(d.saat)).filter(Boolean);
        if (parsedList.length === 0) return;

        const minStart = Math.min(...parsedList.map(p => p.startM));
        const maxEnd = Math.max(...parsedList.map(p => p.endM));
        const totalSpan = maxEnd - minStart;
        if (totalSpan <= 0) return;

        let segmentsHtml = '';
        list.forEach((d, i) => {
            const p = parsedList[i];
            if (!p) return;
            const widthPct = ((p.durationM / totalSpan) * 100).toFixed(1);
            const isLunch = d.ders.toLowerCase().includes('öğle');
            const segClass = isLunch ? 'seg-lunch' : 'seg-ders';

            segmentsHtml += `
                <div class="timeline-segment ${segClass}" style="width: ${widthPct}%;" title="${escapeHtml(d.ders)}: ${escapeHtml(d.saat)} (${p.durationM} dk)"></div>
            `;

            // Teneffüs segmenti
            if (i < list.length - 1 && parsedList[i + 1]) {
                const nextP = parsedList[i + 1];
                const gap = nextP.startM - p.endM;
                if (gap > 0) {
                    const gapPct = ((gap / totalSpan) * 100).toFixed(1);
                    segmentsHtml += `
                        <div class="timeline-segment seg-teneffus" style="width: ${gapPct}%;" title="Teneffüs: ${gap} dk"></div>
                    `;
                } else if (gap < 0) {
                    const conflictPct = ((Math.abs(gap) / totalSpan) * 100).toFixed(1);
                    segmentsHtml += `
                        <div class="timeline-segment seg-conflict" style="width: ${conflictPct}%;" title="Çakışma: ${Math.abs(gap)} dk!"></div>
                    `;
                }
            }
        });
        bar.innerHTML = segmentsHtml;
    }

    function updateZamanStats() {
        const liseList = appData.dersProgramiLise || [];
        let totalDersM = 0;
        let totalTeneffusM = 0;
        let minStartStr = '--:--';
        let maxEndStr = '--:--';

        const parsedList = liseList.map(d => parseTimeRange(d.saat)).filter(Boolean);
        if (parsedList.length > 0) {
            parsedList.forEach((p, i) => {
                const isLunch = (liseList[i]?.ders || '').toLowerCase().includes('öğle');
                if (isLunch) {
                    totalTeneffusM += p.durationM;
                } else {
                    totalDersM += p.durationM;
                }

                if (i < parsedList.length - 1) {
                    const gap = parsedList[i + 1].startM - p.endM;
                    if (gap > 0) totalTeneffusM += gap;
                }
            });

            minStartStr = parsedList[0].startStr;
            maxEndStr = parsedList[parsedList.length - 1].endStr;
        }

        const elDersSuresi = document.getElementById('stat-zaman-ders-suresi');
        if (elDersSuresi) {
            const h = Math.floor(totalDersM / 60);
            const m = totalDersM % 60;
            elDersSuresi.textContent = `${totalDersM} Dk (${h} Sa ${m} Dk)`;
        }

        const elTeneffus = document.getElementById('stat-zaman-teneffus-suresi');
        if (elTeneffus) {
            elTeneffus.textContent = `${totalTeneffusM} Dk`;
        }

        const elGunVakti = document.getElementById('stat-zaman-gun-vakti');
        if (elGunVakti) {
            elGunVakti.textContent = `${minStartStr} - ${maxEndStr}`;
        }

        // Canlı Pano Durumunu Hesapla
        const elCanliDurum = document.getElementById('stat-zaman-canli-durum');
        if (elCanliDurum) {
            const sim = hesaplaPanoZamanDurumu(new Date(), liseList);
            elCanliDurum.textContent = `${sim.icon} ${sim.text} (${sim.timer})`;
        }
    }

    function hesaplaPanoZamanDurumu(dateObj, program) {
        if (!program || program.length === 0) return { text: 'Tanımlanmadı', timer: '--:--', icon: '⏰' };
        const currentTime = dateObj.getHours() * 60 + dateObj.getMinutes();
        const currentSec = dateObj.getSeconds();

        let activeEvent = null;
        let nextEvent = null;

        for (let i = 0; i < program.length; i++) {
            const p = parseTimeRange(program[i].saat);
            if (!p) continue;

            if (currentTime >= p.startM && currentTime < p.endM) {
                activeEvent = { name: program[i].ders, endTime: p.endM };
                break;
            }
            if (currentTime < p.startM) {
                if (!nextEvent) {
                    const prevP = i > 0 ? parseTimeRange(program[i - 1].saat) : null;
                    nextEvent = {
                        name: program[i].ders,
                        startTime: p.startM,
                        prevEndTime: prevP ? prevP.endM : null
                    };
                }
            }
        }

        if (activeEvent) {
            const minsLeft = activeEvent.endTime - currentTime - 1;
            const secsLeft = 59 - currentSec;
            return {
                text: activeEvent.name,
                timer: `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`,
                icon: activeEvent.name.toLowerCase().includes('öğle') ? '🍱' : '📖'
            };
        } else if (nextEvent) {
            const minsLeft = nextEvent.startTime - currentTime - 1;
            const secsLeft = 59 - currentSec;
            if (nextEvent.prevEndTime && currentTime >= nextEvent.prevEndTime) {
                return {
                    text: 'Teneffüs',
                    timer: `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`,
                    icon: '☕'
                };
            } else {
                return {
                    text: 'Ders Başlamadı',
                    timer: `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`,
                    icon: '⏰'
                };
            }
        } else {
            return { text: 'Gün Bitti', timer: '--:--', icon: '🏠' };
        }
    }

    window.simuleEtPanoZamani = function () {
        const inp = document.getElementById('inp-zaman-sim-saat');
        const resDiv = document.getElementById('zaman-sim-sonuc');
        if (!inp || !resDiv) return;

        const val = inp.value;
        if (!val) {
            resDiv.style.display = 'none';
            return;
        }

        const parts = val.split(':').map(Number);
        const simDate = new Date();
        simDate.setHours(parts[0], parts[1], 0, 0);

        const liseList = appData.dersProgramiLise || [];
        const simLise = hesaplaPanoZamanDurumu(simDate, liseList);

        const ortaList = appData.dersProgramiOrtaokul || [];
        const simOrta = hesaplaPanoZamanDurumu(simDate, ortaList);

        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div><strong>Lise Panosu (${val}):</strong> ${simLise.icon} ${escapeHtml(simLise.text)} (Kalan: ${simLise.timer})</div>
                <div><strong>Ortaokul Panosu (${val}):</strong> ${simOrta.icon} ${escapeHtml(simOrta.text)} (Kalan: ${simOrta.timer})</div>
            </div>
        `;
    };

    window.simuleEtSimdi = function () {
        const inp = document.getElementById('inp-zaman-sim-saat');
        if (!inp) return;
        const now = new Date();
        inp.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        simuleEtPanoZamani();
    };

    // --- OTOMATİK VAKİT SİHİRBAZI ---
    window.openZamanSihirbaziModal = function () {
        const modal = document.getElementById('modal-zaman-sihirbazi');
        if (modal) {
            modal.style.display = 'flex';
            updateZamanSihirbaziPreview();
        }
    };

    window.closeZamanSihirbaziModal = function () {
        const modal = document.getElementById('modal-zaman-sihirbazi');
        if (modal) modal.style.display = 'none';
    };

    function uretSihirbazVakitleri() {
        const startVal = document.getElementById('inp-sihirbaz-baslangic')?.value || '08:30';
        const dersDk = parseInt(document.getElementById('inp-sihirbaz-ders-suresi')?.value, 10) || 40;
        const teneffusDk = parseInt(document.getElementById('inp-sihirbaz-teneffus-suresi')?.value, 10) || 10;
        const dersSayisi = parseInt(document.getElementById('sel-sihirbaz-ders-sayisi')?.value, 10) || 8;
        const ogleSonrasi = parseInt(document.getElementById('sel-sihirbaz-ogle-sonrasi')?.value, 10) || 5;
        const ogleDk = parseInt(document.getElementById('inp-sihirbaz-ogle-suresi')?.value, 10) || 45;

        const startParts = startVal.split(':').map(Number);
        let curM = startParts[0] * 60 + startParts[1];

        const list = [];
        for (let i = 1; i <= dersSayisi; i++) {
            const dStart = curM;
            const dEnd = curM + dersDk;
            list.push({
                ders: `${i}. Ders`,
                saat: `${formatMinutesToTime(dStart)} - ${formatMinutesToTime(dEnd)}`
            });
            curM = dEnd;

            // Öğle arası kontrolü
            if (ogleSonrasi > 0 && i === ogleSonrasi && i < dersSayisi) {
                const lStart = curM;
                const lEnd = curM + ogleDk;
                list.push({
                    ders: "Öğle Arası",
                    saat: `${formatMinutesToTime(lStart)} - ${formatMinutesToTime(lEnd)}`
                });
                curM = lEnd;
            } else if (i < dersSayisi) {
                curM += teneffusDk;
            }
        }
        return list;
    }

    window.updateZamanSihirbaziPreview = function () {
        const preview = document.getElementById('sihirbaz-zaman-preview');
        if (!preview) return;

        const list = uretSihirbazVakitleri();
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 6px;">';
        list.forEach(item => {
            const isLunch = item.ders.toLowerCase().includes('öğle');
            html += `
                <div style="padding: 5px 8px; border-radius: 6px; border: 1px solid ${isLunch ? '#d8b4fe' : '#cbd5e1'}; background: ${isLunch ? '#f3e8ff' : '#ffffff'};">
                    <strong style="color: ${isLunch ? '#7e22ce' : 'var(--text-main)'};">${escapeHtml(item.ders)}</strong>: ${escapeHtml(item.saat)}
                </div>
            `;
        });
        html += '</div>';
        preview.innerHTML = html;
    };

    window.uygulaZamanSihirbazi = function () {
        const hedef = document.getElementById('sel-sihirbaz-hedef-kademe')?.value || 'herikisi';
        const list = uretSihirbazVakitleri();
        if (list.length === 0) return;

        if (hedef === 'lise' || hedef === 'herikisi') {
            appData.dersProgramiLise = JSON.parse(JSON.stringify(list));
        }
        if (hedef === 'orta' || hedef === 'herikisi') {
            appData.dersProgramiOrtaokul = JSON.parse(JSON.stringify(list));
        }

        saveData();
        renderDersler();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
        closeZamanSihirbaziModal();
        BhUI.toast('Otomatik vakit sihirbazı başarıyla uygulandı.', 'success');
    };

    // --- HAZIR ŞABLONLAR ---
    window.openZamanSablonModal = function () {
        const modal = document.getElementById('modal-zaman-sablon');
        if (modal) modal.style.display = 'flex';
    };

    window.closeZamanSablonModal = function () {
        const modal = document.getElementById('modal-zaman-sablon');
        if (modal) modal.style.display = 'none';
    };

    window.uygulaHazirZamanSablonu = function (sablonKey) {
        if (sablonKey === 'lise-standart') {
            appData.dersProgramiLise = [
                { ders: "1. Ders", saat: "08:30 - 09:10" },
                { ders: "2. Ders", saat: "09:20 - 10:00" },
                { ders: "3. Ders", saat: "10:10 - 10:50" },
                { ders: "4. Ders", saat: "11:00 - 11:40" },
                { ders: "5. Ders", saat: "11:50 - 12:30" },
                { ders: "Öğle Arası", saat: "12:30 - 13:15" },
                { ders: "6. Ders", saat: "13:15 - 13:55" },
                { ders: "7. Ders", saat: "14:05 - 14:45" },
                { ders: "8. Ders", saat: "14:55 - 15:35" }
            ];
        } else if (sablonKey === 'orta-standart') {
            appData.dersProgramiOrtaokul = [
                { ders: "1. Ders", saat: "08:40 - 09:20" },
                { ders: "2. Ders", saat: "09:35 - 10:15" },
                { ders: "3. Ders", saat: "10:30 - 11:10" },
                { ders: "4. Ders", saat: "11:25 - 12:05" },
                { ders: "Öğle Arası", saat: "12:05 - 12:45" },
                { ders: "5. Ders", saat: "12:45 - 13:25" },
                { ders: "6. Ders", saat: "13:40 - 14:20" },
                { ders: "7. Ders", saat: "14:35 - 15:15" }
            ];
        } else if (sablonKey === 'cuma-imamhatip') {
            appData.dersProgramiLise = [
                { ders: "1. Ders", saat: "08:30 - 09:10" },
                { ders: "2. Ders", saat: "09:20 - 10:00" },
                { ders: "3. Ders", saat: "10:10 - 10:50" },
                { ders: "4. Ders", saat: "11:00 - 11:40" },
                { ders: "5. Ders", saat: "11:50 - 12:30" },
                { ders: "Öğle Arası & Cuma", saat: "12:30 - 13:35" },
                { ders: "6. Ders", saat: "13:35 - 14:15" },
                { ders: "7. Ders", saat: "14:25 - 15:05" },
                { ders: "8. Ders", saat: "15:15 - 15:55" }
            ];
        } else if (sablonKey === 'ikili-sabah') {
            appData.dersProgramiOrtaokul = [
                { ders: "1. Ders", saat: "07:30 - 08:10" },
                { ders: "2. Ders", saat: "08:20 - 09:00" },
                { ders: "3. Ders", saat: "09:10 - 09:50" },
                { ders: "4. Ders", saat: "10:00 - 10:40" },
                { ders: "5. Ders", saat: "10:50 - 11:30" },
                { ders: "6. Ders", saat: "11:40 - 12:20" }
            ];
        }

        saveData();
        renderDersler();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
        closeZamanSablonModal();
        BhUI.toast('Hazır şablon başarıyla uygulandı.', 'success');
    };

    // --- KADEME KOPYALAMA ---
    window.kopyalaKademeVakitleri = function () {
        if (confirm("Lise vakitlerini Ortaokul kademesine kopyalamak istiyor musunuz?\n('İptal'e basarsanız Ortaokul vakitlerini Liseye kopyalayabilirsiniz)")) {
            appData.dersProgramiOrtaokul = JSON.parse(JSON.stringify(appData.dersProgramiLise || []));
            saveData();
            renderDersler();
            if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
            BhUI.toast('Lise vakitleri Ortaokula kopyalandı.', 'success');
        } else if (confirm("Ortaokul vakitlerini Lise kademesine kopyalamak istiyor musunuz?")) {
            appData.dersProgramiLise = JSON.parse(JSON.stringify(appData.dersProgramiOrtaokul || []));
            saveData();
            renderDersler();
            if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
            BhUI.toast('Ortaokul vakitleri Liseye kopyalandı.', 'success');
        }
    };

    // --- TEKİL VAKİT EKLEME MODALI ---
    window.openYeniVakitModal = function (kademe) {
        const modal = document.getElementById('modal-yeni-vakit');
        const inpKademe = document.getElementById('inp-yeni-vakit-kademe');
        const inpAd = document.getElementById('inp-yeni-vakit-ad');
        if (!modal || !inpKademe) return;

        inpKademe.value = kademe;
        const list = kademe === 'orta' ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
        if (inpAd) inpAd.value = `${list.length + 1}. Ders`;

        modal.style.display = 'flex';
        if (inpAd) inpAd.focus();
    };

    window.closeYeniVakitModal = function () {
        const modal = document.getElementById('modal-yeni-vakit');
        if (modal) modal.style.display = 'none';
    };

    window.kaydetYeniVakit = function () {
        const kademe = document.getElementById('inp-yeni-vakit-kademe')?.value || 'lise';
        const ad = document.getElementById('inp-yeni-vakit-ad')?.value.trim();
        const basla = document.getElementById('inp-yeni-vakit-basla')?.value;
        const bitir = document.getElementById('inp-yeni-vakit-bitir')?.value;

        if (!ad) {
            BhUI.toast('Lütfen periyot/vakit adını girin.', 'warning');
            return;
        }
        if (!basla || !bitir) {
            BhUI.toast('Lütfen başlangıç ve bitiş saatlerini seçin.', 'warning');
            return;
        }

        const list = kademe === 'orta' ? appData.dersProgramiOrtaokul : appData.dersProgramiLise;
        list.push({
            ders: ad,
            saat: `${basla} - ${bitir}`
        });

        saveData();
        renderDersler();
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
        closeYeniVakitModal();
        BhUI.toast('Yeni vakit eklendi.', 'success');
    };

    window.silDers = function (type, index) {
        if (confirm("Bu vakti silmek istediğinize emin misiniz?")) {
            if (type === 'orta') {
                appData.dersProgramiOrtaokul.splice(index, 1);
            } else if (type === 'lise') {
                appData.dersProgramiLise.splice(index, 1);
            }
            saveData();
            renderDersler();
            if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
            BhUI.toast('Vakit silindi.', 'success');
        }
    };

    // --- EXCEL ENTEGRASYONU: ZAMAN ÇİZELGESİ ---
    window.exportExcelZaman = function () {
        if (typeof XLSX === 'undefined') {
            BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi.', 'error');
            return;
        }

        const okulAdi = (appData.okulAdi || 'Okul') + ' ' + (appData.okulTuru || '');
        const bugun = new Date().toLocaleDateString('tr-TR');

        const ws_data = [
            [okulAdi],
            ['DERS VE TENEFFÜS VAKİTLERİ ÇİZELGESİ'],
            [`Rapor Tarihi: ${bugun}`],
            [],
            ['Kademe', 'Sıra', 'Periyot / Ders Adı', 'Başlangıç - Bitiş', 'Süre (Dakika)']
        ];

        (appData.dersProgramiLise || []).forEach((d, i) => {
            const p = parseTimeRange(d.saat);
            ws_data.push(['Lise', i + 1, d.ders, d.saat, p ? p.durationM : 40]);
        });

        (appData.dersProgramiOrtaokul || []).forEach((d, i) => {
            const p = parseTimeRange(d.saat);
            ws_data.push(['Ortaokul', i + 1, d.ders, d.saat, p ? p.durationM : 40]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 14 }, { wch: 8 }, { wch: 22 }, { wch: 20 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Zaman Cizelgesi');
        const safeSchool = (appData.okulAdi || 'Seyir').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
        XLSX.writeFile(wb, `${safeSchool}_Ders_Vakitleri.xlsx`);
        BhUI.toast('Ders vakitleri Excel olarak indirildi.', 'success');
    };

    window.importExcelZaman = function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (typeof XLSX === 'undefined') {
            BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi.', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = guvenliExcelOku(data);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rows || rows.length < 2) {
                    BhUI.toast('Excel dosyasında veri satırı bulunamadı.', 'warning');
                    return;
                }

                let adColIdx = 2;
                let saatColIdx = 3;
                let kademeColIdx = 0;

                for (let r = 0; r < Math.min(6, rows.length); r++) {
                    const row = rows[r];
                    if (!Array.isArray(row)) continue;
                    for (let c = 0; c < row.length; c++) {
                        const cell = String(row[c] || '').toLowerCase();
                        if (cell.includes('periyot') || cell.includes('ders adı')) adColIdx = c;
                        if (cell.includes('başlangıç') || cell.includes('saat') || cell.includes('vakit')) saatColIdx = c;
                        if (cell.includes('kademe')) kademeColIdx = c;
                    }
                }

                const yeniLise = [];
                const yeniOrta = [];

                for (let r = 4; r < rows.length; r++) {
                    const row = rows[r];
                    if (!Array.isArray(row) || row.length <= saatColIdx) continue;

                    const kademe = String(row[kademeColIdx] || '').toLowerCase();
                    const ad = String(row[adColIdx] || '').trim();
                    const saat = String(row[saatColIdx] || '').trim();

                    if (!ad || !saat || !saat.includes('-')) continue;

                    if (kademe.includes('orta')) {
                        yeniOrta.push({ ders: ad, saat: saat });
                    } else {
                        yeniLise.push({ ders: ad, saat: saat });
                    }
                }

                if (yeniLise.length > 0) appData.dersProgramiLise = yeniLise;
                if (yeniOrta.length > 0) appData.dersProgramiOrtaokul = yeniOrta;

                saveData();
                renderDersler();
                if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
                BhUI.toast('Ders vakitleri Excel dosyasından aktarıldı.', 'success');
            } catch (err) {
                console.error(err);
                BhUI.toast('Excel dosyası işlenirken hata oluştu: ' + err.message, 'error');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    function formKonumunuOku() {
        const mevcut = Object.assign({ sehir: "", ilce: "", enlem: null, boylam: null }, appData.konum || {});
        let sehirMetni = document.getElementById('inp-sehir').value.trim();
        let ilceMetni = (document.getElementById('inp-ilce')?.value || '').trim();
        let enlem = parseFloat(document.getElementById('inp-enlem').value);
        let boylam = parseFloat(document.getElementById('inp-boylam').value);

        // Şehir ve ilçe doğrulaması
        if (sehirMetni && typeof SeyirKonum !== 'undefined') {
            const sehirBul = SeyirKonum.bulSehir(sehirMetni);
            if (sehirBul) {
                sehirMetni = sehirBul.ad;
                if (ilceMetni) {
                    const ilceBul = SeyirKonum.bulIlce(sehirBul.ad, ilceMetni);
                    if (ilceBul) ilceMetni = ilceBul.ad;
                    else ilceMetni = "";
                }
            }
        }

        // Koordinatlar eksikse veya şehir değiştiyse otomatik tamamla
        const sehirDegistiMi = sehirMetni && sehirMetni !== mevcut.sehir;
        if ((!Number.isFinite(enlem) || !Number.isFinite(boylam) || sehirDegistiMi) && sehirMetni && typeof SeyirKonum !== 'undefined') {
            const eslesen = SeyirKonum.koordinatGetir(sehirMetni, ilceMetni);
            if (eslesen) {
                enlem = eslesen.enlem;
                boylam = eslesen.boylam;
            }
        }

        appData.konum = {
            sehir: sehirMetni || mevcut.sehir,
            ilce: ilceMetni,
            enlem: Number.isFinite(enlem) && enlem >= -90 && enlem <= 90 ? enlem : mevcut.enlem,
            boylam: Number.isFinite(boylam) && boylam >= -180 && boylam <= 180 ? boylam : mevcut.boylam
        };
    }

    function formGizlilikAyarlariniOku() {
        const sure = parseInt(document.getElementById('inp-saklama-suresi')?.value, 10);
        appData.gizlilik = {
            personelAdiGosterim: document.getElementById('inp-personel-gosterim')?.value || 'gorev',
            nobetciGoster: !!document.getElementById('inp-nobetci-goster')?.checked,
            rehberOgretmenGoster: !!document.getElementById('inp-rehber-goster')?.checked,
            dersOgretmeniGoster: !!document.getElementById('inp-ders-ogretmeni-goster')?.checked,
            saklamaSuresiGun: Number.isFinite(sure) ? Math.min(3650, Math.max(1, sure)) : 365
        };
    }

    function formVerileriniOku() {
        appData.okulAdi = document.getElementById('inp-okulAdi').value.trim();
        const elOkulTuru = document.getElementById('inp-okulTuru');
        if (elOkulTuru) appData.okulTuru = elOkulTuru.value;
        delete appData.slogan;
        appData.okulWebSiteUrl = document.getElementById('inp-webUrl').value;
        formKonumunuOku();
        formGizlilikAyarlariniOku();

        if (!appData.ayarlar) appData.ayarlar = {};
        appData.ayarlar.karuselSuresi = parseInt(document.getElementById('inp-karuselSuresi').value, 10) || 5000;
        appData.ayarlar.temaOtomatik = document.getElementById('inp-temaOtomatik').value === 'true';

        const chkTicker = document.getElementById('chk-ticker-active');
        if (chkTicker) appData.ayarlar.tickerDurum = chkTicker.checked;
        const inpTickerBaslik = document.getElementById('inp-ticker-baslik');
        if (inpTickerBaslik) appData.ayarlar.tickerBaslik = inpTickerBaslik.value.trim() || '⚡ DUYURULAR';
        const inpTickerHiz = document.getElementById('inp-ticker-hiz-val');
        if (inpTickerHiz) appData.ayarlar.tickerHiz = inpTickerHiz.value || 'normal';
        const inpTickerAyrac = document.getElementById('inp-ticker-ayrac-val');
        if (inpTickerAyrac) appData.ayarlar.tickerAyrac = inpTickerAyrac.value || '⚡';

        saveCurrentDayDnD();
        appData.kayanYazi = document.getElementById('inp-kayan').value
            .split('\n').map(x => x.trim()).filter(Boolean);

        // Zil Yönetimi Form Verilerini Oku
        if (typeof readZilFormUI === 'function') readZilFormUI();
    }

    function jsonDosyasiIndir(veri, dosyaAdi) {
        const dataStr = JSON.stringify(veri, null, 4);
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = dosyaAdi;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Kaydet Butonu (Yerel Tarayıcı ve JSON Hafızası)
    document.getElementById('btn-save-json').addEventListener('click', () => {
        formVerileriniOku();
        saveData();

        BhUI.toast("Değişiklikler başarıyla kaydedildi. Pano ekranı anında güncellenecektir.", "success");

        // MEB adresi değiştiğinde haber yenileme ayrıca tek istek olarak otomatik çalışır.
        // Bu buton diğer pano ayarlarını yerel tarayıcıya kaydeder.
    });

    // Açık pano JSON'u tam personel adı ve özel yönetim tabloları içermez.
    document.querySelectorAll('.btn-download-public-json').forEach(btn => btn.addEventListener('click', () => {
        if (!confirm(
            'Yapılandırılmış personel alanları güvenli görünüme dönüştürülecek. Ancak duyuru, kayan yazı ve sınav gibi ' +
            'serbest metinler otomatik anonimleştirilemez. Bu alanlarda kişisel veri olmadığını kontrol ettiniz mi?'
        )) return;
        formVerileriniOku();
        saveData();
        jsonDosyasiIndir(panoIcinAcikVeriOlustur(appData, true), 'data.json');
        BhUI.toast('Güvenli ve taşınabilir data.json indirildi.', 'success');
    }));

    document.querySelectorAll('.btn-download-private-json').forEach(btn => btn.addEventListener('click', () => {
        const onay = confirm(
            'UYARI: Bu özel yönetim yedeği öğretmen adları ve program bilgileri gibi kişisel veriler içerebilir.\n\n' +
            'Dosyayı web sunucusuna yüklemeyin; yalnızca yetkili ve şifreli kurumsal alanda saklayın. Devam edilsin mi?'
        );
        if (!onay) return;
        formVerileriniOku();
        saveData();
        const yedek = JSON.parse(JSON.stringify(appData));
        delete yedek.yedekGecmisi;
        yedek._meta = {
            tur: 'seyir-private-backup',
            surum: 1,
            kisiselVeriIcerir: true,
            olusturmaZamani: new Date().toISOString()
        };
        jsonDosyasiIndir(yedek, 'seyir-yonetim-yedegi.private.json');
        BhUI.toast('Özel yönetim yedeği indirildi.', 'warning');
    }));

    // JSON İçe Aktar (Dosya Yükle) Mantığı
    const btnUploadJsonButtons = document.querySelectorAll('.js-upload-json');
    const inpJsonFile = document.getElementById('inp-json-file');

    if (btnUploadJsonButtons.length > 0 && inpJsonFile) {
        btnUploadJsonButtons.forEach(button => button.addEventListener('click', () => {
            inpJsonFile.click();
        }));

        inpJsonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                alert('JSON Dosyası Yüklenemedi: Dosya 5 MB sınırını aşıyor.');
                inpJsonFile.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = guvenliIceAktarmaNesnesi(JSON.parse(event.target.result));
                    if (typeof importedData !== 'object' || importedData === null) {
                        throw new Error('Geçersiz JSON formatı.');
                    }
                    if (!confirm(
                        'İçe aktarılan dosya kişisel veri içerebilir ve bu cihazın yerel depolamasına kaydedilecektir. ' +
                        'Dosyanın yetkili bir kaynaktan geldiğini doğruladınız mı?'
                    )) {
                        inpJsonFile.value = '';
                        return;
                    }
                    delete importedData._meta;
                    appData = importedData;
                    saveData();
                    loadData();
                    BhUI.toast('JSON verileri başarıyla yüklendi ve sisteme kaydedildi!', 'success');
                } catch (err) {
                    alert('JSON Dosyası Yüklenemedi: ' + err.message);
                }
                inpJsonFile.value = '';
            };
            reader.readAsText(file, 'UTF-8');
        });
    }

    const btnClearJsonData = document.getElementById('btn-clear-json-data');
    if (btnClearJsonData) {
        btnClearJsonData.addEventListener('click', () => {
            if (confirm("Bu cihazdaki okul verileri, açık pano kopyası, tema tercihi ve yönetici parolası kalıcı olarak silinecek. Devam edilsin mi?")) {
                SEYIR_LOCAL_AUTH.clearAll();
                alert('Bu cihazdaki tüm Seyir verileri silindi. İlk kurulum ekranına dönülecek.');
                window.location.reload();
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════════
    // 💾 VERİ YÖNETİMİ, AKILLI OTOMATİK YEDEKLEME VE SNAPSHOT MOTORU
    // ══════════════════════════════════════════════════════════════════════

    let chosenDirectoryHandle = null;

    function getTarihSaatEtiketi() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const y = now.getFullYear();
        const m = pad(now.getMonth() + 1);
        const d = pad(now.getDate());
        const hh = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        return `${y}-${m}-${d}_${hh}-${mm}-${ss}`;
    }

    function getKalanSureMetni(hedefSaat) {
        if (!hedefSaat || !hedefSaat.includes(':')) return 'Saat belirtilmedi';
        const [hh, mm] = hedefSaat.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(hh, mm, 0, 0);

        let diffMs = target.getTime() - now.getTime();
        if (diffMs <= 0) {
            // Bugünün saati geçti, yarına kalan süre
            target.setDate(target.getDate() + 1);
            diffMs = target.getTime() - now.getTime();
        }

        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0 && minutes === 0) {
            return 'Yedekleme şimdi tetikleniyor...';
        } else if (hours === 0) {
            return `${minutes} dakika kaldı`;
        } else {
            return `${hours} saat ${minutes} dakika kaldı`;
        }
    }

    window.updateVeriKPIs = function updateVeriKPIs() {
        if (!appData) return;

        // 1. Depolama boyutu ve kota yüzdesi
        const elStorage = document.getElementById('veri-kpi-storage');
        const elStorageBar = document.getElementById('veri-kpi-storage-bar');
        const elStorageSub = document.getElementById('veri-kpi-storage-sub');
        if (elStorage) {
            try {
                const totalBytes = new Blob([JSON.stringify(appData)]).size;
                const kb = (totalBytes / 1024).toFixed(1);
                // Tipik localStorage kotası 5 MB (5120 KB)
                const quotaEst = 5 * 1024 * 1024;
                const pct = Math.min(100, Math.max(0.1, ((totalBytes / quotaEst) * 100))).toFixed(1);

                elStorage.textContent = `${kb} KB`;
                if (elStorageBar) elStorageBar.style.width = `${Math.min(100, Math.max(2, pct * 4))}%`;
                if (elStorageSub) elStorageSub.textContent = `Tarayıcı kotasının %${pct}'i kullanılıyor`;
            } catch (e) {
                elStorage.textContent = 'Hesaplanamadı';
            }
        }

        // 2. Toplam Veri Kaydı Sayısı
        const elRecords = document.getElementById('veri-kpi-records');
        const elRecordsSub = document.getElementById('veri-kpi-records-sub');
        if (elRecords) {
            const sinifCount = (appData.sinifListesi || []).length;
            const ogrCount = (appData.tumOgretmenler || []).length;
            const sinavCount = (appData.sinavlar || []).length;
            const kayanCount = (appData.kayanYazi || []).length;
            const liseDersCount = (appData.dersProgramiLise || []).length;
            const ortaDersCount = (appData.dersProgramiOrtaokul || []).length;
            const total = sinifCount + ogrCount + sinavCount + kayanCount + liseDersCount + ortaDersCount;

            elRecords.textContent = `${total} Kayıt`;
            if (elRecordsSub) {
                elRecordsSub.textContent = `${sinifCount} Sınıf, ${ogrCount} Öğretmen, ${sinavCount} Sınav`;
            }
        }

        // 3. Son Yedekleme Zamanı
        const elLastBackup = document.getElementById('veri-kpi-last-backup');
        const elLastTime = document.getElementById('veri-kpi-last-time');
        if (elLastBackup) {
            const history = appData.yedekGecmisi || [];
            if (history.length > 0) {
                const latest = history[0];
                elLastBackup.textContent = latest.tarih || 'Bilinmiyor';
                if (elLastTime) elLastTime.textContent = latest.dosyaAdi || 'Kayıtlı Yedek Noktası';
            } else if (appData.otomatikYedek && appData.otomatikYedek.sonYedekZamani) {
                elLastBackup.textContent = appData.otomatikYedek.sonYedekZamani;
                if (elLastTime) elLastTime.textContent = 'Son Otomatik Yedek';
            } else {
                elLastBackup.textContent = 'Henüz Alınmadı';
                if (elLastTime) elLastTime.textContent = 'Kayıtlı yedek noktası';
            }
        }

        // 4. Otomatik Yedekleyici Durumu
        const elScheduler = document.getElementById('veri-kpi-scheduler-status');
        const elNextRun = document.getElementById('veri-kpi-next-run');
        if (elScheduler) {
            const config = appData.otomatikYedek;
            if (config && config.aktif) {
                elScheduler.textContent = `Aktif (${config.saat || '17:00'})`;
                elScheduler.style.color = '#10b981';
                if (elNextRun) elNextRun.textContent = getKalanSureMetni(config.saat || '17:00');
            } else {
                elScheduler.textContent = 'Kapalı';
                elScheduler.style.color = 'var(--text-muted)';
                if (elNextRun) elNextRun.textContent = 'Planlama bekleniyor';
            }
        }
    };

    function syncAutoBackupFormUI() {
        const chk = document.getElementById('chk-auto-backup-active');
        const txtToggle = document.getElementById('txt-auto-backup-toggle');
        const inpTime = document.getElementById('inp-auto-backup-time');
        const banner = document.getElementById('auto-backup-status-banner');
        const statusText = document.getElementById('auto-backup-status-text');
        const countdown = document.getElementById('auto-backup-countdown');

        if (!chk || !appData || !appData.otomatikYedek) return;
        const config = appData.otomatikYedek;

        const isActive = config.aktif === true;
        chk.checked = isActive;
        if (txtToggle) {
            txtToggle.textContent = isActive ? 'Otomatik Yedekleme: Açık' : 'Otomatik Yedekleme: Kapalı';
        }

        if (inpTime && config.saat) {
            inpTime.value = config.saat;
        }

        if (banner && statusText && countdown) {
            if (isActive) {
                banner.classList.add('active');
                const kalan = getKalanSureMetni(config.saat || '17:00');
                statusText.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Otomatik yedekleme <strong>aktif</strong>. Her gün saat <strong>${config.saat || '17:00'}</strong>'da yedek üretilecek.`;
                countdown.textContent = `Sıradaki Yedek: ${kalan}`;
            } else {
                banner.classList.remove('active');
                statusText.innerHTML = `<i class="fa-solid fa-circle-pause" style="color: #f59e0b;"></i> Otomatik yedekleme <strong>devre dışı</strong>. Yukarıdaki anahtardan aktif edebilirsiniz.`;
                countdown.textContent = 'Durum: Kapalı';
            }
        }

        // Radio butonları senkronize et
        const radios = document.querySelectorAll('input[name="auto-backup-dest"]');
        radios.forEach(radio => {
            radio.checked = (radio.value === config.hedefTur);
        });

        // Klasör rozetini göster/gizle
        const dirBadge = document.getElementById('selected-backup-dir-badge');
        const dirNameSpan = document.getElementById('selected-dir-name');
        if (dirBadge && dirNameSpan) {
            if (config.klasorAdi) {
                dirBadge.style.display = 'block';
                dirNameSpan.textContent = config.klasorAdi;
            } else {
                dirBadge.style.display = 'none';
            }
        }
    }

    function renderBackupHistory() {
        const tbody = document.getElementById('backup-history-list');
        if (!tbody) return;

        const history = appData.yedekGecmisi || [];
        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 25px; color: var(--text-muted);">
                        <i class="fa-solid fa-clock-rotate-left" style="font-size: 1.5rem; opacity: 0.5; margin-bottom: 6px; display: block;"></i>
                        Henüz kaydedilmiş yedek geçmişi bulunmuyor. Otomatik veya manuel yedek aldığınızda burada listelenecektir.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = history.map((item, index) => {
            const isAuto = item.tur === 'Otomatik';
            const badgeStyle = isAuto
                ? 'background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);'
                : 'background: rgba(99, 102, 241, 0.15); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.3);';
            const badgeIcon = isAuto ? 'fa-solid fa-robot' : 'fa-solid fa-user-gear';

            return `
                <tr>
                    <td style="font-weight: 600; color: var(--text-main); white-space: nowrap;">
                        <i class="fa-regular fa-clock" style="color: var(--text-muted); margin-right: 5px;"></i>
                        ${escapeHtml(item.tarih || '-')}
                    </td>
                    <td>
                        <code style="font-size: 0.8rem; background: rgba(0,0,0,0.05); padding: 3px 6px; border-radius: 4px; color: var(--primary);">
                            ${escapeHtml(item.dosyaAdi || 'seyir-yedek.json')}
                        </code>
                    </td>
                    <td style="font-size: 0.82rem; color: var(--text-muted);">
                        ${escapeHtml(item.hedef || 'Tarayıcı İndirmeleri')}
                    </td>
                    <td style="font-size: 0.82rem; font-weight: 600;">
                        ${escapeHtml(item.boyut || '-')}
                    </td>
                    <td>
                        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; ${badgeStyle}">
                            <i class="${badgeIcon}"></i> ${escapeHtml(item.tur || 'Manuel')}
                        </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn-secondary btn-sm" onclick="restoreFromHistory(${index})" title="Bu yedek noktasına geri dön" style="padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;">
                            <i class="fa-solid fa-rotate-left"></i> Geri Yükle
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="downloadFromHistory(${index})" title="JSON olarak indir" style="padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;">
                            <i class="fa-solid fa-download"></i> İndir
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="deleteFromHistory(${index})" title="Listeden sil" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function executeBackupOperation(isAuto = false) {
        formVerileriniOku();
        saveData();

        const timestamp = getTarihSaatEtiketi();
        const dosyaAdi = `seyir-yedek-${timestamp}.json`;
        const yedekVeri = JSON.parse(JSON.stringify(appData));
        delete yedekVeri.yedekGecmisi;
        yedekVeri._meta = {
            tur: isAuto ? 'seyir-auto-backup' : 'seyir-manual-backup',
            surum: 1,
            kisiselVeriIcerir: true,
            olusturmaZamani: new Date().toISOString(),
            etiket: timestamp
        };

        const config = appData.otomatikYedek || {};
        const hedefTur = config.hedefTur || 'indir';
        let hedefMetni = 'Tarayıcı İndirmeleri';

        if (hedefTur === 'dahili') {
            hedefMetni = 'Sistem İçi Güvenli Havuz';
        } else if (hedefTur === 'klasor') {
            hedefMetni = config.klasorAdi ? `Klasör: ${config.klasorAdi}` : 'Yerel Klasör';
            let klasoreYazildi = false;
            if (chosenDirectoryHandle && 'getFileHandle' in chosenDirectoryHandle) {
                try {
                    const opts = { mode: 'readwrite' };
                    let permission = await chosenDirectoryHandle.queryPermission(opts);
                    if (permission !== 'granted') {
                        permission = await chosenDirectoryHandle.requestPermission(opts);
                    }
                    if (permission === 'granted') {
                        const fileHandle = await chosenDirectoryHandle.getFileHandle(dosyaAdi, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(JSON.stringify(yedekVeri, null, 4));
                        await writable.close();
                        klasoreYazildi = true;
                    }
                } catch (err) {
                    console.warn('Yerel klasöre yazılamadı, indirmeye dönülüyor:', err);
                }
            }
            if (!klasoreYazildi) {
                jsonDosyasiIndir(yedekVeri, dosyaAdi);
                hedefMetni = 'Tarayıcı İndirmeleri (Yedek)';
            }
        } else {
            // 'indir'
            jsonDosyasiIndir(yedekVeri, dosyaAdi);
            hedefMetni = 'Tarayıcı İndirmeleri';
        }

        // Yedek geçmişine snapshot olarak kaydet (en fazla 15 kayıt sakla)
        if (!appData.yedekGecmisi) appData.yedekGecmisi = [];
        const yeniKayit = {
            id: 'yedek_' + Date.now(),
            tarih: new Date().toLocaleString('tr-TR'),
            dosyaAdi: dosyaAdi,
            hedef: hedefMetni,
            boyut: ((new Blob([JSON.stringify(yedekVeri)]).size) / 1024).toFixed(1) + ' KB',
            tur: isAuto ? 'Otomatik' : 'Manuel',
            veri: JSON.parse(JSON.stringify(yedekVeri))
        };

        appData.yedekGecmisi.unshift(yeniKayit);
        if (appData.yedekGecmisi.length > 15) {
            appData.yedekGecmisi = appData.yedekGecmisi.slice(0, 15);
        }

        // Otomatik yedekleme son kayıt saatini ve tarihini güncelle
        if (!appData.otomatikYedek) appData.otomatikYedek = {};
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        appData.otomatikYedek.sonYedekTarihi = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        appData.otomatikYedek.sonYedekZamani = now.toLocaleString('tr-TR');

        saveData();
        renderBackupHistory();
        window.updateVeriKPIs();
        syncAutoBackupFormUI();

        return dosyaAdi;
    }

    window.restoreFromHistory = function restoreFromHistory(index) {
        if (!appData.yedekGecmisi || !appData.yedekGecmisi[index]) return;
        const item = appData.yedekGecmisi[index];
        if (!confirm(`"${item.tarih}" tarihli yedeği geri yüklemek istediğinize emin misiniz?\n\nBu işlem mevcut okul panosu verilerinin üzerine yazacaktır.`)) {
            return;
        }
        try {
            const restoredData = JSON.parse(JSON.stringify(item.veri));
            delete restoredData._meta;

            // Yedek geçmişini ve otomatik yedek ayarlarını koru
            const currentHistory = appData.yedekGecmisi;
            const currentAuto = appData.otomatikYedek;

            appData = restoredData;
            if (!appData.yedekGecmisi || appData.yedekGecmisi.length === 0) {
                appData.yedekGecmisi = currentHistory;
            }
            if (!appData.otomatikYedek) {
                appData.otomatikYedek = currentAuto;
            }

            saveData();
            loadData();
            window.updateVeriKPIs();
            renderBackupHistory();
            BhUI.toast(`"${item.tarih}" tarihli yedek noktasına başarıyla dönüldü!`, 'success');
        } catch (err) {
            alert('Geri yükleme başarısız oldu: ' + err.message);
        }
    };

    window.downloadFromHistory = function downloadFromHistory(index) {
        if (!appData.yedekGecmisi || !appData.yedekGecmisi[index]) return;
        const item = appData.yedekGecmisi[index];
        const dosya = item.dosyaAdi || `seyir-yedek-${getTarihSaatEtiketi()}.json`;
        jsonDosyasiIndir(item.veri, dosya);
        BhUI.toast(`"${dosya}" dosyası indirildi.`, 'success');
    };

    window.deleteFromHistory = function deleteFromHistory(index) {
        if (!appData.yedekGecmisi || !appData.yedekGecmisi[index]) return;
        const item = appData.yedekGecmisi[index];
        if (!confirm(`"${item.tarih}" tarihli yedek kaydını listeden silmek istiyor musunuz?`)) {
            return;
        }
        appData.yedekGecmisi.splice(index, 1);
        saveData();
        renderBackupHistory();
        window.updateVeriKPIs();
        BhUI.toast('Yedek kaydı silindi.', 'success');
    };

    function checkAutoBackupScheduler() {
        if (!appData || !appData.otomatikYedek) return;
        const config = appData.otomatikYedek;

        // Her döngüde geri sayım ve durum şeridini tazele
        syncAutoBackupFormUI();
        window.updateVeriKPIs();

        if (!config.aktif) return;

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        // Hedef saat ile mevcut saat eşleşiyorsa ve bugün henüz yedek alınmadıysa
        if (currentTime === config.saat && config.sonYedekTarihi !== todayStr) {
            executeBackupOperation(true).then((dosyaAdi) => {
                BhUI.toast(`🕒 Otomatik Günlük Yedek Alındı: ${dosyaAdi}`, 'success');
            }).catch(err => {
                console.error('Otomatik yedekleme hatası:', err);
            });
        }
    }

    function setupExcelDropzone(dropzoneId, inputId, previewId) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (!dropzone || !input) return;

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                input.files = files;
                showFileSelected(files[0]);
            }
        });

        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                showFileSelected(input.files[0]);
            }
        });

        function showFileSelected(file) {
            if (preview) {
                preview.style.display = 'inline-flex';
                preview.replaceChildren();
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-file-excel';
                preview.append(icon, document.createTextNode(` ${file.name} (${(file.size / 1024).toFixed(1)} KB)`));
            }
            BhUI.toast(`Excel seçildi: ${file.name}. İçe aktarmak için butona tıklayın.`, 'info');
        }
    }

    function initAutoBackupEngine() {
        if (!appData.otomatikYedek) {
            appData.otomatikYedek = {
                aktif: false,
                saat: '17:00',
                hedefTur: 'indir',
                klasorAdi: '',
                sonYedekTarihi: '',
                sonYedekZamani: ''
            };
        }
        if (!appData.yedekGecmisi) {
            appData.yedekGecmisi = [];
        }

        const chkActive = document.getElementById('chk-auto-backup-active');
        if (chkActive) {
            chkActive.addEventListener('change', (e) => {
                appData.otomatikYedek.aktif = e.target.checked;
                saveData();
                syncAutoBackupFormUI();
                window.updateVeriKPIs();
                BhUI.toast(e.target.checked ? 'Otomatik günlük yedekleme açıldı.' : 'Otomatik yedekleme kapatıldı.', 'info');
            });
        }

        const inpTime = document.getElementById('inp-auto-backup-time');
        if (inpTime) {
            inpTime.value = appData.otomatikYedek.saat || '17:00';
            inpTime.addEventListener('change', (e) => {
                appData.otomatikYedek.saat = e.target.value || '17:00';
                saveData();
                syncAutoBackupFormUI();
                window.updateVeriKPIs();
                BhUI.toast(`Yedekleme saati güncellendi: ${appData.otomatikYedek.saat}`, 'info');
            });
        }

        const radios = document.querySelectorAll('input[name="auto-backup-dest"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    appData.otomatikYedek.hedefTur = e.target.value;
                    saveData();
                    syncAutoBackupFormUI();
                    BhUI.toast(`Kayıt hedefi güncellendi: ${e.target.value === 'indir' ? 'Tarayıcı İndirmeleri' : e.target.value === 'klasor' ? 'Yerel Klasör' : 'Sistem İçi Havuz'}`, 'info');
                }
            });
        });

        const btnSelectDir = document.getElementById('btn-select-backup-dir');
        if (btnSelectDir) {
            btnSelectDir.addEventListener('click', async (e) => {
                e.stopPropagation();
                if ('showDirectoryPicker' in window) {
                    try {
                        chosenDirectoryHandle = await window.showDirectoryPicker();
                        appData.otomatikYedek.klasorAdi = chosenDirectoryHandle.name;
                        appData.otomatikYedek.hedefTur = 'klasor';
                        saveData();
                        syncAutoBackupFormUI();
                        BhUI.toast(`Kayıt klasörü seçildi: ${chosenDirectoryHandle.name}`, 'success');
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            BhUI.toast('Klasör seçimi başarısız: ' + err.message, 'warning');
                        }
                    }
                } else {
                    BhUI.toast('Tarayıcınız doğrudan klasör seçimini desteklemiyor. Yedekler otomatik indirme olarak kaydedilecek.', 'info');
                }
            });
        }

        const btnManualNow = document.getElementById('btn-manual-backup-now');
        if (btnManualNow) {
            btnManualNow.addEventListener('click', async () => {
                btnManualNow.disabled = true;
                btnManualNow.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yedek Alınıyor...';
                try {
                    const dosya = await executeBackupOperation(false);
                    BhUI.toast(`Test yedeği başarıyla alındı: ${dosya}`, 'success');
                } catch (err) {
                    BhUI.toast('Yedek alma sırasında hata: ' + err.message, 'error');
                } finally {
                    btnManualNow.disabled = false;
                    btnManualNow.innerHTML = '<i class="fa-solid fa-bolt"></i> Şimdi Test Yedeği Al';
                }
            });
        }

        // Dropzone'ları etkinleştir
        setupExcelDropzone('dropzone-program', 'inp-excel-program', 'preview-filename-program');
        setupExcelDropzone('dropzone-nobet', 'inp-excel-nobet', 'preview-filename-nobet');
        setupExcelDropzone('dropzone-sinav', 'inp-excel-sinav', 'preview-filename-sinav');

        // UI ilk senkronizasyonu
        syncAutoBackupFormUI();
        renderBackupHistory();
        window.updateVeriKPIs();

        // 30 saniyede bir zamanlayıcı kontrolü ve geri sayım tazelemesi
        setInterval(checkAutoBackupScheduler, 30000);
    }

    initAutoBackupEngine();

    // ─── OKUL LOGOSU VE DİNAMİK HABER ÇEKME YÖNETİMİ — Madde 3.1 ───
    const inpLogoFile = document.getElementById('inp-okulLogo-file');
    if (inpLogoFile) {
        inpLogoFile.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            // Maksimum 2MB kontrolü
            if (file.size > 2 * 1024 * 1024) {
                BhUI.toast('Seçilen logo 2MB boyutundan büyük olamaz.', 'warning');
                inpLogoFile.value = '';
                return;
            }

            if (!file.type.startsWith('image/')) {
                BhUI.toast('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, SVG, WebP).', 'warning');
                inpLogoFile.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (evt) {
                const base64 = evt.target.result;
                appData.okulLogo = base64;
                const preview = document.getElementById('img-okulLogo-preview');
                if (preview) preview.src = base64;
                saveData();
                BhUI.toast('Yeni okul logosu yüklendi ve kaydedildi.', 'success');
            };
            reader.onerror = function () {
                BhUI.toast('Görsel okunurken bir hata oluştu.', 'danger');
            };
            reader.readAsDataURL(file);
        });
    }

    const btnResetLogo = document.getElementById('btn-reset-logo');
    if (btnResetLogo) {
        btnResetLogo.addEventListener('click', () => {
            if (confirm('Okul logosunu varsayılana sıfırlamak istediğinize emin misiniz?')) {
                appData.okulLogo = 'img/okul_logo.png';
                const preview = document.getElementById('img-okulLogo-preview');
                if (preview) preview.src = 'img/okul_logo.png';
                const inpFile = document.getElementById('inp-okulLogo-file');
                if (inpFile) inpFile.value = '';
                saveData();
                BhUI.toast('Varsayılan okul logosuna dönüldü.', 'info');
            }
        });
    }

    // Dinamik MEB Haberleri Çekme Fonksiyonu
    let haberIstegiDenetleyici = null;
    let aktifHaberUrl = '';

    async function fetchMebHaberlerOtomatik(hedefUrl) {
        let url = (hedefUrl || document.getElementById('inp-webUrl').value || '').trim();
        const btnFetch = document.getElementById('btn-fetch-meb-news');
        const iconFetch = document.getElementById('icon-fetch-meb');
        const statusEl = document.getElementById('meb-fetch-status');

        if (!url) {
            BhUI.toast('Lütfen önce okul web sitesi adresini girin.', 'warning');
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.style.background = 'rgba(245, 158, 11, 0.12)';
                statusEl.style.color = '#d97706';
                statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Lütfen bir okul web sitesi adresi girin.';
            }
            return;
        }

        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try {
            const parsedUrl = new URL(url);
            const host = parsedUrl.hostname.toLowerCase().replace(/\.$/, '');
            const mebAdresi = host === 'meb.k12.tr' || host.endsWith('.meb.k12.tr') ||
                host === 'meb.gov.tr' || host.endsWith('.meb.gov.tr');
            if (!mebAdresi) throw new Error('Yalnızca resmî MEB okul adresleri kullanılabilir.');
            parsedUrl.protocol = 'https:';
            parsedUrl.port = '';
            url = parsedUrl.toString();
            document.getElementById('inp-webUrl').value = url;
        } catch (urlErr) {
            BhUI.toast(urlErr.message || 'Geçerli bir MEB okul adresi girin.', 'warning');
            return;
        }

        // Aynı URL için change + buton click olayları arka arkaya gelirse ikinci
        // isteği başlatma. URL gerçekten değiştiyse önceki isteği iptal et.
        if (haberIstegiDenetleyici && aktifHaberUrl === url) return;
        if (haberIstegiDenetleyici) haberIstegiDenetleyici.abort();
        const buIstek = new AbortController();
        haberIstegiDenetleyici = buIstek;
        aktifHaberUrl = url;

        if (btnFetch) btnFetch.disabled = true;
        if (iconFetch) iconFetch.classList.add('fa-spin');
        if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(59, 130, 246, 0.12)';
            statusEl.style.color = '#2563eb';
            statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + escapeHtml(url) + ' adresinden haberler çekiliyor...';
        }

        try {
            let data = null;

            const response = await fetch('fetch-haberler.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: 'url=' + encodeURIComponent(url),
                signal: buIstek.signal
            });
            const raw = await response.text();
            const yanitTuru = response.headers.get('content-type') || '';
            const yerelStatikSunucu = /^(?:127\.0\.0\.1|localhost)$/i.test(window.location.hostname) &&
                !/application\/json/i.test(yanitTuru);
            if (raw.trim().startsWith('<?') || yerelStatikSunucu) {
                throw new Error('VS Code Live Server PHP çalıştırmaz. BASLAT-SEYIR.bat dosyasını açın ve http://127.0.0.1:8000 adresini kullanın; mevcut haberler korundu.');
            }
            try {
                data = JSON.parse(raw);
            } catch (jsonHatasi) {
                throw new Error('Haber servisi eski veya eksik kurulmuş. fetch-haberler.php, fetch-gorsel.php ve lib/meb-parser.php dosyalarını birlikte güncelleyin; mevcut haberler korundu.');
            }

            if (data && data.durum === 'basarili') {
                const haberSayisi = data.istatistik ? data.istatistik.toplam : (data.haberler ? data.haberler.length : 0);
                const gorselliSayisi = data.istatistik ? data.istatistik.gorselli : 0;

                // appData mebHaberler güncelle
                if (data.haberler && Array.isArray(data.haberler)) {
                    appData.okulWebSiteUrl = url;
                    baslangicHaberGorselleriniDuzelt(data.haberler);
                    appData.mebHaberler = data.haberler;
                    saveData();
                }

                if (statusEl) {
                    statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
                    statusEl.style.color = '#059669';
                    statusEl.innerHTML = `<strong>✅ Başarılı:</strong> ${haberSayisi} adet haber bu bilgisayara kaydedildi (${gorselliSayisi} görselli).`;
                }
                BhUI.toast(`${haberSayisi} adet MEB haberi başarıyla çekildi.`, 'success');
            } else {
                const hataMesaji = (data && data.mesaj) ? data.mesaj : 'Haberler çekilemedi.';
                if (statusEl) {
                    statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
                    statusEl.style.color = '#dc2626';
                    statusEl.innerHTML = `<strong>⚠️ Çekilemedi:</strong> ${escapeHtml(hataMesaji)}`;
                }
                BhUI.toast('Haber çekme hatası: ' + hataMesaji, 'danger');
            }
        } catch (err) {
            if (err && err.name === 'AbortError') return;
            console.error('Haber çekme hatası:', err);
            if (statusEl) {
                statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
                statusEl.style.color = '#dc2626';
                statusEl.innerHTML = `<strong>⚠️ Servis Hatası:</strong> ${escapeHtml(err.message)}`;
            }
            BhUI.toast(err.message || 'Haber servisine erişilemedi.', 'warning');
        } finally {
            if (haberIstegiDenetleyici === buIstek) {
                haberIstegiDenetleyici = null;
                aktifHaberUrl = '';
                if (btnFetch) btnFetch.disabled = false;
                if (iconFetch) iconFetch.classList.remove('fa-spin');
            }
        }
    }

    const inpWebUrl = document.getElementById('inp-webUrl');
    let sonOtomatikHaberUrl = '';
    function okulAdresiDegisti() {
        const yeniUrl = (inpWebUrl && inpWebUrl.value || '').trim();
        if (!yeniUrl || yeniUrl === sonOtomatikHaberUrl) return;
        sonOtomatikHaberUrl = yeniUrl;
        fetchMebHaberlerOtomatik(yeniUrl);
    }
    if (inpWebUrl) {
        inpWebUrl.addEventListener('change', okulAdresiDegisti);
        inpWebUrl.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            okulAdresiDegisti();
        });
    }

    const btnFetchMebNews = document.getElementById('btn-fetch-meb-news');
    if (btnFetchMebNews) {
        btnFetchMebNews.addEventListener('click', () => {
            fetchMebHaberlerOtomatik();
        });
    }

    // --- SÜRÜKLE BIRAK MANTIĞI & NÖBET YÖNETİMİ ---
    function getNobetZonesList() {
        if (!appData.nobetAlanlari || !Array.isArray(appData.nobetAlanlari) || appData.nobetAlanlari.length === 0) {
            appData.nobetAlanlari = ["Nöbetçi İdareci", "Zemin Kat", "1. Kat", "2. Kat", "3. Kat", "Kantin", "Bahçe"];
        }
        const list = [...appData.nobetAlanlari];
        if (!list.includes("İzinli")) list.push("İzinli");
        return list;
    }

    let currentNobetciDay = "Pazartesi";
    window.teacherPoolFilterQuery = "";

    function saveCurrentDayDnD() {
        const nobetciLines = [];
        document.querySelectorAll('.dnd-zone').forEach(zone => {
            const zoneName = zone.getAttribute('data-zone');
            zone.querySelectorAll('.dnd-teacher-card').forEach(card => {
                const teacherName = (card.getAttribute('data-teacher-name') || '').trim();
                if (teacherName && zoneName && zoneName !== "Havuz") {
                    nobetciLines.push(`${teacherName} (${zoneName})`);
                }
            });
        });
        if (!appData.nobetciGunluk) appData.nobetciGunluk = {};
        appData.nobetciGunluk[currentNobetciDay] = nobetciLines;
        if (typeof renderOgretmenTable === 'function') renderOgretmenTable();
        updateNobetciLivePreview();
    }

    // Görünüm Modu Değiştirici
    window.switchNobetViewMode = function (mode) {
        document.querySelectorAll('.btn-nobet-mode').forEach(b => {
            if (b.getAttribute('data-mode') === mode) {
                b.classList.add('active');
                b.style.background = 'var(--primary)';
                b.style.color = '#ffffff';
                b.style.borderColor = 'var(--primary)';
            } else {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
                b.style.borderColor = 'var(--sidebar-border)';
            }
        });

        const vGunluk = document.getElementById('nobet-view-gunluk');
        const vHaftalik = document.getElementById('nobet-view-haftalik');
        const vTamamlama = document.getElementById('nobet-view-tamamlama');

        if (mode === 'gunluk') {
            if (vGunluk) vGunluk.style.display = 'block';
            if (vHaftalik) vHaftalik.style.display = 'none';
            if (vTamamlama) vTamamlama.style.display = 'none';
            renderNobetciDnD();
        } else if (mode === 'haftalik') {
            saveCurrentDayDnD();
            if (vGunluk) vGunluk.style.display = 'none';
            if (vHaftalik) vHaftalik.style.display = 'block';
            if (vTamamlama) vTamamlama.style.display = 'none';
            renderHaftalikNobetCizelgesi();
        } else if (mode === 'tamamlama') {
            saveCurrentDayDnD();
            if (vGunluk) vGunluk.style.display = 'none';
            if (vHaftalik) vHaftalik.style.display = 'none';
            if (vTamamlama) vTamamlama.style.display = 'flex';
            const selEl = document.getElementById('tamamlama-gun-select');
            let selectedGun = selEl ? selEl.value : (currentNobetciDay || "Pazartesi");
            if (selEl && selectedGun) selEl.value = selectedGun;
            renderTamamlama(selectedGun);
        }
    };

    // Gün Seçici Düğmeleri
    document.querySelectorAll('.day-selector .btn-day').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-tamamlama')) return;
            saveCurrentDayDnD();

            document.querySelectorAll('.day-selector .btn-day').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const targetDay = e.target.getAttribute('data-day');
            if (targetDay) {
                currentNobetciDay = targetDay;
                renderNobetciDnD();
            }
        });
    });

    document.getElementById('tamamlama-gun-select')?.addEventListener('change', (e) => {
        renderTamamlama(e.target.value);
    });

    function renderNobetciDnD() {
        const poolEl = document.getElementById('dnd-pool');
        const zonesEl = document.getElementById('dnd-zones');
        if (!poolEl || !zonesEl) return;

        poolEl.innerHTML = '';
        zonesEl.innerHTML = '';

        const zonesList = getNobetZonesList();

        // Zone'ları oluştur
        zonesList.forEach(z => {
            const zDiv = document.createElement('div');
            zDiv.className = 'dnd-zone';
            zDiv.setAttribute('data-zone', z);
            zDiv.setAttribute('ondrop', 'dropToZone(event)');
            zDiv.setAttribute('ondragover', 'allowDrop(event)');
            zDiv.setAttribute('ondragleave', 'leaveDrop(event)');

            const defaultZones = ["Nöbetçi İdareci", "Zemin Kat", "1. Kat", "2. Kat", "3. Kat", "Kantin", "Bahçe", "İzinli"];
            const isCustom = !defaultZones.includes(z);
            const isIzinli = z === "İzinli";
            const zoneIcon = isIzinli ? 'fa-bed' : (z.includes('İdareci') ? 'fa-user-shield' : (z.includes('Bahçe') ? 'fa-tree' : (z.includes('Kantin') ? 'fa-utensils' : 'fa-building')));
            const zoneColor = isIzinli ? '#ef4444' : (z.includes('İdareci') ? '#f59e0b' : (z.includes('Bahçe') ? '#10b981' : (z.includes('Kantin') ? '#06b6d4' : '#3b82f6')));

            zDiv.style.borderLeftColor = zoneColor;
            zDiv.style.setProperty('--zone-color', zoneColor);

            let headerActions = `
                <button type="button" class="btn-zone-action" onclick="openQuickAssignForZone('${escapeJsAttr(z)}')" title="Bu alana hızlı öğretmen ata">
                    <i class="fa-solid fa-plus"></i> Ata
                </button>
            `;
            if (isCustom) {
                headerActions += `
                    <button type="button" class="btn-zone-action danger" onclick="silNobetAlani('${escapeJsAttr(z)}')" title="Bu nöbet alanını sil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
            }

            zDiv.innerHTML = `
                <div class="dnd-zone-title" style="color: ${zoneColor}; border-color: ${zoneColor}60;">
                    <i class="fa-solid ${zoneIcon}"></i>
                    <span>${escapeHtml(z)}</span>
                    <span class="dnd-zone-count" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">(0)</span>
                </div>
                <div class="dnd-zone-header-actions">
                    ${headerActions}
                </div>
            `;

            zonesEl.appendChild(zDiv);
        });

        // Tüm öğretmenleri (appData.tumOgretmenler) ve atanmışları eşleştir
        let allTeachers = appData.tumOgretmenler || [];
        let assignedTeachers = [];

        if (!appData.nobetciGunluk) {
            appData.nobetciGunluk = {};
            if (appData.nobetciOgretmenler && appData.nobetciOgretmenler.length > 0) {
                appData.nobetciGunluk["Pazartesi"] = [...appData.nobetciOgretmenler];
            }
        }

        const currentDayTeachers = appData.nobetciGunluk[currentNobetciDay] || [];

        currentDayTeachers.forEach(n => {
            const match = n.match(/^(.*?)\s*\((.*?)\)$/);
            const isim = match ? match[1].trim() : n.trim();
            const yer = match ? match[2].trim() : "";

            assignedTeachers.push({ isim, yer });

            if (!allTeachers.includes(isim)) {
                allTeachers.push(isim);
            }
        });

        const filterQuery = (window.teacherPoolFilterQuery || '').toLowerCase();
        let unassignedCount = 0;

        // Öğretmenleri yerleştir
        allTeachers.forEach((t, i) => {
            const card = document.createElement('div');
            card.className = 'dnd-teacher-card';
            card.draggable = true;
            card.id = 'tcard-' + i;
            card.setAttribute('data-teacher-name', t);
            card.setAttribute('ondragstart', 'dragStart(event)');

            const assignment = assignedTeachers.find(a => a.isim === t);
            if (assignment && assignment.yer) {
                card.innerHTML = `
                    <i class="fa-solid fa-grip-vertical grip-icon"></i>
                    <span>${escapeHtml(t)}</span>
                    <button type="button" class="btn-card-remove" onclick="removeTeacherFromZone('${escapeJsAttr(t)}')" title="Havuza Geri Gönder">✕</button>
                `;
                const targetZone = document.querySelector(`.dnd-zone[data-zone="${CSS.escape(assignment.yer)}"]`);
                if (targetZone) {
                    targetZone.appendChild(card);
                } else {
                    poolEl.appendChild(card);
                    unassignedCount++;
                }
            } else {
                unassignedCount++;
                const matchesFilter = !filterQuery || t.toLowerCase().includes(filterQuery);
                if (matchesFilter) {
                    card.innerHTML = `
                        <i class="fa-solid fa-grip-vertical grip-icon"></i>
                        <span>${escapeHtml(t)}</span>
                        <button type="button" class="btn-card-assign" onclick="openQuickAssignModal('${escapeJsAttr(t)}')" title="Nöbet Yerine Ata">+</button>
                    `;
                    poolEl.appendChild(card);
                }
            }
        });

        // Zone içindeki kart sayılarını güncelle
        document.querySelectorAll('.dnd-zone').forEach(zEl => {
            const cardsInZone = zEl.querySelectorAll('.dnd-teacher-card').length;
            const countEl = zEl.querySelector('.dnd-zone-count');
            if (countEl) countEl.textContent = `(${cardsInZone})`;
        });

        // Modal içeriğini doldur
        const inpTeachers = document.getElementById('inp-teachers-pool');
        if (inpTeachers) inpTeachers.value = allTeachers.join('\n');

        // Sayaç güncelle
        const countSpan = document.getElementById('unassigned-count');
        if (countSpan) {
            countSpan.textContent = `(${unassignedCount} / ${allTeachers.length} Atanmamış)`;
        }

        updateNobetciLivePreview();
    }

    function updateNobetciLivePreview() {
        const previewList = document.getElementById('nobet-tv-preview-list');
        const lblTitle = document.getElementById('lbl-preview-day-title');
        if (lblTitle) lblTitle.textContent = currentNobetciDay;
        if (!previewList) return;

        const currentDayTeachers = (appData.nobetciGunluk && appData.nobetciGunluk[currentNobetciDay]) || [];
        const activeTeachers = currentDayTeachers.filter(n => !n.includes("(Diğer)") && !n.includes("(İzinli)") && !n.includes("(Ders Tamamlama)"));

        if (activeTeachers.length === 0) {
            previewList.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 0.82rem; border: 1px dashed rgba(255,255,255,0.15); border-radius: 10px;">
                    🛡️ Bu gün için henüz nöbetçi öğretmen atanmadı.
                </div>
            `;
            return;
        }

        const nobetColors = ['#34d399', '#60a5fa', '#c084fc', '#fbbf24', '#22d3ee', '#f472b6'];
        let html = '';

        activeTeachers.forEach((ogretmen, idx) => {
            const match = ogretmen.match(/^(.*?)\s*\((.*?)\)$/);
            const isim = match ? match[1].trim() : ogretmen.trim();
            const yer = match ? match[2].trim() : "Nöbet Alanı";
            const nColor = nobetColors[idx % nobetColors.length];

            html += `
                <div class="nobet-tv-item" style="border: 1px solid ${nColor}45; border-left: 4px solid ${nColor};">
                    <div style="background: ${nColor}22; color: ${nColor}; border: 1px solid ${nColor}45; width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0;">
                        🛡️
                    </div>
                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.7rem; font-weight: 700; color: ${nColor}; text-transform: uppercase;">
                            📍 ${escapeHtml(yer)}
                        </span>
                        <span style="font-size: 0.92rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Outfit', sans-serif;">
                            ${escapeHtml(isim)}
                        </span>
                    </div>
                </div>
            `;
        });

        previewList.innerHTML = html;
    }

    function updateUnassignedCount() {
        const pool = document.getElementById('dnd-pool');
        const countSpan = document.getElementById('unassigned-count');
        const allTeachers = appData.tumOgretmenler || [];
        if (!pool || !countSpan) return;
        countSpan.textContent = `(${pool.children.length} / ${allTeachers.length} Atanmamış)`;
    }

    window.filterTeacherPool = function (query) {
        window.teacherPoolFilterQuery = (query || '').trim();
        renderNobetciDnD();
    };

    window.removeTeacherFromZone = function (teacherName) {
        if (!appData.nobetciGunluk || !appData.nobetciGunluk[currentNobetciDay]) return;
        appData.nobetciGunluk[currentNobetciDay] = appData.nobetciGunluk[currentNobetciDay].filter(n => {
            const match = n.match(/^(.*?)\s*\((.*?)\)$/);
            const isim = match ? match[1].trim() : n.trim();
            return isim !== teacherName;
        });
        saveData();
        renderNobetciDnD();
    };

    window.openQuickAssignModal = function (teacherName) {
        const modal = document.getElementById('modal-quick-assign');
        const nameEl = document.getElementById('quick-assign-teacher-name');
        const dayEl = document.getElementById('quick-assign-day-name');
        const listEl = document.getElementById('quick-assign-zones-list');
        if (!modal || !nameEl || !listEl) return;

        nameEl.textContent = teacherName;
        if (dayEl) dayEl.textContent = currentNobetciDay;
        listEl.innerHTML = '';

        const zonesList = getNobetZonesList();
        zonesList.forEach(z => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'padding: 9px 14px; text-align: left; background: #f8fafc; border: 1px solid var(--sidebar-border); border-radius: 8px; font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;';
            btn.onmouseover = () => { btn.style.background = 'var(--primary-glow)'; btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
            btn.onmouseout = () => { btn.style.background = '#f8fafc'; btn.style.borderColor = 'var(--sidebar-border)'; btn.style.color = 'var(--text-main)'; };
            btn.innerHTML = `
                <span>📍 ${escapeHtml(z)}</span>
                <i class="fa-solid fa-chevron-right" style="font-size: 0.8rem; opacity: 0.5;"></i>
            `;
            btn.onclick = () => {
                assignTeacherToZone(teacherName, z);
                closeQuickAssignModal();
            };
            listEl.appendChild(btn);
        });

        modal.style.display = 'flex';
    };

    window.openQuickAssignForZone = function (zoneName) {
        const allTeachers = appData.tumOgretmenler || [];
        const assigned = (appData.nobetciGunluk && appData.nobetciGunluk[currentNobetciDay]) || [];
        const assignedNames = assigned.map(n => {
            const m = n.match(/^(.*?)\s*\((.*?)\)$/);
            return m ? m[1].trim() : n.trim();
        });
        const unassigned = allTeachers.filter(t => !assignedNames.includes(t));

        if (unassigned.length === 0) {
            BhUI.toast('Havuzda atanmamış öğretmen kalmadı.', 'warning');
            return;
        }

        const modal = document.getElementById('modal-quick-assign');
        const nameEl = document.getElementById('quick-assign-teacher-name');
        const dayEl = document.getElementById('quick-assign-day-name');
        const listEl = document.getElementById('quick-assign-zones-list');
        if (!modal || !nameEl || !listEl) return;

        nameEl.textContent = zoneName + " Alanı";
        if (dayEl) dayEl.textContent = currentNobetciDay;
        listEl.innerHTML = '';

        unassigned.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'padding: 9px 14px; text-align: left; background: #f8fafc; border: 1px solid var(--sidebar-border); border-radius: 8px; font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;';
            btn.onmouseover = () => { btn.style.background = 'var(--primary-glow)'; btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
            btn.onmouseout = () => { btn.style.background = '#f8fafc'; btn.style.borderColor = 'var(--sidebar-border)'; btn.style.color = 'var(--text-main)'; };
            btn.innerHTML = `
                <span>👨‍🏫 ${escapeHtml(t)}</span>
                <i class="fa-solid fa-plus" style="font-size: 0.85rem; color: var(--primary);"></i>
            `;
            btn.onclick = () => {
                assignTeacherToZone(t, zoneName);
                closeQuickAssignModal();
            };
            listEl.appendChild(btn);
        });

        modal.style.display = 'flex';
    };

    window.closeQuickAssignModal = function () {
        const modal = document.getElementById('modal-quick-assign');
        if (modal) modal.style.display = 'none';
    };

    window.assignTeacherToZone = function (teacherName, zoneName) {
        if (!appData.nobetciGunluk) appData.nobetciGunluk = {};
        if (!appData.nobetciGunluk[currentNobetciDay]) appData.nobetciGunluk[currentNobetciDay] = [];

        appData.nobetciGunluk[currentNobetciDay] = appData.nobetciGunluk[currentNobetciDay].filter(n => {
            const m = n.match(/^(.*?)\s*\((.*?)\)$/);
            const isim = m ? m[1].trim() : n.trim();
            return isim !== teacherName;
        });

        appData.nobetciGunluk[currentNobetciDay].push(`${teacherName} (${zoneName})`);
        saveData();
        renderNobetciDnD();
        BhUI.toast(`${teacherName}, ${zoneName} alanına atandı.`, 'success');
    };

    window.openAddZoneModal = function () {
        const modal = document.getElementById('modal-add-zone');
        const inp = document.getElementById('inp-new-zone-name');
        if (inp) inp.value = '';
        if (modal) modal.style.display = 'flex';
        setTimeout(() => { if (inp) inp.focus(); }, 100);
    };

    window.closeAddZoneModal = function () {
        const modal = document.getElementById('modal-add-zone');
        if (modal) modal.style.display = 'none';
    };

    window.saveNewZone = function () {
        const inp = document.getElementById('inp-new-zone-name');
        const val = inp ? inp.value.trim() : '';
        if (!val) {
            BhUI.toast('Lütfen geçerli bir nöbet alanı adı girin.', 'warning');
            return;
        }

        const currentZones = getNobetZonesList();
        if (currentZones.includes(val)) {
            BhUI.toast('Bu nöbet alanı zaten mevcut.', 'warning');
            return;
        }

        if (!appData.nobetAlanlari) appData.nobetAlanlari = ["Nöbetçi İdareci", "Zemin Kat", "1. Kat", "2. Kat", "3. Kat", "Kantin", "Bahçe"];
        appData.nobetAlanlari.push(val);
        saveData();
        closeAddZoneModal();
        renderNobetciDnD();
        BhUI.toast(`"${val}" nöbet alanı başarıyla eklendi.`, 'success');
    };

    window.silNobetAlani = function (zoneName) {
        if (!confirm(`"${zoneName}" nöbet alanını silmek istediğinize emin misiniz?`)) return;
        if (!appData.nobetAlanlari) return;
        appData.nobetAlanlari = appData.nobetAlanlari.filter(z => z !== zoneName);
        saveData();
        renderNobetciDnD();
        BhUI.toast(`"${zoneName}" alanı silindi.`, 'success');
    };

    window.temizleGununNobetcileri = function () {
        const count = (appData.nobetciGunluk && appData.nobetciGunluk[currentNobetciDay] && appData.nobetciGunluk[currentNobetciDay].length) || 0;
        if (count === 0) {
            BhUI.toast(`${currentNobetciDay} günü için atanmış öğretmen bulunmuyor.`, 'info');
            return;
        }
        if (!confirm(`${currentNobetciDay} gününün tüm nöbet atamalarını havuza geri göndermek istediğinize emin misiniz?`)) return;
        appData.nobetciGunluk[currentNobetciDay] = [];
        saveData();
        renderNobetciDnD();
        BhUI.toast(`${currentNobetciDay} gününün atamaları sıfırlandı.`, 'success');
    };

    window.kopyalaNobetGunuSecili = function () {
        const sel = document.getElementById('sel-kopyala-kaynak-gun');
        const kaynakGun = sel ? sel.value : '';
        if (!kaynakGun) {
            BhUI.toast('Lütfen kopyalanacak kaynak günü seçin.', 'warning');
            return;
        }
        if (kaynakGun === currentNobetciDay) {
            BhUI.toast('Aynı günü kendi üzerine kopyalayamazsınız.', 'warning');
            return;
        }
        const kaynakListe = (appData.nobetciGunluk && appData.nobetciGunluk[kaynakGun]) || [];
        if (kaynakListe.length === 0) {
            BhUI.toast(`${kaynakGun} gününde henüz nöbetçi ataması bulunmuyor.`, 'warning');
            return;
        }
        if (!confirm(`${kaynakGun} günündeki ${kaynakListe.length} nöbet atamasını ${currentNobetciDay} gününe aktarmak istiyor musunuz?`)) return;

        if (!appData.nobetciGunluk) appData.nobetciGunluk = {};
        appData.nobetciGunluk[currentNobetciDay] = [...kaynakListe];
        saveData();
        renderNobetciDnD();
        sel.value = '';
        BhUI.toast(`${kaynakGun} günü ${currentNobetciDay} gününe kopyalandı.`, 'success');
    };

    window.renderHaftalikNobetCizelgesi = function () {
        const tbody = document.getElementById('haftalik-cizelge-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
        const zones = getNobetZonesList();
        const dailyData = appData.nobetciGunluk || {};

        zones.forEach(zone => {
            const tr = document.createElement('tr');
            const isIzinli = zone === "İzinli";

            let tdZone = `<td style="font-weight: 700; ${isIzinli ? 'color: #ef4444;' : 'color: var(--primary);'}">
                <i class="fa-solid ${isIzinli ? 'fa-bed' : (zone.includes('İdareci') ? 'fa-user-shield' : 'fa-location-dot')}"></i> ${escapeHtml(zone)}
            </td>`;

            let tdsDays = '';
            days.forEach(day => {
                const list = dailyData[day] || [];
                const teachersInZone = [];

                list.forEach(item => {
                    const match = item.match(/^(.*?)\s*\((.*?)\)$/);
                    const isim = match ? match[1].trim() : item.trim();
                    const yer = match ? match[2].trim() : "";
                    if (yer === zone) {
                        teachersInZone.push(isim);
                    }
                });

                if (teachersInZone.length === 0) {
                    tdsDays += `<td style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">-</td>`;
                } else {
                    const pills = teachersInZone.map(t => `
                        <span class="cizelge-teacher-pill" style="${isIzinli ? 'border-color: #fca5a5; background: #fef2f2; color: #b91c1c;' : ''}">
                            <i class="fa-solid ${isIzinli ? 'fa-user-slash' : 'fa-user-check'}" style="font-size: 0.72rem; color: ${isIzinli ? '#ef4444' : 'var(--primary)'};"></i>
                            ${escapeHtml(t)}
                        </span>
                    `).join('');
                    tdsDays += `<td>${pills}</td>`;
                }
            });

            tr.innerHTML = tdZone + tdsDays;
            tbody.appendChild(tr);
        });
    };

    window.exportHaftalikNobetToExcel = function () {
        if (typeof XLSX === 'undefined') {
            BhUI.toast('Excel kütüphanesi henüz yüklenmedi.', 'error');
            return;
        }

        saveCurrentDayDnD();

        const okulAdi = (appData.okul && appData.okul.okulAdi) || 'Okul';
        const bugun = new Date();
        const tarihStr = bugun.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        const dosyaTarih = bugun.toLocaleDateString('tr-TR').replace(/\//g, '-');

        const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
        const zones = getNobetZonesList();
        const dailyData = appData.nobetciGunluk || {};

        const ws_data = [
            [`${okulAdi} - HAFTALIK NÖBETÇİ ÖĞRETMEN ÇİZELGESİ`],
            [`Tarih: ${tarihStr}`],
            [],
            ["Nöbet Alanı / Kat", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"]
        ];

        zones.forEach(zone => {
            const row = [zone];
            days.forEach(day => {
                const list = dailyData[day] || [];
                const teachers = [];
                list.forEach(item => {
                    const match = item.match(/^(.*?)\s*\((.*?)\)$/);
                    const isim = match ? match[1].trim() : item.trim();
                    const yer = match ? match[2].trim() : "";
                    if (yer === zone) {
                        teachers.push(isim);
                    }
                });
                row.push(teachers.join(', ') || '-');
            });
            ws_data.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [
            { wch: 22 },
            { wch: 26 },
            { wch: 26 },
            { wch: 26 },
            { wch: 26 },
            { wch: 26 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Haftalık Nöbet");
        XLSX.writeFile(wb, `Haftalik_Nobet_Cizelgesi_${dosyaTarih}.xlsx`);
        BhUI.toast('Haftalık nöbet çizelgesi Excel olarak indirildi.', 'success');
    };

    window.allowDrop = (ev) => {
        ev.preventDefault();
        const zone = ev.target.closest('.dnd-zone');
        if (zone) zone.classList.add('drag-over');
    };

    window.leaveDrop = (ev) => {
        const zone = ev.target.closest('.dnd-zone');
        if (zone) zone.classList.remove('drag-over');
    };

    window.dragStart = (ev) => {
        ev.dataTransfer.setData("text", ev.target.id);
    };

    window.dropToZone = (ev) => {
        ev.preventDefault();
        const zone = ev.target.closest('.dnd-zone');
        const data = ev.dataTransfer.getData("text");
        if (zone) {
            zone.classList.remove('drag-over');
            const cardEl = document.getElementById(data);
            if (cardEl) {
                const teacherName = cardEl.getAttribute('data-teacher-name');
                const targetZoneName = zone.getAttribute('data-zone');
                if (teacherName && targetZoneName) {
                    assignTeacherToZone(teacherName, targetZoneName);
                } else {
                    zone.appendChild(cardEl);
                    saveCurrentDayDnD();
                    updateUnassignedCount();
                }
            }
        }
    };

    window.dropToPool = (ev) => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const cardEl = document.getElementById(data);
        if (cardEl) {
            const teacherName = cardEl.getAttribute('data-teacher-name');
            if (teacherName) {
                removeTeacherFromZone(teacherName);
            } else {
                const pool = document.getElementById('dnd-pool');
                if (pool) pool.appendChild(cardEl);
                saveCurrentDayDnD();
                updateUnassignedCount();
            }
        }
    };

    // Modal Yönetimi
    document.getElementById('btn-edit-teachers')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-teachers');
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
        modal.style.pointerEvents = 'auto';
    });

    document.getElementById('btn-close-teachers')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-teachers');
        if (!modal) return;
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => modal.style.display = 'none', 300);
    });

    document.getElementById('btn-save-teachers')?.addEventListener('click', () => {
        const lines = document.getElementById('inp-teachers-pool').value.split('\n').map(x => x.trim()).filter(x => x);
        appData.tumOgretmenler = [...new Set(lines)]; // Tekrar edenleri temizle
        renderNobetciDnD(); // Yeniden çiz
        document.getElementById('btn-close-teachers')?.click();
        BhUI.toast('Öğretmen havuzu güncellendi.', 'success');
    });

    window.renderTamamlama = function (gun) {
        const grid = document.getElementById('tamamlama-grid');
        const atananlarBody = document.getElementById('tamamlama-atananlar-body');

        if (!grid) return;
        grid.innerHTML = '';

        if (atananlarBody) {
            atananlarBody.innerHTML = '';
        }

        let currentDayTeachers = [];
        if (appData.nobetciGunluk && appData.nobetciGunluk[gun]) {
            // "Diğer", "Ders Tamamlama" ve "İzinli" bölgelerine atanmış eski kayıtları dikkate alma
            currentDayTeachers = appData.nobetciGunluk[gun].filter(n => {
                return !n.includes("(Diğer)") && !n.includes("(Ders Tamamlama)") && !n.includes("(İzinli)");
            });
        }

        // O günkü atamaları çek (eğer yoksa başlat)
        if (!appData.tamamlamaAtamalari) appData.tamamlamaAtamalari = {};
        if (!appData.tamamlamaAtamalari[gun]) appData.tamamlamaAtamalari[gun] = [];
        const gununAtamalari = appData.tamamlamaAtamalari[gun];

        // Alt tabloyu (Atanan Dersler) doldur
        if (atananlarBody) {
            if (gununAtamalari.length === 0) {
                atananlarBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text3);">Bu gün için henüz bir ders tamamlama ataması yapılmamıştır.</td></tr>';
            } else {
                // Saat (period) sırasına göre sırala
                const siraliAtamalar = [...gununAtamalari].sort((a, b) => a.saat - b.saat);
                siraliAtamalar.forEach((atama, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td style="padding: 12px 15px; border-bottom: 1px solid var(--sidebar-border); color: var(--text1); font-weight: bold;">${atama.saat + 1}. Ders</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid var(--sidebar-border);">
                        <div style="font-weight: 600; color: var(--primary);">${escapeHtml(atama.sinif)}</div>
                        <div style="font-size: 0.85rem; color: var(--text2);">${escapeHtml(atama.dersAdi)}</div>
                    </td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid var(--sidebar-border); color: var(--text2);"><i class="fa-solid fa-bed" style="color: #ef4444; font-size:0.8rem; margin-right:5px;"></i> ${escapeHtml(atama.izinli)}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid var(--sidebar-border); color: var(--text1); font-weight:600;"><i class="fa-solid fa-user-tie" style="color: #10b981; font-size:0.8rem; margin-right:5px;"></i> ${escapeHtml(atama.nobetci)}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid var(--sidebar-border); text-align: right;">
                        <button class="btn-secondary btn-sm" onclick="deleteTamamlamaAtama('${escapeJsAttr(gun)}', ${idx})" style="background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;"><i class="fa-solid fa-trash"></i> İptal</button>
                    </td>
                `;
                    atananlarBody.appendChild(tr);
                });
            }
        }

        if (currentDayTeachers.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text2); background: rgba(255,255,255,0.02); border-radius: 8px;">Bu gün için nöbetçi öğretmen bulunmamaktadır.</div>';
            return;
        }

        // Nöbetçi öğretmen isimlerini ayrıştır (yer bilgisini sil)
        const teachersList = currentDayTeachers.map(n => {
            const match = n.match(/^(.*?)\s*\((.*?)\)$/);
            return match ? match[1].trim() : n.trim();
        });

        // Ders programından boş dersleri hesapla
        const teacherSchedules = {};
        teachersList.forEach(t => {
            teacherSchedules[t] = new Array(8).fill(false); // false = boş, true = dolu
        });

        if (appData.dersProgramiDetay) {
            for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
                // Küçük/Büyük harf ve Türkçe karakter eşleşmesi kontrolü
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    for (let i = 0; i < 8; i++) {
                        const dersBilgisi = gData[i];
                        if (dersBilgisi && dersBilgisi.type === 'ders' && dersBilgisi.ogretmen) {
                            // Eğer bu dersi veren öğretmen nöbetçiler listesindeyse
                            if (teacherSchedules.hasOwnProperty(dersBilgisi.ogretmen.trim())) {
                                teacherSchedules[dersBilgisi.ogretmen.trim()][i] = true;
                            }
                        }
                    }
                }
            }
        }

        // Ekrana bas
        teachersList.forEach(t => {
            const schedule = teacherSchedules[t];
            let badgesHtml = '';
            let emptyCount = 0;

            for (let i = 0; i < 8; i++) {
                // Acaba bu öğretmene bu saate atama yapılmış mı kontrol edelim
                const atamaVarMi = gununAtamalari.find(a => a.nobetci === t && a.saat === i);

                if (atamaVarMi) {
                    // Atanmış (Dolu)
                    badgesHtml += `<span onclick="deleteTamamlamaAtamaByProps('${escapeJsAttr(gun)}', '${escapeJsAttr(t)}', ${i})" style="display:inline-block; margin: 3px; padding: 4px 8px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); font-size: 0.8rem; font-weight: bold; cursor: pointer;" title="İptal etmek için tıklayın">${i + 1}. ${escapeHtml(atamaVarMi.sinif)} (Tamamlama)</span>`;
                } else if (schedule[i]) {
                    // Kendi Dersi (Dolu)
                    badgesHtml += `<span style="display:inline-block; margin: 3px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); color: var(--text-muted, #9ca3af); font-size: 0.8rem; text-decoration: line-through; cursor: not-allowed;">${i + 1}. Ders</span>`;
                } else {
                    // Boş Ders (Yeşil)
                    emptyCount++;
                    badgesHtml += `<span onclick="openAtamaModal('${escapeJsAttr(gun)}', '${escapeJsAttr(t)}', ${i})" style="display:inline-block; margin: 3px; padding: 4px 8px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.3); font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 5px rgba(16,185,129,0.2);" onmouseover="this.style.background='rgba(16,185,129,0.3)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='rgba(16,185,129,0.2)'; this.style.transform='translateY(0)';">${i + 1}. Ders (Boş)</span>`;
                }
            }

            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.padding = '15px';

            const titleColor = emptyCount > 0 ? 'var(--text1)' : 'var(--text3, #9ca3af)';

            card.innerHTML = `
            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px; color: ${titleColor}; display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fa-solid fa-user-tie" style="color: var(--primary);"></i> ${escapeHtml(t)}</span>
                <span style="font-size: 0.8rem; padding: 3px 8px; border-radius: 12px; background: ${emptyCount > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${emptyCount > 0 ? '#10b981' : '#ef4444'};">${emptyCount} Boş Ders</span>
            </div>
            <div>${badgesHtml}</div>
        `;
            grid.appendChild(card);
        });
    }

    window.deleteTamamlamaAtama = function (gun, index) {
        if (confirm("Bu ders tamamlama atamasını iptal etmek istediğinize emin misiniz?")) {
            if (appData.tamamlamaAtamalari && appData.tamamlamaAtamalari[gun]) {
                appData.tamamlamaAtamalari[gun].splice(index, 1);
                saveData();
                renderTamamlama(gun);
                BhUI.toast('Atama iptal edildi.', 'success');
            }
        }
    };

    window.deleteTamamlamaAtamaByProps = function (gun, nobetci, saat) {
        if (confirm("Bu ders tamamlama atamasını iptal etmek istediğinize emin misiniz?")) {
            if (appData.tamamlamaAtamalari && appData.tamamlamaAtamalari[gun]) {
                const index = appData.tamamlamaAtamalari[gun].findIndex(a => a.nobetci === nobetci && a.saat === saat);
                if (index > -1) {
                    appData.tamamlamaAtamalari[gun].splice(index, 1);
                    saveData();
                    renderTamamlama(gun);
                    BhUI.toast('Atama iptal edildi.', 'success');
                }
            }
        }
    };

    window.openAtamaModal = function (gun, nobetciAdi, saatIndex) {
        document.getElementById('modal-atama-nobetci').textContent = nobetciAdi;
        document.getElementById('modal-atama-saat').textContent = (saatIndex + 1) + ".";

        const listeEl = document.getElementById('modal-atama-liste');
        listeEl.innerHTML = '';

        // İzinli Öğretmenleri bul
        let izinliOgretmenler = [];
        if (appData.nobetciGunluk && appData.nobetciGunluk[gun]) {
            const izinliOlanlar = appData.nobetciGunluk[gun].filter(n => n.includes("(İzinli)"));
            izinliOgretmenler = izinliOlanlar.map(n => {
                const match = n.match(/^(.*?)\s*\((.*?)\)$/);
                return match ? match[1].trim() : n.trim();
            });
        }

        if (izinliOgretmenler.length === 0) {
            listeEl.innerHTML = '<div style="padding: 15px; text-align: center; color: #9ca3af; border: 1px dashed #4b5563; border-radius: 8px;">Bugün için "İzinli" kutusuna eklenmiş hiçbir öğretmen bulunmuyor. Lütfen önce Nöbetçi Öğretmenler ekranından izinli öğretmenleri ilgili kutuya sürükleyip kaydedin.</div>';
            document.getElementById('modal-ders-atama').style.display = 'flex';
            return;
        }

        // İzinli Öğretmenlerin o saatteki derslerini bul
        const atanabilecekDersler = []; // { izinli: 'Ahmet', sinif: '10/A', dersAdi: 'Matematik' }

        if (appData.dersProgramiDetay) {
            for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    const dersBilgisi = gData[saatIndex];
                    if (dersBilgisi && dersBilgisi.type === 'ders' && dersBilgisi.ogretmen) {
                        const ogrIsim = dersBilgisi.ogretmen.trim();
                        if (izinliOgretmenler.includes(ogrIsim)) {
                            // Zaten daha önce başkasına atanmış mı bu ders?
                            let zatenAtanmisMi = false;
                            if (appData.tamamlamaAtamalari && appData.tamamlamaAtamalari[gun]) {
                                zatenAtanmisMi = appData.tamamlamaAtamalari[gun].some(a => a.izinli === ogrIsim && a.saat === saatIndex && a.sinif === sinif);
                            }

                            if (!zatenAtanmisMi) {
                                atanabilecekDersler.push({
                                    izinli: ogrIsim,
                                    sinif: sinif,
                                    dersAdi: dersBilgisi.ders
                                });
                            }
                        }
                    }
                }
            }
        }

        if (atanabilecekDersler.length === 0) {
            listeEl.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); border: 1px dashed var(--sidebar-border); border-radius: 8px;">Bugün izinli olan öğretmenlerin ' + (saatIndex + 1) + '. derste boşta olan bir dersi bulunmuyor.</div>';
        } else {
            atanabilecekDersler.forEach(d => {
                const div = document.createElement('div');
                div.style.padding = '12px 15px';
                div.style.background = '#f8fafc';
                div.style.border = '1px solid var(--sidebar-border)';
                div.style.color = 'var(--text-main)';
                div.style.borderRadius = '10px';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.marginBottom = '10px';
                div.style.cursor = 'pointer';
                div.style.transition = 'all 0.2s';

                div.onmouseover = () => { div.style.background = 'rgba(16,185,129,0.1)'; div.style.borderColor = '#10b981'; };
                div.onmouseout = () => { div.style.background = '#f8fafc'; div.style.borderColor = 'var(--sidebar-border)'; };

                div.innerHTML = `
                <div>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 1.05rem; margin-bottom: 3px;">${escapeHtml(d.sinif)}</div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;"><span style="color: var(--primary); font-weight: 600;">${escapeHtml(d.dersAdi)}</span> - <i class="fa-solid fa-bed" style="color:#ef4444; font-size:0.75rem;"></i> ${escapeHtml(d.izinli)}</div>
                </div>
                <button class="btn-primary btn-sm btn-glow-sm" style="background:#10b981; border:none; padding:6px 14px; border-radius:6px; color:white; font-weight:bold;"><i class="fa-solid fa-check"></i> Ata</button>
            `;

                div.onclick = () => {
                    kaydetAtama(gun, nobetciAdi, saatIndex, d.izinli, d.sinif, d.dersAdi);
                };

                listeEl.appendChild(div);
            });
        }

        document.getElementById('modal-ders-atama').style.display = 'flex';
    };
    function kaydetAtama(gun, nobetciAdi, saatIndex, izinliAdi, sinif, dersAdi) {
        if (!appData.tamamlamaAtamalari) appData.tamamlamaAtamalari = {};
        if (!appData.tamamlamaAtamalari[gun]) appData.tamamlamaAtamalari[gun] = [];

        appData.tamamlamaAtamalari[gun].push({
            nobetci: nobetciAdi,
            izinli: izinliAdi,
            sinif: sinif,
            dersAdi: dersAdi,
            saat: saatIndex,
            timestamp: new Date().getTime()
        });

        saveData();
        document.getElementById('modal-ders-atama').style.display = 'none';
        renderTamamlama(gun); // Ekranı yenile
        BhUI.toast(nobetciAdi + ', ' + sinif + ' sınıfına atandı.', 'success');
    };

    // Veri Sıfırlama (Reset) Sistemi
    const btnResetData = document.getElementById('btn-reset-data');
    const modalReset = document.getElementById('modal-reset');
    const btnCloseReset = document.getElementById('btn-close-reset');
    const inpResetConfirm = document.getElementById('inp-reset-confirm');
    const btnExecuteReset = document.getElementById('btn-execute-reset');

    if (btnResetData && modalReset) {
        btnResetData.addEventListener('click', () => {
            modalReset.style.display = 'flex';
            setTimeout(() => modalReset.style.opacity = '1', 10);
            modalReset.style.pointerEvents = 'auto';
            inpResetConfirm.value = '';
            btnExecuteReset.style.pointerEvents = 'none';
            btnExecuteReset.style.opacity = '0.5';
        });

        btnCloseReset.addEventListener('click', () => {
            modalReset.style.opacity = '0';
            modalReset.style.pointerEvents = 'none';
            setTimeout(() => modalReset.style.display = 'none', 300);
        });

        inpResetConfirm.addEventListener('input', (e) => {
            if (e.target.value === 'SIFIRLA') {
                btnExecuteReset.style.pointerEvents = 'auto';
                btnExecuteReset.style.opacity = '1';
            } else {
                btnExecuteReset.style.pointerEvents = 'none';
                btnExecuteReset.style.opacity = '0.5';
            }
        });

        btnExecuteReset.addEventListener('click', () => {
            if (document.getElementById('chk-reset-siniflar').checked) {
                appData.sinifListesi = [];
                appData.sinifRehberlik = {};
            }
            if (document.getElementById('chk-reset-ogretmenler').checked) {
                appData.tumOgretmenler = [];
                appData.ogretmenBranslar = [];
            }
            if (document.getElementById('chk-reset-nobet').checked) {
                appData.nobetciOgretmenler = [];
                appData.nobetciGunluk = {};
            }
            if (document.getElementById('chk-reset-program').checked) {
                appData.dersProgramiDetay = {};
                appData.sinifDersleri = {};
                appData.sinifDersOgretmen = {};
                appData.dersProgramiLise = [];
                appData.dersProgramiOrtaokul = [];
            }
            if (document.getElementById('chk-reset-havuz').checked) {
                appData.dersHavuzuLise = [];
                appData.dersHavuzuOrtaokul = [];
            }
            if (document.getElementById('chk-reset-zaman')?.checked) {
                appData.dersProgrami = {};
            }
            if (document.getElementById('chk-reset-duyurular')?.checked) {
                appData.duyurular = [];
            }
            if (document.getElementById('chk-reset-sinavlar')?.checked) {
                appData.sinavlar = [];
            }
            if (document.getElementById('chk-reset-kayanyazi')?.checked) {
                appData.kayanYazi = [];
            }
            if (document.getElementById('chk-reset-videolar')?.checked) {
                appData.karuselVideolar = [];
            }

            saveData();

            if (typeof populateForms === 'function') populateForms();
            if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
            if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
            if (typeof renderDuyurular === 'function') renderDuyurular();
            if (typeof renderSinavlar === 'function') renderSinavlar();
            if (typeof renderKayanYazilar === 'function') renderKayanYazilar();
            if (typeof renderKaruselVideoUI === 'function') renderKaruselVideoUI();

            btnCloseReset.click();
            BhUI.toast('Seçili veriler başarıyla sıfırlandı.', 'success');
        });
    }

});
// ============================================================
// --- DERS YÖNETİMİ MANTIĞI (TAB-PROGRAM) ---
// ============================================================
window.currentProgramSinif = null;
window.currentProgramKademeFilter = 'all';

// Çakışma Denetimi (Bir öğretmen aynı gün ve saatte birden fazla sınıfta derste mi?)
window.checkTeacherConflicts = function () {
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const conflictMap = {}; // { "Pazartesi": { "0": { "Ahmet Yılmaz": ["9A", "9B"] } } }
    let totalConflicts = 0;

    days.forEach(day => {
        conflictMap[day] = {};
        for (let p = 0; p < 10; p++) {
            const teacherAssignments = {}; // { "Ahmet Yılmaz": ["9A", "9B"] }

            if (appData.dersProgramiDetay && typeof appData.dersProgramiDetay === 'object') {
                for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
                    const gData = gunlerObj[day] || gunlerObj[day.toLowerCase()];
                    if (gData && gData[p] && gData[p].type === 'ders') {
                        const hoca = (gData[p].ogretmen || gData[p].hoca || '').trim();
                        if (hoca && hoca !== '-' && hoca !== '') {
                            if (!teacherAssignments[hoca]) teacherAssignments[hoca] = [];
                            teacherAssignments[hoca].push(sinif);
                        }
                    }
                }
            }

            for (const [hoca, sinifListesi] of Object.entries(teacherAssignments)) {
                if (sinifListesi.length > 1) {
                    if (!conflictMap[day][p]) conflictMap[day][p] = {};
                    conflictMap[day][p][hoca] = sinifListesi;
                    totalConflicts += (sinifListesi.length - 1);
                }
            }
        }
    });

    return { count: totalConflicts, details: conflictMap };
};

// Canlı İstatistik Kartlarını Güncelle
window.updateProgramStats = function () {
    const sinifDolulukEl = document.getElementById('prog-stat-sinif-doluluk');
    const sinifSubEl = document.getElementById('prog-stat-sinif-sub');
    const toplamSaatEl = document.getElementById('prog-stat-toplam-saat');
    const toplamSubEl = document.getElementById('prog-stat-toplam-sub');
    const ogretmenOranEl = document.getElementById('prog-stat-ogretmen-oran');
    const ogretmenSubEl = document.getElementById('prog-stat-ogretmen-sub');
    const cakisDurumEl = document.getElementById('prog-stat-cakis-durum');
    const cakisSubEl = document.getElementById('prog-stat-cakis-sub');
    const cakisIconEl = document.getElementById('prog-stat-cakis-icon');

    if (!sinifDolulukEl) return;

    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    // 1. Seçili Sınıf Doluluk
    if (window.currentProgramSinif) {
        const sinifIsOrta = ['5', '6', '7', '8'].some(n => window.currentProgramSinif.startsWith(n));
        const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
        const totalPeriods = (vakitler.length > 0 ? vakitler.length : 8) * 5;

        let filledPeriods = 0;
        let teacherAssigned = 0;
        const sinifData = (appData.dersProgramiDetay && appData.dersProgramiDetay[window.currentProgramSinif]) || {};

        days.forEach(day => {
            const gData = sinifData[day] || sinifData[day.toLowerCase()];
            if (gData) {
                for (let p = 0; p < (vakitler.length || 8); p++) {
                    if (gData[p] && gData[p].type === 'ders' && gData[p].ders) {
                        filledPeriods++;
                        if (gData[p].ogretmen || gData[p].hoca) teacherAssigned++;
                    }
                }
            }
        });

        const pct = totalPeriods > 0 ? Math.round((filledPeriods / totalPeriods) * 100) : 0;
        sinifDolulukEl.textContent = `${filledPeriods} / ${totalPeriods} Saat (%${pct})`;
        sinifSubEl.textContent = filledPeriods === totalPeriods ? '✅ Haftalık Program Tam' : `⚠️ ${totalPeriods - filledPeriods} Saat Boş Ders Var`;
    } else {
        sinifDolulukEl.textContent = '-';
        sinifSubEl.textContent = 'Lütfen bir sınıf seçin';
    }

    // 2. Toplam Okul Programı & Öğretmen Oranı
    let totalSchoolHours = 0;
    let totalTeacherAssignedHours = 0;
    const classesWithSchedule = new Set();

    if (appData.dersProgramiDetay && typeof appData.dersProgramiDetay === 'object') {
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            let classHasLessons = false;
            days.forEach(day => {
                const gData = gunlerObj[day] || gunlerObj[day.toLowerCase()];
                if (gData) {
                    for (let p = 0; p < 10; p++) {
                        if (gData[p] && gData[p].type === 'ders' && gData[p].ders) {
                            totalSchoolHours++;
                            classHasLessons = true;
                            if (gData[p].ogretmen || gData[p].hoca) totalTeacherAssignedHours++;
                        }
                    }
                }
            });
            if (classHasLessons) classesWithSchedule.add(sinif);
        }
    }

    toplamSaatEl.textContent = `${totalSchoolHours} Saat`;
    toplamSubEl.textContent = `${classesWithSchedule.size} Sınıf Tanımlı`;

    const teacherPct = totalSchoolHours > 0 ? Math.round((totalTeacherAssignedHours / totalSchoolHours) * 100) : 0;
    ogretmenOranEl.textContent = `%${teacherPct}`;
    ogretmenSubEl.textContent = `${totalTeacherAssignedHours} / ${totalSchoolHours} Saat Öğretmenli`;

    // 3. Çakışma Denetimi
    const conflictResult = checkTeacherConflicts();
    if (conflictResult.count === 0) {
        cakisDurumEl.textContent = 'Kusursuz';
        cakisDurumEl.style.color = '#059669';
        cakisSubEl.textContent = 'Aynı saatte çakışan ders yok';
        if (cakisIconEl) {
            cakisIconEl.className = 'program-stat-icon icon-green';
            cakisIconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        }
    } else {
        cakisDurumEl.textContent = `⚠️ ${conflictResult.count} Çakışma!`;
        cakisDurumEl.style.color = '#dc2626';
        cakisSubEl.textContent = 'Aynı saatte birden fazla sınıfta ders var!';
        if (cakisIconEl) {
            cakisIconEl.className = 'program-stat-icon icon-red';
            cakisIconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }
    }
};

// Kademe Filtre Çiplerini Çiz
window.renderProgramKademeChips = function () {
    const chipsContainer = document.getElementById('program-kademe-chips');
    const eslestirmeChipsContainer = document.getElementById('eslestirme-kademe-chips');

    const filters = [
        { id: 'all', label: 'Tüm Kademeler' },
        { id: 'ortaokul', label: '🎒 Ortaokul (5-8)' },
        { id: 'lise', label: '🏛️ Lise (9-12)' },
        { id: '5', label: '5. Sınıf' },
        { id: '6', label: '6. Sınıf' },
        { id: '7', label: '7. Sınıf' },
        { id: '8', label: '8. Sınıf' },
        { id: '9', label: '9. Sınıf' },
        { id: '10', label: '10. Sınıf' },
        { id: '11', label: '11. Sınıf' },
        { id: '12', label: '12. Sınıf' }
    ];

    [chipsContainer, eslestirmeChipsContainer].forEach((cont, idx) => {
        if (!cont) return;
        cont.innerHTML = '';
        const currentFilter = (idx === 0) ? window.currentProgramKademeFilter : (window.currentEslestirmeKademeFilter || 'all');

        filters.forEach(f => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'program-chip-btn' + (f.id === currentFilter ? ' active' : '');
            btn.textContent = f.label;
            btn.onclick = () => {
                if (idx === 0) {
                    window.currentProgramKademeFilter = f.id;
                    renderProgramKademeChips();
                    renderProgramClassButtons();
                } else {
                    window.currentEslestirmeKademeFilter = f.id;
                    renderProgramKademeChips();
                    renderEslestirmeClassButtons();
                }
            };
            cont.appendChild(btn);
        });
    });
};

// Sınıf Butonlarını Çiz
window.renderProgramClassButtons = function () {
    const container = document.getElementById('program-class-buttons');
    if (!container) return;
    container.innerHTML = '';

    renderProgramKademeChips();

    const siniflar = appData.sinifListesi || [];
    const filter = window.currentProgramKademeFilter || 'all';

    const filtered = siniflar.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'ortaokul') return ['5', '6', '7', '8'].some(n => s.startsWith(n));
        if (filter === 'lise') return ['9', '10', '11', '12'].some(n => s.startsWith(n));
        return s.startsWith(filter);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Bu kademede kayıtlı sınıf bulunamadı.</span>`;
        return;
    }

    filtered.forEach(sinif => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'program-class-btn' + (sinif === window.currentProgramSinif ? ' active' : '');

        // Renk paleti
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#0284c7'];
        const color = colors[appData.sinifListesi.indexOf(sinif) % colors.length];

        btn.style.backgroundColor = sinif === window.currentProgramSinif ? color : 'rgba(255, 255, 255, 0.9)';
        btn.style.color = sinif === window.currentProgramSinif ? '#ffffff' : '#1e293b';
        btn.style.borderColor = color;

        // Doluluk hesapla
        const sinifIsOrta = ['5', '6', '7', '8'].some(n => sinif.startsWith(n));
        const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
        const totalPeriods = (vakitler.length > 0 ? vakitler.length : 8) * 5;
        let filled = 0;
        const sData = (appData.dersProgramiDetay && appData.dersProgramiDetay[sinif]) || {};
        ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"].forEach(day => {
            const g = sData[day] || sData[day.toLowerCase()];
            if (g) {
                for (let p = 0; p < (vakitler.length || 8); p++) {
                    if (g[p] && g[p].type === 'ders' && g[p].ders) filled++;
                }
            }
        });

        const badgeColor = filled === totalPeriods ? '#059669' : (filled > 0 ? '#d97706' : '#94a3b8');
        btn.innerHTML = `
            <span>${escapeHtml(sinif)}</span>
            <span class="program-class-badge" style="background:${sinif === window.currentProgramSinif ? 'rgba(0,0,0,0.25)' : badgeColor}; color:${sinif === window.currentProgramSinif ? '#ffffff' : '#ffffff'};">${filled}/${totalPeriods}</span>
        `;

        btn.onclick = () => {
            window.currentProgramSinif = sinif;
            renderProgramClassButtons();
            renderProgramMatrix();
        };

        container.appendChild(btn);
    });

    updateProgramStats();
};

// Haftalık Program Çarşaf Matrisi
window.renderProgramMatrix = function () {
    const tableEl = document.getElementById('program-matrix-table');
    const containerEl = document.getElementById('program-matrix-container');
    const emptyEl = document.getElementById('program-matrix-empty');
    const bannerEl = document.getElementById('program-selected-class-banner');

    if (!window.currentProgramSinif) {
        if (containerEl) containerEl.style.display = 'none';
        if (bannerEl) bannerEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        updateProgramStats();
        return;
    }

    if (containerEl) containerEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (bannerEl) bannerEl.style.display = 'flex';

    const sinifIsOrta = ['5', '6', '7', '8'].some(n => window.currentProgramSinif.startsWith(n));
    const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
    const periodCount = (vakitler.length > 0 ? vakitler.length : 8);
    const totalPossiblePeriods = periodCount * 5;

    // Banner Güncelle
    const bannerSinif = document.getElementById('banner-sinif-adi');
    const bannerRehber = document.getElementById('banner-sinif-rehber');
    const bannerSaat = document.getElementById('banner-sinif-saat');
    if (bannerSinif) bannerSinif.textContent = window.currentProgramSinif;
    if (bannerRehber) bannerRehber.textContent = `🎓 Rehber: ${appData.sinifRehberlik?.[window.currentProgramSinif] || 'Tanımsız'}`;

    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
    if (!appData.dersProgramiDetay[window.currentProgramSinif]) appData.dersProgramiDetay[window.currentProgramSinif] = {};
    const sinifData = appData.dersProgramiDetay[window.currentProgramSinif];

    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    // Çakışmaları kontrol et
    const conflictResult = checkTeacherConflicts();
    const conflictDetails = conflictResult.details;

    // Ders Seçenekleri (Sınıfın Dersleri + Havuz)
    const sinifDersleri = (appData.sinifDersleri && appData.sinifDersleri[window.currentProgramSinif]) || [];
    const poolDersleri = sinifIsOrta ? (appData.dersHavuzuOrtaokul || defaultDerslerOrtaokul) : (appData.dersHavuzuLise || defaultDerslerLise);

    let dersOptionsHtml = '<option value="">-- Boş --</option>';
    if (sinifDersleri.length > 0) {
        dersOptionsHtml += '<optgroup label="Sınıfa Atanan Dersler">';
        sinifDersleri.forEach(d => {
            dersOptionsHtml += `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`;
        });
        dersOptionsHtml += '</optgroup>';
    }

    const otherPool = poolDersleri.filter(d => !sinifDersleri.includes(d));
    if (otherPool.length > 0) {
        dersOptionsHtml += '<optgroup label="Diğer Havuz Dersleri">';
        otherPool.forEach(d => {
            dersOptionsHtml += `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`;
        });
        dersOptionsHtml += '</optgroup>';
    }

    // Öğretmen Listesi (Türkçe alfabetik sıralı)
    const teachersList = [...(appData.tumOgretmenler || [])].sort((a, b) => a.localeCompare(b, 'tr'));

    tableEl.innerHTML = '';

    // THEAD
    let theadHtml = `
        <thead>
            <tr>
                <th class="matrix-th matrix-th-period">Ders / Saat</th>
                ${days.map(d => `<th class="matrix-th">${d}</th>`).join('')}
            </tr>
        </thead>
    `;
    tableEl.innerHTML += theadHtml;

    // TBODY
    let tbodyHtml = '<tbody>';
    const dayCounts = [0, 0, 0, 0, 0];
    let totalFilled = 0;

    for (let pIdx = 0; pIdx < periodCount; pIdx++) {
        const v = vakitler[pIdx] || { ders: `${pIdx + 1}. Ders`, saat: '' };
        tbodyHtml += `<tr>`;
        tbodyHtml += `
            <td class="matrix-td matrix-period-cell">
                <div class="matrix-period-title">${escapeHtml(v.ders || (pIdx + 1) + '. Ders')}</div>
                <div class="matrix-period-time">${escapeHtml(v.saat || '')}</div>
            </td>
        `;

        days.forEach((day, dIdx) => {
            const cell = sinifData[day]?.[pIdx] || sinifData[day.toLowerCase()]?.[pIdx];
            const currentDers = cell?.ders || '';
            let currentHoca = cell?.ogretmen || cell?.hoca || '';

            // Otomatik hoca önerisi: Eğer derse atanmış bir hoca varsa ve henüz bu hücrede hoca seçilmemişse
            if (!currentHoca && currentDers && appData.sinifDersOgretmen?.[window.currentProgramSinif]?.[currentDers]) {
                currentHoca = appData.sinifDersOgretmen[window.currentProgramSinif][currentDers];
                if (cell) cell.ogretmen = currentHoca;
            }

            if (currentDers) {
                dayCounts[dIdx]++;
                totalFilled++;
            }

            // Çakışma kontrolü
            const conflictClasses = (conflictDetails[day] && conflictDetails[day][pIdx] && currentHoca) ? conflictDetails[day][pIdx][currentHoca] : null;
            const hasConflict = conflictClasses && conflictClasses.length > 1;

            // Öğretmen seçenekleri oluştur
            let hocaOptionsHtml = '<option value="">-- Öğretmen Yok --</option>';
            teachersList.forEach(t => {
                const isSelected = (currentHoca && t.trim().toLowerCase() === currentHoca.trim().toLowerCase());
                hocaOptionsHtml += `<option value="${escapeHtml(t)}"${isSelected ? ' selected' : ''}>${escapeHtml(t)}</option>`;
            });

            // Ders seçenekleri seçili işaretleme
            let cellDersOptions = dersOptionsHtml;
            if (currentDers) {
                cellDersOptions = cellDersOptions.replace(`value="${escapeHtml(currentDers)}"`, `value="${escapeHtml(currentDers)}" selected`);
            }

            tbodyHtml += `
                <td class="matrix-td${hasConflict ? ' matrix-cell-conflict' : ''}" style="position:relative;">
                    <div class="matrix-cell-box">
                        <select class="matrix-ders-select" onchange="updateProgramCellLesson('${escapeJsAttr(window.currentProgramSinif)}', '${day}', ${pIdx}, this.value)">
                            ${cellDersOptions}
                        </select>
                        <select class="matrix-hoca-select${!currentHoca ? ' empty-teacher' : ''}" onchange="updateProgramCellTeacher('${escapeJsAttr(window.currentProgramSinif)}', '${day}', ${pIdx}, this.value)" title="${currentHoca ? 'Ders Öğretmeni: ' + escapeHtml(currentHoca) : 'Öğretmen Atanmamış'}">
                            ${hocaOptionsHtml}
                        </select>
                        ${hasConflict ? `<span class="matrix-conflict-badge" title="Çakışan Sınıflar: ${escapeHtml(conflictClasses.join(', '))}"><i class="fa-solid fa-triangle-exclamation"></i> Çakışma: ${escapeHtml(conflictClasses.filter(c => c !== window.currentProgramSinif).join(', '))}</span>` : ''}
                        ${currentDers ? `<button type="button" class="matrix-cell-clear-btn" onclick="clearProgramCell('${escapeJsAttr(window.currentProgramSinif)}', '${day}', ${pIdx})" title="Bu Dersi Temizle">✕</button>` : ''}
                    </div>
                </td>
            `;
        });

        tbodyHtml += `</tr>`;
    }

    // TFOOT (Günlük Toplamlar)
    tbodyHtml += `
        </tbody>
        <tfoot>
            <tr style="background:#f8fafc; font-weight:700; color:var(--text-main);">
                <td class="matrix-td" style="text-align:center; padding:10px 6px;">Toplam: ${totalFilled} Saat</td>
                ${dayCounts.map(cnt => `<td class="matrix-td" style="text-align:center; padding:10px 6px; color:#2563eb;">${cnt} Saat</td>`).join('')}
            </tr>
        </tfoot>
    `;

    tableEl.innerHTML += tbodyHtml;

    if (bannerSaat) {
        bannerSaat.textContent = `${totalFilled} / ${totalPossiblePeriods} Saat`;
    }

    updateProgramStats();
};

// Hücre Ders Adı Güncelle
window.updateProgramCellLesson = function (sinif, gun, periodIndex, dersAdi) {
    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
    if (!appData.dersProgramiDetay[sinif]) appData.dersProgramiDetay[sinif] = {};
    if (!appData.dersProgramiDetay[sinif][gun]) appData.dersProgramiDetay[sinif][gun] = {};

    if (dersAdi) {
        // Otomatik varsayılan öğretmen ataması
        let defaultHoca = '';
        if (appData.sinifDersOgretmen && appData.sinifDersOgretmen[sinif] && appData.sinifDersOgretmen[sinif][dersAdi]) {
            defaultHoca = appData.sinifDersOgretmen[sinif][dersAdi];
        } else if (appData.dersProgramiDetay[sinif][gun][periodIndex]?.ogretmen) {
            defaultHoca = appData.dersProgramiDetay[sinif][gun][periodIndex].ogretmen;
        }

        appData.dersProgramiDetay[sinif][gun][periodIndex] = {
            ders: dersAdi,
            ogretmen: defaultHoca,
            type: 'ders'
        };

        // Sınıfın ders havuzuna da ekle (yoksa)
        if (!appData.sinifDersleri) appData.sinifDersleri = {};
        if (!appData.sinifDersleri[sinif]) appData.sinifDersleri[sinif] = [];
        if (!appData.sinifDersleri[sinif].includes(dersAdi)) {
            appData.sinifDersleri[sinif].push(dersAdi);
        }
    } else {
        delete appData.dersProgramiDetay[sinif][gun][periodIndex];
    }

    saveData();
    renderProgramClassButtons();
    renderProgramMatrix();
};

// Hücre Öğretmen Güncelle
window.updateProgramCellTeacher = function (sinif, gun, periodIndex, ogretmenAdi) {
    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
    if (!appData.dersProgramiDetay[sinif]) appData.dersProgramiDetay[sinif] = {};
    if (!appData.dersProgramiDetay[sinif][gun]) appData.dersProgramiDetay[sinif][gun] = {};

    if (!appData.dersProgramiDetay[sinif][gun][periodIndex]) {
        appData.dersProgramiDetay[sinif][gun][periodIndex] = {
            ders: '',
            ogretmen: ogretmenAdi,
            type: 'ders'
        };
    } else {
        appData.dersProgramiDetay[sinif][gun][periodIndex].ogretmen = ogretmenAdi;
    }

    // Sınıfın bu dersi için varsayılan öğretmen olarak da hafızaya al
    const currentDers = appData.dersProgramiDetay[sinif][gun][periodIndex].ders;
    if (currentDers && ogretmenAdi) {
        if (!appData.sinifDersOgretmen) appData.sinifDersOgretmen = {};
        if (!appData.sinifDersOgretmen[sinif]) appData.sinifDersOgretmen[sinif] = {};
        appData.sinifDersOgretmen[sinif][currentDers] = ogretmenAdi;
    }

    saveData();
    renderProgramMatrix();
};

// Hücreyi Temizle
window.clearProgramCell = function (sinif, gun, periodIndex) {
    if (appData.dersProgramiDetay && appData.dersProgramiDetay[sinif] && appData.dersProgramiDetay[sinif][gun]) {
        delete appData.dersProgramiDetay[sinif][gun][periodIndex];
        saveData();
        renderProgramClassButtons();
        renderProgramMatrix();
    }
};

// Sınıf Programını Temizle
window.temizleSinifProgrami = function () {
    if (!window.currentProgramSinif) {
        BhUI.toast('Lütfen önce temizlemek istediğiniz sınıfı seçin.', 'warning');
        return;
    }

    if (confirm(`"${window.currentProgramSinif}" sınıfının tüm haftalık ders programını sıfırlamak istediğinize emin misiniz?`)) {
        if (appData.dersProgramiDetay && appData.dersProgramiDetay[window.currentProgramSinif]) {
            appData.dersProgramiDetay[window.currentProgramSinif] = {};
            saveData();
            renderProgramClassButtons();
            renderProgramMatrix();
            BhUI.toast(`${window.currentProgramSinif} sınıfının ders programı temizlendi.`, 'info');
        }
    }
};

// Sınıf Kopyalama Modalı
window.openSinifKopyalaModal = function () {
    if (!window.currentProgramSinif) {
        BhUI.toast('Lütfen önce kopyalamak istediğiniz kaynak sınıfı seçin.', 'warning');
        return;
    }

    const modal = document.getElementById('modal-sinif-kopyala');
    const inpKaynak = document.getElementById('inp-kopyala-kaynak-sinif');
    const selHedef = document.getElementById('sel-kopyala-hedef-sinif');

    if (!modal || !inpKaynak || !selHedef) return;

    inpKaynak.value = window.currentProgramSinif;
    selHedef.innerHTML = '';

    const siniflar = appData.sinifListesi || [];
    siniflar.forEach(s => {
        if (s !== window.currentProgramSinif) {
            selHedef.innerHTML += `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`;
        }
    });

    modal.style.display = 'flex';
};

window.closeSinifKopyalaModal = function () {
    const modal = document.getElementById('modal-sinif-kopyala');
    if (modal) modal.style.display = 'none';
};

window.uygulaSinifKopyala = function () {
    const kaynak = window.currentProgramSinif;
    const selHedef = document.getElementById('sel-kopyala-hedef-sinif');
    const hedef = selHedef ? selHedef.value : null;

    if (!kaynak || !hedef) {
        BhUI.toast('Hedef sınıf seçilmedi.', 'error');
        return;
    }

    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};

    // Programı derin kopyala
    const kaynakProgram = appData.dersProgramiDetay[kaynak] || {};
    appData.dersProgramiDetay[hedef] = JSON.parse(JSON.stringify(kaynakProgram));

    // Sınıf derslerini kopyala
    if (appData.sinifDersleri && appData.sinifDersleri[kaynak]) {
        appData.sinifDersleri[hedef] = [...appData.sinifDersleri[kaynak]];
    }

    // Sınıf öğretmen eşleştirmelerini kopyala
    if (appData.sinifDersOgretmen && appData.sinifDersOgretmen[kaynak]) {
        appData.sinifDersOgretmen[hedef] = JSON.parse(JSON.stringify(appData.sinifDersOgretmen[kaynak]));
    }

    saveData();
    closeSinifKopyalaModal();
    window.currentProgramSinif = hedef;
    renderProgramClassButtons();
    renderProgramMatrix();
    BhUI.toast(`Program başarıyla ${kaynak} sınıfından ${hedef} sınıfına kopyalandı!`, 'success');
};

// Sınıf Programını Resmi MEB Formatında Yazdır / PDF
window.yazdirSinifProgrami = function () {
    if (!window.currentProgramSinif) {
        BhUI.toast('Lütfen ders programını yazdırmak istediğiniz sınıfı seçin.', 'warning');
        return;
    }

    const sinifAdi = window.currentProgramSinif;
    const sinifIsOrta = ['5', '6', '7', '8'].some(n => sinifAdi.startsWith(n));
    const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
    const periodCount = vakitler.length > 0 ? vakitler.length : 8;
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    const sinifData = (appData.dersProgramiDetay && appData.dersProgramiDetay[sinifAdi]) || {};
    const rehberHoca = appData.sinifRehberlik?.[sinifAdi] || '-';
    const okulAdi = (appData.okulAdi || 'Okul') + ' ' + (appData.okulTuru || '');
    const bugun = new Date().toLocaleDateString('tr-TR');

    let totalLessonsCount = 0;
    const subjectTeacherMap = {}; // { "MATEMATİK": { saat: 6, hoca: "Ahmet YILMAZ" } }

    let rowsHtml = '';
    for (let p = 0; p < periodCount; p++) {
        const v = vakitler[p] || { ders: `${p + 1}. Ders`, saat: '' };
        rowsHtml += `<tr>`;
        rowsHtml += `<td style="font-weight:bold; background:#f8fafc; text-align:center; padding:8px; border:1px solid #cbd5e1;">${escapeHtml(v.ders)}<br><small style="color:#64748b; font-weight:normal;">${escapeHtml(v.saat || '')}</small></td>`;

        days.forEach(day => {
            const cell = sinifData[day]?.[p] || sinifData[day.toLowerCase()]?.[p];
            if (cell && cell.type === 'ders' && cell.ders) {
                const dAdi = cell.ders;
                const hoca = cell.ogretmen || cell.hoca || '-';
                totalLessonsCount++;

                if (!subjectTeacherMap[dAdi]) {
                    subjectTeacherMap[dAdi] = { saat: 0, hoca: hoca };
                }
                subjectTeacherMap[dAdi].saat++;
                if (hoca !== '-' && (!subjectTeacherMap[dAdi].hoca || subjectTeacherMap[dAdi].hoca === '-')) {
                    subjectTeacherMap[dAdi].hoca = hoca;
                }

                rowsHtml += `
                    <td style="padding:8px; text-align:center; border:1px solid #cbd5e1; background:#f0fdf4;">
                        <strong style="color:#15803d; font-size:1.02em; display:block;">${escapeHtml(dAdi)}</strong>
                        <span style="color:#475569; font-size:0.85em;">${escapeHtml(hoca)}</span>
                    </td>
                `;
            } else {
                rowsHtml += `<td style="padding:8px; text-align:center; border:1px solid #e2e8f0; color:#94a3b8; font-size:0.85em;">-</td>`;
            }
        });

        rowsHtml += `</tr>`;
    }

    // Ders dağılım tablosu
    let subjectRowsHtml = '';
    let subIdx = 1;
    for (const [dAdi, info] of Object.entries(subjectTeacherMap)) {
        subjectRowsHtml += `
            <tr>
                <td style="text-align:center; padding:4px 8px; border:1px solid #cbd5e1;">${subIdx++}</td>
                <td style="padding:4px 8px; border:1px solid #cbd5e1; font-weight:bold;">${escapeHtml(dAdi)}</td>
                <td style="text-align:center; padding:4px 8px; border:1px solid #cbd5e1; font-weight:bold; color:#1d4ed8;">${info.saat}</td>
                <td style="padding:4px 8px; border:1px solid #cbd5e1;">${escapeHtml(info.hoca)}</td>
            </tr>
        `;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
        BhUI.toast('Yazdırma penceresi açılamadı. Lütfen tarayıcı açılır pencere iznini kontrol edin.', 'error');
        return;
    }

    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(sinifAdi)} - Haftalık Ders Programı</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; }
                .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }
                .header h1 { margin: 0; font-size: 1.35rem; color: #1e3a8a; }
                .header h2 { margin: 4px 0 0 0; font-size: 1.15rem; color: #3b82f6; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 0.95rem; background: #f8fafc; padding: 10px 16px; border-radius: 8px; border: 1px solid #cbd5e1; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; }
                th { background: #1e3a8a; color: white; padding: 9px; font-size: 0.92rem; border: 1px solid #1e3a8a; }
                td { border: 1px solid #cbd5e1; }
                .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.9rem; text-align: center; }
                .footer-box { width: 28%; }
                @media print {
                    body { padding: 0; }
                    @page { size: landscape; margin: 12mm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${escapeHtml(okulAdi)}</h1>
                <h2>SINIF HAFTALIK DERS ÇİZELGESİ</h2>
            </div>
            <div class="meta">
                <div><strong>Sınıf:</strong> ${escapeHtml(sinifAdi)} &nbsp;|&nbsp; <strong>Sınıf Rehber Öğretmeni:</strong> ${escapeHtml(rehberHoca)}</div>
                <div><strong>Haftalık Toplam Ders:</strong> ${totalLessonsCount} Saat &nbsp;|&nbsp; <strong>Tarih:</strong> ${bugun}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:13%;">Ders / Saat</th>
                        ${days.map(d => `<th style="width:17.4%;">${d}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div style="margin-top: 20px; display: grid; grid-template-columns: 1.8fr 1fr; gap: 20px;">
                <div>
                    <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; color: #1e3a8a;">DERSLER VE DERS ÖĞRETMENLERİ</h4>
                    <table style="margin-top: 0; font-size: 0.85rem;">
                        <thead>
                            <tr style="background:#475569;">
                                <th style="width:30px; padding:4px;">No</th>
                                <th style="padding:4px; text-align:left;">Ders Adı</th>
                                <th style="width:40px; padding:4px;">Saat</th>
                                <th style="padding:4px; text-align:left;">Öğretmen Adı Soyadı</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRowsHtml || '<tr><td colspan="4" style="text-align:center; padding:6px;">Ders atanmamış.</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="footer" style="margin-top: 0; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size:0.85rem; color:#64748b; text-align:right;">Seyir Komut Rotası tarafından üretilmiştir.</div>
                    <div style="display:flex; justify-content:space-between; margin-top:35px;">
                        <div class="footer-box">
                            <strong>${escapeHtml(rehberHoca)}</strong><br>
                            <span style="font-size:0.85em; color:#64748b;">Sınıf Rehber Öğretmeni</span>
                        </div>
                        <div class="footer-box">
                            <strong>................................</strong><br>
                            <span style="font-size:0.85em; color:#64748b;">Okul Müdürü</span>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(() => { window.print(); }, 400);
                };
            </script>
        </body>
        </html>
    `);
    printWin.document.close();
};

// Sınıf Excel İndir (SheetJS)
window.exportSinifProgramiExcel = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    if (!window.currentProgramSinif) {
        BhUI.toast('Lütfen önce bir sınıf seçin.', 'warning');
        return;
    }

    const sinifAdi = window.currentProgramSinif;
    const sinifIsOrta = ['5', '6', '7', '8'].some(n => sinifAdi.startsWith(n));
    const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
    const periodCount = vakitler.length > 0 ? vakitler.length : 8;
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const sinifData = (appData.dersProgramiDetay && appData.dersProgramiDetay[sinifAdi]) || {};

    const ws_data = [
        [`Sınıf: ${sinifAdi} - Haftalık Ders Programı`],
        [`Sınıf Rehber Öğretmeni: ${appData.sinifRehberlik?.[sinifAdi] || '-'}`],
        [],
        ["Ders / Saat", ...days]
    ];

    for (let p = 0; p < periodCount; p++) {
        const v = vakitler[p] || { ders: `${p + 1}. Ders`, saat: '' };
        const row = [`${v.ders} (${v.saat})`];
        days.forEach(day => {
            const cell = sinifData[day]?.[p] || sinifData[day.toLowerCase()]?.[p];
            if (cell && cell.ders) {
                row.push(`${cell.ders}${cell.ogretmen ? ' (' + cell.ogretmen + ')' : ''}`);
            } else {
                row.push('');
            }
        });
        ws_data.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sinifAdi);
    XLSX.writeFile(wb, `${sinifAdi}_Ders_Programi.xlsx`);
    BhUI.toast(`${sinifAdi} haftalık ders programı Excel olarak indirildi.`, 'success');
};

// Sınıf Excel Yükle
window.importSinifProgramiExcel = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!window.currentProgramSinif) {
        BhUI.toast('Lütfen önce programı yüklemek istediğiniz sınıfı seçin.', 'warning');
        event.target.value = '';
        return;
    }

    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        event.target.value = '';
        return;
    }

    const targetSinif = window.currentProgramSinif;
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = guvenliExcelOku(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
            if (!appData.dersProgramiDetay[targetSinif]) appData.dersProgramiDetay[targetSinif] = {};

            const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
            let dayColMap = {};
            let startRow = 0;

            // Gün sütunlarını bul
            for (let r = 0; r < rows.length; r++) {
                const row = rows[r];
                if (Array.isArray(row)) {
                    days.forEach(day => {
                        const colIdx = row.findIndex(c => String(c).trim().toLowerCase() === day.toLowerCase());
                        if (colIdx !== -1) {
                            dayColMap[day] = colIdx;
                            startRow = r + 1;
                        }
                    });
                }
                if (Object.keys(dayColMap).length >= 3) break;
            }

            let loadedCount = 0;
            if (Object.keys(dayColMap).length > 0) {
                for (let r = startRow; r < rows.length; r++) {
                    const row = rows[r];
                    if (!row || row.length === 0) continue;
                    const periodIdx = r - startRow;
                    if (periodIdx >= 10) break;

                    days.forEach(day => {
                        const col = dayColMap[day];
                        if (col !== undefined && row[col]) {
                            let text = String(row[col]).trim();
                            let dAdi = text;
                            let hoca = '';

                            const match = text.match(/^(.*?)\s*\((.*?)\)$/);
                            if (match) {
                                dAdi = match[1].trim();
                                hoca = match[2].trim();
                            }

                            if (dAdi) {
                                if (!appData.dersProgramiDetay[targetSinif][day]) appData.dersProgramiDetay[targetSinif][day] = {};
                                appData.dersProgramiDetay[targetSinif][day][periodIdx] = {
                                    ders: dAdi,
                                    ogretmen: hoca,
                                    type: 'ders'
                                };
                                loadedCount++;
                            }
                        }
                    });
                }
            }

            saveData();
            renderProgramClassButtons();
            renderProgramMatrix();
            BhUI.toast(`${targetSinif} sınıfına Excel'den ${loadedCount} ders saati aktarıldı.`, 'success');
        } catch (err) {
            console.error(err);
            BhUI.toast('Excel dosyası okunurken hata oluştu: ' + err.message, 'error');
        } finally {
            event.target.value = '';
        }
    };

    reader.readAsArrayBuffer(file);
};

// Ders Havuzu & Modalleri
window.openYeniDersHavuzModal = function () {
    const modal = document.getElementById('modal-yeni-ders-havuz');
    const inp = document.getElementById('inp-yeni-ders-adi');
    if (inp) inp.value = '';
    if (modal) modal.style.display = 'flex';
};

window.closeYeniDersHavuzModal = function () {
    const modal = document.getElementById('modal-yeni-ders-havuz');
    if (modal) modal.style.display = 'none';
};

window.kaydetYeniDersHavuz = function () {
    const selKademe = document.getElementById('sel-yeni-ders-kademe');
    const inp = document.getElementById('inp-yeni-ders-adi');

    const kademe = selKademe ? selKademe.value : 'lise';
    const dersAdi = inp ? inp.value.trim().toLocaleUpperCase('tr-TR') : '';

    if (!dersAdi) {
        BhUI.toast('Lütfen ders adını giriniz.', 'warning');
        return;
    }

    if (kademe === 'ortaokul') {
        if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
        if (!appData.dersHavuzuOrtaokul.includes(dersAdi)) {
            appData.dersHavuzuOrtaokul.push(dersAdi);
            saveData();
            renderHavuzTags();
            if (typeof renderEslestirmeMatrix === 'function') renderEslestirmeMatrix();
            closeYeniDersHavuzModal();
            BhUI.toast(`"${dersAdi}" Ortaokul ders havuzuna eklendi.`, 'success');
        } else {
            BhUI.toast('Bu ders zaten Ortaokul havuzunda mevcut.', 'error');
        }
    } else {
        if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];
        if (!appData.dersHavuzuLise.includes(dersAdi)) {
            appData.dersHavuzuLise.push(dersAdi);
            saveData();
            renderHavuzTags();
            if (typeof renderEslestirmeMatrix === 'function') renderEslestirmeMatrix();
            closeYeniDersHavuzModal();
            BhUI.toast(`"${dersAdi}" Lise ders havuzuna eklendi.`, 'success');
        } else {
            BhUI.toast('Bu ders zaten Lise havuzunda mevcut.', 'error');
        }
    }
};

window.silHavuzDersi = function (kademe, dersAdi) {
    if (confirm(`"${dersAdi}" dersini havuzdan silmek istediğinize emin misiniz?`)) {
        if (kademe === 'ortaokul' && appData.dersHavuzuOrtaokul) {
            appData.dersHavuzuOrtaokul = appData.dersHavuzuOrtaokul.filter(d => d !== dersAdi);
        } else if (kademe === 'lise' && appData.dersHavuzuLise) {
            appData.dersHavuzuLise = appData.dersHavuzuLise.filter(d => d !== dersAdi);
        }
        saveData();
        renderHavuzTags();
        if (typeof renderEslestirmeMatrix === 'function') renderEslestirmeMatrix();
        BhUI.toast(`"${dersAdi}" havuzdan silindi.`, 'info');
    }
};

window.renderHavuzTags = function () {
    const oCont = document.getElementById('havuz-ortaokul-tags');
    const lCont = document.getElementById('havuz-lise-tags');
    const oCountBadge = document.getElementById('badge-havuz-orta-count');
    const lCountBadge = document.getElementById('badge-havuz-lise-count');

    if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
    if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];

    if (oCont) {
        oCont.innerHTML = '';
        appData.dersHavuzuOrtaokul.forEach(d => {
            const span = document.createElement('span');
            span.className = 'havuz-tag-item';
            span.innerHTML = `
                <span>${escapeHtml(d)}</span>
                <button type="button" class="havuz-tag-del-btn" onclick="silHavuzDersi('ortaokul', '${escapeJsAttr(d)}')" title="Sil">✕</button>
            `;
            oCont.appendChild(span);
        });
        if (oCountBadge) oCountBadge.textContent = `${appData.dersHavuzuOrtaokul.length} Ders`;
    }

    if (lCont) {
        lCont.innerHTML = '';
        appData.dersHavuzuLise.forEach(d => {
            const span = document.createElement('span');
            span.className = 'havuz-tag-item';
            span.innerHTML = `
                <span>${escapeHtml(d)}</span>
                <button type="button" class="havuz-tag-del-btn" onclick="silHavuzDersi('lise', '${escapeJsAttr(d)}')" title="Sil">✕</button>
            `;
            lCont.appendChild(span);
        });
        if (lCountBadge) lCountBadge.textContent = `${appData.dersHavuzuLise.length} Ders`;
    }
};

// Hazır MEB Müfredat Paketleri
window.openMufredatModal = function () {
    const modal = document.getElementById('modal-mufredat-yukle');
    if (modal) modal.style.display = 'flex';
};

window.closeMufredatModal = function () {
    const modal = document.getElementById('modal-mufredat-yukle');
    if (modal) modal.style.display = 'none';
};

window.uygulaMufredatPaketi = function (paketTipi) {
    const mebPaketleri = {
        iho: {
            kademe: 'ortaokul',
            dersler: ["KURANI KERİM", "ARAPÇA", "PEYGAMBERİMİZİN HAYATI", "TEMEL DİNİ BİLGİLER", "TÜRKÇE", "MATEMATİK", "FEN BİLİMLERİ", "SOSYAL BİLGİLER", "T.C. İNKILAP TARİHİ", "İNGİLİZCE", "DİN KÜLTÜRÜ VE AHLAK BİLGİSİ", "BİLİŞİM TEKNOLOJİLERİ VE YAZILIM", "GÖRSEL SANATLAR", "MÜZİK", "BEDEN EĞİTİMİ VE SPOR", "TEKNOLOJİ VE TASARIM", "REHBERLİK"]
        },
        aihl: {
            kademe: 'lise',
            dersler: ["TÜRK DİLİ VE EDEBİYATI", "TARİH", "COĞRAFYA", "MATEMATİK", "FİZİK", "KİMYA", "BİYOLOJİ", "FELSEFE", "YABANCI DİL (İNGİLİZCE)", "BEDEN EĞİTİMİ VE SPOR", "SAĞLIK BİLGİSİ VE TRAFİK", "ARAPÇA", "KURANI KERİM", "TEMEL DİNİ BİLGİLER", "SİYER", "FIKIH", "HADİS", "TEFSİR", "AKAİD", "KELAM", "DİNLER TARİHİ", "İSLAM KÜLTÜR VE MEDENİYETİ", "HİTABET VE MESLEKİ UYGULAMA", "REHBERLİK"]
        },
        anadolu: {
            kademe: 'lise',
            dersler: ["TÜRK DİLİ VE EDEBİYATI", "TARİH", "COĞRAFYA", "MATEMATİK", "FİZİK", "KİMYA", "BİYOLOJİ", "FELSEFE", "BİRİNCİ YABANCI DİL (İNGİLİZCE)", "İKİNCİ YABANCI DİL (ALMANCA)", "BEDEN EĞİTİMİ VE SPOR", "GÖRSEL SANATLAR/MÜZİK", "SAĞLIK BİLGİSİ VE TRAFİK KÜLTÜRÜ", "DİN KÜLTÜRÜ VE AHLAK BİLGİSİ", "BİLGİSAYAR BİLİMİ", "REHBERLİK VE YÖNLENDİRME"]
        }
    };

    const secili = mebPaketleri[paketTipi];
    if (!secili) return;

    let eklendi = 0;
    if (secili.kademe === 'ortaokul') {
        if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
        secili.dersler.forEach(d => {
            if (!appData.dersHavuzuOrtaokul.includes(d)) {
                appData.dersHavuzuOrtaokul.push(d);
                eklendi++;
            }
        });
    } else {
        if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];
        secili.dersler.forEach(d => {
            if (!appData.dersHavuzuLise.includes(d)) {
                appData.dersHavuzuLise.push(d);
                eklendi++;
            }
        });
    }

    saveData();
    renderHavuzTags();
    if (typeof renderEslestirmeMatrix === 'function') renderEslestirmeMatrix();
    closeMufredatModal();
    BhUI.toast(`MEB Müfredat Paketi yüklendi (${eklendi} yeni ders eklendi).`, 'success');
};



// Sınıf Yönetimi
window.currentSinifKademeFiltresi = 'all';
window.currentSinifSearchQuery = '';

function getSinifKademe(sinifAdi) {
    if (!sinifAdi) return 'Diğer';
    const match = sinifAdi.match(/^(\d+)/);
    if (match) return match[1] + '. Sınıf';
    if (/haz/i.test(sinifAdi)) return 'Hazırlık';
    if (/ana/i.test(sinifAdi) || /okul\s*ön/i.test(sinifAdi)) return 'Okul Öncesi';
    return 'Özel / Diğer';
}

function getKademeColor(kademeStr) {
    if (kademeStr.startsWith('9')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    if (kademeStr.startsWith('10')) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    if (kademeStr.startsWith('11')) return { bg: '#fefce8', color: '#a16207', border: '#fef08a' };
    if (kademeStr.startsWith('12')) return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
    if (kademeStr.startsWith('5') || kademeStr.startsWith('6') || kademeStr.startsWith('7') || kademeStr.startsWith('8')) {
        return { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
    }
    return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
}

function getSinifDersSaati(sinifAdi) {
    if (!appData.dersProgramiDetay || !appData.dersProgramiDetay[sinifAdi]) return 0;
    const sinifGunleri = appData.dersProgramiDetay[sinifAdi];
    let count = 0;
    Object.values(sinifGunleri).forEach(gunDersleri => {
        if (Array.isArray(gunDersleri)) {
            gunDersleri.forEach(d => {
                if (d && (d.ders || d.type === 'ders')) count++;
            });
        }
    });
    return count;
}

window.renderSiniflarTable = function () {
    const tbody = document.getElementById('siniflar-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!appData.sinifListesi) appData.sinifListesi = [];
    if (!appData.sinifRehberlik) appData.sinifRehberlik = {};

    const rawList = appData.sinifListesi;
    const totalCount = rawList.length;

    let rehberAtanan = 0;
    let rehberEksik = 0;
    const kademelerSet = new Set();
    const kademeCounts = {};

    rawList.forEach(s => {
        const kademe = getSinifKademe(s);
        kademelerSet.add(kademe);
        kademeCounts[kademe] = (kademeCounts[kademe] || 0) + 1;

        if (appData.sinifRehberlik[s] && appData.sinifRehberlik[s].trim() !== '') {
            rehberAtanan++;
        } else {
            rehberEksik++;
        }
    });

    // İstatistik Kartlarını Güncelle
    const statToplam = document.getElementById('stat-toplam-sinif');
    const statRehber = document.getElementById('stat-rehber-atanan');
    const statEksik = document.getElementById('stat-rehber-eksik');
    const statKademeler = document.getElementById('stat-aktif-kademeler');

    if (statToplam) statToplam.textContent = totalCount;
    if (statRehber) statRehber.textContent = rehberAtanan;
    if (statEksik) statEksik.textContent = rehberEksik;
    if (statKademeler) statKademeler.textContent = kademelerSet.size + ' Kademe';

    // Kademe Filtre Çiplerini Güncelle
    const chipsContainer = document.getElementById('sinif-kademe-chips');
    if (chipsContainer) {
        let chipsHtml = `
            <button type="button" class="btn-sinif-filter ${window.currentSinifKademeFiltresi === 'all' ? 'active' : ''}" data-kademe="all" onclick="setSinifKademeFiltresi('all')">
                Tüm Şubeler (${totalCount})
            </button>
        `;

        const siraliKademeler = [...kademelerSet].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }));
        siraliKademeler.forEach(k => {
            const count = kademeCounts[k] || 0;
            const isActive = window.currentSinifKademeFiltresi === k ? 'active' : '';
            chipsHtml += `
                <button type="button" class="btn-sinif-filter ${isActive}" data-kademe="${escapeHtml(k)}" onclick="setSinifKademeFiltresi('${escapeJsAttr(k)}')">
                    ${escapeHtml(k)} (${count})
                </button>
            `;
        });

        if (rehberEksik > 0) {
            const isActive = window.currentSinifKademeFiltresi === 'rehbersiz' ? 'active' : '';
            chipsHtml += `
                <button type="button" class="btn-sinif-filter ${isActive}" data-kademe="rehbersiz" onclick="setSinifKademeFiltresi('rehbersiz')" style="color: #d97706;">
                    ⚠️ Rehbersiz (${rehberEksik})
                </button>
            `;
        }

        chipsContainer.innerHTML = chipsHtml;
    }

    // Filtreleme
    const filterKademe = window.currentSinifKademeFiltresi || 'all';
    const filterQuery = (window.currentSinifSearchQuery || '').toLowerCase();

    const filteredList = rawList.filter(s => {
        const kademe = getSinifKademe(s);
        const rehber = (appData.sinifRehberlik[s] || '').toLowerCase();
        const sinifLower = s.toLowerCase();

        // Kademe filtresi
        if (filterKademe === 'rehbersiz') {
            if (appData.sinifRehberlik[s] && appData.sinifRehberlik[s].trim() !== '') return false;
        } else if (filterKademe !== 'all' && kademe !== filterKademe) {
            return false;
        }

        // Arama filtresi
        if (filterQuery && !sinifLower.includes(filterQuery) && !rehber.includes(filterQuery)) {
            return false;
        }

        return true;
    });

    if (filteredList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.95rem;">
                    🔍 Kriterlere uygun şube bulunamadı.
                </td>
            </tr>
        `;
        return;
    }

    let allTeachers = [...(appData.tumOgretmenler || [])].sort((a, b) => a.localeCompare(b, 'tr'));

    filteredList.forEach(sinif => {
        const currentTeacher = appData.sinifRehberlik[sinif] || "";
        const kademe = getSinifKademe(sinif);
        const kColor = getKademeColor(kademe);
        const dersSaati = getSinifDersSaati(sinif);

        let currentOptions = '<option value="">-- Rehber Öğretmen Seçin --</option>';
        allTeachers.forEach(t => {
            const selected = t === currentTeacher ? 'selected' : '';
            currentOptions += `<option value="${escapeHtml(t)}" ${selected}>${escapeHtml(t)}</option>`;
        });

        const tr = document.createElement('tr');
        tr.style.transition = 'background 0.15s ease';
        tr.onmouseover = () => { tr.style.background = '#f8fafc'; };
        tr.onmouseout = () => { tr.style.background = 'transparent'; };

        const rehberBadge = currentTeacher
            ? `<span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#059669; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rehber Atandı</span>`
            : `<span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#d97706; font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Rehber Yok</span>`;

        tr.innerHTML = `
            <td style="padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--primary-glow); color: var(--primary); width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; flex-shrink: 0;">
                        🎓
                    </span>
                    <input type="text" class="form-control" value="${escapeHtml(sinif)}" onchange="renameSinif('${escapeJsAttr(sinif)}', this.value)"
                        style="width: 130px; font-weight: 700; font-size: 0.95rem; padding: 5px 8px;" title="Şube adını değiştirmek için yazın ve Enter'a basın">
                </div>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border);">
                <span class="sinif-grade-badge" style="background: ${kColor.bg}; color: ${kColor.color}; border: 1px solid ${kColor.border};">
                    ${escapeHtml(kademe)}
                </span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border);">
                <div style="display: flex; flex-direction: column; gap: 4px; max-width: 320px;">
                    <select class="form-control" onchange="updateSinifRehberlik('${escapeJsAttr(sinif)}', this.value)" style="width: 100%; font-size: 0.88rem; padding: 6px 10px;">
                        ${currentOptions}
                    </select>
                    <div>${rehberBadge}</div>
                </div>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border);">
                <span style="font-weight: 700; font-size: 0.88rem; color: ${dersSaati > 0 ? 'var(--text-main)' : 'var(--text-muted)'}; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-clock" style="color: ${dersSaati > 0 ? '#10b981' : '#94a3b8'};"></i>
                    ${dersSaati > 0 ? dersSaati + ' Saat / Hafta' : 'Planlanmadı'}
                </span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border); text-align: right;">
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button type="button" class="btn-secondary btn-sm" onclick="gitSinifProgramina('${escapeJsAttr(sinif)}')" style="padding: 6px 9px;" title="Bu şubenin haftalık ders programına git">
                        <i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i>
                    </button>
                    <button type="button" class="btn-danger btn-sm" onclick="deleteSinif('${escapeJsAttr(sinif)}')" style="padding: 6px 9px;" title="Şubeyi Sil">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.filterSiniflar = function () {
    const inp = document.getElementById('inp-search-sinif');
    window.currentSinifSearchQuery = inp ? inp.value.trim().toLowerCase() : '';
    renderSiniflarTable();
};

window.setSinifKademeFiltresi = function (kademe) {
    window.currentSinifKademeFiltresi = kademe;
    renderSiniflarTable();
};

window.siralaSiniflarDogal = function () {
    if (!appData.sinifListesi || appData.sinifListesi.length === 0) return;
    appData.sinifListesi.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));
    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast('Sınıflar kademe ve şube sırasına göre doğal sırada dizildi.', 'success');
};

window.updateSinifRehberlik = function (sinif, teacherName) {
    if (!appData.sinifRehberlik) appData.sinifRehberlik = {};
    if (teacherName) {
        appData.sinifRehberlik[sinif] = teacherName;
    } else {
        delete appData.sinifRehberlik[sinif];
    }
    saveData();
    if (typeof renderOgretmenTable === 'function') renderOgretmenTable();
    renderSiniflarTable();
    BhUI.toast(sinif + ' rehber öğretmeni güncellendi.', 'success');
};

window.renameSinif = function (oldName, newName) {
    newName = newName.trim();
    if (!newName || newName === oldName) return renderSiniflarTable();

    if (appData.sinifListesi.includes(newName)) {
        BhUI.toast('Bu sınıf adı zaten mevcut!', 'error');
        return renderSiniflarTable();
    }

    const index = appData.sinifListesi.indexOf(oldName);
    if (index > -1) {
        appData.sinifListesi[index] = newName;
    }

    if (appData.sinifRehberlik && appData.sinifRehberlik[oldName]) {
        appData.sinifRehberlik[newName] = appData.sinifRehberlik[oldName];
        delete appData.sinifRehberlik[oldName];
    }

    if (appData.dersProgramiDetay && appData.dersProgramiDetay[oldName]) {
        appData.dersProgramiDetay[newName] = appData.dersProgramiDetay[oldName];
        delete appData.dersProgramiDetay[oldName];
    }

    if (appData.sinifDersOgretmen && appData.sinifDersOgretmen[oldName]) {
        appData.sinifDersOgretmen[newName] = appData.sinifDersOgretmen[oldName];
        delete appData.sinifDersOgretmen[oldName];
    }

    if (currentProgramSinif === oldName) currentProgramSinif = newName;
    if (currentEslestirmeSinif === oldName) currentEslestirmeSinif = newName;

    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast('Sınıf adı güncellendi.', 'success');
};

window.addNewSinif = function () {
    if (!appData.sinifListesi) appData.sinifListesi = [];
    const sinifAdi = prompt('Lütfen yeni şube adını girin (Örn: 9-A, 10-B, 11-C):');
    if (!sinifAdi || !sinifAdi.trim()) return;

    const temiz = sinifAdi.trim();
    if (appData.sinifListesi.includes(temiz)) {
        BhUI.toast('Bu şube zaten listede mevcut!', 'warning');
        return;
    }

    appData.sinifListesi.push(temiz);
    appData.sinifListesi.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));
    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast(`${temiz} şubesi eklendi.`, 'success');
};

window.deleteSinif = function (name) {
    if (!confirm(name + ' şubesini silmek istediğinize emin misiniz?')) return;

    const index = appData.sinifListesi.indexOf(name);
    if (index > -1) {
        appData.sinifListesi.splice(index, 1);
    }

    if (appData.sinifRehberlik) delete appData.sinifRehberlik[name];
    if (appData.dersProgramiDetay) delete appData.dersProgramiDetay[name];
    if (appData.sinifDersOgretmen) delete appData.sinifDersOgretmen[name];

    if (currentProgramSinif === name) {
        currentProgramSinif = null;
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
    }
    if (currentEslestirmeSinif === name) {
        currentEslestirmeSinif = null;
        if (typeof renderEslestirmeMatrix === 'function') renderEslestirmeMatrix();
    }

    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast('Sınıf silindi.', 'success');
};

// --- TOPLU ŞUBE SİHİRBAZI ---
window.openTopluSinifModal = function () {
    const modal = document.getElementById('modal-toplu-sinif');
    if (modal) {
        modal.style.display = 'flex';
        updateSihirbazPreview();
    }
};

window.closeTopluSinifModal = function () {
    const modal = document.getElementById('modal-toplu-sinif');
    if (modal) modal.style.display = 'none';
};

window.selectSihirbazKademe = function (btn, kademe) {
    document.querySelectorAll('#sihirbaz-kademe-chips .btn-sihirbaz-chip').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSihirbazPreview();
};

window.toggleSihirbazSube = function (btn) {
    btn.classList.toggle('selected');
    updateSihirbazPreview();
};

window.updateSihirbazPreview = function () {
    const kademeBtn = document.querySelector('#sihirbaz-kademe-chips .btn-sihirbaz-chip.selected');
    const kademe = kademeBtn ? kademeBtn.getAttribute('data-kademe') : '9';
    const subeler = [];
    document.querySelectorAll('#sihirbaz-sube-chips .btn-sihirbaz-chip.selected').forEach(b => {
        subeler.push(b.getAttribute('data-sube'));
    });
    const previewEl = document.getElementById('sihirbaz-preview-text');
    if (previewEl) {
        if (subeler.length === 0) {
            previewEl.textContent = 'Lütfen en az bir şube seçin.';
        } else {
            const list = subeler.map(s => `${kademe}-${s}`);
            previewEl.textContent = `Oluşturulacak: ${list.join(', ')} (${list.length} Şube)`;
        }
    }
};

window.olusturSihirbazSubeleri = function () {
    const kademeBtn = document.querySelector('#sihirbaz-kademe-chips .btn-sihirbaz-chip.selected');
    const kademe = kademeBtn ? kademeBtn.getAttribute('data-kademe') : '9';
    const subeler = [];
    document.querySelectorAll('#sihirbaz-sube-chips .btn-sihirbaz-chip.selected').forEach(b => {
        subeler.push(b.getAttribute('data-sube'));
    });

    if (subeler.length === 0) {
        BhUI.toast('Lütfen en az bir şube seçin.', 'warning');
        return;
    }

    if (!appData.sinifListesi) appData.sinifListesi = [];
    let eklenenSayisi = 0;

    subeler.forEach(s => {
        const sinifAdi = `${kademe}-${s}`;
        if (!appData.sinifListesi.includes(sinifAdi)) {
            appData.sinifListesi.push(sinifAdi);
            eklenenSayisi++;
        }
    });

    appData.sinifListesi.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));

    saveData();
    closeTopluSinifModal();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();

    if (eklenenSayisi > 0) {
        BhUI.toast(`${eklenenSayisi} yeni şube başarıyla oluşturuldu.`, 'success');
    } else {
        BhUI.toast('Seçilen şubeler zaten listede mevcut.', 'info');
    }
};

window.uygulaHazirSinifSablonu = function (sablonTipi) {
    if (!appData.sinifListesi) appData.sinifListesi = [];
    let sablonSiniflar = [];

    if (sablonTipi === 'lise4') {
        const kademeler = ['9', '10', '11', '12'];
        const subeler = ['A', 'B', 'C', 'D'];
        kademeler.forEach(k => {
            subeler.forEach(s => sablonSiniflar.push(`${k}-${s}`));
        });
    } else if (sablonTipi === 'ortaokul') {
        const kademeler = ['5', '6', '7', '8'];
        const subeler = ['A', 'B', 'C'];
        kademeler.forEach(k => {
            subeler.forEach(s => sablonSiniflar.push(`${k}-${s}`));
        });
    }

    let eklenen = 0;
    sablonSiniflar.forEach(s => {
        if (!appData.sinifListesi.includes(s)) {
            appData.sinifListesi.push(s);
            eklenen++;
        }
    });

    appData.sinifListesi.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));
    saveData();
    closeTopluSinifModal();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast(`Şablon uygulandı: ${eklenen} yeni şube listeye dahil edildi.`, 'success');
};

// --- SINIF EXCEL İÇE / DIŞA AKTARMA ---
window.exportExcelSiniflar = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi henüz yüklenmedi.', 'error');
        return;
    }

    const okulAdi = (appData.okul && appData.okul.okulAdi) || 'Okul';
    const bugun = new Date();
    const tarihStr = bugun.toLocaleDateString('tr-TR').replace(/\//g, '-');

    const ws_data = [
        [`${okulAdi} - SINIF VE ŞUBE LİSTESİ`],
        [`Rapor Tarihi: ${bugun.toLocaleDateString('tr-TR')}`],
        [],
        ["Sınıf / Şube Adı", "Kademe", "Sınıf Rehber Öğretmeni", "Haftalık Planlanan Ders Saati"]
    ];

    const list = [...(appData.sinifListesi || [])];
    list.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));

    list.forEach(sinif => {
        const kademe = getSinifKademe(sinif);
        const rehber = (appData.sinifRehberlik && appData.sinifRehberlik[sinif]) || 'Atanmadı';
        const saat = getSinifDersSaati(sinif);
        ws_data.push([sinif, kademe, rehber, saat > 0 ? saat + ' Saat' : 'Planlanmadı']);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 26 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sınıf Listesi");
    XLSX.writeFile(wb, `Sinif_Listesi_${tarihStr}.xlsx`);
    BhUI.toast('Sınıf listesi Excel olarak indirildi.', 'success');
};

window.importExcelSiniflar = function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = guvenliExcelOku(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!rows || rows.length === 0) {
                BhUI.toast('Excel dosyasında veri bulunamadı.', 'warning');
                return;
            }

            if (!appData.sinifListesi) appData.sinifListesi = [];
            if (!appData.sinifRehberlik) appData.sinifRehberlik = {};

            let eklendi = 0;
            rows.forEach(r => {
                if (!r || r.length === 0) return;
                const firstVal = String(r[0] || '').trim();
                if (!firstVal || firstVal.toLowerCase().includes('sınıf') || firstVal.toLowerCase().includes('okul') || firstVal.toLowerCase().includes('tarih')) return;

                const sinifAdi = firstVal;
                const rehberAdi = r[2] ? String(r[2]).trim() : (r[1] ? String(r[1]).trim() : '');

                if (!appData.sinifListesi.includes(sinifAdi)) {
                    appData.sinifListesi.push(sinifAdi);
                    eklendi++;
                }

                if (rehberAdi && !rehberAdi.toLowerCase().includes('atanmadı') && !rehberAdi.toLowerCase().includes('kademe')) {
                    appData.sinifRehberlik[sinifAdi] = rehberAdi;
                }
            });

            appData.sinifListesi.sort((a, b) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' }));
            saveData();
            renderSiniflarTable();
            if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
            if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();

            BhUI.toast(`Excel başarıyla aktarıldı: ${eklendi} yeni şube dahil edildi.`, 'success');
        } catch (err) {
            console.error(err);
            BhUI.toast('Excel okunurken hata oluştu. Dosya formatını kontrol edin.', 'error');
        } finally {
            e.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
};

window.gitSinifProgramina = function (sinifAdi) {
    const navItem = document.querySelector('.nav-item[data-target="tab-program"]');
    if (navItem) navItem.click();
    setTimeout(() => {
        const btn = document.querySelector(`.btn-class[data-class="${CSS.escape(sinifAdi)}"]`);
        if (btn) btn.click();
    }, 150);
};

// --- SINIF DERS EŞLEŞTİRME & ALT SEKMELER ---
window.switchProgramSubTab = function (tabName) {
    const tabHaftalik = document.getElementById('sub-tab-haftalik');
    const tabEslestirme = document.getElementById('sub-tab-eslestirme');
    const tabHavuz = document.getElementById('sub-tab-havuz');

    if (tabHaftalik) tabHaftalik.style.display = (tabName === 'haftalik') ? 'block' : 'none';
    if (tabEslestirme) tabEslestirme.style.display = (tabName === 'eslestirme') ? 'block' : 'none';
    if (tabHavuz) tabHavuz.style.display = (tabName === 'havuz') ? 'block' : 'none';

    const btnHaftalik = document.getElementById('btn-sub-haftalik');
    const btnEslestirme = document.getElementById('btn-sub-eslestirme');
    const btnHavuz = document.getElementById('btn-sub-havuz');

    if (btnHaftalik) btnHaftalik.className = (tabName === 'haftalik') ? 'btn-primary btn-sm btn-glow-sm' : 'btn-secondary btn-sm';
    if (btnEslestirme) btnEslestirme.className = (tabName === 'eslestirme') ? 'btn-primary btn-sm btn-glow-sm' : 'btn-secondary btn-sm';
    if (btnHavuz) btnHavuz.className = (tabName === 'havuz') ? 'btn-primary btn-sm btn-glow-sm' : 'btn-secondary btn-sm';

    if (tabName === 'haftalik') {
        renderProgramClassButtons();
        renderProgramMatrix();
    } else if (tabName === 'eslestirme') {
        if (!window.currentEslestirmeSinif && window.currentProgramSinif) {
            window.currentEslestirmeSinif = window.currentProgramSinif;
        }
        renderEslestirmeClassButtons();
        renderEslestirmeMatrix();
    } else if (tabName === 'havuz') {
        renderHavuzTags();
    }
};

window.currentEslestirmeSinif = null;
window.currentEslestirmeKademeFilter = 'all';
window.currentHavuzTab = 'ortaokul';

window.switchHavuzTab = function (tabName) {
    window.currentHavuzTab = tabName;
    const oZone = document.getElementById('ders-havuzu-ortaokul-dropzone');
    const lZone = document.getElementById('ders-havuzu-lise-dropzone');
    if (oZone) oZone.style.display = (tabName === 'ortaokul') ? 'flex' : 'none';
    if (lZone) lZone.style.display = (tabName === 'lise') ? 'flex' : 'none';

    const btnO = document.getElementById('btn-havuz-ortaokul');
    const btnL = document.getElementById('btn-havuz-lise');
    if (btnO) btnO.className = (tabName === 'ortaokul') ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
    if (btnL) btnL.className = (tabName === 'lise') ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
};

window.renderEslestirmeClassButtons = function () {
    const container = document.getElementById('eslestirme-class-buttons');
    if (!container) return;
    container.innerHTML = '';

    renderProgramKademeChips();

    const siniflar = appData.sinifListesi || [];
    const filter = window.currentEslestirmeKademeFilter || 'all';

    const filtered = siniflar.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'ortaokul') return ['5', '6', '7', '8'].some(n => s.startsWith(n));
        if (filter === 'lise') return ['9', '10', '11', '12'].some(n => s.startsWith(n));
        return s.startsWith(filter);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Bu kademede sınıf bulunamadı.</span>`;
        return;
    }

    if (!window.currentEslestirmeSinif && filtered.length > 0) {
        window.currentEslestirmeSinif = filtered[0];
    }

    filtered.forEach(sinif => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'program-class-btn' + (sinif === window.currentEslestirmeSinif ? ' active' : '');

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#0284c7'];
        const color = colors[appData.sinifListesi.indexOf(sinif) % colors.length];

        btn.style.backgroundColor = sinif === window.currentEslestirmeSinif ? color : 'rgba(255, 255, 255, 0.9)';
        btn.style.color = sinif === window.currentEslestirmeSinif ? '#ffffff' : '#1e293b';
        btn.style.borderColor = color;

        const count = (appData.sinifDersleri && appData.sinifDersleri[sinif]) ? appData.sinifDersleri[sinif].length : 0;

        btn.innerHTML = `
            <span>${escapeHtml(sinif)}</span>
            <span class="program-class-badge" style="background:${sinif === window.currentEslestirmeSinif ? 'rgba(0,0,0,0.25)' : '#3b82f6'}; color:#ffffff;">${count} Ders</span>
        `;

        btn.onclick = () => {
            window.currentEslestirmeSinif = sinif;
            // Havuz sekmesini sınıf türüne göre otomatik ayarla
            if (['5', '6', '7', '8'].some(n => sinif.startsWith(n))) {
                switchHavuzTab('ortaokul');
            } else {
                switchHavuzTab('lise');
            }
            renderEslestirmeClassButtons();
            renderEslestirmeMatrix();
        };

        container.appendChild(btn);
    });

    renderEslestirmeMatrix();
};

window.allowDropEslestirme = function (ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('dragover');
};

window.dragStartEslestirme = function (ev, dersName) {
    ev.dataTransfer.setData("text", dersName);
};

window.dropToSinifEslestirme = function (ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('dragover');
    if (!window.currentEslestirmeSinif) return;

    const ders = ev.dataTransfer.getData("text");
    addDersToSinifDirect(ders);
};

window.addDersToSinifDirect = function (ders) {
    if (!window.currentEslestirmeSinif || !ders) return;

    if (!appData.sinifDersleri) appData.sinifDersleri = {};
    if (!appData.sinifDersleri[window.currentEslestirmeSinif]) appData.sinifDersleri[window.currentEslestirmeSinif] = [];

    if (!appData.sinifDersleri[window.currentEslestirmeSinif].includes(ders)) {
        appData.sinifDersleri[window.currentEslestirmeSinif].push(ders);
        saveData();
        renderEslestirmeClassButtons();
        renderEslestirmeMatrix();
        BhUI.toast(`"${ders}" ${window.currentEslestirmeSinif} sınıfına eklendi.`, 'success');
    } else {
        BhUI.toast('Bu ders zaten bu sınıfta var.', 'warning');
    }
};

window.dropToHavuzEslestirme = function (ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('dragover');
    if (!window.currentEslestirmeSinif) return;

    const ders = ev.dataTransfer.getData("text");
    removeFromSinif(ders);
};

window.removeFromSinif = function (ders) {
    if (!window.currentEslestirmeSinif) return;
    if (appData.sinifDersleri && appData.sinifDersleri[window.currentEslestirmeSinif]) {
        const index = appData.sinifDersleri[window.currentEslestirmeSinif].indexOf(ders);
        if (index > -1) {
            appData.sinifDersleri[window.currentEslestirmeSinif].splice(index, 1);
            saveData();
            renderEslestirmeClassButtons();
            renderEslestirmeMatrix();
            BhUI.toast(`"${ders}" sınıftan çıkarıldı.`, 'info');
        }
    }
};

window.updateSinifDersOgretmen = function (sinif, ders, ogretmen) {
    if (!sinif || !ders) return;

    if (!appData.sinifDersOgretmen) appData.sinifDersOgretmen = {};
    if (!appData.sinifDersOgretmen[sinif]) appData.sinifDersOgretmen[sinif] = {};

    appData.sinifDersOgretmen[sinif][ders] = ogretmen;

    // Haftalık program matrisinde bu dersin hücrelerini de kaskad güncelle
    if (appData.dersProgramiDetay && appData.dersProgramiDetay[sinif]) {
        ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"].forEach(day => {
            const g = appData.dersProgramiDetay[sinif][day] || appData.dersProgramiDetay[sinif][day.toLowerCase()];
            if (g) {
                for (let p = 0; p < 10; p++) {
                    if (g[p] && g[p].type === 'ders' && g[p].ders === ders) {
                        g[p].ogretmen = ogretmen;
                    }
                }
            }
        });
    }

    saveData();
    updateProgramStats();
    if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
    BhUI.toast(`${sinif} - ${ders} dersine "${ogretmen || 'Öğretmen Yok'}" atandı.`, 'success');
};

window.filterHavuzDersleri = function (query) {
    const q = (query || '').toLocaleLowerCase('tr-TR').trim();
    const items = document.querySelectorAll('.pool-zone .draggable-item');
    items.forEach(it => {
        const txt = it.textContent.toLocaleLowerCase('tr-TR');
        it.style.display = txt.includes(q) ? 'inline-flex' : 'none';
    });
};

window.renderEslestirmeMatrix = function () {
    const containerEl = document.getElementById('eslestirme-matrix-container');
    const emptyEl = document.getElementById('eslestirme-matrix-empty');
    const baslikEl = document.getElementById('eslestirme-sinif-baslik');
    const countBadge = document.getElementById('eslestirme-toplam-saat-badge');

    if (!window.currentEslestirmeSinif) {
        if (containerEl) containerEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (containerEl) containerEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    if (baslikEl) baslikEl.textContent = `${window.currentEslestirmeSinif} Sınıfının Dersleri & Öğretmenleri`;

    // Sınıfın dersleri (Sol Kolon)
    const sinifDersleriContainer = document.getElementById('sinif-dersleri-dropzone');
    sinifDersleriContainer.innerHTML = '';
    sinifDersleriContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

    if (!appData.sinifDersleri) appData.sinifDersleri = {};
    const buSinifinDersleri = appData.sinifDersleri[window.currentEslestirmeSinif] || [];

    if (countBadge) countBadge.textContent = `${buSinifinDersleri.length} Ders Tanımlı`;

    if (buSinifinDersleri.length === 0) {
        sinifDersleriContainer.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:var(--text-muted); font-size:0.9rem; background:#ffffff; border-radius:10px; border:1px dashed var(--sidebar-border);">
                <div style="font-size:1.8rem; margin-bottom:6px;">📭</div>
                Henüz bu sınıfa ders eklenmedi.<br>
                Sağdaki ders havuzundan dersleri buraya sürükleyin veya <strong>+ Ekle</strong> butonuna tıklayın.
            </div>
        `;
    }

    // Haftalık programda her dersin kaç saat yerleştirildiğini hesapla
    const dersSaatMap = {};
    if (appData.dersProgramiDetay && appData.dersProgramiDetay[window.currentEslestirmeSinif]) {
        ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"].forEach(day => {
            const g = appData.dersProgramiDetay[window.currentEslestirmeSinif][day] || appData.dersProgramiDetay[window.currentEslestirmeSinif][day.toLowerCase()];
            if (g) {
                for (let p = 0; p < 10; p++) {
                    if (g[p] && g[p].type === 'ders' && g[p].ders) {
                        dersSaatMap[g[p].ders] = (dersSaatMap[g[p].ders] || 0) + 1;
                    }
                }
            }
        });
    }

    const teachersList = [...(appData.tumOgretmenler || [])].sort((a, b) => a.localeCompare(b, 'tr'));

    buSinifinDersleri.forEach(ders => {
        const assignedHoca = appData.sinifDersOgretmen?.[window.currentEslestirmeSinif]?.[ders] || '';
        const scheduledHours = dersSaatMap[ders] || 0;

        let teacherOptionsHtml = '<option value="">-- Ders Öğretmeni Seçin --</option>';
        teachersList.forEach(t => {
            const isSel = assignedHoca && t.trim().toLowerCase() === assignedHoca.trim().toLowerCase();
            teacherOptionsHtml += `<option value="${escapeHtml(t)}"${isSel ? ' selected' : ''}>${escapeHtml(t)}</option>`;
        });

        const card = document.createElement('div');
        card.className = 'sinif-ders-card';
        card.draggable = true;
        card.ondragstart = (e) => dragStartEslestirme(e, ders);

        card.innerHTML = `
            <div class="sinif-ders-header">
                <div style="display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-grip-vertical" style="color:#94a3b8; cursor:grab;"></i>
                    <span class="sinif-ders-title">${escapeHtml(ders)}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="sinif-ders-hours-badge" title="Haftalık Programda Yer Alan Saat"><i class="fa-solid fa-clock"></i> ${scheduledHours} Saat</span>
                    <button type="button" class="remove-btn" onclick="removeFromSinif('${escapeJsAttr(ders)}')" title="Sınıftan Kaldır" style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:0.78rem; font-weight:600; color:var(--text-muted); white-space:nowrap;">👨‍🏫 Öğretmen:</label>
                <select class="form-control form-sm" style="flex:1; font-size:0.82rem; padding:4px 8px; border-radius:6px; font-weight:600; color:${assignedHoca ? '#059669' : '#d97706'}; background:${assignedHoca ? '#f0fdf4' : '#fffbeb'}; border-color:${assignedHoca ? '#bbf7d0' : '#fde68a'};" onchange="updateSinifDersOgretmen('${escapeJsAttr(window.currentEslestirmeSinif)}', '${escapeJsAttr(ders)}', this.value)">
                    ${teacherOptionsHtml}
                </select>
            </div>
        `;

        sinifDersleriContainer.appendChild(card);
    });

    // Sağ Kolon: Ders Havuzu - Ortaokul
    const havuzOrtaokulContainer = document.getElementById('ders-havuzu-ortaokul-dropzone');
    if (havuzOrtaokulContainer) {
        havuzOrtaokulContainer.innerHTML = '';
        havuzOrtaokulContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

        if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
        const havuzGosterilecekO = appData.dersHavuzuOrtaokul.filter(d => !buSinifinDersleri.includes(d));

        if (havuzGosterilecekO.length === 0) {
            havuzOrtaokulContainer.innerHTML = `<div style="color:var(--text-muted); font-size: 0.88rem; font-style: italic; padding: 15px;">Tüm dersler bu sınıfa atanmış.</div>`;
        }

        havuzGosterilecekO.forEach(ders => {
            const div = document.createElement('div');
            div.className = 'draggable-item';
            div.draggable = true;
            div.style.cssText = 'padding:6px 10px; font-size:0.84rem; display:inline-flex; align-items:center; gap:8px; border-radius:6px; cursor:grab; background:#f8fafc; border:1px solid #cbd5e1;';
            div.ondragstart = (e) => dragStartEslestirme(e, ders);
            div.innerHTML = `
                <span><i class="fa-solid fa-grip-vertical" style="color:#94a3b8;"></i> ${escapeHtml(ders)}</span>
                <button type="button" onclick="addDersToSinifDirect('${escapeJsAttr(ders)}')" title="Sınıfa Ekle" style="background:#3b82f6; color:#ffffff; border:none; border-radius:4px; padding:2px 6px; font-size:0.75rem; font-weight:700; cursor:pointer;">+ Ekle</button>
            `;
            havuzOrtaokulContainer.appendChild(div);
        });
    }

    // Sağ Kolon: Ders Havuzu - Lise
    const havuzLiseContainer = document.getElementById('ders-havuzu-lise-dropzone');
    if (havuzLiseContainer) {
        havuzLiseContainer.innerHTML = '';
        havuzLiseContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

        if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];
        const havuzGosterilecekL = appData.dersHavuzuLise.filter(d => !buSinifinDersleri.includes(d));

        if (havuzGosterilecekL.length === 0) {
            havuzLiseContainer.innerHTML = `<div style="color:var(--text-muted); font-size: 0.88rem; font-style: italic; padding: 15px;">Tüm dersler bu sınıfa atanmış.</div>`;
        }

        havuzGosterilecekL.forEach(ders => {
            const div = document.createElement('div');
            div.className = 'draggable-item';
            div.draggable = true;
            div.style.cssText = 'padding:6px 10px; font-size:0.84rem; display:inline-flex; align-items:center; gap:8px; border-radius:6px; cursor:grab; background:#f8fafc; border:1px solid #cbd5e1;';
            div.ondragstart = (e) => dragStartEslestirme(e, ders);
            div.innerHTML = `
                <span><i class="fa-solid fa-grip-vertical" style="color:#94a3b8;"></i> ${escapeHtml(ders)}</span>
                <button type="button" onclick="addDersToSinifDirect('${escapeJsAttr(ders)}')" title="Sınıfa Ekle" style="background:#3b82f6; color:#ffffff; border:none; border-radius:4px; padding:2px 6px; font-size:0.75rem; font-weight:700; cursor:pointer;">+ Ekle</button>
            `;
            havuzLiseContainer.appendChild(div);
        });
    }
};



// ==========================================
// EXCEL İÇE AKTARMA (VERİ YÖNETİMİ)
// ==========================================


window.exportExcelProgram = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    if (!appData.dersProgramiDetay || Object.keys(appData.dersProgramiDetay).length === 0) {
        BhUI.toast('Dışa aktarılacak ders programı bulunamadı.', 'warning');
        return;
    }

    const ws_data = [];
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const headerRow = ["Gün", "1. Ders", "2. Ders", "3. Ders", "4. Ders", "5. Ders", "6. Ders", "7. Ders", "8. Ders"];

    for (const [sinif, gunler] of Object.entries(appData.dersProgramiDetay)) {
        ws_data.push([`Sınıf: ${sinif}`]);
        ws_data.push(headerRow);

        for (const gun of days) {
            const row = [gun];
            for (let i = 0; i < 8; i++) {
                const dersObj = (gunler[gun] && gunler[gun][i]) ? gunler[gun][i] : null;
                if (dersObj) {
                    const cellVal = dersObj.ogretmen ? `${dersObj.ders} (${dersObj.ogretmen})` : dersObj.ders;
                    row.push(cellVal);
                } else {
                    row.push("");
                }
            }
            ws_data.push(row);
        }
        ws_data.push([]); // Empty row
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ders Programı");
    XLSX.writeFile(wb, "Ders_Programi_Disa_Aktarim.xlsx");
    BhUI.toast('Ders Programı başarıyla dışa aktarıldı.', 'success');
};

window.exportExcelNobet = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    if (!appData.nobetciGunluk || Object.keys(appData.nobetciGunluk).length === 0) {
        BhUI.toast('Dışa aktarılacak nöbet programı bulunamadı.', 'warning');
        return;
    }

    const ws_data = [
        ["Gün", "Öğretmen Adı", "Nöbet Yeri"]
    ];

    for (const [gun, list] of Object.entries(appData.nobetciGunluk)) {
        if (Array.isArray(list)) {
            list.forEach(item => {
                // Item format: "Öğretmen Adı (Nöbet Yeri)" veya "Öğretmen Adı"
                let ad = item;
                let yer = "";
                const match = item.match(/^(.*?)\s*\((.*?)\)$/);
                if (match) {
                    ad = match[1];
                    yer = match[2];
                }
                ws_data.push([gun, ad, yer]);
            });
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nöbet Programı");
    XLSX.writeFile(wb, "Nobet_Programi_Disa_Aktarim.xlsx");
    BhUI.toast('Nöbet Programı başarıyla dışa aktarıldı.', 'success');
};

window.downloadTemplate = function (type) {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi. İnternet bağlantınızı kontrol edin.', 'error');
        return;
    }

    let ws_data = [];
    let ws_name = "";
    let filename = "";

    if (type === 'program') {
        ws_data = [
            ["Sınıf: 9A"],
            ["Gün", "1. Ders", "2. Ders", "3. Ders", "4. Ders", "5. Ders", "6. Ders", "7. Ders", "8. Ders"],
            ["Pazartesi", "Matematik", "Matematik", "Fizik", "Fizik", "Tarih", "Tarih", "Beden Eğitimi", "Beden Eğitimi"],
            ["Salı", "Kimya", "Kimya", "Biyoloji", "Biyoloji", "Edebiyat", "Edebiyat", "İngilizce", "İngilizce"],
            ["Çarşamba", "", "", "", "", "", "", "", ""],
            ["Perşembe", "", "", "", "", "", "", "", ""],
            ["Cuma", "", "", "", "", "", "", "", ""],
            [],
            ["Sınıf: 9B"],
            ["Gün", "1. Ders", "2. Ders", "3. Ders", "4. Ders", "5. Ders", "6. Ders", "7. Ders", "8. Ders"],
            ["Pazartesi", "Edebiyat", "Edebiyat", "İngilizce", "İngilizce", "Matematik", "Matematik", "Tarih", "Tarih"]
        ];
        ws_name = "DersProgrami";
        filename = "ders_programi_sablonu_yeni.xlsx";
    } else if (type === 'sinav') {
        ws_data = [
            ["Ders", "Tarih", "Saat", "Sınıflar"],
            ["Matematik", "25.12.2023", "09:30", "9A, 9B, 10A"],
            ["Fizik", "26.12.2023", "10:20", "11A, 11B"],
            ["Tarih", "27.12.2023", "11:10", "12A"]
        ];
        ws_name = "SinavTakvimi";
        filename = "sinav_takvimi_sablonu.xlsx";
    } else {
        ws_data = [
            ["Gün", "Öğretmen Adı", "Nöbet Yeri"],
            ["Pazartesi", "YÜCEL YAMAN", "Bahçe"],
            ["Pazartesi", "İSMAİL KARADAĞ", "1. Kat"],
            ["Salı", "FEYZA NUREFŞAN YILMAZ", "Zemin Kat"]
        ];
        ws_name = "NobetProgrami";
        filename = "nobet_programi_sablonu.xlsx";
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, filename);
};

window.exportExcelSinav = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }
    const data = appData.sinavlar || [];
    if (data.length === 0) {
        BhUI.toast('Dışa aktarılacak sınav verisi bulunamadı.', 'warning');
        return;
    }

    const ws_data = [["Ders", "Tarih", "Saat", "Sınıflar"]];
    data.forEach(s => {
        ws_data.push([
            s.ders || "",
            s.tarih || "",
            s.saat || "",
            s.siniflar || ""
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SinavTakvimi");
    XLSX.writeFile(wb, "mevcut_sinav_takvimi.xlsx");
    BhUI.toast('Sınav Takvimi başarıyla dışa aktarıldı.', 'success');
};

window.importExcelSinav = function () {
    const fileInput = document.getElementById('inp-excel-sinav');
    const resultDiv = document.getElementById('excel-sinav-result');
    if (!fileInput.files || fileInput.files.length === 0) {
        BhUI.toast('Lütfen önce bir dosya seçin.', 'error');
        return;
    }

    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = guvenliExcelOku(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet);

            // Tüm sınavları sıfırla ve yeniden oluştur
            appData.sinavlar = [];

            let count = 0;
            json.forEach(row => {
                const ders = row["Ders"] ? row["Ders"].toString().trim() : "";
                // Handle Excel dates sometimes coming as numbers
                let tarih = "";
                if (row["Tarih"]) {
                    if (typeof row["Tarih"] === 'number') {
                        // Excel date conversion (approximate for simplicity)
                        const date = new Date((row["Tarih"] - (25567 + 2)) * 86400 * 1000);
                        tarih = ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
                    } else {
                        tarih = row["Tarih"].toString().trim();
                    }
                }
                const saat = row["Saat"] ? row["Saat"].toString().trim() : "";
                const siniflar = row["Sınıflar"] ? row["Sınıflar"].toString().trim() : "";

                if (ders && tarih) {
                    appData.sinavlar.push({
                        ders: ders,
                        tarih: tarih,
                        saat: saat,
                        siniflar: siniflar
                    });
                    if (siniflar) {
                        if (!appData.sinifListesi) appData.sinifListesi = [];
                        const sinifDizi = siniflar.split(/[,/]/).map(s => s.trim()).filter(Boolean);
                        sinifDizi.forEach(snf => {
                            if (snf && !appData.sinifListesi.includes(snf)) {
                                appData.sinifListesi.push(snf);
                            }
                        });
                    }
                    count++;
                }
            });

            if (count > 0) {
                saveData();
                resultDiv.innerHTML = `<span style="color:var(--secondary);"><i class="fa-solid fa-check"></i> ${count} adet sınav kaydı başarıyla aktarıldı ve kaydedildi.</span>`;
                if (typeof renderSinavlar === 'function') renderSinavlar();
                if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
                BhUI.toast(`${count} sınav içeri aktarıldı ve kaydedildi.`, 'success');
            } else {
                resultDiv.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Excel dosyasında geçerli veri bulunamadı. Şablonu kontrol edin.</span>`;
            }
        } catch (err) {
            console.error("Sınav excel parse error:", err);
            resultDiv.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Dosya okunurken hata oluştu.</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
};

window.importExcelProgram = function () {
    const fileInput = document.getElementById('inp-excel-program');
    const resultDiv = document.getElementById('excel-program-result');
    if (!fileInput.files || fileInput.files.length === 0) {
        BhUI.toast('Lütfen önce bir dosya seçin.', 'error');
        return;
    }

    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = guvenliExcelOku(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Excelden gelen verilerin üzerine yazmak için mevcut sınıfları temizle
            appData.sinifListesi = [];
            appData.dersHavuzuLise = [];
            appData.dersHavuzuOrtaokul = [];

            // 1. Aşama: Efsane (Legend) ve Rehberlik taraması
            const courseMap = {};
            const teacherMap = {};
            if (!appData.sinifRehberlik) appData.sinifRehberlik = {};

            // Saatleri çek (7. satır başlangıç, 9. satır bitiş - indeks olarak 6 ve 8)
            let vakitler = [];
            if (rawData.length > 8) {
                const startRow = rawData[6];
                const endRow = rawData[8];
                if (startRow && endRow) {
                    let d = 1;
                    for (let c = 4; c < startRow.length; c++) {
                        const start = String(startRow[c] || "").trim();
                        const end = String(endRow[c] || "").trim();
                        if (start && end && start.match(/^\d{2}:\d{2}$/)) {
                            vakitler.push({
                                ders: d + ". Ders",
                                saat: start + " - " + end
                            });
                            d++;
                        }
                    }
                    if (vakitler.length > 0) {
                        appData.dersProgramiLise = [...vakitler];
                        appData.dersProgramiOrtaokul = [...vakitler];
                    }
                }
            }

            let tempSinifForRehberlik = "";
            rawData.forEach(row => {
                if (!row || row.length === 0) return;

                // Rehber öğretmen tespiti
                const cell2 = String(row[2] || "").trim().toLowerCase();
                if (cell2 === "sınıf" || cell2 === "sinif") {
                    tempSinifForRehberlik = String(row[4] || "").trim();
                    let foundRehberHoca = "";
                    for (let i = 5; i < row.length; i++) {
                        const val = String(row[i] || "").trim();
                        if (val.includes("Sınıf Öğretmeni") || val.includes("Sınıf Ogretmeni")) {
                            foundRehberHoca = String(row[i + 2] || "").trim();
                            if (!foundRehberHoca && row[i + 1] && String(row[i + 1]).includes(":")) {
                                foundRehberHoca = String(row[i + 1]).split(":")[1].trim();
                            }
                            break;
                        }
                    }
                    if (tempSinifForRehberlik && foundRehberHoca) {
                        appData.sinifRehberlik[tempSinifForRehberlik] = foundRehberHoca;
                    }
                }

                // Kısaltma -> Tam İsim (Legend) tespiti
                // Boş hücreleri (merged cells vs) filtrele
                const vals = row.map(v => String(v || "").trim()).filter(v => v !== "");

                if (vals.length >= 3 && vals[0].match(/^\d+$/) && vals[1] !== "Ders") {
                    const kisaltma = vals[1];
                    const tamAd = vals[2];
                    const tamOgretmen = vals[vals.length - 1]; // Son dolu hücre öğretmen tam adıdır

                    courseMap[kisaltma] = tamAd;
                    if (tempSinifForRehberlik && tamOgretmen) {
                        teacherMap[tempSinifForRehberlik + "_" + kisaltma] = tamOgretmen;

                        if (!appData.tumOgretmenler) appData.tumOgretmenler = [];

                        // Çoklu öğretmen (virgül veya slash ile ayrılmış) durumunu yönet
                        const hocalar = tamOgretmen.split(/[,/]/).map(h => h.trim()).filter(h => h !== "");
                        hocalar.forEach(hoca => {
                            if (!appData.tumOgretmenler.includes(hoca)) {
                                appData.tumOgretmenler.push(hoca);
                            }
                        });
                    }

                    if (!appData.dersHavuzuLise.includes(tamAd)) {
                        appData.dersHavuzuLise.push(tamAd);
                    }
                    if (!appData.dersHavuzuOrtaokul.includes(tamAd)) {
                        appData.dersHavuzuOrtaokul.push(tamAd);
                    }
                }
            });

            if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};

            let count = 0;
            let currentSinif = "";
            let periodCols = [];
            const daysMap = { 'pazartesi': 'Pazartesi', 'salı': 'Salı', 'sali': 'Salı', 'çarşamba': 'Çarşamba', 'carsamba': 'Çarşamba', 'perşembe': 'Perşembe', 'persembe': 'Perşembe', 'cuma': 'Cuma' };

            rawData.forEach((row, rowIndex) => {
                if (!row || row.length === 0) return;

                const firstCell = String(row[0] || "").trim();

                if (firstCell.toLowerCase().startsWith("sınıf:") || firstCell.toLowerCase().startsWith("sinif:")) {
                    const match = firstCell.match(/Sınıf:\s*([^\s|]+)/i) || firstCell.match(/Sinif:\s*([^\s|]+)/i) || firstCell.match(/Sınıf:s*([^\s|]+)/i) || firstCell.match(/Sinif:s*([^\s|]+)/i);
                    if (match) {
                        currentSinif = match[1];
                        if (currentSinif) {
                            if (!appData.sinifListesi) appData.sinifListesi = [];
                            if (!appData.sinifListesi.includes(currentSinif)) {
                                appData.sinifListesi.push(currentSinif);
                            }
                        }
                    }
                    return;
                }

                const cell2 = String(row[2] || "").trim().toLowerCase();
                if (cell2 === "sınıf" || cell2 === "sinif") {
                    currentSinif = String(row[4] || "").trim();
                    if (currentSinif) {
                        if (!appData.sinifListesi) appData.sinifListesi = [];
                        if (!appData.sinifListesi.includes(currentSinif)) {
                            appData.sinifListesi.push(currentSinif);
                        }
                    }
                    return;
                }

                let isHeaderRow = false;
                for (let i = 0; i < 5; i++) {
                    const val = String(row[i] || "").trim().toLowerCase();
                    if (val === "ders\\gün" || val === "ders/gün" || val === "dersgün") {
                        isHeaderRow = true;
                        break;
                    }
                }

                if (isHeaderRow) {
                    periodCols = [];
                    for (let c = 0; c < row.length; c++) {
                        const val = String(row[c] || "").trim();
                        if (val.match(/^\(\d+\)$/) || val === "#") {
                            periodCols.push(c);
                        }
                    }
                    if (periodCols.length === 0) {
                        let foundDers = false;
                        for (let c = 0; c < row.length; c++) {
                            const val = String(row[c] || "").trim().toLowerCase();
                            if (val.includes("ders")) foundDers = true;
                            else if (foundDers && val !== "") periodCols.push(c);
                        }
                    }
                    return;
                }

                const lowerFirst = firstCell.toLowerCase();
                const strGun = daysMap[lowerFirst];

                if (strGun && currentSinif) {
                    if (!appData.dersProgramiDetay[currentSinif]) appData.dersProgramiDetay[currentSinif] = {};
                    if (!appData.dersProgramiDetay[currentSinif][strGun]) appData.dersProgramiDetay[currentSinif][strGun] = {};

                    if (periodCols.length > 0) {
                        const courseRow = rawData[rowIndex - 2] || [];
                        const teacherRow = row;

                        periodCols.forEach((colIndex, periodIdx) => {
                            let dAdi = String(courseRow[colIndex] || "").trim();
                            let tAdi = String(teacherRow[colIndex] || "").trim();

                            if (dAdi.includes('\n')) {
                                const parts = dAdi.split('\n');
                                dAdi = parts[parts.length >= 2 ? 1 : 0].trim();
                            }

                            const orjinalDersAdi = dAdi;
                            dAdi = courseMap[dAdi] || dAdi;

                            if (currentSinif && orjinalDersAdi) {
                                const tMapKey = currentSinif + "_" + orjinalDersAdi;
                                if (teacherMap[tMapKey]) {
                                    tAdi = teacherMap[tMapKey];
                                }
                            }

                            if (dAdi !== "") {
                                appData.dersProgramiDetay[currentSinif][strGun][periodIdx] = {
                                    ders: dAdi,
                                    ogretmen: tAdi,
                                    type: 'ders'
                                };

                                if (!appData.sinifDersleri) appData.sinifDersleri = {};
                                if (!appData.sinifDersleri[currentSinif]) appData.sinifDersleri[currentSinif] = [];
                                if (!appData.sinifDersleri[currentSinif].includes(dAdi)) {
                                    appData.sinifDersleri[currentSinif].push(dAdi);
                                }

                                if (dAdi) {
                                    if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [];
                                    if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [];
                                    if (!appData.dersHavuzuLise.includes(dAdi)) appData.dersHavuzuLise.push(dAdi);
                                    if (!appData.dersHavuzuOrtaokul.includes(dAdi)) appData.dersHavuzuOrtaokul.push(dAdi);
                                }

                                if (tAdi) {
                                    if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
                                    const hocalar = tAdi.split(/[,/]/).map(h => h.trim()).filter(h => h !== "");
                                    hocalar.forEach(h => {
                                        if (!appData.tumOgretmenler.includes(h)) appData.tumOgretmenler.push(h);
                                    });

                                    if (!appData.sinifDersOgretmen) appData.sinifDersOgretmen = {};
                                    if (!appData.sinifDersOgretmen[currentSinif]) appData.sinifDersOgretmen[currentSinif] = {};
                                    appData.sinifDersOgretmen[currentSinif][dAdi] = tAdi;
                                }
                            } else {
                                delete appData.dersProgramiDetay[currentSinif][strGun][periodIdx];
                            }
                        });
                    } else {
                        for (let i = 1; i <= 8; i++) {
                            const cellVal = String(row[i] || "").trim();
                            if (cellVal !== "") {
                                let dAdi = cellVal;
                                let tAdi = "";

                                const parenMatch = cellVal.match(/^(.*?)\s*\((.*?)\)$/);
                                if (cellVal.includes('\n')) {
                                    const parts = cellVal.split('\n');
                                    dAdi = parts[0].trim();
                                    tAdi = parts.slice(1).join(' ').trim();
                                } else if (parenMatch) {
                                    dAdi = parenMatch[1].trim();
                                    tAdi = parenMatch[2].trim();
                                } else if (cellVal.includes(' - ')) {
                                    const parts = cellVal.split(' - ');
                                    dAdi = parts[0].trim();
                                    tAdi = parts.slice(1).join(' - ').trim();
                                }

                                dAdi = courseMap[dAdi] || dAdi;

                                appData.dersProgramiDetay[currentSinif][strGun][i - 1] = {
                                    ders: dAdi,
                                    ogretmen: tAdi,
                                    type: 'ders'
                                };

                                if (!appData.sinifDersleri) appData.sinifDersleri = {};
                                if (!appData.sinifDersleri[currentSinif]) appData.sinifDersleri[currentSinif] = [];
                                if (!appData.sinifDersleri[currentSinif].includes(dAdi)) {
                                    appData.sinifDersleri[currentSinif].push(dAdi);
                                }

                                if (dAdi) {
                                    if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [];
                                    if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [];
                                    if (!appData.dersHavuzuLise.includes(dAdi)) appData.dersHavuzuLise.push(dAdi);
                                    if (!appData.dersHavuzuOrtaokul.includes(dAdi)) appData.dersHavuzuOrtaokul.push(dAdi);
                                }

                                if (tAdi) {
                                    if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
                                    const hocalar = tAdi.split(/[,/]/).map(h => h.trim()).filter(h => h !== "");
                                    hocalar.forEach(h => {
                                        if (!appData.tumOgretmenler.includes(h)) appData.tumOgretmenler.push(h);
                                    });

                                    if (!appData.sinifDersOgretmen) appData.sinifDersOgretmen = {};
                                    if (!appData.sinifDersOgretmen[currentSinif]) appData.sinifDersOgretmen[currentSinif] = {};
                                    appData.sinifDersOgretmen[currentSinif][dAdi] = tAdi;
                                }
                            } else {
                                delete appData.dersProgramiDetay[currentSinif][strGun][i - 1];
                            }
                        }
                    }
                    count++;
                }
            });

            // Ders havuzu boş kalmasın; varsayılanları da koru
            if (!Array.isArray(appData.dersHavuzuLise) || appData.dersHavuzuLise.length === 0) {
                appData.dersHavuzuLise = (window.defaultDersler || []).slice();
            }
            if (!Array.isArray(appData.dersHavuzuOrtaokul) || appData.dersHavuzuOrtaokul.length === 0) {
                appData.dersHavuzuOrtaokul = (window.defaultDersler || []).slice();
            }

            saveData();
            if (typeof window.updateProgramStats === 'function') {
                try { window.updateProgramStats(); } catch (e) { }
            }
            if (typeof window.renderProgramClassButtons === 'function') {
                try { window.renderProgramClassButtons(); } catch (e) { }
            }
            if (typeof window.renderProgramMatrix === 'function') {
                try { window.renderProgramMatrix(); } catch (e) { console.warn("Matrix render error skipped:", e); }
            }
            if (typeof window.renderEslestirmeClassButtons === 'function') {
                try { window.renderEslestirmeClassButtons(); } catch (e) { }
            }
            if (typeof window.renderEslestirmeMatrix === 'function') {
                try { window.renderEslestirmeMatrix(); } catch (e) { }
            }
            if (typeof window.renderHavuzTags === 'function') {
                try { window.renderHavuzTags(); } catch (e) { }
            }
            if (typeof window.renderSiniflarTable === 'function') {
                try { window.renderSiniflarTable(); } catch (e) { }
            }
            if (typeof window.renderOgretmenTable === 'function') {
                try { window.renderOgretmenTable(); } catch (e) { }
            }
            if (typeof window.renderNobetciDnD === 'function') {
                try { window.renderNobetciDnD(); } catch (e) { }
            }
            if (typeof window.renderDersler === 'function') {
                try { window.renderDersler(); } catch (e) { }
            }
            if (typeof window.updateZamanStats === 'function') {
                try { window.updateZamanStats(); } catch (e) { }
            }

            resultDiv.innerHTML = `<span style="color:var(--success);"><i class="fa-solid fa-check"></i> ${count} gün kaydı başarıyla içeri aktarıldı.</span>`;
            BhUI.toast('Ders Programı başarıyla içe aktarıldı.', 'success');
        } catch (err) {
            console.error(err);
            resultDiv.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Hata: ${escapeHtml(err.message || err.toString())}</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
};

window.importExcelNobet = function () {
    const fileInput = document.getElementById('inp-excel-nobet');
    const resultDiv = document.getElementById('excel-nobet-result');
    if (!fileInput.files || fileInput.files.length === 0) {
        BhUI.toast('Lütfen önce bir dosya seçin.', 'error');
        return;
    }

    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi yüklenmedi.', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = guvenliExcelOku(data);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet);

            // Tüm nöbetleri sıfırla ve yeniden oluştur
            if (!appData.nobetciGunluk) appData.nobetciGunluk = {};
            const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
            days.forEach(d => { appData.nobetciGunluk[d] = []; });

            let count = 0;
            json.forEach(row => {
                const gun = row["Gün"] ? row["Gün"].toString().trim() : "";
                const ad = row["Öğretmen Adı"] ? row["Öğretmen Adı"].toString().trim() : "";
                const yer = row["Nöbet Yeri"] ? row["Nöbet Yeri"].toString().trim() : "";

                const formatGun = (g) => {
                    const map = { 'pazartesi': 'Pazartesi', 'salı': 'Salı', 'sali': 'Salı', 'çarşamba': 'Çarşamba', 'carsamba': 'Çarşamba', 'perşembe': 'Perşembe', 'persembe': 'Perşembe', 'cuma': 'Cuma' };
                    return map[g.toLowerCase()] || gun;
                };

                const strGun = formatGun(gun);

                if (strGun && ad && days.includes(strGun)) {
                    appData.nobetciGunluk[strGun].push(yer ? `${ad} (${yer})` : ad);
                    // Nöbetçi öğretmenleri genel öğretmen listesine de ekle
                    if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
                    if (!appData.tumOgretmenler.includes(ad)) {
                        appData.tumOgretmenler.push(ad);
                    }
                    count++;
                }
            });

            saveData();
            if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
            if (typeof renderNobetci === 'function') renderNobetci();
            if (typeof renderOgretmenTable === 'function') renderOgretmenTable();
            resultDiv.innerHTML = `<span style="color:var(--success);"><i class="fa-solid fa-check"></i> ${count} nöbet kaydı başarıyla içeri aktarıldı.</span>`;
            BhUI.toast('Nöbet Programı başarıyla içe aktarıldı.', 'success');
        } catch (err) {
            console.error(err);
            resultDiv.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Hata: ${escapeHtml(err.message || err.toString())}</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
};

// --- Öğretmen Yönetimi: Ders Programı Sekmesi ---
document.querySelectorAll('.btn-ogretmen-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-ogretmen-tab').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('.btn-ogretmen-tab') || e.target;
        targetBtn.classList.add('active');

        const tab = targetBtn.getAttribute('data-tab');
        if (tab === 'liste') {
            document.getElementById('ogretmenler-liste-container').style.display = 'block';
            document.getElementById('ogretmenler-program-container').style.display = 'none';
        } else {
            document.getElementById('ogretmenler-liste-container').style.display = 'none';
            document.getElementById('ogretmenler-program-container').style.display = 'flex';
            populateOgretmenSelect();
        }
    });
});

window.gitOgretmenProgramina = function (teacherName) {
    document.querySelectorAll('.btn-ogretmen-tab').forEach(b => {
        if (b.getAttribute('data-tab') === 'program') {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    const listCont = document.getElementById('ogretmenler-liste-container');
    const progCont = document.getElementById('ogretmenler-program-container');
    if (listCont) listCont.style.display = 'none';
    if (progCont) progCont.style.display = 'flex';

    populateOgretmenSelect();
    const sel = document.getElementById('sel-ogretmen-program');
    if (sel) {
        sel.value = teacherName;
        renderOgretmenHaftalikProgram(teacherName);
    }
};

function populateOgretmenSelect() {
    const sel = document.getElementById('sel-ogretmen-program');
    if (!sel) return;

    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Öğretmen Seçiniz...</option>';

    const ogretmenler = new Set();
    if (appData.tumOgretmenler && appData.tumOgretmenler.length > 0) {
        appData.tumOgretmenler.forEach(t => ogretmenler.add(t.trim()));
    } else {
        if (appData.ogretmenBranslar) {
            appData.ogretmenBranslar.forEach(item => ogretmenler.add(item.split(':')[0].trim()));
        }
        if (appData.dersProgramiDetay) {
            Object.values(appData.dersProgramiDetay).forEach(gunler => {
                Object.values(gunler).forEach(dersler => {
                    Object.values(dersler).forEach(d => {
                        if (d.ogretmen) ogretmenler.add(d.ogretmen.trim());
                    });
                });
            });
        }
    }

    const siralilar = Array.from(ogretmenler).sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));
    siralilar.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        sel.appendChild(opt);
    });

    if (currentVal && ogretmenler.has(currentVal)) {
        sel.value = currentVal;
    }
}

document.getElementById('sel-ogretmen-program')?.addEventListener('change', (e) => {
    renderOgretmenHaftalikProgram(e.target.value);
});

function renderOgretmenHaftalikProgram(ogretmenAdi) {
    const grid = document.getElementById('ogretmen-program-sonuc');
    const ozetBar = document.getElementById('ogretmen-program-ozet-bar');
    if (!grid) return;

    if (!ogretmenAdi) {
        if (ozetBar) ozetBar.style.display = 'none';
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 30px 20px; text-align: center; color: var(--text-muted); background: #f8fafc; border-radius: 10px; border: 1.5px dashed var(--sidebar-border);">
                <i class="fa-solid fa-calendar-check" style="font-size: 2rem; color: var(--primary); opacity: 0.5; margin-bottom: 8px; display: block;"></i>
                Lütfen yukarıdaki menüden ders programını görüntülemek istediğiniz öğretmeni seçin.
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const matrix = [];
    for (let i = 0; i < 5; i++) matrix[i] = new Array(8).fill(null);

    let totalHours = 0;
    if (appData.dersProgramiDetay) {
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            days.forEach((gun, dIdx) => {
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    for (let sIdx = 0; sIdx < 8; sIdx++) {
                        const dBilgi = gData[sIdx];
                        if (dBilgi && dBilgi.type === 'ders' && dBilgi.ogretmen && dBilgi.ogretmen.trim().toLowerCase() === ogretmenAdi.trim().toLowerCase()) {
                            matrix[dIdx][sIdx] = { sinif: sinif, ders: dBilgi.ders };
                            totalHours++;
                        }
                    }
                }
            });
        }
    }

    // Özet Barı Güncelle
    if (ozetBar) {
        ozetBar.style.display = 'flex';
        const elAvatar = document.getElementById('program-ozet-avatar');
        if (elAvatar) elAvatar.textContent = getTeacherInitials(ogretmenAdi);
        const elIsim = document.getElementById('program-ozet-isim');
        if (elIsim) elIsim.textContent = ogretmenAdi;

        const assignment = (appData.ogretmenBranslar || []).find(item => item.startsWith(ogretmenAdi + ' :'));
        const brans = assignment ? assignment.split(':')[1].trim() : 'Branş Belirtilmemiş';
        const elBrans = document.getElementById('program-ozet-brans');
        if (elBrans) elBrans.textContent = brans;

        let rehberSinif = '-';
        for (const [sinif, hoca] of Object.entries(appData.sinifRehberlik || {})) {
            if (hoca === ogretmenAdi) {
                rehberSinif = sinif;
                break;
            }
        }
        const elRehber = document.getElementById('program-ozet-rehberlik');
        if (elRehber) elRehber.innerHTML = rehberSinif !== '-' ? `🎓 <strong>Sınıf Rehberliği:</strong> ${escapeHtml(rehberSinif)}` : `Rehberlik: Yok`;

        const elSaat = document.getElementById('program-ozet-toplam-saat');
        if (elSaat) elSaat.innerHTML = `📚 Toplam: <strong>${totalHours} Saat</strong> / Hafta`;
    }

    days.forEach((gun, dIdx) => {
        const col = document.createElement('div');
        col.style.background = '#ffffff';
        col.style.border = '1px solid var(--sidebar-border)';
        col.style.borderRadius = '12px';
        col.style.padding = '14px';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '8px';
        col.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';

        let gunlukSaat = 0;
        for (let sIdx = 0; sIdx < 8; sIdx++) {
            if (matrix[dIdx][sIdx]) gunlukSaat++;
        }

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary-glow); padding-bottom: 8px; margin-bottom: 4px;">
                <span style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">${gun}</span>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px;">${gunlukSaat} Saat</span>
            </div>
        `;

        for (let sIdx = 0; sIdx < 8; sIdx++) {
            const data = matrix[dIdx][sIdx];
            if (data) {
                html += `
                <div style="padding: 9px 12px; background: #ecfdf5; border-left: 3px solid #10b981; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <span style="font-weight: 700; color: #047857; font-size: 0.78rem;">${sIdx + 1}. Ders</span>
                        <span style="font-weight: 800; color: #065f46; font-size: 0.95rem;">${escapeHtml(data.sinif)}</span>
                    </div>
                    <div style="color: #334155; font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(data.ders)}">${escapeHtml(data.ders)}</div>
                </div>`;
            } else {
                html += `
                <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #e2e8f0; border-radius: 6px; opacity: 0.7;">
                    <div style="font-weight: 600; color: var(--text-muted); font-size: 0.78rem;">${sIdx + 1}. Ders</div>
                    <div style="color: #94a3b8; font-size: 0.8rem;">-</div>
                </div>`;
            }
        }
        col.innerHTML = html;
        grid.appendChild(col);
    });
}

window.yazdirOgretmenProgrami = function () {
    const sel = document.getElementById('sel-ogretmen-program');
    const ogretmenAdi = sel ? sel.value : '';
    if (!ogretmenAdi) {
        BhUI.toast('Lütfen ders programını yazdırmak istediğiniz öğretmeni seçin.', 'warning');
        return;
    }

    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const matrix = [];
    for (let i = 0; i < 5; i++) matrix[i] = new Array(8).fill(null);

    let totalHours = 0;
    if (appData.dersProgramiDetay) {
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            days.forEach((gun, dIdx) => {
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    for (let sIdx = 0; sIdx < 8; sIdx++) {
                        const dBilgi = gData[sIdx];
                        if (dBilgi && dBilgi.type === 'ders' && dBilgi.ogretmen && dBilgi.ogretmen.trim().toLowerCase() === ogretmenAdi.trim().toLowerCase()) {
                            matrix[dIdx][sIdx] = { sinif: sinif, ders: dBilgi.ders };
                            totalHours++;
                        }
                    }
                }
            });
        }
    }

    const assignment = (appData.ogretmenBranslar || []).find(item => item.startsWith(ogretmenAdi + ' :'));
    const brans = assignment ? assignment.split(':')[1].trim() : '-';

    let rehberSinif = '-';
    for (const [sinif, hoca] of Object.entries(appData.sinifRehberlik || {})) {
        if (hoca === ogretmenAdi) {
            rehberSinif = sinif;
            break;
        }
    }

    const okulAdi = (appData.okulAdi || 'Okul') + ' ' + (appData.okulTuru || '');
    const bugun = new Date().toLocaleDateString('tr-TR');

    let rowsHtml = '';
    for (let sIdx = 0; sIdx < 8; sIdx++) {
        rowsHtml += `<tr><td style="font-weight:bold; background:#f8fafc; text-align:center; padding:8px;">${sIdx + 1}. Ders</td>`;
        for (let dIdx = 0; dIdx < 5; dIdx++) {
            const data = matrix[dIdx][sIdx];
            if (data) {
                rowsHtml += `<td style="padding:8px; text-align:center; border:1px solid #cbd5e1; background:#ecfdf5;"><strong style="color:#059669; font-size:1.05em;">${escapeHtml(data.sinif)}</strong><br><small style="color:#475569;">${escapeHtml(data.ders)}</small></td>`;
            } else {
                rowsHtml += `<td style="padding:8px; text-align:center; border:1px solid #e2e8f0; color:#94a3b8; font-size:0.85em;">-</td>`;
            }
        }
        rowsHtml += `</tr>`;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
        BhUI.toast('Yazdırma penceresi açılamadı. Tarayıcı açılır pencere engelleyicisini kontrol edin.', 'error');
        return;
    }

    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(ogretmenAdi)} - Haftalık Ders Programı</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; }
                .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 1.4rem; color: #1e3a8a; }
                .header h2 { margin: 4px 0 0 0; font-size: 1.15rem; color: #3b82f6; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.95rem; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; }
                th { background: #1e3a8a; color: white; padding: 10px; font-size: 0.95rem; }
                .footer { margin-top: 25px; display: flex; justify-content: space-between; font-size: 0.9rem; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${escapeHtml(okulAdi)}</h1>
                <h2>ÖĞRETMEN HAFTALIK DERS PROGRAMI</h2>
            </div>
            <div class="meta">
                <div><strong>Öğretmen:</strong> ${escapeHtml(ogretmenAdi)} &nbsp;|&nbsp; <strong>Branş:</strong> ${escapeHtml(brans)}</div>
                <div><strong>Sınıf Rehberliği:</strong> ${escapeHtml(rehberSinif)} &nbsp;|&nbsp; <strong>Toplam Ders:</strong> ${totalHours} Saat</div>
                <div><strong>Tarih:</strong> ${bugun}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 100px;">Ders Saati</th>
                        <th>Pazartesi</th>
                        <th>Salı</th>
                        <th>Çarşamba</th>
                        <th>Perşembe</th>
                        <th>Cuma</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
            <div class="footer">
                <div>${escapeHtml(ogretmenAdi)}<br><small>Öğretmen</small></div>
                <div style="text-align: right;">Okul Müdürü<br><small>İmza / Mühür</small></div>
            </div>
            <script>
                window.onload = function() { window.print(); };
            <\/script>
        </body>
        </html>
    `);
    printWin.document.close();
};

window.exportOgretmenProgramiExcel = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi.', 'error');
        return;
    }

    const sel = document.getElementById('sel-ogretmen-program');
    const ogretmenAdi = sel ? sel.value : '';
    if (!ogretmenAdi) {
        BhUI.toast('Lütfen Excel olarak indirmek istediğiniz öğretmeni seçin.', 'warning');
        return;
    }

    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const matrix = [];
    for (let i = 0; i < 5; i++) matrix[i] = new Array(8).fill(null);

    let totalHours = 0;
    if (appData.dersProgramiDetay) {
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            days.forEach((gun, dIdx) => {
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    for (let sIdx = 0; sIdx < 8; sIdx++) {
                        const dBilgi = gData[sIdx];
                        if (dBilgi && dBilgi.type === 'ders' && dBilgi.ogretmen && dBilgi.ogretmen.trim().toLowerCase() === ogretmenAdi.trim().toLowerCase()) {
                            matrix[dIdx][sIdx] = `${sinif} (${dBilgi.ders})`;
                            totalHours++;
                        }
                    }
                }
            });
        }
    }

    const assignment = (appData.ogretmenBranslar || []).find(item => item.startsWith(ogretmenAdi + ' :'));
    const brans = assignment ? assignment.split(':')[1].trim() : '-';

    const okulAdi = (appData.okulAdi || 'Okul') + ' ' + (appData.okulTuru || '');
    const bugun = new Date().toLocaleDateString('tr-TR');

    const ws_data = [
        [okulAdi],
        [`ÖĞRETMEN HAFTALIK DERS PROGRAMI: ${ogretmenAdi}`],
        [`Branş: ${brans} | Toplam Ders Yükü: ${totalHours} Saat | Rapor Tarihi: ${bugun}`],
        [],
        ['Ders Saati', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
    ];

    for (let sIdx = 0; sIdx < 8; sIdx++) {
        const row = [`${sIdx + 1}. Ders`];
        for (let dIdx = 0; dIdx < 5; dIdx++) {
            row.push(matrix[dIdx][sIdx] || '-');
        }
        ws_data.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [
        { wch: 14 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Program');
    const safeName = ogretmenAdi.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
    XLSX.writeFile(wb, `${safeName}_Haftalik_Ders_Programi.xlsx`);
    BhUI.toast(`${ogretmenAdi} ders programı Excel olarak indirildi.`, 'success');
};


// --- EXPORT TAMAMLAMA ---
window.exportTamamlamaToExcel = function () {
    if (typeof XLSX === 'undefined') {
        BhUI.toast('Excel kütüphanesi (SheetJS) henüz yüklenmedi. İnternet bağlantınızı kontrol edin.', 'error');
        return;
    }

    const gunSelect = document.getElementById('tamamlama-gun-select');
    const gun = gunSelect ? gunSelect.value : "Pazartesi";

    if (!gun || !appData.tamamlamaAtamalari || !appData.tamamlamaAtamalari[gun] || appData.tamamlamaAtamalari[gun].length === 0) {
        BhUI.toast(gun + ' günü için dışa aktarılacak bir ders tamamlama ataması bulunmuyor.', 'warning');
        return;
    }

    const atamalar = [...appData.tamamlamaAtamalari[gun]];
    atamalar.sort((a, b) => a.saat - b.saat);

    const bugun = new Date();
    const tarihStr = bugun.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dosyaTarih = bugun.toLocaleDateString('tr-TR').replace(/\//g, '-');

    const ws_data = [
        [`Ders Tamamlama Atamaları - ${gun}`],
        [`Tarih: ${tarihStr}`],
        [],
        ["Ders Saati", "Sınıf / Ders", "İzinli Öğretmen (Kimin Yerine)", "Nöbetçi Öğretmen (Kim Girecek)"]
    ];

    atamalar.forEach(atama => {
        ws_data.push([
            (atama.saat + 1) + ". Ders",
            atama.sinif + " - " + atama.dersAdi,
            atama.izinli,
            atama.nobetci
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    ws['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tamamlama Atamaları");
    XLSX.writeFile(wb, `Ders_Tamamlama_${gun}_${dosyaTarih}.xlsx`);
    BhUI.toast('Atama listesi başarıyla Excel olarak indirildi.', 'success');
};

// ============================================================================
// 🔔 SEYİR AKILLI ZİL YÖNETİMİ & WEB AUDIO SENTEZLEYİCİ MOTORU
// ============================================================================

/**
 * Seyir Ses Motoru - Saf Web Audio API Sentezleyici
 * Dış ses dosyası yüklemeye gerek kalmadan %100 yerel ve sıfır gecikmeli çalışır.
 */
class SeyirAudioZilEngine {
    constructor() {
        this.ctx = null;
        this.activeOscillators = [];
        this.activeGains = [];
        this.isPlaying = false;
        this.currentTimeout = null;
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn('AudioContext resume uyarısı:', e));
        }
        return this.ctx;
    }

    stop() {
        this.isPlaying = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        this.activeOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        this.activeGains.forEach(gain => {
            try { gain.disconnect(); } catch (e) {}
        });
        this.activeOscillators = [];
        this.activeGains = [];

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        if (window.SeyirAudioStore && typeof window.SeyirAudioStore.stopAll === 'function') {
            window.SeyirAudioStore.stopAll();
        }
    }

    /**
     * Akustik Çan Sentezi: Çoklu harmonik üst tonlar + doğal üstel sönüm
     */
    playChimeTone(freq, startTime, duration = 1.8, volume = 0.5, type = 'sine') {
        const ctx = this.initContext();
        if (!ctx) return;

        const harmonics = [
            { mult: 1.0, gainMult: 0.75, decayMult: 1.0 },
            { mult: 2.0, gainMult: 0.25, decayMult: 0.8 },
            { mult: 3.01, gainMult: 0.15, decayMult: 0.6 },
            { mult: 4.18, gainMult: 0.08, decayMult: 0.4 }
        ];

        harmonics.forEach(h => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq * h.mult, startTime);

            const peakVol = Math.max(0.0005, volume * h.gainMult);
            gainNode.gain.setValueAtTime(0.0001, startTime);
            gainNode.gain.exponentialRampToValueAtTime(peakVol, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * h.decayMult));

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + (duration * h.decayMult) + 0.05);

            this.activeOscillators.push(osc);
            this.activeGains.push(gainNode);
        });
    }

    /**
     * Geleneksel mekanik okul zili (Hızlı vibrato tokmak vuruşu)
     */
    playClassicVibratoBell(startTime, duration = 6, volume = 0.5) {
        const ctx = this.initContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const mainGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(640, startTime);

        lfo.type = 'square';
        lfo.frequency.setValueAtTime(16, startTime);

        lfoGain.gain.setValueAtTime(80, startTime);
        lfo.connect(osc.frequency);

        mainGain.gain.setValueAtTime(0.001, startTime);
        mainGain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.08);
        mainGain.gain.setValueAtTime(volume * 0.7, startTime + duration - 0.2);
        mainGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(mainGain);
        mainGain.connect(ctx.destination);

        lfo.start(startTime);
        osc.start(startTime);

        lfo.stop(startTime + duration);
        osc.stop(startTime + duration);

        this.activeOscillators.push(osc, lfo);
        this.activeGains.push(mainGain, lfoGain);
    }

    /**
     * Acil durum sireni (İki tonlu frekans taraması)
     */
    playEmergencySiren(startTime, duration = 8, volume = 0.6) {
        const ctx = this.initContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sawtooth';
        const sweepPeriod = 1.0;
        const cycles = Math.ceil(duration / sweepPeriod);

        for (let i = 0; i < cycles; i++) {
            const t = startTime + (i * sweepPeriod);
            osc.frequency.setValueAtTime(700, t);
            osc.frequency.linearRampToValueAtTime(1250, t + (sweepPeriod / 2));
            osc.frequency.linearRampToValueAtTime(700, t + sweepPeriod);
        }

        gainNode.gain.setValueAtTime(volume * 0.6, startTime);
        gainNode.gain.setValueAtTime(volume * 0.6, startTime + duration - 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);

        this.activeOscillators.push(osc);
        this.activeGains.push(gainNode);
    }

    /**
     * Belirtilen melodiyi süre ve ses seviyesiyle çalar
     */
    playMelody(melodyType, durationSeconds = 8, volumePercent = 80, customAudioId = null) {
        this.stop();

        // Yerel Özel Ses Dosyası Oynatma Kontrolü
        if (melodyType === 'custom' || customAudioId) {
            if (window.SeyirAudioStore && typeof window.SeyirAudioStore.playAudio === 'function') {
                this.isPlaying = true;
                window.SeyirAudioStore.playAudio(customAudioId, volumePercent, () => {
                    this.isPlaying = false;
                }).then(audioObj => {
                    if (!audioObj) {
                        // Ses dosyası bulunamadıysa sentetik modern melodiye geç
                        this.playMelody('modern', durationSeconds, volumePercent);
                    }
                }).catch(() => {
                    this.playMelody('modern', durationSeconds, volumePercent);
                });
                return;
            }
        }

        const ctx = this.initContext();
        if (!ctx) return;

        this.isPlaying = true;
        const vol = Math.min(1.0, Math.max(0.05, (volumePercent / 100) * 0.65));
        const now = ctx.currentTime + 0.05;

        if (melodyType === 'alarm') {
            this.playEmergencySiren(now, durationSeconds, vol);
        } else if (melodyType === 'klasik') {
            this.playClassicVibratoBell(now, durationSeconds, vol);
        } else if (melodyType === 'westminster') {
            // Westminster Kule Çanı Melodisi
            const notes = [
                { f: 659.25, d: 1.2 }, // E5
                { f: 587.33, d: 1.2 }, // D5
                { f: 523.25, d: 1.2 }, // C5
                { f: 392.00, d: 1.9 }  // G4
            ];
            let offset = 0;
            const repeatCount = Math.max(1, Math.floor(durationSeconds / 3.2));
            for (let r = 0; r < repeatCount; r++) {
                notes.forEach(n => {
                    if (offset < durationSeconds) {
                        this.playChimeTone(n.f, now + offset, n.d, vol, 'sine');
                    }
                    offset += 0.72;
                });
                offset += 0.4;
            }
        } else if (melodyType === 'chime') {
            // Yumuşak Kristal Çan
            const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            let offset = 0;
            const repeatCount = Math.max(1, Math.floor(durationSeconds / 2.5));
            for (let r = 0; r < repeatCount; r++) {
                chord.forEach(f => {
                    if (offset < durationSeconds) {
                        this.playChimeTone(f, now + offset, 1.8, vol * 0.9, 'sine');
                    }
                    offset += 0.32;
                });
                offset += 0.7;
            }
        } else if (melodyType === 'marimba') {
            // Marimba Tonu
            const notes = [440, 554.37, 659.25, 880];
            let offset = 0;
            const repeats = Math.max(1, Math.floor(durationSeconds / 2));
            for (let r = 0; r < repeats; r++) {
                notes.forEach(f => {
                    if (offset < durationSeconds) {
                        this.playChimeTone(f, now + offset, 0.9, vol, 'triangle');
                    }
                    offset += 0.28;
                });
                offset += 0.5;
            }
        } else if (melodyType === 'fanfare') {
            // Kısa Neşeli Fanfar
            const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
            let offset = 0;
            const repeats = Math.max(1, Math.floor(durationSeconds / 2.8));
            for (let r = 0; r < repeats; r++) {
                notes.forEach((f, idx) => {
                    const step = (idx < 3) ? 0.20 : 0.42;
                    if (offset < durationSeconds) {
                        this.playChimeTone(f, now + offset, 1.2, vol, 'sine');
                    }
                    offset += step;
                });
                offset += 0.6;
            }
        } else {
            // 'modern' varsayılan okul melodisi: 4 tonlu uyumlu arpej
            const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99];
            let offset = 0;
            const repeats = Math.max(1, Math.floor(durationSeconds / 3));
            for (let r = 0; r < repeats; r++) {
                notes.forEach(f => {
                    if (offset < durationSeconds) {
                        this.playChimeTone(f, now + offset, 1.6, vol, 'sine');
                    }
                    offset += 0.42;
                });
                offset += 0.7;
            }
        }

        this.currentTimeout = setTimeout(() => {
            this.isPlaying = false;
        }, (durationSeconds + 1) * 1000);
    }
}

// Global Ses Motoru Örneği
const seyirZilEngine = new SeyirAudioZilEngine();

// Kullanıcı sayfaya dokunduğunda / tıkladığında AudioContext kilitlerini otomatik aç
['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => {
        seyirZilEngine.initContext();
    }, { passive: true });
});

// Zil Çalma Durum Takip Değişkenleri
let sonCalanDakika = "";
let sonCalanTorenDakika = "";
let zilTimerInterval = null;
let zilGorselTimeout = null;

/**
 * appData.zilYonetimi nesnesinin varlığını ve bütünlüğünü sağlar
 */
function getZilVerisi() {
    if (!appData.zilYonetimi || typeof appData.zilYonetimi !== 'object') {
        appData.zilYonetimi = {
            aktif: true,
            melodiOgrenci: "modern",
            melodiOgretmen: "chime",
            melodiCikis: "westminster",
            sesSeviyesi: 80,
            calmaSuresi: 8,
            haftasonuSessiz: true,
            sesliAnons: false,
            nobetciVurgu: true,
            neonEfekt: true,
            cizelge: [],
            gecmis: [],
            torenMuzikleri: []
        };
    }
    if (appData.zilYonetimi.nobetciVurgu === undefined) appData.zilYonetimi.nobetciVurgu = true;
    if (appData.zilYonetimi.neonEfekt === undefined) appData.zilYonetimi.neonEfekt = true;
    if (!Array.isArray(appData.zilYonetimi.cizelge)) appData.zilYonetimi.cizelge = [];
    if (!Array.isArray(appData.zilYonetimi.gecmis)) appData.zilYonetimi.gecmis = [];
    if (!Array.isArray(appData.zilYonetimi.torenMuzikleri)) appData.zilYonetimi.torenMuzikleri = [];
    return appData.zilYonetimi;
}

/**
 * Zil ayarlarını form elemanlarına aktarır
 */
function syncZilFormUI() {
    const data = getZilVerisi();
    const chkAktif = document.getElementById('inp-zil-aktif');
    if (chkAktif) chkAktif.checked = data.aktif !== false;

    const selOgrenci = document.getElementById('inp-zil-melodi-ogrenci');
    if (selOgrenci) selOgrenci.value = data.melodiOgrenci || 'modern';

    const selOgretmen = document.getElementById('inp-zil-melodi-ogretmen');
    if (selOgretmen) selOgretmen.value = data.melodiOgretmen || 'chime';

    const selCikis = document.getElementById('inp-zil-melodi-cikis');
    if (selCikis) selCikis.value = data.melodiCikis || 'westminster';

    // Özel Ses Dosyası Bilgi Kutularını Güncelle
    const syncCustomBox = (tur, customObj, selVal) => {
        const box = document.getElementById(`box-custom-${tur}`);
        const lbl = document.getElementById(`lbl-audio-${tur}`);
        const btnRemove = document.getElementById(`btn-remove-${tur}`);
        if (!box) return;

        if (selVal === 'custom' || customObj) {
            box.style.display = 'flex';
            if (customObj && customObj.name) {
                const bStr = customObj.size && window.SeyirAudioStore ? ` (${window.SeyirAudioStore.formatBytes(customObj.size)})` : '';
                if (lbl) lbl.textContent = customObj.name + bStr;
                if (btnRemove) btnRemove.style.display = 'inline-flex';
            } else {
                if (lbl) lbl.textContent = 'Henüz dosya seçilmedi (Lütfen yükleyin)';
                if (btnRemove) btnRemove.style.display = 'none';
            }
        } else {
            box.style.display = 'none';
        }
    };

    syncCustomBox('ogrenci', data.customAudioOgrenci, data.melodiOgrenci);
    syncCustomBox('ogretmen', data.customAudioOgretmen, data.melodiOgretmen);
    syncCustomBox('cikis', data.customAudioCikis, data.melodiCikis);

    const inpSes = document.getElementById('inp-zil-ses');
    const lblVol = document.getElementById('lbl-zil-vol');
    if (inpSes) {
        inpSes.value = data.sesSeviyesi || 80;
        if (lblVol) lblVol.textContent = '%' + inpSes.value;
    }

    const inpSure = document.getElementById('inp-zil-sure');
    if (inpSure) inpSure.value = data.calmaSuresi || 8;

    const chkHaftasonu = document.getElementById('inp-zil-haftasonu-sessiz');
    if (chkHaftasonu) chkHaftasonu.checked = data.haftasonuSessiz !== false;

    const chkAnons = document.getElementById('inp-zil-anons-aktif');
    if (chkAnons) chkAnons.checked = !!data.sesliAnons;

    const chkNobetci = document.getElementById('inp-zil-nobetci-vurgu');
    if (chkNobetci) chkNobetci.checked = data.nobetciVurgu !== false;

    const chkNeon = document.getElementById('inp-zil-neon-efekt');
    if (chkNeon) chkNeon.checked = data.neonEfekt !== false;
}

/**
 * Form elemanlarındaki zil ayarlarını okur
 */
function readZilFormUI() {
    const data = getZilVerisi();
    const chkAktif = document.getElementById('inp-zil-aktif');
    if (chkAktif) data.aktif = chkAktif.checked;

    const selOgrenci = document.getElementById('inp-zil-melodi-ogrenci');
    if (selOgrenci) data.melodiOgrenci = selOgrenci.value;

    const selOgretmen = document.getElementById('inp-zil-melodi-ogretmen');
    if (selOgretmen) data.melodiOgretmen = selOgretmen.value;

    const selCikis = document.getElementById('inp-zil-melodi-cikis');
    if (selCikis) data.melodiCikis = selCikis.value;

    const inpSes = document.getElementById('inp-zil-ses');
    if (inpSes) data.sesSeviyesi = parseInt(inpSes.value, 10) || 80;

    const inpSure = document.getElementById('inp-zil-sure');
    if (inpSure) data.calmaSuresi = parseInt(inpSure.value, 10) || 8;

    const chkHaftasonu = document.getElementById('inp-zil-haftasonu-sessiz');
    if (chkHaftasonu) data.haftasonuSessiz = chkHaftasonu.checked;

    const chkAnons = document.getElementById('inp-zil-anons-aktif');
    if (chkAnons) data.sesliAnons = chkAnons.checked;

    const chkNobetci = document.getElementById('inp-zil-nobetci-vurgu');
    if (chkNobetci) data.nobetciVurgu = chkNobetci.checked;

    const chkNeon = document.getElementById('inp-zil-neon-efekt');
    if (chkNeon) data.neonEfekt = chkNeon.checked;
}

/**
 * Türkçe Sesli Anons Okuyucu (Web Speech Synthesis)
 */
function calZilSesliAnons(metin) {
    if (!window.speechSynthesis || !metin || !metin.trim()) return;
    try {
        const u = new SpeechSynthesisUtterance(metin.trim());
        u.lang = 'tr-TR';
        u.rate = 0.95;
        u.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const trVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('tr'));
        if (trVoice) u.voice = trVoice;
        window.speechSynthesis.speak(u);
    } catch (e) {
        console.warn('Speech synthesis hatası:', e);
    }
}

/**
 * Melodi adını kullanıcı dostu etiketine çevirir
 */
function getMelodiEtiket(melodiKod) {
    const harita = {
        'modern': '🎵 Modern Okul Melodisi',
        'westminster': '🔔 Westminster Çanı',
        'chime': '✨ Yumuşak Kristal',
        'klasik': '⚡ Geleneksel Okul Zili',
        'marimba': '🎶 Marimba Tonu',
        'fanfare': '🎺 Kısa Fanfar',
        'alarm': '🚨 Siren / Tahliye',
        'custom': '📁 Yerel Özel Ses Dosyası'
    };
    return harita[melodiKod] || melodiKod || 'Varsayılan';
}

/**
 * Zil türü adını rozet HTML'ine çevirir
 */
function getZilTurBadge(tur) {
    if (tur === 'ogrenci') {
        return '<span class="zil-type-badge type-ogrenci"><i class="fa-solid fa-bell"></i> Öğrenci Giriş</span>';
    } else if (tur === 'ogretmen') {
        return '<span class="zil-type-badge type-ogretmen"><i class="fa-solid fa-user-tie"></i> Öğretmen Hazırlık</span>';
    } else if (tur === 'cikis') {
        return '<span class="zil-type-badge type-cikis"><i class="fa-solid fa-door-open"></i> Teneffüs / Çıkış</span>';
    } else {
        return '<span class="zil-type-badge type-ozel"><i class="fa-solid fa-star"></i> Özel Zil</span>';
    }
}

/**
 * Zil Çizelge Tablosunu Ekrana Çizer
 */
function renderZilTablo() {
    const data = getZilVerisi();
    const tbody = document.getElementById('tbody-zil-listesi');
    if (!tbody) return;

    if (data.cizelge.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px 15px;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">🔕</div>
                    <div style="font-weight: 600; font-size: 1rem; margin-bottom: 6px;">Henüz tanımlı zil saati bulunmuyor.</div>
                    <div style="font-size: 0.85rem; max-width: 480px; margin: 0 auto 14px auto;">
                        Yukarıdaki <strong>"Ders Vakitleri ile Otomatik Eşle"</strong> butonuna tıklayarak okul ders saatlerinden tüm zilleri tek tıkla oluşturabilir veya <strong>"Özel Zil Ekle"</strong> butonuyla manuel ekleyebilirsiniz.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Saatlere göre sırala
    data.cizelge.sort((a, b) => (a.saat || '').localeCompare(b.saat || ''));

    let html = '';
    data.cizelge.forEach((zil, index) => {
        const isAktif = zil.aktif !== false;
        const melodiAdi = zil.melodi === 'varsayilan' ? 'Varsayılan' : getMelodiEtiket(zil.melodi);
        const anonsMetni = zil.anons ? `<div style="font-size: 0.78rem; color: #0284c7; margin-top: 2px;"><i class="fa-solid fa-bullhorn"></i> ${escapeHtml(zil.anons)}</div>` : '';

        html += `
            <tr style="${!isAktif ? 'opacity: 0.55;' : ''}">
                <td style="text-align: center;">
                    <input type="checkbox" ${isAktif ? 'checked' : ''} onchange="toggleZilAktiflik(${index})" title="Zili Aç/Kapat" style="cursor: pointer; width: 17px; height: 17px;">
                </td>
                <td>
                    <span class="zil-time-badge">${escapeHtml(zil.saat)}</span>
                </td>
                <td>
                    <strong>${escapeHtml(zil.baslik || 'Zil')}</strong>
                    ${anonsMetni}
                </td>
                <td>
                    ${getZilTurBadge(zil.tur)}
                </td>
                <td>
                    <span style="font-size: 0.84rem; color: var(--text-secondary);">${escapeHtml(melodiAdi)}</span>
                </td>
                <td style="text-align: center;">
                    <button type="button" class="btn-secondary btn-sm" onclick="onDinleZil(${index})" title="Bu zili ön dinle" style="padding: 4px 8px; font-size: 0.78rem;">
                        <i class="fa-solid fa-play"></i> Dinle
                    </button>
                </td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 5px;">
                        <button type="button" class="btn-secondary btn-sm" onclick="duzenleZilModal(${index})" title="Düzenle" style="padding: 4px 7px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="silZil(${index})" title="Sil" style="color: #ef4444; padding: 4px 7px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/**
 * Bugün Çalan Ziller Günlüğünü Çizer
 */
function renderZilGecmis() {
    const data = getZilVerisi();
    const tbody = document.getElementById('tbody-zil-gecmis');
    if (!tbody) return;

    if (data.gecmis.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 18px;">
                    Bugün henüz çalan zil kaydı bulunmuyor.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    // En son çalan en üstte görünsün
    const ters = [...data.gecmis].reverse();
    ters.forEach(log => {
        html += `
            <tr>
                <td><strong>${escapeHtml(log.saat || '--:--')}</strong></td>
                <td>🔔 ${escapeHtml(log.baslik || 'Okul Zili')}</td>
                <td><span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(log.tur || 'Otomatik')}</span></td>
                <td><span style="color: #10b981; font-weight: 600; font-size: 0.82rem;"><i class="fa-solid fa-circle-check"></i> ${escapeHtml(log.durum || 'Çaldı')}</span></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/**
 * Zil KPI Kartlarını ve Sonraki Zil Vaktini Günceller
 */
function renderZilKPIs() {
    const data = getZilVerisi();

    // Toplam Tanımlı
    const elToplam = document.getElementById('zil-kpi-toplam');
    if (elToplam) elToplam.textContent = data.cizelge.length;

    // Ses ve Melodi
    const elMelodi = document.getElementById('zil-kpi-melodi-adi');
    const elSes = document.getElementById('zil-kpi-ses-seviye');
    if (elMelodi) elMelodi.textContent = getMelodiEtiket(data.melodiOgrenci || 'modern');
    if (elSes) elSes.textContent = `%${data.sesSeviyesi || 80} Ses`;

    // Sistem Durumu
    const elDurum = document.getElementById('zil-kpi-durum-metni');
    const elHaftasonu = document.getElementById('zil-kpi-haftasonu-durum');
    if (elDurum) {
        if (data.aktif !== false) {
            elDurum.textContent = "Açık";
            elDurum.style.color = "#10b981";
        } else {
            elDurum.textContent = "Kapalı";
            elDurum.style.color = "#ef4444";
        }
    }
    if (elHaftasonu) {
        elHaftasonu.textContent = data.haftasonuSessiz !== false ? "Hafta Sonu: Sessiz" : "Hafta Sonu: Açık";
    }

    // Sonraki Zil Hesabı
    hesaplaSonrakiZil();
}

/**
 * Şu anki saatten sonraki ilk zili hesaplar ve başlığa / KPI'a yansıtır
 */
function hesaplaSonrakiZil() {
    const data = getZilVerisi();
    const elSaat = document.getElementById('zil-kpi-sonraki-saat');
    const elTip = document.getElementById('zil-kpi-sonraki-tip');
    const elLiveNext = document.getElementById('zil-live-next-info');

    const aktifZiller = (data.cizelge || []).filter(z => z.aktif !== false);
    if (aktifZiller.length === 0 || data.aktif === false) {
        if (elSaat) elSaat.textContent = "--:--";
        if (elTip) elTip.textContent = data.aktif === false ? "Sistem Kapalı" : "Tanımlı Zil Yok";
        if (elLiveNext) elLiveNext.textContent = data.aktif === false ? "Zil Sistemi Kapalı" : "Tanımlı zil bulunamadı";
        return;
    }

    const now = new Date();
    const simdikiDk = now.getHours() * 60 + now.getMinutes();

    let enYakinZil = null;
    let minFark = Infinity;

    aktifZiller.forEach(z => {
        if (!z.saat) return;
        const [h, m] = z.saat.split(':').map(Number);
        const zilDk = h * 60 + m;
        const fark = zilDk - simdikiDk;
        if (fark >= 0 && fark < minFark) {
            minFark = fark;
            enYakinZil = z;
        }
    });

    if (enYakinZil) {
        const kalanDk = minFark;
        const kalanMetin = kalanDk === 0 ? "Şimdi çalmak üzere!" : `${kalanDk} dakika kaldı`;
        if (elSaat) elSaat.textContent = enYakinZil.saat;
        if (elTip) elTip.textContent = enYakinZil.baslik || 'Zil';
        if (elLiveNext) elLiveNext.textContent = `Sonraki Zil: ${enYakinZil.saat} — ${enYakinZil.baslik || 'Zil'} (${kalanMetin})`;
    } else {
        // Bugünün tüm zilleri çalmış, yarının ilk zili
        const ilkZil = aktifZiller[0];
        if (elSaat) elSaat.textContent = ilkZil.saat;
        if (elTip) elTip.textContent = "Yarın " + (ilkZil.baslik || 'Zil');
        if (elLiveNext) elLiveNext.textContent = `Bugünkü ziller tamamlandı. Sonraki zil: Yarın ${ilkZil.saat}`;
    }
}

/**
 * Gerçek Zil Çalma Eylemi
 */
function calZil(zil, tetiklemeTuru = "Otomatik") {
    const data = getZilVerisi();
    if (!zil) return;

    // Melodiyi çöz
    let customAudioId = null;
    let melodi = zil.melodi;

    if (zil.customAudioId) {
        customAudioId = zil.customAudioId;
        melodi = 'custom';
    } else if (!melodi || melodi === 'varsayilan') {
        if (zil.tur === 'ogrenci') {
            melodi = data.melodiOgrenci || 'modern';
            if (melodi === 'custom') customAudioId = 'zil_ogrenci_custom';
        } else if (zil.tur === 'ogretmen') {
            melodi = data.melodiOgretmen || 'chime';
            if (melodi === 'custom') customAudioId = 'zil_ogretmen_custom';
        } else if (zil.tur === 'cikis') {
            melodi = data.melodiCikis || 'westminster';
            if (melodi === 'custom') customAudioId = 'zil_cikis_custom';
        } else {
            melodi = 'modern';
        }
    } else if (melodi === 'custom') {
        if (zil.tur === 'ogrenci') customAudioId = 'zil_ogrenci_custom';
        else if (zil.tur === 'ogretmen') customAudioId = 'zil_ogretmen_custom';
        else if (zil.tur === 'cikis') customAudioId = 'zil_cikis_custom';
    }

    const sure = parseInt(zil.sure, 10) || parseInt(data.calmaSuresi, 10) || 8;
    const ses = parseInt(data.sesSeviyesi, 10) || 80;

    // Sesi Çal
    seyirZilEngine.playMelody(melodi, sure, ses, customAudioId);

    // Görsel Efektler (Animasyon & Zil Kartı Parlaması)
    const liveCard = document.getElementById('zil-live-card');
    const bellIcon = document.getElementById('zil-live-bell-icon');
    const badge = document.getElementById('zil-live-status-badge');

    if (liveCard) liveCard.classList.add('is-ringing');
    if (bellIcon) bellIcon.classList.add('is-ringing');
    if (badge) {
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#ef4444';
        badge.innerHTML = `<span class="zil-live-dot" style="background: #ef4444;"></span> ZİL ÇALIYOR!`;
    }

    if (typeof BhUI !== 'undefined') {
        BhUI.toast(`🔔 ${zil.baslik || 'Zil'} çalıyor... (${sure} sn)`, 'info');
    }

    // Sesli anons varsa melodinin ardından veya 2 sn sonra oku
    if (data.sesliAnons && zil.anons && zil.anons.trim()) {
        setTimeout(() => {
            calZilSesliAnons(zil.anons);
        }, Math.min(2500, sure * 600));
    }

    // Çalma Günlüğüne Kaydet
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    data.gecmis.push({
        saat: `${hh}:${mm}:${ss}`,
        baslik: zil.baslik || 'Okul Zili',
        tur: tetiklemeTuru,
        durum: 'Tamamlandı'
    });
    if (data.gecmis.length > 50) data.gecmis.shift();
    renderZilGecmis();

    // Süre bitince görsel durumu sıfırla
    if (zilGorselTimeout) clearTimeout(zilGorselTimeout);
    zilGorselTimeout = setTimeout(() => {
        if (liveCard) liveCard.classList.remove('is-ringing');
        if (bellIcon) bellIcon.classList.remove('is-ringing');
        if (badge) {
            badge.style.background = 'rgba(16, 185, 129, 0.15)';
            badge.style.color = '#10b981';
            badge.innerHTML = `<span class="zil-live-dot"></span> SİSTEM AKTİF`;
        }
    }, (sure + 1) * 1000);
}

/**
 * 1 Saniyelik Canlı Zamanlayıcı Döngüsü (Zamanı gelince gerçekten çalar!)
 */
function initZilScheduler() {
    if (zilTimerInterval) clearInterval(zilTimerInterval);

    zilTimerInterval = setInterval(() => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const saatStr = `${hh}:${mm}:${ss}`;
        const dakikaStr = `${hh}:${mm}`;

        // Canlı Saati Yaz
        const clockEl = document.getElementById('zil-live-clock');
        if (clockEl) clockEl.textContent = saatStr;

        // Her saniye sonraki zili güncelle (dakika başlarında)
        if (ss === '00' || ss === '30') {
            hesaplaSonrakiZil();
        }

        // Zil ve Zamanlayıcı Kontrolü
        const data = getZilVerisi();
        const dayOfWeek = now.getDay(); // 0: Pazar, 6: Cumartesi
        const isHaftasonu = (dayOfWeek === 0 || dayOfWeek === 6);

        // Ders Zili Kontrolü (Hafta sonu sessizliği ve sistem aktiflik kontrolü)
        const dersZiliCalabilir = (data.aktif !== false) && !(data.haftasonuSessiz !== false && isHaftasonu);
        if (dersZiliCalabilir && sonCalanDakika !== dakikaStr && (ss === '00' || ss === '01')) {
            const aktifZiller = (data.cizelge || []).filter(z => z.aktif !== false);
            const eslesen = aktifZiller.find(z => z.saat === dakikaStr);
            if (eslesen) {
                sonCalanDakika = dakikaStr;
                calZil(eslesen, "Otomatik Zamanlayıcı");
            }
        }

        // Tören & Zamanlanmış Müzikler Kontrolü (Haftanın gününe göre otomatik çalma)
        if (data.torenMuzikleri && data.torenMuzikleri.length > 0 && sonCalanTorenDakika !== dakikaStr && (ss === '00' || ss === '01')) {
            const aktifTorenler = data.torenMuzikleri.filter(m => m.aktif !== false);
            const eslesenToren = aktifTorenler.find(m => {
                if (m.saat !== dakikaStr) return false;
                if (!Array.isArray(m.gunler) || m.gunler.length === 0) return true;
                return m.gunler.includes(dayOfWeek);
            });
            if (eslesenToren) {
                sonCalanTorenDakika = dakikaStr;
                const idx = data.torenMuzikleri.indexOf(eslesenToren);
                if (idx !== -1 && typeof window.onCalToren === 'function') {
                    window.onCalToren(idx, "Otomatik Tören Zamanlayıcı");
                }
            }
        }
    }, 1000);
}

/**
 * Zil Yönetimi Sekmesi Açıldığında UI'ı Toptan Yeniler
 */
function renderZilUI() {
    syncZilFormUI();
    renderZilTablo();
    if (typeof window.renderTorenMuzikleriTablo === 'function') window.renderTorenMuzikleriTablo();
    renderZilGecmis();
    renderZilKPIs();
}

/**
 * Ders Vakitleri ile Otomatik Eşle (Tek Tıkla Kurulum)
 */
function otomatikZilOlustur() {
    const onay = confirm(
        "⏰ Okul ders saatleri okunarak tüm günün öğrenci giriş, öğretmen hazırlık ve teneffüs/çıkış zilleri otomatik oluşturulacaktır.\n\n" +
        "Mevcut zil çizelgeniz güncellenecektir. Devam edilsin mi?"
    );
    if (!onay) return;

    // Kaynak ders saatlerini bul
    let vakitler = [];
    if (Array.isArray(appData.dersProgramiLise) && appData.dersProgramiLise.length > 0) {
        vakitler = appData.dersProgramiLise;
    } else if (Array.isArray(appData.dersProgramiOrtaokul) && appData.dersProgramiOrtaokul.length > 0) {
        vakitler = appData.dersProgramiOrtaokul;
    } else if (Array.isArray(appData.dersProgrami) && appData.dersProgrami.length > 0) {
        vakitler = appData.dersProgrami;
    }

    // Eğer hiç ders vakti tanımlanmamışsa standart 8 derslik şablon uygula
    if (vakitler.length === 0) {
        vakitler = [
            { ders: "1. Ders", saat: "08:30 - 09:10" },
            { ders: "2. Ders", saat: "09:20 - 10:00" },
            { ders: "3. Ders", saat: "10:10 - 10:50" },
            { ders: "4. Ders", saat: "11:00 - 11:40" },
            { ders: "5. Ders", saat: "11:50 - 12:30" },
            { ders: "Öğle Arası", saat: "12:30 - 13:15" },
            { ders: "6. Ders", saat: "13:15 - 13:55" },
            { ders: "7. Ders", saat: "14:05 - 14:45" },
            { ders: "8. Ders", saat: "14:55 - 15:35" }
        ];
    }

    const yeniCizelge = [];
    let sayac = 1;

    vakitler.forEach(item => {
        if (!item || !item.saat || !item.saat.includes('-')) return;
        const [baslangicStr, bitisStr] = item.saat.split('-').map(s => s.trim());
        if (!baslangicStr || !bitisStr) return;

        const isLunch = (item.ders || '').toLowerCase().includes('öğle');

        if (!isLunch) {
            // 1. Öğretmen Hazırlık Zili (Ders başlangıcından 2 dakika önce)
            const [hB, mB] = baslangicStr.split(':').map(Number);
            let ogretmenDakika = hB * 60 + mB - 2;
            if (ogretmenDakika < 0) ogretmenDakika += 24 * 60;
            const ogretmenSaat = String(Math.floor(ogretmenDakika / 60)).padStart(2, '0') + ':' + String(ogretmenDakika % 60).padStart(2, '0');

            yeniCizelge.push({
                id: 'zil_' + (sayac++),
                saat: ogretmenSaat,
                tur: 'ogretmen',
                baslik: `${item.ders} Öğretmen Zili`,
                melodi: 'varsayilan',
                sure: 6,
                aktif: true,
                anons: ''
            });

            // 2. Öğrenci Giriş Zili (Ders başlangıcında)
            yeniCizelge.push({
                id: 'zil_' + (sayac++),
                saat: baslangicStr,
                tur: 'ogrenci',
                baslik: `${item.ders} Giriş Zili`,
                melodi: 'varsayilan',
                sure: 8,
                aktif: true,
                anons: `${item.ders} başlamıştır. İyi dersler dileriz.`
            });

            // 3. Teneffüs / Çıkış Zili (Ders bitiminde)
            yeniCizelge.push({
                id: 'zil_' + (sayac++),
                saat: bitisStr,
                tur: 'cikis',
                baslik: `${item.ders} Çıkış / Teneffüs`,
                melodi: 'varsayilan',
                sure: 6,
                aktif: true,
                anons: ''
            });
        } else {
            // Öğle Arası Zili
            yeniCizelge.push({
                id: 'zil_' + (sayac++),
                saat: baslangicStr,
                tur: 'cikis',
                baslik: `Öğle Arası Başlangıcı`,
                melodi: 'varsayilan',
                sure: 8,
                aktif: true,
                anons: 'Öğle arası başlamıştır. Afiyet olsun.'
            });
        }
    });

    // Saate göre sırala
    yeniCizelge.sort((a, b) => a.saat.localeCompare(b.saat));

    const data = getZilVerisi();
    data.cizelge = yeniCizelge;
    saveData();
    renderZilTablo();
    renderZilKPIs();

    if (typeof BhUI !== 'undefined') {
        BhUI.toast(`✅ ${yeniCizelge.length} adet okul zili ders saatleriyle başarıyla eşlendi!`, 'success');
    }
}

/**
 * Zil Aktiflik Değiştirici
 */
window.toggleZilAktiflik = function (index) {
    const data = getZilVerisi();
    if (data.cizelge[index]) {
        data.cizelge[index].aktif = !data.cizelge[index].aktif;
        saveData();
        renderZilKPIs();
        renderZilTablo();
    }
};

/**
 * Belirli Bir Zili Ön Dinle
 */
window.onDinleZil = function (index) {
    const data = getZilVerisi();
    const zil = data.cizelge[index];
    if (zil) {
        calZil(zil, "Ön Dinleme");
    }
};

/**
 * Zili Sil
 */
window.silZil = function (index) {
    const data = getZilVerisi();
    if (!data.cizelge[index]) return;
    if (confirm(`"${data.cizelge[index].baslik}" silinsin mi?`)) {
        data.cizelge.splice(index, 1);
        saveData();
        renderZilTablo();
        renderZilKPIs();
        if (typeof BhUI !== 'undefined') BhUI.toast('Zil başarıyla silindi.', 'info');
    }
};

/**
 * Özel Zil Ekle / Düzenle Modalı
 */
window.duzenleZilModal = function (index) {
    const data = getZilVerisi();
    const modal = document.getElementById('modal-zil-ekle');
    if (!modal) return;

    const melodiSel = document.getElementById('inp-modal-zil-melodi');
    const customBox = document.getElementById('box-modal-zil-custom-audio');
    const lblFile = document.getElementById('lbl-modal-zil-filename');
    const inpFile = document.getElementById('inp-modal-zil-file');
    if (inpFile) inpFile.value = '';

    if (index >= 0 && data.cizelge[index]) {
        const zil = data.cizelge[index];
        document.getElementById('modal-zil-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Zil Vaktini Düzenle';
        document.getElementById('inp-modal-zil-id').value = index;
        document.getElementById('inp-modal-zil-saat').value = zil.saat || '08:30';
        document.getElementById('inp-modal-zil-tur').value = zil.tur || 'ogrenci';
        document.getElementById('inp-modal-zil-baslik').value = zil.baslik || '';
        if (melodiSel) melodiSel.value = zil.melodi || 'varsayilan';
        document.getElementById('inp-modal-zil-sure').value = zil.sure || 8;
        document.getElementById('inp-modal-zil-anons').value = zil.anons || '';
        document.getElementById('inp-modal-zil-aktif').checked = zil.aktif !== false;

        if (zil.melodi === 'custom' || zil.customAudioId) {
            if (customBox) customBox.style.display = 'block';
            if (lblFile) lblFile.textContent = zil.customAudioName || 'Özel ses dosyası yüklü';
        } else {
            if (customBox) customBox.style.display = 'none';
            if (lblFile) lblFile.textContent = 'Henüz dosya seçilmedi';
        }
    } else {
        document.getElementById('modal-zil-title').innerHTML = '<i class="fa-solid fa-bell"></i> Yeni Zil Zamanı Ekle';
        document.getElementById('inp-modal-zil-id').value = -1;
        document.getElementById('inp-modal-zil-saat').value = '08:30';
        document.getElementById('inp-modal-zil-tur').value = 'ogrenci';
        document.getElementById('inp-modal-zil-baslik').value = '';
        if (melodiSel) melodiSel.value = 'varsayilan';
        document.getElementById('inp-modal-zil-sure').value = 8;
        document.getElementById('inp-modal-zil-anons').value = '';
        document.getElementById('inp-modal-zil-aktif').checked = true;
        if (customBox) customBox.style.display = 'none';
        if (lblFile) lblFile.textContent = 'Henüz dosya seçilmedi';
    }

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
};

function closeZilModal() {
    const modal = document.getElementById('modal-zil-ekle');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

/**
 * Seçili Melodiyi Test Dinleme
 */
window.testSeciliMelodi = function (tur) {
    const data = getZilVerisi();
    let melodi = 'modern';
    let customAudioId = null;

    if (tur === 'ogrenci') {
        melodi = document.getElementById('inp-zil-melodi-ogrenci')?.value || 'modern';
        if (melodi === 'custom' && data.customAudioOgrenci) customAudioId = data.customAudioOgrenci.id;
    } else if (tur === 'ogretmen') {
        melodi = document.getElementById('inp-zil-melodi-ogretmen')?.value || 'chime';
        if (melodi === 'custom' && data.customAudioOgretmen) customAudioId = data.customAudioOgretmen.id;
    } else if (tur === 'cikis') {
        melodi = document.getElementById('inp-zil-melodi-cikis')?.value || 'westminster';
        if (melodi === 'custom' && data.customAudioCikis) customAudioId = data.customAudioCikis.id;
    }
    const ses = parseInt(document.getElementById('inp-zil-ses')?.value, 10) || data.sesSeviyesi || 80;
    seyirZilEngine.playMelody(melodi, 4, ses, customAudioId);
    if (typeof BhUI !== 'undefined') {
        BhUI.toast(`Melodi test ediliyor: ${getMelodiEtiket(melodi)}`, 'info');
    }
};

/* ==========================================================================
   TÖREN & ZAMANLANMIŞ MÜZİKLER YÖNETİMİ
   ========================================================================== */

/**
 * Tören ve Zamanlanmış Müzikler Tablosunu Ekrana Çizer
 */
window.renderTorenMuzikleriTablo = function () {
    const data = getZilVerisi();
    const tbody = document.getElementById('tbody-toren-listesi');
    if (!tbody) return;

    if (!Array.isArray(data.torenMuzikleri) || data.torenMuzikleri.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 25px 15px;">
                    <div style="font-size: 2rem; margin-bottom: 6px;">🇹🇷</div>
                    <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Henüz zamanlanmış tören veya müzik kaydı bulunmuyor.</div>
                    <div style="font-size: 0.82rem; max-width: 440px; margin: 0 auto 10px auto;">
                        Yukarıdaki <strong>"Yeni Müzik / Tören Ekle"</strong> butonuna tıklayarak İstiklal Marşı, Saygı Duruşu veya müzik dosyalarını yerel bilgisayarınızdan yükleyebilirsiniz.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.torenMuzikleri.sort((a, b) => (a.saat || '').localeCompare(b.saat || ''));
    const gunIsimleri = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];

    let html = '';
    data.torenMuzikleri.forEach((item, index) => {
        const isAktif = item.aktif !== false;
        const dosyaMetni = item.dosyaAdi 
            ? `<div style="font-size: 0.82rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;" title="${escapeHtml(item.dosyaAdi)}"><i class="fa-solid fa-file-audio" style="color: #e11d48;"></i> ${escapeHtml(item.dosyaAdi)}</div>`
            : '<span style="font-size: 0.8rem; color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Dosya Yok</span>';

        const gunChips = Array.isArray(item.gunler) && item.gunler.length > 0
            ? item.gunler.map(g => `<span class="toren-day-chip active">${gunIsimleri[g] || g}</span>`).join(' ')
            : '<span class="toren-day-chip">Tüm Günler</span>';

        const torenBadge = item.torenModu !== false
            ? '<span style="color: #10b981; font-weight: 700; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> Açık</span>'
            : '<span style="color: var(--text-muted); font-size: 0.8rem;">Kapalı</span>';

        html += `
            <tr id="row-toren-${item.id}" style="${!isAktif ? 'opacity: 0.55;' : ''}">
                <td style="text-align: center;">
                    <input type="checkbox" ${isAktif ? 'checked' : ''} onchange="toggleTorenAktiflik(${index})" title="Aç/Kapat" style="cursor: pointer; width: 17px; height: 17px;">
                </td>
                <td>
                    <span class="zil-time-badge" style="background: rgba(225, 29, 72, 0.1); color: #e11d48; border-color: rgba(225, 29, 72, 0.25);">${escapeHtml(item.saat || '--:--')}</span>
                </td>
                <td>
                    <strong>${escapeHtml(item.baslik || 'Tören / Müzik')}</strong>
                </td>
                <td>
                    <div class="toren-days-wrap">${gunChips}</div>
                </td>
                <td>
                    ${dosyaMetni}
                </td>
                <td style="text-align: center;">
                    ${torenBadge}
                </td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 5px;">
                        <button type="button" class="btn-primary btn-sm" onclick="onCalToren(${index})" title="Şimdi Canlı Çal" style="background: #e11d48; border-color: #e11d48; padding: 4px 8px; font-size: 0.78rem;">
                            <i class="fa-solid fa-play"></i> Çal
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="duzenleTorenModal(${index})" title="Düzenle" style="padding: 4px 7px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="silToren(${index})" title="Sil" style="color: #ef4444; padding: 4px 7px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
};

/**
 * Tören Aktiflik Durumunu Değiştirir
 */
window.toggleTorenAktiflik = function (index) {
    const data = getZilVerisi();
    if (data.torenMuzikleri[index]) {
        data.torenMuzikleri[index].aktif = data.torenMuzikleri[index].aktif === false;
        saveData();
        renderTorenMuzikleriTablo();
    }
};

/**
 * Tören / Müzik Kaydını Siler
 */
window.silToren = async function (index) {
    const data = getZilVerisi();
    if (!data.torenMuzikleri[index]) return;
    const item = data.torenMuzikleri[index];
    if (confirm(`"${item.baslik}" kaydı silinsin mi?`)) {
        if (item.audioId && window.SeyirAudioStore) {
            await window.SeyirAudioStore.deleteAudio(item.audioId);
        }
        data.torenMuzikleri.splice(index, 1);
        saveData();
        renderTorenMuzikleriTablo();
        if (typeof BhUI !== 'undefined') BhUI.toast('Tören kaydı silindi.', 'info');
    }
};

/**
 * Tören Müziğini Canlı Başlatır
 */
window.onCalToren = function (index, tetiklemeTuru = "Manuel Buton") {
    const data = getZilVerisi();
    const item = data.torenMuzikleri[index];
    if (!item) return;

    if (!item.audioId) {
        alert('Bu tören için ses dosyası bulunamadı. Lütfen düzenleyerek ses dosyası seçin.');
        return;
    }

    if (window.SeyirAudioStore) {
        window.SeyirAudioStore.stopAll();
        window.SeyirAudioStore.playAudio(item.audioId, item.sesSeviyesi || 95, () => {
            const row = document.getElementById(`row-toren-${item.id}`);
            if (row) row.classList.remove('toren-playing-row');
        });

        // Tablo satırına çalıyor efekti ver
        const row = document.getElementById(`row-toren-${item.id}`);
        if (row) row.classList.add('toren-playing-row');

        // Dijital Panoya (index.html) canlı tetikleme sinyali gönder
        try {
            localStorage.setItem('seyir_toren_trigger', JSON.stringify({
                id: item.id,
                baslik: item.baslik,
                audioId: item.audioId,
                torenModu: item.torenModu !== false,
                sesSeviyesi: item.sesSeviyesi || 95,
                time: Date.now()
            }));
        } catch (e) {}

        if (typeof BhUI !== 'undefined') {
            BhUI.toast(`🇹🇷 "${item.baslik}" çalınıyor...`, 'info');
        }

        // Günlüğe kaydet
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        data.gecmis.push({
            saat: `${hh}:${mm}:${ss}`,
            baslik: `🇹🇷 ${item.baslik}`,
            tur: tetiklemeTuru,
            durum: 'Tamamlandı'
        });
        if (data.gecmis.length > 50) data.gecmis.shift();
        renderZilGecmis();
    }
};

/**
 * Çalan Tören Müziklerini Durdurur
 */
window.onDurdurToren = function () {
    if (window.SeyirAudioStore) {
        window.SeyirAudioStore.stopAll();
    }
    seyirZilEngine.stop();
    document.querySelectorAll('.toren-playing-row').forEach(el => el.classList.remove('toren-playing-row'));
    try {
        localStorage.setItem('seyir_toren_stop', Date.now().toString());
    } catch (e) {}
    if (typeof BhUI !== 'undefined') {
        BhUI.toast('Müzik çalması durduruldu.', 'info');
    }
};

/**
 * Tören Modalı Aç / Düzenle
 */
window.duzenleTorenModal = function (index) {
    const data = getZilVerisi();
    const modal = document.getElementById('modal-toren-muzik');
    if (!modal) return;

    const lblFile = document.getElementById('lbl-modal-toren-filename');
    const inpFile = document.getElementById('inp-modal-toren-file');
    if (inpFile) inpFile.value = '';

    if (index >= 0 && data.torenMuzikleri[index]) {
        const item = data.torenMuzikleri[index];
        document.getElementById('modal-toren-title').innerHTML = '<i class="fa-solid fa-flag"></i> Tören / Müzik Düzenle';
        document.getElementById('inp-modal-toren-id').value = index;
        document.getElementById('inp-modal-toren-baslik').value = item.baslik || '';
        document.getElementById('inp-modal-toren-saat').value = item.saat || '08:30';
        document.getElementById('inp-modal-toren-ses').value = item.sesSeviyesi || 95;
        document.getElementById('lbl-modal-toren-ses').textContent = '%' + (item.sesSeviyesi || 95);
        document.getElementById('inp-modal-toren-ekran').checked = item.torenModu !== false;
        document.getElementById('inp-modal-toren-aktif').checked = item.aktif !== false;

        const seciliGunler = Array.isArray(item.gunler) ? item.gunler : [1];
        document.querySelectorAll('.chk-toren-gun').forEach(chk => {
            chk.checked = seciliGunler.includes(parseInt(chk.value, 10));
        });

        if (lblFile) lblFile.textContent = item.dosyaAdi ? `${item.dosyaAdi}` : 'Dosya seçilmedi';
    } else {
        document.getElementById('modal-toren-title').innerHTML = '<i class="fa-solid fa-flag"></i> Yeni Tören / Müzik Zamanla';
        document.getElementById('inp-modal-toren-id').value = -1;
        document.getElementById('inp-modal-toren-baslik').value = 'İstiklal Marşı & Saygı Duruşu';
        document.getElementById('inp-modal-toren-saat').value = '08:30';
        document.getElementById('inp-modal-toren-ses').value = 95;
        document.getElementById('lbl-modal-toren-ses').textContent = '%95';
        document.getElementById('inp-modal-toren-ekran').checked = true;
        document.getElementById('inp-modal-toren-aktif').checked = true;

        document.querySelectorAll('.chk-toren-gun').forEach(chk => {
            chk.checked = chk.value === '1'; // Varsayılan Pazartesi
        });

        if (lblFile) lblFile.textContent = 'Dosya seçilmedi';
    }

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
};

function closeTorenModal() {
    const modal = document.getElementById('modal-toren-muzik');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

// Event Listeners Kurulumu
document.addEventListener('DOMContentLoaded', () => {
    // Zil Zamanlayıcı Motorunu Başlat
    initZilScheduler();

    // Zil Ayarları Değişiklik Dinleyicileri (Otomatik Kayıt & UI Senkronu)
    const zilAyarlariInputIdleri = [
        'inp-zil-aktif', 'inp-zil-sure', 'inp-zil-haftasonu-sessiz',
        'inp-zil-anons-aktif', 'inp-zil-nobetci-vurgu', 'inp-zil-neon-efekt'
    ];
    zilAyarlariInputIdleri.forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            readZilFormUI();
            saveData();
            renderZilKPIs();
        });
    });

    // Melodi seçim dropdown'ları değiştiğinde custom kutusunu aç/kapat
    const baglaMelodiSelect = (selId, turId) => {
        const sel = document.getElementById(selId);
        if (!sel) return;
        sel.addEventListener('change', () => {
            readZilFormUI();
            saveData();
            renderZilKPIs();
            syncZilFormUI();
            if (sel.value === 'custom') {
                const data = getZilVerisi();
                const propName = turId === 'ogrenci' ? 'customAudioOgrenci' : turId === 'ogretmen' ? 'customAudioOgretmen' : 'customAudioCikis';
                if (!data[propName]) {
                    document.getElementById(`inp-file-${turId}`)?.click();
                }
            }
        });
    };
    baglaMelodiSelect('inp-zil-melodi-ogrenci', 'ogrenci');
    baglaMelodiSelect('inp-zil-melodi-ogretmen', 'ogretmen');
    baglaMelodiSelect('inp-zil-melodi-cikis', 'cikis');

    // Genel Ziller İçin Özel Ses Dosyası Yükleme Bağlantıları
    const baglaCustomAudioUpload = (turId, propName, audioKey) => {
        const btnUpload = document.getElementById(`btn-upload-${turId}`);
        const inpFile = document.getElementById(`inp-file-${turId}`);
        const btnRemove = document.getElementById(`btn-remove-${turId}`);

        btnUpload?.addEventListener('click', () => inpFile?.click());

        inpFile?.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            try {
                if (window.SeyirAudioStore) {
                    await window.SeyirAudioStore.saveAudio(audioKey, file);
                }
                const data = getZilVerisi();
                data[propName] = {
                    id: audioKey,
                    name: file.name,
                    size: file.size
                };
                if (turId === 'ogrenci') data.melodiOgrenci = 'custom';
                else if (turId === 'ogretmen') data.melodiOgretmen = 'custom';
                else if (turId === 'cikis') data.melodiCikis = 'custom';

                saveData();
                syncZilFormUI();
                renderZilKPIs();
                if (typeof BhUI !== 'undefined') {
                    BhUI.toast(`🎵 Özel ses dosyası yüklendi: ${file.name}`, 'success');
                }
            } catch (err) {
                console.error(err);
                alert('Ses dosyası kaydedilirken hata oluştu: ' + err.message);
            }
        });

        btnRemove?.addEventListener('click', async () => {
            if (confirm('Yüklenen bu özel ses dosyasını silip varsayılan melodiye dönmek istiyor musunuz?')) {
                if (window.SeyirAudioStore) {
                    await window.SeyirAudioStore.deleteAudio(audioKey);
                }
                const data = getZilVerisi();
                data[propName] = null;
                if (turId === 'ogrenci') data.melodiOgrenci = 'modern';
                else if (turId === 'ogretmen') data.melodiOgretmen = 'chime';
                else if (turId === 'cikis') data.melodiCikis = 'westminster';

                saveData();
                syncZilFormUI();
                renderZilKPIs();
                if (typeof BhUI !== 'undefined') {
                    BhUI.toast('Özel ses kaldırıldı, varsayılan melodiye dönüldü.', 'info');
                }
            }
        });
    };

    baglaCustomAudioUpload('ogrenci', 'customAudioOgrenci', 'zil_ogrenci_custom');
    baglaCustomAudioUpload('ogretmen', 'customAudioOgretmen', 'zil_ogretmen_custom');
    baglaCustomAudioUpload('cikis', 'customAudioCikis', 'zil_cikis_custom');

    const inpZilSes = document.getElementById('inp-zil-ses');
    if (inpZilSes) {
        inpZilSes.addEventListener('input', () => {
            const lbl = document.getElementById('lbl-zil-vol');
            if (lbl) lbl.textContent = '%' + inpZilSes.value;
        });
        inpZilSes.addEventListener('change', () => {
            readZilFormUI();
            saveData();
        });
    }

    // Hızlı Manuel Butonlar
    document.getElementById('btn-manual-ogrenci')?.addEventListener('click', () => {
        const data = getZilVerisi();
        calZil({
            tur: 'ogrenci',
            baslik: 'Öğrenci Giriş Zili',
            melodi: data.melodiOgrenci || 'modern',
            sure: data.calmaSuresi || 8,
            anons: 'Ders başlamıştır. İyi dersler dileriz.'
        }, 'Manuel Buton');
    });

    document.getElementById('btn-manual-ogretmen')?.addEventListener('click', () => {
        const data = getZilVerisi();
        calZil({
            tur: 'ogretmen',
            baslik: 'Öğretmen Hazırlık Zili',
            melodi: data.melodiOgretmen || 'chime',
            sure: 6,
            anons: ''
        }, 'Manuel Buton');
    });

    document.getElementById('btn-manual-cikis')?.addEventListener('click', () => {
        const data = getZilVerisi();
        calZil({
            tur: 'cikis',
            baslik: 'Teneffüs / Çıkış Zili',
            melodi: data.melodiCikis || 'westminster',
            sure: 6,
            anons: ''
        }, 'Manuel Buton');
    });

    document.getElementById('btn-manual-alarm')?.addEventListener('click', () => {
        const onay = confirm("🚨 Acil Durum / Tahliye Sireni çalınacak! Onaylıyor musunuz?");
        if (onay) {
            calZil({
                tur: 'alarm',
                baslik: '🚨 ACİL DURUM / TAHLİYE SİRENİ',
                melodi: 'alarm',
                sure: 12,
                anons: 'Dikkat! Acil durum uyarısı. Lütfen sakin bir şekilde toplanma alanına ilerleyiniz.'
            }, 'Manuel Siren');
        }
    });

    document.getElementById('btn-manual-durdur')?.addEventListener('click', () => {
        seyirZilEngine.stop();
        if (window.SeyirAudioStore) window.SeyirAudioStore.stopAll();
        const liveCard = document.getElementById('zil-live-card');
        const bellIcon = document.getElementById('zil-live-bell-icon');
        const badge = document.getElementById('zil-live-status-badge');
        if (liveCard) liveCard.classList.remove('is-ringing');
        if (bellIcon) bellIcon.classList.remove('is-ringing');
        if (badge) {
            badge.style.background = 'rgba(16, 185, 129, 0.15)';
            badge.style.color = '#10b981';
            badge.innerHTML = `<span class="zil-live-dot"></span> SİSTEM AKTİF`;
        }
        if (typeof BhUI !== 'undefined') BhUI.toast('Zil çalması anında durduruldu.', 'info');
    });

    // Ses Kilidi Çözme & Test Etme Butonu
    document.getElementById('btn-audio-unlock')?.addEventListener('click', () => {
        seyirZilEngine.initContext();
        seyirZilEngine.playMelody('chime', 2, 70);
        if (typeof BhUI !== 'undefined') {
            BhUI.toast('✅ Tarayıcı ses motoru başarıyla etkinleştirildi ve test edildi!', 'success');
        }
    });

    // Otomatik Eşle Butonu
    document.getElementById('btn-zil-otomatik-esle')?.addEventListener('click', otomatikZilOlustur);

    // Listeyi Temizle Butonu
    document.getElementById('btn-zil-temizle')?.addEventListener('click', () => {
        const data = getZilVerisi();
        if (data.cizelge.length === 0) return;
        if (confirm('Günlük zil çizelgesindeki tüm saatler silinecek. Onaylıyor musunuz?')) {
            data.cizelge = [];
            saveData();
            renderZilTablo();
            renderZilKPIs();
            if (typeof BhUI !== 'undefined') BhUI.toast('Zil çizelgesi temizlendi.', 'info');
        }
    });

    // Günlüğü Temizle Butonu
    document.getElementById('btn-zil-log-temizle')?.addEventListener('click', () => {
        const data = getZilVerisi();
        data.gecmis = [];
        renderZilGecmis();
        if (typeof BhUI !== 'undefined') BhUI.toast('Zil çalma günlüğü temizlendi.', 'info');
    });

    // Melodi Ön Dinleme Butonları
    document.getElementById('btn-test-melodi-ogrenci')?.addEventListener('click', () => testSeciliMelodi('ogrenci'));
    document.getElementById('btn-test-melodi-ogretmen')?.addEventListener('click', () => testSeciliMelodi('ogretmen'));
    document.getElementById('btn-test-melodi-cikis')?.addEventListener('click', () => testSeciliMelodi('cikis'));

    // Modal Açma / Kapatma (Zil)
    document.getElementById('btn-zil-ekle-modal')?.addEventListener('click', () => duzenleZilModal(-1));
    document.getElementById('btn-close-modal-zil')?.addEventListener('click', closeZilModal);
    document.getElementById('btn-cancel-modal-zil')?.addEventListener('click', closeZilModal);

    // Modal zil melodi seçimi değiştiğinde özel dosya kutusunu göster
    document.getElementById('inp-modal-zil-melodi')?.addEventListener('change', (e) => {
        const box = document.getElementById('box-modal-zil-custom-audio');
        if (box) box.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    document.getElementById('btn-modal-zil-file-pick')?.addEventListener('click', () => {
        document.getElementById('inp-modal-zil-file')?.click();
    });
    document.getElementById('inp-modal-zil-file')?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        const lbl = document.getElementById('lbl-modal-zil-filename');
        if (lbl) lbl.textContent = file ? file.name : 'Dosya seçilmedi';
    });

    // Modal Kaydet (Zil)
    document.getElementById('btn-save-modal-zil')?.addEventListener('click', async () => {
        const saat = document.getElementById('inp-modal-zil-saat')?.value;
        if (!saat) {
            alert('Lütfen zil saatini giriniz.');
            return;
        }

        const data = getZilVerisi();
        const editIdx = parseInt(document.getElementById('inp-modal-zil-id')?.value, 10);
        const tur = document.getElementById('inp-modal-zil-tur')?.value || 'ogrenci';
        let baslik = document.getElementById('inp-modal-zil-baslik')?.value.trim();
        if (!baslik) {
            baslik = tur === 'ogrenci' ? 'Öğrenci Giriş Zili' : tur === 'ogretmen' ? 'Öğretmen Zili' : tur === 'cikis' ? 'Teneffüs Zili' : 'Özel Zil';
        }
        const melodi = document.getElementById('inp-modal-zil-melodi')?.value || 'varsayilan';
        const sure = parseInt(document.getElementById('inp-modal-zil-sure')?.value, 10) || 8;
        const anons = document.getElementById('inp-modal-zil-anons')?.value.trim() || '';
        const aktif = document.getElementById('inp-modal-zil-aktif')?.checked !== false;

        const zilId = editIdx >= 0 && data.cizelge[editIdx] ? data.cizelge[editIdx].id : 'zil_' + Date.now();
        let customAudioId = editIdx >= 0 && data.cizelge[editIdx] ? data.cizelge[editIdx].customAudioId : null;
        let customAudioName = editIdx >= 0 && data.cizelge[editIdx] ? data.cizelge[editIdx].customAudioName : null;

        // Özel ses dosyası yüklenmişse kaydet
        const inpFile = document.getElementById('inp-modal-zil-file');
        if (melodi === 'custom' && inpFile && inpFile.files && inpFile.files[0]) {
            const f = inpFile.files[0];
            customAudioId = 'custom_bell_' + zilId;
            customAudioName = f.name;
            if (window.SeyirAudioStore) {
                await window.SeyirAudioStore.saveAudio(customAudioId, f);
            }
        }

        const yeniZil = {
            id: zilId,
            saat,
            tur,
            baslik,
            melodi,
            sure,
            anons,
            aktif,
            customAudioId,
            customAudioName
        };

        if (editIdx >= 0 && data.cizelge[editIdx]) {
            data.cizelge[editIdx] = yeniZil;
        } else {
            data.cizelge.push(yeniZil);
        }

        saveData();
        renderZilTablo();
        renderZilKPIs();
        closeZilModal();

        if (typeof BhUI !== 'undefined') {
            BhUI.toast('Zil zamanı başarıyla kaydedildi.', 'success');
        }
    });

    // ─── Tören & Zamanlanmış Müzikler Modal ve Buton Dinleyicileri ───
    document.getElementById('btn-toren-ekle-modal')?.addEventListener('click', () => duzenleTorenModal(-1));
    document.getElementById('btn-toren-durdur-hepsi')?.addEventListener('click', onDurdurToren);
    document.getElementById('btn-close-modal-toren')?.addEventListener('click', closeTorenModal);
    document.getElementById('btn-cancel-modal-toren')?.addEventListener('click', closeTorenModal);

    document.getElementById('btn-modal-toren-file-pick')?.addEventListener('click', () => {
        document.getElementById('inp-modal-toren-file')?.click();
    });
    document.getElementById('inp-modal-toren-file')?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        const lbl = document.getElementById('lbl-modal-toren-filename');
        if (lbl) {
            lbl.textContent = file ? `${file.name} (${window.SeyirAudioStore ? window.SeyirAudioStore.formatBytes(file.size) : ''})` : 'Dosya seçilmedi';
        }
    });

    const inpTorenSes = document.getElementById('inp-modal-toren-ses');
    if (inpTorenSes) {
        inpTorenSes.addEventListener('input', () => {
            const lbl = document.getElementById('lbl-modal-toren-ses');
            if (lbl) lbl.textContent = '%' + inpTorenSes.value;
        });
    }

    // Hızlı gün seçim butonları
    document.getElementById('btn-toren-quick-pazartesi')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-toren-gun').forEach(c => { c.checked = c.value === '1'; });
    });
    document.getElementById('btn-toren-quick-cuma')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-toren-gun').forEach(c => { c.checked = c.value === '5'; });
    });
    document.getElementById('btn-toren-quick-haftaici')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-toren-gun').forEach(c => {
            c.checked = ['1', '2', '3', '4', '5'].includes(c.value);
        });
    });
    document.getElementById('btn-toren-quick-hergun')?.addEventListener('click', () => {
        document.querySelectorAll('.chk-toren-gun').forEach(c => { c.checked = true; });
    });

    // Tören Modalı Kaydet
    document.getElementById('btn-save-modal-toren')?.addEventListener('click', async () => {
        const baslik = document.getElementById('inp-modal-toren-baslik')?.value.trim();
        const saat = document.getElementById('inp-modal-toren-saat')?.value;
        if (!baslik || !saat) {
            alert('Lütfen tören başlığını ve saatini giriniz.');
            return;
        }

        const data = getZilVerisi();
        const editIdx = parseInt(document.getElementById('inp-modal-toren-id')?.value, 10);
        const torenId = editIdx >= 0 && data.torenMuzikleri[editIdx] ? data.torenMuzikleri[editIdx].id : 'toren_' + Date.now();
        let audioId = editIdx >= 0 && data.torenMuzikleri[editIdx] ? data.torenMuzikleri[editIdx].audioId : 'muzik_' + torenId;
        let dosyaAdi = editIdx >= 0 && data.torenMuzikleri[editIdx] ? data.torenMuzikleri[editIdx].dosyaAdi : '';
        let dosyaBoyut = editIdx >= 0 && data.torenMuzikleri[editIdx] ? data.torenMuzikleri[editIdx].dosyaBoyut : 0;

        const inpFile = document.getElementById('inp-modal-toren-file');
        if (inpFile && inpFile.files && inpFile.files[0]) {
            const file = inpFile.files[0];
            audioId = 'muzik_' + torenId;
            dosyaAdi = file.name;
            dosyaBoyut = file.size;
            if (window.SeyirAudioStore) {
                await window.SeyirAudioStore.saveAudio(audioId, file);
            }
        }

        if (!audioId || (!dosyaAdi && editIdx < 0)) {
            alert('Lütfen bir ses/müzik dosyası seçiniz.');
            return;
        }

        const gunler = [];
        document.querySelectorAll('.chk-toren-gun:checked').forEach(c => {
            gunler.push(parseInt(c.value, 10));
        });

        const sesSeviyesi = parseInt(document.getElementById('inp-modal-toren-ses')?.value, 10) || 95;
        const torenModu = document.getElementById('inp-modal-toren-ekran')?.checked !== false;
        const aktif = document.getElementById('inp-modal-toren-aktif')?.checked !== false;

        const yeniToren = {
            id: torenId,
            baslik,
            saat,
            audioId,
            dosyaAdi,
            dosyaBoyut,
            gunler,
            sesSeviyesi,
            torenModu,
            aktif
        };

        if (editIdx >= 0 && data.torenMuzikleri[editIdx]) {
            data.torenMuzikleri[editIdx] = yeniToren;
        } else {
            data.torenMuzikleri.push(yeniToren);
        }

        saveData();
        renderTorenMuzikleriTablo();
        closeTorenModal();

        if (typeof BhUI !== 'undefined') {
            BhUI.toast(`🇹🇷 "${baslik}" zamanlandı ve kaydedildi.`, 'success');
        }
    });

    // ─── 🎬 Karusel Video & Medya Dinleyicileri ───
    document.getElementById('btn-video-ekle-modal')?.addEventListener('click', () => duzenleVideoModal(-1));
    document.getElementById('btn-close-modal-video')?.addEventListener('click', closeVideoModal);
    document.getElementById('btn-cancel-modal-video')?.addEventListener('click', closeVideoModal);
    document.getElementById('btn-close-preview-video')?.addEventListener('click', closeVideoPreview);

    document.querySelectorAll('.video-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tur = btn.getAttribute('data-tur');
            if (tur) setVideoModalType(tur);
        });
    });

    const inpYtUrl = document.getElementById('inp-modal-video-youtube-url');
    inpYtUrl?.addEventListener('input', updateYouTubeLivePreview);
    inpYtUrl?.addEventListener('change', updateYouTubeLivePreview);

    const btnPickVideoFile = document.getElementById('btn-pick-video-file');
    const inpVideoFilePick = document.getElementById('inp-modal-video-file-picker');
    btnPickVideoFile?.addEventListener('click', () => inpVideoFilePick?.click());
    inpVideoFilePick?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        const lbl = document.getElementById('lbl-modal-video-filename');
        if (lbl) {
            lbl.textContent = file ? `${file.name} (${window.SeyirAudioStore ? window.SeyirAudioStore.formatBytes(file.size) : ''})` : 'Dosya seçilmedi';
        }
    });

    // Karusel Video Kaydet Butonu
    document.getElementById('btn-save-modal-video')?.addEventListener('click', async () => {
        const baslik = document.getElementById('inp-modal-video-baslik')?.value.trim();
        if (!baslik) {
            alert('Lütfen video için bir başlık giriniz.');
            return;
        }

        const editIdx = parseInt(document.getElementById('inp-modal-video-id')?.value, 10);
        const videolar = getKaruselVideoVerisi();
        const tur = currentModalVideoType;
        let url = '';
        let youtubeId = null;
        let mediaId = editIdx >= 0 && videolar[editIdx] ? videolar[editIdx].mediaId : null;
        let dosyaAdi = editIdx >= 0 && videolar[editIdx] ? videolar[editIdx].dosyaAdi : '';
        let dosyaBoyut = editIdx >= 0 && videolar[editIdx] ? videolar[editIdx].dosyaBoyut : 0;

        if (tur === 'youtube') {
            const ytVal = document.getElementById('inp-modal-video-youtube-url')?.value.trim();
            youtubeId = parseYouTubeId(ytVal);
            if (!youtubeId) {
                alert('Lütfen geçerli bir YouTube video bağlantısı giriniz.');
                return;
            }
            url = ytVal;
        } else if (tur === 'mp4-url') {
            url = document.getElementById('inp-modal-video-mp4-url')?.value.trim();
            if (!url) {
                alert('Lütfen doğrudan MP4 video bağlantısını giriniz.');
                return;
            }
        } else if (tur === 'mp4-file') {
            const f = inpVideoFilePick && inpVideoFilePick.files && inpVideoFilePick.files[0];
            if (f) {
                mediaId = 'vid_' + Date.now();
                dosyaAdi = f.name;
                dosyaBoyut = f.size;
                if (window.SeyirAudioStore) {
                    await window.SeyirAudioStore.saveAudio(mediaId, f);
                }
            } else if (!mediaId) {
                alert('Lütfen bilgisayarınızdan bir MP4 video dosyası seçiniz.');
                return;
            }
        }

        const sure = parseInt(document.getElementById('inp-modal-video-sure')?.value, 10) || 30;
        const otomatikGec = document.getElementById('chk-modal-video-auto-end')?.checked !== false;
        const sesli = document.getElementById('chk-modal-video-muted')?.checked === false;
        const altyaziKapat = document.getElementById('chk-modal-video-hide-cc')?.checked !== false;
        const dongu = document.getElementById('chk-modal-video-dongu')?.checked === true;
        const aktif = document.getElementById('chk-modal-video-aktif')?.checked !== false;

        const yeniVideo = {
            id: editIdx >= 0 && videolar[editIdx] ? videolar[editIdx].id : 'vid_' + Date.now(),
            baslik,
            tur,
            url,
            youtubeId,
            mediaId,
            dosyaAdi,
            dosyaBoyut,
            sure,
            otomatikGec,
            sesli,
            altyaziKapat,
            dongu,
            aktif
        };

        if (editIdx >= 0 && videolar[editIdx]) {
            videolar[editIdx] = yeniVideo;
        } else {
            videolar.push(yeniVideo);
        }

        saveData();
        renderKaruselVideoUI();
        closeVideoModal();

        if (typeof BhUI !== 'undefined') {
            BhUI.toast(`🎬 "${baslik}" videosu karusele eklendi.`, 'success');
        }
    });
});

/* ==========================================================================
   🎬 KARUSEL VİDEO VE MEDYA YÖNETİM FONKSİYONLARI
   ========================================================================== */

/**
 * YouTube bağlantısından 11 karakterlik video ID'sini ayıklar
 */
function parseYouTubeId(url) {
    if (!url) return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const match = url.match(/(?:youtu\.be\/|(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i);
    return match ? match[1] : null;
}

function getKaruselVideoVerisi() {
    if (!appData) return [];
    if (!Array.isArray(appData.karuselVideolar)) appData.karuselVideolar = [];
    return appData.karuselVideolar;
}

window.renderKaruselVideoUI = function () {
    const videolar = getKaruselVideoVerisi();
    const toplamEl = document.getElementById('kpi-video-toplam');
    const aktifEl = document.getElementById('kpi-video-aktif');
    const badgeEl = document.getElementById('badge-video-sayisi');

    const toplam = videolar.length;
    const aktif = videolar.filter(v => v.aktif !== false).length;

    if (toplamEl) toplamEl.textContent = toplam;
    if (aktifEl) aktifEl.textContent = aktif;
    if (badgeEl) badgeEl.textContent = `${aktif} / ${toplam} Video`;

    renderKaruselVideoTablo();
};

window.renderKaruselVideoTablo = function () {
    const videolar = getKaruselVideoVerisi();
    const tbody = document.getElementById('tbody-video-listesi');
    if (!tbody) return;

    if (videolar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 35px 15px;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">🎬</div>
                    <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px; color: var(--text-color);">Henüz video kaydı bulunmuyor.</div>
                    <div style="font-size: 0.85rem; max-width: 440px; margin: 0 auto 12px auto;">
                        Yukarıdaki <strong>"Yeni Video Ekle"</strong> butonuna tıklayarak YouTube veya MP4 videolarınızı ana karusel akışına ekleyebilirsiniz.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    videolar.forEach((item, index) => {
        const isAktif = item.aktif !== false;
        const isYouTube = item.tur === 'youtube';
        const ytId = item.youtubeId || (isYouTube ? parseYouTubeId(item.url) : null);
        const thumbUrl = ytId 
            ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
            : 'img/okul_logo.png';

        const turBadge = isYouTube
            ? `<span class="video-source-badge badge-youtube"><i class="fa-brands fa-youtube"></i> YouTube</span>`
            : `<span class="video-source-badge badge-mp4"><i class="fa-solid fa-file-video"></i> MP4 Video</span>`;

        const sureMetni = item.dongu
            ? `<div style="font-weight: 700; font-size: 0.82rem; color: #0284c7;"><i class="fa-solid fa-arrows-rotate"></i> Sürekli Döngü</div><div style="font-size:0.72rem; color:var(--text-muted);">${item.sure || 30} sn</div>`
            : (item.otomatikGec !== false
                ? `<span style="color: #10b981; font-weight: 700; font-size: 0.82rem;"><i class="fa-solid fa-check"></i> Bittiğinde Geç</span>`
                : `<span style="font-weight: 600; font-size: 0.82rem; color: var(--text-muted);">${item.sure || 30} sn</span>`);

        html += `
            <tr style="${!isAktif ? 'opacity: 0.55;' : ''}">
                <td style="text-align: center;">
                    <input type="checkbox" ${isAktif ? 'checked' : ''} onchange="toggleVideoAktiflik(${index})" title="Aç/Kapat" style="cursor: pointer; width: 17px; height: 17px;">
                </td>
                <td>
                    <div class="video-thumb-preview" onclick="onPreviewVideo(${index})" title="Önizle ve Oynat" style="cursor: pointer;">
                        <img src="${thumbUrl}" alt="Thumbnail" onerror="this.src='img/okul_logo.png'">
                        <div class="play-icon-overlay"><i class="fa-solid fa-play"></i></div>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-color); margin-bottom: 3px;">
                        ${escapeHtml(item.baslik || 'Video')}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.url || '')}">
                        ${escapeHtml(item.url || (item.tur === 'mp4-file' ? item.dosyaAdi || 'Yerel dosya' : ''))}
                    </div>
                </td>
                <td>
                    ${turBadge}
                </td>
                <td>
                    ${sureMetni}
                </td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button type="button" class="btn-secondary btn-sm" onclick="onPreviewVideo(${index})" title="Önizle" style="padding: 5px 8px; color: #ef4444;">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="duzenleVideoModal(${index})" title="Düzenle" style="padding: 5px 8px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-secondary btn-sm" onclick="silVideo(${index})" title="Sil" style="color: #ef4444; padding: 5px 8px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

window.toggleVideoAktiflik = function (index) {
    const videolar = getKaruselVideoVerisi();
    if (videolar[index]) {
        videolar[index].aktif = videolar[index].aktif === false;
        saveData();
        renderKaruselVideoUI();
    }
};

window.silVideo = async function (index) {
    const videolar = getKaruselVideoVerisi();
    if (!videolar[index]) return;
    const v = videolar[index];
    if (confirm(`"${v.baslik}" videosu silinsin mi?`)) {
        if (v.mediaId && window.SeyirAudioStore) {
            try { await window.SeyirAudioStore.deleteAudio(v.mediaId); } catch (e) {}
        }
        videolar.splice(index, 1);
        saveData();
        renderKaruselVideoUI();
        if (typeof BhUI !== 'undefined') BhUI.toast('Video listeden silindi.', 'info');
    }
};

let currentModalVideoType = 'youtube';

function setVideoModalType(tur) {
    currentModalVideoType = tur;
    document.querySelectorAll('.video-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tur') === tur);
    });

    const boxYt = document.getElementById('box-video-input-youtube');
    const boxMp4Url = document.getElementById('box-video-input-mp4-url');
    const boxMp4File = document.getElementById('box-video-input-mp4-file');

    if (boxYt) boxYt.style.display = tur === 'youtube' ? 'block' : 'none';
    if (boxMp4Url) boxMp4Url.style.display = tur === 'mp4-url' ? 'block' : 'none';
    if (boxMp4File) boxMp4File.style.display = tur === 'mp4-file' ? 'block' : 'none';
}

function updateYouTubeLivePreview() {
    const inpYt = document.getElementById('inp-modal-video-youtube-url');
    const boxPrev = document.getElementById('box-youtube-live-preview');
    const imgThumb = document.getElementById('img-modal-youtube-thumb');
    const lblId = document.getElementById('lbl-modal-youtube-id');
    if (!inpYt || !boxPrev) return;

    const ytId = parseYouTubeId(inpYt.value);
    if (ytId) {
        if (imgThumb) imgThumb.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
        if (lblId) lblId.textContent = ytId;
        boxPrev.style.display = 'flex';
    } else {
        boxPrev.style.display = 'none';
    }
}

window.duzenleVideoModal = function (index) {
    const videolar = getKaruselVideoVerisi();
    const modal = document.getElementById('modal-karusel-video');
    if (!modal) return;

    let seciliTur = 'youtube';
    const inpFile = document.getElementById('inp-modal-video-file-picker');
    const lblFile = document.getElementById('lbl-modal-video-filename');
    if (inpFile) inpFile.value = '';
    if (lblFile) lblFile.textContent = 'Dosya seçilmedi';

    if (index >= 0 && videolar[index]) {
        const item = videolar[index];
        document.getElementById('modal-video-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Videoyu Düzenle';
        document.getElementById('inp-modal-video-id').value = index;
        document.getElementById('inp-modal-video-baslik').value = item.baslik || '';
        document.getElementById('inp-modal-video-sure').value = item.sure || 30;
        document.getElementById('chk-modal-video-auto-end').checked = item.otomatikGec !== false;
        document.getElementById('chk-modal-video-muted').checked = item.sesli !== true;
        document.getElementById('chk-modal-video-hide-cc').checked = item.altyaziKapat !== false;
        document.getElementById('chk-modal-video-dongu').checked = item.dongu === true;
        document.getElementById('chk-modal-video-aktif').checked = item.aktif !== false;

        seciliTur = item.tur || 'youtube';
        if (seciliTur === 'youtube') {
            document.getElementById('inp-modal-video-youtube-url').value = item.url || '';
        } else if (seciliTur === 'mp4-url') {
            document.getElementById('inp-modal-video-mp4-url').value = item.url || '';
        } else if (seciliTur === 'mp4-file') {
            if (lblFile) lblFile.textContent = item.dosyaAdi ? `${item.dosyaAdi}` : 'Dosya yüklü';
        }
    } else {
        document.getElementById('modal-video-title').innerHTML = '<i class="fa-solid fa-film"></i> Karusele Video Ekle';
        document.getElementById('inp-modal-video-id').value = -1;
        document.getElementById('inp-modal-video-baslik').value = '';
        document.getElementById('inp-modal-video-youtube-url').value = '';
        document.getElementById('inp-modal-video-mp4-url').value = '';
        document.getElementById('inp-modal-video-sure').value = 30;
        document.getElementById('chk-modal-video-auto-end').checked = true;
        document.getElementById('chk-modal-video-muted').checked = true;
        document.getElementById('chk-modal-video-hide-cc').checked = true;
        document.getElementById('chk-modal-video-dongu').checked = false;
        document.getElementById('chk-modal-video-aktif').checked = true;
        document.getElementById('box-youtube-live-preview').style.display = 'none';
        seciliTur = 'youtube';
    }

    setVideoModalType(seciliTur);
    updateYouTubeLivePreview();

    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
};

window.closeVideoModal = function () {
    const modal = document.getElementById('modal-karusel-video');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
};

window.onPreviewVideo = async function (index) {
    const videolar = getKaruselVideoVerisi();
    if (!videolar[index]) return;
    const item = videolar[index];
    const modal = document.getElementById('modal-video-preview');
    const wrap = document.getElementById('wrap-preview-video-player');
    const titleEl = document.getElementById('preview-video-modal-title');
    if (!modal || !wrap) return;

    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-play" style="color: #ef4444;"></i> ${escapeHtml(item.baslik || 'Video Önizleme')}`;
    }

    const isYouTube = item.tur === 'youtube';
    const ytId = item.youtubeId || (isYouTube ? parseYouTubeId(item.url) : null);

    if (isYouTube && ytId) {
        const ccParam = item.altyaziKapat !== false ? '&cc_load_policy=0&iv_load_policy=3' : '';
        const loopParam = item.dongu ? `&loop=1&playlist=${ytId}` : '';
        wrap.innerHTML = `
            <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&controls=1&rel=0${ccParam}${loopParam}" 
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen></iframe>
        `;
    } else if (item.tur === 'mp4-file' && item.mediaId && window.SeyirAudioStore) {
        const audioRec = await window.SeyirAudioStore.getAudio(item.mediaId);
        if (audioRec && audioRec.blob) {
            const url = URL.createObjectURL(audioRec.blob);
            const loopAttr = item.dongu ? 'loop' : '';
            wrap.innerHTML = `
                <video src="${url}" controls autoplay ${loopAttr} style="width: 100%; height: 100%; object-fit: contain;"></video>
            `;
        } else {
            wrap.innerHTML = `<div style="color: white; padding: 20px;">Yerel video dosyası bulunamadı.</div>`;
        }
    } else if (item.url) {
        const loopAttr = item.dongu ? 'loop' : '';
        wrap.innerHTML = `
            <video src="${escapeHtml(item.url)}" controls autoplay ${loopAttr} style="width: 100%; height: 100%; object-fit: contain;"></video>
        `;
    } else {
        wrap.innerHTML = `<div style="color: white; padding: 20px;">Video kaynağı yüklenemedi.</div>`;
    }

    modal.style.display = 'flex';
};

window.closeVideoPreview = function () {
    const modal = document.getElementById('modal-video-preview');
    const wrap = document.getElementById('wrap-preview-video-player');
    if (wrap) wrap.innerHTML = '';
    if (modal) modal.style.display = 'none';
};


