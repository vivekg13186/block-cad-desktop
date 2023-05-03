import DarkTheme from '@blockly/theme-dark';
import {generate_blocks} from "./openscad";
import   * as Blockly from 'blockly';

var blocklyArea: HTMLDivElement|null = null;
var  blocklyDiv:HTMLDivElement|null = null;



export class BlocklyEditor{
    blocklyArea: HTMLDivElement;
    blocklyDiv:HTMLDivElement;
    workspace:Blockly.WorkspaceSvg;
    codeGenerator:Blockly.CodeGenerator;
    constructor(blocks,toolbox,codegen,theme,blocklyArea:HTMLDivElement){
        this.blocklyArea = blocklyArea;
        this.codeGenerator=codegen;
        this. blocklyDiv = document.createElement("div");
        this. blocklyDiv.style.position ="absolute"
        this. blocklyDiv.classList.add("blocklyDiv");
        this. blocklyArea.appendChild(this.blocklyDiv);
        var options:Blockly.BlocklyOptions = {
            toolbox: toolbox,
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
            theme: theme
        };
        this. workspace = Blockly.inject(this.blocklyDiv, options);
    }
    resetEditor(){
        Blockly.serialization.workspaces.load({},this.workspace);
    }
    getBlocklyCode(){
        return JSON.stringify(Blockly.serialization.workspaces.save(this.workspace));
    }
    
    setBlocklyCode(data:string){
        Blockly.serialization.workspaces.load(JSON.parse(data),this.workspace);
    }
    generateCode(){
        return this.codeGenerator.workspaceToCode(this.workspace);
    }
   resizeEditor(){
        var element:HTMLElement|null = this.blocklyArea;
      let x = 0;
      let y = 0;
      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent as HTMLElement;
      } while (element);
      // Position blocklyDiv over blocklyArea.
      this.blocklyDiv.style.left = x + 'px';
      this.blocklyDiv.style.top = y + 'px';
      this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + 'px';
      this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + 'px';
      Blockly.svgResize(this.workspace);
    }
}
/*
export interface IOSCadBlockEditor{
    blocklyArea: HTMLDivElement;
    blocklyDiv:HTMLDivElement;
    workspace:WorkspaceSvg;
}
export function init(areaElement:HTMLDivElement):IOSCadBlockEditor{
    blocklyArea = areaElement;
    blocklyDiv = document.createElement("div");
    blocklyDiv.style.position ="absolute"
    blocklyDiv.classList.add("blocklyDiv");
    blocklyArea.appendChild(blocklyDiv);
   
    var openscad = generate_blocks();
    var options:BlocklyOptions = {
        toolbox: openscad.toolbox,
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
    var workspace = Blockly.inject(blocklyDiv, options);
    var result = {blocklyArea,blocklyDiv,workspace};
    return result;
}

export function resetEditor(b:IOSCadBlockEditor){
    Blockly.serialization.workspaces.load({},b.workspace);
}
export function getBlocklyCode(b:IOSCadBlockEditor){
    return Blockly.serialization.workspaces.save(b.workspace);
}

export function setBlocklyCode(b:IOSCadBlockEditor,data:string){
    Blockly.serialization.workspaces.load(JSON.parse(data),b.workspace);
}

export function resizeEditor(b:IOSCadBlockEditor){
    var element:HTMLElement|null = b.blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  b.blocklyDiv.style.left = x + 'px';
  b.blocklyDiv.style.top = y + 'px';
  b.blocklyDiv.style.width = b.blocklyArea.offsetWidth + 'px';
  b.blocklyDiv.style.height = b.blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(b.workspace);
}
*/