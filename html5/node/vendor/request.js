/**
 * @fileoverview Http request
 * @author wliao <wliao@Ctrip.com> 
 */
var http = require('http');
var _ = require('underscore');
var url = require('url');
var isDebug = process.env.NODE_ENV === 'development';
var util = require('util');

function request (arg, callback) {
  var options = {
    method: 'GET',
    cache: false,
    headers: {}
  };
  if (_.isString(arg)) arg = { url: arg };
  var requestUrl = url.parse(arg.url);

  _.extend(options, arg, {
    hostname: requestUrl.hostname,
    port: requestUrl.port,
    path: requestUrl.path
  });

  switch (options.method) {
    case 'POST':
      post(options, callback); break;
    default:
      get(options, callback);
  }
}

function get(options, callback) {
  options.headers['x-forward-from'] = 'NET_V8_H5_SEO';

  http.get(options, function(res) {
    var body = '';
    var statusCode = res.statusCode;
    var location = res.headers.location;

    if (statusCode >= 300 && statusCode < 400 && location) {
      return request(location, callback);
    }

    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      callback(null, res, body);
    });

  }).on('error', function(e) {
    callback(e.message);
  });
}

function post(options, callback) {
  var data = options.data || '';

  _.extend(options.headers, {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  });

  var cb = function(err, res, body) {
    if (isDebug) {
      var debugTxt = _.extend({ data: data }, options);
      var response;

      if (err) {
        response = err;
      }  else if (res.statusCode != 200) {
        response = res.statusCode;
      } else {
        response = body;
      }

      debugTxt.response = response;
      debugTxt.data = JSON.parse(debugTxt.data);
      
      console.log(util.inspect(debugTxt, {
        depth: 4,
        colors: true
      }));
    }

    callback.apply(null, arguments);
  };

  var req = http.request(options, function(res) {
    var body = '';

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        body += chunk;
    });

    res.on('end', function() {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
      cb(null, res, body);
    });
  });

  req.on('error', function(e) {
    cb(e.message);
  });

  req.write(data);
  req.end();
}

module.exports = request;