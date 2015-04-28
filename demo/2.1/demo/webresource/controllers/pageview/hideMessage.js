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
      'click .js-message-hide': 'showMessageHide'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'hideMessage',
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
    showMessageHide: function() {
      this.showMessage();
      setTimeout($.proxy(function(){
        this.hideMessage();
      },this),3000);
    }
  });

  return View;
});