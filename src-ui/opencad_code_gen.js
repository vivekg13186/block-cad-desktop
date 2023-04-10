import  {Interpreter}  from "./interpreter";
import { javascriptGenerator } from 'blockly/javascript';

javascriptGenerator['sphere_1'] = function (block) {
    var r_or_d = block.getFieldValue('type');
    var value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_MEMBER);
    var code = `sphere_1('${r_or_d}',${value});\n`;
    return code;
};

javascriptGenerator['cube'] = function (block) {
    var r_or_d = block.getFieldValue('type');
    var value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_MEMBER);
    var code = `sphere_1('${r_or_d}',${value});\n`;
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
    }
    var myInterpreter = new Interpreter(js, init_gen);
    myInterpreter.run();
    console.log("js",js);
    console.log("openscad",code.join("\n"));
    return code.join("\n");
}
