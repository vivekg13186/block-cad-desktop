import { Command } from "./Scope";
import * as jscad from "@jscad/modeling";
import * as _ from "lodash"

function evalA(txt) {
    return JSON.parse(txt);
}

function evalStatements(st) {
    var result = [];
    if (!st) return;
    st.map(s => {
        result.push(convertToJSCAD(s));
    })
    return result;
}
export function convertToJSCAD(cmd: Command) {
    var args = {};
    _.forEach(cmd.args, function (v, key) {
        args[key] = evalA(v);
    })

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
        case "transform":
            return jscad.transforms.translate(args["pos"], evalStatements(cmd.children));
        case "rotate":
            return jscad.transforms.translate(args["angle"], evalStatements(cmd.children));
        case "scale":
            return jscad.transforms.translate(args["factor"], evalStatements(cmd.children));
        case "align1":
        case "align2":
            return jscad.transforms.align(args, evalStatements(cmd.children));
        case "center1":
        case "center2":
            return jscad.transforms.center(args, evalStatements(cmd.children));
        case "centerX":
            return jscad.transforms.centerX(evalStatements(cmd.children));
        case "centerY":
            return jscad.transforms.centerY(evalStatements(cmd.children));
        case "centerZ":
            return jscad.transforms.centerZ(evalStatements(cmd.children));
        case "mirrorX":
            return jscad.transforms.mirrorX(evalStatements(cmd.children));
        case "mirrorY":
            return jscad.transforms.mirrorY(evalStatements(cmd.children));
        case "mirrorZ":
            return jscad.transforms.mirrorZ(evalStatements(cmd.children));
        case "mirror1":
        case "mirror2":
            return jscad.transforms.mirror(args, evalStatements(cmd.children));
        case "union":
            return jscad.booleans.union(evalStatements(cmd.children));
        case "intersect":
            return jscad.booleans.intersect(evalStatements(cmd.children));
        case "subtract":
            return jscad.booleans.subtract(evalStatements(cmd.children));
        case "hull":
            return jscad.hulls.hull(evalStatements(cmd.children));
        case "hullChain":
            return jscad.hulls.hullChain(evalStatements(cmd.children));
        case "linear_extrude1":
        case "linear_extrude2":
            return jscad.extrusions.extrudeLinear(args, evalStatements(cmd.children));
        case "rectangular_extrude":
            return jscad.extrusions.extrudeRectangular(args, evalStatements(cmd.children));
        case "rotate_extrude":
            return jscad.extrusions.extrudeRotate(args, evalStatements(cmd.children)[0]);
        case "project":
            return jscad.extrusions.project(args, evalStatements(cmd.children)[0]);
        case "expand":
            return jscad.expansions.expand(args, evalStatements(cmd.children)[0]);
        case "offset":
            return jscad.expansions.offset(args, evalStatements(cmd.children)[0]);


    }
}