(function() {
  var baseUrl = Lizard.appBaseUrl + 'webresource/';
  var isDebug = typeof location != 'undefined' && location.search.indexOf('debug=1') != -1;
  var config = {
    paths: {
      'demoModel': baseUrl + 'model/demoModel',
      'demoStore': baseUrl + 'model/demoStore',
      'precompile': baseUrl + 'lib/precompile',   // uderscore预编译模块
      'indexHtml': baseUrl + 'templates/index.html'
    }
  };

  if (isDebug) {
    config.urlArgs = Date.now();
  }

  require.config(config);
})();