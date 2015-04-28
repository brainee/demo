/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView'
], function (
  PageView
  ) {
  var View = PageView.extend({
    events: {
      'click .js-index-jump': 'indexJumpAction'
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        title: '2.0框架ui',
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });
      this.header.show();
    },
    onHide: function () {
    },
    indexJumpAction: function(e) {
      var url = this.$(e.target).attr('data-filter');
      Lizard.goTo(Lizard.appBaseUrl + "ui/" + url);
    }
  });

  return View;
});