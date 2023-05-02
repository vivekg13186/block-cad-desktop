import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";
import {OBJLoader} from "./OBJLoader";
const textureLoader = new THREE.TextureLoader();
const material = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    matcap: textureLoader.load("assets/matcap-porcelain-white.jpg")
});
var loader = new OBJLoader();

export class GLViewer {
    camera: THREE.PerspectiveCamera;
    element: HTMLDivElement;
    orbitControl: OrbitControls;
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();
    group = new THREE.Group();
    axesHelper = new THREE.AxesHelper(25);
    grid = new THREE.GridHelper(100, 100, "#666666", "#222222")

    constructor(element: HTMLDivElement) {
        this.element = element;
        var pos = element.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(
            750,
            pos.width / pos.height,
            10,
            100000
        );
        this.camera.up.set(0, 0, 1);

        //setup orbit control
        this.orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControl.maxDistance = 700;
        this.orbitControl.minDistance = 100;
        //set up axes
        this.scene.add(this.axesHelper);
        this.grid.rotation.x = Math.PI / 2;
        this.scene.add(this.grid);
        this.scene.background = new THREE.Color("rgb(40, 40, 40)");
        this.camera.position.z = 5;
        const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
        secondaryLight.position.set(15, 15, 15);
        this.scene.add(secondaryLight);
        this.scene.add(this.group);
        this.renderer.setSize(pos.width, pos.height);
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.element.appendChild(this.renderer.domElement);
        this.resize();
        this.animate();
    }

    resize() {
        var pos = this.element.getBoundingClientRect();
        this.camera.aspect = pos.width / pos.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(pos.width, pos.height);
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
    clearScene(){
        this.group.clear();
    }
    async updateBlobObj(blob:Blob){
        
        const blog_string = await blob.text();
        console.log(blog_string);
        const mesh = loader.parse(blog_string);
        mesh.material = material;
        if(mesh.children){
            mesh.children.map(c=>{
                c.material = material;
            })
        }
     
        this.updateObjMesh(mesh);
    }
    updateObjMesh(mesh) {
        
        this.group.add(mesh);
    }

}