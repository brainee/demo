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
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;
      this.header.set({
        back: true,
        title: '设置超时',
        home: false,
        events: {
          returnHandler: function() {
            Lizard.goBack();
          }
        }
      });

    },
    onHide: function() {
    }
  });

  return View;
});