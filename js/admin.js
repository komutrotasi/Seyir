
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
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            BhUI.toast("Tam ekran moduna geçilemedi: " + err.message, "warning");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function toggleAdminTheme() {
    // Güncel temayı doğrudan HTML elementinden oku (localStorage'a güvenme)
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('seyir_theme', newTheme);

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
    }
    BhUI.toast(`Tema ${newTheme === 'light' ? 'Açık Mod' : 'Koyu Mod'} olarak ayarlandı.`, 'success');
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

function toggleNotificationsMenu(btn) {
    BhUI.toast("🔔 Bildirimler: Tüm sistem servisleri sorunsuz çalışıyor.", "info");
    const dot = btn ? btn.querySelector('.notification-badge-dot') : null;
    if (dot) dot.style.display = 'none';
}

function showSettingsToast() {
    BhUI.toast("⚙️ Sistem Ayarları: Genel Ayarlar menüsünden tüm konfigürasyonları yönetebilirsiniz.", "info");
}

window.toggleAdminFullscreen = toggleAdminFullscreen;
window.toggleAdminTheme = toggleAdminTheme;
window.toggleAdminSidebarMobile = toggleAdminSidebarMobile;
window.toggleNotificationsMenu = toggleNotificationsMenu;
window.showSettingsToast = showSettingsToast;

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

window.escapeHtml = escapeHtml;
window.escapeJsAttr = escapeJsAttr;

// Her okulun hesabı ve verileri yalnızca o bilgisayarın tarayıcı profilinde tutulur.
const SEYIR_LOCAL_AUTH = window.SeyirLocalAuth;
const SEYIR_PRIVATE_STORAGE_KEY = 'seyir_admin_data';
const SEYIR_PUBLIC_STORAGE_KEY = 'seyir_public_data';
let appData = {};

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
        authReset.style.display = configured ? 'block' : 'none';
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

    // ─── Kayan Yazı Olay Bağlayıcıları (Madde 2.4) ───
    const btnAddKayan = document.getElementById('btn-add-kayan');
    const btnCancelKayan = document.getElementById('btn-cancel-kayan');
    const inpKayanYeni = document.getElementById('inp-kayan-yeni');
    const taKayan = document.getElementById('inp-kayan');

    if (btnAddKayan) btnAddKayan.addEventListener('click', kaydetKayanYazi);
    if (btnCancelKayan) btnCancelKayan.addEventListener('click', iptalKayanDuzenleme);
    if (inpKayanYeni) {
        inpKayanYeni.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); kaydetKayanYazi(); }
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

    // Topbar Araçlar Dropdown Logic
    const btnToolsDropdown = document.getElementById('btn-tools-dropdown');
    const toolsDropdownMenu = document.getElementById('tools-dropdown-menu');

    if (btnToolsDropdown && toolsDropdownMenu) {
        btnToolsDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            toolsDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!toolsDropdownMenu.contains(e.target) && e.target !== btnToolsDropdown) {
                toolsDropdownMenu.classList.remove('show');
            }
        });

        toolsDropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                toolsDropdownMenu.classList.remove('show');
            });
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
            okulAdi: "Seyir Dijital Pano",
            slogan: "Okulun Dijital Nabzı",
            okulWebSiteUrl: "",
            konum: { sehir: "", enlem: null, boylam: null },
            ayarlar: { karuselSuresi: 5000, temaOtomatik: true },
            gizlilik: varsayilanGizlilikAyarlari(),
            veriYonetimi: { sonGozdenGecirme: new Date().toISOString() },
            duyurular: [],
            sinavlar: [],
            kayanYazi: [],
            tumOgretmenler: [],
            ogretmenBranslar: [],
            dersProgrami: {},
            nobetciOgretmenler: {},
            nobetciGunluk: {}
        };
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
            const local = localStorage.getItem(SEYIR_PRIVATE_STORAGE_KEY);
            if (local) {
                appData = JSON.parse(local);
            } else {
                appData = getBosSablon();

                if (dosyadanTohumla) {
                    // Pano ile aynı başlangıç verisini kullan (varsa data/data.json)
                    try {
                        const res = await fetch('data/data.json?t=' + new Date().getTime());
                        if (res.ok) {
                            const dosyaVerisi = await res.json();
                            if (dosyaVerisi && typeof dosyaVerisi === 'object') {
                                appData = Object.assign(getBosSablon(), dosyaVerisi);
                            }
                        }
                    } catch (e) {
                        // Dosya yoksa/okunamıyorsa boş şablonla devam et
                        console.info('data/data.json okunamadı, boş şablon kullanılıyor:', e.message);
                    }
                }
            }

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
        document.getElementById('inp-okulAdi').value = appData.okulAdi || "";
        document.getElementById('inp-slogan').value = appData.slogan || "";
        document.getElementById('inp-webUrl').value = appData.okulWebSiteUrl || "";
        const konum = Object.assign({ sehir: "", enlem: null, boylam: null }, appData.konum || {});
        document.getElementById('inp-sehir').value = konum.sehir;
        document.getElementById('inp-enlem').value = konum.enlem;
        document.getElementById('inp-boylam').value = konum.boylam;
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
        if (typeof renderOgretmenTable === 'function') renderOgretmenTable();
        if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
        if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
        if (typeof renderSinavlar === 'function') renderSinavlar();
    }

    // ─── KAYAN YAZILAR (TICKER) YÖNETİMİ — Madde 2.4 ───
    // appData.kayanYazi tek doğruluk kaynağıdır; #inp-kayan alanı
    // "toplu düzenleme" görünümü olarak listeyle çift yönlü senkron tutulur.

    let editingKayanIndex = -1;

    function getKayanListesi() {
        if (!Array.isArray(appData.kayanYazi)) appData.kayanYazi = [];
        return appData.kayanYazi;
    }

    /** Listeyi toplu düzenleme metin alanına yazar. */
    function syncKayanTextarea() {
        const ta = document.getElementById('inp-kayan');
        if (ta) ta.value = getKayanListesi().join('\n');
    }

    window.renderKayanYazilar = function () {
        const list = document.getElementById('kayan-listesi');
        if (!list) return;

        const yazilar = getKayanListesi();
        list.innerHTML = '';

        if (yazilar.length === 0) {
            list.innerHTML = `<div class="list-item"><p style="color:var(--text-muted);">Henüz kayan yazı eklenmedi. Yukarıdaki alandan ekleyebilirsiniz.</p></div>`;
            return;
        }

        yazilar.forEach((metin, i) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:8px; border-left:4px solid var(--primary);';
            div.innerHTML = `
                <span style="min-width:28px; height:28px; border-radius:50%; background:var(--primary-glow, rgba(99,102,241,0.15)); color:var(--primary); display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; flex-shrink:0;">${i + 1}</span>
                <div class="list-item-content" style="flex:1; min-width:0;">
                    <p style="margin:0; word-break:break-word;">${escapeHtml(metin)}</p>
                </div>
                <div class="list-item-actions" style="display:flex; gap:4px; flex-shrink:0;">
                    <button class="btn-icon" onclick="moveKayanYazi(${i}, -1)" title="Yukarı Taşı" ${i === 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="btn-icon" onclick="moveKayanYazi(${i}, 1)" title="Aşağı Taşı" ${i === yazilar.length - 1 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="btn-icon" onclick="editKayanYazi(${i})" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon danger" onclick="deleteKayanYazi(${i})" title="Sil"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
        });
    };

    /** Liste değiştiğinde: kaydet, metin alanını ve listeyi tazele. */
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
        // Düzenleme modundaki satır taşındıysa seçimi takip et
        if (editingKayanIndex === index) editingKayanIndex = hedef;
        else if (editingKayanIndex === hedef) editingKayanIndex = index;
        kayanDegisti();
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
        if (inp) { inp.value = yazilar[index]; inp.focus(); }
        const btnText = document.getElementById('text-add-kayan');
        if (btnText) btnText.textContent = 'Güncelle';
        const btnCancel = document.getElementById('btn-cancel-kayan');
        if (btnCancel) btnCancel.style.display = 'inline-flex';
    };

    function iptalKayanDuzenleme() {
        editingKayanIndex = -1;
        const inp = document.getElementById('inp-kayan-yeni');
        if (inp) inp.value = '';
        const btnText = document.getElementById('text-add-kayan');
        if (btnText) btnText.textContent = 'Ekle';
        const btnCancel = document.getElementById('btn-cancel-kayan');
        if (btnCancel) btnCancel.style.display = 'none';
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
            BhUI.toast('Kayan yazı eklendi.', 'success');
        }
        iptalKayanDuzenleme();
        kayanDegisti();
    }

    // Duyuru Render
    function renderDuyurular() {
        const list = document.getElementById('duyurular-listesi');
        list.innerHTML = "";
        if (!appData.duyurular || appData.duyurular.length === 0) {
            list.innerHTML = `<div class="list-item"><p style="color:var(--text-muted);">Özel duyuru bulunmuyor.</p></div>`;
            return;
        }

        // En son eklenenleri üstte gösterelim
        const reversed = [...appData.duyurular].reverse();

        reversed.forEach((d, reversedIndex) => {
            // Orijinal indexi bulalım (reverse yapıldığı için sondan hesaplıyoruz)
            const index = appData.duyurular.length - 1 - reversedIndex;
            list.innerHTML += `
                <div class="list-item" style="border-left: 4px solid var(--${escapeHtml(d.renk || 'primary')}); background: var(--${escapeHtml(d.renk || 'primary')}-glow, rgba(255,255,255,0.05)); margin-bottom: 8px;">
                    <div class="list-item-content">
                        <h4>${escapeHtml(d.baslik)}</h4>
                        <p>${escapeHtml(d.icerik || '')}</p>
                        <small style="color: var(--text-muted); margin-right: 10px;"><i class="fa-regular fa-calendar"></i> ${escapeHtml(d.tarih)}</small>
                        <small>Renk: ${escapeHtml(d.renk)}</small>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-icon" onclick="editDuyuru(${index})" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon danger" onclick="deleteDuyuru(${index})" title="Sil"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.editDuyuru = (index) => {
        editingDuyuruIndex = index;
        const d = appData.duyurular[index];
        document.getElementById('inline-d-baslik').value = d.baslik;
        document.getElementById('inline-d-icerik').value = d.icerik;
        document.getElementById('inline-d-renk').value = d.renk;
        document.getElementById('text-add-inline-duyuru').textContent = "Güncelle";
        document.getElementById('btn-cancel-inline-duyuru').style.display = "block";
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
    document.getElementById('btn-add-inline-duyuru').addEventListener('click', () => {
        const baslik = document.getElementById('inline-d-baslik').value;
        const icerik = document.getElementById('inline-d-icerik').value;
        const renk = document.getElementById('inline-d-renk').value;

        if (!baslik) return alert("Başlık boş olamaz.");

        if (!appData.duyurular) appData.duyurular = [];

        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR') + " " + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        if (editingDuyuruIndex !== -1) {
            // Güncelleme Modu
            appData.duyurular[editingDuyuruIndex] = {
                baslik: baslik,
                icerik: icerik,
                tarih: dateStr,
                gorsel: "",
                renk: renk
            };
            editingDuyuruIndex = -1;
            document.getElementById('text-add-inline-duyuru').textContent = "Ekle";
            document.getElementById('btn-cancel-inline-duyuru').style.display = "none";
        } else {
            // Ekleme Modu
            appData.duyurular.push({
                baslik: baslik,
                icerik: icerik,
                tarih: dateStr,
                gorsel: "",
                renk: renk
            });
            // 20 Limiti kontrolü
            if (appData.duyurular.length > 20) {
                appData.duyurular = appData.duyurular.slice(-20);
            }
        }

        // Temizle
        document.getElementById('inline-d-baslik').value = "";
        document.getElementById('inline-d-icerik').value = "";

        renderDuyurular();
    });

    document.getElementById('btn-cancel-inline-duyuru').addEventListener('click', () => {
        editingDuyuruIndex = -1;
        document.getElementById('inline-d-baslik').value = "";
        document.getElementById('inline-d-icerik').value = "";
        document.getElementById('inline-d-renk').value = "primary";
        document.getElementById('text-add-inline-duyuru').textContent = "Ekle";
        document.getElementById('btn-cancel-inline-duyuru').style.display = "none";
    });

    // Sınav Render
    window.renderSinavlar = function () {
        const list = document.getElementById('sinavlar-listesi');
        if (!list) return;
        list.innerHTML = "";
        if (!appData.sinavlar || appData.sinavlar.length === 0) {
            list.innerHTML = `<div class="list-item"><p style="color:var(--text-muted);">Sınav tarihi bulunmuyor.</p></div>`;
            return;
        }

        const reversed = [...appData.sinavlar].reverse();

        reversed.forEach((s, reversedIndex) => {
            const index = appData.sinavlar.length - 1 - reversedIndex;
            list.innerHTML += `
                <div class="list-item" style="border-left: 4px solid var(--accent); background: var(--accent-glow, rgba(255,255,255,0.05)); margin-bottom: 8px;">
                    <div class="list-item-content">
                        <h4>${escapeHtml(s.ders)}</h4>
                        <p><strong>Sınıflar:</strong> ${escapeHtml(s.siniflar || '-')}</p>
                        <small style="color: var(--text-muted); margin-right: 10px;"><i class="fa-regular fa-calendar"></i> ${escapeHtml(s.tarih)} - ${escapeHtml(s.saat)}</small>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-icon" onclick="editSinav(${index})" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon danger" onclick="deleteSinav(${index})" title="Sil"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    };

    let editingSinavIndex = -1;

    window.editSinav = (index) => {
        editingSinavIndex = index;
        const s = appData.sinavlar[index];
        document.getElementById('inline-s-ders').value = s.ders || "";
        document.getElementById('inline-s-siniflar').value = s.siniflar || "";

        // Tarih formatı dönüşümü (DD.MM.YYYY -> YYYY-MM-DD if needed, HTML5 date input requires YYYY-MM-DD)
        let dateVal = s.tarih || "";
        if (dateVal.includes('.')) {
            const parts = dateVal.split('.');
            if (parts.length === 3) dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        document.getElementById('inline-s-tarih').value = dateVal;
        document.getElementById('inline-s-saat').value = s.saat || "";

        document.getElementById('text-add-inline-sinav').textContent = "Güncelle";
        const cancelBtn = document.getElementById('btn-cancel-inline-sinav');
        if (cancelBtn) cancelBtn.style.display = "block";
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
            const ders = document.getElementById('inline-s-ders').value;
            const siniflar = document.getElementById('inline-s-siniflar').value;
            let tarih = document.getElementById('inline-s-tarih').value;
            const saat = document.getElementById('inline-s-saat').value;

            if (!ders || !tarih) return alert("Ders adı ve Tarih zorunludur.");

            // HTML5 Date'den DD.MM.YYYY formatına
            if (tarih.includes('-')) {
                const parts = tarih.split('-');
                if (parts.length === 3) tarih = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }

            if (!appData.sinavlar) appData.sinavlar = [];

            if (editingSinavIndex !== -1) {
                appData.sinavlar[editingSinavIndex] = {
                    ders: ders,
                    siniflar: siniflar,
                    tarih: tarih,
                    saat: saat
                };
                editingSinavIndex = -1;
                document.getElementById('text-add-inline-sinav').textContent = "Ekle";
                document.getElementById('btn-cancel-inline-sinav').style.display = "none";
            } else {
                appData.sinavlar.push({
                    ders: ders,
                    siniflar: siniflar,
                    tarih: tarih,
                    saat: saat
                });
            }

            document.getElementById('inline-s-ders').value = "";
            document.getElementById('inline-s-siniflar').value = "";
            document.getElementById('inline-s-tarih').value = "";
            document.getElementById('inline-s-saat').value = "";

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
            document.getElementById('text-add-inline-sinav').textContent = "Ekle";
            document.getElementById('btn-cancel-inline-sinav').style.display = "none";
        });
    }

    // Dersler Render


    // Öğretmen Yönetimi Tablosu
    window.renderOgretmenTable = function () {
        const tbody = document.getElementById('ogretmen-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!appData.bransListesi) appData.bransListesi = [];
        const ogretmenBranslar = appData.ogretmenBranslar || [];

        // Populate bransListesi from existing data
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
            appData.bransListesi = ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyatı', 'Bilişim Teknolojileri'];
        }

        // Alfabetik Sıralama (Türkçe karakter duyarlı)
        appData.bransListesi.sort((a, b) => a.localeCompare(b, 'tr'));

        // Populate Branş Sil dropdown
        const selSil = document.getElementById('sel-sil-brans');
        if (selSil) {
            selSil.innerHTML = '<option value="">Silinecek Branş</option>';
            appData.bransListesi.forEach(b => {
                selSil.innerHTML += `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`;
            });
        }

        let allTeachers = appData.tumOgretmenler || [];
        const nobetciGunluk = appData.nobetciGunluk || {};
        const sinifRehberlik = appData.sinifRehberlik || {};

        allTeachers.forEach((t, i) => {
            // Branş Bul
            const assignment = ogretmenBranslar.find(item => item.startsWith(t + ' :'));
            let currentBrans = '';
            if (assignment) {
                currentBrans = assignment.split(':')[1].trim();
            }

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
                if (liste.some(kayit => kayit.startsWith(t + ' (') && !kayit.includes('(Diğer)') && !kayit.includes('(İzinli)') && !kayit.includes('(Ders Tamamlama)'))) {
                    nobetGunleri.push(gun);
                }
            }
            let nobetBadge = nobetGunleri.length > 0
                ? nobetGunleri.map(g => `<span style="background:var(--primary-glow); color:var(--primary); padding:2px 8px; border-radius:12px; font-size:0.8rem; margin-right:4px;">${escapeHtml(g)}</span>`).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">-</span>';

            // Branş Seçenekleri Oluştur
            let bransOptions = '<option value="">Branş Seçin</option>';
            appData.bransListesi.forEach(b => {
                const selected = b === currentBrans ? 'selected' : '';
                bransOptions += `<option value="${escapeHtml(b)}" ${selected}>${escapeHtml(b)}</option>`;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(t)}</td>
                <td>
                    <select class="form-control" onchange="updateTeacherBrans('${escapeJsAttr(t)}', this.value)" style="max-width: 200px;">
                        ${bransOptions}
                    </select>
                </td>
                <td>${escapeHtml(rehberSinif)}</td>
                <td>${nobetBadge}</td>
                <td style="text-align: right;">
                    <button class="btn-secondary btn-sm" onclick="deleteTeacher('${escapeJsAttr(t)}')" style="background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.updateTeacherBrans = function (teacherName, newBrans) {
        let ogretmenBranslar = appData.ogretmenBranslar || [];
        // Eski branşı sil
        ogretmenBranslar = ogretmenBranslar.filter(item => !item.startsWith(teacherName + ' :'));
        // Yeni branşı ekle (eğer seçilmişse)
        if (newBrans) {
            ogretmenBranslar.push(teacherName + ' : ' + newBrans);
        }
        appData.ogretmenBranslar = ogretmenBranslar;
        saveData();
        if (typeof renderDersler === 'function') renderDersler();
        BhUI.toast(teacherName + ' branşı güncellendi.', 'success');
    };

    window.deleteTeacher = function (teacherName) {
        if (confirm(teacherName + ' isimli öğretmeni silmek istediğinize emin misiniz?')) {
            appData.tumOgretmenler = (appData.tumOgretmenler || []).filter(t => t !== teacherName);
            appData.ogretmenBranslar = (appData.ogretmenBranslar || []).filter(item => !item.startsWith(teacherName + ' :'));
            // Not: Nöbetçi listesinden de silmek gerekir mi? Şimdilik tutarlı olması için kalsın veya silinebilir.
            saveData();
            renderOgretmenTable();
            if (typeof renderDersler === 'function') renderDersler();
            if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
            if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
            BhUI.toast(teacherName + ' silindi.', 'success');
        }
    };

    // Yeni Öğretmen Ekleme (Manuel)
    document.getElementById('btn-add-ogretmen-manuel')?.addEventListener('click', () => {
        const input = document.getElementById('inp-yeni-ogretmen');
        const val = input.value.trim();
        if (val) {
            if (!appData.tumOgretmenler) appData.tumOgretmenler = [];
            if (!appData.tumOgretmenler.includes(val)) {
                appData.tumOgretmenler.push(val);
                saveData();
                renderOgretmenTable();
                if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
                if (typeof renderSiniflarTable === 'function') renderSiniflarTable();
                input.value = '';
                BhUI.toast('Öğretmen eklendi.', 'success');
            } else {
                BhUI.toast('Bu öğretmen zaten mevcut!', 'warning');
            }
        }
    });

    // Yeni Branş Ekleme

    // Branş Silme
    document.getElementById('btn-delete-brans')?.addEventListener('click', () => {
        const sel = document.getElementById('sel-sil-brans');
        const val = sel.value;
        if (val) {
            if (confirm(val + ' branşını silmek istediğinize emin misiniz?')) {
                appData.bransListesi = (appData.bransListesi || []).filter(b => b !== val);
                appData.ogretmenBranslar = (appData.ogretmenBranslar || []).filter(item => {
                    const b = item.split(':')[1];
                    return b && b.trim() !== val;
                });
                saveData();
                renderOgretmenTable();
                BhUI.toast('Branş silindi.', 'success');
            }
        } else {
            BhUI.toast('Lütfen silinecek bir branş seçin.', 'warning');
        }
    });
    document.getElementById('btn-add-brans')?.addEventListener('click', () => {
        const input = document.getElementById('inp-yeni-brans');
        const val = input.value.trim();
        if (val) {
            if (!appData.bransListesi) appData.bransListesi = [];
            if (!appData.bransListesi.includes(val)) {
                appData.bransListesi.push(val);
                saveData();
                renderOgretmenTable();
                input.value = '';
                BhUI.toast('Branş eklendi.', 'success');
            } else {
                BhUI.toast('Bu branş zaten mevcut!', 'warning');
            }
        }
    });



    window.updateDers = function (type, index, field, value) {
        if (type === 'orta' && appData.dersProgramiOrtaokul[index]) {
            appData.dersProgramiOrtaokul[index][field] = value;
        } else if (type === 'lise' && appData.dersProgramiLise[index]) {
            appData.dersProgramiLise[index][field] = value;
        }
        saveData();
        BhUI.toast('Vakit güncellendi.', 'success');
        // Ders saatleri programa matrisinin satır başlıklarını besler; açıksa tazele.
        if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
    };

    window.renderDersler = function () {
        // dersProgrami eski sürümlerde dizi, varsayılan şablonda ise nesne ({}) olabilir.
        // Yalnızca gerçekten dizi olduğunda kopyala; aksi halde spread hata verir.
        if (Array.isArray(appData.dersProgrami) && !Array.isArray(appData.dersProgramiOrtaokul)) {
            appData.dersProgramiOrtaokul = [...appData.dersProgrami];
        }
        if (!Array.isArray(appData.dersProgramiOrtaokul)) appData.dersProgramiOrtaokul = [];
        if (!Array.isArray(appData.dersProgramiLise) || appData.dersProgramiLise.length <= 1) {
            appData.dersProgramiLise = [
                { ders: "1. Ders", saat: "09:00 - 09:40" },
                { ders: "2. Ders", saat: "09:50 - 10:30" },
                { ders: "3. Ders", saat: "10:40 - 11:20" },
                { ders: "4. Ders", saat: "11:30 - 12:10" },
                { ders: "5. Ders", saat: "12:15 - 12:55" },
                { ders: "Öğle Arası", saat: "12:55 - 13:40" },
                { ders: "6. Ders", saat: "13:40 - 14:20" },
                { ders: "7. Ders", saat: "14:25 - 15:05" },
                { ders: "8. Ders", saat: "15:10 - 15:50" }
            ];
            saveData();
        }

        const listOrta = document.getElementById('ders-listesi-orta');
        const listLise = document.getElementById('ders-listesi-lise');

        if (listOrta) {
            listOrta.innerHTML = "";
            appData.dersProgramiOrtaokul.forEach((d, i) => {
                listOrta.innerHTML += `
                    <div class="list-item" style="padding: 4px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <div class="list-item-content" style="display: flex; gap: 5px; flex: 1;">
                            <input type="text" class="form-control form-sm" value="${escapeHtml(d.ders)}" onchange="updateDers('orta', ${i}, 'ders', this.value)" style="width: 80px; padding: 2px 4px; font-size: 0.8rem;" />
                            <input type="text" class="form-control form-sm" value="${escapeHtml(d.saat)}" onchange="updateDers('orta', ${i}, 'saat', this.value)" style="width: 100px; padding: 2px 4px; font-size: 0.8rem;" />
                        </div>
                        <div class="list-actions">
                            <button class="btn-icon danger" onclick="silDers('orta', ${i})" style="padding: 2px 6px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        if (listLise) {
            listLise.innerHTML = "";
            appData.dersProgramiLise.forEach((d, i) => {
                listLise.innerHTML += `
                    <div class="list-item" style="padding: 4px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <div class="list-item-content" style="display: flex; gap: 5px; flex: 1;">
                            <input type="text" class="form-control form-sm" value="${escapeHtml(d.ders)}" onchange="updateDers('lise', ${i}, 'ders', this.value)" style="width: 80px; padding: 2px 4px; font-size: 0.8rem;" />
                            <input type="text" class="form-control form-sm" value="${escapeHtml(d.saat)}" onchange="updateDers('lise', ${i}, 'saat', this.value)" style="width: 100px; padding: 2px 4px; font-size: 0.8rem;" />
                        </div>
                        <div class="list-actions">
                            <button class="btn-icon danger" onclick="silDers('lise', ${i})" style="padding: 2px 6px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }
    }

    window.silDers = function (type, index) {
        if (confirm("Bu vakti silmek istediğinize emin misiniz?")) {
            if (type === 'orta') {
                appData.dersProgramiOrtaokul.splice(index, 1);
            } else if (type === 'lise') {
                appData.dersProgramiLise.splice(index, 1);
            }
            saveData();
            renderDersler();
        }
    }

    document.getElementById('btn-add-ders-orta')?.addEventListener('click', () => {
        const ad = prompt("Ders/Vakit Adı (Örn: 1. Ders veya Öğle Arası):");
        if (!ad) return;
        const saat = prompt("Saat Aralığı (Örn: 09:00 - 09:40):");
        if (!saat) return;

        if (!appData.dersProgramiOrtaokul) appData.dersProgramiOrtaokul = [];
        appData.dersProgramiOrtaokul.push({
            ders: ad,
            saat: saat
        });
        saveData();
        renderDersler();
    });

    document.getElementById('btn-add-ders-lise')?.addEventListener('click', () => {
        const ad = prompt("Ders/Vakit Adı (Örn: 1. Ders veya Öğle Arası):");
        if (!ad) return;
        const saat = prompt("Saat Aralığı (Örn: 09:00 - 09:40):");
        if (!saat) return;

        if (!appData.dersProgramiLise) appData.dersProgramiLise = [];
        appData.dersProgramiLise.push({
            ders: ad,
            saat: saat
        });
        saveData();
        renderDersler();
    });

    function formKonumunuOku() {
        const mevcut = Object.assign({ sehir: "", enlem: null, boylam: null }, appData.konum || {});
        const enlem = parseFloat(document.getElementById('inp-enlem').value);
        const boylam = parseFloat(document.getElementById('inp-boylam').value);
        appData.konum = {
            sehir: document.getElementById('inp-sehir').value.trim() || mevcut.sehir,
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
        appData.okulAdi = document.getElementById('inp-okulAdi').value;
        appData.slogan = document.getElementById('inp-slogan').value;
        appData.okulWebSiteUrl = document.getElementById('inp-webUrl').value;
        formKonumunuOku();
        formGizlilikAyarlariniOku();

        if (!appData.ayarlar) appData.ayarlar = {};
        appData.ayarlar.karuselSuresi = parseInt(document.getElementById('inp-karuselSuresi').value, 10) || 5000;
        appData.ayarlar.temaOtomatik = document.getElementById('inp-temaOtomatik').value === 'true';
        saveCurrentDayDnD();
        appData.kayanYazi = document.getElementById('inp-kayan').value
            .split('\n').map(x => x.trim()).filter(Boolean);
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

        // Haber tarama bilinçli olarak otomatik başlatılmaz. Kullanıcı, okul URL'sini
        // kaydettikten sonra "Haberleri Şimdi Yenile" butonuyla kontrollü yeniler.
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
        BhUI.toast('Güvenli data.json indirildi; sunucuya bu dosyayı yükleyebilirsiniz.', 'success');
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
    const btnUploadJson = document.getElementById('btn-upload-json');
    const inpJsonFile = document.getElementById('inp-json-file');

    if (btnUploadJson && inpJsonFile) {
        btnUploadJson.addEventListener('click', () => {
            inpJsonFile.click();
        });

        inpJsonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
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
                delete appData.okulLogo;
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
                body: 'url=' + encodeURIComponent(url)
            });
            const raw = await response.text();
            if (raw.trim().startsWith('<?')) {
                throw new Error('PHP dosyası çalıştırılmıyor. Paneli PHP sunucusundaki admin.php adresinden açın.');
            }
            data = JSON.parse(raw);

            if (data && data.durum === 'basarili') {
                const haberSayisi = data.istatistik ? data.istatistik.toplam : (data.haberler ? data.haberler.length : 0);
                const gorselliSayisi = data.istatistik ? data.istatistik.gorselli : 0;

                // appData mebHaberler güncelle
                if (data.haberler && Array.isArray(data.haberler)) {
                    appData.okulWebSiteUrl = url;
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
            console.error('Haber çekme hatası:', err);
            if (statusEl) {
                statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
                statusEl.style.color = '#dc2626';
                statusEl.innerHTML = `<strong>⚠️ Servis Hatası:</strong> Paneli PHP sunucusundaki <code>admin.php</code> adresinden açın. (${escapeHtml(err.message)})`;
            }
            BhUI.toast('Haber servisine erişilemedi. PHP sunucusunun çalıştığından emin olun.', 'warning');
        } finally {
            if (btnFetch) btnFetch.disabled = false;
            if (iconFetch) iconFetch.classList.remove('fa-spin');
        }
    }

    const btnFetchMebNews = document.getElementById('btn-fetch-meb-news');
    if (btnFetchMebNews) {
        btnFetchMebNews.addEventListener('click', () => {
            fetchMebHaberlerOtomatik();
        });
    }

    // --- SÜRÜKLE BIRAK MANTIĞI ---
    const zonesList = ["Zemin Kat", "1. Kat", "2. Kat", "3. Kat", "Kantin", "Bahçe", "İzinli"];
    let currentNobetciDay = "Pazartesi";

    function saveCurrentDayDnD() {
        const nobetciLines = [];
        document.querySelectorAll('.dnd-zone').forEach(zone => {
            const zoneName = zone.getAttribute('data-zone');
            zone.querySelectorAll('.dnd-teacher-card').forEach(card => {
                const teacherName = card.textContent.trim();
                if (zoneName && zoneName !== "Havuz") {
                    nobetciLines.push(`${teacherName} (${zoneName})`);
                }
            });
        });
        if (!appData.nobetciGunluk) appData.nobetciGunluk = {};
        appData.nobetciGunluk[currentNobetciDay] = nobetciLines;
        if (typeof renderOgretmenTable === 'function') renderOgretmenTable();

        // Geriye dönük uyumluluk için, o günkü listeyi ana diziye de kopyala (Günün nöbetçisi olarak)
        // Ya da sadece günlüğü kullan.
    }

    document.querySelectorAll('.btn-day').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Önce mevcut günü kaydet (eğer tamamlama sekmesinde değilsek)
            if (currentNobetciDay !== 'Tamamlama') {
                saveCurrentDayDnD();
            }

            // UI Güncelle
            document.querySelectorAll('.btn-day').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const targetDay = e.target.getAttribute('data-day');

            if (targetDay === 'Tamamlama') {
                document.querySelector('.dnd-container').style.display = 'none';
                document.querySelector('.tamamlama-container').style.display = 'flex';
                // İlk açılışta güncel bir günü seç veya select box'takini kullan
                let selectedGun = document.getElementById('tamamlama-gun-select').value;
                if (!selectedGun) {
                    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
                    const today = new Date().getDay();
                    selectedGun = (today >= 1 && today <= 5) ? days[today - 1] : "Pazartesi";
                    document.getElementById('tamamlama-gun-select').value = selectedGun;
                }
                renderTamamlama(selectedGun);
                currentNobetciDay = 'Tamamlama';
            } else {
                document.querySelector('.dnd-container').style.display = 'flex';
                document.querySelector('.tamamlama-container').style.display = 'none';
                currentNobetciDay = targetDay;
                renderNobetciDnD();
            }
        });
    });

    document.getElementById('tamamlama-gun-select').addEventListener('change', (e) => {
        renderTamamlama(e.target.value);
    });

    function renderNobetciDnD() {
        const poolEl = document.getElementById('dnd-pool');
        const zonesEl = document.getElementById('dnd-zones');

        poolEl.innerHTML = '';
        zonesEl.innerHTML = '';

        // Zone'ları oluştur
        zonesList.forEach(z => {
            const zDiv = document.createElement('div');
            zDiv.className = 'dnd-zone';
            zDiv.setAttribute('data-zone', z);
            zDiv.setAttribute('ondrop', 'dropToZone(event)');
            zDiv.setAttribute('ondragover', 'allowDrop(event)');
            zDiv.setAttribute('ondragleave', 'leaveDrop(event)');

            const zTitle = document.createElement('div');
            zTitle.className = 'dnd-zone-title';
            zTitle.textContent = z;
            zDiv.appendChild(zTitle);

            zonesEl.appendChild(zDiv);
        });

        // Tüm öğretmenleri (appData.tumOgretmenler) ve atanmışları eşleştir
        let allTeachers = appData.tumOgretmenler || [];
        let assignedTeachers = [];

        if (!appData.nobetciGunluk) {
            appData.nobetciGunluk = {};
            // Eski sistemi Pazartesiye aktar
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

            // Eğer atanmış öğretmen havuzda yoksa havuza da ekle
            if (!allTeachers.includes(isim)) {
                allTeachers.push(isim);
            }
        });

        // Öğretmenleri yerleştir
        allTeachers.forEach((t, i) => {
            const card = document.createElement('div');
            card.className = 'dnd-teacher-card';
            card.draggable = true;
            card.id = 'tcard-' + i;
            card.setAttribute('ondragstart', 'dragStart(event)');
            card.innerHTML = `<i class="fa-solid fa-grip-vertical"></i> ${escapeHtml(t)}`;

            // KVKK (AGENTS.md Seyir Kural 1.2): kod içine sabit öğretmen ismi yazılmaz.
            // Yerleşim yalnızca kullanıcının kaydettiği atamalardan belirlenir.
            const assignment = assignedTeachers.find(a => a.isim === t);
            if (assignment && assignment.yer) {
                // İlgili zone'a koy
                const targetZone = document.querySelector(`.dnd-zone[data-zone="${assignment.yer}"]`);
                if (targetZone) {
                    targetZone.appendChild(card);
                } else {
                    poolEl.appendChild(card);
                }
            } else {
                // Atanmamış öğretmenler havuzda kalır
                poolEl.appendChild(card);
            }
        });

        // Modal içeriğini doldur
        document.getElementById('inp-teachers-pool').value = allTeachers.join('\n');
        updateUnassignedCount();
    }

    function updateUnassignedCount() {
        const pool = document.getElementById('dnd-pool');
        const countSpan = document.getElementById('unassigned-count');
        if (!pool || !countSpan) return;
        countSpan.textContent = '(' + pool.children.length + ')';
    }

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
            zone.appendChild(document.getElementById(data));
            saveCurrentDayDnD();
            updateUnassignedCount();
        }
    };

    window.dropToPool = (ev) => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const pool = document.getElementById('dnd-pool');
        pool.appendChild(document.getElementById(data));
        saveCurrentDayDnD();
        updateUnassignedCount();
    };

    // Modal Yönetimi
    document.getElementById('btn-edit-teachers').addEventListener('click', () => {
        const modal = document.getElementById('modal-teachers');
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
        modal.style.pointerEvents = 'auto';
    });

    document.getElementById('btn-close-teachers').addEventListener('click', () => {
        const modal = document.getElementById('modal-teachers');
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => modal.style.display = 'none', 300);
    });

    document.getElementById('btn-save-teachers').addEventListener('click', () => {
        const lines = document.getElementById('inp-teachers-pool').value.split('\n').map(x => x.trim()).filter(x => x);
        appData.tumOgretmenler = [...new Set(lines)]; // Tekrar edenleri temizle
        renderNobetciDnD(); // Yeniden çiz
        document.getElementById('btn-close-teachers').click();
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
            listeEl.innerHTML = '<div style="padding: 15px; text-align: center; color: #9ca3af; border: 1px dashed #4b5563; border-radius: 8px;">Bugün izinli olan öğretmenlerin ' + (saatIndex + 1) + '. derste boşta olan bir dersi bulunmuyor.</div>';
        } else {
            atanabilecekDersler.forEach(d => {
                const div = document.createElement('div');
                div.style.padding = '12px 15px';
                div.style.background = '#374151'; // Dark card background
                div.style.border = '1px solid #4b5563'; // Dark border
                div.style.color = '#f3f4f6'; // Light text
                div.style.borderRadius = '8px';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.marginBottom = '10px';
                div.style.cursor = 'pointer';
                div.style.transition = 'all 0.2s';

                div.onmouseover = () => { div.style.background = 'rgba(16,185,129,0.15)'; div.style.borderColor = '#10b981'; };
                div.onmouseout = () => { div.style.background = '#374151'; div.style.borderColor = '#4b5563'; };

                div.innerHTML = `
                <div>
                    <div style="font-weight: 700; color: #f9fafb; font-size: 1.05rem; margin-bottom: 3px;">${escapeHtml(d.sinif)}</div>
                    <div style="color: #d1d5db; font-size: 0.85rem;"><span style="color: #60a5fa; font-weight: 600;">${escapeHtml(d.dersAdi)}</span> - <i class="fa-solid fa-bed" style="color:#f87171; font-size:0.75rem;"></i> ${escapeHtml(d.izinli)}</div>
                </div>
                <button class="btn-primary btn-sm btn-glow-sm" style="background:#10b981; border:none; padding:6px 12px; border-radius:6px; color:white; font-weight:bold;"><i class="fa-solid fa-check"></i> Ata</button>
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
            if (document.getElementById('chk-reset-zaman').checked) {
                appData.dersProgrami = {};
            }

            saveData();

            if (typeof populateForms === 'function') populateForms();
            if (typeof renderProgramMatrix === 'function') renderProgramMatrix();
            if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();

            btnCloseReset.click();
            BhUI.toast('Seçili veriler başarıyla sıfırlandı.', 'success');
        });
    }

});
// --- DERS YÖNETİMİ MANTIĞI ---
let currentProgramSinif = null;

window.renderProgramClassButtons = function () {
    const container = document.getElementById('program-class-buttons');
    if (!container) return;
    container.innerHTML = '';

    const siniflar = appData.sinifListesi || [];
    siniflar.forEach(sinif => {
        const btn = document.createElement('button');
        btn.className = 'btn-sm';
        btn.style.whiteSpace = 'nowrap';
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
        const color = colors[appData.sinifListesi.indexOf(sinif) % colors.length];
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.opacity = '0.7';
        btn.style.borderRadius = '6px';
        btn.style.transition = 'all 0.2s';
        if (sinif === currentProgramSinif) {
            btn.style.opacity = '1';
            btn.style.boxShadow = '0 0 10px ' + color;
            btn.style.transform = 'scale(1.05)';
        }
        btn.textContent = sinif;
        btn.onclick = () => {
            currentProgramSinif = sinif;
            renderProgramClassButtons(); // update active state
            renderProgramMatrix();
        };
        container.appendChild(btn);
    });
};

window.renderProgramMatrix = function () {
    const matrixEl = document.getElementById('program-matrix');
    const containerEl = document.getElementById('program-matrix-container');
    const emptyEl = document.getElementById('program-matrix-empty');

    if (!currentProgramSinif) {
        if (containerEl) containerEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (containerEl) containerEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    matrixEl.innerHTML = '';

    const sinifIsOrta = currentProgramSinif.startsWith('5') || currentProgramSinif.startsWith('6') || currentProgramSinif.startsWith('7') || currentProgramSinif.startsWith('8');
    const vakitler = sinifIsOrta ? (appData.dersProgramiOrtaokul || []) : (appData.dersProgramiLise || []);
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
    const sinifData = appData.dersProgramiDetay[currentProgramSinif] || {};


    const buSinifinDersleri = (appData.sinifDersleri && appData.sinifDersleri[currentProgramSinif]) ? appData.sinifDersleri[currentProgramSinif] : [];
    let optionsHtml = '<option value="">Ders Seçin...</option>';
    if (buSinifinDersleri.length > 0) {
        buSinifinDersleri.forEach(dersAdi => {
            optionsHtml += `<option value="${escapeHtml(dersAdi)}">${escapeHtml(dersAdi)}</option>`;
        });
    } else {
        // Fallback: If no subjects assigned yet, use all from branslar or just say nothing
        const branslar = appData.ogretmenBranslar || [];
        branslar.forEach(b => {
            optionsHtml += `<option value="${escapeHtml(b.ad)}">${escapeHtml(b.ad)}</option>`;
        });
    }


    // Üst Başlıklar
    matrixEl.style.gridTemplateColumns = `80px repeat(5, 1fr)`;
    let headerHtml = '<div class="grid-cell-header"></div>';
    days.forEach(day => {
        headerHtml += `<div class="grid-cell-header" style="text-align:center; font-weight:bold; color:var(--text-main);">${day}</div>`;
    });
    matrixEl.innerHTML += headerHtml;

    vakitler.forEach((v, periodIdx) => {
        // Row Label
        const label = document.createElement('div');
        label.style.cssText = 'display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-main); font-size:0.8rem; text-align:center; border-right:1px solid rgba(255,255,255,0.1); padding-right:5px;';
        label.innerHTML = `<strong>${escapeHtml(v.ders)}</strong>`;
        matrixEl.appendChild(label);

        days.forEach(day => {
            const cell = document.createElement('div');
            cell.style.cssText = 'display:flex; align-items:center; justify-content:center; padding: 5px;';

            const select = document.createElement('select');
            select.className = 'form-control form-sm';
            select.style.cssText = 'width: 100%; border-radius: 4px; border: 1px solid var(--border-color); padding: 4px;';
            select.innerHTML = optionsHtml;

            if (sinifData[day] && sinifData[day][periodIdx]) {
                select.value = sinifData[day][periodIdx].ders || "";
            }

            select.onchange = (e) => {
                updateProgramCell(currentProgramSinif, day, periodIdx, e.target.value);
            };

            cell.appendChild(select);
            matrixEl.appendChild(cell);
        });
    });
};

window.updateProgramCell = function (sinif, gun, periodIndex, dersAdi) {
    if (!appData.dersProgramiDetay) appData.dersProgramiDetay = {};
    if (!appData.dersProgramiDetay[sinif]) appData.dersProgramiDetay[sinif] = {};
    if (!appData.dersProgramiDetay[sinif][gun]) appData.dersProgramiDetay[sinif][gun] = {};

    if (dersAdi) {
        appData.dersProgramiDetay[sinif][gun][periodIndex] = {
            ders: dersAdi,
            type: 'ders'
        };
    } else {
        delete appData.dersProgramiDetay[sinif][gun][periodIndex];
    }
    saveData();
};


// Sınıf Yönetimi

window.renderSiniflarTable = function () {
    const tbody = document.getElementById('siniflar-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!appData.sinifListesi) {
        appData.sinifListesi = [];
    }
    if (!appData.sinifRehberlik) {
        appData.sinifRehberlik = {};
    }

    let allTeachers = [...(appData.tumOgretmenler || [])].sort((a, b) => a.localeCompare(b, 'tr'));

    let teacherOptions = '<option value="">Öğretmen Seçin</option>';
    allTeachers.forEach(t => {
        teacherOptions += `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`;
    });

    appData.sinifListesi.forEach((sinif, idx) => {
        const currentTeacher = appData.sinifRehberlik[sinif] || "";

        let currentOptions = '<option value="">Öğretmen Seçin</option>';
        allTeachers.forEach(t => {
            const selected = t === currentTeacher ? 'selected' : '';
            currentOptions += `<option value="${escapeHtml(t)}" ${selected}>${escapeHtml(t)}</option>`;
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
                <td>
                    <input type="text" class="form-control" value="${escapeHtml(sinif)}" onchange="renameSinif('${escapeJsAttr(sinif)}', this.value)" style="width: 100%; max-width: 200px;">
                </td>
                <td>
                    <select class="form-control" onchange="updateSinifRehberlik('${escapeJsAttr(sinif)}', this.value)" style="max-width: 300px; width: 100%;">
                        ${currentOptions}
                    </select>
                </td>
                <td style="text-align: center;">
                    <button class="btn-danger btn-sm" onclick="deleteSinif('${escapeJsAttr(sinif)}')" title="Sınıfı Sil"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        tbody.appendChild(tr);
    });
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
    BhUI.toast(sinif + ' rehberliği güncellendi.', 'success');
};

window.renameSinif = function (oldName, newName) {
    newName = newName.trim();
    if (!newName || newName === oldName) return renderSiniflarTable();

    if (appData.sinifListesi.includes(newName)) {
        BhUI.toast('Bu sınıf adı zaten var!', 'error');
        return renderSiniflarTable();
    }

    // Listede güncelle
    const index = appData.sinifListesi.indexOf(oldName);
    if (index > -1) {
        appData.sinifListesi[index] = newName;
    }

    // Rehberlik güncelle
    if (appData.sinifRehberlik && appData.sinifRehberlik[oldName]) {
        appData.sinifRehberlik[newName] = appData.sinifRehberlik[oldName];
        delete appData.sinifRehberlik[oldName];
    }

    // Ders programı detay güncelle
    if (appData.dersProgramiDetay && appData.dersProgramiDetay[oldName]) {
        appData.dersProgramiDetay[newName] = appData.dersProgramiDetay[oldName];
        delete appData.dersProgramiDetay[oldName];
    }

    // Eşleştirme güncelle
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
    let num = 1;
    let baseName = "Yeni Sınıf";
    let newName = baseName;
    while (appData.sinifListesi.includes(newName)) {
        newName = baseName + " " + num;
        num++;
    }
    appData.sinifListesi.push(newName);
    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast('Yeni sınıf eklendi.', 'success');
};

window.deleteSinif = function (name) {
    if (!confirm(name + ' sınıfını silmek istediğinize emin misiniz?')) return;

    const index = appData.sinifListesi.indexOf(name);
    if (index > -1) {
        appData.sinifListesi.splice(index, 1);
    }

    if (appData.sinifRehberlik) delete appData.sinifRehberlik[name];
    if (appData.dersProgramiDetay) delete appData.dersProgramiDetay[name];
    if (appData.sinifDersOgretmen) delete appData.sinifDersOgretmen[name];

    if (currentProgramSinif === name) {
        currentProgramSinif = null;
        renderProgramMatrix();
    }
    if (currentEslestirmeSinif === name) {
        currentEslestirmeSinif = null;
        renderEslestirmeMatrix();
    }

    saveData();
    renderSiniflarTable();
    if (typeof renderProgramClassButtons === 'function') renderProgramClassButtons();
    if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    BhUI.toast('Sınıf silindi.', 'success');
};

// --- SINIF DERS EŞLEŞTİRME ---
window.switchProgramSubTab = function (tabName) {
    document.getElementById('sub-tab-haftalik').style.display = (tabName === 'haftalik') ? 'block' : 'none';
    document.getElementById('sub-tab-eslestirme').style.display = (tabName === 'eslestirme') ? 'block' : 'none';

    document.getElementById('btn-sub-haftalik').className = (tabName === 'haftalik') ? 'btn-primary btn-sm btn-glow-sm' : 'btn-secondary btn-sm';
    document.getElementById('btn-sub-eslestirme').className = (tabName === 'eslestirme') ? 'btn-primary btn-sm btn-glow-sm' : 'btn-secondary btn-sm';

    if (tabName === 'eslestirme') {
        if (typeof renderEslestirmeClassButtons === 'function') renderEslestirmeClassButtons();
    }
};



const defaultDerslerOrtaokul = [
    "ARAPÇA O.O", "BEDEN EĞİTİMİ", "BİLİŞİM TEKNOLOJİLERİ VE YAZILIM", "FEN BİLİMLERİ",
    "GÖRSEL SANATLAR", "KURANI KERİM O.O", "OKUMA BECERİLERİ", "REHBERLİK",
    "ROBOTİK KODLAMA VE YAZILIM", "SOSYAL BİLGİLER", "TEMEL DİNİ BİLGİLER",
    "TÜRKÇE", "İNGİLİZCE"
];

const defaultDerslerLise = [
    "ARAPÇA", "ARAPÇA 10", "ARAPÇA SPOR", "BEDEN EĞİTİMİ", "BİYOLOJİ",
    "COĞRAFYA", "EĞİTSEL OYUNLAR", "FELSEFE", "FİZİK", "HADİS",
    "KURANI KERİM 10 SPOR", "KURANI KERİM 4", "KİMYA", "MATEMATİK",
    "REHBERLİK", "SAĞLIK BİLGİSİ", "SOSYAL BİLİM ÇALIŞMALARI", "SPOR EĞİTİMİ",
    "SPOR UYGULAMALARI", "SİYER", "TAKIM SPORLARI", "TARİH", "TEMEL DİNİ BİLGİLER",
    "TÜRK DİLİ EDEBİYATI", "İNGİLİZCE"
];

let currentEslestirmeSinif = null;
let currentHavuzTab = 'ortaokul';

window.switchHavuzTab = function (tabName) {
    currentHavuzTab = tabName;
    document.getElementById('ders-havuzu-ortaokul-dropzone').style.display = (tabName === 'ortaokul') ? 'flex' : 'none';
    document.getElementById('ders-havuzu-lise-dropzone').style.display = (tabName === 'lise') ? 'flex' : 'none';

    document.getElementById('btn-havuz-ortaokul').className = (tabName === 'ortaokul') ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
    document.getElementById('btn-havuz-lise').className = (tabName === 'lise') ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
};

window.renderEslestirmeClassButtons = function () {
    const container = document.getElementById('eslestirme-class-buttons');
    if (!container) return;
    container.innerHTML = '';

    const siniflar = appData.sinifListesi || [];
    siniflar.forEach(sinif => {
        const btn = document.createElement('button');
        btn.className = 'btn-sm';
        btn.style.whiteSpace = 'nowrap';
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
        const color = colors[appData.sinifListesi.indexOf(sinif) % colors.length];
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.opacity = '0.7';
        btn.style.borderRadius = '6px';
        btn.style.transition = 'all 0.2s';
        if (sinif === currentEslestirmeSinif) {
            btn.style.opacity = '1';
            btn.style.boxShadow = '0 0 10px ' + color;
            btn.style.transform = 'scale(1.05)';
        }
        btn.textContent = sinif;
        btn.onclick = () => {
            currentEslestirmeSinif = sinif;
            // Automatically switch to correct pool based on class name
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
    if (!currentEslestirmeSinif) return;

    const ders = ev.dataTransfer.getData("text");
    if (!appData.sinifDersleri) appData.sinifDersleri = {};
    if (!appData.sinifDersleri[currentEslestirmeSinif]) appData.sinifDersleri[currentEslestirmeSinif] = [];

    if (!appData.sinifDersleri[currentEslestirmeSinif].includes(ders)) {
        appData.sinifDersleri[currentEslestirmeSinif].push(ders);
        saveData();
        renderEslestirmeMatrix();
        BhUI.toast(ders + ' sınıfa eklendi.', 'success');
    } else {
        BhUI.toast('Bu ders zaten bu sınıfta var.', 'error');
    }
};

window.dropToHavuzEslestirme = function (ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('dragover');
    if (!currentEslestirmeSinif) return;

    const ders = ev.dataTransfer.getData("text");

    // Remove from class
    if (appData.sinifDersleri && appData.sinifDersleri[currentEslestirmeSinif]) {
        const index = appData.sinifDersleri[currentEslestirmeSinif].indexOf(ders);
        if (index > -1) {
            appData.sinifDersleri[currentEslestirmeSinif].splice(index, 1);
            saveData();
            renderEslestirmeMatrix();
            BhUI.toast(ders + ' sınıftan çıkarıldı.', 'success');
        }
    }
};

window.removeFromSinif = function (ders) {
    if (!currentEslestirmeSinif) return;
    if (appData.sinifDersleri && appData.sinifDersleri[currentEslestirmeSinif]) {
        const index = appData.sinifDersleri[currentEslestirmeSinif].indexOf(ders);
        if (index > -1) {
            appData.sinifDersleri[currentEslestirmeSinif].splice(index, 1);
            saveData();
            renderEslestirmeMatrix();
            BhUI.toast(ders + ' sınıftan çıkarıldı.', 'success');
        }
    }
};

window.addNewDersToHavuz = function () {
    const title = currentHavuzTab === 'ortaokul' ? 'Ortaokul Havuzuna' : 'Lise Havuzuna';
    const yeniDers = prompt(title + " eklenecek yeni dersin adını giriniz:");
    if (yeniDers && yeniDers.trim() !== "") {
        const ad = yeniDers.trim();

        if (currentHavuzTab === 'ortaokul') {
            if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
            if (!appData.dersHavuzuOrtaokul.includes(ad)) {
                appData.dersHavuzuOrtaokul.push(ad);
                saveData();
                renderEslestirmeMatrix();
                BhUI.toast('Ders havuza eklendi.', 'success');
            } else {
                BhUI.toast('Bu ders havuzda mevcut.', 'error');
            }
        } else {
            if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];
            if (!appData.dersHavuzuLise.includes(ad)) {
                appData.dersHavuzuLise.push(ad);
                saveData();
                renderEslestirmeMatrix();
                BhUI.toast('Ders havuza eklendi.', 'success');
            } else {
                BhUI.toast('Bu ders havuzda mevcut.', 'error');
            }
        }
    }
};

window.renderEslestirmeMatrix = function () {
    const containerEl = document.getElementById('eslestirme-matrix-container');
    const emptyEl = document.getElementById('eslestirme-matrix-empty');

    if (!currentEslestirmeSinif) {
        if (containerEl) containerEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (containerEl) containerEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    // Update class list (left side)
    const sinifDersleriContainer = document.getElementById('sinif-dersleri-dropzone');
    sinifDersleriContainer.innerHTML = '';
    sinifDersleriContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

    if (!appData.sinifDersleri) appData.sinifDersleri = {};
    const buSinifinDersleri = appData.sinifDersleri[currentEslestirmeSinif] || [];

    if (buSinifinDersleri.length === 0) {
        sinifDersleriContainer.innerHTML = `<div style="color:var(--text-muted); font-size: 0.9rem; font-style: italic;">Henüz ders atanmadı.</div>`;
    }

    buSinifinDersleri.forEach(ders => {
        const div = document.createElement('div');
        div.className = 'draggable-item';
        div.draggable = true;
        div.ondragstart = (e) => dragStartEslestirme(e, ders);
        div.innerHTML = `
                <div><i class="fa-solid fa-grip-vertical"></i> ${escapeHtml(ders)}</div>
                <button class="remove-btn" onclick="removeFromSinif('${escapeJsAttr(ders)}')" title="Sınıftan Çıkar"><i class="fa-solid fa-xmark"></i></button>
            `;
        sinifDersleriContainer.appendChild(div);
    });

    // Update pool (right side) - Ortaokul
    const havuzOrtaokulContainer = document.getElementById('ders-havuzu-ortaokul-dropzone');
    havuzOrtaokulContainer.innerHTML = '';
    havuzOrtaokulContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

    if (!appData.dersHavuzuOrtaokul) appData.dersHavuzuOrtaokul = [...defaultDerslerOrtaokul];
    const havuzGosterilecekO = appData.dersHavuzuOrtaokul.filter(d => !buSinifinDersleri.includes(d));

    if (havuzGosterilecekO.length === 0) {
        havuzOrtaokulContainer.innerHTML = `<div style="color:var(--text-muted); font-size: 0.9rem; font-style: italic;">Tüm dersler sınıfa atanmış.</div>`;
    }

    havuzGosterilecekO.forEach(ders => {
        const div = document.createElement('div');
        div.className = 'draggable-item';
        div.draggable = true;
        div.ondragstart = (e) => dragStartEslestirme(e, ders);
        div.innerHTML = `<i class="fa-solid fa-grip-vertical"></i> ${escapeHtml(ders)}`;
        havuzOrtaokulContainer.appendChild(div);
    });

    // Update pool (right side) - Lise
    const havuzLiseContainer = document.getElementById('ders-havuzu-lise-dropzone');
    havuzLiseContainer.innerHTML = '';
    havuzLiseContainer.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('dragover'));

    if (!appData.dersHavuzuLise) appData.dersHavuzuLise = [...defaultDerslerLise];
    const havuzGosterilecekL = appData.dersHavuzuLise.filter(d => !buSinifinDersleri.includes(d));

    if (havuzGosterilecekL.length === 0) {
        havuzLiseContainer.innerHTML = `<div style="color:var(--text-muted); font-size: 0.9rem; font-style: italic;">Tüm dersler sınıfa atanmış.</div>`;
    }

    havuzGosterilecekL.forEach(ders => {
        const div = document.createElement('div');
        div.className = 'draggable-item';
        div.draggable = true;
        div.ondragstart = (e) => dragStartEslestirme(e, ders);
        div.innerHTML = `<i class="fa-solid fa-grip-vertical"></i> ${escapeHtml(ders)}`;
        havuzLiseContainer.appendChild(div);
    });
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
                row.push(dersObj ? dersObj.ders : "");
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
            const workbook = XLSX.read(data, { type: 'array' });
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
                    count++;
                }
            });

            if (count > 0) {
                resultDiv.innerHTML = `<span style="color:var(--secondary);"><i class="fa-solid fa-check"></i> ${count} adet sınav kaydı başarıyla aktarıldı. (Kaydetmeyi Unutmayın)</span>`;
                if (typeof renderSinavlar === 'function') renderSinavlar();
                BhUI.toast(`${count} sınav içeri aktarıldı.`, 'success');
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
            const workbook = XLSX.read(data, { type: 'array' });
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

                                if (tAdi) {
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
                                if (cellVal.includes('\n')) {
                                    const parts = cellVal.split('\n');
                                    if (parts.length >= 2) dAdi = parts[1].trim();
                                    else dAdi = parts[0].trim();
                                }

                                dAdi = courseMap[dAdi] || dAdi;

                                appData.dersProgramiDetay[currentSinif][strGun][i - 1] = {
                                    ders: dAdi,
                                    type: 'ders'
                                };

                                if (!appData.sinifDersleri) appData.sinifDersleri = {};
                                if (!appData.sinifDersleri[currentSinif]) appData.sinifDersleri[currentSinif] = [];
                                if (!appData.sinifDersleri[currentSinif].includes(dAdi)) {
                                    appData.sinifDersleri[currentSinif].push(dAdi);
                                }
                            } else {
                                delete appData.dersProgramiDetay[currentSinif][strGun][i - 1];
                            }
                        }
                    }
                    count++;
                }
            });

            // Havuzu temizle
            appData.dersHavuzuLise = [];
            appData.dersHavuzuOrtaokul = [];

            saveData();
            if (typeof window.renderProgramMatrix === 'function') {
                try { window.renderProgramMatrix(); } catch (e) { console.warn("Matrix render error skipped:", e); }
            }
            if (typeof window.renderOgretmenTable === 'function') {
                try { window.renderOgretmenTable(); } catch (e) { }
            }
            if (typeof window.renderNobetciDnD === 'function') {
                try { window.renderNobetciDnD(); } catch (e) { }
            }
            if (typeof window.renderSiniflarTable === 'function') {
                try { window.renderSiniflarTable(); } catch (e) { }
            }
            if (typeof window.renderProgramClassButtons === 'function') {
                try { window.renderProgramClassButtons(); } catch (e) { }
            }
            if (typeof window.renderEslestirmeClassButtons === 'function') {
                try { window.renderEslestirmeClassButtons(); } catch (e) { }
            }
            if (typeof window.renderDersler === 'function') {
                try { window.renderDersler(); } catch (e) { }
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
            const workbook = XLSX.read(data, { type: 'array' });
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
                    count++;
                }
            });

            saveData();
            if (typeof renderNobetciDnD === 'function') renderNobetciDnD();
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
        e.target.classList.add('active');

        const tab = e.target.getAttribute('data-tab');
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

    const siralilar = Array.from(ogretmenler).sort((a, b) => a.localeCompare(b, 'tr'));
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
    if (!grid) return;

    if (!ogretmenAdi) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text3); background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px dashed var(--sidebar-border);">Lütfen yukarıdan ders programını görmek istediğiniz öğretmeni seçin.</div>';
        return;
    }

    grid.innerHTML = '';
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const matrix = [];
    for (let i = 0; i < 5; i++) matrix[i] = new Array(8).fill(null);

    if (appData.dersProgramiDetay) {
        for (const [sinif, gunlerObj] of Object.entries(appData.dersProgramiDetay)) {
            days.forEach((gun, dIdx) => {
                const gData = gunlerObj[gun] || gunlerObj[gun.toLowerCase()] || gunlerObj[gun.replace('ı', 'i').replace('ş', 's').replace('ç', 'c').toLowerCase()];
                if (gData) {
                    for (let sIdx = 0; sIdx < 8; sIdx++) {
                        const dBilgi = gData[sIdx];
                        if (dBilgi && dBilgi.type === 'ders' && dBilgi.ogretmen && dBilgi.ogretmen.trim() === ogretmenAdi.trim()) {
                            matrix[dIdx][sIdx] = { sinif: sinif, ders: dBilgi.ders };
                        }
                    }
                }
            });
        }
    }

    days.forEach((gun, dIdx) => {
        const col = document.createElement('div');
        col.className = 'glass-card';
        col.style.padding = '15px';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '8px';

        let html = `<div style="font-weight: bold; color: var(--primary); text-align: center; padding-bottom: 10px; margin-bottom: 5px; border-bottom: 2px solid var(--primary-rgb, rgba(0,0,0,0.1));">${gun}</div>`;

        for (let sIdx = 0; sIdx < 8; sIdx++) {
            const data = matrix[dIdx][sIdx];
            if (data) {
                html += `
                <div style="padding: 10px; background: rgba(16,185,129,0.1); border-left: 3px solid #10b981; border-radius: 6px;">
                    <div style="font-weight: bold; color: var(--text1); font-size: 0.9rem; margin-bottom: 4px;">${sIdx + 1}. Ders</div>
                    <div style="color: #10b981; font-weight: 700; font-size: 1rem;">${escapeHtml(data.sinif)}</div>
                    <div style="color: var(--text2); font-size: 0.8rem;">${escapeHtml(data.ders)}</div>
                </div>`;
            } else {
                html += `
                <div style="padding: 10px; background: rgba(0,0,0,0.02); border-left: 3px solid var(--sidebar-border); border-radius: 6px; opacity: 0.7;">
                    <div style="font-weight: bold; color: var(--text3); font-size: 0.9rem;">${sIdx + 1}. Ders</div>
                    <div style="color: var(--text3); font-size: 0.85rem;">Boş</div>
                </div>`;
            }
        }
        col.innerHTML = html;
        grid.appendChild(col);
    });
}


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
