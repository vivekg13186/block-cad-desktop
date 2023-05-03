
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::env;
use std::fs;
use std::fs::File;
use std::io::Write;


 

#[tauri::command]
fn read_file(filepath: &str) -> String {
    return fs::read_to_string(filepath)
        .expect("Should have been able to read the file").into()
}

#[tauri::command]
fn write_file(filepath: &str,content: &str) ->String {
    let mut file = File::create(filepath).expect("Error creating file");
    file.write_all(content.as_bytes()).expect("Error writing file");
    format!("OK")
}


fn main() {
    tauri::Builder::default()
         .invoke_handler(tauri::generate_handler![read_file,write_file])
         .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
