
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
      'click .js-jump': 'jumpAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'scrollZero',
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
      _log(this.scrollPos);
    },
    jumpAction: function() {
      Lizard.goBack();
    }
  });

  return View;
});