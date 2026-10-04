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
    let globalNamazTimes = [];
    let dersScrollPos = 0;
    let dersScrollDir = 1;
    let animFrame = null;

    function haberGorselAdresi(haber) {
        return String((haber && haber.gorsel) || '');
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
    let personnelExpiry = 0;
    function enforceLiveRetention() {
        if (!panoData || !personnelExpiry || Date.now() < personnelExpiry) return;
        personnelExpiry = 0;
        SeyirDataPolicy.clearPersonnel(panoData);
        try {
            const raw = JSON.parse(localStorage.getItem('seyir_public_data') || '{}');
            SeyirDataPolicy.enforcePublicRetention(raw);
            localStorage.setItem('seyir_public_data', JSON.stringify(raw));
        } catch (_) {}
        renderData();
    }

    async function fetchData() {
        try {
            let fileData = {};
            try {
                const res = await fetch('data/data.json');
                if (res.ok) {
                    fileData = await res.json();
                }
            } catch (e) {
                console.warn("data/data.json okunamadı:", e);
            }

            let localData = null;
            // Yönetim verisinin tamamını okumaz; admin panelinin gizlilik kurallarıyla
            // hazırladığı açık pano kopyasını kullanır.
            function isLegacyDemoData(raw) {
                if (!raw) return false;
                const s = typeof raw === 'string' ? raw : JSON.stringify(raw);
                const markers = [
                    "Mahmud Celaleddin Ökten", "konyamcosihl", "Fikirden Koda",
                    "Hafta Sonu DYK", "1. Dönem Genel Veli", "TEKNOFEST 2026",
                    "Ahmet Yılmaz", "Ayşe Demir", "Mehmet Kaya", "Fatma Çelik",
                    "Ali Öztürk", "Zeynep Şahin", "Mustafa Koç", "Hatice Aydın",
                    "Hüseyin Arslan", "Elif Yıldız", "Emre Aksoy", "Burak Doğan",
                    "Seda Polat", "Deniz Kılıç", "Hasan Can", "Tuğba Dağlı",
                    "1. Dönem 1. Ortak Yazılı Sınavı", "TÜBİTAK 4006"
                ];
                return markers.some(m => s.includes(m));
            }

            const localDataStr = localStorage.getItem('seyir_public_data');
            if (localDataStr) {
                if (isLegacyDemoData(localDataStr)) {
                    try {
                        localStorage.removeItem('seyir_public_data');
                        localStorage.setItem('seyir_clean_init_20261004', '1');
                    } catch (_) {}
                    localData = null;
                } else {
                    try {
                        localData = JSON.parse(localDataStr);
                    } catch (e) {
                        console.error("Local data parse error", e);
                    }
                }
            }

            const source = Object.assign(window.SeyirDataPolicy.emptyTemplate(), fileData, localData || {});
            const original = JSON.stringify(source);
            SeyirDataPolicy.enforcePublicRetention(source);
            if (localData && JSON.stringify(source) !== original) {
                try { localStorage.setItem('seyir_public_data', JSON.stringify(source)); } catch (_) {}
            }
            panoData = SeyirDataPolicy.validate(source);
            personnelExpiry = source._meta?.personelSonKullanim || 0;

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
                logoImg.src = 'img/seyir-icon.svg';
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
            const sloganMetni = (panoData.slogan || '').trim();
            els.slogan.textContent = sloganMetni;
            const wrap = document.getElementById('pano-slogan-wrap');
            if (wrap) {
                wrap.style.display = sloganMetni ? 'inline-flex' : 'none';
            }
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
                    li.style.cssText = `display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid ${nColor}55; border-left: 6px solid ${nColor}; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.32); margin-bottom: 12px; width: 100%; box-sizing: border-box;`;
                    li.innerHTML = `
                        <div class="nobetci-avatar" style="background: ${nColor}25; color: ${nColor}; border: 1.5px solid ${nColor}65; width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.65rem; flex-shrink: 0; box-shadow: 0 4px 12px ${nColor}35;">
                            🛡️
                        </div>
                        <div class="card-info-content" style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;">
                            <!-- ÜST SATIR: Nöbet Yeri (Soldan Hizalı Rozet) & Canlı Görev Rozeti -->
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                ${yer ? `<span class="yer" style="font-size: 1.05rem; font-weight: 800; color: ${nColor}; display: inline-flex; align-items: center; gap: 5px; background: ${nColor}25; border: 1.5px solid ${nColor}; padding: 4px 12px; border-radius: 8px; text-align: left; white-space: nowrap; box-shadow: 0 2px 6px ${nColor}25;">📍 ${escapeHtml(yer)}</span>` : '<span style="font-size: 0.95rem; color: #94a3b8;">Nöbet Alanı</span>'}
                                <span class="nobet-card-duty-badge"><span class="duty-ping"></span> Görevde</span>
                            </div>
                            <!-- ALT SATIR: Öğretmen İsmi (Sağdan Hizalı, BÜYÜK ve NET) -->
                            <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%;">
                                <span class="isim" style="font-size: 1.38rem; font-weight: 900; color: #ffffff; font-family: 'Outfit', sans-serif; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; letter-spacing: 0.4px;">${escapeHtml(isim)}</span>
                            </div>
                        </div>
                    `;
                    nobetcilerContainer.appendChild(li);
                });
            } else if (gizlilik.nobetciGoster) {
                nobetcilerContainer.innerHTML = `
                    <li class="nobetci-bos-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 40px 20px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%); border: 2px dashed rgba(148, 163, 184, 0.35); border-radius: 18px; text-align: center; box-shadow: 0 6px 18px rgba(0,0,0,0.15);">
                        <div style="font-size: 2.5rem; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">🛡️</div>
                        <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff; font-family: 'Outfit', sans-serif; letter-spacing: 0.3px;">Bugün Nöbetçi Bulunmuyor</div>
                        <div style="font-size: 1.05rem; font-weight: 500; color: #94a3b8; line-height: 1.5;">Tanımlı nöbetçi öğretmen bulunmamaktadır.</div>
                    </li>
                `;
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
                li.style.cssText = `display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid ${rColor}55; border-left: 6px solid ${rColor}; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.32); margin-bottom: 12px; width: 100%; box-sizing: border-box;${isCurrentlyActive ? ` animation: neon-pulse-${globalIdx} 2s ease-in-out infinite; box-shadow: 0 0 20px ${rColor}60, 0 8px 24px rgba(0,0,0,0.4);` : ''}`;

                const kisaSinif = formatSinifPanoTV(aktif.sinif);

                li.innerHTML = `
                    <div class="ders-avatar" style="background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); border: 2px solid rgba(255, 255, 255, 0.95); width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.65rem; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
                        🎓
                    </div>
                    <div class="card-info-content" style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;">
                        <!-- ÜST SATIR: Sınıf İsmi (Soldan Hizalı, BÜYÜK ve NET) -->
                        <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                            <span class="sinif-adi" style="font-size: 1.35rem; font-weight: 900; color: #ffffff; font-family: 'Outfit', sans-serif; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.5px;">${escapeHtml(kisaSinif)}</span>
                        </div>
                        <!-- ALT SATIR: Ders İsmi (Sağdan Hizalı, BÜYÜK ve NET) -->
                        <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%;">
                            <span class="ders-adi" style="font-size: 1.18rem; font-weight: 900; color: ${rColor}; display: inline-flex; align-items: center; gap: 6px; background: ${rColor}25; border: 1.5px solid ${rColor}65; padding: 5px 12px; border-radius: 9px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; letter-spacing: 0.3px;">
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
            derslerContainer.innerHTML = `
                <li class="ders-bos-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 40px 20px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%); border: 2px dashed rgba(148, 163, 184, 0.35); border-radius: 18px; text-align: center; box-shadow: 0 6px 18px rgba(0,0,0,0.15);">
                    <div style="font-size: 2.5rem; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">☕</div>
                    <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff; font-family: 'Outfit', sans-serif; letter-spacing: 0.3px;">Şu An Aktif Ders Yok</div>
                    <div style="font-size: 1.05rem; font-weight: 500; color: #94a3b8; line-height: 1.5;">Ders saatleri başladığında güncel sınıf dersleri burada görüntülenecektir.</div>
                </li>
            `;
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
                            <div class="duyuru-accordion-card active" onclick="toggleDuyuruAccordion(this)" style="background: ${bgGrad}; border: 1.5px solid ${borderColor}; border-left: 5px solid ${themeColor}; border-radius: 14px; padding: 12px 14px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 8px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; min-width: 0;">
                                <div class="duyuru-acc-header" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                                        <div style="background: ${themeColor}22; color: ${themeColor}; border: 1px solid ${themeColor}50; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; box-shadow: 0 2px 8px ${themeColor}30;">
                                            ${itemEmoji}
                                        </div>
                                        <div style="display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 3px;">
                                            <span style="font-weight: 900; font-size: 1.22rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Outfit', sans-serif; letter-spacing: 0.3px;">${itemBaslik}</span>
                                            <div>
                                                <span style="font-size: 0.82rem; font-weight: 800; color: ${themeColor}; background: ${themeColor}22; border: 1px solid ${themeColor}45; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                                                    ${itemEmoji} ${badgeText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="acc-arrow-box" style="background: rgba(255,255,255,0.08); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <i class="fa-solid fa-chevron-down acc-arrow" style="font-size: 0.82rem; color: #94a3b8; transition: transform 0.3s ease; transform: rotate(180deg);"></i>
                                    </div>
                                </div>
                                <div class="duyuru-acc-body" style="margin-top: 10px; padding-top: 10px; border-top: 1.5px dashed ${themeColor}40; font-size: 1.16rem; color: #f8fafc; line-height: 1.45; flex: 1; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-height: calc(1.16rem * 1.45 * 4 + 4px);">
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
    const carouselUrls = new Set();
    let carouselGeneration = 0;
    function releaseCarouselUrls() {
        if (els.carousel) els.carousel.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
        carouselUrls.forEach(url => URL.revokeObjectURL(url)); carouselUrls.clear();
    }
    window.addEventListener('pagehide', releaseCarouselUrls);
    async function renderCarousel() {
        if (!panoData) return;
        const generation = ++carouselGeneration;
        releaseCarouselUrls();
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
                <div class="carousel-slide active" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; height: 100%; padding: 40px; box-sizing: border-box; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);">
                    <div style="font-size: 4.5rem; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));">📢</div>
                    <h2 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; font-family: 'Outfit', sans-serif; margin: 0;">Seyir Dijital Pano Yayında</h2>
                    <p style="font-size: 1.35rem; color: #94a3b8; max-width: 650px; line-height: 1.6; margin: 0;">Yönetim panelinden haber ve duyuru eklendiğinde veya MEB haberleri çekildiğinde içerikler burada otomatik olarak akacaktır.</p>
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
                        if (generation !== carouselGeneration) return;
                        if (rec && rec.blob) {
                            videoSrc = URL.createObjectURL(rec.blob);
                            carouselUrls.add(videoSrc);
                        }
                    } catch (e) { }
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
                const gorselVar = Boolean(haberGorseli && haberGorseli.trim() !== "");
                if (gorselVar && (duyuru.tip === "foto" || duyuru.tip === "foto-haber" || duyuru.tip === "slider" || duyuru.tip === "haber" || !duyuru.tip || duyuru.gorsel)) {
                    slide.classList.add("photo-slide");
                    const guvenliGorsel = haberGorseli.replace(/['"\\)]/g, "");
                    slide.style.backgroundImage = `url('${guvenliGorsel}')`;
                    slide.style.backgroundSize = "contain";
                    slide.style.backgroundPosition = "center center";
                    slide.style.backgroundRepeat = "no-repeat";
                    slide.style.backgroundColor = "#0f172a";

                    const gorselKontrol = new Image();
                    gorselKontrol.onerror = () => {
                        const proxyEslesme = guvenliGorsel.match(/[?&]url=([^&]+)/);
                        if (proxyEslesme) {
                            try {
                                const dogrudanUrl = decodeURIComponent(proxyEslesme[1]).replace(/['"\\)]/g, "");
                                const yedekImg = new Image();
                                yedekImg.onload = () => {
                                    slide.style.backgroundImage = `url('${dogrudanUrl}')`;
                                };
                                yedekImg.onerror = () => {
                                    slide.style.backgroundImage = "linear-gradient(135deg, #0f172a, #1e293b)";
                                };
                                yedekImg.src = dogrudanUrl;
                                return;
                            } catch (_) { }
                        }
                        slide.style.backgroundImage = "linear-gradient(135deg, #0f172a, #1e293b)";
                    };
                    gorselKontrol.src = guvenliGorsel;

                    const baslikMetni = duyuru.baslik || '';
                    slide.innerHTML = baslikMetni ? `
                        <div class="carousel-caption" style="
                            box-sizing: border-box;
                            position: absolute;
                            bottom: 0; left: 0; right: 0;
                            width: 100%;
                            padding: 35px 30px 18px 30px;
                            background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, transparent 100%);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            color: white;
                            z-index: 3;
                        ">
                            <h3 style="
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                width: 100%;
                                max-width: 96%;
                                margin: 0 auto;
                                text-align: center;
                                font-size: clamp(1.2rem, 1.7vw, 2.1rem);
                                font-family: 'Outfit', sans-serif;
                                text-shadow: 0 2px 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8);
                                line-height: 1.3;
                                font-weight: 700;
                                letter-spacing: 0.01em;
                            " title="${escapeHtml(baslikMetni)}">${escapeHtml(baslikMetni)}</h3>
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
        enforceLiveRetention();

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

    /**
     * Yapılandırılan okul konumunun hava durumunu çek (Open-Meteo API)
     */
    function locationKey() {
        const k = (panoData && panoData.konum) || {};
        return JSON.stringify([k.sehir || '', k.ilce || '', k.enlem, k.boylam]);
    }

    async function fetchWithDeadline(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try { return await fetch(url, { signal: controller.signal }); }
        finally { clearTimeout(timer); }
    }

    async function fetchSchoolWeather() {
        const key = locationKey();
        const k = (panoData && panoData.konum) || {};
        const label = k.ilce || k.sehir || '';
        function show(temp, desc, emoji) {
            const values = { 'header-weather-temp': temp, 'header-weather-desc': desc,
                'header-weather-icon': emoji, 'screensaver-weather-text': temp + ' — ' + desc };
            for (const [id, value] of Object.entries(values)) {
                const el = document.getElementById(id); if (el) el.textContent = value;
            }
        }
        show('--°C ' + label, label ? 'Güncel veri bekleniyor' : 'Konum seçin', '🌐');
        if (k.enlem == null || k.boylam == null || k.enlem === '' || k.boylam === '') return;
        try {
            const res = await fetchWithDeadline(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(k.enlem)}&longitude=${encodeURIComponent(k.boylam)}&current_weather=true`);
            if (!res.ok) throw new Error('Hava durumu HTTP ' + res.status);
            const json = await res.json();
            const w = json.current_weather;
            if (!w || !Number.isFinite(w.temperature) || !Number.isFinite(w.weathercode)) throw new Error('Geçersiz hava durumu');
            if (locationKey() !== key) return;
            const code = w.weathercode;
            let desc = 'Açık', emoji = '☀️';
            if (code >= 95) { desc = 'Fırtına'; emoji = '⛈️'; }
            else if (code >= 85 || (code >= 71 && code <= 77)) { desc = 'Kar yağışlı'; emoji = '🌨️'; }
            else if (code >= 51) { desc = 'Yağmurlu'; emoji = '🌧️'; }
            else if (code >= 45) { desc = 'Sisli'; emoji = '🌫️'; }
            else if (code >= 1) { desc = 'Bulutlu'; emoji = '☁️'; }
            const temp = Math.round(w.temperature);
            show(`${temp}°C ${label}`, desc, emoji);
            try { localStorage.setItem('seyir_cached_weather_v1', JSON.stringify({temp, desc, emoji, key, ts: Date.now()})); } catch (_) {}
        } catch (_) {
            if (locationKey() !== key) return;
            let c; try { c = JSON.parse(localStorage.getItem('seyir_cached_weather_v1')); } catch (_) {}
            if (c && c.key === key && Number.isFinite(c.temp) && Date.now() >= c.ts && Date.now() - c.ts <= 7200000) {
                show(`${c.temp}°C ${label}`, `${c.desc} (son kayıt: ${new Date(c.ts).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})})`, c.emoji);
            } else show('--°C ' + label, 'Güncel veri yok', '🌐');
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
        if (!globalNamazTimes.length) updateNamazUI();
    }

    function updateNamazUI() {
        if (namazVeriGunu && namazVeriGunu !== new Date().toDateString()) {
            globalNamazTimes = []; namazVeriGunu = null;
            tetikleNamazYenileme('gün değişti');
        }
        if (!globalNamazTimes.length) {
            for (const [id, value] of Object.entries({'namaz-vakit-adi':'Güncel vakit yok', 'namaz-vakit-saat':'--:--', 'namaz-kalan-sure':'--:--:--', 'namaz-kalan-etiket':'Konum ve bağlantıyı kontrol edin', 'screensaver-namaz-text':'Güncel vakit yok'})) {
                const el = document.getElementById(id); if (el) el.textContent = value;
            }
            return;
        }

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
        const remainingStr = nextVakit === globalNamazTimes[0] && currentMinutes >= parseInt(globalNamazTimes[5].time) * 60 + Number(globalNamazTimes[5].time.split(':')[1]) ? '--:--:--' : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

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

        const statusLise = calculateStatus(panoData.dersProgramiLise, now);
        const statusOrta = calculateStatus(panoData.dersProgramiOrtaokul, now);
        const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const yeniAktif = [];
        const gun = now.getDay();
        const haftaIci = gun >= 1 && gun <= 5;

        // Sıradaki dersleri göstermeye gerek yok; sadece o an aktif olarak işlenen dersler gösterilir
        if (haftaIci) {
            const gunAdi = gunler[gun];
            for (const [sinif, gunlukProgram] of Object.entries(panoData.dersProgramiDetay || {})) {
                const seviye = parseInt(sinif, 10);
                const program = seviye >= 1 && seviye <= 8 ? panoData.dersProgramiOrtaokul : panoData.dersProgramiLise;
                // Öğle arası haftalık sınıf matrisinde bir ders değildir.
                const dersler = (program || []).filter(row => !/öğle|teneffüs|ara/i.test(row.ders || ''));
                const status = calculateStatus(dersler, now);
                if (!status || status.index < 0) continue;
                // Ders dışı durumlar (Teneffüs, Başlamadı, Bitti) aktif ders sayılmaz
                if (status.text === 'Başlamadı' || status.text === 'Teneffüs' || status.text === 'Bitti') continue;

                const index = status.index;
                const ders = gunlukProgram[gunAdi]?.[index];
                if (!ders || !ders.ders) continue;
                const atama = (panoData.tamamlamaAtamalari?.[gunAdi] || []).find(a => a.saat === index && a.sinif === sinif);
                const gizlilik = panoGizlilikAyarlari();
                const hoca = gizlilik.dersOgretmeniGoster ? panoPersonelAdiniBicimle(atama ? atama.nobetci : (ders.hoca || ders.ogretmen), 'Ders Öğretmeni') : '';
                const ad = formatDersPanoTV(atama ? atama.dersAdi : ders.ders);
                yeniAktif.push({ sinif, ders: ad + (hoca ? ` (${hoca})` : '') + (atama ? ' (Tamamlama)' : '') });
            }
        }
        yeniAktif.sort((a, b) => a.sinif.localeCompare(b.sinif, 'tr', { numeric: true }));
        if (JSON.stringify(panoData.aktifDersler || []) !== JSON.stringify(yeniAktif)) {
            panoData.aktifDersler = yeniAktif;
            renderAktifDerslerUI();
        }
        const baslikEl = document.getElementById('pano-dersler-baslik');
        if (baslikEl) baslikEl.textContent = '⏰ ŞU ANKİ DERSLER';

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

        renderStatus(statusLise || statusOrta);

        // Teneffüs anında nöbetçi öğretmenleri öne çıkarma ve canlı vurgulama (Madde 4)
        const isTeneffus = [statusLise, statusOrta].some(status => status && (status.text === 'Teneffüs' || status.icon === '☕'));
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
                } catch (e) { }
            }
            // Önceki slayttaki YouTube videosunu durdur
            const prevYt = prevSlide.querySelector('iframe.carousel-youtube');
            if (prevYt && prevYt.contentWindow) {
                try {
                    prevYt.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                } catch (e) { }
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
            } catch (e) { }

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
                } catch (e) { }
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
        const key = locationKey();
        const k = (panoData && panoData.konum) || {};
        const today = new Date();
        const day = today.toDateString();
        const apiDay = [today.getDate(), today.getMonth() + 1, today.getFullYear()].map((v, i) => i < 2 ? String(v).padStart(2, '0') : v).join('-');
        globalNamazTimes = []; namazVeriGunu = null;
        try {
            if (k.enlem == null || k.boylam == null || k.enlem === '' || k.boylam === '') throw new Error('Konum seçin');
            const res = await fetchWithDeadline(`https://api.aladhan.com/v1/timings/${apiDay}?latitude=${encodeURIComponent(k.enlem)}&longitude=${encodeURIComponent(k.boylam)}&method=13`);
            if (!res.ok) throw new Error('Vakit HTTP ' + res.status);
            const json = await res.json();
            if (!json.data || !json.data.date || json.data.date.gregorian.date !== apiDay) throw new Error('Vakit tarihi uyuşmuyor');
            const t = json.data.timings;
            const vakitler = [['İmsak','Imsak'],['Güneş','Sunrise'],['Öğle','Dhuhr'],['İkindi','Asr'],['Akşam','Maghrib'],['Yatsı','Isha']].map(([name, id]) => ({name, time:normalizeVakitSaati(t[id])}));
            if (vakitler.some(v => !v.time)) throw new Error('Vakit verisi eksik');
            if (locationKey() !== key || day !== new Date().toDateString()) return;
            globalNamazTimes = vakitler; namazVeriGunu = day;
            try { localStorage.setItem('seyir_cached_namaz_v1', JSON.stringify({gun:day, key, vakitler})); } catch (_) {}
        } catch (_) {
            if (locationKey() !== key || day !== new Date().toDateString()) return;
            let c; try { c = JSON.parse(localStorage.getItem('seyir_cached_namaz_v1')); } catch (_) {}
            if (c && c.key === key && c.gun === day && Array.isArray(c.vakitler) && c.vakitler.length === 6 && c.vakitler.every(v => v && typeof v.name === 'string' && normalizeVakitSaati(v.time) === v.time)) {
                globalNamazTimes = c.vakitler; namazVeriGunu = day;
            }
        }
        updateNamazUI();
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

        const typeSpeed = (panoData && panoData.ayarlar && Number(panoData.ayarlar.daktiloHiz)) || 90;
        const waitDelay = (panoData && panoData.ayarlar && Number(panoData.ayarlar.daktiloBekleme)) || 2200;
        const delSpeed = Math.max(20, Math.round(typeSpeed * 0.45));
        const pauseDelay = Math.min(600, Math.max(150, Math.round(typeSpeed * 4)));

        // Aynı yazı listesi ve hız parametreleriyle tekrar başlatma (periyodik veri yenilemesinde animasyon sıfırlanmasın)
        const yeniKey = phrases.join('|') + `|${typeSpeed}|${waitDelay}`;
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
                    typewriterTimer = setTimeout(step, waitDelay);
                    return;
                }
                typewriterTimer = setTimeout(step, typeSpeed);
            } else {
                target.textContent = current.substring(0, charIdx - 1);
                charIdx--;

                if (charIdx <= 0) {
                    isDeleting = false;
                    charIdx = 0;
                    pIdx = (pIdx + 1) % phrases.length;
                    typewriterTimer = setTimeout(step, pauseDelay);
                    return;
                }
                typewriterTimer = setTimeout(step, delSpeed);
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

        // ─── PWA Service Worker Kaydı ───
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').then((reg) => {
                console.info('[Seyir] Service Worker kayıt OK, kapsam:', reg.scope);
            }).catch((err) => {
                console.warn('[Seyir] Service Worker kayıt başarısız:', err);
            });
        }

        // ─── Çevrimdışı Durum Rozeti ───
        const _updateOfflinePill = (isOnline) => {
            const pill = document.getElementById('header-offline-pill');
            if (!pill) return;
            if (isOnline) {
                pill.classList.add('online-back');
                pill.innerHTML = '<i class="fa-solid fa-wifi"></i> Bağlantı Sağlandı';
                setTimeout(() => { pill.style.display = 'none'; }, 3000);
            } else {
                pill.style.display = 'inline-flex';
                pill.classList.remove('online-back');
                pill.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Çevrimdışı';
            }
        };
        window.addEventListener('offline', () => _updateOfflinePill(false));
        window.addEventListener('online', () => _updateOfflinePill(true));
        if (!navigator.onLine) _updateOfflinePill(false);

        // ─── Ekran Koruyucu Motoru ───
        initSeyirScreensaver();
    }

    /**
     * Ekran Koruyucu (Screensaver / Kiosk Sleep Mode)
     * Ayarlanmış mesai bitiş saatinden sonra veya belirli bir süre hareketsizlik
     * kalınca ekranı koyu OLED zemin + neon saat moduna geçirir.
     */
    function initSeyirScreensaver() {
        const overlay = document.getElementById('screensaver-overlay');
        if (!overlay) return;

        let screensaverActive = false;
        let idleTimer = null;
        let gracePeriodTimer = null;
        let gracePeriodActive = false;
        let screensaverClockInterval = null;

        /** Varsayılan ayarlar — admin'den gelen panoData.ayarlar.screensaver ile ezilebilir */
        function getConfig() {
            const cfg = (panoData && panoData.ayarlar && panoData.ayarlar.screensaver) || {};
            return {
                mesaiBitis: cfg.mesaiBitis || '17:30',
                mesaiBaslangic: cfg.mesaiBaslangic || '07:30',
                haftasonuUyku: cfg.haftasonuUyku !== false,
                bosKalmadk: cfg.boslukDakika !== undefined ? Number(cfg.boslukDakika) : 30,
                aktif: cfg.aktif !== false
            };
        }

        function isMesaiDisi() {
            const config = getConfig();
            if (!config.aktif) return false;

            const now = new Date();
            const gun = now.getDay(); // 0=Pazar, 6=Cumartesi
            if (config.haftasonuUyku && (gun === 0 || gun === 6)) return true;

            const hh = now.getHours();
            const mm = now.getMinutes();
            const simdi = hh * 60 + mm;

            const [bh, bm] = config.mesaiBitis.split(':').map(Number);
            const [sh, sm] = config.mesaiBaslangic.split(':').map(Number);
            const bitis = bh * 60 + bm;
            const baslangic = sh * 60 + sm;

            // 17:30 - 23:59 veya 00:00 - 07:30
            return simdi >= bitis || simdi < baslangic;
        }

        function updateScreensaverClock() {
            const name = document.getElementById('screensaver-school-name');
            if (name && panoData) name.textContent = panoData.okulAdi || 'Seyir Dijital Pano';
            const slogan = document.getElementById('screensaver-slogan');
            if (slogan && panoData) { slogan.textContent = panoData.slogan || ''; slogan.style.display = slogan.textContent ? 'block' : 'none'; }
            const logo = document.getElementById('screensaver-logo-img');
            if (logo && panoData && logo.getAttribute('src') !== panoData.okulLogo) logo.src = panoData.okulLogo || 'img/seyir-icon.svg';
            const timeEl = document.getElementById('screensaver-time');
            const dateEl = document.getElementById('screensaver-date');
            const namazEl = document.getElementById('screensaver-namaz-text');

            if (timeEl) {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            if (dateEl) {
                const now = new Date();
                dateEl.textContent = now.toLocaleDateString('tr-TR', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
            }
            if (namazEl && globalNamazTimes && globalNamazTimes.length > 0) {
                const now = new Date();
                const simdi = now.getHours() * 60 + now.getMinutes();
                let sonraki = null;
                for (const v of globalNamazTimes) {
                    const [vh, vm] = v.time.split(':').map(Number);
                    const vMins = vh * 60 + vm;
                    if (vMins > simdi) { sonraki = v; break; }
                }
                if (!sonraki) sonraki = globalNamazTimes[0]; // gece yarısı ötesi
                if (sonraki) {
                    namazEl.textContent = `${sonraki.name}: ${sonraki.time}`;
                }
            }
        }

        function activateScreensaver() {
            if (screensaverActive) return;
            screensaverActive = true;
            gracePeriodActive = false;

            // Okul adını, sloganını ve logosunu doldur
            const nameEl = document.getElementById('screensaver-school-name');
            if (nameEl && panoData && panoData.okulAdi) {
                nameEl.textContent = panoData.okulAdi;
            }
            const sloganEl = document.getElementById('screensaver-slogan');
            if (sloganEl) {
                const sloganMetni = (panoData && panoData.slogan) ? panoData.slogan.trim() : '';
                sloganEl.textContent = sloganMetni;
                sloganEl.style.display = sloganMetni ? 'block' : 'none';
            }
            const logoEl = document.getElementById('screensaver-logo-img');
            if (logoEl && panoData && panoData.okulLogo) {
                logoEl.src = panoData.okulLogo;
            }

            // Canlı hava durumu bilgisini aktar
            const scWeatherText = document.getElementById('screensaver-weather-text');
            const headerWeatherTemp = document.getElementById('header-weather-temp');
            const headerWeatherDesc = document.getElementById('header-weather-desc');
            if (scWeatherText && headerWeatherTemp && headerWeatherTemp.textContent && !headerWeatherTemp.textContent.startsWith('--')) {
                const descStr = headerWeatherDesc ? ` — ${headerWeatherDesc.textContent}` : '';
                scWeatherText.textContent = `${headerWeatherTemp.textContent}${descStr}`;
            }

            overlay.setAttribute('aria-hidden', 'false');
            overlay.classList.add('active');

            updateScreensaverClock();
            screensaverClockInterval = setInterval(updateScreensaverClock, 1000);
        }

        function deactivateScreensaver(graceMode) {
            if (!screensaverActive) return;

            if (graceMode && isMesaiDisi()) {
                // Mesai dışı saatte geçici uyanıklık (3 dk)
                if (gracePeriodActive) return;
                gracePeriodActive = true;
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
                clearInterval(screensaverClockInterval);
                if (gracePeriodTimer) clearTimeout(gracePeriodTimer);
                gracePeriodTimer = setTimeout(() => {
                    gracePeriodActive = false;
                    if (isMesaiDisi()) activateScreensaver();
                }, 3 * 60 * 1000);
                return;
            }

            screensaverActive = false;
            gracePeriodActive = false;
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            clearInterval(screensaverClockInterval);
            if (gracePeriodTimer) { clearTimeout(gracePeriodTimer); gracePeriodTimer = null; }
        }

        function resetIdleTimer() {
            const config = getConfig();
            if (!config.aktif) return;
            clearTimeout(idleTimer);
            const bosMs = config.bosKalmadk * 60 * 1000;
            idleTimer = setTimeout(() => {
                if (!isMesaiDisi()) activateScreensaver();
            }, bosMs);
        }

        // Kullanıcı etkileşimi ekranı uyandırır
        ['mousemove', 'mousedown', 'touchstart', 'keydown', 'click'].forEach(evt => {
            document.addEventListener(evt, () => {
                if (screensaverActive) {
                    deactivateScreensaver(true);
                } else {
                    resetIdleTimer();
                }
            }, { passive: true });
        });

        // Overlay'e tıklayarak da kapat
        overlay.addEventListener('click', () => deactivateScreensaver(true));

        // Her dakika mesai saati kontrolü
        setInterval(() => {
            const config = getConfig();
            if (!config.aktif) {
                if (screensaverActive) deactivateScreensaver(false);
                return;
            }
            if (isMesaiDisi() && !screensaverActive && !gracePeriodActive) {
                activateScreensaver();
            } else if (!isMesaiDisi() && screensaverActive) {
                deactivateScreensaver(false);
            }
        }, 60 * 1000);

        // İlk yüklemede kontrol et
        resetIdleTimer();
        if (isMesaiDisi()) activateScreensaver();
    }

    // Public API
    return {
        init: init,
        getData: () => panoData,
        escapeHtml: escapeHtml
    };

})();
window.PanoTV = PanoTV;

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
    const escapeHtml = PanoTV.escapeHtml;
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
                this.ctx.resume().catch(() => { });
            }
            return this.ctx;
        }

        stop() {
            this.activeOscs.forEach(o => {
                try { o.stop(); o.disconnect(); } catch (e) { }
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
        const panoData = PanoTV.getData();
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
        const panoData = PanoTV.getData();
        if (!toren || !toren.audioId || !window.SeyirAudioStore) return;

        if (seyirPanoAktifTorenAudio) {
            try { seyirPanoAktifTorenAudio.pause(); } catch (e) { }
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
            } catch (err) { }
        } else if (e.key === 'seyir_toren_stop') {
            if (window.SeyirAudioStore) window.SeyirAudioStore.stopAll();
            const overlay = document.getElementById('pano-ceremony-overlay');
            if (overlay) overlay.classList.remove('active');
            seyirPanoAktifTorenAudio = null;
        }
    });

    // 1 Saniyelik Zil Zamanlayıcı Döngüsü
    seyirPanoZilInterval = setInterval(() => {
        const panoData = PanoTV.getData();
        if (!panoData || !panoData.zilYonetimi) return;
        const config = panoData.zilYonetimi;

        const now = new Date();
        const dayOfWeek = now.getDay();
        const isHaftasonu = (dayOfWeek === 0 || dayOfWeek === 6);

        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dakikaStr = `${hh}:${mm}`;
        const dakikaAnahtari = now.toDateString() + ":" + dakikaStr;

        // Ders Zili Kontrolü (Hafta sonu sessizliği ve sistem aktiflik kontrolü)
        const dersZiliCalabilir = (config.aktif !== false) && !(config.haftasonuSessiz !== false && isHaftasonu);
        if (dersZiliCalabilir && seyirPanoSonCalanDakika !== dakikaAnahtari) {
            const aktifZiller = (config.cizelge || []).filter(z => z.aktif !== false);
            const eslesen = aktifZiller.find(z => z.saat === dakikaStr);
            if (eslesen) {
                seyirPanoSonCalanDakika = dakikaAnahtari;

                let customAudioId = null;
                let melodi = eslesen.melodi;

                if (eslesen.customAudioId) {
                    customAudioId = eslesen.customAudioId;
                    melodi = 'custom';
                } else if (!melodi || melodi === 'varsayilan') {
                    if (eslesen.tur === 'ogrenci') {
                        melodi = config.melodiOgrenci || 'modern';
                        if (melodi === 'custom') customAudioId = config.customAudioOgrenci?.id || 'zil_ogrenci_custom';
                    } else if (eslesen.tur === 'ogretmen') {
                        melodi = config.melodiOgretmen || 'chime';
                        if (melodi === 'custom') customAudioId = config.customAudioOgretmen?.id || 'zil_ogretmen_custom';
                    } else if (eslesen.tur === 'cikis') {
                        melodi = config.melodiCikis || 'westminster';
                        if (melodi === 'custom') customAudioId = config.customAudioCikis?.id || 'zil_cikis_custom';
                    } else {
                        melodi = 'modern';
                    }
                } else if (melodi === 'custom') {
                    if (eslesen.tur === 'ogrenci') customAudioId = config.customAudioOgrenci?.id || 'zil_ogrenci_custom';
                    else if (eslesen.tur === 'ogretmen') customAudioId = config.customAudioOgretmen?.id || 'zil_ogretmen_custom';
                    else if (eslesen.tur === 'cikis') customAudioId = config.customAudioCikis?.id || 'zil_cikis_custom';
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
                        } catch (e) { }
                    }, Math.min(2500, sure * 600));
                }
            }
        }

        // Tören & Zamanlanmış Müzikler Kontrolü
        if (config.torenMuzikleri && Array.isArray(config.torenMuzikleri) && config.torenMuzikleri.length > 0) {
            if (seyirPanoSonCalanTorenDakika !== dakikaAnahtari) {
                const aktifTorenler = config.torenMuzikleri.filter(m => m.aktif !== false);
                const eslesenToren = aktifTorenler.find(m => {
                    if (m.saat !== dakikaStr) return false;
                    if (!Array.isArray(m.gunler) || m.gunler.length === 0) return true;
                    return m.gunler.includes(dayOfWeek);
                });
                if (eslesenToren) {
                    seyirPanoSonCalanTorenDakika = dakikaAnahtari;
                    calPanoToren(eslesenToren);
                }
            }
        }
    }, 1000);
}
