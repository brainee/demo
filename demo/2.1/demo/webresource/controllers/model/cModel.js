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
      'click .js-model': 'showModelAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'cModel',
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
    showModelAction: function() {
      var detail = demoModel.detail;
      detail.setParam({
        key: 'list',
        price: '35'
      });
      detail.excute(function(data) {
        _log(data);
      }, function(e) {
        console.log(e);
      });
    }
  });

  return View;
});