import { Command, scope } from "./Scope";
import * as jscad from "@jscad/modeling";
import * as _ from "lodash";
import { parse, eval } from "expression-eval";
import { degToRad } from "@jscad/modeling/src/utils";

async function evalA(txt) {
    var ast = parse(txt)
    return eval(ast, scope.context);
}

async function evalStatements(st) {
    var result = [];
    if (!st) return;
    for (var i = 0; i < st.length; i++) {
        var s = await convertToJSCAD(st[i]);
        if (s) {
            result.push(s);
        }
    }

    return result;
}
export async function convertToJSCAD(cmd: Command) {


    if (cmd.id == "var") {
        scope.setVar(cmd.args["name"], await evalA(cmd.args["="]));
        return null;
    } else if (cmd.id == "if") {
        var truth = await evalA(cmd.args['condition']);
        if (truth) {
            return await evalStatements(cmd.children);
        }
    } else if (cmd.id == "for") {
        var index_name = cmd.args['var'];
        var start = await evalA(cmd.args['start']);
        var step = await evalA(cmd.args['step']);
        var end = await evalA(cmd.args['end']);
        var result = [];
        for (var i = start; i < end;) {
            scope.setVar(index_name, i);
            result.push(await evalStatements(cmd.children));
            i += step;
        }
        return result;
    }
    var args = {};
    for (var k in cmd.args) {
        args[k] = await evalA(cmd.args[k]);
    }

    console.log(cmd.id, args);
    switch (cmd.id) {
        case "rectangle1":
        case "rectangle2":
            return jscad.primitives.rectangle(args);
        case "square1":
        case "square2":
            return jscad.primitives.square(args);
        case "roundedRectangle1":
        case "roundedRectangle2":
            return jscad.primitives.roundedRectangle(args);
        case "ellipse1":
        case "ellipse2":
            return jscad.primitives.ellipse(args);
        case "circle1":
        case "circle2":
            return jscad.primitives.circle(args);
        case "star1":
        case "star2":
            return jscad.primitives.star(args);
        case "cuboid1":
        case "cuboid2":
            return jscad.primitives.cuboid(args);
        case "cube1":
        case "cube2":
            return jscad.primitives.cube(args);
        case "roundedCuboid1":
        case "roundedCuboid2":
            return jscad.primitives.roundedCuboid(args);
        case "ellipsoid1":
        case "ellipsoid2":
            return jscad.primitives.ellipsoid(args);
        case "sphere1":
        case "sphere2":
            return jscad.primitives.sphere(args);
        case "geodesicSphere":
            return jscad.primitives.geodesicSphere(args);
        case "cylinder1":
        case "cylinder2":
            return jscad.primitives.cylinder(args);
        case "cylinderElliptic":
            return jscad.primitives.cylinderElliptic(args);
        case "roundedCylinder1":
        case "roundedCylinder2":
            return jscad.primitives.roundedCylinder(args);
        case "torus1":
        case "torus2":
            return jscad.primitives.torus(args);
        case "translate":
            return jscad.transforms.translate(args["pos"], ... await evalStatements(cmd.children));
        case "translateX": {
            return jscad.transforms.translateX(args["pos"],... await evalStatements(cmd.children));
        } 
        case "translateY": {
            return jscad.transforms.translateY(args["pos"],... await evalStatements(cmd.children));
        }
        case "translateZ": {
            return jscad.transforms.translateZ(args["pos"],... await evalStatements(cmd.children));
        }
        case "rotate": {
            var v = args["angle"];
            v[0] = degToRad(v[0]);
            v[2] = degToRad(v[1]);
            v[2] = degToRad(v[1]);
            return jscad.transforms.rotate(v, await evalStatements(cmd.children));
        }
        case "rotateX": {
            var v = degToRad(args["angle"]);
            return jscad.transforms.rotateX(v, await evalStatements(cmd.children));
        } case "rotateY": {
            var v = degToRad(args["angle"]);
            return jscad.transforms.rotateY(v, await evalStatements(cmd.children));
        }
        case "rotateZ": {
            var v = degToRad(args["angle"]);
            return jscad.transforms.rotateZ(v, await evalStatements(cmd.children));
        }

        case "scale":
            return jscad.transforms.translate(args["factor"], await evalStatements(cmd.children));
            case "scaleX": {
                return jscad.transforms.scaleX(args["factor"], await evalStatements(cmd.children));
            } 
            case "scaleY": {
                return jscad.transforms.scaleY(args["factor"], await evalStatements(cmd.children));
            }
            case "scaleZ": {
                return jscad.transforms.scaleZ(args["factor"], await evalStatements(cmd.children));
            }
        case "align1":
        case "align2":
            return jscad.transforms.align(args, await evalStatements(cmd.children));
        case "center1":
        case "center2":
            return jscad.transforms.center(args, await evalStatements(cmd.children));
        case "centerX":
            return jscad.transforms.centerX(await evalStatements(cmd.children));
        case "centerY":
            return jscad.transforms.centerY(await evalStatements(cmd.children));
        case "centerZ":
            return jscad.transforms.centerZ(await evalStatements(cmd.children));
        case "mirrorX":
            return jscad.transforms.mirrorX(await evalStatements(cmd.children));
        case "mirrorY":
            return jscad.transforms.mirrorY(await evalStatements(cmd.children));
        case "mirrorZ":
            return jscad.transforms.mirrorZ(await evalStatements(cmd.children));
        case "mirror1":
        case "mirror2":
            return jscad.transforms.mirror(args, await evalStatements(cmd.children));
        case "union":
            return jscad.booleans.union(await evalStatements(cmd.children));
        case "intersect":
            return jscad.booleans.intersect(await evalStatements(cmd.children));
        case "subtract":
            return jscad.booleans.subtract(await evalStatements(cmd.children));
        case "hull":
            return jscad.hulls.hull(await evalStatements(cmd.children));
        case "hullChain":
            return jscad.hulls.hullChain(await evalStatements(cmd.children));
        case "linear_extrude1":
        case "linear_extrude2":
            return jscad.extrusions.extrudeLinear(args, await evalStatements(cmd.children));
        case "rectangular_extrude":
            return jscad.extrusions.extrudeRectangular(args, await evalStatements(cmd.children));
        case "rotate_extrude":
            return jscad.extrusions.extrudeRotate(args, (await evalStatements(cmd.children))[0]);
        case "project":
            return jscad.extrusions.project(args, (await evalStatements(cmd.children))[0]);
        case "expand":
            return jscad.expansions.expand(args, (await evalStatements(cmd.children))[0]);
        case "offset":
            return jscad.expansions.offset(args, (await evalStatements(cmd.children))[0]);

        case "hole":{
            var pos = args["pos"];
            var radius = args["radius"];
            var segments= args["segments"];
            var height = args["height"];
            var parent = (await evalStatements(cmd.children))[0];
            var holes_object= jscad.primitives.cylinder({center:pos,radius:radius,segments:segments,height:height});
            return jscad.booleans.subtract(...[parent,holes_object]);
        }
        case "grid_holes":{
            var pos = args["pos"];
            var radius = args["radius"];
            var segments= args["segments"];
            var height = args["height"];
            var offsetX = args["offsetX"];
            var offsetY = args["offsetY"];
            var rows = args["rows"];
            var cols = args["cols"];
            var parent = (await evalStatements(cmd.children))[0];
            var holes_objects=[]
            for(var r=0;r<rows;r++){
                for(var c = 0;c<cols;c++){
                    var x = c*offsetX;
                    var y = r*offsetY;
                    var cylinder = jscad.primitives.cylinder({center:pos,radius:radius,segments:segments,height:height});
                    var holes = jscad.transforms.translate([x,y,0],cylinder);
                    holes_objects.push(holes);
                }
            }
           
            return jscad.booleans.subtract(...[parent,holes_objects]);
        }
    }
}