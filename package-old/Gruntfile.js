var path = require('path');
var file = require('file-system');
var util = require('utils-extend');
var request = require('ajax-request');
var url = require('url');
var uglifyCshtml = require('./vendor/uglify-cshtml');
var uglifyHtml = require('./vendor/uglify-html');
var precompile = require('./vendor/precompile-html');
var requirejs = require('requirejs');
var base64Img = require('base64-img');
var config, webappPath, isDebug, inctrip;

module.exports = function(grunt) {
  grunt.config('version', grunt.template.today('yyyymmdd_H_MM'));

  function replace(contents, filepath, env) {
    env = env || 'web';
    var replaces = config.replace[env];

    replaces.forEach(function(item) {
      if (item.filterFn(filepath)) {
        item.replace.forEach(function(item2) {
          var fn = item2.replacement;
          if (util.isFunction(fn)) {
            fn.filepath = filepath;
            fn.version = grunt.config('version');
            fn.isDebug = isDebug;
            contents = contents.replace(item2.match, fn.bind(fn));
          } else {
            contents = contents.replace(item2.match, fn);
          }
        });
      }
    });

    return contents;
  }

  function getConfigGen(dirpath) {
    var parseString = require('xml2js').parseString;
    var ConfigProfile = file.readFileSync(path.join(dirpath, 'ConfigProfile.xml'));
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

  function getModulePath(filepath) {
    var buConfig = file.readFileSync(filepath, { encoding: 'utf8' });
    // 自动分析模块路径
    buConfig.replace(/paths\s*:\s*({[\s\S]*?})/, function(match, $1) {
      $1 = 'return ' + $1.replace(
        /baseUrl\s*\+\s*/g,
        ''
      ).trim();

      $1 = new Function($1)();

      util.extend(config.paths, $1);
    });
  }

  // 静态资源路径替换
  function destRes(html, isHybrid) {
    var resource = '/webapp/' + config.channel + '/dest/' + config.webresourceSrc;

    html = html.replace(
      new RegExp('\/webapp\/' + config.channel + '\/' + config.webresourceSrc, 'ig'),
      function() {
        if (isHybrid) {
          return 'webresource';
        } else {
          if (grunt.option('debug')) {
            return 'http://' + config.host + resource;
          } else {
            return resource;
          }
        }
      }
    );
    return html;
  }
  // @RenderPage 语法替换
  function renderPage(content, filepath) {
    var reg = /@RenderPage\("([^"]+)"\)/g;

    function replace($1, $2, filepath) {
      filepath = path.join(path.dirname(filepath), $2);
      var body = file.readFileSync(
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

  // 根据base64生成图片名字
  var base64Name = (function() {
    var i = 0;

    return function() {
      i++;
      return 'base64-' + i;
    }
  })();
 
  // 初始化变量任务
  grunt.registerTask('init2.0', function() {
    var pkg = grunt.file.readJSON('package.json');
    webappPath = grunt.option('path');
    isDebug = grunt.option('debug');
    inctrip = grunt.option('inctrip');
    config = require(path.join(webappPath, 'gruntCfg.js'));
    // Default options extend
    config = util.extend({
      paths: {},
      skipModuleInsertion: true,
      hybridIsSimple: true,
      frameworkExclude: [],
      hybridExclude: [],
      viewsExclude: [],
      jsExclude: [],
      resourceExclude: [],
      base64: [],
      modules: [],
      replace: {
        web: [],
        hybrid: []
      }
    }, config);

    if (config.channels) {
      config.channels.forEach(function(item) {
        getModulePath(path.join(webappPath, config.webresourceSrc, item.name, config.buConfig));
      });
    } else {
      getModulePath(path.join(webappPath, config.webresourceSrc, config.buConfig));
    }
    
    // 排除框架的包
    pkg.frameworkInclude.forEach(function(item) {
      if (!config.paths[item]) {
        config.paths[item] = 'empty:';
      }
    });

    // 排除自定义框架包
    config.frameworkExclude.forEach(function(item) {
      config.paths[item] = 'empty:';
    });

    // 处理require.text.js
    config.paths.text = path.join(__dirname, 'text');

    // html模板预编译
    if (config.htmlPrecompile) {
      config.htmlPrecompileFilter = file.fileMatch(config.htmlPrecompile);
    } else {
      config.htmlPrecompileFilter = file.fileMatch('');
    }

    if (!config.hybridChannel) {
      config.hybridChannel = config.channel;
    }

    // hybrid包直连情况，使用prdhost
    if (inctrip) {
      config.host = config.prdhost;
    }
  });

  // 清空dest或者webapp文件
  grunt.registerTask('clear2.0', function(env) {
    if (env == 'web') {
      grunt.log.writeln('Running 删除dest目录');
      var dest = path.join(webappPath, 'dest');
      if (file.existsSync(dest)) {
        file.chmodSync(dest, 511);
        file.rmdirSync(dest);
      }
    } else if (env == 'hybrid') {
      grunt.log.writeln('Running 删除webapp目录');
      if (file.existsSync('webapp')) {
        file.chmodSync('webapp', 511);
        file.rmdirSync('webapp');
      }
    }
  });

  // imagemin任务
  grunt.registerTask('imagemin2.0', function(env) {
    if (isDebug || grunt.option('imagemin') == false) return;
    if (!grunt.task.exists('imagemin')) {
      grunt.loadNpmTasks('grunt-contrib-imagemin');
    }
    var files;
    if (env === 'web') {
      files = [{
        expand: true,
        cwd: path.join(webappPath, 'dest', config.webresourceSrc),
        src: ['**/*.{png,jpg,gif}'],
        dest: path.join(webappPath, 'dest', config.webresourceSrc)  
      }];
    } else {
      files = [{
        expand: true,
        cwd: path.join(webappPath, 'dest', config.hybridChannel),
        src: ['**/*.{png,jpg,gif}'],
        dest: path.join(webappPath, 'dest', config.hybridChannel)
      }];
    }

    grunt.config('imagemin', {
      dynamic: {
        options: {
          optimizationLevel: 6
        },
        files: files
      }
    });
    grunt.task.run(['imagemin']);
  });

  // r.js
  grunt.registerTask('requirejs2.0', function(env) {
    grunt.log.writeln('Running ' + env +' requirejs打包任务');
    var done = this.async();
    var isHybrid = env == 'web' ? false : true;
    var compressOpts = {
      drop_console: true
    };

    var dir, isHybrid;

    if (env == 'web' || inctrip || isDebug) {
      dir = path.join(webappPath, 'dest', config.webresourceSrc);
      isHybrid = false;
    } else {
      dir = path.join(webappPath, 'dest', config.hybridChannel, 'webresource');
      isHybrid = true;
      // hybrid模块排除
      config.hybridExclude.forEach(function(item) {
        config.paths[item] = 'empty:';
      });
    }
    if (config.envCodeRemove) {
      compressOpts.global_defs = {
        ISHYBRID: isHybrid
      }
    }

    // simple模式, 只要在buconfig.js里面配置了的，都打进一个js
    if (config.isSimple || (isHybrid && config.hybridIsSimple) || isDebug) {
      config.modules = [
        {
          name: config.buConfig.replace(/\.js$/, ''),
          include: (function() {
            var paths = config.paths;
            var ret = [];
            var extname;

            for (var i in paths) {
              extname = path.extname(paths[i]);

              if (extname == '.html') {
                i = 'text!' + i; 
              }

              ret.push(i);
            }

            return ret;
          })()
        }
      ];
    }

    var rjsOptions = {
      baseUrl: path.join(webappPath, config.webresourceSrc),
      dir: dir,
      optimize: isDebug ? 'none' : 'uglify2',
      paths: config.paths,
      uglify2: {
        mangle: {
          except: ['$super']
        },
        compress: compressOpts
      },
      removeCombined: true,
      // 不是amd模块，只压缩
      skipModuleInsertion: config.skipModuleInsertion,
      onBuildRead: function (moduleName, filepath, contents) {
        var resource = '/webapp/' + config.channel + '/dest/' + config.webresourceSrc;

        if (config.buConfig) {
          var main = config.buConfig.replace(/\.js$/, '');
          if (main === moduleName) {
            contents = contents.replace(
              /Lizard.appBaseUrl\s*\+\s*['"]([\w-]+)\/['"]/,
              function(match, $1) {
                if (isDebug || inctrip) {
                  return '"http://' + config.host + resource + '/"';
                } else {
                  if (isHybrid) {
                    return '"webresource/"';
                  } else {
                    return '"' + resource + '/"';
                  }
                }
            });
          }
        }

        contents = destRes(contents, isHybrid);

        return contents;
      },
      onBuildWrite: function (moduleName, filepath, contents) {
        var reg = new RegExp('[\"\']' + moduleName + '[\"\']\,');
        //把打包的模块变成匿名模块
        config.modules.forEach(function(item) {
          if (moduleName === item.name) {
            contents = contents.replace(reg, '');
          }
        });

        // text模块已存在框架里面
        if (moduleName == 'text') {
          return '';
        }

        // 压缩html模板
        if (moduleName.indexOf('text!') == 0) {
          filepath = path.join(
            rjsOptions.baseUrl,
            rjsOptions.paths[moduleName.replace(/^text!/, '')]
          );
          var html = file.readFileSync(filepath, { encoding: 'utf8' });
          var resource = '/webapp/' + config.channel + '/dest/' + config.webresourceSrc;
          // 替换路径
          html = destRes(html, isHybrid);

          var relative = path.relative(path.join(webappPath, config.webresourceSrc), filepath);

          if (config.htmlPrecompileFilter(relative)) {
            html = precompile(html, filepath);
          } else {
            html = uglifyHtml(html, filepath);
            html = JSON.stringify(html);
          }

          return 'define("' + 
            moduleName + 
            '", [], function(){return' + html + '});';
        }

        return contents;
      },
      modules: util.extend([], config.modules),
      optimizeCss: 
        isDebug ? 'standard.keepLines.keepWhitespace' : 'standard'
    };

    requirejs.optimize(rjsOptions, function(buildResponse) {
      done();
    }, function(err) {
      grunt.fatal(err);
    });
  });

  // 复制web views
  grunt.registerTask('web_views2.0', function() {
    // 框架替换
    config.replace.web = config.replace.web.concat([
      {
        filter: ['views/**/*.{cshtml,html}'],
        replace: [
          {
            // 路径dest替换
            match: new RegExp('\/' + config.channel + '\/' + config.webresourceSrc, 'ig'),
            replacement: function(match) {
              var src = config.webresourceSrc;
              return match.replace(src, 'dest/' + src);
            }
          }
        ]
      },
      {
        filter: ['views/_viewstart.cshtml'],
        replace: [
          {
            // viewstart
            match: /(layout[\s\S]*?)views\//i,
            replacement: '$1dest/views/'
          }
        ]
      },
      {
        filter: ['views/shared/_layout.cshtml'],
        replace: [
          {
            // 增加requirejs debug模式
            match: '</head>',
            replacement: function(match) {
              if (isDebug || grunt.option('weinre')) {
                var ip = config.host.split(':');

                return '<script src="http://svn.ui.sh.ctripcorp.com:8899/target/target-script-min.js#'+ ip[0] +'"></script>' + match;
              }
              return match;
            }
          }
        ]
      }
    ]);

    config.replace.web.forEach(function(item) {
      item.filterFn = file.fileMatch(item.filter, true)
    });

    // 复制并压缩模板 
    file.copySync(
      path.join(webappPath, 'views'),
      path.join(webappPath, 'dest/views'), {
        process: function(contents, filepath) {
          if (/web\.config$/i.test(filepath)) return contents;

          if (/\.(cshtml|html)$/.test(filepath)) {
            contents = uglifyCshtml(contents, filepath);
          }

          contents = replace(contents, path.relative(webappPath, filepath));
          // 乱码
          contents = '\uFEFF' + contents;

          return contents;
        }
      }
    );

    var destResourcePath = path.join(webappPath, 'dest', config.webresourceSrc);
    // 自定义replace功能
    file.copySync(
      destResourcePath,
      destResourcePath, {
        noProcess: '**/*.{jpg,png,gif,ttf}',
        process: function(contents, filepath) {
          var relative = path.relative(path.join(webappPath,'dest'), filepath);
          
          contents = replace(contents, relative);
          return contents;
        }
      }
    );
  });
  
  // 分析base64需要下载的图片，目的是为了先imagemin,后base64
  grunt.registerTask('base64download', function() {
    if (isDebug || !config.base64.length) return;
    var filter = file.fileMatch(config.base64);
    var imagesResource = [];
    var dest = path.join(webappPath, 'dest', config.webresourceSrc);
    var ret = [];

    file.recurseSync(dest, '**/*.css', function(filepath, filename) {
      if (!filename) return;
      var contents = file.readFileSync(filepath, { encoding: 'utf8' });
      var relative = path.relative(path.dirname(filepath), path.join(dest, '_pic'));

      contents = contents.replace(
        /url\(([^)]+)\)/g,
        function(match, $1) {
          var url = $1.replace(/^['"]|['"]$/g, '')
                      .replace(/^\/\//, 'http://')
                      .replace(/(\.\w+)\?.+$/, '$1');

          if (url.indexOf('http') === 0 && filter(url)) {
            imagesResource.push(url);
            return 'url(' + path.join(relative, url.replace(/^https?:\/\/[^\/]+/, '')) + ')';
          }

          return match;
        }
      );

      file.fs.writeFileSync(filepath, contents, { encoding: 'utf8' });
    });

    // 检测是否有重复的
    imagesResource.forEach(function(item) {
      if (ret.indexOf(item) !== -1) {
        grunt.fail.fatal('base64出现重复图片: ' + item);
      }
      ret.push(item);
    });

    grunt.config('imagesResource', ret);
  });

  // image base64,只用于h5打包
  grunt.registerTask('base64', function(env) {
    if (isDebug || !config.base64.length) return;
    var ret = [];
    config.base64.forEach(function(item) {
      if (item.indexOf('http') == 0) {
        item  = item.replace(/^https?:\/\/[^\/]+\//,  config.webresourceSrc + '/_pic/');
      }
      ret.push(item)
    });
    var filter = file.fileMatch(ret);
    var dest =  path.join(webappPath, 'dest', config.webresourceSrc);
    var combined = [];
    var result = [];
    var _pic = path.join(dest, '_pic');

    file.recurseSync(dest, '**/*.css', function(filepath, filename) {
      if (!filename) return;

      var contents = file.readFileSync(filepath, { encoding: 'utf8' });
      // 提取图片url, 已经是base64的排除
      contents = contents.replace(
        /url\(([^\)]+)\)/g,
        function(match, $1) {
          var url = $1.replace(/^['"]|['"]$/g, '')
                      .replace(/^\/\//, 'http://');
          // base64 和 http图片排除
          if (url.indexOf('data:') == 0  || url.indexOf('http') === 0) return match;
          var relative = path.join(path.dirname(filepath), url);
          var filterRelative = path.relative(path.join(webappPath, 'dest'), relative);

          if (filter(filterRelative)) {
            grunt.log.writeln('base64转化 ' + filterRelative);
            combined.push(relative);
            var base64 = file.base64Sync(relative);
            return 'url(' + base64 +')';
          }
          return match;
        }
      );
      file.writeFileSync(filepath, contents, { encoding: 'utf8' });
    });

    // 检测是否有重复的
    combined.forEach(function(item) {
      if (result.indexOf(item) !== -1) {
        grunt.fail.fatal('base64出现重复图片: ' + item);
      }
      result.push(item);
    });

    // 删除多余的图片
    result.forEach(function(item) {
      file.unlinkSync(item);
    });
    if (file.existsSync(_pic)) {
      file.rmdirSync(_pic);
    }
  });

  // 复制hybrid views
  grunt.registerTask('hybrid_view2.0', function() {
    var ConfigProfileJson = getConfigGen(webappPath);
    var imagesResource = [];
    var localRoute = {};
    var webresourcePath = path.join(webappPath, 'dest', config.hybridChannel, 'webresource');
    var layoutName = 'Views/Shared/_Layout.cshtml';
    var hybridRoot = getHost() + '/webapp/' + config.channel + '/dest/' + config.hybridChannel + '/';

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
      var files = file.readdirSync(dirname);

      if (!files.length) {
        file.rmdirSync(dirname);
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
            // 图片分析
            match: /<img("[^"]*"|'[^']*'|[^>'"])+>/g,
            replacement: function(match) {
              var src = match.match(/src\s*=\s*"([^"]+)"/);

              if (!src || isDebug || inctrip) return match;
              src = src[1];

              // underscore模板, 本地图片和base64
              if (src.indexOf('<%') == 0 || src.indexOf('/webapp/') == 0 || src.indexOf('data:image') == 0 || /<%[\s\S]+?%>/.test(src) || src.indexOf('webresource') == 0)  return match;

              if (isExcludeImage(src)) return match;
              var relative = src.replace(/^(https?:)?(\/\/)[^\/]+\//, '');
              imagesResource.push(src);

              return match.replace(
                /src\s*=\s*"([^"]+)"/,
                'src="pic/' + relative.toLowerCase() + '"'
              );
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
      },
      {
        filter: config.webresourceSrc + "/**/*.css",
        replace: [
          {
            // css图片分析
            match: /url\(((https?:)?\/\/[^\)]+)\)/g,
            replacement: function(match, $1) {
              if (isDebug || isExcludeImage($1)) return match;
              var relative = path.relative(path.dirname(this.filepath), 'pic') + '/';
              var src = $1.replace(/(https?:)?\/\/[^\/]+\//, relative).toLowerCase();

              imagesResource.push($1);

              return 'url(' + util.path.unixifyPath(src) +')';
            }
          },
          {
            // base64强制转化为图片
            match: /data:image\/\w+;base64,[^)'"]+/g,
            replacement: function(match) {
              var filepath = this.filepath.replace(config.webresourceSrc, 'webresource');
              filepath = path.join(webappPath, 'dest', config.hybridChannel, filepath);
              var filename = base64Img.imgSync(match, path.dirname(filepath), base64Name());

              return path.basename(filename);
            }
          }
        ]
      }
    ]);

    config.replace.hybrid.forEach(function(item) {
      item.filterFn = file.fileMatch(item.filter, true)
    });

    function processCsthml(contents, filepath) {
      // 组装模板
      contents = renderPage(contents, filepath);

      // 删除服务器代码
      contents = removeServerCode(contents);
      // 替换任务
      contents = replace(contents, path.relative(webappPath, filepath).replace(/dest[\/\\]/, ''), 'hybrid');

      if (/_layout.cshtml/i.test(filepath)) {
      } else {
        addLocalRoute(contents, filepath);
        // 变成cmd
        contents = 'define(function(){return' + JSON.stringify(contents) + '});';
        filepath = filepath.replace(/\.[\w-]+$/, '.js');
      }

      var relative = path.relative(path.join(webappPath, 'dest/views'), filepath);

      filepath = path.join(path.join(webappPath, 'dest', config.hybridChannel, 'views'), relative);

      return {
        contents: contents.trim(),
        filepath: filepath
      };
    }

    grunt.log.writeln('Running 模板复制');
    file.copySync(
      path.join(webappPath, 'dest/views'),
      path.join(webappPath, 'dest', config.hybridChannel, 'views'), {
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
    file.writeFileSync(
      path.join(webappPath, 'dest', config.hybridChannel, 'lizardlocalroute.js'),
      'window.LizardLocalroute=' + JSON.stringify(localRoute)
    );
    // 生成首页
    grunt.file.copy(
      path.join(webappPath, 'dest', config.hybridChannel, layoutName),
      path.join(webappPath, 'dest', config.hybridChannel, 'index.html')
    );
    // 删除shared文件夹
    file.rmdirSync(
      path.join(webappPath, 'dest', config.hybridChannel, 'views/shared')
    );

    var deleteFilter = file.fileMatch((function() {
      var defaults = [
        '**/*',
        '!.*',
        '!**/*.html',
        '!text.js',
        '!build.txt'
      ];

      config.jsExclude.forEach(function(item) {
        defaults.push('!' + item);
      });

      return defaults;
    })());

    if (!file.existsSync(webresourcePath)) return;
    // 删除不需要的静态资源
    file.recurseSync(
      webresourcePath, 
      function(filepath, filename) {
        if (!filename) return;
        var relative = path.relative(webresourcePath, filepath);

        if (!deleteFilter(relative)) {
          file.unlinkSync(filepath);
          clearFolders(filepath);
        }
      }
    );

    grunt.log.writeln('Running 静态资源替换');

    file.copySync(
      webresourcePath,
      webresourcePath, {
        noProcess: '**/*.{jpg,png,gif,ttf}',
        process: function(contents, filepath) {
          var relative = config.webresourceSrc + '/' + path.relative(webresourcePath, filepath);
          // 替换任务
          contents = replace(contents, relative, 'hybrid');
          return contents;
        }
      }
    );
    imagesResource = util.unique(imagesResource);
    // grunt.log.writeln('Running lizard文件复制');
    // file.copySync(
    //   'lizard',
    //   'webapp/lizard'
    // );
    // grunt.log.writeln('Running ubt文件复制');
    // file.copySync(
    //   'ubt',
    //   'webapp/ubt'
    // );

    grunt.config('imagesResource', imagesResource);
  });

  // 下载三方图片资源
  grunt.registerTask('image_download', function(env) {
    var imagesResource = grunt.config('imagesResource');
    if (!imagesResource || !imagesResource.length) return;
    if (isDebug) return;

    var done = this.async();
    var count = 0;
    var rootPath;

    if (env == 'web') {
      rootPath = path.join(webappPath, 'dest', config.webresourceSrc, '_pic')
    } else {
      rootPath = path.join(webappPath, 'dest', config.hybridChannel, 'pic');
    }

    imagesResource.forEach(function(picUrl) {
      if (picUrl.indexOf('http') != 0) {
        picUrl = 'http:' + picUrl;
      }
      grunt.log.writeln('Running fetch ' + picUrl);
      request.download({
        url: picUrl,
        rootPath: rootPath,
        ignore: true
      }, function(err, res, body, filepath) {
        count++;
        if (err) return grunt.log.error('Fetch pic ' + picUrl + err);

        if (count == imagesResource.length) {
          done();
        }
      });
    });
  });

  // 生成zip包
  grunt.registerTask('zip2.0', function() {
    if (isDebug) return;
    var filePackage = require('file-package');
    var done = this.async();
    var zip = config.zip;
    var filter = inctrip ? 'index.html' : null;

    if (util.path.isAbsolute(zip)) {
       zip = path.join(zip, config.hybridChannel + '.zip');
    } else {
       zip = path.join(webappPath, config.zip, config.hybridChannel + '.zip');
    }

    filePackage(
      path.join(webappPath, 'dest', config.hybridChannel), 
      zip, {
      level: 9,
      filter: filter,
      packageRoot: config.hybridChannel,
      done: function(size) {
        grunt.log.writeln('Created ' + zip + ' (' + size + ' bytes)')
        done();
      }
    });
  });

  /**
   * @description
   * web包
   * grunt web2.0 --path=c:\\path
   * grunt web2.0 --path=c:\\path --debug --imagemin=false
   */
  grunt.registerTask('web2.0', ['init2.0', 'clear2.0:web', 'requirejs2.0:web', 'web_views2.0','base64download', 'image_download:web','imagemin2.0:web', 'base64']);

  /**
   * @description
   * web和hybrid一起打
   * grunt package2.0 --path=c:\\path
   * grunt package2.0 --path=c:\\path --debug --imagemin=false
   */
  grunt.registerTask('package2.0', ['web2.0', 'clear2.0:hybrid', 'requirejs2.0:hybrid','hybrid_view2.0','image_download:hybrid', 'imagemin2.0:hybrid', 'zip2.0']);
}