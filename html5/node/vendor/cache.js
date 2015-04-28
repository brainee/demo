var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var path = require('path');

function mkdirSync(src) {
  try {
    fs.mkdirSync(src);
  } catch(e) {
    if (e.code == 'ENOENT') {
      mkdirSync(path.dirname(src));
      mkdirSync(src);
    }
  }
}

function writeFile(src, data, callback) {
  var root = path.dirname(src);

  mkdirSync(root);
  
  fs.writeFile(src, data, callback);
}

function Cache(key) {
  var dirname = path.dirname(key);
  var basename = path.basename(key);
  var channelMatch = dirname.match(/\/webapp\/([^\.]+)/);
  var channel;

  if (channelMatch) {
    channel = channelMatch[1];
  } else {
    channel = 'common';
  }

  this.fileSrc = path.join(process.cwd(), 'var/cache', channel, basename);
}

Cache.prototype.set = function(data) {
  if (_.isObject(data)) {
    data = JSON.stringify(data);
  }

  writeFile(this.fileSrc, data);
};

Cache.prototype.get = function() {
  var data;

  try {
    data = fs.readFileSync(this.fileSrc, {
      encoding: 'utf8'
    });
  } catch(e) {
    data = null;
  }

  return data;
};

module.exports = Cache;