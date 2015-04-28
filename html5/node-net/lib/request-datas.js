var request = require('ajax-request');
var parser = require('./parser.old');
var log = require('./inspect');
var url = require('url');

function RequestDatas(url, body, cb, logger) {
  this.url = url;
  this.body = body;
  this.cb = cb;
  this.datas = {};
  this.logger = logger;
  this.request();
}

RequestDatas.prototype.request = function() {
  var modelsResult = JSON.parse(parser.LizardGetModels(this.url, this.body, this.getModelData()));
  var l = modelsResult.models.length;
  var count = 0;
  var self = this;

  if (l) {
    modelsResult.models.forEach(function(model) {
      var isJson = model.url.match(/\.(?:([^?.]+)\?|([^.]+)$)/);

      if (isJson) {
        if (isJson[1] === 'js' || isJson[2] === 'js') {
          isJson = false;
        } else {
          isJson = true;
        }
      } else {
        isJson = true;
      }

      console.log(self.logger);

      self.logger.time(model.url);
      request({
        url: model.url,
        data: model.postdata,
        json: isJson,
        method: isJson ? 'POST' : 'GET'
      }, function(err, response, data) {
        self.logger.timeEnd(model.url);
        count++;
        if (err) {
          self.datas[model.name] = {};
        } else {
          self.datas[model.name] = data;
        }

        log('Request:');
        log(model);
        log('Response:');
        log(data);

        if (count === l) {
          self.request();
        }
      });
    });
  } else {
    this.cb.call(this);
  }
};

RequestDatas.prototype.getModelData = function() {
  var keys = Object.keys(this.datas);

  if (keys.length) {
    return this.datas;
  } else {
    return null;
  }
};

module.exports = RequestDatas;