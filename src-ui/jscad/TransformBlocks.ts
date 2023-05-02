import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import { scope } from './Scope';
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {getValue, generateStatements, getArgs} from "./util";

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
}, async function (block)  {
    try{
        var pos = await getValue(block,"pos");
        var t = transforms.translate(pos,...generateStatements(block));
        scope.push(t);
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
}, async function (block) {
    try{
        
        var angle =  await getValue(block,"angle");
        var t =transforms.rotate(angle,...generateStatements(block));
        
        scope.push(t);
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
}, async function (block) {
    try{
        
        var factor =  await getValue(block,"factor");
        var t = transforms.scale(factor,...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "align" });
addBlock("align", {
    init: function () {
        var arg = [["modes", "['min', 'none', 'none']"]];
        setupBlock(this, "Align", arg);
    }
},async function (block) {
    try{
        
        var modes =  await getValue(block,"modes");
        var t = transforms.align({modes},...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "align2" });
addBlock("align2", {
    init: function () {
        var arg = [["modes", "['min', 'none', 'none']"],["relativeTo","[10, null, 10]"],["grouped","true"]];
        setupBlock(this, "Align", arg);
    }
}, async function (block) {
    try{
        var args = await getArgs(block,["modes","relativeTo","grouped"]);
        var t = transforms.align(args,...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "center1" });
addBlock("center1", {
    init: function () {
        var arg = [["axes", "[true,true,false]"]];
        setupBlock(this, "Center", arg);
    }
}, async function (block) {
    try{
        
        var axes = await getValue(block,"axes");
        var t = transforms.center({axes},...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "centerX" });
addBlock("centerX", {
    init: function () {
        var arg = [];
        setupBlock(this, "Center X", arg);
    }
}, function (block) {
    try{
        var t = transforms.centerX(...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "centerY" });
addBlock("centerY", {
    init: function () {
        var arg = [];
        setupBlock(this, "Center Y", arg);
    }
}, function (block) {
    try{
        
        var t = transforms.centerY(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "centerZ" });
addBlock("centerZ", {
    init: function () {
        var arg = [];
        setupBlock(this, "Center Z", arg);
    }
}, function (block) {
    try{
        
        var t = transforms.centerZ(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "center2" });
addBlock("center2", {
    init: function () {
        var arg = [["axes", "[true,true,false]"],["relativeTo","[0,0,0]"]];
        setupBlock(this, "Center", arg);
    }
}, async function (block) {
    try{
        var args  = await getArgs(block,["axes","relativeTo"])
        var t = transforms.center(args,...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "mirrorX" });
addBlock("mirrorX", {
    init: function () {
        var arg = [];
        setupBlock(this, "Mirror X", arg);
    }
}, function (block) {
    try{
        
        var t = transforms.mirrorX(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "mirrorY" });
addBlock("mirrorY", {
    init: function () {
        var arg = [];
        setupBlock(this, "Mirror Y", arg);
    }
}, function (block) {
    try{
        
        var t = transforms.mirrorY(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "mirrorZ" });
addBlock("mirrorZ", {
    init: function () {
        var arg = [];
        setupBlock(this, "Mirror Z", arg);
    }
}, function (block) {
    try{
        
        var t = transforms.mirrorZ(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "mirror1" });
addBlock("mirror1", {
    init: function () {
        var arg = [["origin", "[3,3,3]"]];
        setupBlock(this, "Origin", arg);
    }
}, async function (block) {
    try{
        
        var args  = await getArgs(block,["origin"])
        var t = transforms.mirror(args,...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "mirror2" });
addBlock("mirror2", {
    init: function () {
        var arg = [["origin", "[3,3,3]"],["normal","[1, 0, 1]"]];
        setupBlock(this, "Origin", arg);
    }
}, async function (block) {
    try{
        var args  = await getArgs(block,["origin","normal"])
        var t = transforms.mirror(args,...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

