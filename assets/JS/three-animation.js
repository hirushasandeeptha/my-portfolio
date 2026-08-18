// Three.js 3D Animation System for Portfolio
// Advanced 3D scene with interactive elements

let scene, camera, renderer;
let cube, particles = [];
let mouseX = 0, mouseY = 0;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Initialize Three.js Scene
function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 2000, 10000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        windowWidth / windowHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(windowWidth, windowHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 0.8);
    pointLight1.position.set(-10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 0.6);
    pointLight2.position.set(10, -10, 10);
    scene.add(pointLight2);

    // Create main cube
    createAnimatedCube();

    // Create particles
    createParticleSystem();

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Create animated 3D cube
function createAnimatedCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create material with shader-like effect
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: false
    });

    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Add wireframe overlay
    const wireframeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        linewidth: 2
    });
    
    const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(wireframeGeometry),
        wireframeMaterial
    );
    cube.add(wireframe);
}

// Create particle system
function createParticleSystem() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Random position
        positions.push(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );

        // Random velocity
        velocities.push(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );

        particles.push({
            velocity: [
                velocities[velocities.length - 3],
                velocities[velocities.length - 2],
                velocities[velocities.length - 1]
            ]
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    const material = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Store for animation
    window.particleSystem = particleSystem;
    window.particlePositions = positions;
    window.particleVelocities = velocities;
}

// Mouse move handler
function onMouseMove(event) {
    mouseX = (event.clientX / windowWidth) * 2 - 1;
    mouseY = -(event.clientY / windowHeight) * 2 + 1;
}

// Window resize handler
function onWindowResize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(windowWidth, windowHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!cube) return;

    // Rotate cube based on mouse position
    cube.rotation.x += (mouseY * 2 - cube.rotation.x) * 0.05;
    cube.rotation.y += (mouseX * 2 - cube.rotation.y) * 0.05;

    // Add floating motion
    cube.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    // Update particle system
    if (window.particleSystem) {
        const positions = window.particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update position
            positions[i] += window.particleVelocities[i] * 0.5;
            positions[i + 1] += window.particleVelocities[i + 1] * 0.5;
            positions[i + 2] += window.particleVelocities[i + 2] * 0.5;

            // Bounce off boundaries
            if (Math.abs(positions[i]) > 10) window.particleVelocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 10) window.particleVelocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 10) window.particleVelocities[i + 2] *= -1;
        }

        window.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}
