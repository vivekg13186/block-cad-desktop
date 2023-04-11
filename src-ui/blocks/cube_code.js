function getProperty(block,props){
  var result ={};
   props.map(p=>{
    var v  = Blockly.JavaScript.valueToCode(block, p, Blockly.JavaScript.ORDER_ATOMIC);
    result[p]=v;
  });
  return result;
}


Blockly.JavaScript['cube'] = function(block) {
  var props = getProperty(block,['length','width','height','center']);
  
  return code;
};