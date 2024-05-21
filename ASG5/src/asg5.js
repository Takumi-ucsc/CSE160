import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

function main() {

    // Create a canvas
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    // Create a camera
    const fov = 80;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 12, 30);

    // Control a camera
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 12, 0);
    controls.update();


    // Create a scene
    const scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cubes = []; // just an array we can use to rotate the cubes
    const spheres = [];
    const cylinders = [];
    const loader = new THREE.TextureLoader();
    loader.load('../resources/images/wall.jpg', (texture) => {

        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        // Create multiple cubes
        for (let i = 0; i < 10; i++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
            scene.add(cube);
            cubes.push(cube);
        }
    });

    // Create multiple spheres
    for (let i = 0; i < 5; i++) {
        const sphereGeometry = new THREE.SphereGeometry(Math.random() * 2 + 0.5, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
        scene.add(sphere);
        spheres.push(sphere); // add the sphere to the array
    }

    // Create multiple cylinders
    for (let i = 0; i < 5; i++) {
        const cylinderGeometry = new THREE.CylinderGeometry(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 5 + 1, 32);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
        scene.add(cylinder);
        cylinders.push(cylinder); // add the cylinder to the array
    }

    // Add a skybox
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
          '../resources/images/pos-x.jpg',
          '../resources/images/neg-x.jpg',
          '../resources/images/pos-y.jpg',
          '../resources/images/neg-y.jpg',
          '../resources/images/pos-z.jpg',
          '../resources/images/neg-z.jpg',
        ]);
        scene.background = texture;
      }

    // Add a directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

    // Add an ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add a point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Load a custom textured 3D model
    const mtlLoader = new MTLLoader();
    mtlLoader.load('../resources/models/Air_Balloon.mtl', (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('../resources/models/Air_Balloon.obj', (object) => {
            scene.add(object);
        });
    });

    // Resize the renderer
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // Render the scene
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        animateCubes(time, cubes);
        animateSpheres(time, spheres);
        animateCylinders(time, cylinders);


        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }
    requestAnimationFrame(render);
}

// Animate the cubes
function animateCubes(time, cubes) {
    cubes.forEach((cube, ndx) => {
        const speed = 2 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
}

// Animate the spheres
function animateSpheres(time, spheres) {
    spheres.forEach((sphere) => {
        sphere.rotation.x = time * 0.1;
        sphere.rotation.y = time * 0.1;
    });
}

// Animate the cylinders
function animateCylinders(time, cylinders) {
    cylinders.forEach((cylinder) => {
        cylinder.rotation.x = time * 0.05;
        cylinder.rotation.y = time * 0.05;
    });
}

main();
