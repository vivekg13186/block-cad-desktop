import * as THREE from "three";
import { STLLoader } from "./stlLoader";
import { OrbitControls } from "./OrbitControls";


const loader = new STLLoader();
const textureLoader = new THREE.TextureLoader();
const imageLoader = new THREE.ImageLoader();


const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
var camera=null;
export function loadViewer() {
    var right = document.getElementById("viewer");
     var pos = right.getBoundingClientRect();
      camera = new THREE.PerspectiveCamera(
        750,
        pos.width / pos.height,
        10,
        100000
    );
    




    const controls = new OrbitControls(camera, renderer.domElement);

    controls.maxDistance = 700;
    controls.minDistance = 100;

    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;
    /**
     * Light setup
     */
    const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
    secondaryLight.position.set(5, 5, 5);
    scene.add(secondaryLight);

   

    renderer.setSize(pos.width, pos.height);
    right.appendChild(renderer.domElement);

    function onWindowResize() {
        var right = document.getElementById("viewer");
        var pos = right.getBoundingClientRect();
        camera.aspect = pos.width / pos.height;
        camera.updateProjectionMatrix();

        renderer.setSize(pos.width, pos.height);
    }

    window.addEventListener("resize", onWindowResize, false);
    animate();
    
}
const material = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    matcap: textureLoader.load("assets/matcap-porcelain-white.jpg")
});
export function render_cad(code){
    loader.loadModel(code, (geometry) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.geometry.computeVertexNormals(true);
        mesh.geometry.center();
        scene.clear();
        scene.add(mesh);
        mesh.rotation.x = -1.2;
    },(err)=>{
        console.error(err);
    });
}
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
