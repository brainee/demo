/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UITab'], function (UIDemoView, UITab) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'tab组件',
        back: true
      });

      this.header.show();

      this.demo01();

    },

    demo01: function () {
var scope = this;
var data = [
  { id: 0, name: '中国' },
  { id: 1, name: '美国' },
  { id: 2, name: '日本' }
];
if (!this.tab01) {
  this.tab01 = new UITab({
    datamodel: {
      data: data
    },
    onChange: function (data) {
      scope.$('.js_sec01').html(data.name);

    },
    wrapper: this.$el.find('.js_demo01')
  });
}
this.tab01.show();

this.$('.js_sec01').html(data[this.tab01.getIndex()].name);

    },


    onHide: function () {

    }
  });

  return View;
});