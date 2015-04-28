var assert = require('assert');
var path = require('path');
var fs = require('fs');
var uglifyCshtml = require('../vendor/uglify-cshtml');
var uglifyHtml = require('../vendor/uglify-html');
var precompile = require('../vendor/precompile-html');

function getPath(filepath) {
  return path.join(__dirname, filepath);
}

function readFile(filepath) {
  return fs.readFileSync(getPath(filepath), { encoding: 'utf8' });
}

function writeFile(filepath, data) {
  return fs.writeFileSync(getPath(filepath), data, { encoding: 'utf8' });
}

describe('min', function() {
  it('cshtml min', function() {
    var html = readFile('demo/index.cshtml');

    writeFile('demo/index.dest.cshtml', uglifyCshtml(html));
  });

  it('Html min', function() {
    var html = readFile('demo/index.html');

    writeFile('demo/index.dest.html', uglifyHtml(html));
  });

  it('Precompile html', function() {
    var html = readFile('demo/index.html');

    writeFile('demo/index.dest.js', precompile(html));
  });
});