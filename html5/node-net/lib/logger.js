var fs = require('fs');
var _ = require('underscore');
var cwd = process.cwd();

/**
 * @example
 * logger.time('all'); logger.timeEnd('all');
 * logger.time('data:url'); logger.timeEnd('data:url');
 */
function Logger(url) {
  this.url = url;
  this.result = {
    url: url,
    spends: {
      all: 0,
      template: 0                // webapp template
    }
  };
  this._cahce = {};
}

_.extend(Logger.prototype, {
  time: function(key, custom) {
    this._cahce[key] = process.hrtime();
  },
  timeEnd: function(key) {
    var spend = this._cahce[key];

    if (!_.isArray(spend)) return;

    spend = process.hrtime(spend);
    spend = (spend[0] + spend[1] / 1e9) * 1000 + 'ms';

    this._cahce[key] = spend;
  },
  write: function() {
    var result = this.result;

    _.extend(result.spends, this._cahce);
    result = JSON.stringify(result) + '\n';

    // write
    fs.appendFile(cwd + '/var/log/access.log', result);
  }
});

module.exports = Logger;