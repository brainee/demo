/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UILayerList'], function (UIDemoView, UILayerList) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01'
    },

    demo01: function () {
      var scope = this;
      if (!this.list) {
        var data = [];

        for (var i = 0; i < 4; i++) {
          data.push({ name: '更多操作' + i });
        }

        this.list = new UILayerList({
          datamodel: {
            list: data
          },
          onItemAction: function (item) {
            scope.$('.listSec').html(item.name);
            this.hide();
          }
        });
      }

      this.list.show();
    },

    onCreate: function () {

    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '下面上来的弹出层列表',
        back: true
      });

      this.header.show()
    },
    onHide: function () {
      if (this.list) this.list.hide();
    }
  });

  return View;
});