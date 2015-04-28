/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIToast'], function (UIDemoView, UIToast) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo02': 'demo02',
      'click .js_demo03': 'demo03',
      'click .js_demo04': 'demo04',
    },

    demo01: function () {
      this.showToast('框架基本使用');
    },

    demo02: function () {
      this.showToast({
        datamodel: {
          content: '框架使用'
        },
        needMask: false
      });
    },

    demo03: function () {
      this.showToast({
        datamodel: {
          content: '带蒙版，点击蒙版不关闭，3秒关闭'
        },
        maskToHide: false,
        hideSec: 3000
      });
    },

    demo04: function () {
      if (!this.toast01) {
        this.toast01 = new UIToast({
          datamodel: {
            content: 'two second close'
          },
          needAnimat: false,
          hideSec: 2000
        });
      }
      this.toast01.show();
    },

    onCreate: function () {

    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'toast提示demo',
        back: true
      });

      this.header.show()
    },
    onHide: function () {
      if (this.toast01) {
        this.toast01.hide();
      }
    }


  });

  return View;
});