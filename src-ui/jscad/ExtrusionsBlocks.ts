import { extrusions } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";

import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {generateStatements, parseNum, parseVec3, parseVec3or2} from "./util";
import { scope } from './Scope';

var toolbox = addToolboxCatogery("Extrusions");

function setupBlock(b, name, arg) {
    var di = b.appendDummyInput();

    di.appendField(name)
    arg.map(r => {
        var df = r.length == 2 ? r[1]:"";
        di.appendField(r[0])
            .appendField(new Blockly.FieldTextInput(df), r[0]);
    })
    b.appendStatementInput("statements")
        .setCheck(null);

    //b.setInputsInline(true);
    b.setPreviousStatement(true, null);
    b.setNextStatement(true, null);
    b.setColour(toolbox.colour);
    b.setTooltip("");
    b.setHelpUrl("");
}

toolbox.contents.push({ "kind": "block", "type": "linear_extrude1" });
addBlock("linear_extrude1", {
    init: function () {
        var arg = [["height", "10"]];
        setupBlock(this, "Linear Extrude", arg);
    }
}, function (block) {
    try{
         
        var height = parseNum(block.getFieldValue("height"));
    
        var t = extrusions.extrudeLinear({height},...generateStatements(block));
         
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "linear_extrude2" });
addBlock("linear_extrude2", {
    init: function () {
        var arg = [["height", "10"],["twistAngle", "10"],["twistSteps", "10"]];
        setupBlock(this, "Linear Extrude", arg);
    }
}, function (block) {
    try{
       
        var height = parseNum(block.getFieldValue("height"));
        var twistAngle = parseNum(block.getFieldValue("twistAngle"));
        var twistSteps = parseNum(block.getFieldValue("twistSteps"));
        var t = extrusions.extrudeLinear({height,twistAngle,twistSteps},...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});



toolbox.contents.push({ "kind": "block", "type": "rectangular_extrude" });
addBlock("rectangular_extrude", {
    init: function () {
        var arg = [["size", "10"],["height", "10"]];
        setupBlock(this, "Rectangular Extrude", arg);
    }
}, function (block) {
    try{
       
        var size = parseNum(block.getFieldValue("size"));
        var height = parseNum(block.getFieldValue("height"));
       
        var t = extrusions.extrudeRectangular({size,height},...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "rotate_extrude" });
addBlock("rotate_extrude", {
    init: function () {
        var arg = [["startAngle", "0"],["angle", Math.PI * 2],["overflow", 'cap'],["segments", '12']];
        setupBlock(this, "Rotate Extrude", arg);
    }
}, function (block) {
    try{
       
        var startAngle = parseNum(block.getFieldValue("startAngle"));
        var angle = parseNum(block.getFieldValue("angle"));
        var overflow =  block.getFieldValue("height");
        var segments = parseNum(block.getFieldValue("segments"));
        var t = extrusions.extrudeRotate({startAngle,angle,overflow,segments},generateStatements(block)[0]);
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "project" });
addBlock("project", {
    init: function () {
        var arg = [["axis", "[0,0,1]"],["origin", "[0,0,0]"]];
        setupBlock(this, "Project", arg);
    }
}, function (block) {
    try{
       
        var axis = parseVec3(block.getFieldValue("axis"));
        var origin = parseVec3(block.getFieldValue("origin"));
        var t = extrusions.project({axis,origin},...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
