/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView'], function (UIDemoView) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '标题',
        back: true
      });

      this.header.show()
    },
    onHide: function () {

    }
  });

  return View;
});