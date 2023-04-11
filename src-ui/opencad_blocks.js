import Blockly from 'blockly';

function title(b, t) {
    b.appendDummyInput().appendField(t);
}

function numberInput(b, title, field) {
    b.appendValueInput(field)
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(title);
}
//[["radius","r"], ["diameter","d"]]
function dropDown(b, data, field) {
    b.appendField(new Blockly.FieldDropdown(data), field);
}

function init_block_1(b){
    b.setPreviousStatement(true, null);
    b.setNextStatement(true, null);
    b.setColour(230);
}
Blockly.Blocks['cube_1'] = {
    init: function () {
        init_block_1(this);
        title(this, "Cube");
        numberInput(this,"Size","size");
    }
}
Blockly.Blocks['circle_1'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Circle");
        this.appendValueInput("NAME")
            .setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["radius", "r"], ["diameter", "d"]]), "NAME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#circle");
    }
};

Blockly.Blocks['circle_2'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Circle");
        this.appendValueInput("type")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldDropdown([["radius", "r"], ["diameter", "d"]]), "type");
        this.appendValueInput("$fa")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fa");
        this.appendValueInput("$fs")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fs");
        this.appendValueInput("$fn")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fn");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#circle");
    }
};

Blockly.Blocks['square'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Square");
        this.appendValueInput("size")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("size");
        this.appendValueInput("center")
            .setCheck("Boolean")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("center");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#square");
    }
};

Blockly.Blocks['sphere_1'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Sphere");
        this.appendValueInput("value")
            .setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["radius", "r"], ["diameter", "d"]]), "type");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['sphere_2'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Sphere");
        this.appendValueInput("type")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldDropdown([["radius", "r"], ["diameter", "d"]]), "type");
        this.appendValueInput("$fa")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fa");
        this.appendValueInput("$fs")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fs");
        this.appendValueInput("$fn")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("$fn");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

export function init() {

}