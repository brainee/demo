/**
 * @fileoverview Program entry for signal process
 * @author wliao <wliao@Ctrip.com>
 * @example
 * node grunt.app.js   
 */
var express = require('express');
var app = express();
var compression = require('compression');
var env = process.env.NODE_ENV || 'production';
var config = require('./var/config');
var url = require('url');
var parser = require('./lib/parser.old');
var request = require('ajax-request');
var RequestDatas = require('./lib/request-datas');
var Logger = require('./lib/logger');


app.use(compression());



// Main router for seo parser.
app.get(/^\/html5\/([\s\S]+)$/, function(req, res) {
  var pathname = '/html5/' + req.params[0];
  var webapp = config.webapp;
  var webappUrl = url.format({
    protocol: webapp.protocol,
    host: webapp.host,
    pathname: pathname,
    query: req.query
  });

  webappUrl = parser.LizardUrlMapping('prd', webappUrl);

  var logger = new Logger(webappUrl);

  logger.time('all');
  logger.time('template');
  request({
    url: webappUrl,
    method: 'GET',
    headers: {
      'X-Forward-From': 'NET_V8_H5_SEO'
    }
  }, function(err, response, body) {
    logger.timeEnd('template');
    if (err) return res.send(err);

    new RequestDatas(webappUrl, body, function() {
      logger.time('render');
      var html = parser.LizardRender(webappUrl, body, this.datas);
      logger.timeEnd('render');
      logger.timeEnd('all');
      logger.write();
      res.send(html);
    }, logger);
  });

});

// Forward ‘/webapp/’ router
app.get(/^\/webapp\/([\s\S]+)$/, function(req, res) {
  var pathname = '/webapp/' + req.params[0];
  var webapp = config.webapp;
  var webappUrl = url.format({
    protocol: webapp.protocol,
    host: webapp.host,
    pathname: pathname,
    query: req.query
  });
  var isStatic = (/\.(css|js|png|gif|jpg)$/).test(pathname);

  if (isStatic) {
    return res.redirect(webappUrl);
  }

  request(webappUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      res.send(error);
    }
  });
});

// 404静态文件处理
/*app.use(function(req, res, next) {
  var url = req.url;
  console.log('http://localhost' + url);
  res.redirect(301, 'http://localhost' + url);
});*/

var port = process.env.PORT || config.nodePort;
app.listen(port);
console.log('app started on port '+ port);