import Split from "split.js"

import  {Toolbar} from "./widgets/Toolbar";
import {GLViewer} from "./gl/GLViewer";
import "./app.css"
 
import {BlocklyEditor} from "./BlockEditor";
import DarkTheme from '@blockly/theme-dark';
import {getBlocks,getToolbox,getCodeGenerator} from './jscad/blocks';
import "./jscad/Primitives3D";
import "./jscad/TransformBlocks";
import "./jscad/OperationsBlocks";
import "./jscad/Primitives2D";
//import "./jscad/OtherBlocks";
import "./jscad/ExtrusionsBlocks";
import "./jscad/ExpansionBlocks";
import { renderAction,initAction } from "./actions";

var blockEditor = new BlocklyEditor(getBlocks(),getToolbox(),getCodeGenerator(),DarkTheme,document.getElementById("block-area") as HTMLDivElement);

Split(['.left', '.right'], {
    sizes: [50, 50],
    gutterSize: 3,
    onDrag:function(sizes){
       resizeAll();
    }
});
var t1=null;



t1 = document.getElementById("toolbar");
if(t1){
var toolbar = new Toolbar(t1,function handleAction(cmd){
    console.log(cmd);
    if(cmd=="render"){
        renderAction();
    }
    
});
toolbar.addIcon("new",`<span class="material-symbols-outlined">note_add</span>`,"New Drawing");
toolbar.addIcon("open",`<span class="material-symbols-outlined">folder_open</span>`,"Open Drawing");
toolbar.addIcon("save",`<span class="material-symbols-outlined">save</span>`,"Save Drawing");
toolbar.addIcon("render",`<span class="material-symbols-outlined">play_arrow</span>`,"Render Drawing");

}

var t2 = document.getElementById("viewer") as HTMLDivElement;
if(t2)
var glViewer =new GLViewer(t2);


function resizeAll(){
    glViewer.resize();
    blockEditor.resizeEditor();
}
window.addEventListener('resize', resizeAll, false);
resizeAll();
initAction(blockEditor,glViewer);