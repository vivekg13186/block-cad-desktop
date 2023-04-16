import * as THREE from "three";
import { STLLoader } from "./stlLoader";
import { OrbitControls } from "./OrbitControls";
import * as viewcube from "./cube_view";
const loader = new STLLoader();
const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const group = new THREE.Group();

var viewCubeController=null;
var camera = null;
var grid = null;
var element = null;
var orbitControl = null;
const axesHelper = new THREE.AxesHelper(25);
var grid = new THREE.GridHelper(100, 100, "#666666", "#222222")
grid.rotation.x = Math.PI / 2;
const material = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    matcap: textureLoader.load("assets/matcap-porcelain-white.jpg")
});

function getWidth() {
    return element.getBoundingClientRect().width;
}
function getHeight() {
    return element.getBoundingClientRect().height;
}
function getAspectRatio() {
    return getWidth() / getHeight();
}

function setupControl() {
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.maxDistance = 700;
    orbitControl.minDistance = 100;
    orbitControl.enableDamping = false;
    viewcube.init(document.querySelector(".viewcube-container"),camera);
}



function animate() {
    viewcube.animate();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

 
export function initSTLViewer(){
    element = document.getElementById("viewer");
    camera = new THREE.PerspectiveCamera(750, getAspectRatio(), 10, 100000);
    camera.up.set(0, 0, 1);
    camera.position.z = 5;
    setupControl();
    scene.add(axesHelper);
    scene.add(grid);
    scene.background = new THREE.Color("rgb(40, 40, 40)");
    const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
    secondaryLight.position.set(5, 5, 5);
    scene.add(secondaryLight);
    scene.add(group);
    renderer.setSize(getWidth(), getHeight());
    renderer.setPixelRatio(window.devicePixelRatio)
    element.appendChild(renderer.domElement);
    animate();
}
export function resizeSTLViewer() {
    camera.aspect = getAspectRatio();
    camera.updateProjectionMatrix();
    renderer.setSize(getWidth(), getHeight());
}
export function renderSTL(code){
    loader.loadModel(code, (geometry) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.geometry.computeVertexNormals(true);
        group.clear();
        group.add(mesh);
    },(err)=>{
        console.error(err);
    });
} 