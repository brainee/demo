/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIScroll'], function (UIDemoView, UIScroll) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'IScroll局部滚动库',
        back: true
      });

      this.header.show();

      this.demo01();
      this.demo02();

    },


demo01: function () {
  if (!this.scoell01)
    this.scroll01 = new UIScroll({
      wrapper: this.$('.js_demo01'),
      scroller: this.$('.js_scroll01'),
      scrollbars: false,
      scrollType: 'x'
    });
},

demo02: function () {
  if (!this.scoell02)
    this.scroll01 = new UIScroll({
      wrapper: this.$('.js_demo02'),
      scroller: this.$('.js_scroll02'),
      step: 200,
      scrollType: 'y'
    });
},

onHide: function () {
}

  });

  return View;
});