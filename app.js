// CARP WebGL Globe Application
// Main application file

// Global variables
let scene, camera, renderer, globe, controls;
let raycaster, mouse;
let markers = [];
let isAnimating = false;
let targetPosition = null;
let targetZoom = null;
let animationProgress = 0;
let particleSystem = null;
let connectionLines = null;
let autoRotateEnabled = true;
let currentLanguage = 'en';

// Translations
const translations = {
    en: {
        logoSubtitle: "Antarctic Explorer",
        mendelTitle: "J.G. Mendel Station",
        mendelLocation: "James Ross Island",
        nelsonTitle: "Refugio CZ*ECO Nelson",
        nelsonLocation: "Nelson Island",
        footerText: "© 2026 Masaryk University | Czech Antarctic Research Programme",
        controlDrag: "Drag",
        controlDragAction: "Rotate Globe",
        controlZoom: "Scroll",
        controlZoomAction: "Zoom",
        controlClick: "Click Card",
        controlClickAction: "Fly to Location",
        // Tab labels
        tabJGMendel: "J.G. Mendel",
        tabCZECONelson: "CZ*ECO Nelson",
        tabJamesRoss: "James Ross Island",
        tabNelsonIsland: "Nelson Island",
        tabResearch: "Research",
        tabMasaryk: "Masaryk University",
        // Content headings
        researchActivities: "Research Activities",
        facilitiesInfra: "Facilities & Infrastructure",
        geographicFeatures: "Geographic Features"
    },
    cs: {
        logoSubtitle: "Antarktický Průzkumník",
        mendelTitle: "Stanice J.G. Mendela",
        mendelLocation: "Ostrov Jamese Rosse",
        nelsonTitle: "Refugium CZ*ECO Nelson",
        nelsonLocation: "Nelsonův ostrov",
        footerText: "© 2026 Masarykova univerzita | Český antarktický výzkumný program",
        controlDrag: "Tažení",
        controlDragAction: "Otáčení glóbu",
        controlZoom: "Kolečko",
        controlZoomAction: "Přiblížení",
        controlClick: "Kliknutí na kartu",
        controlClickAction: "Let na místo",
        // Tab labels
        tabJGMendel: "J.G. Mendel",
        tabCZECONelson: "CZ*ECO Nelson",
        tabJamesRoss: "Ostrov J. Rosse",
        tabNelsonIsland: "Nelsonův ostrov",
        tabResearch: "Výzkum",
        tabMasaryk: "Masarykova univerzita",
        // Content headings
        researchActivities: "Výzkumné aktivity",
        facilitiesInfra: "Vybavení & Infrastruktura",
        geographicFeatures: "Geografické charakteristiky"
    }
};

// Location data
const locations = {
    mendel: {
        name: "Johann Gregor Mendel Czech Antarctic Station",
        coords: { lat: -63.8, lon: -57.9 },
        icon: "🏔️",
        info: {
            title: "J.G. Mendel Station",
            subtitle: "James Ross Island, Antarctica",
            description: "The Johann Gregor Mendel Czech Antarctic Station is the primary research facility of the Czech Antarctic Research Programme. Located on James Ross Island in the Antarctic Peninsula region, it serves as a hub for cutting-edge polar research.",
            images: {
                overview: "assets/jgm.png",
                research: "assets/jgm.png",
                facilities: "assets/jgm.png"
            },
            stats: [
                { label: "Established", value: "2006" },
                { label: "Location", value: "James Ross Island" },
                { label: "Capacity", value: "14 people" },
                { label: "Altitude", value: "10 m a.s.l." }
            ],
            research: [
                "Atmospheric Sciences - monitoring climate change and atmospheric composition",
                "Geosciences - studying geological history and active processes",
                "Biology - investigating polar ecosystems and adaptation",
                "Long-term ecological monitoring (LTEM)"
            ],
            facilities: [
                "Modern laboratory facilities",
                "Accommodation for researchers",
                "Weather monitoring station",
                "Communication systems"
            ]
        }
    },
    nelson: {
        name: "Refugio CZ*ECO Nelson",
        coords: { lat: -62.3, lon: -59.0 },
        icon: "🏕️",
        info: {
            title: "Refugio CZ*ECO Nelson",
            subtitle: "Nelson Island, South Shetland Islands",
            description: "A field refuge located on Nelson Island, providing support for ecological and environmental research in the maritime Antarctic region. This facility enables year-round scientific activities in one of the most dynamic Antarctic environments.",
            images: {
                overview: "assets/nelson.jpg",
                research: "assets/nelson.jpg",
                facilities: "assets/nelson.jpg"
            },
            stats: [
                { label: "Type", value: "Field Refuge" },
                { label: "Location", value: "Nelson Island" },
                { label: "Region", value: "S. Shetlands" },
                { label: "Climate", value: "Maritime" }
            ],
            research: [
                "Marine ecology studies",
                "Coastal ecosystem monitoring",
                "Ornithological research",
                "Climate variability assessment"
            ],
            facilities: [
                "Basic accommodation",
                "Field laboratory",
                "Emergency shelter",
                "Storage facilities"
            ]
        }
    },
    brno: {
        name: "Masaryk University",
        coords: { lat: 49.2, lon: 16.6 },
        icon: "🏛️",
        info: {
            title: "Masaryk University",
            subtitle: "Brno, Czech Republic",
            description: "Masaryk University in Brno is the headquarters of the Czech Antarctic Research Programme (CARP). The Faculty of Science coordinates all Antarctic research activities, manages logistics, and processes scientific data collected from Antarctic stations.",
            images: {
                overview: "assets/muni.jpg",
                research: "assets/muni.jpg",
                facilities: "assets/muni.jpg"
            },
            stats: [
                { label: "Founded", value: "1919" },
                { label: "Students", value: "30,000+" },
                { label: "Location", value: "Brno, CZ" },
                { label: "CARP Since", value: "2006" }
            ],
            research: [
                "Polar-Geo-Lab - Geological and geophysical research",
                "Polar-Bio-Lab - Biological and ecological studies",
                "Data analysis and long-term monitoring",
                "International collaboration coordination"
            ],
            facilities: [
                "Advanced research laboratories",
                "Data processing center",
                "Sample storage and analysis",
                "Training facilities for Antarctic expeditions"
            ]
        }
    }
};

// Initialize the application
function init() {
    updateLoadingProgress(10, 'Creating 3D scene...');

    // Scene setup with no fog (transparent background)
    scene = new THREE.Scene();

    // Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 10);  // Zvýšeno z 8 na 10 pro menší zobrazení zeměkoule

    // Renderer setup with transparent background
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('globe-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent background

    updateLoadingProgress(30, 'Building planet Earth...');

    // Create globe
    createGlobe();

    updateLoadingProgress(50, 'Adding atmosphere...');

    // Create atmosphere
    createAtmosphere();

    updateLoadingProgress(60, 'Placing location markers...');

    // Create location markers
    createMarkers();

    updateLoadingProgress(70, 'Preparing vintage atmosphere...');

    // Stars removed for vintage look
    // createStars();

    updateLoadingProgress(80, 'Setting up lights...');

    // Lighting
    createLights();

    updateLoadingProgress(90, 'Initializing controls...');

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    setupEventListeners();

    // Particle system removed for cleaner scientific look
    // particleSystem = new ParticleSystem(scene);

    // Connection lines removed for cleaner look
    // connectionLines = new ConnectionLines(scene, locations, globe);

    updateLoadingProgress(100, 'Launch sequence complete!');

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        animate();
    }, 500);
}

// Create the main globe with real NASA texture
function createGlobe() {
    const geometry = new THREE.SphereGeometry(2, 128, 128);

    // Load real Earth texture
    const textureLoader = new THREE.TextureLoader();

    // Using NASA Blue Marble texture (high quality, free to use)
    const earthTexture = textureLoader.load(
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        function(texture) {
            updateLoadingProgress(45, 'Earth texture loaded...');
        },
        undefined,
        function(error) {
            console.log('Failed to load NASA texture, using fallback');
            // Fallback if CDN fails
            createFallbackTexture();
        }
    );

    earthTexture.anisotropy = 16;

    // Create custom shader material for realistic Earth
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform sampler2D globeTexture;
        uniform vec3 lightPosition;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            // Base texture
            vec4 texColor = texture2D(globeTexture, vUv);

            // Realistic lighting - světlejší verze s více ambientem pro tmavou stranu
            vec3 lightDir = normalize(lightPosition - vPosition);
            float diff = max(dot(vNormal, lightDir), 0.0);
            float ambient = 0.65;  // Zvýšeno z 0.55 na 0.65 pro světlejší tmavou stranu
            float lighting = ambient + diff * 0.65;  // Lehce upraveno

            gl_FragColor = vec4(texColor.rgb * lighting, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            globeTexture: { value: earthTexture },
            lightPosition: { value: new THREE.Vector3(5, 3, 5) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    globe = new THREE.Mesh(geometry, material);

    // Default rotation to show Antarctica (SOUTH Pole!)
    // Need to flip to show the BOTTOM of the globe (South Pole)
    globe.rotation.x = -Math.PI / 2;  // Flip DOWN to show South Pole (negative!)
    globe.rotation.y = 0; // No Y rotation needed initially

    scene.add(globe);
}

// Fallback function if NASA texture fails to load
function createFallbackTexture() {

    // Fallback: Use high-quality procedural texture
    const canvas = document.createElement('canvas');
    canvas.width = 8192;
    canvas.height = 4096;
    const ctx = canvas.getContext('2d');

    // Ocean - Natural Earth colors
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#4a7ba7');
    oceanGrad.addColorStop(0.3, '#2b5876');
    oceanGrad.addColorStop(0.5, '#1a4d6f');
    oceanGrad.addColorStop(0.7, '#2b5876');
    oceanGrad.addColorStop(1, '#4a7ba7');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle ocean texture
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(20, 40, 70, ${Math.random() * 0.15})`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, Math.random() * 300, Math.random() * 300);
    }

    // Draw ultra-realistic continents
    drawUltraRealisticContinents(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;

    // Update globe material with fallback texture
    if (globe && globe.material && globe.material.uniforms) {
        globe.material.uniforms.globeTexture.value = texture;
        globe.material.needsUpdate = true;
    }
}

// Draw ultra-realistic continents based on actual geographic data
function drawUltraRealisticContinents(ctx, w, h) {
    ctx.save();

    // Land base colors - varied terrain
    const landBase = '#4a6741';
    const landDark = '#3a5435';
    const landLight = '#5a7a51';
    const desert = '#c9b583';
    const mountain = '#8b9488';
    const ice = '#ffffff';

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';

    // === NORTH AMERICA ===
    ctx.fillStyle = landBase;
    ctx.beginPath();
    // Alaska
    ctx.moveTo(w * 0.05, h * 0.18);
    ctx.bezierCurveTo(w * 0.07, h * 0.15, w * 0.12, h * 0.14, w * 0.15, h * 0.16);
    // Canada - complex coastline
    ctx.bezierCurveTo(w * 0.18, h * 0.15, w * 0.21, h * 0.16, w * 0.24, h * 0.18);
    ctx.bezierCurveTo(w * 0.26, h * 0.17, w * 0.28, h * 0.18, w * 0.29, h * 0.20);
    ctx.bezierCurveTo(w * 0.30, h * 0.22, w * 0.30, h * 0.25, w * 0.29, h * 0.28);
    // Eastern coast
    ctx.bezierCurveTo(w * 0.29, h * 0.32, w * 0.28, h * 0.36, w * 0.27, h * 0.38);
    // Florida peninsula
    ctx.lineTo(w * 0.265, h * 0.42);
    ctx.lineTo(w * 0.267, h * 0.43);
    ctx.lineTo(w * 0.265, h * 0.42);
    // Gulf of Mexico
    ctx.bezierCurveTo(w * 0.24, h * 0.41, w * 0.22, h * 0.42, w * 0.20, h * 0.42);
    // Mexico
    ctx.bezierCurveTo(w * 0.18, h * 0.43, w * 0.17, h * 0.45, w * 0.165, h * 0.47);
    ctx.bezierCurveTo(w * 0.16, h * 0.48, w * 0.165, h * 0.485, w * 0.17, h * 0.49);
    // Central America
    ctx.lineTo(w * 0.175, h * 0.50);
    ctx.lineTo(w * 0.18, h * 0.505);
    // West coast back up
    ctx.bezierCurveTo(w * 0.16, h * 0.49, w * 0.14, h * 0.46, w * 0.13, h * 0.42);
    ctx.bezierCurveTo(w * 0.115, h * 0.38, w * 0.10, h * 0.33, w * 0.095, h * 0.28);
    ctx.bezierCurveTo(w * 0.09, h * 0.24, w * 0.08, h * 0.20, w * 0.05, h * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === SOUTH AMERICA ===
    ctx.fillStyle = landBase;
    ctx.beginPath();
    // Colombia/Venezuela
    ctx.moveTo(w * 0.185, h * 0.505);
    ctx.bezierCurveTo(w * 0.19, h * 0.51, w * 0.20, h * 0.515, w * 0.215, h * 0.52);
    // Brazil bulge
    ctx.bezierCurveTo(w * 0.23, h * 0.525, w * 0.245, h * 0.535, w * 0.255, h * 0.55);
    ctx.bezierCurveTo(w * 0.26, h * 0.57, w * 0.265, h * 0.60, w * 0.265, h * 0.63);
    // Southern Brazil
    ctx.bezierCurveTo(w * 0.26, h * 0.66, w * 0.25, h * 0.69, w * 0.24, h * 0.71);
    // Argentina
    ctx.bezierCurveTo(w * 0.23, h * 0.74, w * 0.225, h * 0.77, w * 0.22, h * 0.795);
    // Tierra del Fuego
    ctx.lineTo(w * 0.215, h * 0.81);
    // West coast - Chile
    ctx.bezierCurveTo(w * 0.21, h * 0.80, w * 0.205, h * 0.76, w * 0.20, h * 0.72);
    ctx.bezierCurveTo(w * 0.195, h * 0.68, w * 0.19, h * 0.63, w * 0.188, h * 0.58);
    ctx.bezierCurveTo(w * 0.186, h * 0.55, w * 0.184, h * 0.53, w * 0.185, h * 0.505);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === EUROPE ===
    ctx.fillStyle = landBase;
    ctx.beginPath();
    // Scandinavia
    ctx.moveTo(w * 0.51, h * 0.22);
    ctx.bezierCurveTo(w * 0.515, h * 0.20, w * 0.525, h * 0.19, w * 0.535, h * 0.20);
    ctx.bezierCurveTo(w * 0.54, h * 0.215, w * 0.54, h * 0.23, w * 0.535, h * 0.245);
    // Eastern Europe
    ctx.bezierCurveTo(w * 0.54, h * 0.26, w * 0.545, h * 0.28, w * 0.545, h * 0.30);
    // Black Sea area
    ctx.bezierCurveTo(w * 0.544, h * 0.32, w * 0.538, h * 0.335, w * 0.532, h * 0.34);
    // Mediterranean
    ctx.bezierCurveTo(w * 0.52, h * 0.345, w * 0.505, h * 0.345, w * 0.495, h * 0.342);
    // Iberian Peninsula
    ctx.bezierCurveTo(w * 0.48, h * 0.34, w * 0.47, h * 0.335, w * 0.465, h * 0.33);
    // France
    ctx.bezierCurveTo(w * 0.47, h * 0.32, w * 0.48, h * 0.30, w * 0.485, h * 0.28);
    // British Isles
    ctx.bezierCurveTo(w * 0.485, h * 0.265, w * 0.48, h * 0.25, w * 0.485, h * 0.24);
    ctx.bezierCurveTo(w * 0.49, h * 0.23, w * 0.50, h * 0.225, w * 0.51, h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === AFRICA ===
    ctx.fillStyle = landBase;
    ctx.beginPath();
    // North Africa - Mediterranean coast
    ctx.moveTo(w * 0.495, h * 0.345);
    ctx.bezierCurveTo(w * 0.51, h * 0.348, w * 0.53, h * 0.35, w * 0.545, h * 0.355);
    // Egypt/Red Sea
    ctx.bezierCurveTo(w * 0.555, h * 0.36, w * 0.565, h * 0.37, w * 0.57, h * 0.39);
    // Horn of Africa
    ctx.bezierCurveTo(w * 0.575, h * 0.41, w * 0.58, h * 0.43, w * 0.582, h * 0.45);
    ctx.lineTo(w * 0.587, h * 0.465);
    // East Africa
    ctx.bezierCurveTo(w * 0.585, h * 0.49, w * 0.58, h * 0.52, w * 0.575, h * 0.55);
    // Southern Africa
    ctx.bezierCurveTo(w * 0.565, h * 0.59, w * 0.55, h * 0.64, w * 0.535, h * 0.68);
    ctx.bezierCurveTo(w * 0.525, h * 0.71, w * 0.515, h * 0.735, w * 0.505, h * 0.75);
    // Cape of Good Hope
    ctx.bezierCurveTo(w * 0.50, h * 0.755, w * 0.495, h * 0.755, w * 0.49, h * 0.75);
    // West coast
    ctx.bezierCurveTo(w * 0.485, h * 0.73, w * 0.48, h * 0.70, w * 0.475, h * 0.66);
    ctx.bezierCurveTo(w * 0.47, h * 0.61, w * 0.465, h * 0.55, w * 0.46, h * 0.50);
    // Gulf of Guinea
    ctx.bezierCurveTo(w * 0.46, h * 0.47, w * 0.465, h * 0.45, w * 0.473, h * 0.44);
    ctx.bezierCurveTo(w * 0.48, h * 0.43, w * 0.485, h * 0.425, w * 0.488, h * 0.42);
    // West Africa bulge
    ctx.bezierCurveTo(w * 0.485, h * 0.40, w * 0.48, h * 0.37, w * 0.485, h * 0.35);
    ctx.bezierCurveTo(w * 0.49, h * 0.347, w * 0.495, h * 0.345, w * 0.495, h * 0.345);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === ASIA ===
    ctx.fillStyle = landBase;
    ctx.beginPath();
    // Russia - Ural continuation from Europe
    ctx.moveTo(w * 0.545, h * 0.30);
    ctx.bezierCurveTo(w * 0.56, h * 0.295, w * 0.58, h * 0.29, w * 0.60, h * 0.28);
    // Siberia
    ctx.bezierCurveTo(w * 0.65, h * 0.265, w * 0.72, h * 0.25, w * 0.78, h * 0.24);
    ctx.bezierCurveTo(w * 0.84, h * 0.235, w * 0.89, h * 0.24, w * 0.92, h * 0.25);
    // Kamchatka
    ctx.bezierCurveTo(w * 0.94, h * 0.26, w * 0.955, h * 0.275, w * 0.96, h * 0.29);
    // Eastern Russia
    ctx.bezierCurveTo(w * 0.96, h * 0.31, w * 0.955, h * 0.33, w * 0.945, h * 0.35);
    // Japan area (separate islands drawn later)
    ctx.bezierCurveTo(w * 0.92, h * 0.36, w * 0.89, h * 0.365, w * 0.87, h * 0.37);
    // Korea
    ctx.lineTo(w * 0.855, h * 0.385);
    // China coast
    ctx.bezierCurveTo(w * 0.84, h * 0.40, w * 0.82, h * 0.425, w * 0.80, h * 0.45);
    // Southeast Asia
    ctx.bezierCurveTo(w * 0.785, h * 0.47, w * 0.77, h * 0.49, w * 0.76, h * 0.505);
    ctx.bezierCurveTo(w * 0.75, h * 0.515, w * 0.745, h * 0.52, w * 0.74, h * 0.525);
    // Malay Peninsula
    ctx.lineTo(w * 0.735, h * 0.535);
    // Indochina
    ctx.bezierCurveTo(w * 0.725, h * 0.525, w * 0.715, h * 0.51, w * 0.71, h * 0.495);
    // India
    ctx.bezierCurveTo(w * 0.70, h * 0.485, w * 0.69, h * 0.475, w * 0.68, h * 0.47);
    ctx.bezierCurveTo(w * 0.665, h * 0.455, w * 0.655, h * 0.435, w * 0.650, h * 0.415);
    // Indian subcontinent
    ctx.bezierCurveTo(w * 0.645, h * 0.395, w * 0.645, h * 0.375, w * 0.648, h * 0.36);
    ctx.bezierCurveTo(w * 0.650, h * 0.345, w * 0.655, h * 0.335, w * 0.662, h * 0.33);
    // Pakistan/Afghanistan
    ctx.bezierCurveTo(w * 0.670, h * 0.325, w * 0.675, h * 0.32, w * 0.675, h * 0.315);
    // Central Asia
    ctx.bezierCurveTo(w * 0.675, h * 0.31, w * 0.67, h * 0.305, w * 0.66, h * 0.305);
    // Middle East
    ctx.bezierCurveTo(w * 0.645, h * 0.305, w * 0.625, h * 0.31, w * 0.605, h * 0.32);
    ctx.bezierCurveTo(w * 0.585, h * 0.33, w * 0.565, h * 0.335, w * 0.555, h * 0.335);
    // Arabian Peninsula
    ctx.bezierCurveTo(w * 0.56, h * 0.35, w * 0.565, h * 0.37, w * 0.57, h * 0.39);
    ctx.bezierCurveTo(w * 0.575, h * 0.40, w * 0.58, h * 0.405, w * 0.585, h * 0.405);
    ctx.bezierCurveTo(w * 0.590, h * 0.40, w * 0.595, h * 0.39, w * 0.595, h * 0.38);
    // Persian Gulf back to connection
    ctx.bezierCurveTo(w * 0.59, h * 0.365, w * 0.58, h * 0.35, w * 0.565, h * 0.34);
    ctx.bezierCurveTo(w * 0.555, h * 0.335, w * 0.545, h * 0.32, w * 0.545, h * 0.30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === AUSTRALIA ===
    ctx.fillStyle = desert;
    ctx.beginPath();
    ctx.moveTo(w * 0.805, h * 0.66);
    ctx.bezierCurveTo(w * 0.825, h * 0.655, w * 0.850, h * 0.66, w * 0.870, h * 0.675);
    ctx.bezierCurveTo(w * 0.885, h * 0.69, w * 0.890, h * 0.715, w * 0.887, h * 0.74);
    ctx.bezierCurveTo(w * 0.88, h * 0.765, w * 0.865, h * 0.785, w * 0.845, h * 0.795);
    ctx.bezierCurveTo(w * 0.82, h * 0.805, w * 0.79, h * 0.800, w * 0.770, h * 0.785);
    ctx.bezierCurveTo(w * 0.755, h * 0.77, w * 0.750, h * 0.745, w * 0.755, h * 0.715);
    ctx.bezierCurveTo(w * 0.76, h * 0.69, w * 0.78, h * 0.67, w * 0.805, h * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === ANTARCTICA ===
    ctx.fillStyle = ice;
    ctx.beginPath();
    // Main ice sheet
    ctx.moveTo(0, h * 0.88);
    ctx.lineTo(w, h * 0.88);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Antarctic Peninsula detail (where JGM station is)
    ctx.fillStyle = '#f0f8ff';
    ctx.beginPath();
    ctx.moveTo(w * 0.20, h * 0.87);
    ctx.bezierCurveTo(w * 0.205, h * 0.85, w * 0.21, h * 0.84, w * 0.215, h * 0.845);
    ctx.bezierCurveTo(w * 0.22, h * 0.85, w * 0.225, h * 0.86, w * 0.225, h * 0.87);
    ctx.lineTo(w * 0.20, h * 0.87);
    ctx.closePath();
    ctx.fill();

    // === GREENLAND ===
    ctx.fillStyle = ice;
    ctx.beginPath();
    ctx.moveTo(w * 0.265, h * 0.14);
    ctx.bezierCurveTo(w * 0.275, h * 0.125, w * 0.290, h * 0.12, w * 0.305, h * 0.13);
    ctx.bezierCurveTo(w * 0.315, h * 0.145, w * 0.318, h * 0.165, w * 0.315, h * 0.185);
    ctx.bezierCurveTo(w * 0.31, h * 0.205, w * 0.295, h * 0.215, w * 0.280, h * 0.210);
    ctx.bezierCurveTo(w * 0.265, h * 0.20, w * 0.255, h * 0.18, w * 0.260, h * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === ISLANDS ===
    // Japan
    ctx.fillStyle = landBase;
    ctx.beginPath();
    ctx.moveTo(w * 0.87, h * 0.365);
    ctx.bezierCurveTo(w * 0.875, h * 0.355, w * 0.885, h * 0.35, w * 0.892, h * 0.355);
    ctx.bezierCurveTo(w * 0.895, h * 0.37, w * 0.893, h * 0.385, w * 0.888, h * 0.395);
    ctx.bezierCurveTo(w * 0.880, h * 0.400, w * 0.872, h * 0.395, w * 0.868, h * 0.385);
    ctx.bezierCurveTo(w * 0.867, h * 0.375, w * 0.868, h * 0.368, w * 0.87, h * 0.365);
    ctx.closePath();
    ctx.fill();

    // New Zealand
    ctx.beginPath();
    ctx.moveTo(w * 0.945, h * 0.79);
    ctx.bezierCurveTo(w * 0.950, h * 0.785, w * 0.958, h * 0.79, w * 0.960, h * 0.80);
    ctx.bezierCurveTo(w * 0.958, h * 0.815, w * 0.952, h * 0.825, w * 0.945, h * 0.825);
    ctx.bezierCurveTo(w * 0.940, h * 0.815, w * 0.940, h * 0.80, w * 0.945, h * 0.79);
    ctx.closePath();
    ctx.fill();

    // Iceland
    ctx.beginPath();
    ctx.arc(w * 0.455, h * 0.20, w * 0.008, 0, Math.PI * 2);
    ctx.fill();

    // Madagascar
    ctx.beginPath();
    ctx.moveTo(w * 0.59, h * 0.62);
    ctx.bezierCurveTo(w * 0.595, h * 0.61, w * 0.602, h * 0.615, w * 0.604, h * 0.63);
    ctx.bezierCurveTo(w * 0.603, h * 0.65, w * 0.598, h * 0.665, w * 0.592, h * 0.67);
    ctx.bezierCurveTo(w * 0.588, h * 0.66, w * 0.587, h * 0.635, w * 0.59, h * 0.62);
    ctx.closePath();
    ctx.fill();

    // Arctic ice cap
    ctx.fillStyle = ice;
    ctx.fillRect(0, 0, w, h * 0.12);

    ctx.restore();
}

// Create subtle atmosphere glow
function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(2.12, 64, 64);

    const vertexShader = `
        varying vec3 vNormal;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec3 vNormal;

        void main() {
            float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(0.4, 0.65, 0.9, 0.8) * intensity;
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });

    const atmosphere = new THREE.Mesh(geometry, material);
    scene.add(atmosphere);
}

// Create location markers
function createMarkers() {
    Object.keys(locations).forEach(key => {
        const location = locations[key];
        const marker = createMarker(location.coords.lat, location.coords.lon, location.icon);
        marker.userData = { location: key };
        markers.push(marker);
        globe.add(marker);
    });
}

function createMarker(lat, lon, icon) {
    const group = new THREE.Group();

    // Convert lat/lon to 3D position
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 2.05;

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    group.position.set(x, y, z);

    // Simple glowing dot
    const dotGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9a961,  // Compass gold
        transparent: true,
        opacity: 0.9
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

    // Outer glow ring
    const glowGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9a961,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);

    // Pulsing ring
    const ringGeometry = new THREE.RingGeometry(0.05, 0.06, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9a961,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;

    group.add(dot);
    group.add(glow);
    group.add(ring);

    // Point marker to look at globe center
    group.lookAt(0, 0, 0);

    // Animation data
    group.userData.time = Math.random() * Math.PI * 2;

    return group;
}

// Create subtle starfield
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];

    // Much fewer, smaller, dimmer stars
    for (let i = 0; i < 1500; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        vertices.push(x, y, z);

        // Varied sizes - mostly tiny
        sizes.push(Math.random() * 0.5 + 0.1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0xd0d5e0,
        size: 0.05,
        transparent: true,
        opacity: 0.25,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

// Create lighting
function createLights() {
    // Main sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Ambient light - světlejší
    const ambientLight = new THREE.AmbientLight(0x606060, 1.0);  // Světlejší barva a vyšší intenzita
    scene.add(ambientLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0x00d4ff, 0.5, 20);
    accentLight1.position.set(-5, 0, 5);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x00d4ff, 0.3, 15);
    accentLight2.position.set(5, -3, -5);
    scene.add(accentLight2);
}

// Setup event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);

    // Mouse interaction
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // Touch support
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // Mouse wheel for zoom
    window.addEventListener('wheel', onMouseWheel, { passive: false });

    // Station cards (bottom)
    document.querySelectorAll('.station-card').forEach(card => {
        card.addEventListener('click', () => {
            const locationKey = card.getAttribute('data-location');
            flyToLocation(locationKey);
        });
    });

    // University card (right)
    const universityCard = document.querySelector('.university-card');
    if (universityCard) {
        universityCard.addEventListener('click', () => {
            const locationKey = universityCard.getAttribute('data-location');
            flyToLocation(locationKey);
        });
    }

    // Close info panel
    document.getElementById('close-panel').addEventListener('click', () => {
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.add('hidden');
        infoPanel.classList.remove('wide');

        // Reset states
        currentMarker = null;
        currentLocationData = null;
        currentInfoCardData = null;
        currentTab = 'overview';
        updateConnectionLine();
    });

    // Reset view button
    document.getElementById('reset-view').addEventListener('click', resetView);
}

// Mouse and touch variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };
let touchStartPosition = { x: 0, y: 0 };

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        rotationVelocity.x = deltaMove.y * 0.003;
        rotationVelocity.y = deltaMove.x * 0.003;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

function onClick(event) {
    // Prevent if clicking on UI elements
    if (event.target.closest('#ui-overlay > *:not(canvas)')) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        const marker = intersects[0].object.parent;
        const locationKey = marker.userData.location;
        flyToLocation(locationKey);
    }
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        touchStartPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
}

function onTouchMove(event) {
    if (isDragging && event.touches.length === 1) {
        event.preventDefault();

        const deltaMove = {
            x: event.touches[0].clientX - previousMousePosition.x,
            y: event.touches[0].clientY - previousMousePosition.y
        };

        rotationVelocity.x = deltaMove.y * 0.003;
        rotationVelocity.y = deltaMove.x * 0.003;

        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
}

function onTouchEnd() {
    isDragging = false;
}

// Enable dragging on mouse down
window.addEventListener('mousedown', (event) => {
    if (!event.target.closest('#ui-overlay > *:not(canvas)')) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

let wheelAnimationId = null;
let wheelTargetZoom = null;

function onMouseWheel(event) {
    event.preventDefault();
    const delta = event.deltaY * 0.01;

    // Set new target zoom
    if (wheelTargetZoom === null) {
        wheelTargetZoom = camera.position.z;
    }
    wheelTargetZoom = Math.max(3, Math.min(15, wheelTargetZoom + delta));

    // Start smooth animation if not already running
    if (!wheelAnimationId) {
        animateWheelZoom();
    }
}

function animateWheelZoom() {
    if (wheelTargetZoom === null) {
        wheelAnimationId = null;
        return;
    }

    const diff = wheelTargetZoom - camera.position.z;

    if (Math.abs(diff) > 0.01) {
        camera.position.z += diff * 0.2;
        wheelAnimationId = requestAnimationFrame(animateWheelZoom);
    } else {
        camera.position.z = wheelTargetZoom;
        wheelTargetZoom = null;
        wheelAnimationId = null;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Fly to location animation
function flyToLocation(locationKey) {
    const location = locations[locationKey];
    if (!location) return;

    // Show info panel
    showLocationInfo(location);

    // Calculate target rotation to center the location
    const lat = location.coords.lat;
    const lon = location.coords.lon;

    // Match the marker positioning logic from createMarker()
    // Markers use: theta = (lon + 180) * PI/180
    // So we need to rotate the globe to bring that theta to face the camera

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;

    // Globe rotation to center the location
    // Globe starts at: rotation.x = -PI/2 (south pole up), rotation.y = 0
    // Add PI/2 offset to Y rotation to correct texture alignment
    targetPosition = {
        y: -(lonRad + Math.PI) + Math.PI / 2,  // Add 90° offset for texture
        x: latRad                               // Direct latitude mapping
    };

    console.log(`Flying to ${locationKey}: lat=${lat}, lon=${lon}`);
    console.log(`Target rotation: x=${targetPosition.x}, y=${targetPosition.y}`);

    // Disable auto-rotate when viewing a specific location
    autoRotateEnabled = false;

    targetZoom = 4;
    animationProgress = 0;
    isAnimating = true;

    // Set current marker for connection line
    const markerIndex = Object.keys(locations).indexOf(locationKey);
    currentMarker = markers[markerIndex];
}

// Update connection line
let currentMarker = null;

function updateConnectionLine() {
    const pathElement = document.getElementById('connection-path');

    if (!pathElement) {
        return;
    }

    if (!currentMarker) {
        pathElement.setAttribute('opacity', '0');
        return;
    }

    // Get marker's screen position
    const markerWorldPos = new THREE.Vector3();
    currentMarker.getWorldPosition(markerWorldPos);

    const markerScreenPos = markerWorldPos.clone();
    markerScreenPos.project(camera);

    const markerX = (markerScreenPos.x * 0.5 + 0.5) * window.innerWidth;
    const markerY = (markerScreenPos.y * -0.5 + 0.5) * window.innerHeight;

    // Info panel position (left side, centered)
    const panelX = 300; // Approximate center of info panel
    const panelY = window.innerHeight / 2;

    // Create curved path
    const controlX = (markerX + panelX) / 2;
    const controlY = markerY;

    const path = `M ${markerX} ${markerY} Q ${controlX} ${controlY}, ${panelX} ${panelY}`;

    pathElement.setAttribute('d', path);
    pathElement.setAttribute('opacity', '1');
}

// Current active tab and location
let currentLocationData = null;
let currentTab = 'overview';
const tabOrder = ['overview', 'research', 'facilities'];

// Show location information with side navigation
function showLocationInfo(location) {
    currentLocationData = location;
    currentTab = 'overview';

    const panel = document.getElementById('info-panel');

    // Setup navigation arrows
    setupTabNavigation();

    updateTabContent();
    panel.classList.remove('hidden');
}

// Get tab configurations based on location
function getTabConfigs(locationData) {
    const t = translations[currentLanguage];
    const isMasaryk = locationData.info.title === 'Masaryk University';
    const isMendel = locationData.info.title === 'J.G. Mendel Station';
    const isNelson = locationData.info.title === 'Refugio CZ*ECO Nelson';

    if (isMasaryk) {
        return [
            { id: 'overview', label: t.tabMasaryk }
        ];
    } else if (isMendel) {
        return [
            { id: 'overview', label: t.tabJGMendel },
            { id: 'research', label: t.tabJamesRoss },
            { id: 'facilities', label: t.tabResearch }
        ];
    } else if (isNelson) {
        return [
            { id: 'overview', label: t.tabCZECONelson },
            { id: 'research', label: t.tabNelsonIsland },
            { id: 'facilities', label: t.tabResearch }
        ];
    }

    // Default fallback
    return [
        { id: 'overview', label: 'Overview' },
        { id: 'research', label: 'Research' },
        { id: 'facilities', label: 'Facilities' }
    ];
}

// Setup navigation tabs
function setupTabNavigation() {
    const overviewBtn = document.getElementById('tab-overview');
    const researchBtn = document.getElementById('tab-research');
    const facilitiesBtn = document.getElementById('tab-facilities');

    const tabConfigs = getTabConfigs(currentLocationData);

    // Update button labels
    if (tabConfigs.length === 1) {
        // Masaryk University - only one tab
        overviewBtn.textContent = tabConfigs[0].label;
        overviewBtn.style.display = 'block';
        researchBtn.style.display = 'none';
        facilitiesBtn.style.display = 'none';
    } else {
        // Mendel or Nelson - three tabs
        overviewBtn.textContent = tabConfigs[0].label;
        researchBtn.textContent = tabConfigs[1].label;
        facilitiesBtn.textContent = tabConfigs[2].label;
        overviewBtn.style.display = 'block';
        researchBtn.style.display = 'block';
        facilitiesBtn.style.display = 'block';
    }

    // Add click handlers (use once = true to avoid duplicate listeners)
    overviewBtn.removeEventListener('click', overviewBtn._clickHandler);
    researchBtn.removeEventListener('click', researchBtn._clickHandler);
    facilitiesBtn.removeEventListener('click', facilitiesBtn._clickHandler);

    overviewBtn._clickHandler = () => switchToTab('overview');
    researchBtn._clickHandler = () => switchToTab('research');
    facilitiesBtn._clickHandler = () => switchToTab('facilities');

    overviewBtn.addEventListener('click', overviewBtn._clickHandler);
    researchBtn.addEventListener('click', researchBtn._clickHandler);
    facilitiesBtn.addEventListener('click', facilitiesBtn._clickHandler);

    // Update button positions based on their width
    setTimeout(() => {
        updateButtonPositions();
    }, 0);

    updateNavigationButtons();
}

// Update button positions based on their actual width
function updateButtonPositions() {
    const overviewBtn = document.getElementById('tab-overview');
    const researchBtn = document.getElementById('tab-research');
    const facilitiesBtn = document.getElementById('tab-facilities');

    if (overviewBtn.style.display !== 'none') {
        const overviewWidth = overviewBtn.offsetWidth;
        overviewBtn.style.right = `-${overviewWidth}px`;
    }

    if (researchBtn.style.display !== 'none') {
        const researchWidth = researchBtn.offsetWidth;
        researchBtn.style.right = `-${researchWidth}px`;
    }

    if (facilitiesBtn.style.display !== 'none') {
        const facilitiesWidth = facilitiesBtn.offsetWidth;
        facilitiesBtn.style.right = `-${facilitiesWidth}px`;
    }
}

// Switch to a specific tab
function switchToTab(tabName) {
    if (tabName === currentTab) return;

    const content = document.getElementById('info-content');

    // Minimal subtle fade transition
    content.classList.add('fade-out');

    setTimeout(() => {
        currentTab = tabName;
        updateTabContent();
        content.classList.remove('fade-out');
        content.classList.add('fade-in');

        setTimeout(() => {
            content.classList.remove('fade-in');
        }, 200);
    }, 100);
}



// Update navigation buttons state
function updateNavigationButtons() {
    const overviewBtn = document.getElementById('tab-overview');
    const researchBtn = document.getElementById('tab-research');
    const facilitiesBtn = document.getElementById('tab-facilities');

    // Remove active class from all
    overviewBtn.classList.remove('active');
    researchBtn.classList.remove('active');
    facilitiesBtn.classList.remove('active');

    // Add active class to current tab
    if (currentTab === 'overview') {
        overviewBtn.classList.add('active');
    } else if (currentTab === 'research') {
        researchBtn.classList.add('active');
    } else if (currentTab === 'facilities') {
        facilitiesBtn.classList.add('active');
    }
}

// Update tab content based on current tab
function updateTabContent(skipAnimation = false) {
    if (!currentLocationData) return;

    const content = document.getElementById('info-content');

    // Update navigation buttons
    updateNavigationButtons();

    const isMendel = currentLocationData.info.title === 'J.G. Mendel Station';
    const isNelson = currentLocationData.info.title === 'Refugio CZ*ECO Nelson';

    let html = '';
    const image = currentLocationData.info.images[currentTab];

    if (currentTab === 'overview') {
        html = `
            <img src="${image}" alt="${currentLocationData.info.title}" class="tab-image">
            <h2>${currentLocationData.info.title}</h2>
            <p style="color: #999; margin-bottom: 20px; font-size: 0.9rem;">${currentLocationData.info.subtitle}</p>
            <p>${currentLocationData.info.description}</p>
            <div class="info-stats">
        `;

        currentLocationData.info.stats.forEach(stat => {
            html += `
                <div class="stat-item">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                </div>
            `;
        });

        html += `</div>`;

    } else if (currentTab === 'research') {
        // For Mendel/Nelson: second tab shows island info
        const t = translations[currentLanguage];
        if (isMendel) {
            html = `
                <img src="${image}" alt="James Ross Island" class="tab-image">
                <h2>James Ross Island</h2>
                <p style="color: #999; margin-bottom: 20px;">Location of J.G. Mendel Station</p>
                <p>James Ross Island is a large island off the southeast side of the Antarctic Peninsula. The island is characterized by its unique geology, extensive Cretaceous and Tertiary sedimentary sequences, and active volcanic history.</p>
                <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 1.1rem;">${t.geographicFeatures}</h3>
                <ul>
                    <li>Area: approximately 2,600 km²</li>
                    <li>Largely ice-covered plateau</li>
                    <li>Volcanic mesa formations</li>
                    <li>Rich fossil deposits</li>
                </ul>
            `;
        } else if (isNelson) {
            html = `
                <img src="${image}" alt="Nelson Island" class="tab-image">
                <h2>Nelson Island</h2>
                <p style="color: #999; margin-bottom: 20px;">Location of CZ*ECO Nelson Refuge</p>
                <p>Nelson Island is an island in the South Shetland Islands, Antarctica. It is characterized by a maritime Antarctic climate with rich biodiversity and dynamic coastal ecosystems.</p>
                <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 1.1rem;">${t.geographicFeatures}</h3>
                <ul>
                    <li>Part of South Shetland Islands</li>
                    <li>Maritime Antarctic climate</li>
                    <li>Rich coastal ecosystems</li>
                    <li>Important penguin colonies</li>
                </ul>
            `;
        }

    } else if (currentTab === 'facilities') {
        // For Mendel/Nelson: third tab shows research
        const t = translations[currentLanguage];
        html = `
            <img src="${image}" alt="Research at ${currentLocationData.info.title}" class="tab-image">
            <h2>${t.researchActivities}</h2>
            <p style="color: #999; margin-bottom: 24px;">Scientific programs and ongoing research</p>
            <ul>
        `;

        currentLocationData.info.research.forEach(item => {
            html += `<li>${item}</li>`;
        });

        html += `</ul>`;

        // Add facilities section
        html += `
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-size: 1.1rem;">${t.facilitiesInfra}</h3>
            <ul>
        `;

        currentLocationData.info.facilities.forEach(item => {
            html += `<li>${item}</li>`;
        });

        html += `</ul>`;
    }

    content.innerHTML = html;
}

// Reset view
function resetView() {
    console.log('Reset view called');

    // Close info panel
    const panel = document.getElementById('info-panel');
    if (panel) {
        panel.classList.add('hidden');
    }

    // Hide connection line
    currentMarker = null;
    currentLocationData = null;
    currentTab = 'overview';
    updateConnectionLine();

    // Return to default Antarctica view
    targetPosition = {
        y: 0,  // No longitude rotation
        x: -Math.PI / 2  // South pole (default position)
    };
    targetZoom = 10;  // Original zoom level
    animationProgress = 0;
    isAnimating = true;

    // Re-enable auto-rotate when returning to default view
    autoRotateEnabled = true;

    // Clear rotation velocity
    rotationVelocity.x = 0;
    rotationVelocity.y = 0;
}

// Update loading progress
function updateLoadingProgress(percent, text) {
    document.getElementById('loading-progress').style.width = percent + '%';
    document.getElementById('loading-text').textContent = text;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Very slow auto-rotate globe when not animating (only if enabled)
    if (!isDragging && !isAnimating && autoRotateEnabled) {
        globe.rotation.y += 0.0001; // Even slower rotation (0.0003 -> 0.0001)
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
    }

    // Apply rotation velocity from dragging
    if (!isAnimating) {
        globe.rotation.y += rotationVelocity.y;
        globe.rotation.x += rotationVelocity.x;
        globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
    }

    // Camera animation to location
    if (isAnimating) {
        animationProgress += 0.02;

        // Easing function
        const eased = easeInOutCubic(animationProgress);

        if (targetPosition) {
            const newRotY = globe.rotation.y + (targetPosition.y - globe.rotation.y) * eased * 0.1;
            const newRotX = globe.rotation.x + (targetPosition.x - globe.rotation.x) * eased * 0.1;
            globe.rotation.y = newRotY;
            globe.rotation.x = newRotX;
        }

        if (targetZoom !== null) {
            camera.position.z += (targetZoom - camera.position.z) * eased * 0.1;
        }

        // Stop animating after enough time
        if (animationProgress >= 1) {
            // NO SNAP - just let the animation finish smoothly
            // The last frame already got us close enough to the target

            // Clear rotation velocity to stop any residual movement
            rotationVelocity.x = 0;
            rotationVelocity.y = 0;
            isAnimating = false;
            animationProgress = 0;

            // DON'T reset targetPosition and targetZoom - keep them so the globe stays at this location
            // targetPosition = null;
            // targetZoom = null;

            // Calculate what GPS coordinates we're actually showing
            const actualLat = globe.rotation.x * 180 / Math.PI;
            const actualLon = -(globe.rotation.y + Math.PI) * 180 / Math.PI;
            console.log('Animation complete. Final rotation:', globe.rotation.x, globe.rotation.y);
            console.log('Showing GPS: lat=' + actualLat.toFixed(2) + ', lon=' + actualLon.toFixed(2));
            console.log('currentMarker is set:', currentMarker !== null);
        }
    }

    // Particle system removed
    const time = Date.now() * 0.001;
    // if (particleSystem) {
    //     particleSystem.update(time);
    // }

    // Animate markers (subtle pulsing effect)
    markers.forEach(marker => {
        const ring = marker.children[2]; // Ring
        const glow = marker.children[1]; // Outer glow
        const dot = marker.children[0];  // Center dot

        if (ring) {
            const pulse = Math.sin(time * 1.5 + marker.userData.time) * 0.5 + 0.5;
            ring.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1);
            ring.material.opacity = 0.3 + pulse * 0.3;
        }
        if (glow) {
            const glowPulse = Math.sin(time * 2 + marker.userData.time) * 0.5 + 0.5;
            glow.scale.set(1 + glowPulse * 0.3, 1 + glowPulse * 0.3, 1 + glowPulse * 0.3);
            glow.material.opacity = 0.2 + glowPulse * 0.2;
        }
    });

    // Update connection line
    updateConnectionLine();

    renderer.render(scene, camera);
}

// Easing function
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Map control functions
let zoomAnimationId = null;

function zoomIn() {
    const newTarget = Math.max(3, camera.position.z - 2);
    smoothZoom(newTarget);
}

function zoomOut() {
    const newTarget = Math.min(15, camera.position.z + 2);
    smoothZoom(newTarget);
}

// Smooth zoom animation
function smoothZoom(target) {
    // Cancel previous animation if running
    if (zoomAnimationId) {
        cancelAnimationFrame(zoomAnimationId);
    }

    targetZoom = target;

    function animate() {
        const diff = targetZoom - camera.position.z;
        if (Math.abs(diff) > 0.01) {
            camera.position.z += diff * 0.15;
            zoomAnimationId = requestAnimationFrame(animate);
        } else {
            camera.position.z = targetZoom;
            zoomAnimationId = null;
        }
    }

    animate();
}

// Setup map controls
function setupMapControls() {
    console.log('Setting up map controls...');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetBtn = document.getElementById('reset-view');

    console.log('Zoom In button:', zoomInBtn);
    console.log('Zoom Out button:', zoomOutBtn);
    console.log('Reset button:', resetBtn);

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            console.log('Zoom in clicked');
            zoomIn();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            console.log('Zoom out clicked');
            zoomOut();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log('Reset clicked');
            resetView();
        });
    }
}

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;

    // Update UI texts
    const t = translations[lang];

    // Station cards
    const mendelCard = document.querySelector('.station-card[data-location="mendel"]');
    if (mendelCard) {
        const title = mendelCard.querySelector('.card-title');
        const location = mendelCard.querySelector('.card-location');
        if (title) title.textContent = t.mendelTitle;
        if (location) location.textContent = t.mendelLocation;
    }

    const nelsonCard = document.querySelector('.station-card[data-location="nelson"]');
    if (nelsonCard) {
        const title = nelsonCard.querySelector('.card-title');
        const location = nelsonCard.querySelector('.card-location');
        if (title) title.textContent = t.nelsonTitle;
        if (location) location.textContent = t.nelsonLocation;
    }

    // Controls help
    const controlItems = document.querySelectorAll('.control-item');
    if (controlItems.length >= 3) {
        const dragKey = controlItems[0].querySelector('.control-key');
        const dragAction = controlItems[0].querySelector('.control-action');
        if (dragKey) dragKey.textContent = '🖱️ ' + t.controlDrag;
        if (dragAction) dragAction.textContent = t.controlDragAction;

        const zoomKey = controlItems[1].querySelector('.control-key');
        const zoomAction = controlItems[1].querySelector('.control-action');
        if (zoomKey) zoomKey.textContent = '🔍 ' + t.controlZoom;
        if (zoomAction) zoomAction.textContent = t.controlZoomAction;

        const clickKey = controlItems[2].querySelector('.control-key');
        const clickAction = controlItems[2].querySelector('.control-action');
        if (clickKey) clickKey.textContent = '📍 ' + t.controlClick;
        if (clickAction) clickAction.textContent = t.controlClickAction;
    }

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update info panel if open
    if (currentLocationData) {
        updateTabContent();
    }
}

// Setup language switcher
function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });
}

// Setup logo reset
function setupLogoReset() {
    const logoLink = document.getElementById('logo-reset');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetView();
        });
    }
}

// Card data structure
const cardData = {
    programme: {
        title: 'Czech Antarctic Research Programme',
        tabs: ['About Us', 'History', 'Structure'],
        content: {
            'About Us': `
                <h2>About CARP</h2>
                <p>Masaryk University is the only university in the world that owns and operates a scientific station in Antarctica. The operation includes the J.G. Mendel Czech Antarctic Station on James Ross Island, technical facilities CZ*ECO Nelson on Nelson Island, and auxiliary infrastructure in Brno.</p>
                <p>Through its internationally recognised Antarctic Research Programme (CARP), Masaryk University ensures that the Czech Republic maintains its consultative membership within the Antarctic Treaty community.</p>
                <h3>Main Benefits</h3>
                <ul>
                    <li>Valuable scientific knowledge and understanding of the Antarctic region</li>
                    <li>Benefits to national economy and environmental protection</li>
                    <li>Building international scientific relations and foreign policy</li>
                    <li>Contributing to national security</li>
                </ul>
            `,
            'History': `
                <h2>History</h2>
                <p>The Czech Republic has historically carried out significant scientific research in Antarctica. The plans for setting up a Czech base go back to the 1990s, when legal, logistical, and constructional preparations began.</p>
                <p>The research station was built by Masaryk University between 2005–2006 in the northern part of James Ross Island. Construction was finished in February 2006, and since then, successful scientific expeditions are undertaken each austral summer.</p>
                <p>The base bears the name of <strong>Johann Gregor Mendel</strong> (1822–1884), a founder of modern genetics and pioneering meteorologist who lived and worked in Brno.</p>
                <h3>Key Milestones</h3>
                <ul>
                    <li><strong>1962:</strong> Czechoslovakia accedes to the Antarctic Treaty</li>
                    <li><strong>2006:</strong> J.G. Mendel Station completed</li>
                    <li><strong>2013:</strong> Membership in COMNAP</li>
                    <li><strong>2014:</strong> Czech Republic gains consultative status in Antarctic Treaty, membership in SCAR</li>
                    <li><strong>2019:</strong> Prague hosts ATCM XLII</li>
                </ul>
            `,
            'Structure': `
                <h2>Programme Structure</h2>
                <p>The CARP management structure consists of several levels, with the Board of Coordinators forming the main executive body.</p>
                <h3>Executive Management</h3>
                <ul>
                    <li><strong>Principal Investigator</strong> - Head of Executive</li>
                    <li><strong>Project and Logistic Coordinator</strong> - Station Chief</li>
                    <li><strong>Scientific Coordinator</strong> - EEL/Polar-Bio-Lab Head</li>
                    <li><strong>Educational Coordinator</strong> - Polar-Geo-Lab Head</li>
                    <li><strong>Technical Innovation Coordinator</strong> - Open Access Data Unit Head</li>
                </ul>
                <h3>Oversight</h3>
                <p>The Board of Coordinators is overseen by the Supervisory Board and collaborates with the Scientific Board and External Advisory Board. Support Services include Administration, Technical Staff, Logistics, and Public Relations.</p>
            `
        }
    },
    research: {
        title: 'Research',
        tabs: ['Overview', 'Atmospheric Sciences', 'Geo-Sciences', 'Biology', 'Microbiology'],
        content: {
            'Overview': `
                <h2>Research Programme</h2>
                <p>The research programme focuses on long-term monitoring and multidisciplinary investigations of one of the largest deglaciated areas in Antarctica.</p>
                <p>The programme studies both abiotic and biotic components, their relationships, and the functioning of the entire ecosystem, including predictions of future development.</p>
                <h3>Main Research Areas</h3>
                <ul>
                    <li><strong>Earth Sciences:</strong> Geology, geomorphology, palaeontology, geochemistry, climatology, hydrology</li>
                    <li><strong>Biological Sciences:</strong> Botany, ecology, ecophysiology, plant stress physiology, microbiology, parasitology, soil biology</li>
                    <li><strong>Technical Sciences:</strong> Advanced polymers, UV-radiation resistance, material testing</li>
                </ul>
            `,
            'Atmospheric Sciences': `
                <h2>Atmospheric Sciences</h2>
                <p>Investigation of various aspects of the Antarctic atmosphere from ground to stratosphere, including changes in hydrosphere and cryosphere.</p>
                <h3>Main Topics</h3>
                <ul>
                    <li>Long-term climate monitoring and atmospheric processes</li>
                    <li>Numerical modelling of boundary layer and extreme weather events</li>
                    <li>Foehn winds and anomalous temperature events</li>
                    <li>Solar UV radiation and stratospheric ozone layer</li>
                    <li>Energy exchange, sediment budget, and soil-vegetation interactions</li>
                    <li>Glacier mass balance and sensitivity to climate change</li>
                    <li>Surface water fluxes and glacio-hydrological processes</li>
                </ul>
            `,
            'Geo-Sciences': `
                <h2>Geo-Sciences</h2>
                <p>Study of how Antarctic land surface and lithosphere interact with atmosphere, cryosphere, hydrosphere, and biosphere.</p>
                <h3>Research Focus</h3>
                <p><strong>Quaternary Palaeoenvironments:</strong></p>
                <ul>
                    <li>Deglaciation chronologies and past glacial processes</li>
                    <li>Palaeolimnology & palaeoecology from sediment records</li>
                    <li>Physical limnology and lake hydrochemistry</li>
                    <li>Sediment cascade systems and landscape dynamics</li>
                </ul>
                <p><strong>Permafrost Monitoring:</strong></p>
                <ul>
                    <li>Active layer dynamics and thermal state modelling</li>
                    <li>Glacial, paraglacial, and periglacial processes</li>
                    <li>Soil biogeochemistry in deglaciated terrain</li>
                </ul>
            `,
            'Biology': `
                <h2>Plants, Ecology & Physiology</h2>
                <p>Research on stress physiology of Antarctic autotrophs and their survival capabilities in extreme environments.</p>
                <h3>Main Research Directions</h3>
                <ul>
                    <li>Stress physiology and photosynthetic processes</li>
                    <li>Advanced biophysical methods (chlorophyll fluorescence, spectral reflectance)</li>
                    <li>Antarctic autotrophs taxonomy and ecology</li>
                    <li>Low temperature and freezing effects</li>
                    <li>Cultivation and productivity potential</li>
                    <li>Radiation biology and UV effects</li>
                    <li>Biological soil crusts structure and function</li>
                    <li>Vegetation mapping using drones and spectral analysis</li>
                </ul>
                <h3>Long-Term Monitoring</h3>
                <p>Open-top chambers (OTC) established in 2007 to study vegetation response to global warming. Monitoring includes microclimate, photosynthetic activity, and species composition changes.</p>
            `,
            'Microbiology': `
                <h2>Microbiology</h2>
                <p>Focus on monitoring, taxonomy, and experimental studies of bacteria and microscopic fungi from diverse Antarctic sources.</p>
                <h3>Research Topics</h3>
                <ul>
                    <li>Biodiversity of psychrotrophic and heterotrophic bacteria</li>
                    <li>Taxonomy of photosynthetic microorganisms (cyanobacteria, diatoms, microalgae)</li>
                    <li>Cold-adapted fatty acids, enzymes, and pigments</li>
                    <li>"Safety Antarctica" - preventing non-native species introduction</li>
                    <li>Potential pathogens in Antarctic animals</li>
                    <li>Natural probiotics in marine animal faeces</li>
                    <li>Diversity and physiology of rock-inhabiting fungi</li>
                </ul>
            `
        }
    },
    publications: {
        title: 'Publications',
        tabs: ['Czech Polar Reports', 'Recent Years'],
        content: {
            'Czech Polar Reports': `
                <h2>Czech Polar Reports</h2>
                <p>An international, multidisciplinary, peer-reviewed journal related to polar science, issued twice a year by MUNI Press.</p>
                <h3>Indexing & Metrics</h3>
                <ul>
                    <li><strong>Indexed in:</strong> Web of Science (since 2022), SCOPUS (since 2014)</li>
                    <li><strong>SCImago Journal Rank (SJR):</strong> 0.185</li>
                    <li><strong>h-index:</strong> 8</li>
                    <li><strong>Impact Score (2020):</strong> 0.60</li>
                    <li><strong>Quartile:</strong> Q3</li>
                </ul>
                <p>The journal is dedicated to original research papers for sciences performed in the Arctic, Antarctic, high mountains, and planets with polar analogues.</p>
                <p>Electronic papers are freely downloadable from the journal webpage.</p>
            `,
            'Recent Years': `
                <h2>Publications by Year</h2>
                <p>CARP researchers have published extensively in international peer-reviewed journals covering all aspects of Antarctic research.</p>
                <h3>Publication Years</h3>
                <ul>
                    <li>2025 - Current publications</li>
                    <li>2024 - Recent research</li>
                    <li>2023 - Published works</li>
                    <li>2022 - Scientific articles</li>
                    <li>2021 - Research outputs</li>
                    <li>2020 - Publications</li>
                    <li>2010-2019 - Historical publications</li>
                </ul>
                <p>For a complete list of publications, please visit the official CARP website.</p>
            `
        }
    },
    collaboration: {
        title: 'Collaboration & Support',
        tabs: ['Research Support', 'Public Engagement', 'Private Sector'],
        content: {
            'Research Support': `
                <h2>Research Collaboration</h2>
                <p>CARP welcomes collaboration with national and international research institutions in various fields of Antarctic science.</p>
                <h3>Collaboration Opportunities</h3>
                <ul>
                    <li>Joint research projects and expeditions</li>
                    <li>Access to station facilities and equipment</li>
                    <li>Data sharing and long-term monitoring programmes</li>
                    <li>Student and researcher exchanges</li>
                    <li>Laboratory analysis and technical support</li>
                </ul>
                <h3>International Partners</h3>
                <p>CARP actively collaborates with leading universities and research institutions worldwide, including Charles University, University of Bergen, SLF Davos, McMurdo LTER, Instituto Antártico Argentino, British Antarctic Survey, and many others.</p>
            `,
            'Public Engagement': `
                <h2>Public Engagement & Education</h2>
                <p>CARP is committed to sharing Antarctic science with the broader public and inspiring the next generation of polar researchers.</p>
                <h3>Educational Activities</h3>
                <ul>
                    <li>University courses and field training</li>
                    <li>Public lectures and presentations</li>
                    <li>School visits and educational programmes</li>
                    <li>Media engagement and science communication</li>
                    <li>Open access to research data and publications</li>
                </ul>
            `,
            'Private Sector': `
                <h2>Private Sector Collaboration</h2>
                <p>CARP offers opportunities for private sector involvement in Antarctic research and technology development.</p>
                <h3>Collaboration Areas</h3>
                <ul>
                    <li>Equipment testing in extreme conditions ("Tested in Antarctica")</li>
                    <li>Material science and cold-weather performance</li>
                    <li>Technology development and innovation</li>
                    <li>Sponsorship and corporate partnerships</li>
                    <li>Antarctic expeditions support</li>
                </ul>
                <p>Testing products in Antarctica provides unique validation under the harshest conditions on Earth.</p>
            `
        }
    },
    contact: {
        title: 'Contact',
        tabs: ['Team Contacts'],
        content: {
            'Team Contacts': `
                <h2>Contact Information</h2>
                <p><strong>Czech Antarctic Research Programme</strong><br>
                Masaryk University, Faculty of Science<br>
                Kotlářská 2<br>
                611 37 BRNO, Czech Republic, Europe</p>

                <div class="contact-grid">
                    <div class="contact-person">
                        <h4>Assoc. Prof. Daniel Nývlt, Ph.D.</h4>
                        <div class="role">CARP Head - Geomorphologist</div>
                        <div class="details">
                            Tel: +420 549 49 58 46<br>
                            Email: daniel.nyvlt@sci.muni.cz
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Pavel Kapler, Ph.D.</h4>
                        <div class="role">CARP Manager - Chief of Operations</div>
                        <div class="details">
                            WhatsApp: +420 773 79 88 04<br>
                            Email: kapler@sci.muni.cz
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Assoc. Prof. Kamil Láska, Ph.D.</h4>
                        <div class="role">Atmospheric Sciences Head - Climatologist</div>
                        <div class="details">
                            Tel: +420 549 49 5750<br>
                            Email: laska@sci.muni.cz
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Matěj Roman, Ph.D.</h4>
                        <div class="role">Geo-Sciences Head - Periglacial Geomorphologist</div>
                        <div class="details">
                            Tel: +420 704 343 653<br>
                            Email: matej.roman@gmail.com
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Professor Miloš Barták</h4>
                        <div class="role">Plants & Ecology Head - Plant Physiologist</div>
                        <div class="details">
                            Tel: +420 549 49 3087<br>
                            Email: mbartak@sci.muni.cz
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Assoc. Prof. Pavel Švec, Ph.D.</h4>
                        <div class="role">Microbiology Head - Microbiologist</div>
                        <div class="details">
                            Tel: +420 549 49 7601<br>
                            Email: pavel@sci.muni.cz
                        </div>
                    </div>

                    <div class="contact-person">
                        <h4>Tyler Joe Kohler, Ph.D.</h4>
                        <div class="role">LTEM Head - Ecologist</div>
                        <div class="details">
                            Tel: +420 221 951 073<br>
                            Email: kohlert@natur.cuni.cz
                        </div>
                    </div>
                </div>
            `
        }
    }
};

// Setup info cards
function setupInfoCards() {
    const cards = document.querySelectorAll('.info-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.getAttribute('data-card');
            const data = cardData[cardType];

            if (!data) return;

            // Store current card data (not location)
            currentInfoCardData = data;
            currentLocationData = null; // Clear location data
            currentTab = 'overview'; // Reset to first tab

            // Make panel wider
            const infoPanel = document.getElementById('info-panel');
            infoPanel.classList.add('wide');

            // Setup tabs for info card
            setupInfoCardTabs();

            // Update content
            updateInfoCardTabContent();

            // Show panel
            infoPanel.classList.remove('hidden');
        });
    });
}

let currentInfoCardData = null;

function setupInfoCardTabs() {
    if (!currentInfoCardData) return;

    const overviewBtn = document.getElementById('tab-overview');
    const researchBtn = document.getElementById('tab-research');
    const facilitiesBtn = document.getElementById('tab-facilities');

    const tabs = currentInfoCardData.tabs;

    // Update button labels and visibility based on number of tabs
    if (tabs.length >= 1) {
        overviewBtn.textContent = tabs[0];
        overviewBtn.style.display = 'block';
        overviewBtn.removeEventListener('click', overviewBtn._cardClickHandler);
        overviewBtn._cardClickHandler = () => switchToInfoCardTab(0);
        overviewBtn.addEventListener('click', overviewBtn._cardClickHandler);
    }

    if (tabs.length >= 2) {
        researchBtn.textContent = tabs[1];
        researchBtn.style.display = 'block';
        researchBtn.removeEventListener('click', researchBtn._cardClickHandler);
        researchBtn._cardClickHandler = () => switchToInfoCardTab(1);
        researchBtn.addEventListener('click', researchBtn._cardClickHandler);
    } else {
        researchBtn.style.display = 'none';
    }

    if (tabs.length >= 3) {
        facilitiesBtn.textContent = tabs[2];
        facilitiesBtn.style.display = 'block';
        facilitiesBtn.removeEventListener('click', facilitiesBtn._cardClickHandler);
        facilitiesBtn._cardClickHandler = () => switchToInfoCardTab(2);
        facilitiesBtn.addEventListener('click', facilitiesBtn._cardClickHandler);
    } else {
        facilitiesBtn.style.display = 'none';
    }

    // For cards with more than 3 tabs, we'll need to add extra buttons
    // For now, we'll handle up to 3 tabs with existing buttons

    // Update button positions
    setTimeout(() => {
        updateButtonPositions();
    }, 0);

    // Set first tab as active
    updateInfoCardNavigationButtons();
}

function switchToInfoCardTab(tabIndex) {
    currentTab = ['overview', 'research', 'facilities'][tabIndex]; // Keep using same tab names
    updateInfoCardNavigationButtons();
    updateInfoCardTabContent();
}

function updateInfoCardNavigationButtons() {
    const overviewBtn = document.getElementById('tab-overview');
    const researchBtn = document.getElementById('tab-research');
    const facilitiesBtn = document.getElementById('tab-facilities');

    overviewBtn.classList.remove('active');
    researchBtn.classList.remove('active');
    facilitiesBtn.classList.remove('active');

    if (currentTab === 'overview') {
        overviewBtn.classList.add('active');
    } else if (currentTab === 'research') {
        researchBtn.classList.add('active');
    } else if (currentTab === 'facilities') {
        facilitiesBtn.classList.add('active');
    }
}

function updateInfoCardTabContent() {
    if (!currentInfoCardData) return;

    const content = document.getElementById('info-content');
    const tabs = currentInfoCardData.tabs;
    const tabIndex = ['overview', 'research', 'facilities'].indexOf(currentTab);
    const tabName = tabs[tabIndex];

    if (!tabName || !currentInfoCardData.content[tabName]) return;

    // Fade out
    content.style.opacity = '0.3';

    setTimeout(() => {
        content.innerHTML = currentInfoCardData.content[tabName];
        content.style.opacity = '1';
    }, 200);
}

// Start the application
window.addEventListener('load', () => {
    init();
    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
        setupMapControls();
        setupLanguageSwitcher();
        setupLogoReset();
        setupInfoCards();
    }, 100);
});
