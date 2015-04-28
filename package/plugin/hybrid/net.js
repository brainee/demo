var fs = require('file-system');
var path = require('path');
var replace = require('../../vendor/replace');
var util = require('utils-extend');
var base64Img = require('base64-img');

// 根据base64生成图片名字
var base64Name = (function() {
  var i = 0;

  return function() {
    i++;
    return 'base64-' + i;
  }
})();

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

// @RenderPage 语法替换
function renderPage(content, filepath) {
  var reg = /@RenderPage\("([^"]+)"\)/g;

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
  var layoutName = 'Views/Shared/_Layout.cshtml';
  var hybridRoot = getHost() + '/webapp/' + config.channel + '/dest/' + config.hybridChannel + '/';
  var isDebug = grunt.option('debug');
  var inctrip = grunt.option('inctrip');

  function getHost() {
    return 'http://' + config.host;
  }

  function removeServerCode(s) {
    var couples, pre = '', i, j, post;

    do {
       i = s.indexOf('@{');
       if (i < 0) break;

       couples = 1;
       pre += s.substr(0, i);
       s = s.substr(i + 2);

       while (s && couples) {

           i = s.indexOf('{');
           j = s.indexOf('}');

           if (i < 0) i = Infinity;
           if (j < 0) j = Infinity;

           couples += (i < j) ? 1 : -1;
           s = s.substr(Math.min(i, j) + 1);
       }
    } while (1);

    return pre + s;
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
  
  function clearFolders(filepath) {
    var dirname = path.dirname(filepath);
    if (dirname == '.') return;
    var files = fs.readdirSync(dirname);

    if (!files.length) {
      fs.rmdirSync(dirname);
      clearFolders(dirname);
    }
  }

  // hybrid替换任务
  config.replace.hybrid = config.replace.hybrid.concat([
    {
      filter: ['views/**/*'],
      replace: [
        {
          // 替换confGen
          match: /@ConfigurationManager\.AppSettings\["([\w-]+)"\]/g,
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
          // 删除服务器配置
          match: /@using\s+system\.configuration;?/ig,
          replacement: ''
        },
        {
          // 删除服务器代码 @viewbag.name @renaderbody() @Html.Raw(scriptSrc)
          // a@b.c不是服务器代码
          match: /(^|[^\w])@\w[\w\(\)]*(\.[\w\(\)]+)*/g,
          replacement: '$1'
        },
        {
          // 替换base64
          match: /data:image\/\w+;base64[^'")]+/g,
          replacement: function(match) {
            if (isDebug) return match;
            var filepath = this.filepath;
            var newpath = path.join(hybridPath, 'pic');
            var imagepath = base64Img.imgSync(match, newpath, base64Name());

            return 'pic/' + path.basename(imagepath);
          }
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
          match: /<title>.*?<\/title>/,
          replacement: '<title>' + config.pageTitle + '</title>'
        },
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
    // 删除服务器代码
    contents = removeServerCode(contents);

    contents = replace(contents, path.join('views', relative), config.replace.hybrid);

    if (/_layout.cshtml/i.test(filepath)) {
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
          '!**/.\\w+',
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