var grunt = require('grunt');
var util = require('utils-extend');

function replace(contents, filepath, replaces) {
  replaces.forEach(function(item) {
     if (item.filterFn(filepath)) {
      item.replace.forEach(function(item2) {
        var fn = item2.replacement;

         if (util.isFunction(fn)) {
           fn.filepath = filepath;
           fn.version = grunt.config('version');
           fn.isDebug = grunt.option('debug');

          contents = contents.replace(item2.match, fn.bind(fn));
         } else {
           contents = contents.replace(item2.match, fn);
          }
       });
     }
  });

  return contents;
}

module.exports = replace;