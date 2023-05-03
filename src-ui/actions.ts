import { BlocklyEditor } from "./BlockEditor";
import { saveToFile, saveToNewFile, openFile } from "./file";
import { objSerializer } from "@jscad/io"
import * as THREE from "three";


import { statusBar } from "./widgets/Statusbar";
import { GLViewer } from "./gl/GLViewer";
import { scope } from "./jscad/Scope";
import { convertToJSCAD } from "./jscad/command2jscad";

var current_filename: string | null = null;

var blockEditor: BlocklyEditor;
var glViewer: GLViewer;


export function initAction(be: BlocklyEditor, gv: GLViewer) {
    glViewer = gv;
    blockEditor = be;
}

export function saveFileAction(code: string) {
    if (current_filename) {
        saveToFile(current_filename, code).then(function () {
            statusBar.setStatus(`${current_filename} saved`, "error", 0);
        }).catch(function (e) {
            statusBar.setStatus(`Error while saving file`, "error", 0);
        });
    } else {
        saveToNewFile(code).then(function (filename) {
            if (filename) {
                current_filename = filename;
                statusBar.setStatus(`${current_filename} saved`, "error", 0);
            }
        }).catch(function (e) {
            statusBar.setStatus(`Error while saving file ${current_filename}`, "error", 0);
        });
    }

}


export function saveAsFileAction(code: string) {
    saveToNewFile(code).then(function (filename) {
        if (filename) {
            current_filename = filename;
            statusBar.setStatus(`${current_filename} saved`, "error", 0);
        }
    }).catch(function (e) {
        statusBar.setStatus(`Error while saving file ${current_filename}`, "error", 0);
    });
}

export function openFileAction(callback) {
    openFile().then(function (data) {
        if (data) {
            current_filename = data.filepath;
            callback(data.data);
        }
    }).catch(function (e) {
        console.error(e);
        statusBar.setStatus(`Error opening file`, "error", 0);
    })
}

export  async function renderAction() {

    try {
        scope.reset();
        glViewer.clearScene();
        blockEditor.generateCode();
        scope.scopeItem.items.map(si => {
            console.log(si.toJSON());
        })
        for(var i=0;i< scope.scopeItem.items.length;i++){
            var si = scope.scopeItem.items[i];
            const jscadObj = await convertToJSCAD(si);
            if (jscadObj != null) {
                var objs = jscadObj.length?jscadObj:[jscadObj];
                for(var i=0;i<objs.length;i++){
                    const rawData = objSerializer.serialize({}, objs[i]);
                    const blob = new Blob(rawData);
                    glViewer.updateBlobObj(blob);
                }
                
            }
        }
       

        statusBar.setStatus(`render completed`, "info", 0);
    } catch (e) {
        console.log(e);
        statusBar.logError(e);
    }

}


export function newFileAction() {

}