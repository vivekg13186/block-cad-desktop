import { addBlock, addToolboxCatogery, codeGenerator } from "./blocks";
import { scope } from './Scope';
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import {parseNum,parseVec3,parseVec2,parseVec3or2} from "./util";
import * as modeling  from "@jscad/modeling";
import { path } from "@tauri-apps/api";
const segmentToPath = (segment) => {
    return modeling.geometries.path2.fromPoints({closed: false}, segment)
  }

var toolbox = addToolboxCatogery("Others");

function setupBlock(b, name, arg) {
    var di = b.appendDummyInput();

    di.appendField(name)
    arg.map(r => {
        var df = r.length == 2 ? r[1]:"";
        di.appendField(r[0])
            .appendField(new Blockly.FieldTextInput(df), r[0]);
    })
    

    b.setPreviousStatement(true, null);
    b.setNextStatement(true, null);
    b.setColour(toolbox.colour);
    b.setTooltip("");
    b.setHelpUrl("");
}

toolbox.contents.push({ "kind": "block", "type": "text" });
addBlock("text", {
    init: function () {
        var arg = [["text", "Hello"]];
        setupBlock(this, "Text", arg);
    }
}, function (block) {
    try{
        var text = block.getFieldValue("text");
         console.log(text);
         const paths = modeling.text.vectorText(text).map((segment) => segmentToPath(segment));
         console.log(paths);
       
    }catch(e){
        statusBar.logError(e);
    }
    
    return "";
});


toolbox.contents.push({ "kind": "block", "type": "path" });
addBlock("path", {
    init: function () {
        var arg = [["pos", "[10,10,10]"]];
        setupBlock(this, "Path", arg);
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
 
