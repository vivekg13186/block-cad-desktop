import "./app.css"
import Blockly from 'blockly';
import { generate_code } from "./opencad_code_gen";
import { javascriptGenerator } from 'blockly/javascript';
import {loadViewer,render_cad} from "./stl_viewer";
import {generate} from "./blocks_generator";
var gen_code = generate();
Blockly.defineBlocksWithJsonArray(gen_code.blocks);
import DarkTheme from '@blockly/theme-dark';


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

 

var workspace = Blockly.inject("block-editor", options);
const runCode = () => {
    const js_code = javascriptGenerator.workspaceToCode(workspace);
    var cad_code  = generate_code(js_code);
    render_cad(cad_code);
};
document.getElementById("gen-code").addEventListener("click", runCode);

loadViewer();
const onresize = function(e) {
   
    Blockly.svgResize(workspace);
  };
window.addEventListener('resize', onresize, false);
onresize();
 