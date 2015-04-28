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
      this.$('.js-log').html(Lizard.restfullApi);
    },
    onShow: function () {
      this.header.set({
        title: 'lizard',
        subtitle: 'restfullApi',
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