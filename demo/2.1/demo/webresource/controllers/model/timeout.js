/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'demoModel'
], function(
  PageView,
  demoModel
  ) {
  var View = PageView.extend({
    events: {
      'click .js-timeout-model': 'showTimeoutAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'model设置timeout',
        back: true,
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });

      this.header.show();
    },
    onHide: function() {

    },
    showTimeoutAction: function() {
      var timeout = demoModel.timeout;
      timeout.excute(function(data) {
        _log(data);
      }, function(e) {
        console.log('请求超时');
      });
    }
  });

  return View;
});