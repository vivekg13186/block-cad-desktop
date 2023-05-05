import { save, open } from "@tauri-apps/api/dialog";
import { invoke } from '@tauri-apps/api/tauri'

export async function saveToFile(filename: string, data: string) {
   // console.log("saveToFile",filename,data);
    if(filename && data)
        await invoke('write_file',{"filepath":filename ,content : data});
}



export async function exportSaveFilePath(){
    return await save({
        title: "Export Model",
        filters: [{
            name: "Obj file",
            extensions: ["obj"]
        },{
            name: "STL file",
            extensions: ["stl"]
        }]
    });
}
export async function  saveToNewFile (data:string,defaultPath) {
    const filePath = await save({
        title: "Save B-CAD File",
        filters: [{
            name: "B-CAD file",
            extensions: ["bcad"]
        }],
        defaultPath:defaultPath
    });
   if(filePath){
    await invoke('write_file',{"filepath":filePath ,content : data});
    return filePath;
   }
   return null;

};

export async function openFile (){

    var filepath  = await open({
        title: "Open B-CAD File",
        filters: [{
            name: "B-CAD file",
            extensions: ["bcad"]
        }]
    });
    if(filepath){
        //console.log(filepath);
       var text = await invoke('read_file',{"filepath":filepath});
       console.log(text);
       return { filepath:filepath ,data : text};
    }
    return null;
};