import { BlocklyEditor } from "./BlockEditor";
import { saveToFile, saveToNewFile, openFile } from "./file";
import { stack } from "./jscad/eval";
import {objSerializer} from "@jscad/io"
import * as THREE from "three";


import {statusBar} from "./widgets/Statusbar";
import { GLViewer } from "./gl/GLViewer";

var current_filename:string|null = null;

var blockEditor:BlocklyEditor;
var glViewer:GLViewer;


export function initAction(be:BlocklyEditor,gv:GLViewer) {
    glViewer=gv;
    blockEditor=be;
}

export function saveFileAction(code: string) {
    if (current_filename) {
        saveToFile(current_filename, code).then(function () {
            statusBar.setStatus( `${current_filename} saved`, "error", 0);
        }).catch(function (e) {
            statusBar.setStatus( `Error while saving file`, "error", 0);
        });
    }else{
        saveToNewFile(code).then(function(filename){
            if(filename){
                current_filename = filename;
                statusBar.setStatus( `${current_filename} saved`, "error", 0);
            }
        }).catch(function(e){
            statusBar.setStatus( `Error while saving file ${current_filename}`, "error", 0);
        });
    }

}


export function saveAsFileAction(code:string) {
    saveToNewFile(code).then(function(filename){
        if(filename){
            current_filename = filename;
            statusBar.setStatus( `${current_filename} saved`, "error", 0);
        }
    }).catch(function(e){
        statusBar.setStatus( `Error while saving file ${current_filename}`, "error", 0);
    });
}

export function openFileAction(callback) {
    openFile().then(function(data){
        if(data){
            current_filename = data.filepath;
            callback(data.data);
        }
    }).catch(function(e){
        console.error(e);
        statusBar.setStatus( `Error opening file`, "error", 0);
    })
}

export async function renderAction() {
   
    try{
        stack.splice(0,stack.length);
        blockEditor.generateCode();
        var len=stack.length;
        statusBar.setStatus( `New geom ${len}`, "error", 0);
        const rawData = objSerializer.serialize({}, stack);
        const blob = new Blob(rawData)
        glViewer.updateBlobObj(blob);
    }catch(e){
        statusBar.logError(e);
    }
   
}

 
export function newFileAction() {

}