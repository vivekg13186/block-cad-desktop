import { save, open } from "@tauri-apps/api/dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs"


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
    await saveToFile(filePath,data);
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
        return { filepath:filepath[0] ,data : await readTextFile(filepath[0])};
    }
    return null;
};