 
import * as Blockly from "blockly";
import * as _ from "lodash";
export const codeGenerator = new Blockly.CodeGenerator('cad');
  
codeGenerator.scrub_ = function (block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        return code + '\n' + codeGenerator.blockToCode(nextBlock);
    }
    return code;
};

const blocks = [];
var toolbox = {
    "kind": "categoryToolbox",
    "contents":[]
};

var colors = [
    "rgb(244, 147, 75)",
    "rgb(188, 148, 94)",
    "rgb(173, 182, 85)",
    "rgb(200, 146, 48)",
    "rgb(27, 158, 119)",
    "rgb(217, 95, 2)",
    "rgb(117, 112, 179)",
    "rgb(231, 41, 138)",
    "rgb(102, 166, 30)",
    "rgb(230, 171, 2)",
    "rgb(166, 118, 29)",
    "rgb(102, 102, 102)",
    "rgb(227, 201, 170)",
];

export function getCodeGenerator(){
    return codeGenerator;
}
export function getBlocks() {
    return blocks;
}

export function getToolbox() {
    return toolbox;
}
export function addBlock(id: string, block: {},codeGen:Function) {
    Blockly.Blocks[id]=block;
    codeGenerator[id]=codeGen;
    //blocks.push(block);
}
export function addToolboxCatogery(name: string) {
    var item ={
        "kind": "category",
        "name": name,
        "colour": colors[toolbox.contents.length],
        "contents": []
    }
    toolbox.contents.push(item);
    return item;
}


import * as blocks_def from "./blocks_def.json";
import { Command, scope } from "./Scope";

var blocks_hashmap = {};
function block_init_wrapper(){
    var blk_id = this.type;
    var blk_def = blocks_hashmap[blk_id];
    console.log("Block  created ",blk_id,blk_def);
    var di = this.appendDummyInput();
    di.appendField(blk_def.title);
    _.forEach(blk_def.arg,function(v){
        console.log(v);
        di.appendField(v.name)
            .appendField(new Blockly.FieldTextInput(v.value), v.name);
    })
    if(blk_def.isStatementBlock){
        this.appendStatementInput("statements")
        .setCheck(null);
    }
    

    //this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(blk_def.colour);
    this.setTooltip("");
    this.setHelpUrl("");
}

function code_gen_wrapper(block){
    var blk_id = this.type;
    var blk_def = blocks_hashmap[blk_id];
    var arg_value = {};
    _.forEach(blk_def.arg,function(v){
         arg_value[v.name]=block.getFieldValue(v.name);
    })
    var statements=[];
    if(blk_def.isStatementBlock){
        scope.newScope();
        codeGenerator.statementToCode(block, "statements");
        statements = scope.scopeItem.items;
        scope.popScope();
    }
    var cmd = new Command(blk_id,arg_value,statements,blk_def);
    scope.push(cmd);
    return "null";
}
export function load_blocks(){
    _.forEach(blocks_def, function(cat, cat_id) {
        var tbc = addToolboxCatogery(cat_id);
        console.log("Toolbox cat created",tbc.name);
        _.forEach(cat.blocks,function(blk,blk_id){
            console.log("Block setup ",blk_id);
            //add to map for ref later
            blocks_hashmap[blk_id] = blk;
            blk.colour= tbc.colour;
            //add to blocks
            Blockly.Blocks[blk_id]={init:block_init_wrapper}
            //add to code gen
            codeGenerator[blk_id]=code_gen_wrapper;
            //add to toolbox
            tbc.contents.push({ "kind": "block", "type": blk_id});
        });
      });
     
}