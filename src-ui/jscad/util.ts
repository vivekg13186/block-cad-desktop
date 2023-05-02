import { scope } from "./Scope";
import { codeGenerator } from "./blocks";
import mozjexl from 'mozjexl';
import * as jk from "@jscad/core";


export async function getValue(block,name:string){
    return await mozjexl.eval(block.getFieldValue(name),scope.scopeItem.ctx);
}


export async function getArgs(block,args){
    var result = {};
    for(var i=0;i<args.length;i++){
        var a = args[i];
        result[a]=await mozjexl.eval(block.getFieldValue(a),scope.scopeItem.ctx);
    }
    return result;
}
 
export function parseVec3or2(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 3 || v.length==2) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0, 0];
}

export function parseBoolean(txt) {
   
 
         return txt==="true"?true:false;
        
   
} 
export function parseVec3(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 3) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0, 0];
}
export function parseVec2(txt) {
    try {
        var v = JSON.parse(txt);
        if (v.length == 2) {
            return v;
        }
    } catch (e) {
      console.log(e);
    }
    return [0, 0];
}
export function parseNum(txt) {
    try {
        var v = JSON.parse(txt);
        return Number(v);
    } catch (e) {
        console.log(e);
    }
    return 0;
}


export function generateStatements(block){
        scope.newScope();
        codeGenerator.statementToCode(block, "statements");
        var args = scope.scopeItem.items;
        scope.popScope();
       return args;
}