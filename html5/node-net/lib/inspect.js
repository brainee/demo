var util = require('util');
var config = require('../var/config');

function log(obj) {
  var result = util.inspect(obj, { 
    showHidden: true,
    colors: true,
    depth: config.log.depth
  }); 

  console.log(result);
}


module.exports = log;