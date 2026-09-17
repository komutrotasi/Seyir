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
        { name: 'İmsak', time: '04:45' },
        { name: 'Güneş', time: '06:12' },
        { name: 'Öğle', time: '12:58' },
        { name: 'İkindi', time: '16:35' },
        { name: 'Akşam', time: '19:42' },
        { name: 'Yatsı', time: '21:05' }
    ];
    let dersScrollPos = 0;
    let dersScrollDir = 1;
    let animFrame = null;

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
                } catch (e) {
                    console.error("Local data parse error", e);
                }
            }

            panoData = Object.assign({
                okulAdi: "Seyir Dijital Pano",
                okulLogo: "",
                slogan: "Okulun Dijital Nabzı",
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
                okulWebSiteUrl: "",
                konum: { sehir: "", enlem: null, boylam: null },
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
                nobetciGunluk: {}
            }, fileData, localData || {});
            panoData.konum = Object.assign(
                { sehir: "", enlem: null, boylam: null },
                fileData.konum || {},
                (localData && localData.konum) || {}
            );

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
        const logoImg = document.querySelector('.pano-okul-logo-img');
        if (logoImg) {
            if (panoData.okulLogo && typeof panoData.okulLogo === 'string' && panoData.okulLogo.trim() !== '') {
                logoImg.src = panoData.okulLogo;
            } else {
                logoImg.src = 'img/okul_logo.png';
            }
            if (panoData.okulAdi) {
                logoImg.alt = escapeHtml(panoData.okulAdi) + ' Logosu';
            }
        }

        if (els.okulAdi && panoData.okulAdi) {
            const parts = panoData.okulAdi.split(" ");
            if (parts.length > 2) {
                const mid = Math.ceil(parts.length / 2);
                const mainName = parts.slice(0, mid).join(" ");
                const subName = parts.slice(mid).join(" ");
                els.okulAdi.innerHTML = `<span class="okul-ana-isim">${escapeHtml(mainName)}</span><span class="okul-alt-isim">${escapeHtml(subName)}</span>`;
            } else {
                els.okulAdi.innerHTML = `<span class="okul-ana-isim">${escapeHtml(panoData.okulAdi)}</span>`;
            }
            document.title = panoData.okulAdi + " | Seyir Dijital Pano";
        }
        if (els.slogan && panoData.slogan) els.slogan.textContent = panoData.slogan;

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
                            <!-- ÜST SATIR: Nöbet Yeri (Soldan Hizalı Rozet) -->
                            <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                                ${yer ? `<span class="yer" style="font-size: 0.8rem; font-weight: 800; color: ${nColor}; display: inline-flex; align-items: center; gap: 4px; background: ${nColor}20; border: 1px solid ${nColor}40; padding: 2px 8px; border-radius: 6px; text-align: left; white-space: nowrap;">📍 ${escapeHtml(yer)}</span>` : '<span style="font-size: 0.8rem; color: #94a3b8;">Nöbet Alanı</span>'}
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
            // Ticker Mantığı (Sadece Kayan Yazı)
            let tickerArr = [];

            if (panoData.kayanYazi && panoData.kayanYazi.length > 0) {
                // Sadece geçerli, boş olmayan yazıları al
                const gecerliYazilar = panoData.kayanYazi.filter(k => k && k.trim() !== "");
                gecerliYazilar.forEach(k => {
                    if (k.includes("⚡")) {
                        tickerArr.push(escapeHtml(k));
                    } else {
                        tickerArr.push(`⚡ ${escapeHtml(k.trim())}`);
                    }
                });
            }

            if (tickerWrapper && tickerText) {
                const panoContainer = document.querySelector('.pano-container');
                if (tickerArr.length > 0) {
                    tickerText.innerHTML = tickerArr.join('<span style="margin: 0 40px; color: var(--text-muted, #6B7280); font-size: 1.5rem; line-height: 0;">&middot;</span>');
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

                // Sınavları duyuru formatına çevir
                const formattedSinavlar = sinavlar.map(s => ({
                    baslik: `${s.ders || ''} Sınavı`,
                    // Bu içerik bilinçli olarak HTML üretir; alan değerleri tek tek escape edilir.
                    icerik: `<b>Sınıflar:</b> ${escapeHtml(s.siniflar || '-')}<br><b>Tarih & Saat:</b> ⏰ ${escapeHtml(s.tarih || '')} - ${escapeHtml(s.saat || '')}`,
                    icerikHtml: true,
                    isSinav: true,
                    _sortDate: s.tarih ? parseTurkishDate(s.tarih) : 0
                }));

                // Duyuruları tarihe göre sırala (en yeni üstte)
                const sortedDuyurular = [...duyurular].sort((a, b) => {
                    const dA = a.tarih ? parseTurkishDate(a.tarih) : 0;
                    const dB = b.tarih ? parseTurkishDate(b.tarih) : 0;
                    return dB - dA;
                });

                const allItems = [...sortedDuyurular, ...formattedSinavlar];

                if (allItems.length > 0) {
                    let gridHtml = '<div class="duyuru-accordion-list">';

                    // Masaüstü ekranlarda yan yana 3 tane açık duyuru/sınav göster
                    const displayItems = allItems.slice(0, 3);

                    displayItems.forEach((item, idx) => {
                        let itemEmoji = '📢';
                        let themeColor = '#fbbf24';
                        let bgGrad = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
                        let borderColor = 'rgba(245, 158, 11, 0.45)';
                        let badgeText = 'Genel Duyuru';

                        if (item.oncelik === 'acil' || item.tip === 'acil') {
                            itemEmoji = '🚨';
                            themeColor = '#f87171';
                            borderColor = 'rgba(239, 68, 68, 0.45)';
                            badgeText = 'Acil İlan';
                        } else if (item.isSinav) {
                            itemEmoji = '📝';
                            themeColor = '#60a5fa';
                            borderColor = 'rgba(59, 130, 246, 0.45)';
                            badgeText = 'Sınav Programı';
                        } else if (idx % 3 === 1) {
                            itemEmoji = 'ℹ️';
                            themeColor = '#34d399';
                            borderColor = 'rgba(16, 185, 129, 0.45)';
                            badgeText = 'Genel Bilgilendirme';
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
     * Karuseli DOM'a basar. (MEB haberleri çekildiğinde de tekrar çağrılır)
     */
    function renderCarousel() {
        if (!panoData) return;
        els.carousel.innerHTML = '';
        currentSlide = 0;

        let allSlides = [];

        // Eğer MEB'den haberler çekildiyse, öncelik onundur.
        if (panoData.mebHaberler && panoData.mebHaberler.length > 0) {
            allSlides = [...panoData.mebHaberler];
        } else if (panoData.fotograflar && panoData.fotograflar.length > 0) {
            panoData.fotograflar.forEach(url => {
                if (url.trim() !== '') allSlides.push({ tip: 'foto', gorsel: url });
            });
        } else {
            allSlides = [...(panoData.duyurular || [])];
        }

        allSlides.forEach((duyuru, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide' + (index === 0 ? ' active' : '');

            if ((duyuru.tip === 'foto' || duyuru.tip === 'foto-haber' || duyuru.tip === 'slider') && duyuru.gorsel) {
                // Resimli slide: tam arka plan cover + altta ortalı başlık
                slide.classList.add('photo-slide');

                // Sadece background özelliklerini inline zorla
                // opacity / z-index CSS .carousel-slide ve .active sınıfları üzerinden yönetilir
                slide.style.backgroundImage = `url('${String(duyuru.gorsel).replace(/['"\\)]/g, '')}')`;
                slide.style.backgroundSize = 'contain';
                slide.style.backgroundPosition = 'center center';
                slide.style.backgroundRepeat = 'no-repeat';
                slide.style.backgroundColor = '#0f172a';

                // Başlık altta ortalı gradient ile
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
            els.carousel.appendChild(slide);
        });
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
            const konum = Object.assign({ sehir: '', enlem: null, boylam: null }, (panoData && panoData.konum) || {});
            if (konum.enlem === null || konum.boylam === null || konum.enlem === '' || konum.boylam === '') return;
            const hamEnlem = Number(konum.enlem);
            const hamBoylam = Number(konum.boylam);
            if (!Number.isFinite(hamEnlem) || hamEnlem < -90 || hamEnlem > 90 || !Number.isFinite(hamBoylam) || hamBoylam < -180 || hamBoylam > 180) return;
            const enlem = hamEnlem;
            const boylam = hamBoylam;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(enlem)}&longitude=${encodeURIComponent(boylam)}&current_weather=true`);
            if (!res.ok) return;
            const json = await res.json();
            if (json && json.current_weather) {
                const temp = Math.round(json.current_weather.temperature);
                const code = json.current_weather.weathercode;

                const tempEl = document.getElementById('header-weather-temp');
                const descEl = document.getElementById('header-weather-desc');
                const iconEl = document.getElementById('header-weather-icon');

                if (tempEl) tempEl.textContent = `${temp}°C ${konum.sehir || 'Okul Konumu'}`;

                let desc = 'Açık / Güneşli';
                let emoji = '☀️';

                if (code === 0) { desc = 'Açık & Güneşli'; emoji = '☀️'; }
                else if (code >= 1 && code <= 3) { desc = 'Parçalı Bulutlu'; emoji = '⛅'; }
                else if (code >= 45 && code <= 48) { desc = 'Sisli'; emoji = '🌫️'; }
                else if (code >= 51 && code <= 67) { desc = 'Yağmurlu'; emoji = '🌧️'; }
                else if (code >= 71 && code <= 77) { desc = 'Kar Yağışlı'; emoji = '🌨️'; }
                else if (code >= 80 && code <= 82) { desc = 'Sağanak Yağışlı'; emoji = '🌧️'; }
                else if (code >= 95) { desc = 'Fırtınalı'; emoji = '⛈️'; }

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
                    <div class="dini-type" style="width: 100%; text-align: left;">🕌 Vaktin Namazı</div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; width: 100%;">
                        <span class="vakit-adi" id="namaz-vakit-adi" style="font-size: 1.35rem; font-weight: 800; color: #e9d5ff;">...</span>
                        <span class="vakit-saat" id="namaz-vakit-saat" style="font-size: 2.0rem; font-weight: 900; color: #ffffff;">...</span>
                    </div>
                </div>
                <div id="namaz-card-view2" style="display: none; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
                    <div class="dini-type" style="color: #c084fc; width: 100%; text-align: left;">⏳ Vaktin Çıkmasına</div>
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
        const elAdi = document.getElementById('namaz-vakit-adi');
        const elSaat = document.getElementById('namaz-vakit-saat');
        const elKalan = document.getElementById('namaz-kalan-sure');

        if (!view1 || !view2) {
            renderDiniIcerik(lastVakitIndex >= 0 ? lastVakitIndex : 0);
            return;
        }

        if (elAdi) elAdi.textContent = currentVakit.name + ':';
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
    }


    /**
     * Sadece Açık Tema (Dark Mode İptal)
     */
    function checkAutoTheme() {
        const html = document.documentElement;
        html.setAttribute('data-theme', 'light');
    }

    /**
     * Tüm Animasyon ve Döngüleri Başlat
     */
    function startAnimations() {
        const sure = (panoData && panoData.ayarlar && panoData.ayarlar.karuselSuresi) ? panoData.ayarlar.karuselSuresi : 10000;

        // 1. Ana Karusel (Fotoğraflar ve Duyurular)
        carouselInterval = setInterval(() => {
            const slides = els.carousel.querySelectorAll('.carousel-slide');
            if (slides.length === 0) return;

            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, sure);

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
            const konum = Object.assign({ sehir: '' }, (panoData && panoData.konum) || {});
            if (!String(konum.sehir || '').trim()) return;
            const apiUrl = 'https://api.aladhan.com/v1/timingsByCity?city=' +
                encodeURIComponent(konum.sehir) + '&country=Turkey&method=13';
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('API Hatası');
            const json = await res.json();
            const timings = json.data.timings;

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
            } else {
                console.warn('Namaz vakitleri eksik/bozuk geldi, mevcut vakitler korunuyor.', timings);
            }

            updateNamazUI();
        } catch (error) {
            console.warn('Namaz vakitleri API hatası, yerel varsayılan vakitler aktif:', error);
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

        // Admin paneli başka sekmede kaydettiğinde yalnızca açık pano kopyasını yenile.
        window.addEventListener('storage', (event) => {
            if (event.key === 'seyir_public_data') fetchData();
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
