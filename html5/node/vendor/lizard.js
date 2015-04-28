var _ = require('underscore');
var localStorage = {
  setItem: _.noop,
  getItem: function(){ return ''; }
};
// 减少全局变量污染, vm的性能不如eval
var __util = {
  S4: function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  },
  modelStringify: function(obj) {
    var value;

    for (var key in obj) {
      value = obj[key];
      if (_.isFunction(value)) {
        obj[key] = value.toString();
      } else if (_.isObject(value)) {
        __util.modelStringify(value);
      }
    }

    return JSON.stringify(obj);
  },
  // Parse url schema to regular.
  pathtoRegexp: function(url) {
    var nameReg =  /\{([\w-]+)\}/g;
    var keys = [];

    url = url
      .replace(/([\/\.])/g, '\\$1')
      .replace(/\{\{(.+?)\}\}/g, function($1, $2) {
        var ret = $2.match(/\((\w+)\)(.+)/);
        var reg, type;

        if (ret) {
          type = ret[1];
          keys.push(ret[2]);
        }

        switch (type) {
          case 'number':
            reg = '(\\d+(?:\\.\\d+)?|\\.\\d+)';
            break;
          case 'int':
            reg = '(\\d+)';
            break;
          case 'letter':
            reg = '([a-z-_\\$]+)';
            break;
          default:
            reg = '([^\/]*)';
        }

        return reg;
      })
      .replace(nameReg, function($1, $2) {
        keys.push($2);
        return '([^\\/]+)';
      });

    return {
      keys: keys,
      reg: new RegExp(url, 'i')
    };
  },
  extend: function(target, source) {
    var value;

    for (var key in source) {
      value = source[key];
      if (_.isArray(value)) {
        target[key] = value;
      } else if (typeof value == 'object' && source !== null) {
        if (!_.isObject(target[key])) {
          target[key] = {};
        }
        __util.extend(target[key], value);
      } else if (value !== undefined) {
        target[key] = value;
      }
    }

    return target;
  },
  request: require('./request')
};

function Lizard($, parser) {
  this.$ = $;
  this.parser = parser;
  this._init();
}

Lizard.prototype._init = function() {
  var $ = this.$;
  var location = this.parser.location;
  var pdJs = this.parser.pdJs;

  this._cache = {
    query: {},
    pageConfig: {},
    ajax: {},
    // ajax数据集合
    ajaxDatas: []
  };


  function getUrlSchme() {
    var txt = $('script[type="text/lizard-config"]').text() || '';
    var match = txt.match(/url_schema['"]?\s*:\s*['"]([^'"]+)['"][\n\S]?,/);

    if (match) {
      match = match[1];
      return [match];
    } else {
      match = txt.match(/url_schema['"]?\s*:\s*\[([\s\S]+?)\][\n\S]?,/);

      if (match) {
        match = match[1].replace(/['"]\s*|\s*['"]/g, '').split(',');
        return match;
      }
    }

    return [];
  }

  function getPageConfig() {
    var Lizard = this;
    var _config = $('script[type="text/lizard-config"]').text() || '{}';
    var _defaults = {
      url_schema: location.pathname,
      model: {
        apis: [],
        setTDK: _.noop,
        filter: _.noop
      },
      view: {
        header: '',
        viewport: ''
      }
    };
    var _ret;

    try {
      eval(
        pdJs + 
        '\n_ret = ' + _config.trim()
      );
    } catch (e) {
      console.log(e);
      _ret = {};
    }

    return __util.extend(_defaults, _ret);
  }

  function getQuery() {
    var query = location.query;
    var urlSchema = getUrlSchme();
    var pathname = location.pathname;
    var paramReg = /\{([\w-])+\}/;
    var pathQuery = {};
    var ret = {};

    urlSchema.forEach(function(item) {
      var ret = __util.pathtoRegexp(item);
      var match = pathname.match(ret.reg);

      if (match) {
        match.shift();
        pathQuery = _.object(ret.keys, match);
      }
    });

    _.extend(query, pathQuery);
    _.each(query, function(item, key) {
      ret[key.toLowerCase()] = item;
    });

    return ret;
  }

  function lizardExtend() {
    var lizardExtend = ["appBaseUrl", "webresourceBaseUrl", "restfullApi", "restfullApiHttps", "WebresourcePDBaseUrl"];
    var self = this;

    lizardExtend.forEach(function(meta) {
      var value = $('meta[name="' + meta + '"]').attr('content');
      
      self[meta] = value;
    });
  }

  lizardExtend.call(this);
  this._cache.query = getQuery();
  this._cache.pageConfig = getPageConfig.call(this);

  this._requestData();
};

// 根据models,请求数据
Lizard.prototype._requestData = function() {
  function postDateEval(data) {
    for (var key in data) {
      var value = data[key];
      var isEval = _.isFunction(value);

      if (isEval) {
        data[key] = data[key]();
      } else if (_.isObject(value)) {
        postDateEval(value);
      }
    }
  }

  function modelTimeKey(item) {
    var start = item.name ? item.name : 'datas[' + item._index + ']';
    var str = start + ':' + item.url;

    if (item._parent) {
      str = item._parent + '->' + str;
    }

    return str;
  }
  
  var self = this;
  var models = this.getModels();
  var count = 0;
  var cache = this._cache;
  var ajaxDatas = cache.ajaxDatas;

  if (!models.length) {
   return this._render();
  }

  function done(data, item) {
    count++;
    ajaxDatas[item._index] = data;

    if (item.name) {
      cache.ajax[item.name] = data;
    }

    if (count == models.length) {
      self._render();
    }
  }

  // 无依赖请求
  models.async.forEach(recursive);

  // 依赖请求 
  _.each(models.suspend, recursive);

  function recursive(item) {
    var isSuspend = item.suspend();

    if (isSuspend) {
      return done({}, item);
    }

    postDateEval(item.postdata);

    __util.request({
      url: item.url,
      data: JSON.stringify(item.postdata),
      method: 'POST'
    }, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        done(body, item);
      } else {
        done({}, item);
      }

      if (item._children) {
        item._children.forEach(recursive);
      }
    });
  }
};

// 渲染模板
Lizard.prototype._render = function() {
  var pageConfig = this.getPageConfig();
  var $ = this.$;
  var datas = this._cache.ajaxDatas;
  var pdJs = this.parser.pdJs;
  var mainHtml, headerHtml = pageConfig.view.header;

  // 模板环境需要Lizard,_ ,pdJs
  var Lizard = this;
  if (pdJs) {
    eval(pdJs);
  }
  var tdk = pageConfig.model.setTDK(datas);
  var filterDatas = pageConfig.model.filter(datas, tdk);

  // Set title, description, keywords.
  function setTDK() {
    var description = $('meta[name="description"]');
    var keywords = $('meta[name="keywords"]');
    var title = $('title');
    var defaults = {
      title: title.text(),
      description: description.attr('content'),
      keywords: keywords.attr('content')
    };
    _.extend(defaults, tdk);

    title.text(defaults.title);
    description.attr('content', defaults.description);
    keywords.attr('content', defaults.keywords);
  }

  mainHtml = this._template(pageConfig.view.viewport, filterDatas);

  if (headerHtml) {
    headerHtml = this._template(headerHtml, filterDatas);
    $('#headerview header').html(headerHtml);
  }

  mainHtml = 
      '<div id="id_viewport' + _.uniqueId() + '" page-url="' + this.parser.location.href + '">' +
        mainHtml + 
      '</div>';
  $('.main-viewport').html(mainHtml).attr('renderat', 'server');
  setTDK();

  var html = '<!DOCTYPE html>' + $.html('html');
  this.parser.callback(null, html);
};

// 跑underscore template
Lizard.prototype._template = function(template, data) {
  var Lizard = this;
  var __result = '';

  try {
    __result = eval(
      this.parser.pdJs +
      '\n' +
      '(' + _.template(template).source + ')(data)'
    );
  } catch (e) {
    console.log(e);
  }

  return __result;
};

// Lizard api
_.extend(Lizard.prototype, {
  getPageConfig: function() {
    return this._cache.pageConfig;
  },
  getModels: function() {
    var models = this.getPageConfig().model.apis || [];
    var self = this;
    var ret = {
      async: [],
      suspend: {}
    };
    var suspend = [];
    var async = [];
    var S4 = __util.S4;

    // 过滤front请求
    models = models.filter(function(item) {
      return item.runat != 'client';
    });

    ret.length = models.length;

    // 增加ajax head, 找出根
    models.forEach(function(item, index) {
      item.postdata = item.postdata || {};

      if (!item.postdata.head) {
        item.postdata.head = {
          cid:     (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()),
          ctok:    '351858059049938',
          cver:    '1.0',
          lang:    '01',
          sid:     '8888',
          syscode: '09',
          auth:    ''
        };
      }
      
      if (!item.suspend) {
        item.suspend = function() {
          return false;
        };
      }

      // post url替换
      item.url = item.url.replace('m.ctrip.com', 'h5seo.mobile.ctripcorp.com');

      var dependReg = /Lizard.D\(\\?['"](.+?)\\?['"]\)/;
      var postdata = __util.extend({}, item.postdata);
      var isSuspend = 
        __util.modelStringify(postdata).match(dependReg) || 
        item.suspend.toString().match(dependReg);

      item._index = index;
      item.name = item.name || '';

      if (isSuspend) {
        var name = isSuspend[1];
        item._parent = name;
        suspend.push(item);
      } else {
        async.push(item);
      }
    });

    // 依赖分析
    suspend.forEach(function(item) {
      var parent = _.find(models, function(model, index) {
        if (model.name == item._parent) {
          return true;
        }
      });

      if (parent) {
        parent._children =  parent._children || [];
        parent._level = parent._level || 1;
        parent._children.push(item);
        item._level = parent._level + 1;

        if (parent._level == 1) {
          ret.suspend[parent.name] = parent;
        }
      }
    });

    // 异步分析
    async.forEach(function(item) {
      if (!ret.suspend[item.name]) {
        ret.async.push(item);
      }
    });

    return ret;
  },
  T: function(id, datas) {
    var temp = this.$('#' + id).html();

    if (datas) {
      return this._template(temp, datas);
    }

    return temp;
  },
  S: function(stroename, key, defaultvalue) {
    return defaultvalue;
  },
  P: function(name, value) {
    var query = this._cache.query;
    if (name) {
      name = name.toLowerCase();
      if (value) {
        query[name] = value;
        return value;
      }
      return query[name];
    } 
    return query;
  },
  D: function(name) {
    return this._cache.ajax[name];
  }
});

module.exports = Lizard;