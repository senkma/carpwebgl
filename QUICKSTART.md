# ⚡ Quick Start - CARP WebGL Globe

**Rychlý návod jak spustit aplikaci během 30 sekund!**

## 🚀 Metoda 1: Python (doporučeno)

```bash
cd carpwebgl
python3 -m http.server 8000
```

Otevřete: **http://localhost:8000**

## 🚀 Metoda 2: Node.js

```bash
cd carpwebgl
npx http-server -p 8000
```

Otevřete: **http://localhost:8000**

## 🚀 Metoda 3: PHP

```bash
cd carpwebgl
php -S localhost:8000
```

Otevřete: **http://localhost:8000**

## 🎮 Co dělat po spuštění

1. **Počkejte na načtení** (loading screen)
2. **Táhněte myší** pro rotaci zeměkoule
3. **Klikněte na karty vpravo** pro přiblížení na lokace:
   - 🏔️ J.G. Mendel Station (Antarktida)
   - 🏕️ Refugio CZ*ECO Nelson (Nelson Island)
   - 🏛️ Masaryk University (Brno)
4. **Scrollujte kolečkem** pro zoom
5. **Klikněte Reset View** pro návrat

## 📁 Struktura projektu

```
carpwebgl/
├── index.html       # Hlavní HTML soubor
├── style.css        # Všechny styly
├── app.js           # Hlavní 3D aplikace (Three.js)
├── particles.js     # Částicový systém
├── README.md        # Plná dokumentace
├── DEPLOYMENT.md    # Návod na nasazení
└── QUICKSTART.md    # Tento soubor
```

## 🐛 Problém?

**Server se nespustí?**
```bash
# Zkuste jiný port
python3 -m http.server 9000
```

**Aplikace se nenačte?**
- Zkontrolujte konzoli v Developer Tools (F12)
- Ujistěte se, že máte připojení k internetu (Three.js z CDN)

**WebGL nefunguje?**
- Použijte moderní prohlížeč (Chrome, Firefox, Edge, Safari)
- Aktualizujte grafické ovladače

## ✅ Checklist

- [x] Stáhnout/clone projekt
- [x] Spustit lokální server
- [x] Otevřít v prohlížeči
- [x] Užít si interaktivní zeměkouli! 🌍

---

**Pro detailní dokumentaci viz [README.md](README.md)**
**Pro deployment viz [DEPLOYMENT.md](DEPLOYMENT.md)**
