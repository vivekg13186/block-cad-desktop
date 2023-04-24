
import { rectangle, square, roundedRectangle, ellipse, circle, polygon, star } from "@jscad/modeling/src/primitives";
import { addBlock, addToolboxCatogery } from "./blocks";
import { stack } from "./eval";
import * as Blockly from "blockly";
import { statusBar } from "../widgets/Statusbar";
import { parseNum, parseVec2 } from "./util";

var toolbox = addToolboxCatogery("Primitive 2D");

function setupBlock(b, name, arg) {
    var di = b.appendDummyInput();

    di.appendField(name)
    arg.map(r => {
        var df = r.length == 2 ? r[1] : "";
        di.appendField(r[0])
            .appendField(new Blockly.FieldTextInput(df), r[0]);
    })
    b.setInputsInline(true);
    b.setPreviousStatement(true, null);
    b.setNextStatement(true, null);
    b.setColour(toolbox.colour);
    b.setTooltip("");
    b.setHelpUrl("");
}


//rectangle({size: [3, 4]})
toolbox.contents.push({ "kind": "block", "type": "rectangle1" });
addBlock("rectangle1", {
    init: function () {
        var arg = [["size", "[3, 4]"]];
        setupBlock(this, "Rectangle", arg);
    }
}, function (block) {
    try {
        var size = parseVec2(block.getFieldValue("size"));
        stack.push(rectangle({ size: size }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});

//rectangle({size: [3, 4], center: [5, 5]})
toolbox.contents.push({ "kind": "block", "type": "rectangle2" });
addBlock("rectangle2", {
    init: function () {
        var arg = [["size", "[3, 4]"], ["center", "[5, 5]"]];
        setupBlock(this, "Rectangle", arg);
    }
}, function (block) {
    try {
        var size = parseVec2(block.getFieldValue("size"));
        var center = parseVec2(block.getFieldValue("center"));
        stack.push(rectangle({ size, center }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});

//square({size: 3})
toolbox.contents.push({ "kind": "block", "type": "square1" });
addBlock("square1", {
    init: function () {
        var arg = [["size", "3"]];
        setupBlock(this, "Square", arg);
    }
}, function (block) {
    try {
        var size = parseNum(block.getFieldValue("size"));
        stack.push(square({ size }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//square({size: 3, center: [5, 5]}
toolbox.contents.push({ "kind": "block", "type": "square2" });
addBlock("square2", {
    init: function () {
        var arg = [["size", "3"], ["center", "[5, 5]"]];
        setupBlock(this, "Square", arg);
    }
}, function (block) {
    try {
        var size = parseNum(block.getFieldValue("size"));
        var center = parseVec2(block.getFieldValue("center"));
        stack.push(square({ size, center }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});

//roundedRectangle({size: [10, 20], roundRadius: 2})
toolbox.contents.push({ "kind": "block", "type": "roundedRectangle1" });
addBlock("roundedRectangle1", {
    init: function () {
        var arg = [["size", "[10, 20]"]];
        setupBlock(this, "Rounded Rectangle", arg);
    }
}, function (block) {
    try {
        var size = parseVec2(block.getFieldValue("size"));
        stack.push(roundedRectangle({ size }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//roundedRectangle({size: [10, 20], roundRadius: 2, center: [5, 5], segments: 64})
toolbox.contents.push({ "kind": "block", "type": "roundedRectangle2" });
addBlock("roundedRectangle2", {
    init: function () {
        var arg = [["size", "[10, 20]"], ["roundRadius", "2"], ["center", "[5, 5]"], ["segments", "64"]];
        setupBlock(this, "Rounded Rectangle", arg);
    }
}, function (block) {
    try {
        var size = parseVec2(block.getFieldValue("size"));
        var roundRadius = parseNum(block.getFieldValue("roundRadius"));
        var center = parseVec2(block.getFieldValue("center"));
        var segments = parseNum(block.getFieldValue("segments"));
        stack.push(roundedRectangle({ size, roundRadius, center, segments }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//ellipse({radius: [5, 10]})
toolbox.contents.push({ "kind": "block", "type": "ellipse1" });
addBlock("ellipse1", {
    init: function () {
        var arg = [["radius", "[5, 10]"]];
        setupBlock(this, "Ellipse", arg);
    }
}, function (block) {
    try {
        var radius = parseVec2(block.getFieldValue("size"));
        stack.push(ellipse({ radius }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//ellipse({radius: [5, 10], center: [5, 5], startAngle: Math.PI / 2, endAngle: Math.PI, segments: 64})
toolbox.contents.push({ "kind": "block", "type": "ellipse2" });
addBlock("ellipse2", {
    init: function () {
        var arg = [["radius", "[5, 10]"]
            , ["center", "[5, 5]"]
            , ["startAngle", "1.57"]
            , ["endAngle", "1.5"]
            , ["segments", "64"]
        ];
        setupBlock(this, "Ellipse", arg);
    }
}, function (block) {
    try {
        var radius = parseVec2(block.getFieldValue("size"));
        var center = parseVec2(block.getFieldValue("center"));
        var startAngle = parseNum(block.getFieldValue("startAngle"));
        var endAngle = parseNum(block.getFieldValue("endAngle"));
        var segments = parseNum(block.getFieldValue("segments"));
        stack.push(ellipse({ radius ,center,startAngle,endAngle,segments}));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//circle({radius: 10})
toolbox.contents.push({ "kind": "block", "type": "circle1" });
addBlock("circle1", {
    init: function () {
        var arg = [["radius", "[5, 10]"]];
        setupBlock(this, "Circle", arg);
    }
}, function (block) {
    try {
        var radius = parseVec2(block.getFieldValue("size"));
        stack.push(circle({ radius }));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//circle({radius: 10, center: [5, 5], startAngle: Math.PI / 2, endAngle: Math.PI, segments: 64})
toolbox.contents.push({ "kind": "block", "type": "circle2" });
addBlock("circle2", {
    init: function () {
        var arg = [["radius", "[5, 10]"]
            , ["center", "[5, 5]"]
            , ["startAngle", "1.57"]
            , ["endAngle", "1.5"]
            , ["segments", "64"]
        ];
        setupBlock(this, "Circle", arg);
    }
}, function (block) {
    try {
        var radius = parseVec2(block.getFieldValue("size"));
        var center = parseVec2(block.getFieldValue("center"));
        var startAngle = parseNum(block.getFieldValue("startAngle"));
        var endAngle = parseNum(block.getFieldValue("endAngle"));
        var segments = parseNum(block.getFieldValue("segments"));
        stack.push(circle({ radius ,center,startAngle,endAngle,segments}));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//polygon({ points: [ [0,0],[3,0],[3,3] ] })
//star({vertices: 8, outerRadius: 10}) // star with 8/2 density
toolbox.contents.push({ "kind": "block", "type": "star1" });
addBlock("star1", {
    init: function () {
        var arg = [["vertices", "8"], ["outerRadius", "10"]];
        setupBlock(this, "Star", arg);
    }
}, function (block) {
    try {
        var vertices = parseNum(block.getFieldValue("startAngle"));
        var outerRadius = parseNum(block.getFieldValue("endAngle"));
       
        stack.push(star({ vertices,outerRadius}));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});
//star({vertices: 12, outerRadius: 40, innerRadius: 20}) // star with given radius
toolbox.contents.push({ "kind": "block", "type": "star1" });
addBlock("star1", {
    init: function () {
        var arg = [["vertices", "8"], ["outerRadius", "10"],["innerRadius", "20"]];
        setupBlock(this, "Star", arg);
    }
}, function (block) {
    try {
        var vertices = parseNum(block.getFieldValue("startAngle"));
        var outerRadius = parseNum(block.getFieldValue("endAngle"));
        var innerRadius = parseNum(block.getFieldValue("innerRadius"));
        stack.push(star({ vertices,outerRadius,innerRadius}));
    } catch (e) {
        statusBar.logError(e);
    }

    return "";
});