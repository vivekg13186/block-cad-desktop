import { Command } from '@tauri-apps/api/shell'
import { tempdir } from '@tauri-apps/api/os';
import { writeTextFile,readTextFile,BaseDirectory } from '@tauri-apps/api/fs';
import { join,desktopDir } from '@tauri-apps/api/path';


const scad_location = "/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD"


export async function  compile_to_stl(openscad_code) {
    const root = await desktopDir();
    //write code  to temp dir
    await writeTextFile('request_1234.scad', openscad_code, { dir: BaseDirectory.Desktop });
    var file_input =await join(root,"request.scad");
    console.log(file_input);
    var file_output = await join(root,"response.stl");
    console.log(file_output);
    //execute command
    const command = new Command("run-openscad",[file_input,"-o",file_output]);


    command.on('close', data => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`)
    });
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
    
    const child = await command.spawn();
    const contents = await readTextFile('response.stl', { dir:  BaseDirectory.Desktop  });
    return contents;
    

    
}