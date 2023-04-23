import { cube, cuboid, roundedCuboid } from "@jscad/modeling/src/primitives";
import { addBlock, addToolboxCatogery } from "./blocks";
import {stack} from "./eval";
import * as Blockly from "blockly";
import { statusBar } from "../Statusbar";
 

var toolbox = addToolboxCatogery("Primitive 3D");

function parseVec3(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 3) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0, 0];
}
function parseNum(txt) {
    try {
        var v = JSON.parse(txt);
        return Number(v);
    } catch (e) {
        console.log(e);
    }
    return 0;
}
function setupBlock(b, name, arg) {
    var di = b.appendDummyInput();

    di.appendField(name)
    arg.map(r => {
        var df = r.length == 2 ? r[1]:"";
        di.appendField(r[0])
            .appendField(new Blockly.FieldTextInput(df), r[0]);
    })
    b.setInputsInline(true);
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
        var size = parseVec3(block.getFieldValue("size"));
        stack.push(cuboid({ size: size }));
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
        stack.push(cuboid({ size: size, center: center }));
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
         
        stack.push(cube({  size }));
       
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
        stack.push(cube({ size: size, center: center }));
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
        stack.push( roundedCuboid({ size, roundRadius }));
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
        stack.push( roundedCuboid({ size, roundRadius, center, segments }));
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});