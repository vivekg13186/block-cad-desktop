 
import * as Blockly from "blockly";

 const codeGenerator = new Blockly.CodeGenerator('cad');
  
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


 