/**
 * Created by jp_wang on 2014/12/4.
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
        title: 'jump',
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
    jumpAction: function() {
      Lizard.jump('http://m.ctrip.com/webapp/ticket/index');
    }
  });

  return View;
});