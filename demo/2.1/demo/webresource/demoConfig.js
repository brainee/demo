/**
 * @fileoverview BU module config
 * @author wliao <wliao@Ctrip.com> 
 */
(function() {
  var baseUrl = Lizard.appBaseUrl + 'webresource/';
  var isDebug = typeof location != 'undefined' && location.search.indexOf('debug=1') != -1;

  var config = {
    paths: {
      'UIDemoView': baseUrl + 'mvc/view',
      'cHighlight': baseUrl + 'mvc/c.highlight',
      'demoModel': baseUrl + 'models/demoModel',
      'demoStorage': baseUrl + 'storage/demoStorage',
      'indexHtml': baseUrl + 'templates/index.html'
    }
  };

  if (isDebug) {
    config.urlArgs = Date.now();
  }
  //Hybrid头部问题
  setTimeout(function () {
      var headerview = $('#headerview');
      if (navigator.userAgent.indexOf('ctrip') > -1) {
          headerview.addClass('cm-header-hybird-wrap');
      } else {
          headerview.removeClass('cm-header-hybird-wrap');
      }
  }, 1000);
  require.config(config);
})();