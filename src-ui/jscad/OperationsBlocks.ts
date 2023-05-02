import { booleans,hulls } from '@jscad/modeling'

import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2, generateStatements} from "./util";
import { scope } from './Scope';

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
        var arg = [];
        setupBlock(this, "Union", arg);
    }
}, function (block) {
    try{
        
        var t = booleans.union(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "intersect" });
addBlock("intersect", {
    init: function () {
        var arg = [];
        setupBlock(this, "Intersect", arg);
    }
}, function (block) {
    try{
        
        var t = booleans.intersect(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "subtract" });
addBlock("subtract", {
    init: function () {
        var arg = [];
        setupBlock(this, "Subtract", arg);
    }
}, function (block) {
    try{
        
        var t = booleans.subtract(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "hull" });
addBlock("hull", {
    init: function () {
        var arg = [];
        setupBlock(this, "Hull", arg);
    }
}, function (block) {
    try{
        
        var t = hulls.hull(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});

toolbox.contents.push({ "kind": "block", "type": "hullchain" });
addBlock("hullchain", {
    init: function () {
        var arg = [];
        setupBlock(this, "Hull Chain", arg);
    }
}, function (block) {
    try{
        
        var t = hulls.hullChain(...generateStatements(block));
        
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


