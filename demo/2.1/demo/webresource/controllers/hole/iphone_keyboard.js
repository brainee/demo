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
    onShow: function () {
      this.header.set({
        title: 'iphone-键盘收起',
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

    }
  });

  return View;
});