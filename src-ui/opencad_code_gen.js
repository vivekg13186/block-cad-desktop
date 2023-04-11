import  {Interpreter}  from "./interpreter";
import { javascriptGenerator } from 'blockly/javascript';

function getNumVal(b,prop){
    return javascriptGenerator.valueToCode(b,prop, javascriptGenerator.ORDER_MEMBER);
}
javascriptGenerator['sphere_1'] = function (block) {
    var r_or_d = block.getFieldValue('type');
    var value = getNumVal(block,'value');
    var code = `sphere_1('${r_or_d}',${value});\n`;
    return code;
};

javascriptGenerator['cube_1'] = function (block) {
     
    var value = getNumVal(block,'size', javascriptGenerator.ORDER_MEMBER);
    var code = `cube_1(${value});\n`;
    return code;
};

 

function addFunc(name, func, i, g) {
    i.setProperty(g, name, i.createNativeFunction(func));
}

 
export function generate_code(js) {
    var code = [];
    var init_gen = function (i, g) {
        i.setProperty(g, "code", code);
        addFunc('sphere_1',  function (r, v) {code.push(`sphere(${r}=${v});`);}, i, g);
        addFunc('cube_1',  function (s) {code.push(`cube(size=${s});`);}, i, g);
    }
    var myInterpreter = new Interpreter(js, init_gen);
    myInterpreter.run();
    console.log("js",js);
    console.log("openscad",code.join("\n"));
    return code.join("\n");
}
