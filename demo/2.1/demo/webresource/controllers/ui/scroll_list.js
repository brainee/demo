/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIRadioList'], function (UIDemoView, UIRadioList) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo02': 'demo02'
    },

demo01: function() {
      
if (!this.list) {
  var el = this.$('.js_demo01');
  var demodata = [{ id: '华语' }, { id: '欧美' }, { id: '工作学习' }, { id: '粤语' }, { id: '轻音乐' }, { id: '咖啡' }];
  this.list = new UIRadioList({
    //数据模型
    datamodel: {
      title: '简单应用',
      data: demodata
    },
    displayNum: 5,
    onClick: function (data, index) {

      el.html(data.id);
      this.hide();
    }
  });
}

this.list.show();

    },


demo02: function () {

  if (!this.list02) {
    var el = this.$('.js_demo02');
    var demodata = [{ id: '华语' }, { id: '欧美' }, { id: '工作学习' }, { id: '粤语' }, { id: '轻音乐' }, { id: '咖啡' }];
    this.list02 = new UIRadioList({
      //数据模型
      datamodel: {
        title: '简单应用',
        data: demodata
      },
      displayNum: 5,
      onCreate: function () {
        //在创建dom时候处理头部标题
        var $title = this.$('.js_title');
        $title.css('float', 'left');
        $('<div style="float: right;" class="js_close">关闭</div>').insertBefore($title);
      },
      //关闭回调增加
      events: {
        'click .js_close': 'closeAction'
      },
      closeAction: function () {
        this.hide();
      },
      onClick: function (data, index) {
        el.html(data.id);
        this.hide();
      }
    });
  }

  this.list02.show();

},

    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '滚动list组件',
        back: true
      });

      this.header.show()
    },
    onHide: function () {

    }
  });

  return View;
});