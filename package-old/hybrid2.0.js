var _ = require('lodash');
var grunt = require('grunt');
var path = require('path');
var file = require('file-system');
var spawn = require('child_process').spawn;
var chanelConfig = require('./config');
var webappPath = chanelConfig.paths[chanelConfig.defaultPath];
var gruntCfg = grunt.file.readJSON(path.join(webappPath, 'gruntCfg.json'));
var hybridConfig = gruntCfg.hybrid;
var isDebug = (function() {
  var args = process.argv;
  var hasDebug = _.indexOf(args, '--debug');

  return hasDebug !== -1;
})();

if (chanelConfig.hybrid) {
  _.merge(chanelConfig, chanelConfig.hybrid);
  delete chanelConfig.hybrid;
}

chanelConfig = _.merge(hybridConfig, chanelConfig);

chanelConfig.zip = (function() {
  var zip = chanelConfig.zip ? chanelConfig.zip : '';

  if (!/^[\w]:\\/.test(zip) && !/^\//.test(zip)) {
    zip = path.join(chanelConfig.paths[chanelConfig.defaultPath], zip);
  }

  return zip;
})(); 

var webresourcePath = path.join('webapp', chanelConfig.channel, 'dest/', gruntCfg.webresourceSrc);

if (chanelConfig.hybridChannel) {
  chanelConfig.channel = chanelConfig.hybridChannel;
  delete chanelConfig.hybridChannel;
}

if (!chanelConfig.commons) {
  chanelConfig.commons = {};
}

if (isDebug) {
  chanelConfig.jsMini = false;
  var debugViews = {};
  _.each(chanelConfig.views, function(value, key) {
    debugViews[key + '?debug=1'] = 1;
  });
  chanelConfig.views = debugViews;
}

grunt.file.write('webapp2hybrid/busbu.json', JSON.stringify(chanelConfig));

var start = spawn('node', ['busbu.js', '--path=busbu.json'], {
  cwd: path.join(__dirname, 'webapp2hybrid')
});

start.stdout.on('data', function (data) {
  console.log('' + data);
});

start.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});


start.on('close', function(code) {
  if (code) return;

  grunt.log.ok('Running after hybrid tasks');

  var initConfig = {};
  var webappPath = path.join(__dirname, 'webapp2hybrid/webapp', chanelConfig.channel);

  initConfig.imagemin = {
    dynamic: {
      options: {
        optimizationLevel: 4
      },
      files: [{
        expand: true,
        cwd: webappPath,
        src: ['**/*.{png,jpg,gif}'],
        dest: webappPath 
      }]
    }
  };
  // Create hybrid zip package
  initConfig.compress = {
    zip: {
      options: {
        mode: 'zip',
        level: 8,
        archive: function() {
          return path.join(chanelConfig.zip, chanelConfig.channel + '.zip');
        }
      },
      files: [{
        expand: true,
        cwd: 'webapp2hybrid/webapp/' + chanelConfig.channel,
        src: ['**']
      }]
    }
  }

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.initConfig(initConfig);

  // bu环境控制
  if (chanelConfig.buEnv) {
    grunt.log.writeln('Running configGen环境变量替换');
    configGen();
  }

  if (!isDebug) {
    grunt.tasks(['imagemin']);
  }

  grunt.tasks(['compress']);  
  
  // ubt文件件移动
  grunt.log.writeln('Running ubt文件复制');
  file.copySync(
    path.join(__dirname, 'webapp2hybrid/lizard/ubt'),
    path.join(__dirname, 'webapp2hybrid/webapp/ubt')
  );

  if (!chanelConfig.multiChannels) return;
  multiChannels();
});

function configGen() {
  var parseString = require('xml2js').parseString;
  var ConfigProfile = file.readFileSync(path.join(webappPath, 'ConfigProfile.xml'));
  var ConfigProfileJson = {};
  var hybridWebappPath = path.join('webapp2hybrid/webapp', chanelConfig.channel);

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

  file.copySync(hybridWebappPath, hybridWebappPath, {
    filter: [
      '**/*.html',
      '**/*.html.js'
    ],
    process: function(contents, filepath) {
      var buEnv = ConfigProfileJson[chanelConfig.buEnv];

      _.each(ConfigProfileJson, function(item) {
        _.each(item, function(item, key) {
          item = item.replace(/([\/\.])/g, '\\$1');
          var reg = new RegExp('([\'\"])' + item, 'g');

          contents = contents.replace(reg, '$1' + buEnv[key]);
        });
      });
      
      return contents;
    }
  });
}

function multiChannels() {
  // 多频道打包
  var fs = require('fs');
  var files = fs.readdirSync(webappPath);

  files = files.filter(function(item) {
    return !chanelConfig.commons[item];
  });

  function fileRecurse(abs, callback) {
    fs.readdir(abs, function(error, dirname) {
      if (error) return;

      dirname.forEach(function(item) {
        var absPath = path.join(abs, item);

        if (grunt.file.isDir(absPath)) {
          callback(absPath);
          fileRecurse(absPath, callback);
        }
      });
    });
  }

  files.forEach(function(file) {
    var fileAbs = path.join(webappPath, file, 'package', webresourcePath);

    fileRecurse(fileAbs, function(item) {
      var packname = path.relative(fileAbs, item);

      packname = packname.split(/[\/\\]/);
      packname = packname[1];

      if (!packname || file == packname) return;

      // 删除不必要的文件
      grunt.file.delete(item, {
        force: true
      });

    });
  });
}