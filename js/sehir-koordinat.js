/**
 * SEYİR — Türkiye 81 İl ve 972 İlçe Koordinat ve API Eşleme Modülü
 * Open-Meteo (Hava Durumu) ve AlAdhan (Namaz Vakitleri) için il ve ilçe bazında hassas konum çözümleyici.
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.SeyirKonum = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const SEHIRLER = [
  {
    "plaka": 1,
    "ad": "Adana",
    "ascii": "Adana",
    "enlem": 37,
    "boylam": 35.325,
    "ilceler": [
      {
        "ad": "Aladağ",
        "ascii": "Aladag",
        "enlem": 37.5485,
        "boylam": 35.396
      },
      {
        "ad": "Ceyhan",
        "ascii": "Ceyhan",
        "enlem": 37.0247,
        "boylam": 35.8175
      },
      {
        "ad": "Çukurova",
        "ascii": "Cukurova",
        "enlem": 37.1007,
        "boylam": 35.1533
      },
      {
        "ad": "Feke",
        "ascii": "Feke",
        "enlem": 37.8145,
        "boylam": 35.9123
      },
      {
        "ad": "İmamoğlu",
        "ascii": "Imamoglu",
        "enlem": 37.2651,
        "boylam": 35.6572
      },
      {
        "ad": "Karaisalı",
        "ascii": "Karaisali",
        "enlem": 37.2567,
        "boylam": 35.0589
      },
      {
        "ad": "Karataş",
        "ascii": "Karatas",
        "enlem": 36.5624,
        "boylam": 35.3811
      },
      {
        "ad": "Kozan",
        "ascii": "Kozan",
        "enlem": 37.4507,
        "boylam": 35.8123
      },
      {
        "ad": "Pozantı",
        "ascii": "Pozanti",
        "enlem": 37.4278,
        "boylam": 34.8717
      },
      {
        "ad": "Saimbeyli",
        "ascii": "Saimbeyli",
        "enlem": 37.9863,
        "boylam": 36.0906
      },
      {
        "ad": "Sarıçam",
        "ascii": "Saricam",
        "enlem": 37.1517,
        "boylam": 35.5077
      },
      {
        "ad": "Seyhan",
        "ascii": "Seyhan",
        "enlem": 36.9875,
        "boylam": 35.3059
      },
      {
        "ad": "Tufanbeyli",
        "ascii": "Tufanbeyli",
        "enlem": 38.2633,
        "boylam": 36.2206
      },
      {
        "ad": "Yumurtalık",
        "ascii": "Yumurtalik",
        "enlem": 36.7667,
        "boylam": 35.7833
      },
      {
        "ad": "Yüreğir",
        "ascii": "Yuregir",
        "enlem": 36.9744,
        "boylam": 35.3592
      }
    ]
  },
  {
    "plaka": 2,
    "ad": "Adıyaman",
    "ascii": "Adiyaman",
    "enlem": 37.7644,
    "boylam": 38.2763,
    "ilceler": [
      {
        "ad": "Besni",
        "ascii": "Besni",
        "enlem": 37.6928,
        "boylam": 37.8611
      },
      {
        "ad": "Çelikhan",
        "ascii": "Celikhan",
        "enlem": 38.0256,
        "boylam": 38.2367
      },
      {
        "ad": "Gerger",
        "ascii": "Gerger",
        "enlem": 38.0281,
        "boylam": 39.0342
      },
      {
        "ad": "Gölbaşı",
        "ascii": "Golbasi",
        "enlem": 37.7836,
        "boylam": 37.6367
      },
      {
        "ad": "Kahta",
        "ascii": "Kahta",
        "enlem": 37.8,
        "boylam": 38.7058
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.764,
        "boylam": 38.2764
      },
      {
        "ad": "Samsat",
        "ascii": "Samsat",
        "enlem": 37.5795,
        "boylam": 38.4813
      },
      {
        "ad": "Sincik",
        "ascii": "Sincik",
        "enlem": 38.0365,
        "boylam": 38.6126
      },
      {
        "ad": "Tut",
        "ascii": "Tut",
        "enlem": 37.7953,
        "boylam": 37.9161
      }
    ]
  },
  {
    "plaka": 3,
    "ad": "Afyonkarahisar",
    "ascii": "Afyonkarahisar",
    "enlem": 38.7581,
    "boylam": 30.5386,
    "ilceler": [
      {
        "ad": "Başmakçı",
        "ascii": "Basmakci",
        "enlem": 37.8972,
        "boylam": 30.0117
      },
      {
        "ad": "Bayat",
        "ascii": "Bayat",
        "enlem": 38.9831,
        "boylam": 30.9247
      },
      {
        "ad": "Bolvadin",
        "ascii": "Bolvadin",
        "enlem": 38.7111,
        "boylam": 31.0486
      },
      {
        "ad": "Çay",
        "ascii": "Cay",
        "enlem": 38.5917,
        "boylam": 31.0286
      },
      {
        "ad": "Çobanlar",
        "ascii": "Cobanlar",
        "enlem": 38.7014,
        "boylam": 30.7828
      },
      {
        "ad": "Dazkırı",
        "ascii": "Dazkiri",
        "enlem": 37.9186,
        "boylam": 29.8606
      },
      {
        "ad": "Dinar",
        "ascii": "Dinar",
        "enlem": 38.0717,
        "boylam": 30.1656
      },
      {
        "ad": "Emirdağ",
        "ascii": "Emirdag",
        "enlem": 39.0197,
        "boylam": 31.15
      },
      {
        "ad": "Evciler",
        "ascii": "Evciler",
        "enlem": 38.0414,
        "boylam": 29.8867
      },
      {
        "ad": "Hocalar",
        "ascii": "Hocalar",
        "enlem": 38.5782,
        "boylam": 29.9677
      },
      {
        "ad": "İhsaniye",
        "ascii": "Ihsaniye",
        "enlem": 39.0292,
        "boylam": 30.4164
      },
      {
        "ad": "İscehisar",
        "ascii": "Iscehisar",
        "enlem": 38.8619,
        "boylam": 30.7503
      },
      {
        "ad": "Kızılören",
        "ascii": "Kiziloren",
        "enlem": 38.2581,
        "boylam": 30.1517
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.7569,
        "boylam": 30.5387
      },
      {
        "ad": "Sandıklı",
        "ascii": "Sandikli",
        "enlem": 38.4647,
        "boylam": 30.2695
      },
      {
        "ad": "Sinanpaşa",
        "ascii": "Sinanpasa",
        "enlem": 38.7444,
        "boylam": 30.2428
      },
      {
        "ad": "Sultandağı",
        "ascii": "Sultandagi",
        "enlem": 38.5333,
        "boylam": 31.2333
      },
      {
        "ad": "Şuhut",
        "ascii": "Suhut",
        "enlem": 38.5311,
        "boylam": 30.5458
      }
    ]
  },
  {
    "plaka": 4,
    "ad": "Ağrı",
    "ascii": "Agri",
    "enlem": 39.7225,
    "boylam": 43.0544,
    "ilceler": [
      {
        "ad": "Diyadin",
        "ascii": "Diyadin",
        "enlem": 39.5406,
        "boylam": 43.6713
      },
      {
        "ad": "Doğubayazıt",
        "ascii": "Dogubayazit",
        "enlem": 39.55,
        "boylam": 44.0833
      },
      {
        "ad": "Eleşkirt",
        "ascii": "Eleskirt",
        "enlem": 39.798,
        "boylam": 42.6757
      },
      {
        "ad": "Hamur",
        "ascii": "Hamur",
        "enlem": 39.6056,
        "boylam": 42.985
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.7201,
        "boylam": 43.05
      },
      {
        "ad": "Patnos",
        "ascii": "Patnos",
        "enlem": 39.2358,
        "boylam": 42.8686
      },
      {
        "ad": "Taşlıçay",
        "ascii": "Taslicay",
        "enlem": 39.6297,
        "boylam": 43.3688
      },
      {
        "ad": "Tutak",
        "ascii": "Tutak",
        "enlem": 39.5385,
        "boylam": 42.7659
      }
    ]
  },
  {
    "plaka": 5,
    "ad": "Amasya",
    "ascii": "Amasya",
    "enlem": 40.65,
    "boylam": 35.8333,
    "ilceler": [
      {
        "ad": "Göynücek",
        "ascii": "Goynucek",
        "enlem": 40.3992,
        "boylam": 35.525
      },
      {
        "ad": "Gümüşhacıköy",
        "ascii": "Gumushacikoy",
        "enlem": 40.9253,
        "boylam": 35.2347
      },
      {
        "ad": "Hamamözü",
        "ascii": "Hamamozu",
        "enlem": 40.7848,
        "boylam": 35.0258
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.6503,
        "boylam": 35.8329
      },
      {
        "ad": "Merzifon",
        "ascii": "Merzifon",
        "enlem": 40.8733,
        "boylam": 35.4631
      },
      {
        "ad": "Suluova",
        "ascii": "Suluova",
        "enlem": 40.8313,
        "boylam": 35.6479
      },
      {
        "ad": "Taşova",
        "ascii": "Tasova",
        "enlem": 40.7597,
        "boylam": 36.3225
      }
    ]
  },
  {
    "plaka": 6,
    "ad": "Ankara",
    "ascii": "Ankara",
    "enlem": 39.93,
    "boylam": 32.85,
    "ilceler": [
      {
        "ad": "Akyurt",
        "ascii": "Akyurt",
        "enlem": 40.1313,
        "boylam": 33.0907
      },
      {
        "ad": "Altındağ",
        "ascii": "Altindag",
        "enlem": 39.9477,
        "boylam": 32.8639
      },
      {
        "ad": "Ayaş",
        "ascii": "Ayas",
        "enlem": 40.0154,
        "boylam": 32.3325
      },
      {
        "ad": "Bala",
        "ascii": "Bala",
        "enlem": 39.5542,
        "boylam": 33.1234
      },
      {
        "ad": "Beypazarı",
        "ascii": "Beypazari",
        "enlem": 40.1703,
        "boylam": 31.9211
      },
      {
        "ad": "Çamlıdere",
        "ascii": "Camlidere",
        "enlem": 40.4896,
        "boylam": 32.475
      },
      {
        "ad": "Çankaya",
        "ascii": "Cankaya",
        "enlem": 39.8875,
        "boylam": 32.8567
      },
      {
        "ad": "Çubuk",
        "ascii": "Cubuk",
        "enlem": 40.2386,
        "boylam": 33.0322
      },
      {
        "ad": "Elmadağ",
        "ascii": "Elmadag",
        "enlem": 39.9208,
        "boylam": 33.2308
      },
      {
        "ad": "Etimesgut",
        "ascii": "Etimesgut",
        "enlem": 39.9533,
        "boylam": 32.6328
      },
      {
        "ad": "Evren",
        "ascii": "Evren",
        "enlem": 39.024,
        "boylam": 33.8063
      },
      {
        "ad": "Gölbaşı",
        "ascii": "Golbasi",
        "enlem": 39.7904,
        "boylam": 32.809
      },
      {
        "ad": "Güdül",
        "ascii": "Gudul",
        "enlem": 40.21,
        "boylam": 32.2432
      },
      {
        "ad": "Haymana",
        "ascii": "Haymana",
        "enlem": 39.4311,
        "boylam": 32.4956
      },
      {
        "ad": "Kahramankazan",
        "ascii": "Kahramankazan",
        "enlem": 40.1864,
        "boylam": 32.6627
      },
      {
        "ad": "Kalecik",
        "ascii": "Kalecik",
        "enlem": 40.0972,
        "boylam": 33.4083
      },
      {
        "ad": "Keçiören",
        "ascii": "Kecioren",
        "enlem": 40.0067,
        "boylam": 32.8562
      },
      {
        "ad": "Kızılcahamam",
        "ascii": "Kizilcahamam",
        "enlem": 40.4697,
        "boylam": 32.6506
      },
      {
        "ad": "Mamak",
        "ascii": "Mamak",
        "enlem": 39.9404,
        "boylam": 32.9101
      },
      {
        "ad": "Nallıhan",
        "ascii": "Nallihan",
        "enlem": 40.1859,
        "boylam": 31.3508
      },
      {
        "ad": "Polatlı",
        "ascii": "Polatli",
        "enlem": 39.5842,
        "boylam": 32.1472
      },
      {
        "ad": "Pursaklar",
        "ascii": "Pursaklar",
        "enlem": 40.032,
        "boylam": 32.8953
      },
      {
        "ad": "Sincan",
        "ascii": "Sincan",
        "enlem": 39.9723,
        "boylam": 32.5841
      },
      {
        "ad": "Şereflikoçhisar",
        "ascii": "Sereflikochisar",
        "enlem": 38.9451,
        "boylam": 33.543
      },
      {
        "ad": "Yenimahalle",
        "ascii": "Yenimahalle",
        "enlem": 39.9583,
        "boylam": 32.7552
      }
    ]
  },
  {
    "plaka": 7,
    "ad": "Antalya",
    "ascii": "Antalya",
    "enlem": 36.9081,
    "boylam": 30.6956,
    "ilceler": [
      {
        "ad": "Akseki",
        "ascii": "Akseki",
        "enlem": 37.0486,
        "boylam": 31.79
      },
      {
        "ad": "Aksu",
        "ascii": "Aksu",
        "enlem": 36.9539,
        "boylam": 30.8478
      },
      {
        "ad": "Alanya",
        "ascii": "Alanya",
        "enlem": 36.5436,
        "boylam": 31.9997
      },
      {
        "ad": "Demre",
        "ascii": "Demre",
        "enlem": 36.2444,
        "boylam": 29.985
      },
      {
        "ad": "Döşemealtı",
        "ascii": "Dosemealti",
        "enlem": 37.0233,
        "boylam": 30.6025
      },
      {
        "ad": "Elmalı",
        "ascii": "Elmali",
        "enlem": 36.7358,
        "boylam": 29.9178
      },
      {
        "ad": "Finike",
        "ascii": "Finike",
        "enlem": 36.3,
        "boylam": 30.15
      },
      {
        "ad": "Gazipaşa",
        "ascii": "Gazipasa",
        "enlem": 36.2694,
        "boylam": 32.3179
      },
      {
        "ad": "Gündoğmuş",
        "ascii": "Gundogmus",
        "enlem": 36.8134,
        "boylam": 31.9997
      },
      {
        "ad": "İbradı",
        "ascii": "Ibradi",
        "enlem": 37.0969,
        "boylam": 31.5992
      },
      {
        "ad": "Kaş",
        "ascii": "Kas",
        "enlem": 36.2018,
        "boylam": 29.6377
      },
      {
        "ad": "Kemer",
        "ascii": "Kemer",
        "enlem": 36.6,
        "boylam": 30.55
      },
      {
        "ad": "Kepez",
        "ascii": "Kepez",
        "enlem": 37.0247,
        "boylam": 30.7133
      },
      {
        "ad": "Konyaaltı",
        "ascii": "Konyaalti",
        "enlem": 36.8137,
        "boylam": 30.4646
      },
      {
        "ad": "Korkuteli",
        "ascii": "Korkuteli",
        "enlem": 37.065,
        "boylam": 30.1956
      },
      {
        "ad": "Kumluca",
        "ascii": "Kumluca",
        "enlem": 36.3703,
        "boylam": 30.2869
      },
      {
        "ad": "Manavgat",
        "ascii": "Manavgat",
        "enlem": 36.7867,
        "boylam": 31.4431
      },
      {
        "ad": "Muratpaşa",
        "ascii": "Muratpasa",
        "enlem": 36.8874,
        "boylam": 30.7456
      },
      {
        "ad": "Serik",
        "ascii": "Serik",
        "enlem": 36.9169,
        "boylam": 31.0989
      }
    ]
  },
  {
    "plaka": 8,
    "ad": "Artvin",
    "ascii": "Artvin",
    "enlem": 41.1822,
    "boylam": 41.8194,
    "ilceler": [
      {
        "ad": "Ardanuç",
        "ascii": "Ardanuc",
        "enlem": 41.1233,
        "boylam": 42.0647
      },
      {
        "ad": "Arhavi",
        "ascii": "Arhavi",
        "enlem": 41.3531,
        "boylam": 41.31
      },
      {
        "ad": "Borçka",
        "ascii": "Borcka",
        "enlem": 41.3579,
        "boylam": 41.6658
      },
      {
        "ad": "Hopa",
        "ascii": "Hopa",
        "enlem": 41.396,
        "boylam": 41.422
      },
      {
        "ad": "Kemalpaşa",
        "ascii": "Kemalpasa",
        "enlem": 41.4784,
        "boylam": 41.515
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.1831,
        "boylam": 41.8287
      },
      {
        "ad": "Murgul",
        "ascii": "Murgul",
        "enlem": 41.2794,
        "boylam": 41.5551
      },
      {
        "ad": "Şavşat",
        "ascii": "Savsat",
        "enlem": 41.2534,
        "boylam": 42.3553
      },
      {
        "ad": "Yusufeli",
        "ascii": "Yusufeli",
        "enlem": 40.8204,
        "boylam": 41.5374
      }
    ]
  },
  {
    "plaka": 9,
    "ad": "Aydın",
    "ascii": "Aydin",
    "enlem": 37.8481,
    "boylam": 27.8453,
    "ilceler": [
      {
        "ad": "Bozdoğan",
        "ascii": "Bozdogan",
        "enlem": 37.6713,
        "boylam": 28.314
      },
      {
        "ad": "Buharkent",
        "ascii": "Buharkent",
        "enlem": 37.964,
        "boylam": 28.7427
      },
      {
        "ad": "Çine",
        "ascii": "Cine",
        "enlem": 37.6117,
        "boylam": 28.0614
      },
      {
        "ad": "Didim",
        "ascii": "Didim",
        "enlem": 37.3756,
        "boylam": 27.2678
      },
      {
        "ad": "Efeler",
        "ascii": "Efeler",
        "enlem": 37.8524,
        "boylam": 27.8777
      },
      {
        "ad": "Germencik",
        "ascii": "Germencik",
        "enlem": 37.8706,
        "boylam": 27.6028
      },
      {
        "ad": "İncirliova",
        "ascii": "Incirliova",
        "enlem": 37.8522,
        "boylam": 27.7236
      },
      {
        "ad": "Karacasu",
        "ascii": "Karacasu",
        "enlem": 37.7282,
        "boylam": 28.6057
      },
      {
        "ad": "Karpuzlu",
        "ascii": "Karpuzlu",
        "enlem": 37.5586,
        "boylam": 27.8353
      },
      {
        "ad": "Koçarlı",
        "ascii": "Kocarli",
        "enlem": 37.7611,
        "boylam": 27.7058
      },
      {
        "ad": "Köşk",
        "ascii": "Kosk",
        "enlem": 37.8533,
        "boylam": 28.0517
      },
      {
        "ad": "Kuşadası",
        "ascii": "Kusadasi",
        "enlem": 37.7809,
        "boylam": 27.3129
      },
      {
        "ad": "Kuyucak",
        "ascii": "Kuyucak",
        "enlem": 37.9133,
        "boylam": 28.4592
      },
      {
        "ad": "Nazilli",
        "ascii": "Nazilli",
        "enlem": 37.9125,
        "boylam": 28.3206
      },
      {
        "ad": "Söke",
        "ascii": "Soke",
        "enlem": 37.7512,
        "boylam": 27.4103
      },
      {
        "ad": "Sultanhisar",
        "ascii": "Sultanhisar",
        "enlem": 37.8897,
        "boylam": 28.1575
      },
      {
        "ad": "Yenipazar",
        "ascii": "Yenipazar",
        "enlem": 37.8242,
        "boylam": 28.1972
      }
    ]
  },
  {
    "plaka": 10,
    "ad": "Balıkesir",
    "ascii": "Balikesir",
    "enlem": 39.6511,
    "boylam": 27.8842,
    "ilceler": [
      {
        "ad": "Altıeylül",
        "ascii": "Altieylul",
        "enlem": 39.5601,
        "boylam": 27.8307
      },
      {
        "ad": "Ayvalık",
        "ascii": "Ayvalik",
        "enlem": 39.319,
        "boylam": 26.6954
      },
      {
        "ad": "Balya",
        "ascii": "Balya",
        "enlem": 39.7486,
        "boylam": 27.5789
      },
      {
        "ad": "Bandırma",
        "ascii": "Bandirma",
        "enlem": 40.3542,
        "boylam": 27.9725
      },
      {
        "ad": "Bigadiç",
        "ascii": "Bigadic",
        "enlem": 39.3925,
        "boylam": 28.1311
      },
      {
        "ad": "Burhaniye",
        "ascii": "Burhaniye",
        "enlem": 39.5004,
        "boylam": 26.9727
      },
      {
        "ad": "Dursunbey",
        "ascii": "Dursunbey",
        "enlem": 39.586,
        "boylam": 28.6257
      },
      {
        "ad": "Edremit",
        "ascii": "Edremit",
        "enlem": 39.5961,
        "boylam": 27.0244
      },
      {
        "ad": "Erdek",
        "ascii": "Erdek",
        "enlem": 40.3996,
        "boylam": 27.7935
      },
      {
        "ad": "Gömeç",
        "ascii": "Gomec",
        "enlem": 39.3902,
        "boylam": 26.8413
      },
      {
        "ad": "Gönen",
        "ascii": "Gonen",
        "enlem": 40.1049,
        "boylam": 27.654
      },
      {
        "ad": "Havran",
        "ascii": "Havran",
        "enlem": 39.5583,
        "boylam": 27.0983
      },
      {
        "ad": "İvrindi",
        "ascii": "Ivrindi",
        "enlem": 39.5839,
        "boylam": 27.4864
      },
      {
        "ad": "Karesi",
        "ascii": "Karesi",
        "enlem": 39.794,
        "boylam": 27.89
      },
      {
        "ad": "Kepsut",
        "ascii": "Kepsut",
        "enlem": 39.6889,
        "boylam": 28.1522
      },
      {
        "ad": "Manyas",
        "ascii": "Manyas",
        "enlem": 40.0464,
        "boylam": 27.97
      },
      {
        "ad": "Marmara",
        "ascii": "Marmara",
        "enlem": 40.5863,
        "boylam": 27.5554
      },
      {
        "ad": "Savaştepe",
        "ascii": "Savastepe",
        "enlem": 39.3832,
        "boylam": 27.6561
      },
      {
        "ad": "Sındırgı",
        "ascii": "Sindirgi",
        "enlem": 39.2413,
        "boylam": 28.1784
      },
      {
        "ad": "Susurluk",
        "ascii": "Susurluk",
        "enlem": 39.9136,
        "boylam": 28.1578
      }
    ]
  },
  {
    "plaka": 11,
    "ad": "Bilecik",
    "ascii": "Bilecik",
    "enlem": 40.1431,
    "boylam": 29.9792,
    "ilceler": [
      {
        "ad": "Bozüyük",
        "ascii": "Bozuyuk",
        "enlem": 39.9078,
        "boylam": 30.0367
      },
      {
        "ad": "Gölpazarı",
        "ascii": "Golpazari",
        "enlem": 40.2847,
        "boylam": 30.3172
      },
      {
        "ad": "İnhisar",
        "ascii": "Inhisar",
        "enlem": 40.0493,
        "boylam": 30.3852
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.1435,
        "boylam": 29.9753
      },
      {
        "ad": "Osmaneli",
        "ascii": "Osmaneli",
        "enlem": 40.3572,
        "boylam": 30.0142
      },
      {
        "ad": "Pazaryeri",
        "ascii": "Pazaryeri",
        "enlem": 39.9939,
        "boylam": 29.9042
      },
      {
        "ad": "Söğüt",
        "ascii": "Sogut",
        "enlem": 40.0143,
        "boylam": 30.1849
      },
      {
        "ad": "Yenipazar",
        "ascii": "Yenipazar",
        "enlem": 40.1783,
        "boylam": 30.52
      }
    ]
  },
  {
    "plaka": 12,
    "ad": "Bingöl",
    "ascii": "Bingol",
    "enlem": 38.8861,
    "boylam": 40.5017,
    "ilceler": [
      {
        "ad": "Adaklı",
        "ascii": "Adakli",
        "enlem": 39.2262,
        "boylam": 40.4828
      },
      {
        "ad": "Genç",
        "ascii": "Genc",
        "enlem": 38.7477,
        "boylam": 40.5534
      },
      {
        "ad": "Karlıova",
        "ascii": "Karliova",
        "enlem": 39.2904,
        "boylam": 41.0059
      },
      {
        "ad": "Kiğı",
        "ascii": "Kigi",
        "enlem": 39.3136,
        "boylam": 40.3503
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.8852,
        "boylam": 40.4966
      },
      {
        "ad": "Solhan",
        "ascii": "Solhan",
        "enlem": 38.9652,
        "boylam": 41.0544
      },
      {
        "ad": "Yayladere",
        "ascii": "Yayladere",
        "enlem": 39.2043,
        "boylam": 40.1008
      },
      {
        "ad": "Yedisu",
        "ascii": "Yedisu",
        "enlem": 39.4328,
        "boylam": 40.5337
      }
    ]
  },
  {
    "plaka": 13,
    "ad": "Bitlis",
    "ascii": "Bitlis",
    "enlem": 38.4,
    "boylam": 42.1167,
    "ilceler": [
      {
        "ad": "Adilcevaz",
        "ascii": "Adilcevaz",
        "enlem": 38.7991,
        "boylam": 42.7316
      },
      {
        "ad": "Ahlat",
        "ascii": "Ahlat",
        "enlem": 38.7489,
        "boylam": 42.4801
      },
      {
        "ad": "Güroymak",
        "ascii": "Guroymak",
        "enlem": 38.5758,
        "boylam": 42.0156
      },
      {
        "ad": "Hizan",
        "ascii": "Hizan",
        "enlem": 38.225,
        "boylam": 42.4183
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.4002,
        "boylam": 42.1081
      },
      {
        "ad": "Mutki",
        "ascii": "Mutki",
        "enlem": 38.4062,
        "boylam": 41.9202
      },
      {
        "ad": "Tatvan",
        "ascii": "Tatvan",
        "enlem": 38.5066,
        "boylam": 42.2816
      }
    ]
  },
  {
    "plaka": 14,
    "ad": "Bolu",
    "ascii": "Bolu",
    "enlem": 40.7333,
    "boylam": 31.6,
    "ilceler": [
      {
        "ad": "Dörtdivan",
        "ascii": "Dortdivan",
        "enlem": 40.7205,
        "boylam": 32.0631
      },
      {
        "ad": "Gerede",
        "ascii": "Gerede",
        "enlem": 40.8008,
        "boylam": 32.1969
      },
      {
        "ad": "Göynük",
        "ascii": "Goynuk",
        "enlem": 40.4003,
        "boylam": 30.7883
      },
      {
        "ad": "Kıbrıscık",
        "ascii": "Kibriscik",
        "enlem": 40.4078,
        "boylam": 31.8519
      },
      {
        "ad": "Mengen",
        "ascii": "Mengen",
        "enlem": 40.9388,
        "boylam": 32.0764
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.7345,
        "boylam": 31.6157
      },
      {
        "ad": "Mudurnu",
        "ascii": "Mudurnu",
        "enlem": 40.473,
        "boylam": 31.2076
      },
      {
        "ad": "Seben",
        "ascii": "Seben",
        "enlem": 40.4113,
        "boylam": 31.5736
      },
      {
        "ad": "Yeniçağa",
        "ascii": "Yenicaga",
        "enlem": 40.7711,
        "boylam": 32.0337
      }
    ]
  },
  {
    "plaka": 15,
    "ad": "Burdur",
    "ascii": "Burdur",
    "enlem": 37.7167,
    "boylam": 30.2833,
    "ilceler": [
      {
        "ad": "Ağlasun",
        "ascii": "Aglasun",
        "enlem": 37.6494,
        "boylam": 30.5342
      },
      {
        "ad": "Altınyayla",
        "ascii": "Altinyayla",
        "enlem": 36.9972,
        "boylam": 29.5458
      },
      {
        "ad": "Bucak",
        "ascii": "Bucak",
        "enlem": 37.4592,
        "boylam": 30.595
      },
      {
        "ad": "Çavdır",
        "ascii": "Cavdir",
        "enlem": 37.155,
        "boylam": 29.6939
      },
      {
        "ad": "Çeltikçi",
        "ascii": "Celtikci",
        "enlem": 37.5295,
        "boylam": 30.4803
      },
      {
        "ad": "Gölhisar",
        "ascii": "Golhisar",
        "enlem": 37.1459,
        "boylam": 29.5088
      },
      {
        "ad": "Karamanlı",
        "ascii": "Karamanli",
        "enlem": 37.373,
        "boylam": 29.8231
      },
      {
        "ad": "Kemer",
        "ascii": "Kemer",
        "enlem": 37.3522,
        "boylam": 30.0631
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.7248,
        "boylam": 30.2887
      },
      {
        "ad": "Tefenni",
        "ascii": "Tefenni",
        "enlem": 37.3097,
        "boylam": 29.7754
      },
      {
        "ad": "Yeşilova",
        "ascii": "Yesilova",
        "enlem": 37.5081,
        "boylam": 29.7547
      }
    ]
  },
  {
    "plaka": 16,
    "ad": "Bursa",
    "ascii": "Bursa",
    "enlem": 40.1833,
    "boylam": 29.0667,
    "ilceler": [
      {
        "ad": "Büyükorhan",
        "ascii": "Buyukorhan",
        "enlem": 39.771,
        "boylam": 28.8861
      },
      {
        "ad": "Gemlik",
        "ascii": "Gemlik",
        "enlem": 40.4309,
        "boylam": 29.1597
      },
      {
        "ad": "Gürsu",
        "ascii": "Gursu",
        "enlem": 40.2188,
        "boylam": 29.1949
      },
      {
        "ad": "Harmancık",
        "ascii": "Harmancik",
        "enlem": 39.6761,
        "boylam": 29.1553
      },
      {
        "ad": "İnegöl",
        "ascii": "Inegol",
        "enlem": 40.0806,
        "boylam": 29.5097
      },
      {
        "ad": "İznik",
        "ascii": "Iznik",
        "enlem": 40.4286,
        "boylam": 29.7211
      },
      {
        "ad": "Karacabey",
        "ascii": "Karacabey",
        "enlem": 40.2132,
        "boylam": 28.3612
      },
      {
        "ad": "Keles",
        "ascii": "Keles",
        "enlem": 39.9136,
        "boylam": 29.2294
      },
      {
        "ad": "Kestel",
        "ascii": "Kestel",
        "enlem": 40.1983,
        "boylam": 29.2124
      },
      {
        "ad": "Mudanya",
        "ascii": "Mudanya",
        "enlem": 40.3753,
        "boylam": 28.8822
      },
      {
        "ad": "Mustafakemalpaşa",
        "ascii": "Mustafakemalpasa",
        "enlem": 40.0382,
        "boylam": 28.4087
      },
      {
        "ad": "Nilüfer",
        "ascii": "Nilufer",
        "enlem": 40.2843,
        "boylam": 28.9504
      },
      {
        "ad": "Orhaneli",
        "ascii": "Orhaneli",
        "enlem": 39.9033,
        "boylam": 28.9906
      },
      {
        "ad": "Orhangazi",
        "ascii": "Orhangazi",
        "enlem": 40.4892,
        "boylam": 29.3089
      },
      {
        "ad": "Osmangazi",
        "ascii": "Osmangazi",
        "enlem": 40.2259,
        "boylam": 29.0439
      },
      {
        "ad": "Yenişehir",
        "ascii": "Yenisehir",
        "enlem": 40.2644,
        "boylam": 29.6531
      },
      {
        "ad": "Yıldırım",
        "ascii": "Yildirim",
        "enlem": 40.2112,
        "boylam": 29.1391
      }
    ]
  },
  {
    "plaka": 17,
    "ad": "Çanakkale",
    "ascii": "Canakkale",
    "enlem": 40.15,
    "boylam": 26.4,
    "ilceler": [
      {
        "ad": "Ayvacık",
        "ascii": "Ayvacik",
        "enlem": 39.6011,
        "boylam": 26.4047
      },
      {
        "ad": "Bayramiç",
        "ascii": "Bayramic",
        "enlem": 39.8086,
        "boylam": 26.6098
      },
      {
        "ad": "Biga",
        "ascii": "Biga",
        "enlem": 40.2281,
        "boylam": 27.2422
      },
      {
        "ad": "Bozcaada",
        "ascii": "Bozcaada",
        "enlem": 39.835,
        "boylam": 26.0697
      },
      {
        "ad": "Çan",
        "ascii": "Can",
        "enlem": 40.0333,
        "boylam": 27.05
      },
      {
        "ad": "Eceabat",
        "ascii": "Eceabat",
        "enlem": 40.1842,
        "boylam": 26.3575
      },
      {
        "ad": "Ezine",
        "ascii": "Ezine",
        "enlem": 39.7856,
        "boylam": 26.3408
      },
      {
        "ad": "Gelibolu",
        "ascii": "Gelibolu",
        "enlem": 40.5177,
        "boylam": 26.7887
      },
      {
        "ad": "Gökçeada",
        "ascii": "Gokceada",
        "enlem": 40.2011,
        "boylam": 25.909
      },
      {
        "ad": "Lapseki",
        "ascii": "Lapseki",
        "enlem": 40.3442,
        "boylam": 26.6856
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.1535,
        "boylam": 26.4141
      },
      {
        "ad": "Yenice",
        "ascii": "Yenice",
        "enlem": 39.9308,
        "boylam": 27.2581
      }
    ]
  },
  {
    "plaka": 18,
    "ad": "Çankırı",
    "ascii": "Cankiri",
    "enlem": 40.6,
    "boylam": 33.6167,
    "ilceler": [
      {
        "ad": "Atkaracalar",
        "ascii": "Atkaracalar",
        "enlem": 40.8159,
        "boylam": 33.0756
      },
      {
        "ad": "Bayramören",
        "ascii": "Bayramoren",
        "enlem": 40.9433,
        "boylam": 33.203
      },
      {
        "ad": "Çerkeş",
        "ascii": "Cerkes",
        "enlem": 40.8116,
        "boylam": 32.8936
      },
      {
        "ad": "Eldivan",
        "ascii": "Eldivan",
        "enlem": 40.5297,
        "boylam": 33.499
      },
      {
        "ad": "Ilgaz",
        "ascii": "Ilgaz",
        "enlem": 40.9251,
        "boylam": 33.6259
      },
      {
        "ad": "Kızılırmak",
        "ascii": "Kizilirmak",
        "enlem": 40.3456,
        "boylam": 33.9864
      },
      {
        "ad": "Korgun",
        "ascii": "Korgun",
        "enlem": 40.7348,
        "boylam": 33.5184
      },
      {
        "ad": "Kurşunlu",
        "ascii": "Kursunlu",
        "enlem": 40.841,
        "boylam": 33.2603
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.596,
        "boylam": 33.6148
      },
      {
        "ad": "Orta",
        "ascii": "Orta",
        "enlem": 40.6242,
        "boylam": 33.1093
      },
      {
        "ad": "Şabanözü",
        "ascii": "Sabanozu",
        "enlem": 40.4825,
        "boylam": 33.2835
      },
      {
        "ad": "Yapraklı",
        "ascii": "Yaprakli",
        "enlem": 40.7579,
        "boylam": 33.7782
      }
    ]
  },
  {
    "plaka": 19,
    "ad": "Çorum",
    "ascii": "Corum",
    "enlem": 40.5489,
    "boylam": 34.9533,
    "ilceler": [
      {
        "ad": "Alaca",
        "ascii": "Alaca",
        "enlem": 40.1683,
        "boylam": 34.8425
      },
      {
        "ad": "Bayat",
        "ascii": "Bayat",
        "enlem": 40.646,
        "boylam": 34.261
      },
      {
        "ad": "Boğazkale",
        "ascii": "Bogazkale",
        "enlem": 40.0219,
        "boylam": 34.6095
      },
      {
        "ad": "Dodurga",
        "ascii": "Dodurga",
        "enlem": 40.8549,
        "boylam": 34.807
      },
      {
        "ad": "İskilip",
        "ascii": "Iskilip",
        "enlem": 40.7353,
        "boylam": 34.4739
      },
      {
        "ad": "Kargı",
        "ascii": "Kargi",
        "enlem": 41.1337,
        "boylam": 34.4874
      },
      {
        "ad": "Laçin",
        "ascii": "Lacin",
        "enlem": 40.7749,
        "boylam": 34.8807
      },
      {
        "ad": "Mecitözü",
        "ascii": "Mecitozu",
        "enlem": 40.52,
        "boylam": 35.2953
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.5491,
        "boylam": 34.9602
      },
      {
        "ad": "Oğuzlar",
        "ascii": "Oguzlar",
        "enlem": 40.7535,
        "boylam": 34.7027
      },
      {
        "ad": "Ortaköy",
        "ascii": "Ortakoy",
        "enlem": 40.2735,
        "boylam": 35.2517
      },
      {
        "ad": "Osmancık",
        "ascii": "Osmancik",
        "enlem": 40.9782,
        "boylam": 34.8047
      },
      {
        "ad": "Sungurlu",
        "ascii": "Sungurlu",
        "enlem": 40.1675,
        "boylam": 34.3739
      },
      {
        "ad": "Uğurludağ",
        "ascii": "Ugurludag",
        "enlem": 40.4463,
        "boylam": 34.4526
      }
    ]
  },
  {
    "plaka": 20,
    "ad": "Denizli",
    "ascii": "Denizli",
    "enlem": 37.7731,
    "boylam": 29.0878,
    "ilceler": [
      {
        "ad": "Acıpayam",
        "ascii": "Acipayam",
        "enlem": 37.4239,
        "boylam": 29.3494
      },
      {
        "ad": "Babadağ",
        "ascii": "Babadag",
        "enlem": 37.8076,
        "boylam": 28.8567
      },
      {
        "ad": "Baklan",
        "ascii": "Baklan",
        "enlem": 37.9769,
        "boylam": 29.6086
      },
      {
        "ad": "Bekilli",
        "ascii": "Bekilli",
        "enlem": 38.2311,
        "boylam": 29.4197
      },
      {
        "ad": "Beyağaç",
        "ascii": "Beyagac",
        "enlem": 37.2353,
        "boylam": 28.8961
      },
      {
        "ad": "Bozkurt",
        "ascii": "Bozkurt",
        "enlem": 37.8242,
        "boylam": 29.6097
      },
      {
        "ad": "Buldan",
        "ascii": "Buldan",
        "enlem": 38.045,
        "boylam": 28.8306
      },
      {
        "ad": "Çal",
        "ascii": "Cal",
        "enlem": 38.0836,
        "boylam": 29.3989
      },
      {
        "ad": "Çameli",
        "ascii": "Cameli",
        "enlem": 37.0761,
        "boylam": 29.3447
      },
      {
        "ad": "Çardak",
        "ascii": "Cardak",
        "enlem": 37.8269,
        "boylam": 29.6683
      },
      {
        "ad": "Çivril",
        "ascii": "Civril",
        "enlem": 38.3014,
        "boylam": 29.7386
      },
      {
        "ad": "Güney",
        "ascii": "Guney",
        "enlem": 38.1544,
        "boylam": 29.0678
      },
      {
        "ad": "Honaz",
        "ascii": "Honaz",
        "enlem": 37.7573,
        "boylam": 29.27
      },
      {
        "ad": "Kale",
        "ascii": "Kale",
        "enlem": 37.4392,
        "boylam": 28.8453
      },
      {
        "ad": "Merkezefendi",
        "ascii": "Merkezefendi",
        "enlem": 37.7918,
        "boylam": 29.0667
      },
      {
        "ad": "Pamukkale",
        "ascii": "Pamukkale",
        "enlem": 37.9165,
        "boylam": 29.1193
      },
      {
        "ad": "Sarayköy",
        "ascii": "Saraykoy",
        "enlem": 37.9245,
        "boylam": 28.9252
      },
      {
        "ad": "Serinhisar",
        "ascii": "Serinhisar",
        "enlem": 37.581,
        "boylam": 29.2664
      },
      {
        "ad": "Tavas",
        "ascii": "Tavas",
        "enlem": 37.5735,
        "boylam": 29.0706
      }
    ]
  },
  {
    "plaka": 21,
    "ad": "Diyarbakır",
    "ascii": "Diyarbakir",
    "enlem": 37.9108,
    "boylam": 40.2367,
    "ilceler": [
      {
        "ad": "Bağlar",
        "ascii": "Baglar",
        "enlem": 37.9137,
        "boylam": 40.2058
      },
      {
        "ad": "Bismil",
        "ascii": "Bismil",
        "enlem": 37.8451,
        "boylam": 40.6593
      },
      {
        "ad": "Çermik",
        "ascii": "Cermik",
        "enlem": 38.1354,
        "boylam": 39.445
      },
      {
        "ad": "Çınar",
        "ascii": "Cinar",
        "enlem": 37.7256,
        "boylam": 40.4147
      },
      {
        "ad": "Çüngüş",
        "ascii": "Cungus",
        "enlem": 38.2122,
        "boylam": 39.2884
      },
      {
        "ad": "Dicle",
        "ascii": "Dicle",
        "enlem": 38.3657,
        "boylam": 40.0645
      },
      {
        "ad": "Eğil",
        "ascii": "Egil",
        "enlem": 38.2575,
        "boylam": 40.0744
      },
      {
        "ad": "Ergani",
        "ascii": "Ergani",
        "enlem": 38.269,
        "boylam": 39.7545
      },
      {
        "ad": "Hani",
        "ascii": "Hani",
        "enlem": 38.4074,
        "boylam": 40.3858
      },
      {
        "ad": "Hazro",
        "ascii": "Hazro",
        "enlem": 38.249,
        "boylam": 40.7713
      },
      {
        "ad": "Kayapınar",
        "ascii": "Kayapinar",
        "enlem": 37.9373,
        "boylam": 40.1776
      },
      {
        "ad": "Kocaköy",
        "ascii": "Kocakoy",
        "enlem": 38.2889,
        "boylam": 40.4979
      },
      {
        "ad": "Kulp",
        "ascii": "Kulp",
        "enlem": 38.4975,
        "boylam": 41.0067
      },
      {
        "ad": "Lice",
        "ascii": "Lice",
        "enlem": 38.4549,
        "boylam": 40.6519
      },
      {
        "ad": "Silvan",
        "ascii": "Silvan",
        "enlem": 38.1371,
        "boylam": 41.0082
      },
      {
        "ad": "Sur",
        "ascii": "Sur",
        "enlem": 37.9135,
        "boylam": 40.2286
      },
      {
        "ad": "Yenişehir",
        "ascii": "Yenisehir",
        "enlem": 37.9415,
        "boylam": 40.138
      }
    ]
  },
  {
    "plaka": 22,
    "ad": "Edirne",
    "ascii": "Edirne",
    "enlem": 41.6781,
    "boylam": 26.5594,
    "ilceler": [
      {
        "ad": "Enez",
        "ascii": "Enez",
        "enlem": 40.7247,
        "boylam": 26.0825
      },
      {
        "ad": "Havsa",
        "ascii": "Havsa",
        "enlem": 41.549,
        "boylam": 26.8221
      },
      {
        "ad": "İpsala",
        "ascii": "Ipsala",
        "enlem": 40.9181,
        "boylam": 26.3831
      },
      {
        "ad": "Keşan",
        "ascii": "Kesan",
        "enlem": 40.8558,
        "boylam": 26.6303
      },
      {
        "ad": "Lalapaşa",
        "ascii": "Lalapasa",
        "enlem": 41.8797,
        "boylam": 26.769
      },
      {
        "ad": "Meriç",
        "ascii": "Meric",
        "enlem": 41.1918,
        "boylam": 26.421
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.6759,
        "boylam": 26.5587
      },
      {
        "ad": "Süloğlu",
        "ascii": "Suloglu",
        "enlem": 41.769,
        "boylam": 26.91
      },
      {
        "ad": "Uzunköprü",
        "ascii": "Uzunkopru",
        "enlem": 41.2669,
        "boylam": 26.6875
      }
    ]
  },
  {
    "plaka": 23,
    "ad": "Elazığ",
    "ascii": "Elazig",
    "enlem": 38.6667,
    "boylam": 39.2167,
    "ilceler": [
      {
        "ad": "Ağın",
        "ascii": "Agin",
        "enlem": 38.9379,
        "boylam": 38.7116
      },
      {
        "ad": "Alacakaya",
        "ascii": "Alacakaya",
        "enlem": 38.4746,
        "boylam": 39.8343
      },
      {
        "ad": "Arıcak",
        "ascii": "Aricak",
        "enlem": 38.5634,
        "boylam": 40.1248
      },
      {
        "ad": "Baskil",
        "ascii": "Baskil",
        "enlem": 38.5687,
        "boylam": 38.8163
      },
      {
        "ad": "Karakoçan",
        "ascii": "Karakocan",
        "enlem": 38.95,
        "boylam": 40.0333
      },
      {
        "ad": "Keban",
        "ascii": "Keban",
        "enlem": 38.7938,
        "boylam": 38.7352
      },
      {
        "ad": "Kovancılar",
        "ascii": "Kovancilar",
        "enlem": 38.7188,
        "boylam": 39.8627
      },
      {
        "ad": "Maden",
        "ascii": "Maden",
        "enlem": 38.3867,
        "boylam": 39.6641
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.6763,
        "boylam": 39.2218
      },
      {
        "ad": "Palu",
        "ascii": "Palu",
        "enlem": 38.6914,
        "boylam": 39.9198
      },
      {
        "ad": "Sivrice",
        "ascii": "Sivrice",
        "enlem": 38.4422,
        "boylam": 39.3094
      }
    ]
  },
  {
    "plaka": 24,
    "ad": "Erzincan",
    "ascii": "Erzincan",
    "enlem": 39.7464,
    "boylam": 39.4914,
    "ilceler": [
      {
        "ad": "Çayırlı",
        "ascii": "Cayirli",
        "enlem": 39.8077,
        "boylam": 40.028
      },
      {
        "ad": "İliç",
        "ascii": "Ilic",
        "enlem": 39.4511,
        "boylam": 38.5584
      },
      {
        "ad": "Kemah",
        "ascii": "Kemah",
        "enlem": 39.5961,
        "boylam": 39.0233
      },
      {
        "ad": "Kemaliye",
        "ascii": "Kemaliye",
        "enlem": 39.2629,
        "boylam": 38.4967
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.7496,
        "boylam": 39.4941
      },
      {
        "ad": "Otlukbeli",
        "ascii": "Otlukbeli",
        "enlem": 39.97,
        "boylam": 40.0187
      },
      {
        "ad": "Refahiye",
        "ascii": "Refahiye",
        "enlem": 39.8932,
        "boylam": 38.7661
      },
      {
        "ad": "Tercan",
        "ascii": "Tercan",
        "enlem": 39.7771,
        "boylam": 40.3778
      },
      {
        "ad": "Üzümlü",
        "ascii": "Uzumlu",
        "enlem": 39.7095,
        "boylam": 39.7002
      }
    ]
  },
  {
    "plaka": 25,
    "ad": "Erzurum",
    "ascii": "Erzurum",
    "enlem": 39.9097,
    "boylam": 41.2756,
    "ilceler": [
      {
        "ad": "Aşkale",
        "ascii": "Askale",
        "enlem": 39.9172,
        "boylam": 40.6848
      },
      {
        "ad": "Aziziye",
        "ascii": "Aziziye",
        "enlem": 40.0772,
        "boylam": 40.9845
      },
      {
        "ad": "Çat",
        "ascii": "Cat",
        "enlem": 39.6064,
        "boylam": 40.9684
      },
      {
        "ad": "Hınıs",
        "ascii": "Hinis",
        "enlem": 39.3577,
        "boylam": 41.6925
      },
      {
        "ad": "Horasan",
        "ascii": "Horasan",
        "enlem": 40.0388,
        "boylam": 42.1637
      },
      {
        "ad": "İspir",
        "ascii": "Ispir",
        "enlem": 40.4798,
        "boylam": 40.9937
      },
      {
        "ad": "Karaçoban",
        "ascii": "Karacoban",
        "enlem": 39.3436,
        "boylam": 42.0992
      },
      {
        "ad": "Karayazı",
        "ascii": "Karayazi",
        "enlem": 39.696,
        "boylam": 42.1428
      },
      {
        "ad": "Köprüköy",
        "ascii": "Koprukoy",
        "enlem": 39.966,
        "boylam": 41.8684
      },
      {
        "ad": "Narman",
        "ascii": "Narman",
        "enlem": 40.3445,
        "boylam": 41.8609
      },
      {
        "ad": "Oltu",
        "ascii": "Oltu",
        "enlem": 40.5394,
        "boylam": 41.9872
      },
      {
        "ad": "Olur",
        "ascii": "Olur",
        "enlem": 40.8216,
        "boylam": 42.1306
      },
      {
        "ad": "Palandöken",
        "ascii": "Palandoken",
        "enlem": 39.889,
        "boylam": 41.2805
      },
      {
        "ad": "Pasinler",
        "ascii": "Pasinler",
        "enlem": 39.9797,
        "boylam": 41.67
      },
      {
        "ad": "Pazaryolu",
        "ascii": "Pazaryolu",
        "enlem": 40.4114,
        "boylam": 40.7678
      },
      {
        "ad": "Şenkaya",
        "ascii": "Senkaya",
        "enlem": 40.5565,
        "boylam": 42.3427
      },
      {
        "ad": "Tekman",
        "ascii": "Tekman",
        "enlem": 39.6411,
        "boylam": 41.5054
      },
      {
        "ad": "Tortum",
        "ascii": "Tortum",
        "enlem": 40.2889,
        "boylam": 41.541
      },
      {
        "ad": "Uzundere",
        "ascii": "Uzundere",
        "enlem": 40.5322,
        "boylam": 41.5383
      },
      {
        "ad": "Yakutiye",
        "ascii": "Yakutiye",
        "enlem": 39.8982,
        "boylam": 41.2692
      }
    ]
  },
  {
    "plaka": 26,
    "ad": "Eskişehir",
    "ascii": "Eskisehir",
    "enlem": 39.7767,
    "boylam": 30.5206,
    "ilceler": [
      {
        "ad": "Alpu",
        "ascii": "Alpu",
        "enlem": 39.769,
        "boylam": 30.9606
      },
      {
        "ad": "Beylikova",
        "ascii": "Beylikova",
        "enlem": 39.6869,
        "boylam": 31.2056
      },
      {
        "ad": "Çifteler",
        "ascii": "Cifteler",
        "enlem": 39.3831,
        "boylam": 31.0392
      },
      {
        "ad": "Günyüzü",
        "ascii": "Gunyuzu",
        "enlem": 39.3834,
        "boylam": 31.8099
      },
      {
        "ad": "Han",
        "ascii": "Han",
        "enlem": 39.1592,
        "boylam": 30.8614
      },
      {
        "ad": "İnönü",
        "ascii": "Inonu",
        "enlem": 39.8153,
        "boylam": 30.1455
      },
      {
        "ad": "Mahmudiye",
        "ascii": "Mahmudiye",
        "enlem": 39.4978,
        "boylam": 30.9872
      },
      {
        "ad": "Mihalgazi",
        "ascii": "Mihalgazi",
        "enlem": 40.0262,
        "boylam": 30.5771
      },
      {
        "ad": "Mihalıççık",
        "ascii": "Mihaliccik",
        "enlem": 39.8459,
        "boylam": 31.5814
      },
      {
        "ad": "Odunpazarı",
        "ascii": "Odunpazari",
        "enlem": 39.6329,
        "boylam": 30.5474
      },
      {
        "ad": "Sarıcakaya",
        "ascii": "Saricakaya",
        "enlem": 40.0369,
        "boylam": 30.6267
      },
      {
        "ad": "Seyitgazi",
        "ascii": "Seyitgazi",
        "enlem": 39.4447,
        "boylam": 30.6947
      },
      {
        "ad": "Sivrihisar",
        "ascii": "Sivrihisar",
        "enlem": 39.4504,
        "boylam": 31.5341
      },
      {
        "ad": "Tepebaşı",
        "ascii": "Tepebasi",
        "enlem": 39.8343,
        "boylam": 30.5654
      }
    ]
  },
  {
    "plaka": 27,
    "ad": "Gaziantep",
    "ascii": "Gaziantep",
    "enlem": 37.0667,
    "boylam": 37.3833,
    "ilceler": [
      {
        "ad": "Araban",
        "ascii": "Araban",
        "enlem": 37.4267,
        "boylam": 37.689
      },
      {
        "ad": "İslahiye",
        "ascii": "Islahiye",
        "enlem": 37.0264,
        "boylam": 36.6322
      },
      {
        "ad": "Karkamış",
        "ascii": "Karkamis",
        "enlem": 36.8345,
        "boylam": 37.9983
      },
      {
        "ad": "Nizip",
        "ascii": "Nizip",
        "enlem": 37.0104,
        "boylam": 37.7985
      },
      {
        "ad": "Nurdağı",
        "ascii": "Nurdagi",
        "enlem": 37.1682,
        "boylam": 36.7362
      },
      {
        "ad": "Oğuzeli",
        "ascii": "Oguzeli",
        "enlem": 36.9657,
        "boylam": 37.5134
      },
      {
        "ad": "Şahinbey",
        "ascii": "Sahinbey",
        "enlem": 37.0484,
        "boylam": 37.3437
      },
      {
        "ad": "Şehitkamil",
        "ascii": "Sehitkamil",
        "enlem": 37.0796,
        "boylam": 37.38
      },
      {
        "ad": "Yavuzeli",
        "ascii": "Yavuzeli",
        "enlem": 37.3177,
        "boylam": 37.5682
      }
    ]
  },
  {
    "plaka": 28,
    "ad": "Giresun",
    "ascii": "Giresun",
    "enlem": 40.9,
    "boylam": 38.4167,
    "ilceler": [
      {
        "ad": "Alucra",
        "ascii": "Alucra",
        "enlem": 40.3166,
        "boylam": 38.7528
      },
      {
        "ad": "Bulancak",
        "ascii": "Bulancak",
        "enlem": 40.938,
        "boylam": 38.2315
      },
      {
        "ad": "Çamoluk",
        "ascii": "Camoluk",
        "enlem": 40.1273,
        "boylam": 38.7301
      },
      {
        "ad": "Çanakçı",
        "ascii": "Canakci",
        "enlem": 40.9114,
        "boylam": 38.9881
      },
      {
        "ad": "Dereli",
        "ascii": "Dereli",
        "enlem": 40.7389,
        "boylam": 38.4434
      },
      {
        "ad": "Doğankent",
        "ascii": "Dogankent",
        "enlem": 40.8075,
        "boylam": 38.9172
      },
      {
        "ad": "Espiye",
        "ascii": "Espiye",
        "enlem": 40.947,
        "boylam": 38.703
      },
      {
        "ad": "Eynesil",
        "ascii": "Eynesil",
        "enlem": 41.05,
        "boylam": 39.1333
      },
      {
        "ad": "Görele",
        "ascii": "Gorele",
        "enlem": 41.0308,
        "boylam": 39.0031
      },
      {
        "ad": "Güce",
        "ascii": "Guce",
        "enlem": 40.8932,
        "boylam": 38.7982
      },
      {
        "ad": "Keşap",
        "ascii": "Kesap",
        "enlem": 40.9103,
        "boylam": 38.5013
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.9149,
        "boylam": 38.3879
      },
      {
        "ad": "Piraziz",
        "ascii": "Piraziz",
        "enlem": 40.8723,
        "boylam": 38.0815
      },
      {
        "ad": "Şebinkarahisar",
        "ascii": "Sebinkarahisar",
        "enlem": 40.3109,
        "boylam": 38.4109
      },
      {
        "ad": "Tirebolu",
        "ascii": "Tirebolu",
        "enlem": 41.0069,
        "boylam": 38.8139
      },
      {
        "ad": "Yağlıdere",
        "ascii": "Yaglidere",
        "enlem": 40.8567,
        "boylam": 38.6203
      }
    ]
  },
  {
    "plaka": 29,
    "ad": "Gümüşhane",
    "ascii": "Gumushane",
    "enlem": 40.4597,
    "boylam": 39.4778,
    "ilceler": [
      {
        "ad": "Kelkit",
        "ascii": "Kelkit",
        "enlem": 40.1268,
        "boylam": 39.4342
      },
      {
        "ad": "Köse",
        "ascii": "Kose",
        "enlem": 40.2069,
        "boylam": 39.6463
      },
      {
        "ad": "Kürtün",
        "ascii": "Kurtun",
        "enlem": 40.6952,
        "boylam": 39.0947
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.4618,
        "boylam": 39.4757
      },
      {
        "ad": "Şiran",
        "ascii": "Siran",
        "enlem": 40.1906,
        "boylam": 39.1175
      },
      {
        "ad": "Torul",
        "ascii": "Torul",
        "enlem": 40.5507,
        "boylam": 39.2834
      }
    ]
  },
  {
    "plaka": 30,
    "ad": "Hakkari",
    "ascii": "Hakkari",
    "enlem": 37.5744,
    "boylam": 43.7408,
    "ilceler": [
      {
        "ad": "Çukurca",
        "ascii": "Cukurca",
        "enlem": 37.3519,
        "boylam": 43.7204
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.5749,
        "boylam": 43.7377
      },
      {
        "ad": "Şemdinli",
        "ascii": "Semdinli",
        "enlem": 37.2164,
        "boylam": 44.5149
      },
      {
        "ad": "Yüksekova",
        "ascii": "Yuksekova",
        "enlem": 37.5149,
        "boylam": 44.2912
      }
    ]
  },
  {
    "plaka": 31,
    "ad": "Hatay",
    "ascii": "Hatay",
    "enlem": 36.2,
    "boylam": 36.15,
    "ilceler": [
      {
        "ad": "Altınözü",
        "ascii": "Altinozu",
        "enlem": 36.1155,
        "boylam": 36.2483
      },
      {
        "ad": "Antakya",
        "ascii": "Antakya",
        "enlem": 36.2177,
        "boylam": 36.1654
      },
      {
        "ad": "Arsuz",
        "ascii": "Arsuz",
        "enlem": 36.4131,
        "boylam": 35.8903
      },
      {
        "ad": "Belen",
        "ascii": "Belen",
        "enlem": 36.4917,
        "boylam": 36.1917
      },
      {
        "ad": "Defne",
        "ascii": "Defne",
        "enlem": 36.1489,
        "boylam": 36.1236
      },
      {
        "ad": "Dörtyol",
        "ascii": "Dortyol",
        "enlem": 36.8392,
        "boylam": 36.2303
      },
      {
        "ad": "Erzin",
        "ascii": "Erzin",
        "enlem": 36.9539,
        "boylam": 36.2022
      },
      {
        "ad": "Hassa",
        "ascii": "Hassa",
        "enlem": 36.8,
        "boylam": 36.53
      },
      {
        "ad": "İskenderun",
        "ascii": "Iskenderun",
        "enlem": 36.5804,
        "boylam": 36.17
      },
      {
        "ad": "Kırıkhan",
        "ascii": "Kirikhan",
        "enlem": 36.4994,
        "boylam": 36.3576
      },
      {
        "ad": "Kumlu",
        "ascii": "Kumlu",
        "enlem": 36.3635,
        "boylam": 36.455
      },
      {
        "ad": "Payas",
        "ascii": "Payas",
        "enlem": 36.7222,
        "boylam": 36.2975
      },
      {
        "ad": "Reyhanlı",
        "ascii": "Reyhanli",
        "enlem": 36.2692,
        "boylam": 36.5672
      },
      {
        "ad": "Samandağ",
        "ascii": "Samandag",
        "enlem": 36.085,
        "boylam": 35.9806
      },
      {
        "ad": "Yayladağı",
        "ascii": "Yayladagi",
        "enlem": 35.9025,
        "boylam": 36.0603
      }
    ]
  },
  {
    "plaka": 32,
    "ad": "Isparta",
    "ascii": "Isparta",
    "enlem": 37.7667,
    "boylam": 30.55,
    "ilceler": [
      {
        "ad": "Aksu",
        "ascii": "Aksu",
        "enlem": 37.7989,
        "boylam": 31.0711
      },
      {
        "ad": "Atabey",
        "ascii": "Atabey",
        "enlem": 37.9508,
        "boylam": 30.6386
      },
      {
        "ad": "Eğirdir",
        "ascii": "Egirdir",
        "enlem": 37.8743,
        "boylam": 30.8327
      },
      {
        "ad": "Gelendost",
        "ascii": "Gelendost",
        "enlem": 38.1208,
        "boylam": 31.0153
      },
      {
        "ad": "Gönen",
        "ascii": "Gonen",
        "enlem": 37.9564,
        "boylam": 30.5114
      },
      {
        "ad": "Keçiborlu",
        "ascii": "Keciborlu",
        "enlem": 37.9425,
        "boylam": 30.3022
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.7704,
        "boylam": 30.5557
      },
      {
        "ad": "Senirkent",
        "ascii": "Senirkent",
        "enlem": 38.1044,
        "boylam": 30.5486
      },
      {
        "ad": "Sütçüler",
        "ascii": "Sutculer",
        "enlem": 37.4974,
        "boylam": 30.9773
      },
      {
        "ad": "Şarkikaraağaç",
        "ascii": "Sarkikaraagac",
        "enlem": 37.9231,
        "boylam": 31.3108
      },
      {
        "ad": "Uluborlu",
        "ascii": "Uluborlu",
        "enlem": 38.0783,
        "boylam": 30.4502
      },
      {
        "ad": "Yalvaç",
        "ascii": "Yalvac",
        "enlem": 38.2956,
        "boylam": 31.1778
      },
      {
        "ad": "Yenişarbademli",
        "ascii": "Yenisarbademli",
        "enlem": 37.7078,
        "boylam": 31.3864
      }
    ]
  },
  {
    "plaka": 33,
    "ad": "Mersin",
    "ascii": "Mersin",
    "enlem": 36.8,
    "boylam": 34.6167,
    "ilceler": [
      {
        "ad": "Akdeniz",
        "ascii": "Akdeniz",
        "enlem": 36.8328,
        "boylam": 33.9686
      },
      {
        "ad": "Anamur",
        "ascii": "Anamur",
        "enlem": 36.0751,
        "boylam": 32.8369
      },
      {
        "ad": "Aydıncık",
        "ascii": "Aydincik",
        "enlem": 36.1667,
        "boylam": 33.35
      },
      {
        "ad": "Bozyazı",
        "ascii": "Bozyazi",
        "enlem": 36.1049,
        "boylam": 32.9723
      },
      {
        "ad": "Çamlıyayla",
        "ascii": "Camliyayla",
        "enlem": 37.1665,
        "boylam": 34.593
      },
      {
        "ad": "Erdemli",
        "ascii": "Erdemli",
        "enlem": 36.605,
        "boylam": 34.3084
      },
      {
        "ad": "Gülnar",
        "ascii": "Gulnar",
        "enlem": 36.3415,
        "boylam": 33.3992
      },
      {
        "ad": "Mezitli",
        "ascii": "Mezitli",
        "enlem": 36.7454,
        "boylam": 34.5226
      },
      {
        "ad": "Mut",
        "ascii": "Mut",
        "enlem": 36.6458,
        "boylam": 33.4375
      },
      {
        "ad": "Silifke",
        "ascii": "Silifke",
        "enlem": 36.3778,
        "boylam": 33.9344
      },
      {
        "ad": "Tarsus",
        "ascii": "Tarsus",
        "enlem": 36.9167,
        "boylam": 34.9
      },
      {
        "ad": "Toroslar",
        "ascii": "Toroslar",
        "enlem": 36.8393,
        "boylam": 34.6136
      },
      {
        "ad": "Yenişehir",
        "ascii": "Yenisehir",
        "enlem": 36.7898,
        "boylam": 34.5634
      }
    ]
  },
  {
    "plaka": 34,
    "ad": "İstanbul",
    "ascii": "Istanbul",
    "enlem": 41.01,
    "boylam": 28.9603,
    "ilceler": [
      {
        "ad": "Adalar",
        "ascii": "Adalar",
        "enlem": 40.8678,
        "boylam": 29.1331
      },
      {
        "ad": "Arnavutköy",
        "ascii": "Arnavutkoy",
        "enlem": 41.2483,
        "boylam": 28.6814
      },
      {
        "ad": "Ataşehir",
        "ascii": "Atasehir",
        "enlem": 40.9847,
        "boylam": 29.1067
      },
      {
        "ad": "Avcılar",
        "ascii": "Avcilar",
        "enlem": 40.9801,
        "boylam": 28.7175
      },
      {
        "ad": "Bağcılar",
        "ascii": "Bagcilar",
        "enlem": 41.0447,
        "boylam": 28.8337
      },
      {
        "ad": "Bahçelievler",
        "ascii": "Bahcelievler",
        "enlem": 41.0003,
        "boylam": 28.8637
      },
      {
        "ad": "Bakırköy",
        "ascii": "Bakirkoy",
        "enlem": 40.9806,
        "boylam": 28.8629
      },
      {
        "ad": "Başakşehir",
        "ascii": "Basaksehir",
        "enlem": 41.1027,
        "boylam": 28.7725
      },
      {
        "ad": "Bayrampaşa",
        "ascii": "Bayrampasa",
        "enlem": 41.0512,
        "boylam": 28.8985
      },
      {
        "ad": "Beşiktaş",
        "ascii": "Besiktas",
        "enlem": 41.0716,
        "boylam": 29.0305
      },
      {
        "ad": "Beykoz",
        "ascii": "Beykoz",
        "enlem": 41.1439,
        "boylam": 29.0906
      },
      {
        "ad": "Beylikdüzü",
        "ascii": "Beylikduzu",
        "enlem": 41.0011,
        "boylam": 28.6421
      },
      {
        "ad": "Beyoğlu",
        "ascii": "Beyoglu",
        "enlem": 41.0435,
        "boylam": 28.9625
      },
      {
        "ad": "Büyükçekmece",
        "ascii": "Buyukcekmece",
        "enlem": 41.0128,
        "boylam": 28.5382
      },
      {
        "ad": "Çatalca",
        "ascii": "Catalca",
        "enlem": 41.142,
        "boylam": 28.4638
      },
      {
        "ad": "Çekmeköy",
        "ascii": "Cekmekoy",
        "enlem": 41.0543,
        "boylam": 29.2445
      },
      {
        "ad": "Esenler",
        "ascii": "Esenler",
        "enlem": 41.062,
        "boylam": 28.8695
      },
      {
        "ad": "Esenyurt",
        "ascii": "Esenyurt",
        "enlem": 41.0489,
        "boylam": 28.6581
      },
      {
        "ad": "Eyüpsultan",
        "ascii": "Eyupsultan",
        "enlem": 41.046,
        "boylam": 28.9253
      },
      {
        "ad": "Fatih",
        "ascii": "Fatih",
        "enlem": 41.0145,
        "boylam": 28.9546
      },
      {
        "ad": "Gaziosmanpaşa",
        "ascii": "Gaziosmanpasa",
        "enlem": 41.0734,
        "boylam": 28.9016
      },
      {
        "ad": "Güngören",
        "ascii": "Gungoren",
        "enlem": 41.0198,
        "boylam": 28.8748
      },
      {
        "ad": "Kadıköy",
        "ascii": "Kadikoy",
        "enlem": 40.9811,
        "boylam": 29.0651
      },
      {
        "ad": "Kağıthane",
        "ascii": "Kagithane",
        "enlem": 41.083,
        "boylam": 28.9839
      },
      {
        "ad": "Kartal",
        "ascii": "Kartal",
        "enlem": 40.9019,
        "boylam": 29.1737
      },
      {
        "ad": "Küçükçekmece",
        "ascii": "Kucukcekmece",
        "enlem": 40.996,
        "boylam": 28.7748
      },
      {
        "ad": "Maltepe",
        "ascii": "Maltepe",
        "enlem": 40.9434,
        "boylam": 29.1597
      },
      {
        "ad": "Pendik",
        "ascii": "Pendik",
        "enlem": 40.8775,
        "boylam": 29.2725
      },
      {
        "ad": "Sancaktepe",
        "ascii": "Sancaktepe",
        "enlem": 40.9994,
        "boylam": 29.2252
      },
      {
        "ad": "Sarıyer",
        "ascii": "Sariyer",
        "enlem": 41.1667,
        "boylam": 29.05
      },
      {
        "ad": "Silivri",
        "ascii": "Silivri",
        "enlem": 41.0739,
        "boylam": 28.2464
      },
      {
        "ad": "Sultanbeyli",
        "ascii": "Sultanbeyli",
        "enlem": 40.9659,
        "boylam": 29.2724
      },
      {
        "ad": "Sultangazi",
        "ascii": "Sultangazi",
        "enlem": 41.1082,
        "boylam": 28.8613
      },
      {
        "ad": "Şile",
        "ascii": "Sile",
        "enlem": 41.1754,
        "boylam": 29.6133
      },
      {
        "ad": "Şişli",
        "ascii": "Sisli",
        "enlem": 41.0617,
        "boylam": 28.9843
      },
      {
        "ad": "Tuzla",
        "ascii": "Tuzla",
        "enlem": 40.8927,
        "boylam": 29.3722
      },
      {
        "ad": "Ümraniye",
        "ascii": "Umraniye",
        "enlem": 41.0272,
        "boylam": 29.1275
      },
      {
        "ad": "Üsküdar",
        "ascii": "Uskudar",
        "enlem": 41.0352,
        "boylam": 29.0573
      },
      {
        "ad": "Zeytinburnu",
        "ascii": "Zeytinburnu",
        "enlem": 41.0056,
        "boylam": 28.9082
      }
    ]
  },
  {
    "plaka": 35,
    "ad": "İzmir",
    "ascii": "Izmir",
    "enlem": 38.4127,
    "boylam": 27.1384,
    "ilceler": [
      {
        "ad": "Aliağa",
        "ascii": "Aliaga",
        "enlem": 38.7998,
        "boylam": 26.972
      },
      {
        "ad": "Balçova",
        "ascii": "Balcova",
        "enlem": 38.3805,
        "boylam": 27.0648
      },
      {
        "ad": "Bayındır",
        "ascii": "Bayindir",
        "enlem": 38.2192,
        "boylam": 27.6481
      },
      {
        "ad": "Bayraklı",
        "ascii": "Bayrakli",
        "enlem": 38.4777,
        "boylam": 27.1524
      },
      {
        "ad": "Bergama",
        "ascii": "Bergama",
        "enlem": 39.1228,
        "boylam": 27.1783
      },
      {
        "ad": "Beydağ",
        "ascii": "Beydag",
        "enlem": 38.087,
        "boylam": 28.2271
      },
      {
        "ad": "Bornova",
        "ascii": "Bornova",
        "enlem": 38.4792,
        "boylam": 27.2399
      },
      {
        "ad": "Buca",
        "ascii": "Buca",
        "enlem": 38.3983,
        "boylam": 27.1666
      },
      {
        "ad": "Çeşme",
        "ascii": "Cesme",
        "enlem": 38.32,
        "boylam": 26.3053
      },
      {
        "ad": "Çiğli",
        "ascii": "Cigli",
        "enlem": 38.4855,
        "boylam": 26.9962
      },
      {
        "ad": "Dikili",
        "ascii": "Dikili",
        "enlem": 39.071,
        "boylam": 26.8902
      },
      {
        "ad": "Foça",
        "ascii": "Foca",
        "enlem": 38.6675,
        "boylam": 26.7581
      },
      {
        "ad": "Gaziemir",
        "ascii": "Gaziemir",
        "enlem": 38.3239,
        "boylam": 27.1292
      },
      {
        "ad": "Güzelbahçe",
        "ascii": "Guzelbahce",
        "enlem": 38.3399,
        "boylam": 26.8893
      },
      {
        "ad": "Karabağlar",
        "ascii": "Karabaglar",
        "enlem": 38.3462,
        "boylam": 27.0386
      },
      {
        "ad": "Karaburun",
        "ascii": "Karaburun",
        "enlem": 38.6364,
        "boylam": 26.5109
      },
      {
        "ad": "Karşıyaka",
        "ascii": "Karsiyaka",
        "enlem": 38.4573,
        "boylam": 27.1106
      },
      {
        "ad": "Kemalpaşa",
        "ascii": "Kemalpasa",
        "enlem": 38.4261,
        "boylam": 27.4172
      },
      {
        "ad": "Kınık",
        "ascii": "Kinik",
        "enlem": 39.0872,
        "boylam": 27.3833
      },
      {
        "ad": "Kiraz",
        "ascii": "Kiraz",
        "enlem": 38.2306,
        "boylam": 28.2044
      },
      {
        "ad": "Konak",
        "ascii": "Konak",
        "enlem": 38.4173,
        "boylam": 27.1302
      },
      {
        "ad": "Menderes",
        "ascii": "Menderes",
        "enlem": 38.254,
        "boylam": 27.134
      },
      {
        "ad": "Menemen",
        "ascii": "Menemen",
        "enlem": 38.6,
        "boylam": 27.0667
      },
      {
        "ad": "Narlıdere",
        "ascii": "Narlidere",
        "enlem": 38.3738,
        "boylam": 26.9823
      },
      {
        "ad": "Ödemiş",
        "ascii": "Odemis",
        "enlem": 38.2311,
        "boylam": 27.9719
      },
      {
        "ad": "Seferihisar",
        "ascii": "Seferihisar",
        "enlem": 38.169,
        "boylam": 26.8945
      },
      {
        "ad": "Selçuk",
        "ascii": "Selcuk",
        "enlem": 37.95,
        "boylam": 27.3667
      },
      {
        "ad": "Tire",
        "ascii": "Tire",
        "enlem": 38.0833,
        "boylam": 27.7333
      },
      {
        "ad": "Torbalı",
        "ascii": "Torbali",
        "enlem": 38.1619,
        "boylam": 27.3583
      },
      {
        "ad": "Urla",
        "ascii": "Urla",
        "enlem": 38.3222,
        "boylam": 26.7647
      }
    ]
  },
  {
    "plaka": 36,
    "ad": "Kars",
    "ascii": "Kars",
    "enlem": 40.6069,
    "boylam": 43.0931,
    "ilceler": [
      {
        "ad": "Akyaka",
        "ascii": "Akyaka",
        "enlem": 40.7397,
        "boylam": 43.6253
      },
      {
        "ad": "Arpaçay",
        "ascii": "Arpacay",
        "enlem": 40.8452,
        "boylam": 43.3275
      },
      {
        "ad": "Digor",
        "ascii": "Digor",
        "enlem": 40.369,
        "boylam": 43.41
      },
      {
        "ad": "Kağızman",
        "ascii": "Kagizman",
        "enlem": 40.1567,
        "boylam": 43.1342
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.6052,
        "boylam": 43.0962
      },
      {
        "ad": "Sarıkamış",
        "ascii": "Sarikamis",
        "enlem": 40.3277,
        "boylam": 42.587
      },
      {
        "ad": "Selim",
        "ascii": "Selim",
        "enlem": 40.4577,
        "boylam": 42.7829
      },
      {
        "ad": "Susuz",
        "ascii": "Susuz",
        "enlem": 40.7791,
        "boylam": 43.1277
      }
    ]
  },
  {
    "plaka": 37,
    "ad": "Kastamonu",
    "ascii": "Kastamonu",
    "enlem": 41.3833,
    "boylam": 33.7833,
    "ilceler": [
      {
        "ad": "Abana",
        "ascii": "Abana",
        "enlem": 41.9786,
        "boylam": 34.011
      },
      {
        "ad": "Ağlı",
        "ascii": "Agli",
        "enlem": 41.686,
        "boylam": 33.5538
      },
      {
        "ad": "Araç",
        "ascii": "Arac",
        "enlem": 41.2422,
        "boylam": 33.3277
      },
      {
        "ad": "Azdavay",
        "ascii": "Azdavay",
        "enlem": 41.6427,
        "boylam": 33.3
      },
      {
        "ad": "Bozkurt",
        "ascii": "Bozkurt",
        "enlem": 41.9577,
        "boylam": 34.0109
      },
      {
        "ad": "Cide",
        "ascii": "Cide",
        "enlem": 41.8921,
        "boylam": 33.0044
      },
      {
        "ad": "Çatalzeytin",
        "ascii": "Catalzeytin",
        "enlem": 41.9531,
        "boylam": 34.2163
      },
      {
        "ad": "Daday",
        "ascii": "Daday",
        "enlem": 41.4787,
        "boylam": 33.4667
      },
      {
        "ad": "Devrekani",
        "ascii": "Devrekani",
        "enlem": 41.603,
        "boylam": 33.8392
      },
      {
        "ad": "Doğanyurt",
        "ascii": "Doganyurt",
        "enlem": 42.0046,
        "boylam": 33.4603
      },
      {
        "ad": "Hanönü",
        "ascii": "Hanonu",
        "enlem": 41.6271,
        "boylam": 34.4667
      },
      {
        "ad": "İhsangazi",
        "ascii": "Ihsangazi",
        "enlem": 41.2043,
        "boylam": 33.5545
      },
      {
        "ad": "İnebolu",
        "ascii": "Inebolu",
        "enlem": 41.9747,
        "boylam": 33.7608
      },
      {
        "ad": "Küre",
        "ascii": "Kure",
        "enlem": 41.8058,
        "boylam": 33.7116
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.3765,
        "boylam": 33.777
      },
      {
        "ad": "Pınarbaşı",
        "ascii": "Pinarbasi",
        "enlem": 41.6039,
        "boylam": 33.111
      },
      {
        "ad": "Seydiler",
        "ascii": "Seydiler",
        "enlem": 41.6201,
        "boylam": 33.7182
      },
      {
        "ad": "Şenpazar",
        "ascii": "Senpazar",
        "enlem": 41.8089,
        "boylam": 33.2314
      },
      {
        "ad": "Taşköprü",
        "ascii": "Taskopru",
        "enlem": 41.5098,
        "boylam": 34.2141
      },
      {
        "ad": "Tosya",
        "ascii": "Tosya",
        "enlem": 41.0154,
        "boylam": 34.0401
      }
    ]
  },
  {
    "plaka": 38,
    "ad": "Kayseri",
    "ascii": "Kayseri",
    "enlem": 38.7333,
    "boylam": 35.4833,
    "ilceler": [
      {
        "ad": "Akkışla",
        "ascii": "Akkisla",
        "enlem": 39.0022,
        "boylam": 36.1738
      },
      {
        "ad": "Bünyan",
        "ascii": "Bunyan",
        "enlem": 38.8463,
        "boylam": 35.8603
      },
      {
        "ad": "Develi",
        "ascii": "Develi",
        "enlem": 38.3906,
        "boylam": 35.4922
      },
      {
        "ad": "Felahiye",
        "ascii": "Felahiye",
        "enlem": 39.0906,
        "boylam": 35.5672
      },
      {
        "ad": "Hacılar",
        "ascii": "Hacilar",
        "enlem": 38.6463,
        "boylam": 35.4494
      },
      {
        "ad": "İncesu",
        "ascii": "Incesu",
        "enlem": 38.6224,
        "boylam": 35.1826
      },
      {
        "ad": "Kocasinan",
        "ascii": "Kocasinan",
        "enlem": 38.7715,
        "boylam": 35.5725
      },
      {
        "ad": "Melikgazi",
        "ascii": "Melikgazi",
        "enlem": 38.75,
        "boylam": 35.45
      },
      {
        "ad": "Özvatan",
        "ascii": "Ozvatan",
        "enlem": 39.1069,
        "boylam": 35.6999
      },
      {
        "ad": "Pınarbaşı",
        "ascii": "Pinarbasi",
        "enlem": 38.722,
        "boylam": 36.391
      },
      {
        "ad": "Sarıoğlan",
        "ascii": "Sarioglan",
        "enlem": 39.0769,
        "boylam": 35.9667
      },
      {
        "ad": "Sarız",
        "ascii": "Sariz",
        "enlem": 38.4792,
        "boylam": 36.499
      },
      {
        "ad": "Talas",
        "ascii": "Talas",
        "enlem": 38.6833,
        "boylam": 35.5667
      },
      {
        "ad": "Tomarza",
        "ascii": "Tomarza",
        "enlem": 38.4472,
        "boylam": 35.7992
      },
      {
        "ad": "Yahyalı",
        "ascii": "Yahyali",
        "enlem": 38.1023,
        "boylam": 35.357
      },
      {
        "ad": "Yeşilhisar",
        "ascii": "Yesilhisar",
        "enlem": 38.3497,
        "boylam": 35.0867
      }
    ]
  },
  {
    "plaka": 39,
    "ad": "Kırklareli",
    "ascii": "Kirklareli",
    "enlem": 41.7347,
    "boylam": 27.2253,
    "ilceler": [
      {
        "ad": "Babaeski",
        "ascii": "Babaeski",
        "enlem": 41.4325,
        "boylam": 27.0931
      },
      {
        "ad": "Demirköy",
        "ascii": "Demirkoy",
        "enlem": 41.8251,
        "boylam": 27.7597
      },
      {
        "ad": "Kofçaz",
        "ascii": "Kofcaz",
        "enlem": 41.9448,
        "boylam": 27.1583
      },
      {
        "ad": "Lüleburgaz",
        "ascii": "Luleburgaz",
        "enlem": 41.4056,
        "boylam": 27.3569
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.737,
        "boylam": 27.2236
      },
      {
        "ad": "Pehlivanköy",
        "ascii": "Pehlivankoy",
        "enlem": 41.3481,
        "boylam": 26.9252
      },
      {
        "ad": "Pınarhisar",
        "ascii": "Pinarhisar",
        "enlem": 41.6242,
        "boylam": 27.52
      },
      {
        "ad": "Vize",
        "ascii": "Vize",
        "enlem": 41.5725,
        "boylam": 27.7658
      }
    ]
  },
  {
    "plaka": 40,
    "ad": "Kırşehir",
    "ascii": "Kirsehir",
    "enlem": 39.145,
    "boylam": 34.1608,
    "ilceler": [
      {
        "ad": "Akçakent",
        "ascii": "Akcakent",
        "enlem": 39.6228,
        "boylam": 34.0958
      },
      {
        "ad": "Akpınar",
        "ascii": "Akpinar",
        "enlem": 39.45,
        "boylam": 33.9648
      },
      {
        "ad": "Boztepe",
        "ascii": "Boztepe",
        "enlem": 39.2697,
        "boylam": 34.2611
      },
      {
        "ad": "Çiçekdağı",
        "ascii": "Cicekdagi",
        "enlem": 39.6036,
        "boylam": 34.4158
      },
      {
        "ad": "Kaman",
        "ascii": "Kaman",
        "enlem": 39.3575,
        "boylam": 33.7239
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.1461,
        "boylam": 34.1606
      },
      {
        "ad": "Mucur",
        "ascii": "Mucur",
        "enlem": 39.0615,
        "boylam": 34.3829
      }
    ]
  },
  {
    "plaka": 41,
    "ad": "Kocaeli",
    "ascii": "Kocaeli",
    "enlem": 40.7656,
    "boylam": 29.9406,
    "ilceler": [
      {
        "ad": "Başiskele",
        "ascii": "Basiskele",
        "enlem": 40.6459,
        "boylam": 29.9517
      },
      {
        "ad": "Çayırova",
        "ascii": "Cayirova",
        "enlem": 40.8265,
        "boylam": 29.3745
      },
      {
        "ad": "Darıca",
        "ascii": "Darica",
        "enlem": 40.7797,
        "boylam": 29.3945
      },
      {
        "ad": "Derince",
        "ascii": "Derince",
        "enlem": 40.7569,
        "boylam": 29.8147
      },
      {
        "ad": "Dilovası",
        "ascii": "Dilovasi",
        "enlem": 40.8346,
        "boylam": 29.5863
      },
      {
        "ad": "Gebze",
        "ascii": "Gebze",
        "enlem": 40.8028,
        "boylam": 29.4307
      },
      {
        "ad": "Gölcük",
        "ascii": "Golcuk",
        "enlem": 40.6667,
        "boylam": 29.8333
      },
      {
        "ad": "İzmit",
        "ascii": "Izmit",
        "enlem": 40.7643,
        "boylam": 29.9279
      },
      {
        "ad": "Kandıra",
        "ascii": "Kandira",
        "enlem": 41.07,
        "boylam": 30.1526
      },
      {
        "ad": "Karamürsel",
        "ascii": "Karamursel",
        "enlem": 40.6914,
        "boylam": 29.6157
      },
      {
        "ad": "Kartepe",
        "ascii": "Kartepe",
        "enlem": 40.6882,
        "boylam": 30.0845
      },
      {
        "ad": "Körfez",
        "ascii": "Korfez",
        "enlem": 40.7706,
        "boylam": 29.7661
      }
    ]
  },
  {
    "plaka": 42,
    "ad": "Konya",
    "ascii": "Konya",
    "enlem": 37.8714,
    "boylam": 32.4847,
    "ilceler": [
      {
        "ad": "Ahırlı",
        "ascii": "Ahirli",
        "enlem": 37.2387,
        "boylam": 32.1188
      },
      {
        "ad": "Akören",
        "ascii": "Akoren",
        "enlem": 37.4535,
        "boylam": 32.3707
      },
      {
        "ad": "Akşehir",
        "ascii": "Aksehir",
        "enlem": 38.3575,
        "boylam": 31.4164
      },
      {
        "ad": "Altınekin",
        "ascii": "Altinekin",
        "enlem": 38.2408,
        "boylam": 32.8153
      },
      {
        "ad": "Beyşehir",
        "ascii": "Beysehir",
        "enlem": 37.6773,
        "boylam": 31.7246
      },
      {
        "ad": "Bozkır",
        "ascii": "Bozkir",
        "enlem": 37.1896,
        "boylam": 32.2474
      },
      {
        "ad": "Cihanbeyli",
        "ascii": "Cihanbeyli",
        "enlem": 38.6607,
        "boylam": 32.9244
      },
      {
        "ad": "Çeltik",
        "ascii": "Celtik",
        "enlem": 39.0244,
        "boylam": 31.7906
      },
      {
        "ad": "Çumra",
        "ascii": "Cumra",
        "enlem": 37.5732,
        "boylam": 32.7745
      },
      {
        "ad": "Derbent",
        "ascii": "Derbent",
        "enlem": 38.0142,
        "boylam": 32.0164
      },
      {
        "ad": "Derebucak",
        "ascii": "Derebucak",
        "enlem": 37.3918,
        "boylam": 31.5092
      },
      {
        "ad": "Doğanhisar",
        "ascii": "Doganhisar",
        "enlem": 38.1463,
        "boylam": 31.6765
      },
      {
        "ad": "Emirgazi",
        "ascii": "Emirgazi",
        "enlem": 37.9022,
        "boylam": 33.8372
      },
      {
        "ad": "Ereğli",
        "ascii": "Eregli",
        "enlem": 37.5058,
        "boylam": 34.0517
      },
      {
        "ad": "Güneysınır",
        "ascii": "Guneysinir",
        "enlem": 37.2694,
        "boylam": 32.729
      },
      {
        "ad": "Hadim",
        "ascii": "Hadim",
        "enlem": 36.9878,
        "boylam": 32.4567
      },
      {
        "ad": "Halkapınar",
        "ascii": "Halkapinar",
        "enlem": 37.4339,
        "boylam": 34.1874
      },
      {
        "ad": "Hüyük",
        "ascii": "Huyuk",
        "enlem": 37.9539,
        "boylam": 31.5964
      },
      {
        "ad": "Ilgın",
        "ascii": "Ilgin",
        "enlem": 38.2792,
        "boylam": 31.9139
      },
      {
        "ad": "Kadınhanı",
        "ascii": "Kadinhani",
        "enlem": 38.2397,
        "boylam": 32.2114
      },
      {
        "ad": "Karapınar",
        "ascii": "Karapinar",
        "enlem": 37.716,
        "boylam": 33.5506
      },
      {
        "ad": "Karatay",
        "ascii": "Karatay",
        "enlem": 37.8874,
        "boylam": 32.5334
      },
      {
        "ad": "Kulu",
        "ascii": "Kulu",
        "enlem": 39.0901,
        "boylam": 33.0807
      },
      {
        "ad": "Meram",
        "ascii": "Meram",
        "enlem": 37.8299,
        "boylam": 32.4678
      },
      {
        "ad": "Sarayönü",
        "ascii": "Sarayonu",
        "enlem": 38.262,
        "boylam": 32.4046
      },
      {
        "ad": "Selçuklu",
        "ascii": "Selcuklu",
        "enlem": 37.8842,
        "boylam": 32.4922
      },
      {
        "ad": "Seydişehir",
        "ascii": "Seydisehir",
        "enlem": 37.4193,
        "boylam": 31.8453
      },
      {
        "ad": "Taşkent",
        "ascii": "Taskent",
        "enlem": 36.9243,
        "boylam": 32.4913
      },
      {
        "ad": "Tuzlukçu",
        "ascii": "Tuzlukcu",
        "enlem": 38.4778,
        "boylam": 31.6264
      },
      {
        "ad": "Yalıhüyük",
        "ascii": "Yalihuyuk",
        "enlem": 37.3008,
        "boylam": 32.0855
      },
      {
        "ad": "Yunak",
        "ascii": "Yunak",
        "enlem": 38.8142,
        "boylam": 31.7322
      }
    ]
  },
  {
    "plaka": 43,
    "ad": "Kütahya",
    "ascii": "Kutahya",
    "enlem": 39.4242,
    "boylam": 29.9833,
    "ilceler": [
      {
        "ad": "Altıntaş",
        "ascii": "Altintas",
        "enlem": 39.0597,
        "boylam": 30.1092
      },
      {
        "ad": "Aslanapa",
        "ascii": "Aslanapa",
        "enlem": 39.2158,
        "boylam": 29.8699
      },
      {
        "ad": "Çavdarhisar",
        "ascii": "Cavdarhisar",
        "enlem": 39.1934,
        "boylam": 29.6191
      },
      {
        "ad": "Domaniç",
        "ascii": "Domanic",
        "enlem": 39.8019,
        "boylam": 29.6092
      },
      {
        "ad": "Dumlupınar",
        "ascii": "Dumlupinar",
        "enlem": 38.8541,
        "boylam": 29.9772
      },
      {
        "ad": "Emet",
        "ascii": "Emet",
        "enlem": 39.343,
        "boylam": 29.2585
      },
      {
        "ad": "Gediz",
        "ascii": "Gediz",
        "enlem": 38.9939,
        "boylam": 29.3913
      },
      {
        "ad": "Hisarcık",
        "ascii": "Hisarcik",
        "enlem": 39.2506,
        "boylam": 29.2312
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.4192,
        "boylam": 29.9873
      },
      {
        "ad": "Pazarlar",
        "ascii": "Pazarlar",
        "enlem": 38.995,
        "boylam": 29.1258
      },
      {
        "ad": "Simav",
        "ascii": "Simav",
        "enlem": 39.0882,
        "boylam": 28.9777
      },
      {
        "ad": "Şaphane",
        "ascii": "Saphane",
        "enlem": 39.0273,
        "boylam": 29.2222
      },
      {
        "ad": "Tavşanlı",
        "ascii": "Tavsanli",
        "enlem": 39.5424,
        "boylam": 29.4987
      }
    ]
  },
  {
    "plaka": 44,
    "ad": "Malatya",
    "ascii": "Malatya",
    "enlem": 38.3554,
    "boylam": 38.3337,
    "ilceler": [
      {
        "ad": "Akçadağ",
        "ascii": "Akcadag",
        "enlem": 38.339,
        "boylam": 37.9702
      },
      {
        "ad": "Arapgir",
        "ascii": "Arapgir",
        "enlem": 39.0412,
        "boylam": 38.4952
      },
      {
        "ad": "Arguvan",
        "ascii": "Arguvan",
        "enlem": 38.7738,
        "boylam": 38.2633
      },
      {
        "ad": "Battalgazi",
        "ascii": "Battalgazi",
        "enlem": 38.4229,
        "boylam": 38.3585
      },
      {
        "ad": "Darende",
        "ascii": "Darende",
        "enlem": 38.5458,
        "boylam": 37.5058
      },
      {
        "ad": "Doğanşehir",
        "ascii": "Dogansehir",
        "enlem": 38.0857,
        "boylam": 37.8712
      },
      {
        "ad": "Doğanyol",
        "ascii": "Doganyol",
        "enlem": 38.3075,
        "boylam": 39.0343
      },
      {
        "ad": "Hekimhan",
        "ascii": "Hekimhan",
        "enlem": 38.8162,
        "boylam": 37.9288
      },
      {
        "ad": "Kale",
        "ascii": "Kale",
        "enlem": 38.4154,
        "boylam": 38.7709
      },
      {
        "ad": "Kuluncak",
        "ascii": "Kuluncak",
        "enlem": 38.8766,
        "boylam": 37.6628
      },
      {
        "ad": "Pütürge",
        "ascii": "Puturge",
        "enlem": 38.1992,
        "boylam": 38.863
      },
      {
        "ad": "Yazıhan",
        "ascii": "Yazihan",
        "enlem": 38.5929,
        "boylam": 38.1733
      },
      {
        "ad": "Yeşilyurt",
        "ascii": "Yesilyurt",
        "enlem": 38.296,
        "boylam": 38.2453
      }
    ]
  },
  {
    "plaka": 45,
    "ad": "Manisa",
    "ascii": "Manisa",
    "enlem": 38.6131,
    "boylam": 27.4258,
    "ilceler": [
      {
        "ad": "Ahmetli",
        "ascii": "Ahmetli",
        "enlem": 38.5196,
        "boylam": 27.9387
      },
      {
        "ad": "Akhisar",
        "ascii": "Akhisar",
        "enlem": 38.9185,
        "boylam": 27.8401
      },
      {
        "ad": "Alaşehir",
        "ascii": "Alasehir",
        "enlem": 38.3508,
        "boylam": 28.5172
      },
      {
        "ad": "Demirci",
        "ascii": "Demirci",
        "enlem": 39.0461,
        "boylam": 28.6589
      },
      {
        "ad": "Gölmarmara",
        "ascii": "Golmarmara",
        "enlem": 38.7139,
        "boylam": 27.9142
      },
      {
        "ad": "Gördes",
        "ascii": "Gordes",
        "enlem": 38.9328,
        "boylam": 28.2894
      },
      {
        "ad": "Kırkağaç",
        "ascii": "Kirkagac",
        "enlem": 39.1064,
        "boylam": 27.6693
      },
      {
        "ad": "Köprübaşı",
        "ascii": "Koprubasi",
        "enlem": 38.7497,
        "boylam": 28.4047
      },
      {
        "ad": "Kula",
        "ascii": "Kula",
        "enlem": 38.5473,
        "boylam": 28.6498
      },
      {
        "ad": "Salihli",
        "ascii": "Salihli",
        "enlem": 38.4811,
        "boylam": 28.1392
      },
      {
        "ad": "Sarıgöl",
        "ascii": "Sarigol",
        "enlem": 38.2395,
        "boylam": 28.6966
      },
      {
        "ad": "Saruhanlı",
        "ascii": "Saruhanli",
        "enlem": 38.7345,
        "boylam": 27.5681
      },
      {
        "ad": "Selendi",
        "ascii": "Selendi",
        "enlem": 38.7444,
        "boylam": 28.8678
      },
      {
        "ad": "Soma",
        "ascii": "Soma",
        "enlem": 39.1833,
        "boylam": 27.6056
      },
      {
        "ad": "Şehzadeler",
        "ascii": "Sehzadeler",
        "enlem": 38.6459,
        "boylam": 27.5028
      },
      {
        "ad": "Turgutlu",
        "ascii": "Turgutlu",
        "enlem": 38.5,
        "boylam": 27.7
      },
      {
        "ad": "Yunusemre",
        "ascii": "Yunusemre",
        "enlem": 38.7449,
        "boylam": 27.2688
      }
    ]
  },
  {
    "plaka": 46,
    "ad": "Kahramanmaraş",
    "ascii": "Kahramanmaras",
    "enlem": 37.5875,
    "boylam": 36.9453,
    "ilceler": [
      {
        "ad": "Afşin",
        "ascii": "Afsin",
        "enlem": 38.2477,
        "boylam": 36.914
      },
      {
        "ad": "Andırın",
        "ascii": "Andirin",
        "enlem": 37.5776,
        "boylam": 36.3549
      },
      {
        "ad": "Çağlayancerit",
        "ascii": "Caglayancerit",
        "enlem": 37.7452,
        "boylam": 37.2862
      },
      {
        "ad": "Dulkadiroğlu",
        "ascii": "Dulkadiroglu",
        "enlem": 37.6956,
        "boylam": 37.0716
      },
      {
        "ad": "Ekinözü",
        "ascii": "Ekinozu",
        "enlem": 38.0597,
        "boylam": 37.1879
      },
      {
        "ad": "Elbistan",
        "ascii": "Elbistan",
        "enlem": 38.2059,
        "boylam": 37.1983
      },
      {
        "ad": "Göksun",
        "ascii": "Goksun",
        "enlem": 38.021,
        "boylam": 36.4973
      },
      {
        "ad": "Nurhak",
        "ascii": "Nurhak",
        "enlem": 37.9637,
        "boylam": 37.4405
      },
      {
        "ad": "Onikişubat",
        "ascii": "Onikisubat",
        "enlem": 37.6699,
        "boylam": 36.728
      },
      {
        "ad": "Pazarcık",
        "ascii": "Pazarcik",
        "enlem": 37.484,
        "boylam": 37.2922
      },
      {
        "ad": "Türkoğlu",
        "ascii": "Turkoglu",
        "enlem": 37.3865,
        "boylam": 36.8426
      }
    ]
  },
  {
    "plaka": 47,
    "ad": "Mardin",
    "ascii": "Mardin",
    "enlem": 37.3167,
    "boylam": 40.7378,
    "ilceler": [
      {
        "ad": "Artuklu",
        "ascii": "Artuklu",
        "enlem": 37.3198,
        "boylam": 40.732
      },
      {
        "ad": "Dargeçit",
        "ascii": "Dargecit",
        "enlem": 37.5462,
        "boylam": 41.7165
      },
      {
        "ad": "Derik",
        "ascii": "Derik",
        "enlem": 37.3644,
        "boylam": 40.2689
      },
      {
        "ad": "Kızıltepe",
        "ascii": "Kiziltepe",
        "enlem": 37.1939,
        "boylam": 40.5861
      },
      {
        "ad": "Mazıdağı",
        "ascii": "Mazidagi",
        "enlem": 37.478,
        "boylam": 40.4815
      },
      {
        "ad": "Midyat",
        "ascii": "Midyat",
        "enlem": 37.4191,
        "boylam": 41.3391
      },
      {
        "ad": "Nusaybin",
        "ascii": "Nusaybin",
        "enlem": 37.0833,
        "boylam": 41.2167
      },
      {
        "ad": "Ömerli",
        "ascii": "Omerli",
        "enlem": 37.399,
        "boylam": 40.9544
      },
      {
        "ad": "Savur",
        "ascii": "Savur",
        "enlem": 37.5354,
        "boylam": 40.8788
      },
      {
        "ad": "Yeşilli",
        "ascii": "Yesilli",
        "enlem": 37.3381,
        "boylam": 40.8174
      }
    ]
  },
  {
    "plaka": 48,
    "ad": "Muğla",
    "ascii": "Mugla",
    "enlem": 37.2167,
    "boylam": 28.3667,
    "ilceler": [
      {
        "ad": "Bodrum",
        "ascii": "Bodrum",
        "enlem": 37.0383,
        "boylam": 27.4292
      },
      {
        "ad": "Dalaman",
        "ascii": "Dalaman",
        "enlem": 36.7659,
        "boylam": 28.8028
      },
      {
        "ad": "Datça",
        "ascii": "Datca",
        "enlem": 36.7274,
        "boylam": 27.6848
      },
      {
        "ad": "Fethiye",
        "ascii": "Fethiye",
        "enlem": 36.6206,
        "boylam": 29.1142
      },
      {
        "ad": "Kavaklıdere",
        "ascii": "Kavaklidere",
        "enlem": 37.4446,
        "boylam": 28.3628
      },
      {
        "ad": "Köyceğiz",
        "ascii": "Koycegiz",
        "enlem": 36.9625,
        "boylam": 28.6909
      },
      {
        "ad": "Marmaris",
        "ascii": "Marmaris",
        "enlem": 36.8564,
        "boylam": 28.2711
      },
      {
        "ad": "Menteşe",
        "ascii": "Mentese",
        "enlem": 37.1167,
        "boylam": 28.2667
      },
      {
        "ad": "Milas",
        "ascii": "Milas",
        "enlem": 37.3164,
        "boylam": 27.7839
      },
      {
        "ad": "Ortaca",
        "ascii": "Ortaca",
        "enlem": 36.8391,
        "boylam": 28.7646
      },
      {
        "ad": "Seydikemer",
        "ascii": "Seydikemer",
        "enlem": 36.6359,
        "boylam": 29.489
      },
      {
        "ad": "Ula",
        "ascii": "Ula",
        "enlem": 37.1049,
        "boylam": 28.4167
      },
      {
        "ad": "Yatağan",
        "ascii": "Yatagan",
        "enlem": 37.3425,
        "boylam": 28.1393
      }
    ]
  },
  {
    "plaka": 49,
    "ad": "Muş",
    "ascii": "Mus",
    "enlem": 38.7333,
    "boylam": 41.4911,
    "ilceler": [
      {
        "ad": "Bulanık",
        "ascii": "Bulanik",
        "enlem": 39.0866,
        "boylam": 42.2716
      },
      {
        "ad": "Hasköy",
        "ascii": "Haskoy",
        "enlem": 38.6864,
        "boylam": 41.6936
      },
      {
        "ad": "Korkut",
        "ascii": "Korkut",
        "enlem": 38.7339,
        "boylam": 41.784
      },
      {
        "ad": "Malazgirt",
        "ascii": "Malazgirt",
        "enlem": 39.1465,
        "boylam": 42.5354
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.7404,
        "boylam": 41.4967
      },
      {
        "ad": "Varto",
        "ascii": "Varto",
        "enlem": 39.1737,
        "boylam": 41.454
      }
    ]
  },
  {
    "plaka": 50,
    "ad": "Nevşehir",
    "ascii": "Nevsehir",
    "enlem": 38.625,
    "boylam": 34.7122,
    "ilceler": [
      {
        "ad": "Acıgöl",
        "ascii": "Acigol",
        "enlem": 38.5503,
        "boylam": 34.5092
      },
      {
        "ad": "Avanos",
        "ascii": "Avanos",
        "enlem": 38.715,
        "boylam": 34.8467
      },
      {
        "ad": "Derinkuyu",
        "ascii": "Derinkuyu",
        "enlem": 38.3751,
        "boylam": 34.7342
      },
      {
        "ad": "Gülşehir",
        "ascii": "Gulsehir",
        "enlem": 38.7459,
        "boylam": 34.6252
      },
      {
        "ad": "Hacıbektaş",
        "ascii": "Hacibektas",
        "enlem": 38.9408,
        "boylam": 34.5577
      },
      {
        "ad": "Kozaklı",
        "ascii": "Kozakli",
        "enlem": 39.2214,
        "boylam": 34.8506
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.6205,
        "boylam": 34.7054
      },
      {
        "ad": "Ürgüp",
        "ascii": "Urgup",
        "enlem": 38.6296,
        "boylam": 34.912
      }
    ]
  },
  {
    "plaka": 51,
    "ad": "Niğde",
    "ascii": "Nigde",
    "enlem": 37.9667,
    "boylam": 34.6792,
    "ilceler": [
      {
        "ad": "Altunhisar",
        "ascii": "Altunhisar",
        "enlem": 37.9916,
        "boylam": 34.3733
      },
      {
        "ad": "Bor",
        "ascii": "Bor",
        "enlem": 37.8833,
        "boylam": 34.5667
      },
      {
        "ad": "Çamardı",
        "ascii": "Camardi",
        "enlem": 37.8322,
        "boylam": 34.9814
      },
      {
        "ad": "Çiftlik",
        "ascii": "Ciftlik",
        "enlem": 38.1758,
        "boylam": 34.4854
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.9745,
        "boylam": 34.6782
      },
      {
        "ad": "Ulukışla",
        "ascii": "Ulukisla",
        "enlem": 37.5478,
        "boylam": 34.4853
      }
    ]
  },
  {
    "plaka": 52,
    "ad": "Ordu",
    "ascii": "Ordu",
    "enlem": 40.9833,
    "boylam": 37.8833,
    "ilceler": [
      {
        "ad": "Akkuş",
        "ascii": "Akkus",
        "enlem": 40.7931,
        "boylam": 37.0164
      },
      {
        "ad": "Altınordu",
        "ascii": "Altinordu",
        "enlem": 40.9203,
        "boylam": 37.887
      },
      {
        "ad": "Aybastı",
        "ascii": "Aybasti",
        "enlem": 40.6867,
        "boylam": 37.3992
      },
      {
        "ad": "Çamaş",
        "ascii": "Camas",
        "enlem": 40.902,
        "boylam": 37.5279
      },
      {
        "ad": "Çatalpınar",
        "ascii": "Catalpinar",
        "enlem": 40.879,
        "boylam": 37.4535
      },
      {
        "ad": "Çaybaşı",
        "ascii": "Caybasi",
        "enlem": 41.0171,
        "boylam": 37.098
      },
      {
        "ad": "Fatsa",
        "ascii": "Fatsa",
        "enlem": 41.0278,
        "boylam": 37.5014
      },
      {
        "ad": "Gölköy",
        "ascii": "Golkoy",
        "enlem": 40.6869,
        "boylam": 37.6154
      },
      {
        "ad": "Gülyalı",
        "ascii": "Gulyali",
        "enlem": 40.9615,
        "boylam": 38.0494
      },
      {
        "ad": "Gürgentepe",
        "ascii": "Gurgentepe",
        "enlem": 40.7857,
        "boylam": 37.5897
      },
      {
        "ad": "İkizce",
        "ascii": "Ikizce",
        "enlem": 41.0583,
        "boylam": 37.0803
      },
      {
        "ad": "Kabadüz",
        "ascii": "Kabaduz",
        "enlem": 40.861,
        "boylam": 37.8847
      },
      {
        "ad": "Kabataş",
        "ascii": "Kabatas",
        "enlem": 40.75,
        "boylam": 37.45
      },
      {
        "ad": "Korgan",
        "ascii": "Korgan",
        "enlem": 40.8247,
        "boylam": 37.3467
      },
      {
        "ad": "Kumru",
        "ascii": "Kumru",
        "enlem": 40.8744,
        "boylam": 37.2639
      },
      {
        "ad": "Mesudiye",
        "ascii": "Mesudiye",
        "enlem": 40.4545,
        "boylam": 37.7735
      },
      {
        "ad": "Perşembe",
        "ascii": "Persembe",
        "enlem": 41.0656,
        "boylam": 37.7714
      },
      {
        "ad": "Ulubey",
        "ascii": "Ulubey",
        "enlem": 40.8686,
        "boylam": 37.7541
      },
      {
        "ad": "Ünye",
        "ascii": "Unye",
        "enlem": 41.1271,
        "boylam": 37.2882
      }
    ]
  },
  {
    "plaka": 53,
    "ad": "Rize",
    "ascii": "Rize",
    "enlem": 41.0167,
    "boylam": 40.5167,
    "ilceler": [
      {
        "ad": "Ardeşen",
        "ascii": "Ardesen",
        "enlem": 41.1911,
        "boylam": 40.9875
      },
      {
        "ad": "Çamlıhemşin",
        "ascii": "Camlihemsin",
        "enlem": 41.0477,
        "boylam": 41
      },
      {
        "ad": "Çayeli",
        "ascii": "Cayeli",
        "enlem": 41.0861,
        "boylam": 40.7221
      },
      {
        "ad": "Derepazarı",
        "ascii": "Derepazari",
        "enlem": 41.024,
        "boylam": 40.4233
      },
      {
        "ad": "Fındıklı",
        "ascii": "Findikli",
        "enlem": 41.1333,
        "boylam": 41.0167
      },
      {
        "ad": "Güneysu",
        "ascii": "Guneysu",
        "enlem": 40.9813,
        "boylam": 40.6046
      },
      {
        "ad": "Hemşin",
        "ascii": "Hemsin",
        "enlem": 41.0478,
        "boylam": 40.8984
      },
      {
        "ad": "İkizdere",
        "ascii": "Ikizdere",
        "enlem": 40.7748,
        "boylam": 40.5523
      },
      {
        "ad": "İyidere",
        "ascii": "Iyidere",
        "enlem": 41.0119,
        "boylam": 40.3618
      },
      {
        "ad": "Kalkandere",
        "ascii": "Kalkandere",
        "enlem": 40.9205,
        "boylam": 40.4369
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.0316,
        "boylam": 40.5555
      },
      {
        "ad": "Pazar",
        "ascii": "Pazar",
        "enlem": 41.1792,
        "boylam": 40.8842
      }
    ]
  },
  {
    "plaka": 54,
    "ad": "Sakarya",
    "ascii": "Sakarya",
    "enlem": 40.7778,
    "boylam": 30.4028,
    "ilceler": [
      {
        "ad": "Adapazarı",
        "ascii": "Adapazari",
        "enlem": 40.8481,
        "boylam": 30.3491
      },
      {
        "ad": "Akyazı",
        "ascii": "Akyazi",
        "enlem": 40.685,
        "boylam": 30.6222
      },
      {
        "ad": "Arifiye",
        "ascii": "Arifiye",
        "enlem": 40.7004,
        "boylam": 30.3508
      },
      {
        "ad": "Erenler",
        "ascii": "Erenler",
        "enlem": 40.755,
        "boylam": 30.3934
      },
      {
        "ad": "Ferizli",
        "ascii": "Ferizli",
        "enlem": 40.9408,
        "boylam": 30.4858
      },
      {
        "ad": "Geyve",
        "ascii": "Geyve",
        "enlem": 40.5075,
        "boylam": 30.2925
      },
      {
        "ad": "Hendek",
        "ascii": "Hendek",
        "enlem": 40.7994,
        "boylam": 30.7481
      },
      {
        "ad": "Karapürçek",
        "ascii": "Karapurcek",
        "enlem": 40.6419,
        "boylam": 30.5394
      },
      {
        "ad": "Karasu",
        "ascii": "Karasu",
        "enlem": 41.1044,
        "boylam": 30.6966
      },
      {
        "ad": "Kaynarca",
        "ascii": "Kaynarca",
        "enlem": 41.0308,
        "boylam": 30.3075
      },
      {
        "ad": "Kocaali",
        "ascii": "Kocaali",
        "enlem": 41.0534,
        "boylam": 30.8528
      },
      {
        "ad": "Pamukova",
        "ascii": "Pamukova",
        "enlem": 40.5081,
        "boylam": 30.1673
      },
      {
        "ad": "Sapanca",
        "ascii": "Sapanca",
        "enlem": 40.6914,
        "boylam": 30.2674
      },
      {
        "ad": "Serdivan",
        "ascii": "Serdivan",
        "enlem": 40.7738,
        "boylam": 30.3801
      },
      {
        "ad": "Söğütlü",
        "ascii": "Sogutlu",
        "enlem": 40.9059,
        "boylam": 30.4745
      },
      {
        "ad": "Taraklı",
        "ascii": "Tarakli",
        "enlem": 40.3969,
        "boylam": 30.4928
      }
    ]
  },
  {
    "plaka": 55,
    "ad": "Samsun",
    "ascii": "Samsun",
    "enlem": 41.2867,
    "boylam": 36.33,
    "ilceler": [
      {
        "ad": "19 mayıs",
        "ascii": "19 mayis",
        "enlem": 41.4936,
        "boylam": 36.0779
      },
      {
        "ad": "Alaçam",
        "ascii": "Alacam",
        "enlem": 41.61,
        "boylam": 35.595
      },
      {
        "ad": "Asarcık",
        "ascii": "Asarcik",
        "enlem": 41.0356,
        "boylam": 36.2356
      },
      {
        "ad": "Atakum",
        "ascii": "Atakum",
        "enlem": 41.3355,
        "boylam": 36.1311
      },
      {
        "ad": "Ayvacık",
        "ascii": "Ayvacik",
        "enlem": 40.9911,
        "boylam": 36.6314
      },
      {
        "ad": "Bafra",
        "ascii": "Bafra",
        "enlem": 41.5682,
        "boylam": 35.9069
      },
      {
        "ad": "Canik",
        "ascii": "Canik",
        "enlem": 41.1742,
        "boylam": 36.2858
      },
      {
        "ad": "Çarşamba",
        "ascii": "Carsamba",
        "enlem": 41.1989,
        "boylam": 36.7219
      },
      {
        "ad": "Havza",
        "ascii": "Havza",
        "enlem": 40.9706,
        "boylam": 35.6622
      },
      {
        "ad": "İlkadım",
        "ascii": "Ilkadim",
        "enlem": 41.231,
        "boylam": 36.1881
      },
      {
        "ad": "Kavak",
        "ascii": "Kavak",
        "enlem": 41.0783,
        "boylam": 36.0425
      },
      {
        "ad": "Ladik",
        "ascii": "Ladik",
        "enlem": 40.9106,
        "boylam": 35.8919
      },
      {
        "ad": "Salıpazarı",
        "ascii": "Salipazari",
        "enlem": 41.084,
        "boylam": 36.8304
      },
      {
        "ad": "Tekkeköy",
        "ascii": "Tekkekoy",
        "enlem": 41.2117,
        "boylam": 36.46
      },
      {
        "ad": "Terme",
        "ascii": "Terme",
        "enlem": 41.2092,
        "boylam": 36.9739
      },
      {
        "ad": "Vezirköprü",
        "ascii": "Vezirkopru",
        "enlem": 41.1436,
        "boylam": 35.4547
      },
      {
        "ad": "Yakakent",
        "ascii": "Yakakent",
        "enlem": 41.6325,
        "boylam": 35.5289
      }
    ]
  },
  {
    "plaka": 56,
    "ad": "Siirt",
    "ascii": "Siirt",
    "enlem": 37.8417,
    "boylam": 41.9458,
    "ilceler": [
      {
        "ad": "Baykan",
        "ascii": "Baykan",
        "enlem": 38.1575,
        "boylam": 41.7733
      },
      {
        "ad": "Eruh",
        "ascii": "Eruh",
        "enlem": 37.7418,
        "boylam": 42.1742
      },
      {
        "ad": "Kurtalan",
        "ascii": "Kurtalan",
        "enlem": 37.9253,
        "boylam": 41.6849
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.9313,
        "boylam": 41.9398
      },
      {
        "ad": "Pervari",
        "ascii": "Pervari",
        "enlem": 37.9357,
        "boylam": 42.5493
      },
      {
        "ad": "Şirvan",
        "ascii": "Sirvan",
        "enlem": 38.0625,
        "boylam": 42.0252
      },
      {
        "ad": "Tillo",
        "ascii": "Tillo",
        "enlem": 37.9449,
        "boylam": 42.0072
      }
    ]
  },
  {
    "plaka": 57,
    "ad": "Sinop",
    "ascii": "Sinop",
    "enlem": 42.0267,
    "boylam": 35.1511,
    "ilceler": [
      {
        "ad": "Ayancık",
        "ascii": "Ayancik",
        "enlem": 41.95,
        "boylam": 34.5833
      },
      {
        "ad": "Boyabat",
        "ascii": "Boyabat",
        "enlem": 41.4689,
        "boylam": 34.7667
      },
      {
        "ad": "Dikmen",
        "ascii": "Dikmen",
        "enlem": 41.65,
        "boylam": 35.2667
      },
      {
        "ad": "Durağan",
        "ascii": "Duragan",
        "enlem": 41.4158,
        "boylam": 35.0544
      },
      {
        "ad": "Erfelek",
        "ascii": "Erfelek",
        "enlem": 41.8793,
        "boylam": 34.9184
      },
      {
        "ad": "Gerze",
        "ascii": "Gerze",
        "enlem": 41.8036,
        "boylam": 35.2011
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 42.0109,
        "boylam": 35.1032
      },
      {
        "ad": "Saraydüzü",
        "ascii": "Sarayduzu",
        "enlem": 41.3287,
        "boylam": 34.8469
      },
      {
        "ad": "Türkeli",
        "ascii": "Turkeli",
        "enlem": 41.9476,
        "boylam": 34.3386
      }
    ]
  },
  {
    "plaka": 58,
    "ad": "Sivas",
    "ascii": "Sivas",
    "enlem": 39.75,
    "boylam": 37.0167,
    "ilceler": [
      {
        "ad": "Akıncılar",
        "ascii": "Akincilar",
        "enlem": 40.0717,
        "boylam": 38.3433
      },
      {
        "ad": "Altınyayla",
        "ascii": "Altinyayla",
        "enlem": 39.2725,
        "boylam": 36.751
      },
      {
        "ad": "Divriği",
        "ascii": "Divrigi",
        "enlem": 39.3667,
        "boylam": 38.1167
      },
      {
        "ad": "Doğanşar",
        "ascii": "Dogansar",
        "enlem": 40.2084,
        "boylam": 37.5312
      },
      {
        "ad": "Gemerek",
        "ascii": "Gemerek",
        "enlem": 39.1834,
        "boylam": 36.0719
      },
      {
        "ad": "Gölova",
        "ascii": "Golova",
        "enlem": 40.0619,
        "boylam": 38.6067
      },
      {
        "ad": "Gürün",
        "ascii": "Gurun",
        "enlem": 38.7223,
        "boylam": 37.271
      },
      {
        "ad": "Hafik",
        "ascii": "Hafik",
        "enlem": 39.8564,
        "boylam": 37.3864
      },
      {
        "ad": "İmranlı",
        "ascii": "Imranli",
        "enlem": 39.8754,
        "boylam": 38.1136
      },
      {
        "ad": "Kangal",
        "ascii": "Kangal",
        "enlem": 39.2335,
        "boylam": 37.3911
      },
      {
        "ad": "Koyulhisar",
        "ascii": "Koyulhisar",
        "enlem": 40.3018,
        "boylam": 37.8234
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.7504,
        "boylam": 37.0145
      },
      {
        "ad": "Suşehri",
        "ascii": "Susehri",
        "enlem": 40.1601,
        "boylam": 38.0841
      },
      {
        "ad": "Şarkışla",
        "ascii": "Sarkisla",
        "enlem": 39.3519,
        "boylam": 36.4098
      },
      {
        "ad": "Ulaş",
        "ascii": "Ulas",
        "enlem": 39.4449,
        "boylam": 37.039
      },
      {
        "ad": "Yıldızeli",
        "ascii": "Yildizeli",
        "enlem": 39.8664,
        "boylam": 36.5989
      },
      {
        "ad": "Zara",
        "ascii": "Zara",
        "enlem": 39.8978,
        "boylam": 37.7583
      }
    ]
  },
  {
    "plaka": 59,
    "ad": "Tekirdağ",
    "ascii": "Tekirdag",
    "enlem": 40.9833,
    "boylam": 27.5167,
    "ilceler": [
      {
        "ad": "Çerkezköy",
        "ascii": "Cerkezkoy",
        "enlem": 41.285,
        "boylam": 28.0003
      },
      {
        "ad": "Çorlu",
        "ascii": "Corlu",
        "enlem": 41.1597,
        "boylam": 27.8028
      },
      {
        "ad": "Ergene",
        "ascii": "Ergene",
        "enlem": 41.2956,
        "boylam": 27.6496
      },
      {
        "ad": "Hayrabolu",
        "ascii": "Hayrabolu",
        "enlem": 41.2131,
        "boylam": 27.1069
      },
      {
        "ad": "Kapaklı",
        "ascii": "Kapakli",
        "enlem": 41.3333,
        "boylam": 27.9667
      },
      {
        "ad": "Malkara",
        "ascii": "Malkara",
        "enlem": 40.89,
        "boylam": 26.9011
      },
      {
        "ad": "Marmaraereğlisi",
        "ascii": "Marmaraereglisi",
        "enlem": 41.04,
        "boylam": 27.8124
      },
      {
        "ad": "Muratlı",
        "ascii": "Muratli",
        "enlem": 41.1722,
        "boylam": 27.4992
      },
      {
        "ad": "Saray",
        "ascii": "Saray",
        "enlem": 41.4443,
        "boylam": 27.9219
      },
      {
        "ad": "Süleymanpaşa",
        "ascii": "Suleymanpasa",
        "enlem": 40.9757,
        "boylam": 27.5028
      },
      {
        "ad": "Şarköy",
        "ascii": "Sarkoy",
        "enlem": 40.614,
        "boylam": 27.1156
      }
    ]
  },
  {
    "plaka": 60,
    "ad": "Tokat",
    "ascii": "Tokat",
    "enlem": 40.3097,
    "boylam": 36.5542,
    "ilceler": [
      {
        "ad": "Almus",
        "ascii": "Almus",
        "enlem": 40.3758,
        "boylam": 36.9044
      },
      {
        "ad": "Artova",
        "ascii": "Artova",
        "enlem": 40.1158,
        "boylam": 36.3001
      },
      {
        "ad": "Başçiftlik",
        "ascii": "Basciftlik",
        "enlem": 40.5469,
        "boylam": 37.1692
      },
      {
        "ad": "Erbaa",
        "ascii": "Erbaa",
        "enlem": 40.6689,
        "boylam": 36.5675
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.3265,
        "boylam": 36.554
      },
      {
        "ad": "Niksar",
        "ascii": "Niksar",
        "enlem": 40.5917,
        "boylam": 36.9517
      },
      {
        "ad": "Pazar",
        "ascii": "Pazar",
        "enlem": 40.2759,
        "boylam": 36.2832
      },
      {
        "ad": "Reşadiye",
        "ascii": "Resadiye",
        "enlem": 40.3919,
        "boylam": 37.3375
      },
      {
        "ad": "Sulusaray",
        "ascii": "Sulusaray",
        "enlem": 39.9939,
        "boylam": 36.084
      },
      {
        "ad": "Turhal",
        "ascii": "Turhal",
        "enlem": 40.3875,
        "boylam": 36.0811
      },
      {
        "ad": "Yeşilyurt",
        "ascii": "Yesilyurt",
        "enlem": 40.0064,
        "boylam": 36.2207
      },
      {
        "ad": "Zile",
        "ascii": "Zile",
        "enlem": 40.3031,
        "boylam": 35.8864
      }
    ]
  },
  {
    "plaka": 61,
    "ad": "Trabzon",
    "ascii": "Trabzon",
    "enlem": 41.005,
    "boylam": 39.7225,
    "ilceler": [
      {
        "ad": "Akçaabat",
        "ascii": "Akcaabat",
        "enlem": 41.0212,
        "boylam": 39.5715
      },
      {
        "ad": "Araklı",
        "ascii": "Arakli",
        "enlem": 40.9385,
        "boylam": 40.0584
      },
      {
        "ad": "Arsin",
        "ascii": "Arsin",
        "enlem": 40.9527,
        "boylam": 39.9267
      },
      {
        "ad": "Beşikdüzü",
        "ascii": "Besikduzu",
        "enlem": 41.052,
        "boylam": 39.2329
      },
      {
        "ad": "Çarşıbaşı",
        "ascii": "Carsibasi",
        "enlem": 41.0828,
        "boylam": 39.3828
      },
      {
        "ad": "Çaykara",
        "ascii": "Caykara",
        "enlem": 40.7427,
        "boylam": 40.2318
      },
      {
        "ad": "Dernekpazarı",
        "ascii": "Dernekpazari",
        "enlem": 40.7966,
        "boylam": 40.2446
      },
      {
        "ad": "Düzköy",
        "ascii": "Duzkoy",
        "enlem": 40.8746,
        "boylam": 39.4154
      },
      {
        "ad": "Hayrat",
        "ascii": "Hayrat",
        "enlem": 40.8853,
        "boylam": 40.365
      },
      {
        "ad": "Köprübaşı",
        "ascii": "Koprubasi",
        "enlem": 40.8069,
        "boylam": 40.1144
      },
      {
        "ad": "Maçka",
        "ascii": "Macka",
        "enlem": 40.8186,
        "boylam": 39.6136
      },
      {
        "ad": "Of",
        "ascii": "Of",
        "enlem": 40.945,
        "boylam": 40.2644
      },
      {
        "ad": "Ortahisar",
        "ascii": "Ortahisar",
        "enlem": 41.0013,
        "boylam": 39.7067
      },
      {
        "ad": "Sürmene",
        "ascii": "Surmene",
        "enlem": 40.9059,
        "boylam": 40.1279
      },
      {
        "ad": "Şalpazarı",
        "ascii": "Salpazari",
        "enlem": 40.9383,
        "boylam": 39.1901
      },
      {
        "ad": "Tonya",
        "ascii": "Tonya",
        "enlem": 40.884,
        "boylam": 39.2849
      },
      {
        "ad": "Vakfıkebir",
        "ascii": "Vakfikebir",
        "enlem": 41.0458,
        "boylam": 39.2764
      },
      {
        "ad": "Yomra",
        "ascii": "Yomra",
        "enlem": 40.9533,
        "boylam": 39.8555
      }
    ]
  },
  {
    "plaka": 62,
    "ad": "Tunceli",
    "ascii": "Tunceli",
    "enlem": 39.1061,
    "boylam": 39.5481,
    "ilceler": [
      {
        "ad": "Çemişgezek",
        "ascii": "Cemisgezek",
        "enlem": 39.0554,
        "boylam": 38.9075
      },
      {
        "ad": "Hozat",
        "ascii": "Hozat",
        "enlem": 39.1003,
        "boylam": 39.2082
      },
      {
        "ad": "Mazgirt",
        "ascii": "Mazgirt",
        "enlem": 39.0178,
        "boylam": 39.6006
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.1081,
        "boylam": 39.5482
      },
      {
        "ad": "Nazımiye",
        "ascii": "Nazimiye",
        "enlem": 39.1964,
        "boylam": 39.8466
      },
      {
        "ad": "Ovacık",
        "ascii": "Ovacik",
        "enlem": 39.3586,
        "boylam": 39.2164
      },
      {
        "ad": "Pertek",
        "ascii": "Pertek",
        "enlem": 38.8657,
        "boylam": 39.3227
      },
      {
        "ad": "Pülümür",
        "ascii": "Pulumur",
        "enlem": 39.4845,
        "boylam": 39.8953
      }
    ]
  },
  {
    "plaka": 63,
    "ad": "Şanlıurfa",
    "ascii": "Sanliurfa",
    "enlem": 37.1583,
    "boylam": 38.7917,
    "ilceler": [
      {
        "ad": "Akçakale",
        "ascii": "Akcakale",
        "enlem": 36.7108,
        "boylam": 38.9478
      },
      {
        "ad": "Birecik",
        "ascii": "Birecik",
        "enlem": 37.0258,
        "boylam": 37.9784
      },
      {
        "ad": "Bozova",
        "ascii": "Bozova",
        "enlem": 37.3625,
        "boylam": 38.5267
      },
      {
        "ad": "Ceylanpınar",
        "ascii": "Ceylanpinar",
        "enlem": 36.9194,
        "boylam": 39.905
      },
      {
        "ad": "Eyyübiye",
        "ascii": "Eyyubiye",
        "enlem": 37.008,
        "boylam": 39.016
      },
      {
        "ad": "Halfeti",
        "ascii": "Halfeti",
        "enlem": 37.2453,
        "boylam": 37.8687
      },
      {
        "ad": "Haliliye",
        "ascii": "Haliliye",
        "enlem": 37.2199,
        "boylam": 39.1405
      },
      {
        "ad": "Harran",
        "ascii": "Harran",
        "enlem": 36.86,
        "boylam": 39.0314
      },
      {
        "ad": "Hilvan",
        "ascii": "Hilvan",
        "enlem": 37.5869,
        "boylam": 38.955
      },
      {
        "ad": "Karaköprü",
        "ascii": "Karakopru",
        "enlem": 37.2036,
        "boylam": 38.7994
      },
      {
        "ad": "Siverek",
        "ascii": "Siverek",
        "enlem": 37.755,
        "boylam": 39.3167
      },
      {
        "ad": "Suruç",
        "ascii": "Suruc",
        "enlem": 36.9761,
        "boylam": 38.4253
      },
      {
        "ad": "Viranşehir",
        "ascii": "Viransehir",
        "enlem": 37.2306,
        "boylam": 39.7653
      }
    ]
  },
  {
    "plaka": 64,
    "ad": "Uşak",
    "ascii": "Usak",
    "enlem": 38.6833,
    "boylam": 29.4,
    "ilceler": [
      {
        "ad": "Banaz",
        "ascii": "Banaz",
        "enlem": 38.7644,
        "boylam": 29.7525
      },
      {
        "ad": "Eşme",
        "ascii": "Esme",
        "enlem": 38.3998,
        "boylam": 28.969
      },
      {
        "ad": "Karahallı",
        "ascii": "Karahalli",
        "enlem": 38.3208,
        "boylam": 29.5303
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.6709,
        "boylam": 29.4074
      },
      {
        "ad": "Sivaslı",
        "ascii": "Sivasli",
        "enlem": 38.4994,
        "boylam": 29.6836
      },
      {
        "ad": "Ulubey",
        "ascii": "Ulubey",
        "enlem": 38.4216,
        "boylam": 29.2895
      }
    ]
  },
  {
    "plaka": 65,
    "ad": "Van",
    "ascii": "Van",
    "enlem": 38.5019,
    "boylam": 43.4167,
    "ilceler": [
      {
        "ad": "Bahçesaray",
        "ascii": "Bahcesaray",
        "enlem": 38.1246,
        "boylam": 42.7983
      },
      {
        "ad": "Başkale",
        "ascii": "Baskale",
        "enlem": 38.0453,
        "boylam": 44.0172
      },
      {
        "ad": "Çaldıran",
        "ascii": "Caldiran",
        "enlem": 39.1419,
        "boylam": 43.9139
      },
      {
        "ad": "Çatak",
        "ascii": "Catak",
        "enlem": 38.0029,
        "boylam": 43.0524
      },
      {
        "ad": "Edremit",
        "ascii": "Edremit",
        "enlem": 38.4207,
        "boylam": 43.2589
      },
      {
        "ad": "Erciş",
        "ascii": "Ercis",
        "enlem": 39.0259,
        "boylam": 43.3596
      },
      {
        "ad": "Gevaş",
        "ascii": "Gevas",
        "enlem": 38.2921,
        "boylam": 43.1019
      },
      {
        "ad": "Gürpınar",
        "ascii": "Gurpinar",
        "enlem": 38.3269,
        "boylam": 43.4133
      },
      {
        "ad": "İpekyolu",
        "ascii": "Ipekyolu",
        "enlem": 38.4927,
        "boylam": 43.3707
      },
      {
        "ad": "Muradiye",
        "ascii": "Muradiye",
        "enlem": 38.9857,
        "boylam": 43.7531
      },
      {
        "ad": "Özalp",
        "ascii": "Ozalp",
        "enlem": 38.6546,
        "boylam": 43.9887
      },
      {
        "ad": "Saray",
        "ascii": "Saray",
        "enlem": 38.6469,
        "boylam": 44.1612
      },
      {
        "ad": "Tuşba",
        "ascii": "Tusba",
        "enlem": 38.522,
        "boylam": 43.3622
      }
    ]
  },
  {
    "plaka": 66,
    "ad": "Yozgat",
    "ascii": "Yozgat",
    "enlem": 39.8208,
    "boylam": 34.8083,
    "ilceler": [
      {
        "ad": "Akdağmadeni",
        "ascii": "Akdagmadeni",
        "enlem": 39.6603,
        "boylam": 35.8836
      },
      {
        "ad": "Aydıncık",
        "ascii": "Aydincik",
        "enlem": 40.1273,
        "boylam": 35.2877
      },
      {
        "ad": "Boğazlıyan",
        "ascii": "Bogazliyan",
        "enlem": 39.1888,
        "boylam": 35.2454
      },
      {
        "ad": "Çandır",
        "ascii": "Candir",
        "enlem": 39.2445,
        "boylam": 35.514
      },
      {
        "ad": "Çayıralan",
        "ascii": "Cayiralan",
        "enlem": 39.3028,
        "boylam": 35.6439
      },
      {
        "ad": "Çekerek",
        "ascii": "Cekerek",
        "enlem": 40.0731,
        "boylam": 35.4947
      },
      {
        "ad": "Kadışehri",
        "ascii": "Kadisehri",
        "enlem": 39.9957,
        "boylam": 35.7919
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.8206,
        "boylam": 34.8095
      },
      {
        "ad": "Saraykent",
        "ascii": "Saraykent",
        "enlem": 39.6936,
        "boylam": 35.5111
      },
      {
        "ad": "Sarıkaya",
        "ascii": "Sarikaya",
        "enlem": 39.4936,
        "boylam": 35.3769
      },
      {
        "ad": "Sorgun",
        "ascii": "Sorgun",
        "enlem": 39.8101,
        "boylam": 35.186
      },
      {
        "ad": "Şefaatli",
        "ascii": "Sefaatli",
        "enlem": 39.4893,
        "boylam": 34.7908
      },
      {
        "ad": "Yenifakılı",
        "ascii": "Yenifakili",
        "enlem": 39.2114,
        "boylam": 35.0004
      },
      {
        "ad": "Yerköy",
        "ascii": "Yerkoy",
        "enlem": 39.6381,
        "boylam": 34.4672
      }
    ]
  },
  {
    "plaka": 67,
    "ad": "Zonguldak",
    "ascii": "Zonguldak",
    "enlem": 41.4304,
    "boylam": 31.78,
    "ilceler": [
      {
        "ad": "Alaplı",
        "ascii": "Alapli",
        "enlem": 41.1814,
        "boylam": 31.3851
      },
      {
        "ad": "Çaycuma",
        "ascii": "Caycuma",
        "enlem": 41.4264,
        "boylam": 32.0756
      },
      {
        "ad": "Devrek",
        "ascii": "Devrek",
        "enlem": 41.2192,
        "boylam": 31.9558
      },
      {
        "ad": "Ereğli",
        "ascii": "Eregli",
        "enlem": 41.2583,
        "boylam": 31.425
      },
      {
        "ad": "Gökçebey",
        "ascii": "Gokcebey",
        "enlem": 41.3133,
        "boylam": 32.1497
      },
      {
        "ad": "Kilimli",
        "ascii": "Kilimli",
        "enlem": 41.4833,
        "boylam": 31.8333
      },
      {
        "ad": "Kozlu",
        "ascii": "Kozlu",
        "enlem": 41.4333,
        "boylam": 31.75
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.4525,
        "boylam": 31.7885
      }
    ]
  },
  {
    "plaka": 68,
    "ad": "Aksaray",
    "ascii": "Aksaray",
    "enlem": 38.3686,
    "boylam": 34.0297,
    "ilceler": [
      {
        "ad": "Ağaçören",
        "ascii": "Agacoren",
        "enlem": 38.8748,
        "boylam": 33.9167
      },
      {
        "ad": "Eskil",
        "ascii": "Eskil",
        "enlem": 38.4017,
        "boylam": 33.4131
      },
      {
        "ad": "Gülağaç",
        "ascii": "Gulagac",
        "enlem": 38.3958,
        "boylam": 34.3458
      },
      {
        "ad": "Güzelyurt",
        "ascii": "Guzelyurt",
        "enlem": 38.2772,
        "boylam": 34.3719
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 38.3705,
        "boylam": 34.0269
      },
      {
        "ad": "Ortaköy",
        "ascii": "Ortakoy",
        "enlem": 38.7373,
        "boylam": 34.0387
      },
      {
        "ad": "Sarıyahşi",
        "ascii": "Sariyahsi",
        "enlem": 38.9835,
        "boylam": 33.8414
      },
      {
        "ad": "Sultanhanı",
        "ascii": "Sultanhani",
        "enlem": 38.2481,
        "boylam": 33.5465
      }
    ]
  },
  {
    "plaka": 69,
    "ad": "Bayburt",
    "ascii": "Bayburt",
    "enlem": 40.2546,
    "boylam": 40.226,
    "ilceler": [
      {
        "ad": "Aydıntepe",
        "ascii": "Aydintepe",
        "enlem": 40.3833,
        "boylam": 40.1427
      },
      {
        "ad": "Demirözü",
        "ascii": "Demirozu",
        "enlem": 40.1602,
        "boylam": 39.8924
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.2557,
        "boylam": 40.2241
      }
    ]
  },
  {
    "plaka": 70,
    "ad": "Karaman",
    "ascii": "Karaman",
    "enlem": 37.1833,
    "boylam": 33.2167,
    "ilceler": [
      {
        "ad": "Ayrancı",
        "ascii": "Ayranci",
        "enlem": 37.3613,
        "boylam": 33.6883
      },
      {
        "ad": "Başyayla",
        "ascii": "Basyayla",
        "enlem": 36.7534,
        "boylam": 32.6802
      },
      {
        "ad": "Ermenek",
        "ascii": "Ermenek",
        "enlem": 36.6404,
        "boylam": 32.8918
      },
      {
        "ad": "Kazımkarabekir",
        "ascii": "Kazimkarabekir",
        "enlem": 37.2303,
        "boylam": 32.9589
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.1792,
        "boylam": 33.2225
      },
      {
        "ad": "Sarıveliler",
        "ascii": "Sariveliler",
        "enlem": 36.6971,
        "boylam": 32.612
      }
    ]
  },
  {
    "plaka": 71,
    "ad": "Kırıkkale",
    "ascii": "Kirikkale",
    "enlem": 39.8417,
    "boylam": 33.5139,
    "ilceler": [
      {
        "ad": "Bahşili",
        "ascii": "Bahsili",
        "enlem": 39.7226,
        "boylam": 33.3307
      },
      {
        "ad": "Balışeyh",
        "ascii": "Baliseyh",
        "enlem": 39.9141,
        "boylam": 33.7233
      },
      {
        "ad": "Çelebi",
        "ascii": "Celebi",
        "enlem": 39.4642,
        "boylam": 33.5241
      },
      {
        "ad": "Delice",
        "ascii": "Delice",
        "enlem": 39.9537,
        "boylam": 34.0259
      },
      {
        "ad": "Karakeçili",
        "ascii": "Karakecili",
        "enlem": 39.5942,
        "boylam": 33.3778
      },
      {
        "ad": "Keskin",
        "ascii": "Keskin",
        "enlem": 39.6731,
        "boylam": 33.6136
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.8486,
        "boylam": 33.5276
      },
      {
        "ad": "Sulakyurt",
        "ascii": "Sulakyurt",
        "enlem": 40.1573,
        "boylam": 33.716
      },
      {
        "ad": "Yahşihan",
        "ascii": "Yahsihan",
        "enlem": 39.8503,
        "boylam": 33.4529
      }
    ]
  },
  {
    "plaka": 72,
    "ad": "Batman",
    "ascii": "Batman",
    "enlem": 37.8833,
    "boylam": 41.1333,
    "ilceler": [
      {
        "ad": "Beşiri",
        "ascii": "Besiri",
        "enlem": 37.9157,
        "boylam": 41.2865
      },
      {
        "ad": "Gercüş",
        "ascii": "Gercus",
        "enlem": 37.5625,
        "boylam": 41.3775
      },
      {
        "ad": "Hasankeyf",
        "ascii": "Hasankeyf",
        "enlem": 37.7061,
        "boylam": 41.4048
      },
      {
        "ad": "Kozluk",
        "ascii": "Kozluk",
        "enlem": 38.1912,
        "boylam": 41.4778
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.8907,
        "boylam": 41.1374
      },
      {
        "ad": "Sason",
        "ascii": "Sason",
        "enlem": 38.3277,
        "boylam": 41.4138
      }
    ]
  },
  {
    "plaka": 73,
    "ad": "Şırnak",
    "ascii": "Sirnak",
    "enlem": 37.5164,
    "boylam": 42.4611,
    "ilceler": [
      {
        "ad": "Beytüşşebap",
        "ascii": "Beytussebap",
        "enlem": 37.5632,
        "boylam": 43.1658
      },
      {
        "ad": "Cizre",
        "ascii": "Cizre",
        "enlem": 37.325,
        "boylam": 42.1958
      },
      {
        "ad": "Güçlükonak",
        "ascii": "Guclukonak",
        "enlem": 37.4696,
        "boylam": 41.9059
      },
      {
        "ad": "İdil",
        "ascii": "Idil",
        "enlem": 37.3348,
        "boylam": 41.8894
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.5192,
        "boylam": 42.4606
      },
      {
        "ad": "Silopi",
        "ascii": "Silopi",
        "enlem": 37.2438,
        "boylam": 42.4634
      },
      {
        "ad": "Uludere",
        "ascii": "Uludere",
        "enlem": 37.4407,
        "boylam": 42.8524
      }
    ]
  },
  {
    "plaka": 74,
    "ad": "Bartın",
    "ascii": "Bartin",
    "enlem": 41.6344,
    "boylam": 32.3375,
    "ilceler": [
      {
        "ad": "Amasra",
        "ascii": "Amasra",
        "enlem": 41.7463,
        "boylam": 32.3863
      },
      {
        "ad": "Kurucaşile",
        "ascii": "Kurucasile",
        "enlem": 41.8378,
        "boylam": 32.7162
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.6338,
        "boylam": 32.3384
      },
      {
        "ad": "Ulus",
        "ascii": "Ulus",
        "enlem": 41.5842,
        "boylam": 32.6414
      }
    ]
  },
  {
    "plaka": 75,
    "ad": "Ardahan",
    "ascii": "Ardahan",
    "enlem": 41.1167,
    "boylam": 42.7,
    "ilceler": [
      {
        "ad": "Çıldır",
        "ascii": "Cildir",
        "enlem": 41.1214,
        "boylam": 43.1299
      },
      {
        "ad": "Damal",
        "ascii": "Damal",
        "enlem": 41.3414,
        "boylam": 42.8368
      },
      {
        "ad": "Göle",
        "ascii": "Gole",
        "enlem": 40.7875,
        "boylam": 42.606
      },
      {
        "ad": "Hanak",
        "ascii": "Hanak",
        "enlem": 41.2334,
        "boylam": 42.8404
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.1103,
        "boylam": 42.7036
      },
      {
        "ad": "Posof",
        "ascii": "Posof",
        "enlem": 41.5106,
        "boylam": 42.7292
      }
    ]
  },
  {
    "plaka": 76,
    "ad": "Iğdır",
    "ascii": "Igdir",
    "enlem": 39.9167,
    "boylam": 44.0333,
    "ilceler": [
      {
        "ad": "Aralık",
        "ascii": "Aralik",
        "enlem": 39.8167,
        "boylam": 44.4612
      },
      {
        "ad": "Karakoyunlu",
        "ascii": "Karakoyunlu",
        "enlem": 39.8703,
        "boylam": 43.63
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 39.9216,
        "boylam": 44.0468
      },
      {
        "ad": "Tuzluca",
        "ascii": "Tuzluca",
        "enlem": 40.0387,
        "boylam": 43.6521
      }
    ]
  },
  {
    "plaka": 77,
    "ad": "Yalova",
    "ascii": "Yalova",
    "enlem": 40.6556,
    "boylam": 29.275,
    "ilceler": [
      {
        "ad": "Altınova",
        "ascii": "Altinova",
        "enlem": 40.6949,
        "boylam": 29.5099
      },
      {
        "ad": "Armutlu",
        "ascii": "Armutlu",
        "enlem": 40.5194,
        "boylam": 28.8281
      },
      {
        "ad": "Çınarcık",
        "ascii": "Cinarcik",
        "enlem": 40.6454,
        "boylam": 29.1245
      },
      {
        "ad": "Çiftlikköy",
        "ascii": "Ciftlikkoy",
        "enlem": 40.6603,
        "boylam": 29.3236
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.6557,
        "boylam": 29.2729
      },
      {
        "ad": "Termal",
        "ascii": "Termal",
        "enlem": 40.6078,
        "boylam": 29.1736
      }
    ]
  },
  {
    "plaka": 78,
    "ad": "Karabük",
    "ascii": "Karabuk",
    "enlem": 41.2,
    "boylam": 32.6333,
    "ilceler": [
      {
        "ad": "Eflani",
        "ascii": "Eflani",
        "enlem": 41.4229,
        "boylam": 32.9576
      },
      {
        "ad": "Eskipazar",
        "ascii": "Eskipazar",
        "enlem": 40.943,
        "boylam": 32.5309
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 41.1955,
        "boylam": 32.6231
      },
      {
        "ad": "Ovacık",
        "ascii": "Ovacik",
        "enlem": 41.0766,
        "boylam": 32.9199
      },
      {
        "ad": "Safranbolu",
        "ascii": "Safranbolu",
        "enlem": 41.2508,
        "boylam": 32.6942
      },
      {
        "ad": "Yenice",
        "ascii": "Yenice",
        "enlem": 41.2,
        "boylam": 32.3333
      }
    ]
  },
  {
    "plaka": 79,
    "ad": "Kilis",
    "ascii": "Kilis",
    "enlem": 36.7167,
    "boylam": 37.1167,
    "ilceler": [
      {
        "ad": "Elbeyli",
        "ascii": "Elbeyli",
        "enlem": 36.6742,
        "boylam": 37.4667
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 36.718,
        "boylam": 37.1169
      },
      {
        "ad": "Musabeyli",
        "ascii": "Musabeyli",
        "enlem": 36.8864,
        "boylam": 36.9186
      },
      {
        "ad": "Polateli",
        "ascii": "Polateli",
        "enlem": 36.8414,
        "boylam": 37.1441
      }
    ]
  },
  {
    "plaka": 80,
    "ad": "Osmaniye",
    "ascii": "Osmaniye",
    "enlem": 37.075,
    "boylam": 36.25,
    "ilceler": [
      {
        "ad": "Bahçe",
        "ascii": "Bahce",
        "enlem": 37.2011,
        "boylam": 36.5775
      },
      {
        "ad": "Düziçi",
        "ascii": "Duzici",
        "enlem": 37.2422,
        "boylam": 36.4548
      },
      {
        "ad": "Hasanbeyli",
        "ascii": "Hasanbeyli",
        "enlem": 37.1284,
        "boylam": 36.5461
      },
      {
        "ad": "Kadirli",
        "ascii": "Kadirli",
        "enlem": 37.3739,
        "boylam": 36.0961
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 37.0737,
        "boylam": 36.2559
      },
      {
        "ad": "Sumbas",
        "ascii": "Sumbas",
        "enlem": 37.4513,
        "boylam": 36.0235
      },
      {
        "ad": "Toprakkale",
        "ascii": "Toprakkale",
        "enlem": 37.0639,
        "boylam": 36.1469
      }
    ]
  },
  {
    "plaka": 81,
    "ad": "Düzce",
    "ascii": "Duzce",
    "enlem": 40.8417,
    "boylam": 31.1583,
    "ilceler": [
      {
        "ad": "Akçakoca",
        "ascii": "Akcakoca",
        "enlem": 41.0866,
        "boylam": 31.1162
      },
      {
        "ad": "Cumayeri",
        "ascii": "Cumayeri",
        "enlem": 40.8739,
        "boylam": 30.9509
      },
      {
        "ad": "Çilimli",
        "ascii": "Cilimli",
        "enlem": 40.8936,
        "boylam": 31.0492
      },
      {
        "ad": "Gölyaka",
        "ascii": "Golyaka",
        "enlem": 40.7769,
        "boylam": 30.9959
      },
      {
        "ad": "Gümüşova",
        "ascii": "Gumusova",
        "enlem": 40.8469,
        "boylam": 30.9411
      },
      {
        "ad": "Kaynaşlı",
        "ascii": "Kaynasli",
        "enlem": 40.7692,
        "boylam": 31.3221
      },
      {
        "ad": "Merkez",
        "ascii": "Merkez",
        "enlem": 40.8459,
        "boylam": 31.1649
      },
      {
        "ad": "Yığılca",
        "ascii": "Yigilca",
        "enlem": 40.9598,
        "boylam": 31.4436
      }
    ]
  }
];

    function normalizeMetin(metin) {
        if (!metin) return "";
        return String(metin)
            .trim()
            .replace(/İ/g, "i")
            .replace(/I/g, "ı")
            .toLowerCase()
            .replace(/ç/g, "c")
            .replace(/ğ/g, "g")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ş/g, "s")
            .replace(/ü/g, "u")
            .replace(/[^a-z0-9]/g, "");
    }

    function bulSehir(aranan) {
        if (aranan === null || aranan === undefined || aranan === "") return null;
        const kirpilan = String(aranan).trim();
        if (/^\d{1,2}$/.test(kirpilan)) {
            const plakaNo = parseInt(kirpilan, 10);
            if (plakaNo >= 1 && plakaNo <= 81) {
                return SEHIRLER.find(s => s.plaka === plakaNo) || null;
            }
        }

        const hedef = normalizeMetin(aranan);
        if (!hedef) return null;

        let eslesen = SEHIRLER.find(s => normalizeMetin(s.ad) === hedef || normalizeMetin(s.ascii) === hedef);
        if (eslesen) return eslesen;

        eslesen = SEHIRLER.find(s => {
            const adNorm = normalizeMetin(s.ad);
            return hedef.startsWith(adNorm) || adNorm.startsWith(hedef);
        });

        return eslesen || null;
    }

    function ilceListesi(sehirAdi) {
        const sehir = bulSehir(sehirAdi);
        return sehir ? (sehir.ilceler || []) : [];
    }

    function bulIlce(sehirAdi, ilceAdi) {
        if (!ilceAdi) return null;
        const ilceler = ilceListesi(sehirAdi);
        const hedef = normalizeMetin(ilceAdi);
        if (!hedef) return null;

        let eslesen = ilceler.find(d => normalizeMetin(d.ad) === hedef || normalizeMetin(d.ascii) === hedef);
        if (eslesen) return eslesen;

        eslesen = ilceler.find(d => {
            const dNorm = normalizeMetin(d.ad);
            return hedef.startsWith(dNorm) || dNorm.startsWith(hedef);
        });

        return eslesen || null;
    }

    function koordinatGetir(sehirAdi, ilceAdi) {
        const sehir = bulSehir(sehirAdi);
        if (!sehir) return null;

        if (ilceAdi) {
            const ilce = bulIlce(sehir.ad, ilceAdi);
            if (ilce) {
                return {
                    sehir: sehir.ad,
                    ilce: ilce.ad,
                    asciiSehir: sehir.ascii,
                    asciiIlce: ilce.ascii,
                    enlem: ilce.enlem,
                    boylam: ilce.boylam,
                    plaka: sehir.plaka
                };
            }
        }

        return {
            sehir: sehir.ad,
            ilce: "",
            asciiSehir: sehir.ascii,
            asciiIlce: "",
            enlem: sehir.enlem,
            boylam: sehir.boylam,
            plaka: sehir.plaka
        };
    }

    return {
        SEHIRLER: SEHIRLER,
        bulSehir: bulSehir,
        bulIlce: bulIlce,
        ilceListesi: ilceListesi,
        koordinatGetir: koordinatGetir,
        sehirListesi: function () {
            return SEHIRLER.map(s => s.ad);
        }
    };
}));
