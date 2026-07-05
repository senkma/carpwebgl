# 🚀 Deployment Guide

Návod jak nasadit CARP WebGL Globe Explorer na různé platformy.

## 📦 Rychlý Start - Lokální Test

```bash
cd carpwebgl

# Python (nejjednodušší)
python3 -m http.server 8000

# Otevřít: http://localhost:8000
```

## 🌐 Deployment na Web

### 1. GitHub Pages (ZDARMA)

```bash
# 1. Vytvořte GitHub repository
git init
git add .
git commit -m "Initial commit - CARP WebGL Globe"
git branch -M main
git remote add origin https://github.com/VASE_JMENO/carp-globe.git
git push -u origin main

# 2. V GitHub Settings -> Pages
# Source: main branch / root
# URL: https://VASE_JMENO.github.io/carp-globe/
```

### 2. Netlify (ZDARMA, drag-and-drop)

1. Jděte na [netlify.com](https://netlify.com)
2. Přetáhněte složku `carpwebgl` do prohlížeče
3. Hotovo! Dostanete URL: `https://random-name.netlify.app`

**Custom doména:**
```
# V Netlify nastavení:
Domain Settings -> Add custom domain
```

### 3. Vercel (ZDARMA, pro Next.js i statické weby)

```bash
# Nainstalujte Vercel CLI
npm i -g vercel

# V projektové složce:
cd carpwebgl
vercel

# Následujte instrukce
# URL: https://carp-globe.vercel.app
```

### 4. Cloudflare Pages (ZDARMA, rychlé CDN)

```bash
# 1. Push na GitHub (viz GitHub Pages výše)
# 2. Jděte na pages.cloudflare.com
# 3. Connect to Git -> Vyberte repository
# 4. Build settings:
#    - Framework preset: None
#    - Build command: (prázdné)
#    - Build output directory: /
# 5. Deploy!
```

### 5. Vlastní hosting (cPanel, FTP)

```bash
# 1. Zabalte soubory
zip -r carp-globe.zip index.html style.css app.js particles.js README.md

# 2. Nahrajte přes FTP do public_html/
# 3. Rozbalte na serveru
# 4. URL: https://vase-domena.cz/
```

## ⚙️ Optimalizace pro Produkci

### 1. Stáhnout Three.js lokálně (lepší rychlost)

```bash
# Místo CDN
# Stáhněte Three.js r128
wget https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js

# V index.html změňte:
# <script src="https://cdnjs.../three.min.js"></script>
# na:
# <script src="three.min.js"></script>
```

### 2. Minifikace

```bash
# Nainstalujte nástroje
npm install -g terser clean-css-cli html-minifier

# Minifikace JS
terser app.js -o app.min.js -c -m
terser particles.js -o particles.min.js -c -m

# Minifikace CSS
cleancss -o style.min.css style.css

# Minifikace HTML
html-minifier --collapse-whitespace --remove-comments \
  --minify-js true --minify-css true \
  -o index.min.html index.html
```

### 3. Gzip komprese (Apache)

Vytvořte `.htaccess`:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

### 4. Přidat Analytics (Google Analytics)

V `index.html` před `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 SSL Certifikát (HTTPS)

Většina moderních platforem (Netlify, Vercel, Cloudflare) poskytuje SSL zdarma.

Pro vlastní hosting:
```bash
# Let's Encrypt (zdarma)
sudo certbot --apache -d vase-domena.cz
```

## 📊 Performance Checklist

- [ ] Three.js lokálně místo CDN
- [ ] Minifikované JS/CSS
- [ ] Gzip komprese zapnuta
- [ ] Browser caching nastaveno
- [ ] CDN pro statické assety
- [ ] Lazy loading pro velké textury
- [ ] WebP obrázky místo PNG/JPG

## 🔧 Custom Domain Setup

### Na carp.sci.muni.cz/globe

Pokud chcete nasadit na subdoménu:

1. **DNS nastavení:**
```
A record: globe.carp.sci.muni.cz -> IP serveru
nebo
CNAME: globe.carp.sci.muni.cz -> netlify-site.netlify.app
```

2. **V platformě nastavte custom domain:**
- Netlify: Domain Settings -> Add domain
- Vercel: Settings -> Domains -> Add

## 🐛 Troubleshooting

### CORS chyby
```
# Přidejte do .htaccess:
Header set Access-Control-Allow-Origin "*"
```

### WebGL nepodporováno
```javascript
// Přidejte fallback do app.js:
if (!renderer.capabilities.isWebGL2) {
    alert('Your browser does not support WebGL. Please use a modern browser.');
}
```

### Pomalé načítání
- Zkontrolujte Developer Tools -> Network
- Optimalizujte textury
- Použijte CDN

## 📱 PWA (Progressive Web App)

Pro offline podporu vytvořte `manifest.json`:

```json
{
  "name": "CARP Globe Explorer",
  "short_name": "CARP Globe",
  "description": "Interactive Antarctic Research Globe",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#00d4ff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

**Pro více informací kontaktujte CARP team.**
