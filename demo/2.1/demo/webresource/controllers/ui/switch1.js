/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UISwitch'], function (UIDemoView, UISwitch) {

  var View = UIDemoView.extend({
    events: {
      'click .js_sec01': function () {
        if (this.uiSwitch01) {
          if (this.uiSwitch01.getStatus()) this.uiSwitch01.unChecked();
          else this.uiSwitch01.checked();
        }
      }
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'switch组件',
        back: true
      });

      this.header.show();

      this.demo01();
      this.demo02();

    },

demo01: function () {
  var scope = this;
  var pre_str = '当前状态：';
  this.uiSwitch01 = new UISwitch({
    wrapper: this.$el.find('.js_demo01'),
    changed: function (status) {
      scope.$('.js_sec01').html(pre_str+status);
    }
  });
  this.uiSwitch01.show();
  this.$('.js_sec01').html(pre_str+this.uiSwitch01.getStatus());
},
demo02: function () {
  var scope = this;
  var pre_str = '当前状态：';
  this.uiSwitch02 = new UISwitch({
    wrapper: this.$el.find('.js_demo02')
  });
  this.uiSwitch02.show();

  this.uiSwitch03 = new UISwitch({
    wrapper: this.$el.find('.js_demo02'),
    checkAvailabe: function () {
      if (!scope.uiSwitch02.getStatus()) {
        alert('上一个组件为选中状态才可选择')
        return false;
      }
      return true;
    }
  });
  this.uiSwitch03.show();
},

    onHide: function () {

    }
  });

  return View;
});