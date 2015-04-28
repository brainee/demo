var grunt = require('grunt');
var uglifyJs = require('uglify-js');
var strip = require('strip-comment');
var _ = require('underscore');

function precompile(html, filepath) {
  grunt.log.writeln('Running precompile html ' + filepath);
  var result = '';
  
  html = strip.html(html);
  try {
    result = _.template(html).source;
  } catch (e) {
    grunt.fail.fatal(filepath + ' 预编译underscore模板出错:\n' + e);
  }   

  result = result.replace('function(', 'function _(');

  try {
    result = uglifyJs.minify(result, {
      fromString: true
    });
  } catch (e) {
    grunt.fail.fatal(filepath + ' 预编译underscore模板出错:\n' + e);
  }

  result = result.code
                 .replace('function _(', 'function(')
                 .replace(/\\n\s*/g, '')
                 .replace(/\\r\s*/g, '');
  result = ' ' + result;

  return result;
}

module.exports = precompile;