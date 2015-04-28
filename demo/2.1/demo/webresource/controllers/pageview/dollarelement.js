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
      'click .js-btn': 'showElAction'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: '$el',
        back: true,
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });
      this.header.show();
      console.log(this.$el);
    },
    onHide: function() {
    },
    showElAction: function() {
      var el = this.$el;
      var log = this.$('.js-log');
      log.html(el.attr('page-url'));
    }
  });

  return View;
});