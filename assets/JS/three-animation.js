// Three.js 3D Animation System for Portfolio
// Advanced 3D scene with interactive elements + cursor-reactive particles

let scene, camera, renderer;
let cube, particles = [];
let mouseX = 0, mouseY = 0;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Cursor position for particle attraction
let cursorWorldX = 0, cursorWorldY = 0;

function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 2000, 10000);

    camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
    camera.position.z = 5;

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(windowWidth, windowHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

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

    createAnimatedCube();
    createParticleSystem();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function createAnimatedCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
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

    const wireframeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(wireframeGeometry), wireframeMaterial);
    cube.add(wireframe);
}

function createParticleSystem() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        velocities.push(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );
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

    window.particleSystem = particleSystem;
    window.particlePositions = positions;
    window.particleVelocities = velocities;
}

function onMouseMove(event) {
    mouseX = (event.clientX / windowWidth) * 2 - 1;
    mouseY = -(event.clientY / windowHeight) * 2 + 1;

    // Convert mouse to world space for particle attraction
    cursorWorldX = mouseX * 5;
    cursorWorldY = mouseY * 5;
}

function onWindowResize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(windowWidth, windowHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (!cube) return;

    // Rotate cube based on mouse
    cube.rotation.x += (mouseY * 2 - cube.rotation.x) * 0.05;
    cube.rotation.y += (mouseX * 2 - cube.rotation.y) * 0.05;

    // Floating motion
    cube.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    // Pulse scale effect
    const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.05;
    cube.scale.set(pulse, pulse, pulse);

    // Update particles with cursor attraction
    if (window.particleSystem) {
        const positions = window.particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            const dx = cursorWorldX - positions[i];
            const dy = cursorWorldY - positions[i + 1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Attract particles toward cursor when close
            if (dist < 4) {
                const force = 0.002 / (dist + 0.5);
                window.particleVelocities[i] += dx * force;
                window.particleVelocities[i + 1] += dy * force;
            }

            // Apply velocity with damping
            window.particleVelocities[i] *= 0.99;
            window.particleVelocities[i + 1] *= 0.99;
            window.particleVelocities[i + 2] *= 0.99;

            positions[i] += window.particleVelocities[i] * 0.5;
            positions[i + 1] += window.particleVelocities[i + 1] * 0.5;
            positions[i + 2] += window.particleVelocities[i + 2] * 0.5;

            // Bounce off boundaries
            if (Math.abs(positions[i]) > 10) window.particleVelocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 10) window.particleVelocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 10) window.particleVelocities[i + 2] *= -1;
        }

        window.particleSystem.geometry.attributes.position.needsUpdate = true;

        // Slow rotation for particle system
        window.particleSystem.rotation.y += 0.0005;
    }

    renderer.render(scene, camera);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}
