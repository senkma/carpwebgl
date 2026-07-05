// Particle System for enhanced visual effects
// Add this to create ambient particles around the globe

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.createParticles();
    }
    
    createParticles() {
        // Create floating particles around Earth
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        
        for (let i = 0; i < 500; i++) {
            // Random position in sphere around Earth
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 2.3 + Math.random() * 1.5;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
            
            // More subtle scientific colors
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                colors.push(0.13, 0.59, 0.95); // Blue
            } else if (colorChoice < 0.8) {
                colors.push(0.3, 0.69, 0.31); // Green
            } else {
                colors.push(0.7, 0.75, 0.8); // Light grey
            }
            
            sizes.push(Math.random() * 3 + 1);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // Custom shader for particles
        const vertexShader = `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        
        const fragmentShader = `
            varying vec3 vColor;
            
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - (dist * 2.0);
                alpha = alpha * alpha; // Smoother falloff

                gl_FragColor = vec4(vColor, alpha * 0.4);
            }
        `;
        
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particlesMesh = new THREE.Points(geometry, material);
        this.scene.add(this.particlesMesh);
    }
    
    update(time) {
        // Slow rotation
        if (this.particlesMesh) {
            this.particlesMesh.rotation.y = time * 0.05;
            this.particlesMesh.rotation.x = Math.sin(time * 0.1) * 0.1;
        }
    }
}

// Connection lines between markers (optional visual enhancement)
class ConnectionLines {
    constructor(scene, locations, globe) {
        this.scene = scene;
        this.locations = locations;
        this.globe = globe;
        this.lines = [];
        this.createLines();
    }
    
    createLines() {
        // Create lines between Brno and Antarctic stations
        const brnoPos = this.latLonToVector3(49.2, 16.6, 2.05);
        const mendelPos = this.latLonToVector3(-63.8, -57.9, 2.05);
        const nelsonPos = this.latLonToVector3(-62.3, -59.0, 2.05);
        
        // Line from Brno to Mendel
        this.createLine(brnoPos, mendelPos);
        
        // Line from Brno to Nelson
        this.createLine(brnoPos, nelsonPos);
    }
    
    createLine(start, end) {
        const points = [];
        const segments = 50;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Create arc between points
            const point = new THREE.Vector3().lerpVectors(start, end, t);
            // Lift the arc outward
            const lift = Math.sin(t * Math.PI) * 0.5;
            point.normalize().multiplyScalar(2.05 + lift);
            points.push(point);
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x2196F3,
            transparent: true,
            opacity: 0.2,
            linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        this.globe.add(line);
        this.lines.push(line);
    }
    
    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }
}
