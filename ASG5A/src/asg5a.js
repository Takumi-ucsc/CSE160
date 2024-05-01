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

    /*
    // Control a camera
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 12, 0);
    controls.update();
    */

    // Create a scene
    const scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cubes = []; // just an array we can use to rotate the cubes
    const loader = new THREE.TextureLoader();
    loader.load('../resources/images/wall.jpg', (texture) => {

        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubes.push(cube); // add to our list of cubes to rotate

    });

    // Create a sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-5, 0, 0);
    scene.add(sphere);

    // Create a cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 3, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(5, 0, 0);
    scene.add(cylinder);

    // Add a directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

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
        sphere.rotation.x = time * 0.1;
        sphere.rotation.y = time * 0.1;


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

main();
