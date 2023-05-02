import { transforms } from '@jscad/modeling'
import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import {scope} from "./Scope";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2, generateStatements} from "./util";

var toolbox = addToolboxCatogery("Expansions");

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

toolbox.contents.push({ "kind": "block", "type": "expand" });
addBlock("expand", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Expand", arg);
    }
}, function (block) {
    try{
        
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var t = transforms.translate(pos,...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "offset" });
addBlock("offset", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Offset", arg);
    }
}, function (block) {
    try{
         
        var pos = parseVec3or2(block.getFieldValue("pos"));
        var t = transforms.translate(pos,...generateStatements(block));
        scope.push(t);
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});
