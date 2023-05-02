import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import {stack} from "./eval";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2} from "./util";

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

toolbox.contents.push({ "kind": "block", "type": "linear_extrude" });
addBlock("linear_extrude", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Linear Extrude", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var args = stack;
        console.log("transfomr",args);
        var t = transforms.translate(pos,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "rectangular_extrude" });
addBlock("rectangular_extrude", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Rectangular Extrude", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var args = stack;
        console.log("transfomr",args);
        var t = transforms.translate(pos,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "rotate_extrude" });
addBlock("rotate_extrude", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Rotate Extrude", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var args = stack;
        console.log("transfomr",args);
        var t = transforms.translate(pos,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "project" });
addBlock("project", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Project", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var args = stack;
        console.log("transfomr",args);
        var t = transforms.translate(pos,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
