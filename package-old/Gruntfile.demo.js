/**
 * @fileoverview lizard2.0 打包
 * @author wliao <wliao@Ctrip.com> 
 */
var _ = require('lodash');
var chanelConfig = require('./config');
var path = require('path');
var file = require('file-system');
var util = require('utils-extend');
var request = require('ajax-request');
var url = require('url');
var htmlMinify = require('html-minifier').minify;
var uglifyJs = require('uglify-js');



module.exports = function(grunt) {

  //grunt plugins
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.file.preserveBOM = true;

  /**
   * @description
   * @demo
   *  grunt web2.0 --path=c:\\path
   *  grunt web2.0 --debug --path=c:\\path
   */
  grunt.registerTask('web2.0', function() {
    var pkg = grunt.file.readJSON('package.json');
    var channel = chanelConfig.channel;
    var webappPath, config;
    if (grunt.option('path')) {
      webappPath = grunt.option('path');
    } else {
      webappPath = chanelConfig.paths[chanelConfig.defaultPath];
    }
    if (file.existsSync(path.join(webappPath, 'gruntCfg.js'))) {
      config =  require(path.join(webappPath, 'gruntCfg.js'))
    } else {
      config = grunt.file.readJSON(path.join(webappPath, 'gruntCfg.json'));
    }
    var initConfig = {};
    var tasks = [];
    var isDebug = grunt.option('debug');

    if (grunt.option('path')) {
      channel = config.channel;
    }

    if (!channel) {
      grunt.fatal('请配置频道名称');
    }

    if (!webappPath) {
      grunt.fatal('请配置频道路径');
    }

    var dest = path.join(webappPath, 'dest');

    // check js code
    initConfig.jshint = {
      options: {

      },
      all: [ path.join(webappPath, config.webresourceSrc) + '/**/*.js' ]
    }

    // Auto fetch modules paths
    if (config.buConfig) {
      var buConfig = grunt.file.read(
        path.join(webappPath, config.webresourceSrc, config.buConfig)
      )

      config.paths = buConfig.match(/paths\s*:\s*({[\s\S]*?})/);
      if (config.paths) {
        config.paths = 'return ' + config.paths[1].replace(
          /baseUrl\s*\+\s*/g,
          ''
        ).trim();
        config.paths = new Function(config.paths)();
      }
    }

    var requireDefaults = {
      baseUrl: path.join(webappPath, config.webresourceSrc),
      dir: path.join(dest, config.webresourceSrc),
      optimize: isDebug ? 'none' : 'uglify2',
      paths: {},
      uglify2: {
        mangle: {
          except: ["$super"]
        },
        compress: {
          drop_console: true
        }
      },
      removeCombined: true,
      onBuildRead: function (moduleName, path, contents) {
        // 替换代码路径
        contents = contents.replace(
          new RegExp('[\'\"]' + config.webresourceSrc + '\/[\'\"]', 'i'),
          '"dest/' + config.webresourceSrc + '/"'
        );

        contents = contents.replace(
          new RegExp('webapp\/' + channel + '\/' + config.webresourceSrc, 'ig'),
          'webapp/' + channel + '/dest/' + config.webresourceSrc
        );

        return contents;
      },
      onBuildWrite: function (moduleName, path, contents) {
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

        return contents;
      },
      modules: [],
      optimizeCss: 
        isDebug ? 'standard.keepLines.keepWhitespace' : 'standard'
    };

    _.defaults(config, requireDefaults);

    // 排除框架的包
    pkg.frameworkInclude.forEach(function(item) {
      if (!config.paths[item]) {
        config.paths[item] = 'empty:';
      }
    });

    // simple模式
    if (config.isSimple) {
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
      ]
    }

    // 处理require.text.js
    config.paths.text = path.join(__dirname, 'text');
    grunt.log.debug(JSON.stringify(config));

    initConfig.requirejs = {
      compile: {
        options: config
      }
    };

    initConfig.imagemin = {
      dynamic: {
        options: {
          optimizationLevel: 4
        },
        files: [{
          expand: true,
          cwd: path.join(dest, config.webresourceSrc),
          src: ['**/*.{png,jpg,gif}'],
          dest: path.join(dest, config.webresourceSrc)  
        }]
      }
    };

    grunt.initConfig(initConfig);

    if (config.jshint) {
      tasks.push('jshint');
    }

    grunt.log.writeln('Running 过滤不稳定代码...')
    file.copySync(
      path.join(webappPath, 'views'),
      path.join(dest, 'views'), {
        process: function(contents, filepath) {
          if (/web\.config$/i.test(filepath)) return contents;
          // 服务器模板
          contents = contents.replace(
            /@[^";\n]+"[^"]+"/g,
            function($0) {
              return escape($0);
            }
          );

          contents = contents.replace(
            /<%[\s\S]+?%>/g,
            function(match) {
              return escape(match);
            }
          );
          // 标签里面的加属性
          contents = contents.replace(
            /<\w("[^"]*"|'[^']*'|[^>'"])+>/g, 
            function(tag) {
              return tag.replace(
                /%3C%25[\s\S]+?%25%3E/g,
                function(match) {
                  return '_=' + match;
                }
              )
            }
          );

          // script标签里面的style
          contents = contents.replace(
            /<style[^>]*>[\s\S]*?<\/style>/g,
            function(match) {
              return escape(match);
            }
          );

          return contents;
        }
      }
    );

    tasks.push('requirejs');

    if (!isDebug) {
      tasks.push('imagemin');
    }

    grunt.log.writeln('Running views htmlmin and rollbck...');

    file.copySync(
      path.join(dest, 'views'),
      path.join(dest, 'views'), {
        process: function(contents, filepath) {
          if (/web\.config$/i.test(filepath)) return contents;
          // html代码压缩
          grunt.log.writeln('Running htmlmin ' + filepath);

          if (!isDebug) {
            try {
              contents = htmlMinify(contents, {
                removeComments: true,
                collapseWhitespace: !isDebug,
                collapseBooleanAttributes: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeOptionalTags: false,
                minifyJS: !isDebug,
                processScripts: ['text/lizard-template'],
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
              });
            } catch(e) {
              grunt.fail.fatal(filepath + ' htmlmin出错:\n' + e);
            }
          }

          // 回滚服务器代码
          contents = contents.replace(
            /@.*?%22.*?%22/g,
            function(match) {
              return unescape(match);
            }
          );

          // 回滚underscore模板
          contents = contents.replace(
            /_=(?:%3C%25([\s\S]+?)%25%3E)/g,
            function(match, $1) {
              match = unescape($1).replace(/\s/g, '');
              return '<%' + match + '%>';
            }
          );

          // 回滚其他underscore模板
          contents = contents.replace(
            /%3C%25(%3D|-)([\s\S]+?)%25%3E/g,
            function(match, $1, $2) {
              match = unescape($2).replace(/\s/g, '');
              return '<%' + unescape($1) + match + '%>';
            }
          );

          // 回滚undersocre js代码
          contents = contents.replace(
            /%3C%25([\s\S]+?)%25%3E/g,
            function(match, $1) {
              match = unescape($1).trim();
              // 删掉注释
              match = match
                        .replace(/[^'":]\/\/.*/g, '')
                        .replace(/\/\*[\s\S]*?\*\//g, '')
                        .replace(/;[\s\t]*\n+/g, ';')
                        .replace(/;\s*/g, ';')
                        .replace(/\{\s*/g, '{')
                        .replace(/\s*\}/g, '}')
                        .trim();
                        
              return '<%' + match +'%>';
            }
          );

          // 回滚style标签
          contents = contents.replace(
            /%3Cstyle[(?:%3E)]*%3E[\s\S]*?%3C\/style%3E/g,
            function(match) {
              match = unescape(match);
              match = htmlMinify(match, {
                minifyCSS: !isDebug,
                removeStyleLinkTypeAttributes: true
              });

              return match;
            }
          );

          // 加版本号
          contents = contents.replace(
            /[\w-\/\.]+\.(js|css|png|jpg)['"]/g,
            function(match) {
              var framework = [
                '/lizard.seed.js',
                'pic.c-ctrip.com/h5/common',
                'styles/h5/common/main.css',
                'web/lizard.hybrid.js'
              ];
              var isFind = false;
              framework.forEach(function(item) {
                if (match.indexOf(item) != -1) {
                  isFind = true;
                }
              });

              if (isFind) return match;

              return match.replace(/\.(js|css|png|jpg)/, function($1, $2) {
                return $1 + '?v=' + grunt.template.today('yyyymmdd_h_MM');
              });
            }
          );

          // 路径dest替换
          contents = contents.replace(
            new RegExp('\/' + channel + '\/' + config.webresourceSrc, 'ig'),
            function(match) {
              var src = config.webresourceSrc;
              return match.replace(src, 'dest/' + src);
            }
          );

          if (!isDebug) {
            contents = contents.replace(
              /<script\s+type=\"text\/lizard-config\">[\w\W]+?<\/script>/,
              function(match) {
                var reg = /<script\s+type=\"text\/lizard-config\">([\w\W]+)<\/script>/;
                var js = 'var obj=' + match.replace(reg, function($1, $2) {
                  return $2.trim();
                });
                var result;

                try {
                  result = uglifyJs.minify(js, {
                    fromString: true
                  });
                } catch (e) {
                  grunt.fail.fatal(filepath + ' 压缩text/lizard-config出错:\n' + e);
                }
               
                result = '<script type="text/lizard-config">' +
                         result.code.substr(8)
                          .replace(/;$/, '')
                          // 解决lizard.D bug
                          .replace(/Lizard.D\((.*?)\)/g, function($1, $2) {
                            return 'Lizard.D(' + $2 +') ';
                          }) +
                       '</script>';

                return result;
              }
            );
          }
          
          // Lizard 2.1框架引用
          if (/layout\.cshtml$/i.test(filepath)) {
            contents = contents.replace(
              /<script.+?src=.+?2.1\/web\/lizard.hybrid.js.+?><\/script>/,
              function(match) {
                return escape(match);
              }
            );
          }

          if (/viewstart\.cshtml$/i.test(filepath)) {
            // 处理layout
            contents = contents.replace(
              /(layout[\s\S]*?)views\//i,
              '$1dest/views/'
            );
          }

          // 乱码
          contents = '\uFEFF' + contents;
          return contents;
        }
      }
    );

    grunt.task.run(tasks);
  });
  
  /**
   * @description hybrid任务
   */
  grunt.registerTask('hybrid2.0', function() {
    var webappPath = grunt.option('path');
    var config;
    if (file.existsSync(path.join(webappPath, 'gruntCfg.js'))) {
      config =  require(path.join(webappPath, 'gruntCfg.js'))
    } else {
      config = grunt.file.readJSON(path.join(webappPath, 'gruntCfg.json'));
    }
    var ConfigProfileJson = getConfigGen(webappPath);
    var isDebug = grunt.option('debug');
    var destpath = path.join(webappPath, 'dest');
    var self = this;
    var localRoute = {};
    var imagesResource = [];
    var initConfig = {
      compress: {
        zip: {
          options: {
            mode: 'zip',
            level: 8,
            archive: function() {
              var zip = config.zip;

              if (util.path.isAbsolute(zip)) {
                return path.join(zip, config.hybridChannel + '.zip');
              } else {
                return path.join(webappPath, config.zip, config.hybridChannel + '.zip');
              }
            }
          },
          files: [{
            expand: true,
            cwd: 'webapp/' + config.hybridChannel,
            src: ['**']
          }]
        }
      }
    };

    grunt.task.requires('web2.0');

    grunt.log.writeln('Running 删除webapp文件');

    // 默认参数
    config = util.extend({
      jsExclude: [],
      viewsExclude: []
    }, config);

    try {
      file.rmdirSync('webapp');
    } catch(e) {}

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

    function getHost() {
      return 'http://' + config.host;
    }

    function stringToReg(str) {
      return new RegExp(str.replace(/([\/\.])/g, '\\$1'));
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

    function getImages(contents) {
      var imgs = contents.match(/<img("[^"]*"|'[^']*'|[^>'"])+>/g);

      if (!imgs) return contents;

      imgs.forEach(function(item) {
        var src = item.match(/src\s*=\s*(?:'([^'])+'|"([^"]+)")/);

        if (!src || /<%[\s\S]+?%>/.test(src)) return;
        src = src[2];
        // base64
        if (src.indexOf('/webapp/') == 0 || src.indexOf('data:image') == 0) return;
        if (isExcludeImage(src)) return;

        var relative = src.replace(/^(https?:)?(\/\/)[^\/]+\//, '');
        
        contents = contents.replace(
          stringToReg('src\\s*=\\s*[\'\"]' + src + '[\'\"]'),
          'src="pic/' + relative.toLowerCase() + '"'
        );

        imagesResource.push(src);
      });

      return contents;
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
        localRoute[item] = relative.replace('dest\/', '');
      });
    } 

    function processCsthml(contents, filepath) {
      // 替换confGen
      contents = contents.replace(/@ConfigurationManager\.AppSettings\["([\w-]+)"\]/g, function($1, $2) {
        var value = ConfigProfileJson[config.buEnv][$2];

        return _.isUndefined(value)? '' : value;
      });

      // 去掉版本号
      contents = contents.replace(
        /(\.[\w]+)\?v=[\w-]+/g,
        '$1'
      );

      // 服务器注释
      contents = contents.replace(/@\*.+?\*@/g, '');

      // 删除服务器配置
      contents = contents.replace(/@using\s+system\.configuration;?/ig, '');

      // 图片分析
      contents = getImages(contents);

      // 删除服务器代码
      contents = removeServerCode(contents);

      // 组装模板
      contents = contents.replace(
        /@RenderPage\("([^"]+)"\)/g,
        function($1, $2) {
          var pagePath = path.join(path.dirname(filepath), $2);
          var body = file.readFileSync(
            pagePath,
            { encoding: 'utf8' }
          );

          return body;
        }
      )

      var webappSrcReg = new RegExp('\/webapp\/' + config.channel + '\/dest\/' + config.webresourceSrc, 'g');
      // 静态资源链接替换
      if (isDebug) {
        contents = contents.replace(
          webappSrcReg,
          getHost() + '/webapp/' + config.channel + '/dest/' + config.webresourceSrc
        );
      } else {
        contents = contents.replace(
          webappSrcReg,
          'webresource'
        );
      }

      // layout
      if (/_layout.cshtml/i.test(filepath)) {
        // title
        contents = contents.replace(
          /<title>.*?<\/title>/,
          '<title>' + config.pageTitle + '</title>'
        );

        // appBaseUrl
        contents = contents.replace(
          /<meta[^>]+?name="appBaseUrl"[^>]+>/,
          '<meta name="appBaseUrl" content="/webapp/' + config.channel + '/">'
        );

        // headerview
        contents = contents.replace(
          /headerview"\s+style="/,
          'headerview\" style=\"display:none;'
        );

        // 替换框架
        contents = contents.replace(
          /(http:)?\/\/webresource.c-ctrip.com\/((styles)|(code))/g,
          '../lizard/webresource/$2'
        );

        // 增加localroute
        contents = contents.replace(
          /<\/head>/,
          '<script src="./lizardlocalroute.js"></script></head>'
        );

        // pdConfig
        contents = contents.replace(
          /pdConfig=["'].+?["']/i,
          'pdConfig="webresource/' + config.buConfig + '"'
        );

      } else {
        addLocalRoute(contents, filepath);
        // 变成cmd
        contents = 'define(function(){return' + JSON.stringify(contents) + '});';
        filepath = filepath.replace(/\.[\w-]+$/, '.js');
      }

      // 删除服务器代码@renaderbody()
      contents = contents.replace(/@[\w\.]+\(.*?\)/g, '');
      
      // 删除服务器代码@viewbag.name
      contents = contents.replace(/@\w+(\.\w+)+/g, '');

      return {
        contents: contents,
        filepath: filepath
      };
    }

    function processAsset(contents, filepath) {
      var relative = path.relative(destpath, filepath);

      // bu config
      if (path.relative(config.webresourceSrc, relative) == config.buConfig) {
        if (isDebug) {
          contents = contents.replace(
            'Lizard.appBaseUrl',
            "'" + getHost() + '/webapp/' + config.channel + "/'"
          );

          contents = contents.replace(
            /require\.config\(/,
            'config.urlArgs = Date.now();require\.config\('
          );
        } else {
          contents = contents.replace(
            'Lizard.appBaseUrl',
            '""'
          ).replace('dest/', '');
        }

      }

      // 图片分析 
      if (/\.css$/.test(filepath)) {
        var imageReg = /url\(((https?[^\)]+)|(\/\/[^\)]+))\)/g;
        var imageMatch;

        if (!isDebug) {
          contents = contents.replace(
            imageReg,
            function($1, $2) {
              if (isExcludeImage($2)) return $1;

              imagesResource.push($2);
              var destpath = $2.replace(
                /^(https?:)?(\/\/)[^\/]+\//,
                util.path.unixifyPath(
                  path.relative(
                    path.dirname(relative),
                    'pic'
                  )
                ) + '/'
              );
              return 'url(' + destpath.toLowerCase() + ')';
            }
          );
        }
      }

      return {
        contents: contents,
        filepath: filepath
      };
    }

    // 模板
    grunt.log.writeln('Running 模板复制');

    file.copySync(
      path.join(destpath, 'views'),
      path.join('webapp', config.hybridChannel, 'views'), {
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

    // 生成首页
    grunt.file.copy(
      path.join('webapp', config.hybridChannel, 'views/shared/_layout.cshtml'),
      path.join('webapp', config.hybridChannel, 'index.html')
    );

    // 删除shared文件夹
    file.rmdirSync(
      path.join('webapp', config.hybridChannel, 'views/shared')
    );

    // 写入localroute
    if (localRoute['index']) {
      localRoute.defaultView = 'index';
    } else if (localRoute['/index']) {
      localRoute.defaultView = '/index';
    }
    grunt.log.writeln('Running 写入lizardlocalroute.js');
    file.writeFileSync(
      path.join('webapp', config.hybridChannel, 'lizardlocalroute.js'),
      'window.LizardLocalroute=' + JSON.stringify(localRoute)
    );

    // 静态资源
    grunt.log.writeln('Running 静态资源复制');
    file.copySync(
      path.join(destpath, config.webresourceSrc),
      path.join('webapp', config.hybridChannel, 'webresource'), {
        noProcess: '**/*.{jpg,png,gif}',
        process: processAsset,
        filter: (function() {
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
        })()
      }
    );

    var done = this.async();
    imagesResource = util.unique(imagesResource);
    function downoladPic(picUrl) {
      if (picUrl.indexOf('http') != 0) {
        picUrl = 'http:' + picUrl;
      }
      grunt.log.writeln('Running fetch ' + picUrl);
      request.download({
        url: picUrl,
        rootPath: path.join('webapp', config.hybridChannel, 'pic'),
        ignore: true
      }, function(err, res, body, filepath) {
        downoladPic.count++;
        if (err) return grunt.log.error('Fetch pic ' + picUrl + err);

        if (downoladPic.count == imagesResource.length) {
          util.extend(initConfig, {
            imagemin: {
              dynamic: {
                options: {
                  optimizationLevel: 4
                },
                files: [{
                  expand: true,
                  cwd: path.join('webapp', config.hybridChannel, 'pic'),
                  src: ['**/*.{png,jpg,gif}'],
                  dest: path.join('webapp', config.hybridChannel, 'pic')  
                }]
              }
            }
          });
          // 图片资源优化, zip包
          grunt.initConfig(initConfig);

          if (!isDebug) {
            grunt.tasks(['imagemin', 'compress']);
          }
          done();
        }
      });
    }

    if (imagesResource.length) {
      downoladPic.count = 0;
      imagesResource.forEach(downoladPic);
    } else {
      grunt.initConfig(initConfig);
      if (!isDebug) {
        grunt.tasks(['compress']);
      }
      done();
    }

    // lizard ubt移动
    grunt.log.writeln('Running lizard文件复制');
    file.copySync(
      'lizard',
      'webapp/lizard'
    );
    grunt.log.writeln('Running ubt文件复制');
    file.copySync(
      'ubt',
      'webapp/ubt'
    );
  });

  /**
   * @description
   * web和hybrid一起打
   * grunt package2.0 --path=c:\\path
   * grunt package2.0 --debug --path=c:\\path
   */
  grunt.registerTask('package2.0', ['web2.0', 'hybrid2.0']);
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
      _.each(item, function(value, key) {
        obj[key] = value[0];
      });
    });

    return obj;
  }

  _.each(ConfigProfileJson, function(item ,name) {
    ConfigProfileJson[name] = converToObj(name);
  });

  return ConfigProfileJson;
}