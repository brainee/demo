(function() {
  var baseUrl = Lizard.appBaseUrl + 'webresource/';
  var isDebug = typeof location != 'undefined' && location.search.indexOf('debug=1') != -1;
  var config = {
    paths: {
      'indexHtml': baseUrl + 'templates/index.html'
    }
  };

  if (isDebug) {
    config.urlArgs = Date.now();
  }

  require.config(config);
})();