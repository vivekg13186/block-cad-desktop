import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import {stack} from "./eval";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2} from "./util";

var toolbox = addToolboxCatogery("Transforms");

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

toolbox.contents.push({ "kind": "block", "type": "transform" });
addBlock("transform", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Transform", arg);
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

toolbox.contents.push({ "kind": "block", "type": "rotate" });
addBlock("rotate", {
    init: function () {
        var arg = [["angle", "[10,10,10]"]];
        setupBlock(this, "Rotate", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var angle = parseVec3or2(block.getFieldValue("angle"));
        var args = stack;
        var t =transforms.rotate(angle,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "scale" });
addBlock("scale", {
    init: function () {
        var arg = [["factor", "[10,10,10]"]];
        setupBlock(this, "Scale", arg);
    }
}, function (block) {
    try{
        codeGenerator.statementToCode(block, "statements");
        var factor = parseVec3or2(block.getFieldValue("factor"));
        var args = stack;
        var t = transforms.scale(factor,...args);
        stack.splice(0,stack.length);
        stack.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});