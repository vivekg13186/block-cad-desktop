import { save } from "@tauri-apps/api/dialog";
import {writeTextFile} from "@tauri-apps/api/fs"

export const saveFile = async (data) => {
  const suggestedFilename = "sample.bcad";

  // Save into the default downloads directory, like in the browser
  const filePath = await save();

  // Now we can write the file to the disk
  await writeTextFile(filePath, data);
};