import { BlocklyEditor } from "./BlockEditor";
import { saveToFile, saveToNewFile, openFile, exportSaveFilePath } from "./file";
import { objSerializer,stlSerializer } from "@jscad/io"


import { statusBar } from "./widgets/Statusbar";
import { GLViewer } from "./gl/GLViewer";
import { scope } from "./jscad/Scope";
import { convertToJSCAD } from "./jscad/command2jscad";

var current_filename: string | null = null;

var blockEditor: BlocklyEditor;
var glViewer: GLViewer;



function printScope(){
    scope.scopeItem.items.map(si => {
        console.log(si.toJSON());
    })
}
export function initAction(be: BlocklyEditor, gv: GLViewer) {
    glViewer = gv;
    blockEditor = be;
}

export function saveFileAction(code: string) {
    if (current_filename) {
        saveToFile(current_filename, code).then(function () {
            statusBar.setStatus(`${current_filename} saved`, "info", 0);
        }).catch(function (e) {
            statusBar.setStatus(`Error while saving file`, "error", 0);
        });
    } else {
        saveToNewFile(code).then(function (filename) {
            if (filename) {
                current_filename = filename;
                statusBar.setStatus(`${current_filename} saved`, "infoe", 0);
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
            statusBar.setStatus(`${current_filename} saved`, "info", 0);
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

async function convertToSTL(){
    blockEditor.generateCode();
    var jscadObjs = [];
    for(var i=0;i< scope.scopeItem.items.length;i++){
        var si = scope.scopeItem.items[i];
        const jscadObj = await convertToJSCAD(si);
        if (jscadObj != null) {
             jscadObjs.push(jscadObj);
        }
    }
    return stlSerializer.serialize({binary:false},...jscadObjs).join("\n");
}

async function convertToOBJ(){
    blockEditor.generateCode();
    var jscadObjs = [];
    for(var i=0;i< scope.scopeItem.items.length;i++){
        var si = scope.scopeItem.items[i];
        const jscadObj = await convertToJSCAD(si);
        if (jscadObj != null) {
             jscadObjs.push(jscadObj);
        }
    }
    return objSerializer.serialize({triangulate:true},...jscadObjs)[0];
}

export  async function exportFile() {
    try{
        printScope();
        var filepath = await exportSaveFilePath();
        if(filepath){
            if(filepath.endsWith(".obj")){
                var code  = await convertToOBJ();
                saveToFile(filepath,code);
                statusBar.setStatus(`Model exported to ${filepath}`, "info", 0);
            }else if(filepath.endsWith(".stl")){
                var code = await convertToSTL();
                saveToFile(filepath,code);
                statusBar.setStatus(`Model exported to ${filepath}`, "info", 0);
            }
        }
    }catch(e){
        statusBar.setStatus(`Error while exporting to file ${filepath} : ${e}`, "error", 0);
    };
}
 
export  async function renderAction() {

    try {
        scope.reset();
        glViewer.clearScene();
        blockEditor.generateCode();
        var code  = await convertToOBJ();
        glViewer.updateBlobObj(code);
        statusBar.setStatus(`render completed`, "info", 0);
    } catch (e) {
        console.log(e);
        statusBar.logError(e);
    }

}


 