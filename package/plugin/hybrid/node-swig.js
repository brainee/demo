var fs = require('file-system');
var path = require('path');
var replace = require('../../vendor/replace');
var util = require('utils-extend');


function getConfigGen(dirpath) {
  var parseString = require('xml2js').parseString;
  var ConfigProfile = fs.readFileSync(path.join(dirpath, 'ConfigProfile.xml'));
  var ConfigProfileJson = {};

  parseString(ConfigProfile, function(err, result) {
    if (err) {
      return grunt.log.warn(err);
    }

    result.profile.environments[0].add.forEach(function(item) {
      var name = item.$.name;
      ConfigProfileJson[name] = result.profile[name];
    });
  });

  function converToObj(name) {
    var obj = {};
    var ret = ConfigProfileJson[name];

    ret.forEach(function(item) {
      for (var i in item) {
        obj[i] = item[i][0]
      }
    });
    return obj;
  }

  for (var i in ConfigProfileJson) {
    ConfigProfileJson[i] =  converToObj(i);
  }

  return ConfigProfileJson;
}

// {{ include "templates/orderdetail_header.html" }}
function renderPage(content, filepath) {
  var reg = /\{\{\s*include\s+"([^"]+)"\s*\}\}/g;

  function replace($1, $2, filepath) {
    filepath = path.join(path.dirname(filepath), $2);
    var body = fs.readFileSync(
      filepath,
      { encoding: 'utf8' }
    );

    if (body.match(reg)) {
      body = body.replace(reg, function($1, $2) {
        return replace($1, $2, filepath);
      });
    }

    return body.trim();
  }

  return content.replace(reg, function($1, $2) {
    return replace($1, $2, filepath);
  });
}

module.exports = function(grunt, config, webappPath) {
  var ConfigProfileJson = getConfigGen(webappPath);
  var localRoute = {};
  var hybridPath = path.join(webappPath, 'dest', config.hybridChannel);
  var webresourcePath = path.join(webappPath, 'dest', config.hybridChannel, 'webresource');
  var layoutName = 'views/shared/_Layout.html';
  var hybridRoot = getHost() + '/webapp/' + config.channel + '/dest/' + config.hybridChannel + '/';
  var isDebug = grunt.option('debug');
  var inctrip = grunt.option('inctrip');

  function getHost() {
    return 'http://' + config.host;
  }

  function addLocalRoute(contents, filepath) {
    var reg = /"?url_schema"?\s*:\s*('[^']*'|"[^"]*"|\[[^\]]*\])/;
    var match = contents.match(reg);
    var urlSchema = '';

    if (match) {
      urlSchema = match[1];
    }
    if (!urlSchema) {
      return grunt.log.error(filepath + '的url_schema为空，请配置');
    }

    eval('urlSchema=' + urlSchema);

    if (!Array.isArray(urlSchema)) {
      urlSchema = [urlSchema];
    }

    filepath = filepath.replace(/\.[\w-]+$/, '');

    var relative = util.path.unixifyPath(path.relative(
      webappPath,
      filepath
    ));

    urlSchema.forEach(function(item) {
      var src = relative.replace('dest\/', '');

      if (isDebug || inctrip) {
        src = hybridRoot + src + '.js';
      }

      localRoute[item] = src;
    });
  }

  function isExcludeImage(url) {
    var isExclude = false;
    var resourceExclude = config.resourceExclude;
    var length = resourceExclude.length;

    if (url.indexOf('http') !== 0) {
      url = 'http:' + url;
    }

    while(length--) {
      if (url.indexOf(resourceExclude[length]) == 0) {
        return true;
      }
    }

    return isExclude;
  }


  // hybrid替换任务
  config.replace.hybrid = config.replace.hybrid.concat([
    {
      filter: ['views/**/*'],
      replace: [
        {
          // 替换confGen
          match: /\{\{=\s*config\["([\w-]+)"\]\}\}/g,
          replacement: function(match, $1) {
            var value = ConfigProfileJson[config.buEnv][$1];

            return util.isUndefined(value)? '' : value;
          }
        },
        {
          //72.png?v=1.0?v=1.0
          // 去掉版本号, css不去掉版本号
          match: /(\.(?!css)[\w]+)(\?v=[\w-\.]+)+/g,
          replacement: '$1'
        },
        {
          // 删除服务器代码{{}}
          match: /\{\{[\s\S]*?\}\}/g,
          replacement: ''
        },
        {
          match: new RegExp('\/webapp\/' + config.channel + '\/dest\/' + config.webresourceSrc, 'g'),
          replacement: function(match) {
            if (isDebug || inctrip) {
              return getHost() + '/webapp/' + config.channel + '/dest/' + config.webresourceSrc;
            } else {
              return 'webresource';
            }
          }
        }
      ]
    },
    {
      filter: [layoutName],
      replace: [
        {
          match: /<meta[^>]+?name="appBaseUrl"[^>]+>/,
          replacement: '<meta name="appBaseUrl" content="/webapp/' + config.channel + '/">'
        },
        {
          // headerview
          match: /headerview"\s+style="/,
          replacement: 'headerview\" style=\"display:none;'
        },
        {
          // 替换框架路径
          match: /(http:)?\/\/webresource.c-ctrip.com\/((styles)|(code))/g,
          replacement: '../lizard/webresource/$2'
        },
        {
          // 增加localroute
          match: '<\/head>',
          replacement: function() {
            var src = './lizardlocalroute.js';

            if (isDebug || inctrip) {
              src =  hybridRoot + 'lizardlocalroute.js';
            }
            
            return '<script src="' + src + '"></script></head>';
          }
        },
        {
          // html控制
          match: /<html[\s\S]+?>\s*<head>/,
          replacement: '<html><head>'
        }
      ]
    } 
  ]);

  config.replace.hybrid.forEach(function(item) {
    item.filterFn = fs.fileMatch(item.filter, true)
  });

  function processCsthml(contents, filepath, relative) {
    // 组装模板
    contents = renderPage(contents, filepath);
    contents = replace(contents, path.join('views', relative), config.replace.hybrid);

    if (/_layout.html/i.test(filepath)) {
      filepath = path.join(hybridPath, 'index.html');
    } else {
      addLocalRoute(contents, filepath);
      // 变成cmd
      contents = 'define(function(){return' + JSON.stringify(contents) + '});';
      filepath = path.join(path.join(hybridPath, 'views'), relative).replace(/\.[\w-]+$/, '.js');
    }

    return {
      contents: contents.trim(),
      filepath: filepath
    };
  }

  grunt.log.writeln('Running 模板复制');
  fs.copySync(
    path.join(webappPath, 'dest/views'),
    path.join(hybridPath, 'views'), {
      process: processCsthml,
      filter: (function() {
        var defaults = [
          '**/*',
          '!_ViewStart.cshtml',
          '!**/*Error.cshtml',
          '!Web.config'
        ];

        config.viewsExclude.forEach(function(item) {
          defaults.push('!' + item);
        });

        return defaults;
      })()
  });

  grunt.log.writeln('Running 写入lizardlocalroute.js');

  if (config.defaultView) {
    localRoute.defaultView = config.defaultView;
  } else if (localRoute['index']) {
    localRoute.defaultView = 'index';
  } else if (localRoute['/index']) {
    localRoute.defaultView = '/index';
  }
  fs.writeFileSync(
    path.join(hybridPath, 'lizardlocalroute.js'),
    'window.LizardLocalroute=' + JSON.stringify(localRoute)
  );

  // 删除shared文件夹
  if (fs.existsSync(path.join(hybridPath, 'views/shared'))) {
    fs.rmdirSync(path.join(hybridPath, 'views/shared'));
  }
}