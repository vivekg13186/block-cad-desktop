import "./cube_view.css"
import ViewCubeController from "./ViewCubeController";
import * as THREE from "three";
function epsilon(value) {
    return Math.abs(value) < 1e-10 ? 0 : value;
}

function getCameraCSSMatrix(matrix) {
    const { elements } = matrix;

    return `matrix3d(
      ${epsilon(elements[0])},
      ${epsilon(-elements[1])},
      ${epsilon(elements[2])},
      ${epsilon(elements[3])},
      ${epsilon(elements[4])},
      ${epsilon(-elements[5])},
      ${epsilon(elements[6])},
      ${epsilon(elements[7])},
      ${epsilon(elements[8])},
      ${epsilon(-elements[9])},
      ${epsilon(elements[10])},
      ${epsilon(elements[11])},
      ${epsilon(elements[12])},
      ${epsilon(-elements[13])},
      ${epsilon(elements[14])},
      ${epsilon(elements[15])})`;
}

var element = null;
var camera = null;
var controller = null;
var cube=null;
const mat = new THREE.Matrix4();
export function init(e, c) {
    element = e;
    camera = c;
    controller = new ViewCubeController(camera);
    cube  = document.createElement("div");
    cube.className="cube";
    var orientations  = Object.keys(ViewCubeController.ORIENTATIONS);
    for(var i=0;i<orientations.length;i++){
        var div = document.createElement("div");
        div.dataset.orientation = orientation;
        var orientation = orientations[i];
        div.className=`cube__face cube__face--${orientation}`
        div.addEventListener("click",function(e){
            var d = e.target;
            var o  = ViewCubeController.ORIENTATIONS[d.dataset.orientation]
            console.log(o,d.dataset.orientation);
            controller.tweenCamera(o);
        })
        div.innerHTML=orientation;
        console.log(div)
        cube.appendChild(div);
    }
    element.appendChild(cube);
}

export function animate() {
    mat.extractRotation(camera.matrixWorldInverse);
    cube.style.transform = `translateZ(-300px) ${getCameraCSSMatrix(
        mat
    )}`;
    try{controller.tweenCallback();}catch(e){}
    
};