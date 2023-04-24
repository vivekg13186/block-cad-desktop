import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery } from "./blocks";
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
    b.appendStatementInput("statement")
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
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var args = stack;
        stack.splice(0,stack.length);
        stack.push(transforms.translate(pos,...args));
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
        var angle = parseVec3or2(block.getFieldValue("angle"));
        var args = stack;
        stack.splice(0,stack.length);
        stack.push(transforms.rotate(angle),...args);
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
        var angle = parseVec3or2(block.getFieldValue("factor"));
        var args = stack;
        stack.splice(0,stack.length);
        stack.push(transforms.scale(angle),...args);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});