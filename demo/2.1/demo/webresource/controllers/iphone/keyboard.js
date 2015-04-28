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
      'click .js-keyboard-down': 'blurAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: '键盘收起',
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
    blurAction: function() {
      var input = this.$('.js-keyboard-input');

      // 当input file和input text同时用得时候，这样才能让键盘收起
      setTimeout(function() {
        input[0].blur();
      }, 1);
    }
  });

  return View;
});