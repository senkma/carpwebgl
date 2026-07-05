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

    // Vintage map pin style
    const pinGeometry = new THREE.CylinderGeometry(0.018, 0.055, 0.24, 8);
    const pinMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b7355,  // Sepia
        emissive: 0x6b5244,
        emissiveIntensity: 0.15,
        shininess: 40
    });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI;

    // Vintage brass-like sphere on top
    const sphereGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xc9a961,  // Compass gold
        emissive: 0xc9a961,
        emissiveIntensity: 0.3,
        shininess: 70,
        metalness: 0.5
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 0.15;

    // Vintage compass-style ring
    const ringGeometry = new THREE.RingGeometry(0.08, 0.09, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9b18f,  // Sepia light
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;

    group.add(pin);
    group.add(sphere);
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
        document.getElementById('info-panel').classList.add('hidden');
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

        rotationVelocity.x = deltaMove.y * 0.005;
        rotationVelocity.y = deltaMove.x * 0.005;

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

        rotationVelocity.x = deltaMove.y * 0.005;
        rotationVelocity.y = deltaMove.x * 0.005;

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

function onMouseWheel(event) {
    event.preventDefault();
    const delta = event.deltaY * 0.001;
    camera.position.z = Math.max(3, Math.min(15, camera.position.z + delta));
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

    // Simple direct mapping:
    // rotation.y = -longitude (to face the location)
    // rotation.x = tilt from equator
    // Globe starts with south pole up (x = -PI/2)
    // For south pole: x = -PI/2, for north pole: x = PI/2, for equator: x = 0

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;

    targetPosition = {
        y: -lonRad,  // Rotate to longitude
        x: latRad    // Direct latitude angle (south pole = -PI/2, north pole = +PI/2)
    };

    console.log(`Flying to ${locationKey}: lat=${lat}, lon=${lon}`);
    console.log(`Target rotation: x=${targetPosition.x}, y=${targetPosition.y}`);

    // Disable auto-rotate when viewing a specific location
    autoRotateEnabled = false;

    targetZoom = 4;
    animationProgress = 0;
    isAnimating = true;
}

// Show location information
function showLocationInfo(location) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');

    let html = `
        <h2>${location.info.title}</h2>
        <p style="color: var(--accent-cyan); margin-bottom: 20px;">${location.info.subtitle}</p>
        <p>${location.info.description}</p>

        <div class="info-stats">
    `;

    location.info.stats.forEach(stat => {
        html += `
            <div class="stat-item">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `;
    });

    html += `
        </div>

        <h3>🔬 Research Activities</h3>
        <ul>
    `;

    location.info.research.forEach(item => {
        html += `<li>${item}</li>`;
    });

    html += `
        </ul>

        <h3>🏗️ Facilities</h3>
        <ul>
    `;

    location.info.facilities.forEach(item => {
        html += `<li>${item}</li>`;
    });

    html += `</ul>`;

    content.innerHTML = html;
    panel.classList.remove('hidden');
}

// Reset view
function resetView() {
    console.log('Reset view called');
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
    document.getElementById('info-panel').classList.add('hidden');
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
            // Snap to final position
            if (targetPosition) {
                globe.rotation.y = targetPosition.y;
                globe.rotation.x = targetPosition.x;
            }
            if (targetZoom !== null) {
                camera.position.z = targetZoom;
            }
            // Clear rotation velocity to stop any residual movement
            rotationVelocity.x = 0;
            rotationVelocity.y = 0;
            isAnimating = false;
            animationProgress = 0;
            console.log('Animation complete. Final rotation:', globe.rotation.x, globe.rotation.y);
        }
    }

    // Particle system removed
    const time = Date.now() * 0.001;
    // if (particleSystem) {
    //     particleSystem.update(time);
    // }

    // Animate markers (subtle pulsing effect)
    markers.forEach(marker => {
        const ring = marker.children[2]; // Ring is now third child
        const sphere = marker.children[1]; // Sphere is second child
        if (ring) {
            const pulse = Math.sin(time * 1.5 + marker.userData.time) * 0.5 + 0.5;
            ring.scale.set(1 + pulse * 0.15, 1 + pulse * 0.15, 1);
            ring.material.opacity = 0.25 + pulse * 0.15;
        }
        if (sphere) {
            // Subtle glow pulsing
            const glow = Math.sin(time * 2 + marker.userData.time) * 0.5 + 0.5;
            sphere.material.emissiveIntensity = 0.3 + glow * 0.2;
        }
    });

    renderer.render(scene, camera);
}

// Easing function
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Start the application
window.addEventListener('load', init);
