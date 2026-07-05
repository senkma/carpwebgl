# 🌍 CARP WebGL Globe Explorer

**Luxusní interaktivní 3D aplikace pro Czech Antarctic Research Programme**

Toto je plně interaktivní WebGL aplikace s 3D zeměkoulí, která vás vezme na virtuální cestu od Brna přes oceán až na antarktické stanice CARP.

## ✨ Features

- 🌐 **Realistická 3D zeměkoule** s vlastními shadery
- 🎮 **Plná interaktivita** - drag, zoom, klikatelné lokace
- ✈️ **Cinematic fly-in animace** ke každé lokaci
- 💎 **Luxusní glassmorphic UI design**
- 📍 **3 klíčové lokace:**
  - Johann Gregor Mendel Station (Antarktida)
  - Refugio CZ*ECO Nelson (Nelson Island)
  - Masaryk University (Brno)
- ⭐ **10,000 hvězd** na pozadí
- 🌊 **Atmosférické efekty** a svítící markery
- 📱 **Fully responsive** - funguje na mobilu i desktopu

## 🚀 Jak spustit

### Metoda 1: Jednoduchý lokální server (doporučeno)

```bash
# Pokud máte Python 3:
python -m http.server 8000

# Nebo Python 2:
python -m SimpleHTTPServer 8000

# Nebo Node.js:
npx http-server

# Nebo PHP:
php -S localhost:8000
```

Pak otevřete prohlížeč na: `http://localhost:8000`

### Metoda 2: Přímé otevření

Můžete také prostě otevřít `index.html` přímo v prohlížeči (některé funkce mohou být omezené kvůli CORS).

## 🎮 Ovládání

| Akce | Ovládání |
|------|----------|
| **Rotace zeměkoule** | Drag myší / touch |
| **Zoom** | Kolečko myši / pinch na mobilu |
| **Přiblížení na lokaci** | Klikněte na kartu vpravo nebo přímo na marker |
| **Reset pohledu** | Tlačítko "Reset View" v headeru |
| **Zavřít info panel** | Tlačítko × v panelu |

## 🛠️ Technologie

- **Three.js** (r128) - 3D WebGL knihovna
- **Custom GLSL Shaders** - Pro realistické osvětlení a atmosféru
- **Vanilla JavaScript** - Bez dalších závislostí
- **CSS3 Glassmorphism** - Moderní UI design
- **Responsive Design** - Mobile-first přístup

## 📂 Struktura projektu

```
carpwebgl/
├── index.html          # Hlavní HTML struktura
├── style.css           # Všechny styly (glassmorphism, animace)
├── app.js              # Hlavní WebGL aplikace
└── README.md           # Dokumentace
```

## 🎨 Design

Design využívá futuristický sci-fi styl s:
- **Barevná paleta:** Tmavé pozadí (#0a0e27) + cyan akcenty (#00d4ff)
- **Fonty:** 
  - Orbitron (nadpisy, loga)
  - Rajdhani (tělo textu)
- **Efekty:**
  - Glassmorphism (backdrop-filter blur)
  - Neon glow efekty
  - Smooth animace s easing funkcemi
  - Pulsující markery

## 🌟 Klíčové komponenty

### Globe Rendering
- Procedurálně generovaná textura Země
- Custom shader materiál s realistickým osvětlením
- Atmosférický glow efekt
- Auto-rotace a smooth interpolace

### Interactive Markers
- Svítící 3D piny na lokacích
- Pulsující ring animace
- Raycasting pro klik detekci
- Dynamické pozicování pomocí lat/lon konverze

### Camera System
- Smooth fly-to animace s easing
- Zoom constraints (3-15 jednotek)
- Drag-to-rotate s momentum
- Touch gesture podpora

### UI System
- Info panely s detailními informacemi
- Statistiky a research data
- Responsive layout
- Glassmorphic design

## 📊 Data z carp.sci.muni.cz

Aplikace zobrazuje reálná data o:
- Antarktických stanicích
- Výzkumných aktivitách
- Infrastruktuře
- Vědeckých programech

## 🔧 Další vylepšení (možnosti)

Pokud chcete aplikaci rozšířit:

1. **Real-time data:** Připojit API pro živá meteorologická data
2. **3D modely:** Přidat detailní 3D modely stanic
3. **Časová osa:** Zobrazit historii expedic
4. **Fotogalerie:** Integrovat 360° fotografie z Antarktidy
5. **Multi-jazyk:** Přidat češtinu/angličtinu
6. **VR režim:** WebXR podpora pro VR headsety
7. **Herní prvky:** Achievement systém, discoverable content

## 📝 Poznámky

- Aplikace používá Three.js z CDN (r128)
- Pro produkci doporučuji stáhnout Three.js lokálně
- Testováno v Chrome, Firefox, Safari, Edge
- Vyžaduje WebGL podporu v prohlížeči

## 👨‍💻 Autor

Vytvořeno pro **Czech Antarctic Research Programme (CARP)**
Masaryk University, Faculty of Science

---

**© 2026 Masaryk University | CARP**
