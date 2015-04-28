var path = require('path');
var file = require('file-system');
var util = require('utils-extend');
var request = require('ajax-request');
var url = require('url');
var uglifyCshtml = require('./vendor/uglify-cshtml');
var uglifyHtml = require('./vendor/uglify-html');
var requirejs = require('requirejs');
var config, isDebug;
var webappPath = 'D:\\code\\Ctrip.You.WebApp\\Ctrip.You.WebApp.Host'; // 在此处配置你自己的源码路径

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

  function getIncludePath(paths) {
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
  }

  function getModulePath(filepath) {
    var buConfig = file.readFileSync(filepath, { encoding: 'utf8' });
    // 自动分析模块路径
    buConfig.replace(/paths\s*:\s*({[\s\S]*?})/g, function(match, $1) {
      $1 = 'return ' + $1.replace(
        /baseUrl\s*\+\s*/g,
        ''
      ).trim();
      $1 = new Function($1)();
      util.extend(config.paths, $1);
      var relative = path.relative(path.join(webappPath, config.webresourceSrc), filepath);
      modules = grunt.config('modules');
      modules.push({
        name: relative.replace(/\.js$/, ''),
        include: getIncludePath($1)
      });
      grunt.config('modules', modules);
    });
  }

  function getDebugCode() {
    var code = file.readFileSync('./vendor/debug-code.js', { encoding: 'utf8' });
    return '<script>'+ code + '</script>';
  }

  // 初始化变量任务
  grunt.registerTask('init2.0', function() {
    var pkg = grunt.file.readJSON('package.json');
    webappPath = grunt.option('path') || webappPath;
    isDebug = grunt.option('debug');
    config = require(path.join(webappPath, 'gruntCfg.js'));
    // Default options extend
    config = util.extend({
      paths: {},
      skipModuleInsertion: true,
      frameworkExclude: [],
      viewsExclude: [],
      jsExclude: [],
      resourceExclude: [],
      modules: [],
      replace: {
        web: [],
        hybrid: []
      }
    }, config);

    // 多频道
    grunt.config('modules', []);
    config.channels.forEach(function(item) {
      item.dir = item.name;
      item.zipName = item.zipName || item.name;
      item.hybridDir = item.zipName;
      item.buConfig = 'js/'+ item.name + '/require_config.js';
      item.viewsExclude = item.viewsExclude || [];
      if (item.children) {
        item.children.forEach(function(item2) {
          item2.dir = item.name + '/' + item2.name;
          item2.hybridDir = item.zipName + '/' + item2.name;
          item2.viewsExclude = item2.viewsExclude || [];
          item2.buConfig = 'js/' + item2.name + '/require_config.js';
          getModulePath(path.join(webappPath, config.webresourceSrc, item2.buConfig));
        });
      } else {
        getModulePath(path.join(webappPath, config.webresourceSrc, item.buConfig));
      }
    });

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

    if (!config.hybridChannel) {
      config.hybridChannel = config.channel;
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
    grunt.loadNpmTasks('grunt-contrib-imagemin');
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
        cwd: path.join('webapp', config.hybridChannel, 'pic'),
        src: ['**/*.{png,jpg,gif}'],
        dest: path.join('webapp', config.hybridChannel, 'pic')  
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
    var isHybrid = env !== 'web';
    var compressOpts = {
      drop_console: true
    };
    var dir, isHybrid, modules;

    if (isHybrid) {
      dir = path.join('webapp', config.hybridChannel, 'webresource');
    } else {
      dir = path.join(webappPath, 'dest', config.webresourceSrc);
    }

    if (config.envCodeRemove) {
      compressOpts.global_defs = {
        ISHYBRID: isHybrid
      }
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
        // 替换代码路径
        contents = contents.replace(
          new RegExp('[\'\"]' + config.webresourceSrc + '\/[\'\"]', 'i'),
          '"dest/' + config.webresourceSrc + '/"'
        );

        contents = contents.replace(
          new RegExp('webapp\/' + config.channel + '\/' + config.webresourceSrc, 'ig'),
          'webapp/' + config.channel + '/dest/' + config.webresourceSrc
        );

        // 把webapp前以package开头的再替换回去，因为这是hybrid本地路径
        contents = contents.replace(
          new RegExp('package\/webapp\/' + config.channel + '\/dest\/' + config.webresourceSrc, 'ig'),
          'package/webapp/' + config.channel + '/' + config.webresourceSrc.toLowerCase()
        );

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
          var htmlContent = file.readFileSync(filepath, { encoding: 'utf8' });

          htmlContent = uglifyHtml(htmlContent, filepath);

          return 'define("' + 
            moduleName + 
            '", [], function(){return' + JSON.stringify(htmlContent) + '});';
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
        filter: ['views/**/*'],
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

          contents = uglifyCshtml(contents, filepath);

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
        noProcess: '**/*.{jpg,png,gif,mp3}',
        process: function(contents, filepath) {
          var relative = path.relative(path.join(webappPath,'dest'), filepath);
          
          contents = replace(contents, relative);
          return contents;
        }
      }
    );

    // 如果配置了CDN资源路径，则copy一份到配置的路径下，用于发布
    if(config.cdnResourceSrc) {
      file.copySync(
        destResourcePath,
        path.join(webappPath, 'dest', config.cdnResourceSrc)
      );
    }
  });

  // 复制hybrid views
  grunt.registerTask('hybrid_view_channels2.0', function() {
    var ConfigProfileJson = getConfigGen(webappPath);
    var imagesResource = [];
    var webresourcePath = path.join('webapp', config.hybridChannel, 'webresource');
    var layoutName = 'Views/Shared/_Layout.cshtml';

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
      filter: ['**/*.cshtml'],
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
          // 去掉版本号
          match: /(\.[\w]+)(\?v=[\w-\.]+)+/g,
          replacement: '$1'
        },
        {
          // 删除服务器配置
          match: /@using\s+system\.configuration;?/ig,
          replacement: ''
        },
        {
          // 删除服务器代码 @viewbag.name @renaderbody() @Html.Raw(scriptSrc)
          match: /@\w[\w\(\)]*(\.[\w\(\)]+)*/g,
          replacement: ''
        },
        {
          match: new RegExp('\/webapp\/' + config.channel + '\/dest\/' + config.webresourceSrc + '\/js\/.+?(?=\/)', 'g'),
          replacement: function(match) {
            if (isDebug) {
              return getHost() + match;
            } else {
              var channel = this.filepath.split(path.sep)[1];
              var l = config.channels.length;

              while(l--) {
                if (!config.channels[l].children && config.channels[l].name == channel) {
                  return 'webresource/js/' + channel;
                }
              }
              return '../webresource/js/' + channel;
            }
          }
        }
      ]
    }
    ]);
    config.replace.hybrid.forEach(function(item) {
      item.filterFn = file.fileMatch(item.filter, true)
    });

    function processCshtml(contents, filepath, relative, hybridDir) {
      // 组装模板
      contents = (function(contents)  {
        var func = arguments.callee;
        return contents.replace(
          /@RenderPage\("([^"]+)"\)/g,
          function($1, $2) {
            var pagePath = path.join(path.dirname(filepath), $2);
            var body = file.readFileSync(
              pagePath,
              { encoding: 'utf8' }
            );
            if(/@RenderPage/.test(body)) {
              body = func(body);
            }
            return body.trim();
          }
        ).trim();
      })(contents);

      // 替换任务
      contents = replace(contents, path.relative(webappPath, filepath).replace(/dest[\/\\]/, ''), 'hybrid');

      // 删除服务器代码
      contents = removeServerCode(contents);

      // 变成cmd
      contents = 'define(function(){return' + JSON.stringify(contents) + '});';
      //filepath = filepath.replace(/\.[\w-]+$/, '.js');

      filepath = path.join('webapp', hybridDir, 'views', relative).replace(/\.[\w-]+$/, '.js');
    
      return {
        contents: contents,
        filepath: filepath
      };
    }

    // 复制模板
    function copyView(channel) {
      if (channel.emptyView) return;
      var localRoute = {};
      var srcPath = path.join(webappPath, 'dest/views', channel.name);

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
          localRoute[item] = relative.replace('dest\/', '').replace(channel.name + '/', '');
        });
      }

      // 生成index.html
      var dest = path.join('webapp', channel.hybridDir, 'index.html');
      var itemIndexHtml = indexHtml;

      itemIndexHtml = itemIndexHtml.replace(
        /(http:)?\/\/webresource.c-ctrip.com\/((styles)|(code))/g,
        function(match, $1, $2) {
          var length = channel.hybridDir.split('/').length;
          var lizardPath = '/lizard/webresource/' + $2;

          if (length == 2) {
            lizardPath = '../..' + lizardPath;
          } else if (length == 1) {
            lizardPath = '..' + lizardPath;
          }

          return lizardPath;
        }
      ).replace(
        /<meta[^>]+?name="appBaseUrl"[^>]+>/,
        '<meta name="appBaseUrl" content="/webapp/' + config.channel + '/">'
      ).replace(
        '<\/head>',
        function(match) {
          var code = '<script src="./lizardlocalroute.js"></script>'+ match;
          if (isDebug) {
            return getDebugCode() + code
          } else {
            return code;
          }   
        }
        
      ).replace(
        /\/webapp\/you\/WebResource/ig,
        function() {
          var length = channel.hybridDir.split('/').length;

          if (length == 2) {
            return '../webresource';
          } else {
            return 'webresource';
          }
        }
      ).replace(
        /@ViewContext\.RouteData\.Values\["controller"\]/g,
        channel.name
      ).replace(
        'src="http://m.ctrip.com',
        'src="'
      ).replace(
        /@using\s+system\.configuration;?/ig,
        ''
      ).replace(
        /@\w[\w\(\)]*(\.[\w\(\)]+)*/g,
        ''
      ).replace(
        /@\(.*\)/g,
        ''
      );


      file.copySync(
        srcPath,
        path.join('webapp', channel.hybridDir, 'views'), {
          process: function(contents, filepath, relative) {
            addLocalRoute(contents, filepath);
            return processCshtml(contents, filepath, relative, channel.hybridDir);
          },
          filter: (function() {
            var defaults = ['**/*'];

            channel.viewsExclude.forEach(function(item) {
              defaults.push('!' + item);
            });

            return defaults;
          })()
        }
      );

      // index.html替换任务
      itemIndexHtml = replace(itemIndexHtml, 'views/' + channel.name + '/index.html', 'hybrid');

      itemIndexHtml = removeServerCode(itemIndexHtml);
      file.fs.writeFileSync(dest, itemIndexHtml);

      if (channel.defaultView) {
        localRoute.defaultView = channel.defaultView;
      } else if (localRoute['index']) {
        localRoute.defaultView = 'index';
      } else if (localRoute['/index']) {
        localRoute.defaultView = '/index';
      }

      // 生成localroute
      file.writeFileSync(
        path.join('webapp', channel.hybridDir, 'lizardlocalroute.js'),
        'window.LizardLocalroute=' + JSON.stringify(localRoute)
      );
    }

    // 移动静态资源
    function moveResource(channel) {
      var destBuild = path.join('webapp', channel.hybridDir, 'webresource/build');
      var destJs = path.join('webapp', channel.hybridDir, 'webresource/js')

      file.mkdirSync(destBuild);
      file.mkdirSync(destJs);
      // 移动build文件夹
      file.renameSync(
        path.join(webresourcePath, 'build', channel.name),
        path.join(destBuild, channel.name)
      );
      // 移动js文件夹
      file.renameSync(
        path.join(webresourcePath, 'js', channel.name),
        path.join(destJs, channel.name)
      );
    }

    var indexHtml = (function() {
      var filepath = path.join(webappPath, 'dest', layoutName);
      var html = file.readFileSync(filepath, {
        encoding: 'utf8'
      });

      // 组装模板
      html = html.replace(
        /@RenderPage\("([^"]+)"\)/g,
        function($1, $2) {
          var pagePath = path.join(path.dirname(filepath), $2);
          var body = file.readFileSync(
            pagePath,
            { encoding: 'utf8' }
          );
          return body.trim();
        }
      ).replace(
        /@ConfigurationManager\.AppSettings\["([\w-]+)"\]/g,
        function(match, $1) {
          var value = ConfigProfileJson[config.buEnv][$1];

          return util.isUndefined(value)? '' : value;
        }
      ).trim();

      return html;
    })();


    // webresource自定义替换
    file.copySync(
      webresourcePath,
      webresourcePath, {
        noProcess: '**/*.{jpg,png,gif}',
        process: function(contents, filepath) {
          var relative = config.webresourceSrc + '/' + path.relative(webresourcePath, filepath);

          // 替换任务
          contents = replace(contents, relative, 'hybrid');
          return contents;
        }
      }
    );



    // 删除不需要的静态资源
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
    })(), true);
    file.recurseSync(
      webresourcePath, 
      function(filepath, relative, filename) {
        if (!filename) return;
        //var relative = path.relative(webresourcePath, filepath);

        relative = util.path.unixifyPath(relative);

        if (!deleteFilter(relative)) {
          file.unlinkSync(filepath);
          clearFolders(filepath);
        }
      }
    );

    // view复制
    config.channels.forEach(function(item) {
      if (item.children) {
        item.children.forEach(function(item2) {
          if(!item2.hybridIgnore) {
            copyView(item2);

            // 根据频道名称更新目录大小写
            file.renameSync(
              path.join(webresourcePath, 'js', item2.name),
              path.join(webresourcePath, 'js', item2.name)
            );
          }
        });
      } else {
        if(!item.hybridIgnore) {
          copyView(item);
          moveResource(item);
        }
      }
    });

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
  });

  // 下载三方图片资源
  grunt.registerTask('image_download', function() {
    var imagesResource = grunt.config('imagesResource');
    if (!imagesResource.length) return;
    if (isDebug) return;

    var done = this.async();
    var count = 0;
    imagesResource.forEach(function(picUrl) {
      if (picUrl.indexOf('http') != 0) {
        picUrl = 'http:' + picUrl;
      }
      grunt.log.writeln('Running fetch ' + picUrl);
      request.download({
        url: picUrl,
        rootPath: path.join('webapp', config.hybridChannel, 'pic'),
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
    var count = 0;
    var l = config.channels.length;
    

    config.channels.forEach(function(item) {
      var dest = path.join(webappPath, item.zipPath || 0, item.zipName + '.zip')
      filePackage(
        path.join('webapp', item.zipName), 
        dest, {
        level: 9,
        packageRoot: item.zipName,
        done: function(size) {
          grunt.log.writeln('Created ' + dest + ' (' + size + ' bytes)');
          count++;
          if (count === l) {
            done();
          }
        }
    });
  });
  });

  

  /**
   * @description
   * web包
   * grunt web2.0 --path=c:\\path
   * grunt web2.0 --path=c:\\path --debug --imagemin=false
   */
  grunt.registerTask('web2.0', ['init2.0', 'clear2.0:web', 'requirejs2.0:web', 'web_views2.0', 'imagemin2.0:web']);

  /**
   * @description
   * web和hybrid一起打
   * grunt package2.0 --path=c:\\path
   * grunt package2.0 --path=c:\\path --debug --imagemin=false
   */
  grunt.registerTask('package2.0', ['web2.0', 'clear2.0:hybrid', 'requirejs2.0:hybrid', 'hybrid_view_channels2.0', 'imagemin2.0:hybrid', 'zip2.0']);

}