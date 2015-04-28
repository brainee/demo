var grunt = require('grunt');
var htmlMinify = require('html-minifier').minify;
var uglifyJs = require('uglify-js');
var uglifyUtil = require('./uglify-util');
var _ = require('underscore');

// bug 压缩后，语句通过换行实现js,没有分号
function filterNotSafe(html) {
  // underscore模板
  html = html.replace(
    /<%([\s\S]+?)%>/g,
    function(match, $1) {
      return uglifyUtil.htmlEscape('<%') + uglifyUtil.htmlEscape(uglifyUtil.trimUnderscore($1)) + uglifyUtil.htmlEscape('%>');
    }
  );

  // 标签里面的加属性
  html = html.replace(
    /<\w("[^"]*"|'[^']*'|[^>'"])+>/g, 
    function(tag) {

      // 引号内的underscore和引号外的
      tag = tag.replace(
        /=\s*("[^"]*"|'[^']*')/g,
        function(match, $1) {
          $1 = $1.replace(/^'/, '"').replace(/'$/, '"');
          $1 = $1.replace(/%3C%/g, '%33CC%').replace(/%%3E/g, '%%33EE');

          return '=' + $1 + '';
        }
      ).replace(
        /%3C%[\s\S]+?%%3E/g,
        function(match) {
          return '_="' + match + '"';
        }
      );

      return tag;
    }
  );

  return html;
}

function rollback(html) {
  html = html.replace(
    /_="(%3C%[\s\S]+?%%3E)"\s*/g,
    function(match, $1) {
      return uglifyUtil.htmlUnescape($1);
    }
  );

  html = html.replace(
    /%3C%[\s\S]+?%%3E/g,
    function(match) {
      return uglifyUtil.htmlUnescape(match);
    }
  );

  html = html.replace(
    /%33CC%([\s\S]+?)%%33EE/g,
    function(match, $1) {
      return '<%' + uglifyUtil.htmlUnescape($1) +'%>';
    }
  );
  return html;
}

function uglify(html, filepath) {
  html = filterNotSafe(html);
  grunt.log.writeln('Running htmlmin ' + filepath);
  try {
    html = htmlMinify(html, {
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeComments: true,
      removeRedundantAttributes: false,
      removeOptionalTags: false,
      minifyJS: true,
      processScripts: ['text/lizard-template', 'text/template'],
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    });
  } catch(e) {
    grunt.fail.fatal(filepath + ' htmlmin出错:\n' + e);
  }
  html = rollback(html);
  return html;
}

module.exports = uglify;