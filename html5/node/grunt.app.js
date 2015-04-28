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
var parser = require('./vendor/parser');
var config = require('./var/config');
var url = require('url');
var request = require('./vendor/request');
var fs = require('fs'); 

app.use(compression());

// Get html5 program log.
// app.get('/html5/logger', function(req, res) {
//   var txt = fs.readFileSync(__dirname + '/access.log', {
//     encoding: 'utf8'
//   });

//   res.send(txt);
// });

// Main router for seo parser.
app.get(/^\/html5\/([\s\S]+)$/, function(req, res) {
  var pathname = '/webapp/' + req.params[0];
  var webapp = config.webapp;
  var webappUrl = url.format({
    protocol: webapp.protocol,
    host: webapp.host,
    pathname: pathname,
    query: req.query
  });

  parser(webappUrl, function(error, html) {
    if (error) {
      res.send(error);
    } else {
      res.send(html);
    }
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