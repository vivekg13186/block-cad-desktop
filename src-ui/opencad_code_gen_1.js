const codeGenerator = new Blockly.Generator('OpenSCADGenerator');


sphere1: sphere(r:10)
  sphere2: sphere(d:10)
  sphere3: sphere(r:10,$fa:10,$fs:10,$fn:10)
  sphere4: sphere(d:10,$fa:10,$fs:10,$fn:10)
  cube1: cube(size:10,center:true)
  cylinder1: cylinder(r:10,h:20,center:true)
  cylinder2: cylinder(r1:10,r2:10,h:10,center:true)
  cylinder3: cylinder(r1:10,r2:10,h:10,center:true,$fa:10,$fs:10,$fn:10)


codeGenerator['sample_block'] = function(block) {
    var r =  block.getFieldValue('r');
    return 'sphere(r=r';
  }