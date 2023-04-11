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
    message.push(`${name} %1`);
    for (var i = 0; i < args.length; i++) {

        message.push(`${args[i].name} %${i + 2}`);

    }
    message = message.join(" ");
    var base = {
        "type": id,
        "message0": message,
        "args0": [
            {
                "type": "input_dummy"
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 105,
        "tooltip": "",
        "helpUrl": ""
    };
    args.map(v => {
        base.args0.push({
            "type": "input_value",
            "name": v.name,
            "check": v.type
        });
    });
    console.log(base);
    return base;
}


var colors = ["#4C4DAD", "#6162FA", "#EFFA55", "#AD2A98", "#FA48DD"]
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
            blk.color = colors[ci];
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