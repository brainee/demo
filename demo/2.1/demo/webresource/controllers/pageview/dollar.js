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
      'click .js-btn': 'showNodeAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: '$',
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
    showNodeAction: function(e) {
      var input = this.$('.js-input');
      input.css('background',"#ccc");
    }
  });

  return View;
});
