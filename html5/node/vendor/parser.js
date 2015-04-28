/**
 * @fileoverview lizard2.0 SEO生成程序
 * @author wliao <wliao@Ctrip.com> 
 */
var request = require('./request');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var url = require('url');
var config = require('../var/config');
var cheerio = require('cheerio');
var Lizard = require('./lizard');

/**
 * @description 对外转化接口
 */
function Parser(webappUrl, callback) {
  var self = this;

  this.url = webappUrl;
  this.callback = callback;
  this.location = url.parse(webappUrl, true);
  this.pdJs = '';

  request({
    url: this.url
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    }

    var statusCode = response.statusCode;

    if (statusCode == 200) {
      self.body = body;
      self.render();
    } else if (statusCode >= 400 && statusCode < 500) {
      var templateSrc = path.join(process.cwd(), 'views/error.html');
      
      fs.readFile(templateSrc, {
        encoding: 'utf8'
      }, callback);
    } else {
      callback(null, body);
    }
  });
}

Parser.prototype.render = function() {
  var self = this;
  var $ = cheerio.load(this.body, {
    decodeEntities: false
  });
  var filter = $('script[pd_init=1]');

  if (filter.length) {
    var src = filter.attr('src');

    if (/^\/webapp/.test(src)) {
      src = this.location.protocol + '//' + this.location.host + src;
    }

    request(src, function(error, res, body) {
      if (!error && res.statusCode == 200) {
        self.pdJs = body;
      }
      new Lizard($, self);
    });
  } else {
    new Lizard($, this);
  }
};

module.exports = function(url, callback) {
  new Parser(url, callback);
};