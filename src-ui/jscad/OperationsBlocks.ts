import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import {stack} from "./eval";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2} from "./util";

var toolbox = addToolboxCatogery("Operations");

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

toolbox.contents.push({ "kind": "block", "type": "union" });
addBlock("union", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Union", arg);
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


toolbox.contents.push({ "kind": "block", "type": "intersect" });
addBlock("intersect", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Intersect", arg);
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

toolbox.contents.push({ "kind": "block", "type": "subtract" });
addBlock("subtract", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Subtract", arg);
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


toolbox.contents.push({ "kind": "block", "type": "hull" });
addBlock("hull", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Hull", arg);
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

toolbox.contents.push({ "kind": "block", "type": "hullchain" });
addBlock("hullchain", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Hull Chain", arg);
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


toolbox.contents.push({ "kind": "block", "type": "scission" });
addBlock("scission", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Scission", arg);
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
