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
      'click .js-toast-basic': 'showToastBasic',
      'click .js-toast-nomask': 'showToastNoMask',
      'click .js-toast-close': 'showToastClose'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'showToast',
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
    showToastBasic: function() {
      this.showToast({
        datamodel: {
          content: '内容'
        }
      });
    },
    showToastNoMask: function() {
      this.showToast({
        datamodel: {
          content: '无蒙层'
        },
        needMask: false
      });
    },
    showToastClose: function() {
      this.showToast({
        datamodel: {
          content: '点击蒙层不关闭，5秒关闭'
        },
        maskToHide: false,
        timeout: 5000
      });
    }
  });

  return View;
});