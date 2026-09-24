/**
 * PanoTV - Ana JavaScript Dosyası
 * Komut Rotası Subdomain Kurallarına Uygun Olarak (Vanilla JS) Yazılmıştır.
 */

const PanoTV = (function () {

    // Global Değişkenler
    let panoData = null;
    let currentSlide = 0;
    let currentSidebarSlide = 0;
    let slideInterval = null;
    let carouselInterval = null;
    let flipInterval = null;
    let dataInterval = null;
    let targetDate = null;
    let namazViewToggle = 0;
    let globalNamazTimes = [
        { name: 'İmsak', time: '05:00' },
        { name: 'Güneş', time: '06:30' },
        { name: 'Öğle', time: '12:48' },
        { name: 'İkindi', time: '16:14' },
        { name: 'Akşam', time: '18:54' },
        { name: 'Yatsı', time: '20:10' }
    ];
    try {
        const rawCachedNamaz = localStorage.getItem('seyir_cached_namaz_v1');
        if (rawCachedNamaz) {
            const parsedCached = JSON.parse(rawCachedNamaz);
            if (parsedCached && Array.isArray(parsedCached.vakitler) && parsedCached.vakitler.length === 6) {
                globalNamazTimes = parsedCached.vakitler;
            }
        }
    } catch (e) {}
    let dersScrollPos = 0;
    let dersScrollDir = 1;
    let animFrame = null;

    const BASLANGIC_HABER_GORSELLERI = [
        { anahtar: '17671892', yol: 'img/cache-haber/1f7b850ded319eae7fd316971f12edbf.jpg' },
        { anahtar: '17651353', yol: 'img/cache-haber/aa37a2d7e85bc9260d6b90520044e1a9.jpg' },
        { anahtar: '17641455', yol: 'img/cache-haber/5838e94d73f6e588e7c5e20c37312ef9.jpg' },
        { anahtar: '17630148', yol: 'img/cache-haber/14203116_whatsappimage20250710at22.31.50.jpg' },
        { anahtar: '17627027', yol: 'img/cache-haber/dc47059d84dc535622c58a4fee7da05b.jpg' }
    ];

    function haberGorselAdresi(haber) {
        const aramaMetni = String((haber && haber.link) || '') + ' ' + String((haber && haber.gorsel) || '');
        const yerel = BASLANGIC_HABER_GORSELLERI.find(kayit => aramaMetni.includes(kayit.anahtar));
        return yerel ? yerel.yol : String((haber && haber.gorsel) || '');
    }

    function startVerticalScroll() {
        const wrapper = document.getElementById('ders-list-wrapper');
        const list = document.getElementById('pano-dersler');
        if (!wrapper || !list) return;

        if (animFrame) cancelAnimationFrame(animFrame);
        let pos = 0;
        let dir = 1; // 1: aşağı, -1: yukarı
        let pauseCounter = 0;
        wrapper.scrollTop = 0;

        function scrollStep() {
            const maxScroll = list.scrollHeight - wrapper.clientHeight;

            if (maxScroll > 2) {
                if (pauseCounter > 0) {
                    pauseCounter--;
                } else {
                    pos += 0.6 * dir;
                    if (pos >= maxScroll) {
                        pos = maxScroll;
                        dir = -1; // Yön değiştir: Yukarı kaydır
                        pauseCounter = 90; // Toplam ~1.5 saniye bekle
                    } else if (pos <= 0) {
                        pos = 0;
                        dir = 1; // Yön değiştir: Aşağı kaydır
                        pauseCounter = 90; // Toplam ~1.5 saniye bekle
                    }
                    wrapper.scrollTop = pos;
                }
            } else {
                wrapper.scrollTop = 0;
            }

            animFrame = requestAnimationFrame(scrollStep);
        }
        animFrame = requestAnimationFrame(scrollStep);
    }

    let arkaYuzAnimFrame = null;

    function startArkaYuzScroll() {
        const wrapper = document.getElementById('arka-yuz-wrapper');
        const list = document.getElementById('arka-yuz-content');
        if (!wrapper || !list) return;

        if (arkaYuzAnimFrame) cancelAnimationFrame(arkaYuzAnimFrame);

        let pos = 0;
        let dir = 1;
        let pauseCounter = 0;
        wrapper.scrollTop = 0;

        function dScrollStep() {
            const maxScroll = list.scrollHeight - wrapper.clientHeight;

            if (maxScroll > 2) {
                if (pauseCounter > 0) {
                    pauseCounter--;
                } else {
                    pos += 0.6 * dir;
                    if (pos >= maxScroll) {
                        pos = maxScroll;
                        dir = -1;
                        pauseCounter = 90;
                    } else if (pos <= 0) {
                        pos = 0;
                        dir = 1;
                        pauseCounter = 90;
                    }
                    wrapper.scrollTop = pos;
                }
            } else {
                wrapper.scrollTop = 0;
            }
            arkaYuzAnimFrame = requestAnimationFrame(dScrollStep);
        }
        arkaYuzAnimFrame = requestAnimationFrame(dScrollStep);
    }

    let duyuruGridAnimFrame = null;

    function startDuyuruGridScroll() {
        const wrapper = document.getElementById('pano-duyuru-grid');
        const content = wrapper ? wrapper.querySelector('.duyuru-accordion-list') : null;
        if (!wrapper || !content) return;

        if (duyuruGridAnimFrame) cancelAnimationFrame(duyuruGridAnimFrame);

        let pos = 0;
        let dir = 1;
        let pauseCounter = 0;
        wrapper.scrollTop = 0;

        function dGridScrollStep() {
            const maxScroll = content.scrollHeight - wrapper.clientHeight;

            if (maxScroll > 2) {
                if (pauseCounter > 0) {
                    pauseCounter--;
                } else {
                    pos += 0.5 * dir;
                    if (pos >= maxScroll) {
                        pos = maxScroll;
                        dir = -1;
                        pauseCounter = 90;
                    } else if (pos <= 0) {
                        pos = 0;
                        dir = 1;
                        pauseCounter = 90;
                    }
                    wrapper.scrollTop = pos;
                }
            } else {
                wrapper.scrollTop = 0;
            }
            duyuruGridAnimFrame = requestAnimationFrame(dGridScrollStep);
        }
        duyuruGridAnimFrame = requestAnimationFrame(dGridScrollStep);
    }

    // DOM Elementleri
    const els = {
        okulAdi: document.getElementById('pano-okul-adi'),
        slogan: document.getElementById('pano-slogan'),
        carousel: document.getElementById('pano-carousel'),
        tickerText: document.getElementById('pano-ticker-text'),
    };

    /**
     * Verileri JSON'dan çek
     */
    async function fetchData() {
        try {
            let fileData = {};
            try {
                const res = await fetch('data/data.json?t=' + new Date().getTime());
                if (res.ok) {
                    fileData = await res.json();
                }
            } catch (e) {
                console.warn("data/data.json okunamadı:", e);
            }

            let localData = null;
            // Yönetim verisinin tamamını okumaz; admin panelinin gizlilik kurallarıyla
            // hazırladığı açık pano kopyasını kullanır.
            const localDataStr = localStorage.getItem('seyir_public_data');
            if (localDataStr) {
                try {
                    localData = JSON.parse(localDataStr);
                    // Önceki boş kurulum sürümünün kimlik alanları, yeni başlangıç
                    // okulunun paketlenmiş verilerini ezmesin. Diğer yerel ayarlar korunur.
                    const bosEskiKimlik = localData &&
                        (!localData.okulAdi || localData.okulAdi === 'Seyir Dijital Pano') &&
                        !String(localData.okulWebSiteUrl || '').trim() &&
                        !String(localData.okulLogo || '').trim() &&
                        (!Array.isArray(localData.mebHaberler) || localData.mebHaberler.length === 0);
                    if (bosEskiKimlik) {
                        localData = Object.assign({}, localData);
                        ['okulAdi', 'okulLogo', 'slogan', 'daktiloYazilari', 'okulWebSiteUrl', 'mebHaberler']
                            .forEach(alan => delete localData[alan]);
                    } else if (String(localData.okulWebSiteUrl || '').replace(/\/+$/, '') === 'https://konyamcosihl.meb.k12.tr') {
                        localData = Object.assign({}, localData);
                        if (!Array.isArray(localData.mebHaberler) || localData.mebHaberler.length === 0) delete localData.mebHaberler;
                        if (!String(localData.okulLogo || '').trim()) delete localData.okulLogo;
                    }
                } catch (e) {
                    console.error("Local data parse error", e);
                }
            }

            panoData = Object.assign({
                okulAdi: "Mahmud Celaleddin Ökten",
                okulTuru: "Anadolu İmam Hatip Lisesi",
                okulLogo: "img/okul_logo.png",
                daktiloYazilari: [
                    "Medya Okulu",
                    "Teknoloji Okulu",
                    "Aile Okulu",
                    "Kur'an Okulu",
                    "Bilim Okulu",
                    "Vefa Okulu",
                    "Hareket Okulu",
                    "İlim Okulu",
                    "Kariyer Okulu",
                    "Spor Okulu",
                    "Okuma Okulu",
                    "Türkiye Yüzyılı Maarif Okulu",
                    "Zanaat Okulu"
                ],
                okulWebSiteUrl: "https://konyamcosihl.meb.k12.tr/",
                konum: { sehir: "Konya", enlem: null, boylam: null },
                ayarlar: { karuselSuresi: 5000, temaOtomatik: true },
                gizlilik: {
                    personelAdiGosterim: 'gorev',
                    nobetciGoster: true,
                    rehberOgretmenGoster: false,
                    dersOgretmeniGoster: false,
                    saklamaSuresiGun: 365
                },
                duyurular: [],
                sinavlar: [],
                kayanYazi: [],
                tumOgretmenler: [],
                ogretmenBranslar: [],
                dersProgrami: {},
                nobetciOgretmenler: {},
                nobetciGunluk: {},
                zilYonetimi: {
                    aktif: true,
                    melodiOgrenci: "modern",
                    melodiOgretmen: "chime",
                    melodiCikis: "westminster",
                    sesSeviyesi: 80,
                    calmaSuresi: 8,
                    haftasonuSessiz: true,
                    sesliAnons: false,
                    cizelge: []
                }
            }, fileData, localData || {});
            if (!panoData.ayarlar) panoData.ayarlar = {};
            panoData.ayarlar.ekranKoruyucu = Object.assign({
                aktif: true,
                baslangic: "17:30",
                bitis: "07:30",
                haftasonu: true,
                bostaKalmaDk: 30
            }, (fileData && fileData.ayarlar && fileData.ayarlar.ekranKoruyucu) || {}, (localData && localData.ayarlar && localData.ayarlar.ekranKoruyucu) || {});
            panoData.konum = Object.assign(
                { sehir: "Konya", ilce: "Karatay", enlem: 37.8874, boylam: 32.5334 },
                fileData.konum || {},
                (localData && localData.konum) || {}
            );

            // Eğer enlem/boylam eksikse SeyirKonum üzerinden il ve ilçe adına göre koordinatları tamamla
            if ((panoData.konum.enlem === null || panoData.konum.boylam === null || panoData.konum.enlem === '' || panoData.konum.boylam === '') && panoData.konum.sehir && typeof SeyirKonum !== 'undefined') {
                const eslesen = SeyirKonum.koordinatGetir(panoData.konum.sehir, panoData.konum.ilce);
                if (eslesen) {
                    panoData.konum.enlem = eslesen.enlem;
                    panoData.konum.boylam = eslesen.boylam;
                    if (eslesen.ilce && !panoData.konum.ilce) panoData.konum.ilce = eslesen.ilce;
                }
            }

            // ✅ ÖNCE: Sayfayı hemen render et (ağ beklemeden)
            renderData();

            // Eğer interval yoksa (ilk yükleme ise) başlat
            if (!carouselInterval) {
                startAnimations();
            }

            // ✅ Arka planda dini içerikleri çek (bloklama yok)
            fetchDiniIcerikArkaPlan();

            // ✅ Arka planda Namaz Vakitlerini çek
            fetchNamazVakitleri();

            // ✅ Arka planda Hava Durumunu çek (konum verisi hazır olduktan sonra)
            fetchSchoolWeather();

            // ✅ Akıllı Okul Zili Motorunu Başlat
            if (typeof initSeyirPanoZilEngine === 'function') {
                initSeyirPanoZilEngine();
            }

        } catch (error) {
            console.error("PanoTV Veri Hatası:", error);
        }
    }

    /**
     * Dini içerikleri arka planda çek (UI'yı bloklamaz)
     */
    async function fetchDiniIcerikArkaPlan() {
        try {
            const diniResponse = await fetch('data/dini_icerik.json?t=' + new Date().getTime());
            if (diniResponse.ok) {
                panoData.diniIcerik = await diniResponse.json();
                renderDiniIcerik(lastVakitIndex >= 0 ? lastVakitIndex : 0);
            }
        } catch (e) { console.error("Dini içerik çekilemedi", e); }
    }

    /**
     * DOM'u Verilerle Güncelle
     */
    function renderData() {
        if (!panoData) return;

        const gizlilik = Object.assign({
            personelAdiGosterim: 'gorev',
            nobetciGoster: true,
            rehberOgretmenGoster: false,
            dersOgretmeniGoster: false
        }, panoData.gizlilik || {});

        const personelAdiniGoster = (ad, gorev) => {
            const temiz = String(ad || '').trim();
            if (!temiz || gizlilik.personelAdiGosterim === 'gizli') return '';
            if (gizlilik.personelAdiGosterim === 'gorev') return gorev || 'Öğretmen';
            if (gizlilik.personelAdiGosterim === 'basHarf') {
                return temiz.split(/\s+/u).filter(Boolean).map(parca => {
                    const ilk = Array.from(parca)[0] || '';
                    return ilk ? ilk.toLocaleUpperCase('tr-TR') + '.' : '';
                }).join(' ');
            }
            return temiz;
        };

        // OKUL LOGOSU GÜNCELLEME (Özel Logo Desteği)
        const anaIsim = panoData.okulAdi || '';
        const okulTuru = panoData.okulTuru || '';
        const tamOkulAdi = okulTuru ? `${anaIsim} ${okulTuru}` : anaIsim;
        const logoImg = document.querySelector('.pano-okul-logo-img');

        if (logoImg) {
            if (panoData.okulLogo && typeof panoData.okulLogo === 'string' && panoData.okulLogo.trim() !== '') {
                logoImg.src = panoData.okulLogo;
            } else {
                logoImg.src = 'img/okul_logo.png';
            }
            if (tamOkulAdi) {
                logoImg.alt = escapeHtml(tamOkulAdi) + ' Logosu';
            }
        }

        if (els.okulAdi && anaIsim) {
            if (okulTuru) {
                els.okulAdi.innerHTML = `<span class="okul-ana-isim">${escapeHtml(anaIsim)}</span><span class="okul-alt-isim">${escapeHtml(okulTuru)}</span>`;
            } else {
                const parts = anaIsim.split(" ");
                if (parts.length > 2) {
                    const mid = Math.ceil(parts.length / 2);
                    const mainName = parts.slice(0, mid).join(" ");
                    const subName = parts.slice(mid).join(" ");
                    els.okulAdi.innerHTML = `<span class="okul-ana-isim">${escapeHtml(mainName)}</span><span class="okul-alt-isim">${escapeHtml(subName)}</span>`;
                } else {
                    els.okulAdi.innerHTML = `<span class="okul-ana-isim">${escapeHtml(anaIsim)}</span>`;
                }
            }
            document.title = tamOkulAdi + " | Seyir Dijital Pano";
        }
        if (els.slogan) {
            els.slogan.textContent = panoData.slogan || '';
        }

        const avatarColors = ['#F43F5E', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];
        const classColors = ['#F43F5E', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EAB308'];

        // SOL PANEL: Vaktin İçerikleri (Namaz, Ayet, Hadis, Dua)
        renderDiniIcerik(lastVakitIndex >= 0 ? lastVakitIndex : 0);

        // ARKA YÜZ: Nöbetçiler
        const nobetcilerContainer = document.getElementById('pano-nobetciler-back');
        if (nobetcilerContainer) {
            // Gün hesaplama
            const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
            const bugunAd = gunler[new Date().getDay()];

            let gunlukNobetciler = [];
            if (!gizlilik.nobetciGoster) {
                nobetcilerContainer.innerHTML = '<li class="nobetci-card"><div class="nobetci-info"><span class="isim" style="color:var(--text-muted);">Nöbetçi bilgisi gizlilik ayarıyla kapalı</span></div></li>';
            } else if (panoData.nobetciGunluk && panoData.nobetciGunluk[bugunAd] && panoData.nobetciGunluk[bugunAd].length > 0) {
                gunlukNobetciler = panoData.nobetciGunluk[bugunAd].filter(n => !n.includes("(Diğer)") && !n.includes("(Ders Tamamlama)") && !n.includes("(İzinli)"));
            } else if (panoData.nobetciOgretmenler && Array.isArray(panoData.nobetciOgretmenler)) {
                gunlukNobetciler = panoData.nobetciOgretmenler.filter(n => !n.includes("(Diğer)") && !n.includes("(Ders Tamamlama)") && !n.includes("(İzinli)"));
            }

            if (gizlilik.nobetciGoster && gunlukNobetciler.length > 0) {
                nobetcilerContainer.innerHTML = '';
                gunlukNobetciler.forEach((ogretmen, globalIdx) => {
                    const match = ogretmen.match(/^(.*?)\s*\((.*?)\)$/);
                    const isim = personelAdiniGoster(
                        match ? match[1] : ogretmen,
                        'Nöbetçi Öğretmen ' + (globalIdx + 1)
                    );
                    const yer = match ? match[2] : "";

                    if (!isim || yer === 'Diğer' || yer === 'İzinli') return;

                    const nobetColors = ['#34d399', '#60a5fa', '#c084fc', '#fbbf24', '#22d3ee', '#f472b6'];
                    const nColor = nobetColors[globalIdx % nobetColors.length];

                    const li = document.createElement('li');
                    li.className = 'nobetci-card';
                    li.style.cssText = `display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid ${nColor}45; border-left: 5px solid ${nColor}; border-radius: 14px; box-shadow: 0 6px 16px rgba(0,0,0,0.3); margin-bottom: 10px; width: 100%; box-sizing: border-box;`;
                    li.innerHTML = `
                        <div class="nobetci-avatar" style="background: ${nColor}22; color: ${nColor}; border: 1px solid ${nColor}45; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 2px 8px ${nColor}30;">
                            🛡️
                        </div>
                        <div class="card-info-content" style="flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;">
                            <!-- ÜST SATIR: Nöbet Yeri (Soldan Hizalı Rozet) & Canlı Görev Rozeti -->
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                ${yer ? `<span class="yer" style="font-size: 0.82rem; font-weight: 800; color: ${nColor}; display: inline-flex; align-items: center; gap: 4px; background: ${nColor}25; border: 1.5px solid ${nColor}; padding: 3px 9px; border-radius: 7px; text-align: left; white-space: nowrap; box-shadow: 0 1px 4px ${nColor}30;">📍 ${escapeHtml(yer)}</span>` : '<span style="font-size: 0.8rem; color: #94a3b8;">Nöbet Alanı</span>'}
                                <span class="nobet-card-duty-badge"><span class="duty-ping"></span> Görevde</span>
                            </div>
                            <!-- ALT SATIR: Öğretmen İsmi (Sağdan Hizalı ve Satıra Sığsın) -->
                            <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%;">
                                <span class="isim" style="font-size: 1.18rem; font-weight: 900; color: #ffffff; font-family: 'Outfit', sans-serif; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; letter-spacing: 0.3px;">${escapeHtml(isim)}</span>
                            </div>
                        </div>
                    `;
                    nobetcilerContainer.appendChild(li);
                });
            } else if (gizlilik.nobetciGoster) {
                nobetcilerContainer.innerHTML = '<li class="nobetci-card"><div class="nobetci-info"><span class="isim" style="color:var(--text-muted);">Bugün nöbetçi bulunmuyor</span></div></li>';
            }
        }

        // ALT IZGARA: Duyurular
        renderDuyuruGrid();
        if (!window.duyuruGridInterval) {
            window.duyuruGridInterval = setInterval(() => {
                window.duyuruGridIndex = (window.duyuruGridIndex || 0) + 1;
                renderDuyuruGrid();
            }, 300000); // 5 dakika (300.000 ms)
        }

        // Arka yüz otomatik kaydırmasını başlat
        setTimeout(startArkaYuzScroll, 500);

        // ÖN YÜZ: Aktif Dersler (Dikey Liste)
        renderAktifDerslerUI();

        // Karusel İçeriğini Hazırla (Ana Ekran)
        renderCarousel();

        // Daktilo yazıları admin/data.json'dan gelmiş olabilir; veri geldikten sonra tazele
        initTypewriter();

        // Tema ayarı
        if (panoData.ayarlar && panoData.ayarlar.temaOtomatik) {
            checkAutoTheme();
        }
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return str || '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatSinifPanoTV(ad) {
        return String(ad || "").trim();
    }

    // Türkçe tarih formatı (DD.MM.YYYY veya DD.MM.YYYY HH:MM) -> timestamp
    function parseTurkishDate(dateStr) {
        if (!dateStr) return 0;
        try {
            const clean = dateStr.trim().split(' ')[0]; // Sadece tarih kısmı
            const parts = clean.split('.');
            if (parts.length === 3) {
                return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`).getTime();
            }
        } catch (e) { }
        return 0;
    }

    function renderAktifDerslerUI() {
        const derslerContainer = document.getElementById('pano-dersler');
        const classColors = ['#34d399', '#60a5fa', '#c084fc', '#fbbf24', '#22d3ee', '#f472b6'];
        if (derslerContainer && panoData.aktifDersler && panoData.aktifDersler.length > 0) {
            derslerContainer.innerHTML = '';
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const dersProgrami = Array.isArray(panoData.dersProgramiLise) ? panoData.dersProgramiLise : [];
            const isCurrentlyActive = dersProgrami.some(dProg => {
                if (!dProg || typeof dProg.saat !== 'string') return false;
                const times = dProg.saat.split('-');
                if (times.length !== 2) return false;
                const sp = times[0].trim().split(':');
                const ep = times[1].trim().split(':');
                const sM = parseInt(sp[0], 10) * 60 + parseInt(sp[1] || 0, 10);
                const eM = parseInt(ep[0], 10) * 60 + parseInt(ep[1] || 0, 10);
                return Number.isFinite(sM) && Number.isFinite(eM) && currentMins >= sM && currentMins < eM;
            });

            panoData.aktifDersler.forEach((aktif, globalIdx) => {
                const rColor = classColors[globalIdx % classColors.length];

                const li = document.createElement('li');
                li.className = 'ders-card' + (isCurrentlyActive ? ' ders-aktif-pulse' : '');
                li.style.cssText = `display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid ${rColor}45; border-left: 5px solid ${rColor}; border-radius: 14px; box-shadow: 0 6px 16px rgba(0,0,0,0.3); margin-bottom: 10px; width: 100%; box-sizing: border-box;${isCurrentlyActive ? ` animation: neon-pulse-${globalIdx} 2s ease-in-out infinite; box-shadow: 0 0 18px ${rColor}60, 0 6px 20px rgba(0,0,0,0.4);` : ''}`;

                const kisaSinif = formatSinifPanoTV(aktif.sinif);

                li.innerHTML = `
                    <div class="ders-avatar" style="background: #ffffff; border: 1.5px solid rgba(255, 255, 255, 0.9); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        🎓
                    </div>
                    <div class="card-info-content" style="flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;">
                        <!-- ÜST SATIR: Sınıf İsmi (Soldan Hizalı) -->
                        <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                            <span class="sinif-adi" style="font-size: 1.05rem; font-weight: 800; color: #ffffff; font-family: 'Outfit', sans-serif; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(kisaSinif)}</span>
                        </div>
                        <!-- ALT SATIR: Ders İsmi (Sağdan Hizalı) -->
                        <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%;">
                            <span class="ders-adi" style="font-size: 0.95rem; font-weight: 900; color: ${rColor}; display: inline-flex; align-items: center; gap: 5px; background: ${rColor}28; border: 1.5px solid ${rColor}55; padding: 4px 10px; border-radius: 8px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; letter-spacing: 0.3px;">
                                📖 ${escapeHtml(aktif.ders)}
                            </span>
                        </div>
                    </div>
                `;
                derslerContainer.appendChild(li);
            });

            // Dikey Scroll Başlat (Sadece sığmıyorsa)
            setTimeout(startVerticalScroll, 500);
        } else if (derslerContainer) {
            derslerContainer.innerHTML = '<li class="ders-card"><div class="ders-info"><span class="sinif-adi" style="color:var(--text-muted); font-style:italic;">Şu an aktif ders yok.</span></div></li>';
        }
    }

    window.duyuruGridIndex = 0;

    function renderDuyuruGrid() {
        const duyuruGrid = document.getElementById('pano-duyuru-grid');
        const tickerWrapper = document.getElementById('pano-ticker-wrapper');
        const tickerText = document.getElementById('pano-ticker-text');

        if (panoData) {
            // Ticker Mantığı (Kayan Yazı & Özelleştirilebilir Şerit)
            let tickerArr = [];
            const tickerAyarlar = panoData.ayarlar || {};
            const tickerDurum = tickerAyarlar.tickerDurum !== false;

            if (panoData.kayanYazi && panoData.kayanYazi.length > 0 && tickerDurum) {
                // Sadece geçerli, boş olmayan yazıları al
                const gecerliYazilar = panoData.kayanYazi.filter(k => k && String(k).trim() !== "");
                gecerliYazilar.forEach(k => {
                    tickerArr.push(escapeHtml(String(k).trim()));
                });
            }

            if (tickerWrapper && tickerText) {
                const panoContainer = document.querySelector('.pano-container');
                if (tickerArr.length > 0 && tickerDurum) {
                    const ayrac = tickerAyarlar.tickerAyrac || '⚡';
                    const ayracHtml = `<span style="margin: 0 35px; color: var(--accent-indigo, #6366F1); font-size: 1.3rem; line-height: 0;">${escapeHtml(ayrac)}</span>`;
                    tickerText.innerHTML = tickerArr.join(ayracHtml);

                    // Şerit Başlığı Rozetini Güncelle
                    const tickerLabel = document.querySelector('.ticker-label');
                    if (tickerLabel && tickerAyarlar.tickerBaslik) {
                        tickerLabel.textContent = tickerAyarlar.tickerBaslik;
                    }

                    // Akış Hızını Dinamik Güncelle
                    let duration = 35;
                    const hizAyari = tickerAyarlar.tickerHiz;
                    if (hizAyari === 'yavas') duration = 50;
                    else if (hizAyari === 'hizli') duration = 22;
                    else if (typeof hizAyari === 'number') duration = hizAyari;

                    // Metin uzunluğuna göre ölçekleme
                    const totalChars = tickerArr.join(' ').length;
                    if (totalChars > 400) {
                        duration = Math.max(duration, Math.round(totalChars * 0.1));
                    }
                    tickerText.style.animationDuration = duration + 's';

                    tickerWrapper.style.display = 'flex';
                    if (panoContainer) panoContainer.style.paddingBottom = '60px';
                } else {
                    tickerWrapper.style.display = 'none';
                    if (panoContainer) panoContainer.style.paddingBottom = '20px';
                }
            }

            if (duyuruGrid) {
                const duyurular = panoData.duyurular || [];
                const sinavlar = panoData.sinavlar || [];

                // Sınavları duyuru formatına çevir ve zaman durumunu hesapla
                const nowZero = new Date();
                nowZero.setHours(0, 0, 0, 0);
                const oneDayMs = 24 * 60 * 60 * 1000;

                const formattedSinavlar = sinavlar.map(s => {
                    const sDateMs = s.tarih ? parseTurkishDate(s.tarih) : 0;
                    let diffDays = null;
                    let countdownText = 'Sınav Programı';
                    let countdownColor = '#60a5fa';
                    let isToday = false;
                    let isTomorrow = false;
                    let isPast = false;

                    if (sDateMs > 0) {
                        const targetZero = new Date(sDateMs);
                        targetZero.setHours(0, 0, 0, 0);
                        diffDays = Math.round((targetZero.getTime() - nowZero.getTime()) / oneDayMs);
                        if (diffDays === 0) {
                            countdownText = '🔴 BUGÜN';
                            countdownColor = '#ef4444';
                            isToday = true;
                        } else if (diffDays === 1) {
                            countdownText = '🟠 YARIN';
                            countdownColor = '#f59e0b';
                            isTomorrow = true;
                        } else if (diffDays > 1) {
                            countdownText = `⏳ ${diffDays} Gün Kaldı`;
                            countdownColor = '#3b82f6';
                        } else {
                            countdownText = 'Tamamlandı';
                            countdownColor = '#64748b';
                            isPast = true;
                        }
                    }

                    const turText = s.tur ? escapeHtml(s.tur) : 'Ortak Sınav';
                    const dersText = escapeHtml(s.ders || 'Ders');
                    const saatBilgisi = s.dersSaati
                        ? `${escapeHtml(s.dersSaati)}${s.saat ? ' (' + escapeHtml(s.saat) + ')' : ''}`
                        : (s.saat ? escapeHtml(s.saat) : 'Ders Saati');

                    return {
                        baslik: `${dersText} Sınavı`,
                        icerik: `<b>Kapsam:</b> ${turText}<br><b>Sınıflar:</b> ${escapeHtml(s.siniflar || '-')}<br><b>Tarih & Saat:</b> 📅 ${escapeHtml(s.tarih || '')} &nbsp;·&nbsp; ⏰ ${saatBilgisi}`,
                        icerikHtml: true,
                        isSinav: true,
                        sinavBadge: countdownText,
                        sinavBadgeColor: countdownColor,
                        isToday,
                        isTomorrow,
                        isPast,
                        _diffDays: diffDays !== null ? diffDays : 999,
                        _sortDate: sDateMs
                    };
                });

                // Sınavları sırala (Bugün, Yarın, en yakın tarihliler önce; geçmişler en sona)
                const sortedSinavlar = [...formattedSinavlar].sort((a, b) => {
                    if (a.isToday && !b.isToday) return -1;
                    if (!a.isToday && b.isToday) return 1;
                    if (a.isTomorrow && !b.isTomorrow) return -1;
                    if (!a.isTomorrow && b.isTomorrow) return 1;
                    if (!a.isPast && !b.isPast) return a._sortDate - b._sortDate;
                    if (!a.isPast && b.isPast) return -1;
                    if (a.isPast && !b.isPast) return 1;
                    return b._sortDate - a._sortDate;
                });

                // Duyuruları tarihe göre sırala (Acil en üstte, sonra tarih azalan)
                const sortedDuyurular = [...duyurular].sort((a, b) => {
                    const aAcil = a.oncelik === 'acil' || a.tip === 'acil' ? 1 : 0;
                    const bAcil = b.oncelik === 'acil' || b.tip === 'acil' ? 1 : 0;
                    if (aAcil !== bAcil) return bAcil - aAcil;
                    const dA = a.tarih ? parseTurkishDate(a.tarih) : 0;
                    const dB = b.tarih ? parseTurkishDate(b.tarih) : 0;
                    return dB - dA;
                });

                // Eski geçmiş sınavları (3 günden eski) TV panosundan gizle (admin listesinde görünür)
                const aktifSinavlar = sortedSinavlar.filter(s => s._diffDays === null || s._diffDays >= -2);

                // Öncelikli harmanlama: Acil duyurular ve Bugün/Yarın sınavlar en üstte yer alır
                const highPriority = [];
                const normalItems = [];

                sortedDuyurular.forEach(d => {
                    if (d.oncelik === 'acil' || d.tip === 'acil') {
                        highPriority.push(d);
                    } else {
                        normalItems.push(d);
                    }
                });

                aktifSinavlar.forEach(s => {
                    if (s.isToday || s.isTomorrow) {
                        highPriority.push(s);
                    } else {
                        normalItems.push(s);
                    }
                });

                const allItems = [...highPriority, ...normalItems];

                if (allItems.length > 0) {
                    let gridHtml = '<div class="duyuru-accordion-list">';

                    // Masaüstü ekranlarda yan yana 3 tane açık duyuru/sınav göster (3'ten fazlaysa döngüsel geçiş)
                    const total = allItems.length;
                    const startIdx = (window.duyuruGridIndex || 0) % total;
                    let displayItems = [];
                    for (let i = 0; i < Math.min(3, total); i++) {
                        displayItems.push(allItems[(startIdx + i) % total]);
                    }

                    displayItems.forEach((item, idx) => {
                        const renk = String(item.renk || '').toLowerCase();
                        let itemEmoji = '📢';
                        let themeColor = '#3b82f6';
                        let bgGrad = 'linear-gradient(135deg, #0c2340 0%, #0f172a 100%)';
                        let borderColor = 'rgba(59, 130, 246, 0.5)';
                        let badgeText = 'Genel Duyuru';

                        if (item.isSinav) {
                            itemEmoji = '📝';
                            themeColor = item.sinavBadgeColor || '#60a5fa';
                            borderColor = item.isToday ? 'rgba(239, 68, 68, 0.6)' : (item.isTomorrow ? 'rgba(245, 158, 11, 0.6)' : 'rgba(59, 130, 246, 0.45)');
                            bgGrad = item.isToday
                                ? 'linear-gradient(135deg, #2d1010 0%, #0f172a 100%)'
                                : (item.isTomorrow ? 'linear-gradient(135deg, #2b1804 0%, #0f172a 100%)' : 'linear-gradient(135deg, #0c2340 0%, #0f172a 100%)');
                            badgeText = item.sinavBadge || 'Sınav Programı';
                        } else if (item.oncelik === 'acil' || item.tip === 'acil' || renk === 'danger' || renk === 'acil' || renk === 'kirmizi') {
                            itemEmoji = '🚨';
                            themeColor = '#ef4444';
                            borderColor = 'rgba(239, 68, 68, 0.55)';
                            bgGrad = 'linear-gradient(135deg, #2d0e0e 0%, #0f172a 100%)';
                            badgeText = 'Acil İlan';
                        } else if (renk === 'secondary' || renk === 'success' || renk === 'yesil' || renk === 'green') {
                            itemEmoji = '🌿';
                            themeColor = '#10b981';
                            borderColor = 'rgba(16, 185, 129, 0.55)';
                            bgGrad = 'linear-gradient(135deg, #062e22 0%, #0f172a 100%)';
                            badgeText = 'Genel Bilgilendirme';
                        } else if (renk === 'accent' || renk === 'warning' || renk === 'turuncu' || renk === 'orange') {
                            itemEmoji = '⚡';
                            themeColor = '#f59e0b';
                            borderColor = 'rgba(245, 158, 11, 0.55)';
                            bgGrad = 'linear-gradient(135deg, #2b1804 0%, #0f172a 100%)';
                            badgeText = 'Önemli Duyuru';
                        } else if (renk === 'purple' || renk === 'mor' || renk === 'violet') {
                            itemEmoji = '✨';
                            themeColor = '#a855f7';
                            borderColor = 'rgba(168, 85, 247, 0.55)';
                            bgGrad = 'linear-gradient(135deg, #230b3b 0%, #0f172a 100%)';
                            badgeText = 'Özel Etkinlik';
                        } else {
                            itemEmoji = '📢';
                            themeColor = '#3b82f6';
                            borderColor = 'rgba(59, 130, 246, 0.5)';
                            bgGrad = 'linear-gradient(135deg, #0c2340 0%, #0f172a 100%)';
                            badgeText = 'Genel Duyuru';
                        }

                        const itemBaslik = escapeHtml(item.baslik || 'Duyuru');
                        // Sınav kartları hazır HTML üretir; kullanıcı duyuruları escape edilip
                        // satır sonları <br>'a çevrilir.
                        const hamIcerik = item.icerik || item.metin || 'İçerik detayı bulunmuyor.';
                        const itemIcerik = item.icerikHtml
                            ? hamIcerik
                            : escapeHtml(hamIcerik).replace(/\n/g, '<br>');

                        gridHtml += `
                            <div class="duyuru-accordion-card active" onclick="toggleDuyuruAccordion(this)" style="background: ${bgGrad}; border: 1.5px solid ${borderColor}; border-left: 5px solid ${themeColor}; border-radius: 14px; padding: 12px 14px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 8px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
                                <div class="duyuru-acc-header" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                                        <div style="background: ${themeColor}22; color: ${themeColor}; border: 1px solid ${themeColor}50; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 2px 8px ${themeColor}30;">
                                            ${itemEmoji}
                                        </div>
                                        <div style="display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 3px;">
                                            <span style="font-weight: 900; font-size: 1.05rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Outfit', sans-serif; letter-spacing: 0.3px;">${itemBaslik}</span>
                                            <div>
                                                <span style="font-size: 0.76rem; font-weight: 800; color: ${themeColor}; background: ${themeColor}22; border: 1px solid ${themeColor}45; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                                                    ${itemEmoji} ${badgeText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="acc-arrow-box" style="background: rgba(255,255,255,0.08); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <i class="fa-solid fa-chevron-down acc-arrow" style="font-size: 0.82rem; color: #94a3b8; transition: transform 0.3s ease; transform: rotate(180deg);"></i>
                                    </div>
                                </div>
                                <div class="duyuru-acc-body" style="margin-top: 10px; padding-top: 10px; border-top: 1.5px dashed ${themeColor}40; font-size: 0.88rem; color: #e2e8f0; line-height: 1.45; flex: 1; font-weight: 500;">
                                    ${itemIcerik}
                                </div>
                            </div>
                        `;
                    });

                    gridHtml += '</div>';
                    duyuruGrid.innerHTML = gridHtml;
                } else {
                    duyuruGrid.innerHTML = `
                        <div class="duyuru-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; text-align: center;">
                            <div style="font-size: 2.2rem; margin-bottom: 8px;">📢</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #334155;">Aktif Duyuru Bulunmuyor</div>
                            <div style="font-size: 0.85rem; color: #64748b; margin-top: 2px;">Güncel duyuru veya ilan girildiğinde burada listelenecektir.</div>
                        </div>
                    `;
                }
            }
        }
    }

    window.toggleDuyuruAccordion = function (cardEl) {
        if (!cardEl || window.innerWidth > 991) return;
        const body = cardEl.querySelector('.duyuru-acc-body');
        const arrow = cardEl.querySelector('.acc-arrow');
        if (!body) return;

        const isOpen = body.style.display === 'block';
        if (isOpen) {
            body.style.display = 'none';
            cardEl.classList.remove('active');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        } else {
            body.style.display = 'block';
            cardEl.classList.add('active');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
    };

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

    /**
     * Karuseli DOM'a basar. (MEB haberleri ve videolarla birlikte çağrılır)
     */
    async function renderCarousel() {
        if (!panoData) return;
        els.carousel.innerHTML = '';
        currentSlide = 0;

        let allSlides = [];

        // 1. Karusel Videolarını Dahil Et
        const aktifVideolar = (Array.isArray(panoData.karuselVideolar) ? panoData.karuselVideolar : [])
            .filter(v => v.aktif !== false)
            .map(v => ({
                tip: v.tur === 'youtube' ? 'video-youtube' : 'video-mp4',
                baslik: v.baslik || '',
                url: v.url || '',
                mediaId: v.mediaId || null,
                youtubeId: v.youtubeId || (v.tur === 'youtube' ? parseYouTubeId(v.url) : null),
                sure: parseInt(v.sure, 10) || 30,
                otomatikGec: v.otomatikGec !== false,
                sesli: v.sesli === true,
                altyaziKapat: v.altyaziKapat !== false,
                dongu: v.dongu === true
            }));

        // 2. MEB Haberleri veya Fotoğraflar veya Duyurular
        let haberSlaytlari = [];
        if (panoData.mebHaberler && panoData.mebHaberler.length > 0) {
            haberSlaytlari = [...panoData.mebHaberler];
        } else if (panoData.fotograflar && panoData.fotograflar.length > 0) {
            panoData.fotograflar.forEach(url => {
                if (url.trim() !== '') haberSlaytlari.push({ tip: 'foto', gorsel: url });
            });
        } else {
            haberSlaytlari = [...(panoData.duyurular || [])];
        }

        allSlides = [...aktifVideolar, ...haberSlaytlari];

        if (allSlides.length === 0) {
            els.carousel.innerHTML = `
                <div class="carousel-slide active" style="text-align: center;">
                    <h2>📢</h2>
                    <p>Yayınlanacak haber veya duyuru bulunmuyor.</p>
                </div>
            `;
            return;
        }

        for (let index = 0; index < allSlides.length; index++) {
            const duyuru = allSlides[index];
            const slide = document.createElement('div');
            slide.className = 'carousel-slide' + (index === 0 ? ' active' : '');

            if (duyuru.tip === 'video-youtube' && duyuru.youtubeId) {
                slide.classList.add('video-slide');
                const muteParam = duyuru.sesli ? '0' : '1';
                const ccParam = duyuru.altyaziKapat !== false ? '&cc_load_policy=0&iv_load_policy=3' : '';
                const loopParam = duyuru.dongu ? `&loop=1&playlist=${escapeHtml(duyuru.youtubeId)}` : '&loop=0';
                slide.innerHTML = `
                    <iframe class="carousel-youtube" 
                        data-yt-id="${escapeHtml(duyuru.youtubeId)}"
                        data-duration="${duyuru.sure || 30}"
                        data-auto-end="${duyuru.otomatikGec}"
                        data-loop="${duyuru.dongu ? 'true' : 'false'}"
                        src="https://www.youtube-nocookie.com/embed/${escapeHtml(duyuru.youtubeId)}?autoplay=1&mute=${muteParam}&controls=0${loopParam}&rel=0&playsinline=1&enablejsapi=1${ccParam}" 
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen></iframe>
                `;
            } else if (duyuru.tip === 'video-mp4') {
                slide.classList.add('video-slide');
                const mutedAttr = duyuru.sesli ? '' : 'muted';
                const loopAttr = duyuru.dongu ? 'loop' : '';
                let videoSrc = duyuru.url || '';

                if (duyuru.mediaId && window.SeyirAudioStore) {
                    try {
                        const rec = await window.SeyirAudioStore.getAudio(duyuru.mediaId);
                        if (rec && rec.blob) {
                            videoSrc = URL.createObjectURL(rec.blob);
                        }
                    } catch (e) {}
                }

                slide.innerHTML = `
                    <video class="carousel-video" 
                        data-duration="${duyuru.sure || 30}"
                        data-auto-end="${duyuru.otomatikGec}"
                        data-loop="${duyuru.dongu ? 'true' : 'false'}"
                        src="${escapeHtml(videoSrc)}" 
                        ${mutedAttr} ${loopAttr} playsinline preload="auto"></video>
                `;
            } else {
                const haberGorseli = haberGorselAdresi(duyuru);
                if ((duyuru.tip === 'foto' || duyuru.tip === 'foto-haber' || duyuru.tip === 'slider') && haberGorseli) {
                    slide.classList.add('photo-slide');
                    const guvenliGorsel = haberGorseli.replace(/['"\\)]/g, '');
                    slide.style.backgroundImage = `url('${guvenliGorsel}')`;
                    slide.style.backgroundSize = 'contain';
                    slide.style.backgroundPosition = 'center center';
                    slide.style.backgroundRepeat = 'no-repeat';
                    slide.style.backgroundColor = '#0f172a';

                    const gorselKontrol = new Image();
                    gorselKontrol.onerror = () => {
                        slide.style.backgroundImage = 'linear-gradient(135deg, #0f172a, #1e293b)';
                    };
                    gorselKontrol.src = guvenliGorsel;

                    const baslikMetni = duyuru.baslik || '';
                    slide.innerHTML = baslikMetni ? `
                        <div style="
                            box-sizing: border-box;
                            position: absolute;
                            bottom: 0; left: 0;
                            width: 100%;
                            padding: 80px 60px 30px 60px;
                            background: linear-gradient(transparent, rgba(0,0,0,0.85));
                            text-align: center;
                            color: white;
                            z-index: 3;
                        ">
                            <h3 style="
                                white-space: normal;
                                word-break: break-word;
                                margin: 0;
                                font-size: clamp(1.5rem, 2.5vw, 2.8rem);
                                font-family: 'Outfit', sans-serif;
                                text-shadow: 2px 2px 12px rgba(0,0,0,1);
                                line-height: 1.4;
                                font-weight: 700;
                                letter-spacing: 0.01em;
                            ">${escapeHtml(baslikMetni)}</h3>
                        </div>
                    ` : '';
                } else {
                    slide.innerHTML = `
                        <div class="slide-badge ${escapeHtml(duyuru.renk || 'primary')}">${escapeHtml(duyuru.tarih || '')}</div>
                        <h2>${escapeHtml(duyuru.baslik || '')}</h2>
                        <p>${escapeHtml(duyuru.icerik || '').replace(/\n/g, '<br>')}</p>
                    `;
                }
            }
            els.carousel.appendChild(slide);
        }

        // Karusel slayt zamanlayıcısını başlat veya yenile
        if (typeof scheduleNextSlide === 'function') {
            scheduleNextSlide();
        }
    }



    /**
     * Saat, Tarih ve Header Bilgilerini Güncelleyici
     */
    function updateClock() {
        const d = new Date();
        updateStatus(d);
        checkSchoolBellTrigger(d.getHours(), d.getMinutes(), d.getSeconds());

        // Header sağ üst canlı saat ve tarih
        const timeEl = document.getElementById('header-live-time');
        const dateEl = document.getElementById('header-live-date');
        if (timeEl) {
            timeEl.textContent = d.toLocaleTimeString('tr-TR');
        }
        if (dateEl) {
            const options = { day: 'numeric', month: 'long', weekday: 'long' };
            dateEl.textContent = d.toLocaleDateString('tr-TR', options);
        }

        if (globalNamazTimes) {
            updateNamazUI();
        }

        checkScreensaverState(d);
    }

    // -------------------------------------------------------------
    // 📺 3.3 — EKRAN KORUYUCU & GÜÇ TASARRUFU (KIOSK SLEEP MODE)
    // -------------------------------------------------------------
    let screensaverActive = false;
    let screensaverTestForced = false;
    let screensaverWakeGraceUntil = 0; // ms zaman damgası
    let lastUserInteractionTime = Date.now();

    function registerScreensaverUserActivity() {
        lastUserInteractionTime = Date.now();
        if (screensaverActive) {
            // Ekrana dokunulduğunda veya fare hareketinde 3 dakika geçici uyanıklık tanı
            screensaverWakeGraceUntil = Date.now() + (3 * 60 * 1000);
            hideScreensaver();
        }
    }

    function parseClockToMinutes(str) {
        if (!str || typeof str !== 'string') return null;
        const p = str.split(':');
        if (p.length < 2) return null;
        const h = parseInt(p[0], 10);
        const m = parseInt(p[1], 10);
        if (isNaN(h) || isNaN(m)) return null;
        return h * 60 + m;
    }

    function checkScreensaverState(d) {
        const scEl = document.getElementById('pano-screensaver');
        if (!scEl) return;

        const cfg = (panoData && panoData.ayarlar && panoData.ayarlar.ekranKoruyucu) || {
            aktif: true,
            baslangic: "17:30",
            bitis: "07:30",
            haftasonu: true,
            bostaKalmaDk: 30
        };

        const nowMs = Date.now();

        // 1. Canlı test tetiklenmişse doğrudan göster
        if (screensaverTestForced) {
            showScreensaver(d);
            return;
        }

        // 2. Özellik kapatılmışsa panoyu uyutma
        if (cfg.aktif === false) {
            if (screensaverActive) hideScreensaver();
            return;
        }

        // 3. Kullanıcı dokunup uyandırdıysa geçici uyanma süresi dolana dek uykuya dönme
        if (nowMs < screensaverWakeGraceUntil) {
            if (screensaverActive) hideScreensaver();
            return;
        }

        let shouldSleep = false;
        const day = d.getDay(); // 0: Pazar, 6: Cumartesi
        const isWeekend = (day === 0 || day === 6);

        // A) Hafta sonu tam gün uyku kontrolü
        if (cfg.haftasonu && isWeekend) {
            shouldSleep = true;
        }

        // B) Mesai saatleri dışı uyku kontrolü (Gece yarısı geçişini tam destekler)
        if (!shouldSleep) {
            const startMins = parseClockToMinutes(cfg.baslangic || "17:30");
            const endMins = parseClockToMinutes(cfg.bitis || "07:30");
            if (startMins !== null && endMins !== null) {
                const curMins = d.getHours() * 60 + d.getMinutes();
                const inRange = (startMins <= endMins)
                    ? (curMins >= startMins && curMins < endMins)
                    : (curMins >= startMins || curMins < endMins);
                if (inRange) {
                    shouldSleep = true;
                }
            }
        }

        // C) Boşta kalma (hareketsizlik) süresi kontrolü
        if (!shouldSleep) {
            const idleMin = parseInt(cfg.bostaKalmaDk, 10);
            if (idleMin > 0) {
                const idleElapsedMs = nowMs - lastUserInteractionTime;
                if (idleElapsedMs >= idleMin * 60 * 1000) {
                    shouldSleep = true;
                }
            }
        }

        if (shouldSleep) {
            showScreensaver(d);
        } else if (screensaverActive) {
            hideScreensaver();
        }
    }

    function showScreensaver(d) {
        const scEl = document.getElementById('pano-screensaver');
        if (!scEl) return;

        if (!screensaverActive) {
            scEl.classList.add('active');
            scEl.setAttribute('aria-hidden', 'false');
            screensaverActive = true;
        }

        // Canlı Saat ve Tarih
        const timeEl = document.getElementById('screensaver-time');
        const dateEl = document.getElementById('screensaver-date');
        if (timeEl) timeEl.textContent = d.toLocaleTimeString('tr-TR');
        if (dateEl) {
            dateEl.textContent = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }

        // Okul Adı & Logo
        const nameEl = document.getElementById('screensaver-school-name');
        const logoEl = document.getElementById('screensaver-logo');
        if (nameEl && panoData && panoData.okulAdi) {
            const tamAd = panoData.okulAdi + (panoData.okulTuru ? (' ' + panoData.okulTuru) : '');
            if (nameEl.textContent !== tamAd) nameEl.textContent = tamAd;
        }
        if (logoEl && panoData && panoData.okulLogo) {
            if (logoEl.getAttribute('src') !== panoData.okulLogo) {
                logoEl.src = panoData.okulLogo;
            }
        }

        // Canlı Hava Durumu
        const wIconEl = document.getElementById('screensaver-weather-icon');
        const wTextEl = document.getElementById('screensaver-weather-text');
        const headerWIcon = document.getElementById('header-weather-icon');
        const headerWTemp = document.getElementById('header-weather-temp');
        const headerWDesc = document.getElementById('header-weather-desc');
        if (wTextEl && headerWTemp) {
            const tempVal = headerWTemp.textContent.trim();
            const descVal = headerWDesc ? headerWDesc.textContent.trim() : '';
            wTextEl.textContent = `${tempVal} · ${descVal}`;
        }
        if (wIconEl && headerWIcon) {
            wIconEl.textContent = headerWIcon.textContent.trim() || '🌤️';
        }

        // Canlı Namaz Vakti & Geri Sayım
        const nTextEl = document.getElementById('screensaver-namaz-text');
        const elAdi = document.getElementById('namaz-vakit-adi');
        const elSaat = document.getElementById('namaz-vakit-saat');
        const elKalan = document.getElementById('namaz-kalan-sure');
        if (nTextEl) {
            if (elAdi && elKalan && elKalan.textContent.trim()) {
                nTextEl.textContent = `${elAdi.textContent.trim()} Vaktine: ${elKalan.textContent.trim()}`;
            } else if (elAdi && elSaat) {
                nTextEl.textContent = `${elAdi.textContent.trim()}: ${elSaat.textContent.trim()}`;
            } else {
                nTextEl.textContent = 'Vakit Bilgisi Aktif';
            }
        }
    }

    function hideScreensaver() {
        const scEl = document.getElementById('pano-screensaver');
        if (scEl) {
            scEl.classList.remove('active');
            scEl.setAttribute('aria-hidden', 'true');
        }
        screensaverActive = false;
        screensaverTestForced = false;
    }

    /**
     * Web Audio API ile Klasik 3 Notalı Okul Zili Ses Efekti (E5 - G#5 - B5)
     */
    let audioCtx = null;
    let lastTriggeredBellTime = '';

    function playSchoolBellSound() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;
            const notes = [
                { f: 659.25, start: 0.0, duration: 0.5 },
                { f: 830.61, start: 0.45, duration: 0.5 },
                { f: 987.77, start: 0.9, duration: 0.8 }
            ];

            notes.forEach(n => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(n.f, now + n.start);

                gain.gain.setValueAtTime(0, now + n.start);
                gain.gain.linearRampToValueAtTime(0.3, now + n.start + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + n.start);
                osc.stop(now + n.start + n.duration);
            });
        } catch (e) {
            console.error("Zil sesi oynatılamadı:", e);
        }
    }

    function triggerSchoolBellAnons(anonsData) {
        const overlay = document.getElementById('bell-anons-overlay');
        const card = document.getElementById('bell-anons-card');
        const titleEl = document.getElementById('bell-anons-title');
        const subEl = document.getElementById('bell-anons-sub');

        if (!overlay || !card || !titleEl || !subEl) return;

        titleEl.textContent = anonsData.title;
        subEl.textContent = anonsData.sub;

        card.className = 'bell-anons-card ' + (anonsData.type || '');
        overlay.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 8000);
    }

    function checkSchoolBellTrigger(hour, min, sec) {
        if (sec !== 0) return;

        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const bellTimes = {
            "09:00": { title: "🔔 1. DERS BAŞLADI!", sub: "Tüm öğrencilerimize başarılı bir ders dileriz.", type: "ders" },
            "09:40": { title: "🔔 1. TENEFFÜS!", sub: "Dinlenme vakti! Teneffüsünüz iyi geçsin.", type: "teneffus" },
            "09:50": { title: "🔔 2. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "10:30": { title: "🔔 2. TENEFFÜS!", sub: "Dinlenme vakti!", type: "teneffus" },
            "10:40": { title: "🔔 3. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "11:20": { title: "🔔 3. TENEFFÜS!", sub: "Dinlenme vakti!", type: "teneffus" },
            "11:30": { title: "🔔 4. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "12:10": { title: "🔔 TENEFFÜS!", sub: "Kısa dinlenme arası.", type: "teneffus" },
            "12:15": { title: "🔔 5. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "12:55": { title: "🍽 ÖĞLE ARASI!", sub: "Afiyet olsun! Yemekhane ve serbest zaman.", type: "teneffus" },
            "13:40": { title: "🔔 6. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "14:20": { title: "🔔 TENEFFÜS!", sub: "Dinlenme vakti!", type: "teneffus" },
            "14:25": { title: "🔔 7. DERS BAŞLADI!", sub: "İyi dersler dileriz.", type: "ders" },
            "15:05": { title: "🔔 TENEFFÜS!", sub: "Son ders öncesi dinlenme vakti.", type: "teneffus" },
            "15:10": { title: "🔔 8. DERS BAŞLADI!", sub: "Son ders! İyi dersler dileriz.", type: "ders" },
            "15:50": { title: "🔔 DERSLER BİTTİ!", sub: "Bugünkü dersler tamamlandı. İyi akşamlar dileriz!", type: "cikis" }
        };

        if (bellTimes[timeStr]) {
            lastTriggeredBellTime = timeStr;
            triggerSchoolBellAnons(bellTimes[timeStr]);
        }
    }

    /**
     * Yapılandırılan okul konumunun hava durumunu çek (Open-Meteo API)
     */
    async function fetchSchoolWeather() {
        try {
            const konum = Object.assign({ sehir: '', ilce: '', enlem: null, boylam: null }, (panoData && panoData.konum) || {});
            // Eğer koordinatlar eksikse ancak şehir/ilçe adı varsa SeyirKonum ile koordinatları otomatik çöz
            if ((konum.enlem === null || konum.boylam === null || konum.enlem === '' || konum.boylam === '') && konum.sehir && typeof SeyirKonum !== 'undefined') {
                const eslesen = SeyirKonum.koordinatGetir(konum.sehir, konum.ilce);
                if (eslesen) {
                    konum.enlem = eslesen.enlem;
                    konum.boylam = eslesen.boylam;
                    if (eslesen.ilce && !konum.ilce) konum.ilce = eslesen.ilce;
                }
            }
            if (konum.enlem === null || konum.boylam === null || konum.enlem === '' || konum.boylam === '') return;
            const hamEnlem = Number(konum.enlem);
            const hamBoylam = Number(konum.boylam);
            if (!Number.isFinite(hamEnlem) || hamEnlem < -90 || hamEnlem > 90 || !Number.isFinite(hamBoylam) || hamBoylam < -180 || hamBoylam > 180) return;
            const enlem = hamEnlem;
            const boylam = hamBoylam;
            const tempEl = document.getElementById('header-weather-temp');
            const descEl = document.getElementById('header-weather-desc');
            const ilceAdi = (konum.ilce && typeof konum.ilce === 'string') ? konum.ilce.trim() : '';
            const sehirAdi = (konum.sehir && typeof konum.sehir === 'string') ? konum.sehir.trim() : '';
            const konumBaslik = ilceAdi || sehirAdi || 'Okul Konumu';

            if (tempEl) {
                tempEl.textContent = `--°C ${konumBaslik}`;
            }

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(enlem)}&longitude=${encodeURIComponent(boylam)}&current_weather=true`);
            if (!res.ok) return;
            const json = await res.json();
            if (json && json.current_weather) {
                const temp = Math.round(json.current_weather.temperature);
                const code = json.current_weather.weathercode;

                if (tempEl) tempEl.textContent = `${temp}°C ${konumBaslik}`;

                let desc = 'Açık & Güneşli';
                let emoji = '☀️';

                if (code === 0) { desc = 'Açık & Güneşli'; emoji = '☀️'; }
                else if (code === 1 || code === 2) { desc = 'Parçalı Bulutlu'; emoji = '⛅'; }
                else if (code === 3) { desc = 'Çok Bulutlu / Kapalı'; emoji = '☁️'; }
                else if (code >= 45 && code <= 48) { desc = 'Sisli'; emoji = '🌫️'; }
                else if (code >= 51 && code <= 67) { desc = 'Yağmurlu'; emoji = '🌧️'; }
                else if (code >= 71 && code <= 77) { desc = 'Kar Yağışlı'; emoji = '🌨️'; }
                else if (code >= 80 && code <= 82) { desc = 'Sağanak Yağışlı'; emoji = '🌧️'; }
                else if (code === 85 || code === 86) { desc = 'Kar Sağanağı'; emoji = '🌨️'; }
                else if (code >= 95) { desc = 'Gök Gürültülü Fırtına'; emoji = '⛈️'; }

                if (descEl) descEl.textContent = desc;
                if (iconEl) iconEl.textContent = emoji;
            }
        } catch (e) {
            console.error("Hava durumu çekilemedi:", e);
        }
    }

    /**
     * Header Sağ Üst Kartlarını (Saat ve Hava Durumu) Dönüşümlü Değiştir
     */
    function startHeaderFlipper() {
        const cardClock = document.getElementById('header-card-clock');
        const cardWeather = document.getElementById('header-card-weather');
        if (!cardClock || !cardWeather) return;

        setInterval(() => {
            if (cardClock.classList.contains('active')) {
                cardClock.classList.remove('active');
                cardWeather.classList.add('active');
            } else {
                cardWeather.classList.remove('active');
                cardClock.classList.add('active');
            }
        }, 7000);
    }

    let lastVakitIndex = -1;
    let namazVeriGunu = null;      // Vakitlerin hangi güne ait olduğunu tutar
    let namazSonYenileme = 0;      // Art arda istek atmamak için son yenileme zamanı

    /**
     * Aladhan API saatleri "05:47 (+03)" biçiminde gelebilir.
     * Kart üzerinde ve hesaplamada kullanmak için "HH:MM"e indirger.
     */
    function normalizeVakitSaati(ham) {
        const eslesme = String(ham || '').match(/(\d{1,2}):(\d{2})/);
        if (!eslesme) return null;
        const saat = parseInt(eslesme[1], 10);
        const dakika = parseInt(eslesme[2], 10);
        if (isNaN(saat) || isNaN(dakika) || saat > 23 || dakika > 59) return null;
        return String(saat).padStart(2, '0') + ':' + String(dakika).padStart(2, '0');
    }

    /**
     * Madde 2.2 — Vakit girdiğinde veya gün değiştiğinde vakitleri tazeler.
     * Dakikada en fazla bir kez istek atar (geri sayım saniyede bir çalıştığı için).
     */
    function tetikleNamazYenileme(sebep) {
        const simdi = Date.now();
        if (simdi - namazSonYenileme < 60000) return;
        namazSonYenileme = simdi;
        console.info('[Seyir] Namaz vakitleri yenileniyor →', sebep);
        fetchNamazVakitleri();
    }

    /**
     * Sol Paneli RENDER Et (Vaktin Namazı, Vaktin Ayeti, Vaktin Hadisi, Vaktin Duası)
     */
    function renderDiniIcerik(vakitIndex) {
        const diniIcerikContainer = document.getElementById('dini-icerik-wrapper');
        if (!diniIcerikContainer) return;

        // Madde 4.4 — İçerik seçimi.
        // Eski hâlde indeks "(vIdx * 3 + gün % 3) % 15" idi; sabit % 15 nedeniyle
        // havuz 15'ten büyük olsa bile fazlası HİÇ gösterilmiyor, gün döngüsü de
        // yalnızca 3 gün sürüyordu. Artık tohum yılın gününe dayanır ve havuzun
        // tamamı sırayla kullanılır.
        const vIdx = (typeof vakitIndex === 'number' && vakitIndex >= 0) ? vakitIndex : 0;
        const simdi = new Date();
        const yilBasi = new Date(simdi.getFullYear(), 0, 0);
        const yilinGunu = Math.floor((simdi - yilBasi) / 86400000);
        const vakitSayisi = (globalNamazTimes && globalNamazTimes.length) ? globalNamazTimes.length : 6;
        const tohum = yilinGunu * vakitSayisi + vIdx;

        /** Havuzdan sırayla seçer; her tür farklı bir kaydırma ile başlar. */
        const havuzdanSec = (dizi, kaydirma) =>
            (dizi && dizi.length) ? dizi[(tohum + kaydirma) % dizi.length] : null;

        let ayet = null, hadis = null, dua = null;
        if (panoData && panoData.diniIcerik) {
            const kisaAyetler = (panoData.diniIcerik.ayetler || []).filter(a => a.ar && a.ar.length <= 45);
            const kisaHadisler = (panoData.diniIcerik.hadisler || []).filter(h => h.t && h.t.length <= 150);
            const kisaDualar = (panoData.diniIcerik.dualar || []).filter(d => d.t && d.t.length <= 150);

            const ayetler = kisaAyetler.length > 0 ? kisaAyetler : (panoData.diniIcerik.ayetler || []);
            const hadisler = kisaHadisler.length > 0 ? kisaHadisler : (panoData.diniIcerik.hadisler || []);
            const dualar = kisaDualar.length > 0 ? kisaDualar : (panoData.diniIcerik.dualar || []);

            ayet = havuzdanSec(ayetler, 0);
            hadis = havuzdanSec(hadisler, 1);
            dua = havuzdanSec(dualar, 2);
        }

        let html = `
            <!-- VAKTİN NAMAZI KARTI (5 Saniyede Bir Dönüşen Yüzler) -->
            <div class="dini-card namaz-card" style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
                <div id="namaz-card-view1" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
                    <div class="dini-type" id="namaz-vakit-tipi" style="width: 100%; text-align: left;">🕌 Vaktin Namazı</div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; width: 100%;">
                        <span class="vakit-adi" id="namaz-vakit-adi" style="font-size: 1.35rem; font-weight: 800; color: #e9d5ff;">...</span>
                        <span class="vakit-saat" id="namaz-vakit-saat" style="font-size: 2.0rem; font-weight: 900; color: #ffffff;">...</span>
                    </div>
                </div>
                <div id="namaz-card-view2" style="display: none; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
                    <div class="dini-type" id="namaz-kalan-etiket" style="color: #c084fc; width: 100%; text-align: left;">⏳ Vaktin Çıkmasına</div>
                    <div style="display: flex; align-items: center; justify-content: center; margin-top: 4px; width: 100%;">
                        <span class="vakit-saat" id="namaz-kalan-sure" style="font-size: 2.1rem; font-weight: 900; color: #ffffff; letter-spacing: 1px; font-family: 'Outfit', monospace;">--:--:--</span>
                    </div>
                </div>
            </div>
        `;

        if (ayet) {
            html += `
                <div class="dini-card ayet-card">
                    <div class="dini-type">📖 Vaktin Ayeti</div>
                    <div class="dini-ar">${escapeHtml(ayet.ar || '')}</div>
                    <div class="dini-tr">"${escapeHtml(ayet.t)}"</div>
                    <div class="dini-src">- ${escapeHtml(ayet.s)}</div>
                </div>
            `;
        }
        if (hadis) {
            html += `
                <div class="dini-card hadis-card">
                    <div class="dini-type">💬 Vaktin Hadisi</div>

                    <div class="dini-tr">"${escapeHtml(hadis.t)}"</div>
                    <div class="dini-src">- ${escapeHtml(hadis.s)}</div>
                </div>
            `;
        }
        if (dua) {
            html += `
                <div class="dini-card dua-card">
                    <div class="dini-type">🤲 Vaktin Duası</div>

                    <div class="dini-tr">"${escapeHtml(dua.t)}"</div>
                    <div class="dini-src">- ${escapeHtml(dua.s)}</div>
                </div>
            `;
        }

        diniIcerikContainer.innerHTML = html;
    }

    function updateNamazUI() {
        if (!globalNamazTimes || globalNamazTimes.length === 0) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let currentVakitIndex = globalNamazTimes.length - 1;
        let currentVakit = globalNamazTimes[currentVakitIndex];
        let nextVakit = globalNamazTimes[0];

        for (let i = 0; i < globalNamazTimes.length; i++) {
            const parts = globalNamazTimes[i].time.split(':');
            const vakitMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            if (currentMinutes >= vakitMins) {
                currentVakitIndex = i;
                currentVakit = globalNamazTimes[i];
                nextVakit = globalNamazTimes[(i + 1) % globalNamazTimes.length];
            } else {
                break;
            }
        }

        // Namaz vakti değişiminde sol paneli (Vaktin Ayeti, Vaktin Hadisi, Vaktin Duası) yenile
        if (lastVakitIndex !== currentVakitIndex) {
            const ilkCizim = (lastVakitIndex === -1);
            lastVakitIndex = currentVakitIndex;
            renderDiniIcerik(currentVakitIndex);

            // Madde 2.2 — Yeni vakte geçildiğinde vakitleri API'den tazele.
            // Geri sayım 00:00:01'den doğrudan yeni vakte atladığı için sıfır anı
            // yakalanamaz; gerçek geçiş sinyali vakit indeksinin değişmesidir.
            // İlk çizimde tetiklenmez (başlangıçta zaten fetchNamazVakitleri çalışır).
            if (!ilkCizim) {
                tetikleNamazYenileme('vakit girdi: ' + currentVakit.name);
            }
        }

        // Calculate remaining time to next vakit
        const nextParts = nextVakit.time.split(':');
        let nextMins = parseInt(nextParts[0]) * 60 + parseInt(nextParts[1]);
        const nowTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // Gece yarısı geçişi: sonraki vakit bugünkü dakikadan küçükse ertesi güne ait
        if (nextMins <= currentMinutes) {
            nextMins += 24 * 60;
        }
        let remainingTotalSeconds = (nextMins * 60) - nowTotalSecs;

        // Negatif saniye koruması (gece yarısı geçişi edge-case)
        if (remainingTotalSeconds < 0) {
            remainingTotalSeconds += 24 * 3600;
        }

        // Negatif/sıfır koruması (yenileme tetiği vakit geçişinde yapılır)
        if (remainingTotalSeconds <= 0) {
            remainingTotalSeconds = 0;
        }

        // Gece yarısı geçişi: eldeki vakitler düne aitse yeni günün vakitlerini çek
        const bugunAnahtari = now.toDateString();
        if (namazVeriGunu && namazVeriGunu !== bugunAnahtari) {
            tetikleNamazYenileme('gün değişti');
        }

        const h = Math.floor(remainingTotalSeconds / 3600);
        const m = Math.floor((remainingTotalSeconds % 3600) / 60);
        const s = remainingTotalSeconds % 60;
        const remainingStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        const view1 = document.getElementById('namaz-card-view1');
        const view2 = document.getElementById('namaz-card-view2');
        const elTip = document.getElementById('namaz-vakit-tipi');
        const elAdi = document.getElementById('namaz-vakit-adi');
        const elSaat = document.getElementById('namaz-vakit-saat');
        const elKalan = document.getElementById('namaz-kalan-sure');
        const elKalanEtiket = document.getElementById('namaz-kalan-etiket');

        if (!view1 || !view2) {
            renderDiniIcerik(lastVakitIndex >= 0 ? lastVakitIndex : 0);
            return;
        }

        let gosterimAdi = currentVakit.name;
        if (currentVakit.name === 'İmsak') {
            gosterimAdi = 'Sabah (İmsak)';
            if (elTip) elTip.textContent = '🕌 Vaktin Namazı';
        } else if (currentVakit.name === 'Güneş') {
            gosterimAdi = 'Güneş';
            if (elTip) elTip.textContent = '🕌 Güncel Vakit (Kuşluk)';
        } else {
            if (elTip) elTip.textContent = '🕌 Vaktin Namazı';
        }

        if (elKalanEtiket) {
            if (currentVakit.name === 'İmsak' || nextVakit.name === 'Güneş') {
                elKalanEtiket.textContent = '⏳ Güneş Doğuşuna:';
            } else {
                elKalanEtiket.textContent = `⏳ ${nextVakit.name} Vaktine:`;
            }
        }

        if (elAdi) elAdi.textContent = gosterimAdi + ':';
        if (elSaat) elSaat.textContent = currentVakit.time;
        if (elKalan) elKalan.textContent = remainingStr;

        // 5 saniyede bir kartlar arasında otomatik dönüşüm
        if (namazViewToggle === 0) {
            view1.style.display = 'flex';
            view2.style.display = 'none';
        } else {
            view1.style.display = 'none';
            view2.style.display = 'flex';
        }
    }

    /**
     * Ders / Teneffüs Durumunu Günceller
     */

    function calculateStatus(program, now) {
        if (!program || program.length === 0) return null;
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTime = currentHour * 60 + currentMin;
        const currentSec = now.getSeconds();

        let activeEvent = null;
        let nextEvent = null;

        for (let i = 0; i < program.length; i++) {
            const ders = program[i];
            const times = ders.saat.split('-');
            if (times.length !== 2) continue;

            const startParts = times[0].trim().split(':');
            const endParts = times[1].trim().split(':');

            const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

            if (currentTime >= startMins && currentTime < endMins) {
                activeEvent = { name: ders.ders, endTime: endMins, index: i };
                break;
            } else if (currentTime < startMins) {
                if (!nextEvent) {
                    nextEvent = {
                        name: ders.ders,
                        startTime: startMins,
                        index: i,
                        prevEndTime: i > 0 ? (
                            parseInt(program[i - 1].saat.split('-')[1].trim().split(':')[0]) * 60 +
                            parseInt(program[i - 1].saat.split('-')[1].trim().split(':')[1])
                        ) : null
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
                icon: '📖',
                index: activeEvent.index
            };
        } else if (nextEvent) {
            const minsLeft = nextEvent.startTime - currentTime - 1;
            const secsLeft = 59 - currentSec;
            if (nextEvent.prevEndTime && currentTime >= nextEvent.prevEndTime) {
                return {
                    text: 'Teneffüs',
                    timer: `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`,
                    icon: '☕',
                    index: nextEvent.index
                };
            } else {
                return {
                    text: 'Başlamadı',
                    timer: `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`,
                    icon: '⏰',
                    index: nextEvent.index
                };
            }
        } else {
            return { text: 'Bitti', timer: '--:--', icon: '🏠', index: -1 };
        }
    }

    function formatDersPanoTV(ad) {
        return String(ad || "").trim();
    }

    function panoGizlilikAyarlari() {
        return Object.assign({
            personelAdiGosterim: 'gorev',
            nobetciGoster: true,
            rehberOgretmenGoster: false,
            dersOgretmeniGoster: false
        }, (panoData && panoData.gizlilik) || {});
    }

    function panoPersonelAdiniBicimle(ad, gorev) {
        const gizlilik = panoGizlilikAyarlari();
        const temiz = String(ad || '').trim();
        if (!temiz || gizlilik.personelAdiGosterim === 'gizli') return '';
        if (gizlilik.personelAdiGosterim === 'gorev') return gorev || 'Öğretmen';
        if (gizlilik.personelAdiGosterim === 'basHarf') {
            return temiz.split(/\s+/u).filter(Boolean).map(parca => {
                const ilk = Array.from(parca)[0] || '';
                return ilk ? ilk.toLocaleUpperCase('tr-TR') + '.' : '';
            }).join(' ');
        }
        return temiz;
    }

    function updateStatus(now) {
        if (!panoData) return;

        // Backward compat
        if (Array.isArray(panoData.dersProgrami) && !panoData.dersProgramiOrtaokul) {
            panoData.dersProgramiOrtaokul = [...panoData.dersProgrami];
        }

        const statusLise = calculateStatus(panoData.dersProgramiLise, now);

        if (statusLise && statusLise.index !== undefined) {
            let index = statusLise.index;
            let gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
            let bugunAd = gunler[now.getDay()];
            let yeniAktif = [];

            let baslik = "ŞU ANKİ DERSLER";

            // Eğer Gün Bitti ise (index -1) veya Haftasonu ise bir sonraki aktif günü ve 0. dersi (ilk ders) bul
            if (index === -1 || bugunAd === "Cumartesi" || bugunAd === "Pazar") {
                index = 0;
                let nextDay = (now.getDay() + 1) % 7;
                if (nextDay === 6) nextDay = 1; // Cumartesi ise Pazartesi yap
                if (nextDay === 0) nextDay = 1; // Pazar ise Pazartesi yap
                if (now.getDay() === 5 && statusLise.index === -1) nextDay = 1; // Cuma akşamı ise Pazartesi yap
                bugunAd = gunler[nextDay];
                baslik = "İLK DERSLER (" + bugunAd.toUpperCase() + ")";
            }

            if (panoData.dersProgramiDetay) {
                for (const sinif in panoData.dersProgramiDetay) {
                    const gunluk = panoData.dersProgramiDetay[sinif][bugunAd];
                    if (gunluk && gunluk[index]) {
                        // Check if there is a Tamamlama assignment for this class and period
                        const gizlilik = panoGizlilikAyarlari();
                        const dersOgretmeni = gizlilik.dersOgretmeniGoster
                            ? panoPersonelAdiniBicimle(gunluk[index].hoca || gunluk[index].ogretmen, 'Ders Öğretmeni')
                            : '';
                        let dersText = formatDersPanoTV(gunluk[index].ders) + (dersOgretmeni ? ` (${dersOgretmeni})` : '');

                        if (panoData.tamamlamaAtamalari && panoData.tamamlamaAtamalari[bugunAd]) {
                            const tamamlama = panoData.tamamlamaAtamalari[bugunAd].find(a => a.saat === index && a.sinif === sinif);
                            if (tamamlama) {
                                const tamamlamaOgretmeni = gizlilik.dersOgretmeniGoster
                                    ? panoPersonelAdiniBicimle(tamamlama.nobetci, 'Ders Tamamlama Öğretmeni')
                                    : '';
                                dersText = formatDersPanoTV(tamamlama.dersAdi)
                                    + (tamamlamaOgretmeni ? ` (${tamamlamaOgretmeni} - Tamamlama)` : ' (Tamamlama)');
                            }
                        }

                        yeniAktif.push({
                            sinif: sinif,
                            ders: dersText
                        });
                    }
                }
            }

            yeniAktif.sort((a, b) => a.sinif.localeCompare(b.sinif, 'tr'));

            if (JSON.stringify(panoData.aktifDersler || []) !== JSON.stringify(yeniAktif)) {
                panoData.aktifDersler = yeniAktif;
                if (typeof renderAktifDerslerUI === 'function') renderAktifDerslerUI();

                // Başlığı sabit ŞU ANKİ DERSLER tut
                const baslikEl = document.getElementById('pano-dersler-baslik');
                if (baslikEl) {
                    baslikEl.innerHTML = `⏰ ŞU ANKİ DERSLER`;
                }
            }
        } else if (panoData.aktifDersler && panoData.aktifDersler.length > 0) {
            panoData.aktifDersler = [];
            if (typeof renderAktifDerslerUI === 'function') renderAktifDerslerUI();
        }

        const renderStatus = (status) => {
            const box = document.getElementById('pano-status');
            const textEl = document.getElementById('pano-status-text');
            const timerEl = document.getElementById('pano-status-timer');
            if (box && textEl && timerEl && status) {
                box.style.display = 'inline-flex';
                textEl.textContent = status.text;
                timerEl.textContent = status.timer;
                const iconEl = document.getElementById('pano-status-icon');
                if (iconEl) iconEl.textContent = status.icon;
            } else if (box) {
                box.style.display = 'none';
            }
        };

        renderStatus(statusLise);

        // Teneffüs anında nöbetçi öğretmenleri öne çıkarma ve canlı vurgulama (Madde 4)
        const isTeneffus = !!(statusLise && (statusLise.text === 'Teneffüs' || statusLise.icon === '☕'));
        applyTeneffusDutyHighlight(isTeneffus);
    }

    /**
     * Teneffüs Vaktinde Nöbetçi Öğretmen Kartlarını Canlı Vurgula ve Öne Çıkar
     */
    let lastTeneffusAutoFlipped = false;
    function applyTeneffusDutyHighlight(isTeneffus) {
        const nobetBaslikEl = document.getElementById('pano-nobet-baslik');
        if (nobetBaslikEl) {
            if (isTeneffus) {
                nobetBaslikEl.innerHTML = `🛡️ NÖBETÇİ ÖĞRETMENLER <span class="nobet-active-tag"><span class="duty-ping"></span> GÖREVDE</span>`;
            } else {
                nobetBaslikEl.innerHTML = `🛡️ NÖBETÇİ ÖĞRETMENLER`;
            }
        }

        const cards = document.querySelectorAll('#pano-nobetciler-back .nobetci-card');
        cards.forEach(card => {
            if (isTeneffus) {
                card.classList.add('is-teneffus-duty');
            } else {
                card.classList.remove('is-teneffus-duty');
            }
        });

        // Teneffüs başladığında nöbetçiler arkada kalmasın, otomatik öne dönsün
        const config = (panoData && panoData.zilYonetimi) || {};
        if (config.nobetciVurgu !== false) {
            const flipInner = document.getElementById('flip-inner');
            if (flipInner) {
                if (isTeneffus && !lastTeneffusAutoFlipped) {
                    flipInner.classList.add('is-flipped');
                    lastTeneffusAutoFlipped = true;
                } else if (!isTeneffus && lastTeneffusAutoFlipped) {
                    lastTeneffusAutoFlipped = false;
                }
            }
        }
    }


    /**
     * Sadece Açık Tema (Dark Mode İptal)
     */
    function checkAutoTheme() {
        const html = document.documentElement;
        html.setAttribute('data-theme', 'light');
    }

    let carouselSlideTimer = null;

    function stopCarouselTimer() {
        if (carouselSlideTimer) {
            clearTimeout(carouselSlideTimer);
            carouselSlideTimer = null;
        }
    }

    function advanceCarouselSlide() {
        stopCarouselTimer();
        const slides = els.carousel.querySelectorAll('.carousel-slide');
        if (slides.length <= 1) return;

        const prevSlide = slides[currentSlide];
        if (prevSlide) {
            // Önceki slayttaki MP4 videosunu durdur
            const prevVideo = prevSlide.querySelector('video.carousel-video');
            if (prevVideo) {
                try {
                    prevVideo.pause();
                    prevVideo.currentTime = 0;
                    prevVideo.onended = null;
                } catch (e) {}
            }
            // Önceki slayttaki YouTube videosunu durdur
            const prevYt = prevSlide.querySelector('iframe.carousel-youtube');
            if (prevYt && prevYt.contentWindow) {
                try {
                    prevYt.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                } catch (e) {}
            }
            prevSlide.classList.remove('active');
        }

        currentSlide = (currentSlide + 1) % slides.length;
        const nextSlide = slides[currentSlide];
        if (nextSlide) {
            nextSlide.classList.add('active');
        }

        scheduleNextSlide();
    }

    function scheduleNextSlide() {
        stopCarouselTimer();
        const slides = els.carousel.querySelectorAll('.carousel-slide');
        if (slides.length <= 1) return;

        const activeSlide = slides[currentSlide];
        if (!activeSlide) return;

        const defaultDuration = (panoData && panoData.ayarlar && panoData.ayarlar.karuselSuresi) ? panoData.ayarlar.karuselSuresi : 10000;

        // 1. MP4 Video Kontrolü
        const videoEl = activeSlide.querySelector('video.carousel-video');
        if (videoEl) {
            const isLoop = videoEl.getAttribute('data-loop') === 'true';
            const autoEnd = !isLoop && videoEl.getAttribute('data-auto-end') !== 'false';
            const maxDurationSec = parseInt(videoEl.getAttribute('data-duration'), 10) || 45;

            try {
                videoEl.currentTime = 0;
                const p = videoEl.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(err => console.warn('Pano MP4 video autoplay:', err));
                }
            } catch (e) {}

            if (autoEnd) {
                videoEl.onended = () => {
                    advanceCarouselSlide();
                };
                carouselSlideTimer = setTimeout(() => {
                    advanceCarouselSlide();
                }, (maxDurationSec + 3) * 1000);
            } else {
                videoEl.onended = null;
                carouselSlideTimer = setTimeout(() => {
                    advanceCarouselSlide();
                }, maxDurationSec * 1000);
            }
            return;
        }

        // 2. YouTube Video Kontrolü
        const ytIframe = activeSlide.querySelector('iframe.carousel-youtube');
        if (ytIframe) {
            const durationSec = parseInt(ytIframe.getAttribute('data-duration'), 10) || 35;
            if (ytIframe.contentWindow) {
                try {
                    ytIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                } catch (e) {}
            }
            carouselSlideTimer = setTimeout(() => {
                advanceCarouselSlide();
            }, durationSec * 1000);
            return;
        }

        // 3. Standart Görsel / Duyuru Slaytı
        carouselSlideTimer = setTimeout(() => {
            advanceCarouselSlide();
        }, defaultDuration);
    }

    /**
     * Tüm Animasyon ve Döngüleri Başlat
     */
    function startAnimations() {
        carouselInterval = true;

        // 1. Ana Karusel Döngüsü (Akıllı video ve slayt zamanlayıcısı)
        scheduleNextSlide();

        // 2. 3D Flip Card Döngüsü (Sağ Panel)
        const flipInner = document.getElementById('flip-inner');
        if (flipInner) {
            flipInterval = setInterval(() => {
                flipInner.classList.toggle('is-flipped');
            }, 30000); // Her 30 saniyede bir arkaya döner
        }
    }

    /**
     * Namaz Vakitlerini çek (Aladhan API)
     */
    async function fetchNamazVakitleri() {
        try {
            const konum = Object.assign({ sehir: '', ilce: '', enlem: null, boylam: null }, (panoData && panoData.konum) || {});

            // SeyirKonum ile koordinatları ve ASCII şehir/ilçe adını tamamla
            let asciiSehir = '';
            let asciiIlce = '';
            if (typeof SeyirKonum !== 'undefined' && konum.sehir) {
                const eslesen = SeyirKonum.koordinatGetir(konum.sehir, konum.ilce);
                if (eslesen) {
                    if (konum.enlem === null || konum.boylam === null || konum.enlem === '' || konum.boylam === '') {
                        konum.enlem = eslesen.enlem;
                        konum.boylam = eslesen.boylam;
                    }
                    asciiSehir = eslesen.asciiSehir;
                    asciiIlce = eslesen.asciiIlce;
                    if (eslesen.ilce && !konum.ilce) konum.ilce = eslesen.ilce;
                }
            }

            const enlem = Number(konum.enlem);
            const boylam = Number(konum.boylam);
            let apiUrl = '';

            // Koordinat varsa AlAdhan koordinat API'si (enlem/boylam ile Türkçe karakter hatası %100 önlenir)
            if (Number.isFinite(enlem) && Number.isFinite(boylam) && enlem >= -90 && enlem <= 90 && boylam >= -180 && boylam <= 180) {
                apiUrl = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(enlem)}&longitude=${encodeURIComponent(boylam)}&method=13`;
            } else if (asciiSehir || konum.sehir) {
                // Koordinat yoksa ASCII adı ile şehir bazlı sorgu
                const sorguSehir = asciiSehir || konum.sehir;
                apiUrl = 'https://api.aladhan.com/v1/timingsByCity?city=' +
                    encodeURIComponent(sorguSehir) + '&country=Turkey&method=13';
            } else {
                return;
            }

            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('API Hatası: ' + res.status);
            const json = await res.json();
            const timings = json && json.data && json.data.timings;
            if (!timings) throw new Error('Vakit verisi eksik');

            const hamVakitler = [
                { name: 'İmsak', time: timings.Imsak },
                { name: 'Güneş', time: timings.Sunrise },
                { name: 'Öğle', time: timings.Dhuhr },
                { name: 'İkindi', time: timings.Asr },
                { name: 'Akşam', time: timings.Maghrib },
                { name: 'Yatsı', time: timings.Isha }
            ];

            // API "05:47 (+03)" biçiminde dönebilir; HH:MM'e indirge.
            const temizVakitler = hamVakitler
                .map(v => ({ name: v.name, time: normalizeVakitSaati(v.time) }))
                .filter(v => v.time !== null);

            if (temizVakitler.length === hamVakitler.length) {
                globalNamazTimes = temizVakitler;
                namazVeriGunu = new Date().toDateString();
                try {
                    localStorage.setItem('seyir_cached_namaz_v1', JSON.stringify({
                        gun: namazVeriGunu,
                        konum: `${konum.sehir}/${konum.ilce}`,
                        vakitler: temizVakitler
                    }));
                } catch (e) {}
            } else {
                console.warn('Namaz vakitleri eksik/bozuk geldi, mevcut vakitler korunuyor.', timings);
            }

            updateNamazUI();
        } catch (error) {
            console.warn('Namaz vakitleri API hatası, yerel/önbellek vakitler aktif:', error);
            try {
                const rawCachedNamaz = localStorage.getItem('seyir_cached_namaz_v1');
                if (rawCachedNamaz) {
                    const parsedCached = JSON.parse(rawCachedNamaz);
                    if (parsedCached && Array.isArray(parsedCached.vakitler) && parsedCached.vakitler.length === 6) {
                        globalNamazTimes = parsedCached.vakitler;
                    }
                }
            } catch (e) {}
            updateNamazUI();
        }
    }



    /**
     * Kod Satırı Tarzı Daktilo (Typewriter) Efekti
     */
    let typewriterTimer = null;
    let typewriterKey = null;

    function initTypewriter() {
        const target = document.getElementById('pano-typewriter');
        if (!target) return;

        const phrases = (panoData && panoData.daktiloYazilari && panoData.daktiloYazilari.length > 0)
            ? panoData.daktiloYazilari
            : ["Okulun Dijital Nabzı"];

        // Aynı yazı listesiyle tekrar başlatma (periyodik veri yenilemesinde animasyon sıfırlanmasın)
        const yeniKey = phrases.join('|');
        if (typewriterKey === yeniKey && typewriterTimer !== null) return;
        typewriterKey = yeniKey;
        if (typewriterTimer) clearTimeout(typewriterTimer);

        let pIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function step() {
            const current = phrases[pIdx];

            if (!isDeleting) {
                target.textContent = current.substring(0, charIdx + 1);
                charIdx++;

                if (charIdx >= current.length) {
                    isDeleting = true;
                    typewriterTimer = setTimeout(step, 2200);
                    return;
                }
                typewriterTimer = setTimeout(step, 90);
            } else {
                target.textContent = current.substring(0, charIdx - 1);
                charIdx--;

                if (charIdx <= 0) {
                    isDeleting = false;
                    charIdx = 0;
                    pIdx = (pIdx + 1) % phrases.length;
                    typewriterTimer = setTimeout(step, 400);
                    return;
                }
                typewriterTimer = setTimeout(step, 40);
            }
        }

        step();
    }

    /**
     * Başlatma
     */
    function init() {
        fetchData();
        updateClock();
        initTypewriter();
        fetchSchoolWeather();
        startHeaderFlipper();
        setInterval(updateClock, 1000);
        setInterval(() => {
            namazViewToggle = 1 - namazViewToggle;
            updateNamazUI();
        }, 5000);
        setInterval(fetchSchoolWeather, 1800000);

        // Etkileşim dinleyicileri (Ekran koruyucu uyandırma)
        ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(evt => {
            window.addEventListener(evt, registerScreensaverUserActivity, { passive: true });
        });

        const scOverlay = document.getElementById('pano-screensaver');
        if (scOverlay) {
            scOverlay.addEventListener('click', registerScreensaverUserActivity);
        }

        // Admin paneli başka sekmede kaydettiğinde yalnızca açık pano kopyasını yenile.
        window.addEventListener('storage', (event) => {
            if (event.key === 'seyir_public_data') fetchData();
            if (event.key === 'seyir_test_screensaver') {
                screensaverTestForced = true;
                showScreensaver(new Date());
            }
        });

        // Veriyi periyodik yenileme (varsayılan 10 dakika)
        const yenilemeSuresi = 600000;
        dataInterval = setInterval(fetchData, yenilemeSuresi);
    }

    // Public API
    return {
        init: init
    };

})();

function initScaleEngine() {
    try {
        PanoTV.init();
    } catch (e) {
        console.error("PanoTV.init error:", e);
    }

    const scaleWrapper = document.getElementById('pano-scale-wrapper');
    const inner = document.getElementById('flip-inner');
    const duyuru = document.querySelector('.duyuru-grid-widget');
    const main = document.querySelector('.pano-main');

    function applyScale() {
        if (!scaleWrapper) return;

        if (window.innerWidth <= 600) {
            scaleWrapper.style.transform = 'none';
            scaleWrapper.style.position = 'relative';
            scaleWrapper.style.top = '0';
            scaleWrapper.style.left = '0';
            if (duyuru && inner && !inner.contains(duyuru)) {
                inner.appendChild(duyuru);
            }
        } else {
            scaleWrapper.style.position = 'absolute';
            scaleWrapper.style.top = '50%';
            scaleWrapper.style.left = '50%';
            const scaleX = window.innerWidth / 1920;
            const scaleY = window.innerHeight / 1080;
            const scale = Math.min(scaleX, scaleY);
            scaleWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
            if (duyuru && main && !main.contains(duyuru)) {
                main.appendChild(duyuru);
            }
        }
    }

    applyScale();
    window.addEventListener('resize', applyScale);
    window.addEventListener('orientationchange', applyScale);
    setTimeout(applyScale, 50);
    setTimeout(applyScale, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScaleEngine);
} else {
    initScaleEngine();
}

// ============================================================================
// 🔔 SEYİR PANO (AKILLI TAHTA / TV) CANLI ZİL ZAMANLAYICI MOTORU
// ============================================================================

let seyirPanoZilEngine = null;
let seyirPanoSonCalanDakika = "";
let seyirPanoSonCalanTorenDakika = "";
let seyirPanoZilInterval = null;
let seyirPanoAktifTorenAudio = null;

function initSeyirPanoZilEngine() {
    if (seyirPanoZilInterval) return; // Zaten çalışıyor

    // Web Audio Synthesizer
    class PanoZilAudioEngine {
        constructor() {
            this.ctx = null;
            this.activeOscs = [];
        }

        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            return this.ctx;
        }

        stop() {
            this.activeOscs.forEach(o => {
                try { o.stop(); o.disconnect(); } catch (e) {}
            });
            this.activeOscs = [];
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            if (window.SeyirAudioStore && typeof window.SeyirAudioStore.stopAll === 'function') {
                window.SeyirAudioStore.stopAll();
            }
        }

        playChime(freq, startTime, duration = 1.8, volume = 0.5, type = 'sine') {
            const ctx = this.initContext();
            if (!ctx) return;

            const harmonics = [
                { m: 1.0, g: 0.75, d: 1.0 },
                { m: 2.0, g: 0.25, d: 0.8 },
                { m: 3.01, g: 0.15, d: 0.6 }
            ];

            harmonics.forEach(h => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq * h.m, startTime);

                const peak = Math.max(0.0005, volume * h.g);
                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * h.d));

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + (duration * h.d) + 0.05);
                this.activeOscs.push(osc);
            });
        }

        playMelody(type, durationSeconds = 8, volumePercent = 80, customAudioId = null) {
            this.stop();

            // Yerel Özel Ses Dosyası Oynatma Kontrolü
            if (type === 'custom' || customAudioId) {
                if (window.SeyirAudioStore && typeof window.SeyirAudioStore.playAudio === 'function') {
                    window.SeyirAudioStore.playAudio(customAudioId, volumePercent).then(audioObj => {
                        if (!audioObj) {
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

            const vol = Math.min(1.0, Math.max(0.05, (volumePercent / 100) * 0.65));
            const now = ctx.currentTime + 0.05;

            if (type === 'westminster') {
                const notes = [659.25, 587.33, 523.25, 392.00];
                let offset = 0;
                const repeats = Math.max(1, Math.floor(durationSeconds / 3.2));
                for (let r = 0; r < repeats; r++) {
                    notes.forEach(f => {
                        if (offset < durationSeconds) this.playChime(f, now + offset, 1.2, vol, 'sine');
                        offset += 0.72;
                    });
                    offset += 0.4;
                }
            } else if (type === 'chime') {
                const chord = [523.25, 659.25, 783.99, 1046.50];
                let offset = 0;
                const repeats = Math.max(1, Math.floor(durationSeconds / 2.2));
                for (let r = 0; r < repeats; r++) {
                    chord.forEach(f => {
                        if (offset < durationSeconds) this.playChime(f, now + offset, 1.8, vol * 0.9, 'sine');
                        offset += 0.32;
                    });
                    offset += 0.6;
                }
            } else {
                // Modern okul melodisi
                const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99];
                let offset = 0;
                const repeats = Math.max(1, Math.floor(durationSeconds / 3));
                for (let r = 0; r < repeats; r++) {
                    notes.forEach(f => {
                        if (offset < durationSeconds) this.playChime(f, now + offset, 1.6, vol, 'sine');
                        offset += 0.42;
                    });
                    offset += 0.7;
                }
            }
        }
    }

    seyirPanoZilEngine = new PanoZilAudioEngine();

    // Kullanıcı ekrana dokununca ses kilidini aç
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (seyirPanoZilEngine) seyirPanoZilEngine.initContext();
        }, { passive: true });
    });

    // Pano Ekranında Canlı Zil Bildirimi Göster
    function gosterPanoZilBanner(zil, sure) {
        const config = (panoData && panoData.zilYonetimi) || {};

        // Ekranda neon parlama dalgası efekti
        if (config.neonEfekt !== false) {
            const scaleWrapper = document.getElementById('pano-scale-wrapper') || document.body;
            scaleWrapper.classList.add('bell-screen-glow');
            setTimeout(() => {
                scaleWrapper.classList.remove('bell-screen-glow');
            }, (sure + 1) * 1000);
        }

        let bgGradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))';
        let subText = 'OKUL ZİLİ ÇALIYOR';
        let icon = '🔔';

        if (zil.tur === 'cikis') {
            bgGradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))';
            subText = '☕ TENEFFÜS VAKTİ';
            icon = '🏃';

            // Teneffüste nöbetçi öğretmenler tarafına otomatik çevir ve kartları parlat
            const flipInner = document.getElementById('flip-inner');
            if (flipInner && !flipInner.classList.contains('is-flipped')) {
                flipInner.classList.add('is-flipped');
            }
            document.querySelectorAll('#pano-nobetciler-back .nobetci-card').forEach(c => c.classList.add('bell-duty-shimmer'));
            setTimeout(() => {
                document.querySelectorAll('#pano-nobetciler-back .nobetci-card').forEach(c => c.classList.remove('bell-duty-shimmer'));
            }, Math.max(12000, (sure + 3) * 1000));
        } else if (zil.tur === 'ogretmen') {
            bgGradient = 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95))';
            subText = '👨‍🏫 ÖĞRETMEN HAZIRLIK ZİLİ';
            icon = '⏳';
        } else if (zil.tur === 'ogrenci') {
            bgGradient = 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))';
            subText = '📖 DERS BAŞLADI';
            icon = '🔔';

            // Ders başladığında dersler yüzüne dön
            const flipInner = document.getElementById('flip-inner');
            if (flipInner && flipInner.classList.contains('is-flipped')) {
                flipInner.classList.remove('is-flipped');
            }
        }

        let banner = document.getElementById('seyir-live-bell-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'seyir-live-bell-banner';
            banner.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 99999;
                color: #ffffff;
                padding: 16px 24px;
                border-radius: 16px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                gap: 14px;
                font-family: inherit;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.35);
                animation: panoBellPulse 1s infinite alternate ease-in-out;
                transition: opacity 0.5s ease, transform 0.5s ease;
                transform: translateY(-20px);
                opacity: 0;
            `;
            document.body.appendChild(banner);

            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes panoBellPulse {
                    from { transform: translateY(0) scale(1); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35); }
                    to { transform: translateY(0) scale(1.03); box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55); }
                }
            `;
            document.head.appendChild(style);
        }

        banner.style.background = bgGradient;
        banner.innerHTML = `
            <div style="font-size: 2.2rem; line-height: 1;">${icon}</div>
            <div>
                <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; opacity: 0.95;">${subText}</div>
                <div style="font-size: 1.25rem; font-weight: 900;">${escapeHtml(zil.baslik || 'Okul Zili')}</div>
            </div>
        `;

        banner.style.display = 'flex';
        requestAnimationFrame(() => {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-20px)';
            setTimeout(() => { banner.style.display = 'none'; }, 500);
        }, (sure + 1) * 1000);
    }

    // Pano Ekranında Canlı Tören / İstiklal Marşı Başlat
    function calPanoToren(toren) {
        if (!toren || !toren.audioId || !window.SeyirAudioStore) return;

        if (seyirPanoAktifTorenAudio) {
            try { seyirPanoAktifTorenAudio.pause(); } catch (e) {}
            seyirPanoAktifTorenAudio = null;
        }

        const overlay = document.getElementById('pano-ceremony-overlay');
        const titleEl = document.getElementById('ceremony-display-title');
        const subEl = document.getElementById('ceremony-display-sub');
        const statusEl = document.getElementById('ceremony-status-text');

        if (toren.torenModu !== false && overlay) {
            if (titleEl) titleEl.textContent = (toren.baslik || 'SAYGI DURUŞU VE İSTİKLAL MARŞI').toLocaleUpperCase('tr-TR');
            if (subEl) subEl.textContent = '🇹🇷 ' + ((panoData && panoData.okulAdi) || 'Millî Eğitim Bakanlığı');
            if (statusEl) statusEl.textContent = (toren.baslik || 'Müzik') + ' çalınıyor...';
            overlay.classList.add('active');
        }

        window.SeyirAudioStore.playAudio(toren.audioId, toren.sesSeviyesi || 95, () => {
            if (overlay) overlay.classList.remove('active');
            seyirPanoAktifTorenAudio = null;
        }).then(audioObj => {
            seyirPanoAktifTorenAudio = audioObj;
            if (!audioObj && overlay && overlay.classList.contains('active')) {
                if (statusEl) statusEl.textContent = '🔊 Sesi Başlatmak İçin Ekrana Dokunun / Tıklayın';
                const unlockHandler = () => {
                    document.removeEventListener('click', unlockHandler);
                    document.removeEventListener('touchstart', unlockHandler);
                    calPanoToren(toren);
                };
                document.addEventListener('click', unlockHandler, { once: true });
                document.addEventListener('touchstart', unlockHandler, { once: true });
            }
        });
    }

    const btnCloseCeremony = document.getElementById('btn-close-ceremony');
    if (btnCloseCeremony) {
        btnCloseCeremony.addEventListener('click', () => {
            if (window.SeyirAudioStore) window.SeyirAudioStore.stopAll();
            const overlay = document.getElementById('pano-ceremony-overlay');
            if (overlay) overlay.classList.remove('active');
            seyirPanoAktifTorenAudio = null;
        });
    }

    // Uzaktan Canlı Tören / Müzik Tetikleme Dinleyicisi (Yönetici Paneli -> Pano Ekranı)
    window.addEventListener('storage', (e) => {
        if (e.key === 'seyir_toren_trigger' && e.newValue) {
            try {
                const payload = JSON.parse(e.newValue);
                if (payload && payload.audioId) {
                    calPanoToren(payload);
                }
            } catch (err) {}
        } else if (e.key === 'seyir_toren_stop') {
            if (window.SeyirAudioStore) window.SeyirAudioStore.stopAll();
            const overlay = document.getElementById('pano-ceremony-overlay');
            if (overlay) overlay.classList.remove('active');
            seyirPanoAktifTorenAudio = null;
        }
    });

    // 1 Saniyelik Zil Zamanlayıcı Döngüsü
    seyirPanoZilInterval = setInterval(() => {
        if (!panoData || !panoData.zilYonetimi) return;
        const config = panoData.zilYonetimi;

        const now = new Date();
        const dayOfWeek = now.getDay();
        const isHaftasonu = (dayOfWeek === 0 || dayOfWeek === 6);

        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dakikaStr = `${hh}:${mm}`;

        // Ders Zili Kontrolü (Hafta sonu sessizliği ve sistem aktiflik kontrolü)
        const dersZiliCalabilir = (config.aktif !== false) && !(config.haftasonuSessiz !== false && isHaftasonu);
        if (dersZiliCalabilir && seyirPanoSonCalanDakika !== dakikaStr && (ss === '00' || ss === '01')) {
            const aktifZiller = (config.cizelge || []).filter(z => z.aktif !== false);
            const eslesen = aktifZiller.find(z => z.saat === dakikaStr);
            if (eslesen) {
                seyirPanoSonCalanDakika = dakikaStr;

                let customAudioId = null;
                let melodi = eslesen.melodi;

                if (eslesen.customAudioId) {
                    customAudioId = eslesen.customAudioId;
                    melodi = 'custom';
                } else if (!melodi || melodi === 'varsayilan') {
                    if (eslesen.tur === 'ogrenci') {
                        melodi = config.melodiOgrenci || 'modern';
                        if (melodi === 'custom') customAudioId = 'zil_ogrenci_custom';
                    } else if (eslesen.tur === 'ogretmen') {
                        melodi = config.melodiOgretmen || 'chime';
                        if (melodi === 'custom') customAudioId = 'zil_ogretmen_custom';
                    } else if (eslesen.tur === 'cikis') {
                        melodi = config.melodiCikis || 'westminster';
                        if (melodi === 'custom') customAudioId = 'zil_cikis_custom';
                    } else {
                        melodi = 'modern';
                    }
                } else if (melodi === 'custom') {
                    if (eslesen.tur === 'ogrenci') customAudioId = 'zil_ogrenci_custom';
                    else if (eslesen.tur === 'ogretmen') customAudioId = 'zil_ogretmen_custom';
                    else if (eslesen.tur === 'cikis') customAudioId = 'zil_cikis_custom';
                }

                const sure = parseInt(eslesen.sure, 10) || parseInt(config.calmaSuresi, 10) || 8;
                const ses = parseInt(config.sesSeviyesi, 10) || 80;

                seyirPanoZilEngine.playMelody(melodi, sure, ses, customAudioId);
                gosterPanoZilBanner(eslesen, sure);

                // Sesli Anons
                if (config.sesliAnons && eslesen.anons && eslesen.anons.trim() && window.speechSynthesis) {
                    setTimeout(() => {
                        try {
                            const u = new SpeechSynthesisUtterance(eslesen.anons.trim());
                            u.lang = 'tr-TR';
                            window.speechSynthesis.speak(u);
                        } catch (e) {}
                    }, Math.min(2500, sure * 600));
                }
            }
        }

        // Tören & Zamanlanmış Müzikler Kontrolü
        if (config.torenMuzikleri && Array.isArray(config.torenMuzikleri) && config.torenMuzikleri.length > 0) {
            if (seyirPanoSonCalanTorenDakika !== dakikaStr && (ss === '00' || ss === '01')) {
                const aktifTorenler = config.torenMuzikleri.filter(m => m.aktif !== false);
                const eslesenToren = aktifTorenler.find(m => {
                    if (m.saat !== dakikaStr) return false;
                    if (!Array.isArray(m.gunler) || m.gunler.length === 0) return true;
                    return m.gunler.includes(dayOfWeek);
                });
                if (eslesenToren) {
                    seyirPanoSonCalanTorenDakika = dakikaStr;
                    calPanoToren(eslesenToren);
                }
            }
        }
    }, 1000);
}
