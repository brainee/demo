(function() {
  var baseUrl = "http://172.16.142.54:5389/webapp/monitor/dest/webresource/";
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
;

define('text!indexHtml',[],function () { return '<div>\n  <ul>\n    <li>1\n    <li>2\n  </ul>\n</div>';});

