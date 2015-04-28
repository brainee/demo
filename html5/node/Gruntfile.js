var isMac = process.platform === 'darwin';

module.exports = function(grunt) {
  //grunt plugins
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      dev: {
        files: [
          'grunt.app.js',
          'vendor/*.js',
          'var/*.js'
        ],
        tasks: ['develop:development'],
        options: { nospawn: true }
      },
      pro: {
        files: [
          'grunt.app.js',
          'vendor/*.js'
        ],
        tasks: ['develop:production'],
        options: { nospawn: true }
      }
    },
    jshint: {
      options: {
        evil: true
      },
      all: [
        'Gruntfile.js', 
        'grunt.app.js',
        'vendor/*.js'
      ]
    }
  });

  /**
   * @description App start
   * @example
   * grunt app
   * grunt app --debug
   */
  grunt.registerTask('app', function() {
    var dev = grunt.option('debug');
    var tasks = [];
    var env = process.env.NODE_ENV;

    if (dev) {
      tasks.push('develop:development', 'watch:dev');
    } else {
      tasks.push('develop:production', 'watch:pro');
    }
    
    grunt.task.run(tasks);
  });

  grunt.registerTask('develop', (function() {
    var start;
    return function(env) {
      var spawn = require('child_process').spawn;
      env = env || 'production';
      // If process is exist then kill it
      if (start) start.kill('SIGTERM');
     
      if (!isMac) {
        start = spawn('node', ['grunt.app.js'], {
          env: {
            NODE_ENV: env
          }
        });
      } else {
        start = spawn('node', ['grunt.app.js']);
      }

      start.stdout.on('data', function (data) {
        console.log('' + data);
      });
      start.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
    };
  })());
};