import "./app.css"
import Blockly from 'blockly';
import { init } from "./opencad_blocks";
import { generate_code } from "./opencad_code_gen";
import { toolbox } from "./toolbox";
init();
import { javascriptGenerator } from 'blockly/javascript';
import {loadViewer,render_cad} from "./stl_viewer";
var options = {
    toolbox: toolbox,
    collapse: false,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'https://blockly-demo.appspot.com/static/media/',
    rtl: false,
    scrollbars: true,
    sounds: true,
    // renderer: 'zelos',
    oneBasedIndex: true,
    grid: {
        spacing: 20,
        length: 1,
        colour: '#888',
        snap: false
    },
    zoom: {
        controls: true,
        startScale: 1,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
    }
};

 

var workspace = Blockly.inject("block-editor", options);
const runCode = () => {
    const js_code = javascriptGenerator.workspaceToCode(workspace);
    var cad_code  = generate_code(js_code);
    render_cad(cad_code);
};
document.getElementById("gen-code").addEventListener("click", runCode);

loadViewer();