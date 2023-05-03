import { save, open } from "@tauri-apps/api/dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { invoke } from '@tauri-apps/api/tauri'

export async function saveToFile(filename: string, data: string) {
    await writeTextFile(filename, data);
}

export async function  saveToNewFile (data:string) {
    const filePath = await save({
        title: "Save B-CAD File",
        filters: [{
            name: "B-CAD file",
            extensions: ["bcad"]
        }]
    });
   if(filePath){
    //await saveToFile(filePath,data);
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
        console.log(filepath);
       // return { filepath:filepath[0] ,data : await readTextFile(filepath[0])};
       var text = await invoke('read_file',{"filepath":filepath});
       console.log(text);
       return { filepath:filepath ,data : text};
    }
    return null;
};