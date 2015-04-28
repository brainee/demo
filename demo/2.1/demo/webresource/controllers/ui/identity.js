/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIIdentitycard'], function (UIDemoView, UIIdentitycard) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01'
    },

    demo01: function () {

if (!this.identity) {
  var targetEl = this.$('.js_identity')
  this.identity = new UIIdentitycard({
    targetEl: targetEl,
    itemClickAction: function (val) {
      var num = targetEl.html() + val.toString();
      num = num.replace(/\s*/g, "");
      if (num.length > 16) return;
      targetEl.html(this._handleNum(num));
    },
    deleteAction: function () {
      var num = targetEl.html();
      num = num.replace(/\s*/g, "");

      targetEl.html(this._handleNum(num.substr(0, num.length - 1)));
    },
    _handleNum: function (num) {
      var numStr = '', i = 0, len = 0;
      //首先取数据时候，做替换；其次再做样式替换
      len = num.length;
      for (i; i < len; i++) {
        numStr = numStr + num[i];
        if (i > 0 && i < (len - 1) && ((i + 1) % 4 == 0))
          numStr = numStr + ' ';
      }
      return numStr;
    }
  });
}
this.identity.show();
    },

    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '身份证组件',
        back: true
      });

      this.header.show()
    },
    onHide: function () {
      if (this.identity) this.identity.hide();
    }
  });

  return View;
});