var strip = require('strip-comment');
var uglifyJs = require('uglify-js');

exports.htmlEscape = function(value) {
  return value.replace(/<|>|"|'/g, function(match) {
    return escape(match);
  });
}

exports.htmlUnescape = function(value) {
  return value.replace(/%3C|%3E|%22|%27/g, function(match) {
    return unescape(match);
  });
}

exports.trimUnderscore = function(value) {
  value = value.replace(/^([=-])\s*/, '$1').trim();

  if ('-='.indexOf(value[0]) < 0) {
    try {
      new Function(value);
      value = uglifyJs.minify(value, {
        fromString: true,
        mangle: false,
        compress: false,
        output: {
          semicolons: true
        }
      });
      return value.code;
    } catch (e) {} 
  }
  
  // 散乱的js代码
  value = strip.js(value);
  value = value
           .replace(/\s*\{\s*/g, '{')
           .replace(/\s*\}\s*/g, '}')
           .replace(/\s*([!=]?[>=<]=)\s*/g, '$1')
           .replace(/\s*(&&)\s*/g, '$1');
  return value;
}