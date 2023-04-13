import blocks_def from "./blocks.yaml";
import base_blocks from "./base_blocks.json";
import base_tools from "./base_tools.json";

function getName(text) {
    return text.split("(")[0];
}

function getArgs(text) {
    var start = text.indexOf("(");
    var len = text.length;
    var parts = text.substring(start + 1, len - 1).split(",");

    return parts.map(p => {
        var g = p.split(":");
        return { name: g[0], type: g[1] };
    })
}
function createBlockFromText(id, text) {
    var name = getName(text);
    var args = getArgs(text);
    console.log(args);
    var message = [];
    message.push(`${name} %1 `);
    for (var i = 0; i < args.length; i++) {
        var name =(args[i].type=="statement") ?   "":args[i].name;
        message.push(` ${name} %${i + 2}`);
    }
    message = message.join(" ");
    var base = {
        "type": id,
        "message0": message,
        "args0": [],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 105,
        "tooltip": "",
        "helpUrl": ""
    };
    var has_statement = args.filter(v=>v.type=="statement").length>0;
    if(!has_statement){
        base.args0.push({
            "type": "input_dummy"
          });
    }
    args.map(v => {
        if(v.type=="statement"){
            base.args0.push({
                "type": "input_dummy"
              });
            base.args0.push({
                "type": "input_statement",
                "name": v.name,
             
            });
        }else{
           
            base.args0.push({
                "type": "field_input",
                "name": v.name,
                "text": v.type
            });
        }
       
    });
    
    console.log(base);
    return base;
}


var colors = [
    
    //"rgb(227, 201, 170)",
	"rgb(244, 147, 75)",
	"rgb(188, 148, 94)",
	"rgb(173, 182, 85)",
	"rgb(200, 146, 48)"];
export function generate() {
    var ci = 0;
    for (var cat_name in blocks_def) {
        var cat = blocks_def[cat_name];
        var tool = {
            "kind": "category",
            "name": cat_name,
            "colour": colors[ci],
            "contents": []
        }
        for (var blk_id in cat) {
            var blk = createBlockFromText(blk_id, cat[blk_id]);
            blk.colour = colors[ci];
            base_blocks.push(blk);
            tool.contents.push({ "kind": "block", "type": blk_id });
        }
        base_tools.push(tool);
        ci++;
    }

    return {
        blocks: base_blocks,
        toolbox: {
            "kind": "categoryToolbox",
            "contents": base_tools
        }
    };


}