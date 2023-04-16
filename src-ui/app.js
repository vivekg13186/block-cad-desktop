import "./app.css"
import Blockly from 'blockly';
import {initSTLViewer,resizeSTLViewer,renderSTL} from "./STLViewer";
import {generate_blocks,codeGenerator} from "./openscad";
import DarkTheme from '@blockly/theme-dark';
import Split from 'split.js'
import { saveFile } from "./file";

var gen_code = generate_blocks();
Blockly.defineBlocksWithJsonArray(gen_code.blocks);
var options = {
    toolbox: gen_code.toolbox,
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: false,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'https://blockly-demo.appspot.com/static/media/',
    rtl: false,
    scrollbars: true,
    sounds: false,
     //renderer: 'zelos',
    oneBasedIndex: true,
    zoom: {
        controls: true,
        startScale: 0.8,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
    },
    theme: DarkTheme
};
Split(['.left', '.right'], {
    sizes: [50, 50],
    gutterSize: 3,
    onDrag:function(sizes){
        onresize();
    }
})
 

var workspace = Blockly.inject("block-editor", options);
const runCode = () => {
    var code = codeGenerator.workspaceToCode(workspace);
    console.log("openscad gen cde",code);
    renderSTL(code);
};
initSTLViewer();
document.getElementById("gen-code").addEventListener("click", runCode);
document.getElementById("save-code").addEventListener("click", function(){
    var code =Blockly.serialization.workspaces.save(workspace)
    saveFile(code);
});

 
const onresize = function(e) {
    Blockly.svgResize(workspace);
    resizeSTLViewer();
  };
window.addEventListener('resize', onresize, false);
onresize();
 