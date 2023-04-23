 
 
import {primitives} from "@jscad/modeling";
import {objSerializer} from "@jscad/io";
const myshape = primitives.cuboid({size: [1, 2, 3]})
const rawData = objSerializer.serialize({}, myshape)

//in browser (with browserify etc)
const blob = new Blob(rawData);