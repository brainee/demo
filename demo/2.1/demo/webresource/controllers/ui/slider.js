/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UISlider'], function (UIDemoView, UISlider) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '横向滚动slider',
        back: true
      });

      this.header.show()

      this.demo01();

    },

demo01: function () {

  var scope = this;
  var sec = this.$('.js_sec01');

  if (!this.slider01) {
    var data = [
      { id: 1, name: '中国' }, { id: 2, name: '美国' }, { id: 3, name: '英国' }
    ];
    for (var i = 0; i < 20; i++) {
      data.push({ id: i + 4, name: '中国' + i });
    }
    this.slider01 = new UISlider({
      displayNum: 3,

      datamodel: {
        data: data,
        itemFn: function (item) {
          return '<div style="width: 90%; height: 95%; background: white; border: 1px solid black; margin: 2.5% auto; text-align: center; vertical-align: middle;  line-height: 90px; ">' + item.name + '</div>';
        }
      },
      wrapper: this.$('.demo1'),
      changed: function (item) {
        sec.html('当前选择：' + 'id: ' + item.id + ', ' + 'name: ' + item.name);
      }
    });
  }
  var item = this.slider01.getSelected();
  sec.html('当前选择：' + 'id: ' + item.id + ', ' + 'name: ' + item.name);

  this.slider01.show();

},


    onHide: function () {

    }
  });

  return View;
});