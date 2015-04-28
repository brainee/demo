/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView'
], function(
  PageView
  ) {
  var View = PageView.extend({
    events: {
      'click .js-btn': 'showReferrerAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'referrer',
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
    showReferrerAction: function() {
      var referrer = this.referrer;
      var log = this.$('.js-log');
      log.html(referrer);
    }
  });
  return View;
});
