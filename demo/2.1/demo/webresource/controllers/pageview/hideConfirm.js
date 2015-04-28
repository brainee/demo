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
      'click .js-confirm-hide': 'showHideConfirm'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'hideConfirm',
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
    showHideConfirm: function() {
      this.showConfirm();
      setTimeout($.proxy(function () {
        this.hideConfirm();
      }, this), 3000);
    }
  });

  return View;
});