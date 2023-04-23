import { CodeGenerator } from "blockly";

export const codeGenerator = new CodeGenerator('OpenSCAD');
codeGenerator.scrub_ = function (block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        return code + '\n' + codeGenerator.blockToCode(nextBlock);
    }
    return code;
};

function getCommandName(text) {
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
export class Command {
    constructor(id, txt, color) {
        this.id = id;
        this.txt = txt;
        this.color = color;
        this.name = getCommandName(txt);
        this.args = getArgs(txt);
        this.containsStatement = this.args.filter(i => i.type == "statement").length > 0;
    }

    noOfFields() {
        if (this.containsStatement) {
            return this.args.length - 1;
        }
        return this.args.length;
    }
    getBlockJSON() {
        var message = [];
        //title
        message.push(`${this.name} `);
        var ba = [];
        //one less if ststment
        var len = this.containsStatement ? this.args.length - 1 : this.args.length;
        for (var i = 0; i < len; i++) {
            var v = this.args[i];
            message.push(` ${v.name} %${i + 1}    `);
            ba.push({ "type": "field_input", "name": v.name, "text": v.type });
        }
        len += 1;
        if (this.containsStatement) {
            message.push(`  %${len++} %${len++} `);
            ba.push({ "type": "input_dummy" });
            ba.push({ "type": "input_statement", "name": "statements", });
        }
        var base = {
            "type": this.id,
            "message0": message.join(" "),
            "args0": ba,
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": this.color,
            "tooltip": "",
            "helpUrl": ""
        };

        this.setupCodeGen();
        return base;
    }

    getForStatement(block) {
        var params = []
        for (var i = 0; i < this.noOfFields(); i++) {
            var a = this.args[i];
            var value = block.getFieldValue(a.name);
            params.push(`${value}`);
        }
        var v = params.shift();
        var body = codeGenerator.statementToCode(block, "statements");
        return `for(${v}=[${params.join(":")}]){ ${body} }`;
    }
    setupCodeGen() {
        var self = this;
        codeGenerator[this.id] = function (block) {
            var params = [];
            var body = "";
            if (self.name == "for") {
                return self.getForStatement(block);
            }
            else if (self.name == "translate" || self.name == "mirror" || self.name == "rotate") {
                for (var i = 0; i < self.noOfFields(); i++) {
                    var a = self.args[i];
                    var value = block.getFieldValue(a.name);
                    params.push(`${value}`);
                }
                params = "[" + params.join(",") + "]";
            } else {
                for (var i = 0; i < self.noOfFields(); i++) {
                    var a = self.args[i];
                    var value = block.getFieldValue(a.name);
                    params.push(`${a.name}=${value}`);
                }
                params = params.join(",");
            }

            if (self.containsStatement) {
                body = codeGenerator.statementToCode(block, "statements");
                return `${self.name}(${params}) \n{ ${body} } \n;`
            }

            return `${self.name}(${params});`
        }
    }

}

export const commands = {};

import blocks_def from "./blocks.yaml";
import base_blocks from "./base_blocks.json";
import base_tools from "./base_tools.json";

var colors = [

    //"rgb(227, 201, 170)",
    "rgb(244, 147, 75)",
    "rgb(188, 148, 94)",
    "rgb(173, 182, 85)",
    "rgb(200, 146, 48)",
    "rgb(27, 158, 119)",
    "rgb(217, 95, 2)",
    "rgb(117, 112, 179)",
    "rgb(231, 41, 138)",
    "rgb(102, 166, 30)",
    "rgb(230, 171, 2)",
    "rgb(166, 118, 29)",
    "rgb(102, 102, 102)"];
export function generate_blocks() {
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
            commands[blk_id] = new Command(blk_id, cat[blk_id], colors[ci]);
            base_blocks.push(commands[blk_id].getBlockJSON());
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

