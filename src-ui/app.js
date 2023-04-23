import "./app.css"
import Blockly from 'blockly';
import {initSTLViewer,resizeSTLViewer,renderSTL} from "./STLViewer";
import {generate_blocks,codeGenerator} from "./openscad";
import DarkTheme from '@blockly/theme-dark';
import Split from 'split.js'
import { openFile, saveFile } from "./file";

import * as Statusbar from "./Statusbar";

var gen_code = generate_blocks();
Blockly.defineBlocksWithJsonArray(gen_code.blocks);

const blocklyArea = document.getElementById("block-area");
const  blocklyDiv = document.getElementById('block-editor');

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
 

var workspace = Blockly.inject(blocklyDiv, options);
const runCode = () => {
    var code = codeGenerator.workspaceToCode(workspace);
    console.log("openscad gen cde",code);
    renderSTL(code);
};
initSTLViewer();
document.getElementById("gen-code").addEventListener("click", runCode);
document.getElementById("save-code").addEventListener("click", function(){
    var code =Blockly.serialization.workspaces.save(workspace)
    console.log(JSON.stringify(code));
    saveFile(JSON.stringify(code));
});


document.getElementById("open-file").addEventListener("click", function(){
 openFile(function(data){
        console.log(data);
        Blockly.serialization.workspaces.load(JSON.parse(data),workspace);
    })
})
 
const onresize = function(e) {
    var element = blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(workspace);
    
    resizeSTLViewer();
  };
window.addEventListener('resize', onresize, false);

 
const status_bar = Statusbar.init(document.getElementById("status-bar"));
onresize();