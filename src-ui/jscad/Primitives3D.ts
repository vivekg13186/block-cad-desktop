import { cube, cuboid, roundedCuboid,ellipsoid,sphere,geodesicSphere ,cylinder,cylinderElliptic,
    roundedCylinder,torus} from "@jscad/modeling/src/primitives";
import { addBlock, addToolboxCatogery } from "./blocks";
import { scope } from './Scope';
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2} from "./util";

var toolbox = addToolboxCatogery("Primitive 3D");

function setupBlock(b, name, arg) {
    var di = b.appendDummyInput();

    di.appendField(name)
    arg.map(r => {
        var df = r.length == 2 ? r[1]:"";
        di.appendField(r[0])
            .appendField(new Blockly.FieldTextInput(df), r[0]);
    })
    //b.setInputsInline(true);
    b.setPreviousStatement(true, null);
    b.setNextStatement(true, null);
    b.setColour(toolbox.colour);
    b.setTooltip("");
    b.setHelpUrl("");
}

//cuboid({size: [1, 2, 3], center: [4, 5, 6]})
toolbox.contents.push({ "kind": "block", "type": "cuboid1" });
addBlock("cuboid1", {
    init: function () {
        var arg = [["size", "[10,10,10]"]];
        setupBlock(this, "Cuboid", arg);
    }
}, function (block) {
    try{
        console.log("cuboid");
        var size = parseVec3(block.getFieldValue("size"));
        scope.push(cuboid({ size: size }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
toolbox.contents.push({ "kind": "block", "type": "cuboid2" });
addBlock("cuboid2", {
    init: function () {
        var arg = [["size", "[10,10,10]"], ["center", "[10,10,10]"]];
        setupBlock(this, "Cuboid", arg);
    }
}, function (block) {
    try{
        var size = parseVec3(block.getFieldValue("size"));
        var center = parseVec3(block.getFieldValue("center"));
        scope.push(cuboid({ size: size, center: center }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

//cube({size: [1, 2, 3], center: [4, 5, 6]})
toolbox.contents.push({ "kind": "block", "type": "cube1" });
addBlock("cube1", {
    init: function () {
        var arg = [["size", "10"]];
        setupBlock(this, "Cube", arg);
    }
}, function (block) {
    try{
        var size = parseNum(block.getFieldValue("size"));
         
        scope.push(cube({  size }));
       
    }catch(e){
        statusBar.logError(e);
    }
  
    return "";
});
toolbox.contents.push({ "kind": "block", "type": "cube2" });
addBlock("cube2", {
    init: function () {
        var arg = [["size", "10"], ["center", "[10,10,10]"]];
        setupBlock(this, "Cube", arg);
    }
}, function (block) {
    try{
        var size = parseNum(block.getFieldValue("size"));
        var center = parseVec3(block.getFieldValue("center"));
        scope.push(cube({ size: size, center: center }));
    }catch(e){
        statusBar.logError(e);
    }
   
    return "";
});

//roundedCuboid({size: [1, 2, 3], roundRadius: 0.25, center: [4, 5, 6], segments: 32})
toolbox.contents.push({ "kind": "block", "type": "roundedCuboid1" });
addBlock("roundedCuboid1", {
    init: function () {
        var arg = [
            ["size", "[10,10,10]"],
            ["roundRadius", "0.25"]
        ];
        setupBlock(this, "Rounded Cuboid", arg);
    }
}, function (block) {
    try{
        var size = parseVec3(block.getFieldValue("size"));
        var roundRadius = parseNum(block.getFieldValue("roundRadius"));
        scope.push( roundedCuboid({ size, roundRadius }));
    }catch(e){
        statusBar.logError(e);
    }
  
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "roundedCuboid2" });
addBlock("roundedCuboid2", {
    init: function () {
        var arg = [["size", "[10,10,10]"], ["roundRadius", "0.25"], ["center", "[10,10,10]"], ["segments", "32"]];
        setupBlock(this, "Rounded Cuboid", arg);
    }
}, function (block) {
    try{
        var size = parseVec3(block.getFieldValue("size"));
        var roundRadius = parseNum(block.getFieldValue("roundRadius"));
        var center = parseVec3(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        scope.push( roundedCuboid({ size, roundRadius, center, segments }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

// ellipsoid({radius: [5, 10, 20]})
toolbox.contents.push({ "kind": "block", "type": "ellipsoid1" });
addBlock("ellipsoid1", {
    init: function () {
        var arg = [["radius", "[5,10,20]"]];
        setupBlock(this, "Ellipsoid", arg);
    }
}, function (block) {
    try{
        var radius = parseVec3(block.getFieldValue("radius"));
        scope.push( ellipsoid({ radius }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//ellipsoid({radius: [5, 10, 20], center: [5, 5, 5], segments: 64})
toolbox.contents.push({ "kind": "block", "type": "ellipsoid2" });
addBlock("ellipsoid2", {
    init: function () {
        var arg = [["radius", "[5,10,20]"],["center", "[5,5,5]"],["segments", "64"]];
        setupBlock(this, "Ellipsoid", arg);
    }
}, function (block) {
    try{
        var radius = parseVec3(block.getFieldValue("radius"));
        var center = parseVec3(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        scope.push( ellipsoid({ radius,center,segments }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

//sphere({radius: 3.5})
toolbox.contents.push({ "kind": "block", "type": "sphere1" });
addBlock("sphere1", {
    init: function () {
        var arg = [["radius", "3.5"]];
        setupBlock(this, "Sphere", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        scope.push( sphere({ radius }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//sphere({radius: 3.5, center: [5, 5, 5], segments: 64})
toolbox.contents.push({ "kind": "block", "type": "sphere2" });
addBlock("sphere2", {
    init: function () {
        var arg = [["radius", "3.5"],["center", "[5,5,5]"],["segments", "64"]];
        setupBlock(this, "Sphere", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var center = parseVec3(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        scope.push( sphere({ radius,center,segments }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

// geodesicSphere({radius: 15, frequency: 18})
toolbox.contents.push({ "kind": "block", "type": "geodesicSphere" });
addBlock("geodesicSphere", {
    init: function () {
        var arg = [["radius", "3.5"],["frequency", "18"]];
        setupBlock(this, "Geodesic Sphere", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var frequency = parseNum(block.getFieldValue("frequency"));
        scope.push( geodesicSphere({ radius ,frequency}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

//cylinder({radius: 5, height: 10})
toolbox.contents.push({ "kind": "block", "type": "cylinder1" });
addBlock("cylinder1", {
    init: function () {
        var arg = [["radius", "3.5"],["height", "10"]];
        setupBlock(this, "Cylinder", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var height = parseNum(block.getFieldValue("height"));
        scope.push( cylinder({ radius ,height}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//cylinder({radius: 5, height: 10, center: [5, 5, 5], segments: 64})
toolbox.contents.push({ "kind": "block", "type": "cylinder2" });
addBlock("cylinder2", {
    init: function () {
        var arg = [["radius", "3.5"],["height", "10"],["center","[5,5,5]"],["segments", "64"]];
        setupBlock(this, "Cylinder", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var height = parseNum(block.getFieldValue("height"));
        var center = parseVec3(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        scope.push( cylinder({ radius ,height,center,segments}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//cylinderElliptic({height: 2, startRadius: [10, 5], endRadius: [8, 3]})
toolbox.contents.push({ "kind": "block", "type": "cylinderElliptic" });
addBlock("cylinderElliptic", {
    init: function () {
        var arg = [["height", "3.5"],["startRadius", "[10, 5]"],["endRadius","[8, 3]"]];
        setupBlock(this, "Cylinder Elliptic", arg);
    }
}, function (block) {
    try{
        var startRadius = parseVec2(block.getFieldValue("startRadius"));
        var height = parseNum(block.getFieldValue("height"));
        var endRadius = parseVec2(block.getFieldValue("endRadius"));
        scope.push( cylinderElliptic({ startRadius,height,endRadius}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//roundedCylinder({radius: 5, height: 10, roundRadius: 0.5})
toolbox.contents.push({ "kind": "block", "type": "roundedCylinder1" });
addBlock("roundedCylinder1", {
    init: function () {
        var arg = [["radius", "5"],["height", "10"],["roundRadius","0.5"]];
        setupBlock(this, "Rounded Cylinder", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var height = parseNum(block.getFieldValue("height"));
        var roundRadius = parseNum(block.getFieldValue("roundRadius"));
        scope.push( roundedCylinder({ radius,height,roundRadius}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//roundedCylinder({radius: 5, height: 10, roundRadius: 0.5, center: [5, 5, 5], segments: 64})
toolbox.contents.push({ "kind": "block", "type": "roundedCylinder2" });
addBlock("roundedCylinder2", {
    init: function () {
        var arg = [["radius", "5"],["height", "10"],["roundRadius","0.5"],["center","[5,5,5]"],["segments", "64"]];
        setupBlock(this, "Rounded Cylinder", arg);
    }
}, function (block) {
    try{
        var radius = parseNum(block.getFieldValue("radius"));
        var height = parseNum(block.getFieldValue("height"));
        var roundRadius = parseNum(block.getFieldValue("roundRadius"));
        var center = parseVec3(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        scope.push( roundedCylinder({ radius,height,roundRadius,center,segments}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
//torus({innerRadius: 10, outerRadius: 100})
toolbox.contents.push({ "kind": "block", "type": "torus1" });
addBlock("torus1", {
    init: function () {
        var arg = [["innerRadius", "10"],["outerRadius", "100"]];
        setupBlock(this, "Tours", arg);
    }
}, function (block) {
    try{
        var innerRadius = parseNum(block.getFieldValue("innerRadius"));
        var outerRadius = parseNum(block.getFieldValue("outerRadius"));

        scope.push( torus({ innerRadius,outerRadius}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
/*innerRadius : 1
innerRotation : 0
innerSegments : 32
outerRadius : 4
outerSegments : 32
startAngle : 0
outerRotation : PI * 2*/
toolbox.contents.push({ "kind": "block", "type": "torus2" });
addBlock("torus2", {
    init: function () {
        var arg = [["innerRadius", "1"],["innerRotation", "0"],["innerSegments", "32"],["outerRadius", "4"],["startAngle", "0"],["outerSegments", "32"],["outerRotation", Math.PI*2]];
        setupBlock(this, "Tours", arg);
    }
}, function (block) {
    try{
        var innerRadius = parseNum(block.getFieldValue("innerRadius"));
        var innerRotation = parseNum(block.getFieldValue("innerRotation"));

        var innerSegments = parseNum(block.getFieldValue("innerSegments"));
        var outerRadius = parseNum(block.getFieldValue("outerRadius"));
        var startAngle = parseNum(block.getFieldValue("startAngle"));
        var outerSegments = parseNum(block.getFieldValue("outerSegments"));
        var outerRotation = parseNum(block.getFieldValue("outerRotation"));
        console.log({ innerRadius,innerRotation,innerSegments,outerRadius,startAngle,outerSegments,outerRotation})
        scope.push( torus({ innerRadius,innerRotation,innerSegments,outerRadius,startAngle,outerSegments,outerRotation}));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

//const points = [ [10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], [0, 0, 10] ]
//const faces = [ [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 3], [2, 1, 3] ]
//const myshape = polyhedron({points, faces, orientation: 'inward'})