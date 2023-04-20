import { save, open } from "@tauri-apps/api/dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs"

export const saveFile = async (data) => {
  const suggestedFilename = "sample.bcad";


  const filePath = await save({
    title: "Save BCAD File",
    filters:[ {
      name:"B CAD file",
      extensions: ["bcad"]
    }]
  });
  console.log(filePath, data);
  if (filePath && data) {
    await writeTextFile(filePath, data);
  }

};

export const openFile =  (callback) => {

  console.log("open file")
  // Save into the default downloads directory, like in the browser
   open({
    title: "Open BCAD File",
    filters: [{
      name:"B CAD file",
      extensions: ["bcad"]
    }]
  }).then(function(filePath){
    if (filePath) {
      readTextFile(filePath).then(function (value) {
        callback(value);
      });
    }
  })
 

};