/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIAlert'], function (UIDemoView, UIAlert) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo02': 'demo02',
      'click .js_demo03': 'demo03',
      'click .js_demo04': 'demo04',
      'click .js_demo05': 'demo05',
      'click .js_demo06': 'demo06',
    },

    demo01: function () {
      this.showMessage('<ul class="line-list"><li class="line-item js_demo01">框架基本用法</li><li class="line-item js_demo02">框架基本用法-带title</li><li class="line-item js_demo03">框架基本用法-重置回调</li><li class="line-item js_demo04">框架基本用法-showConfirm</li><li class="line-item js_demo05">框架基本用法-showConfirm-回调重置</li></ul>');

      setTimeout(function () {
        $('body').css('height', '3000px');

      }, 3000)


    },

    demo02: function () {
      this.showMessage({
        datamodel: {
          title: '带标题',
          content: '框架基本使用框架基本使用框架基本使用框架基本使用框架基本使用框架基本使用框架基本使'
        }
      });
    },

    demo03: function () {
      this.showMessage({
        datamodel: {
          content: '框架使用1'
        },
        okAction: function () {
          alert('重置回调');
          this.hide();
        }
      });
    },

    demo04: function () {
      this.showConfirm({
        datamodel: {
          content: '框架使用'
        },
        okAction: function () {
          alert('确定');
          this.hide();
        },
        cancelAction: function () {
          alert('取消');
        }
      });
    },

    demo05: function () {
      this.showConfirm({
        datamodel: {
          content: '框架使用',
          btns: [
            { name: '取消1', className: 'js_cancel' },
            { name: '确定1', className: 'js_ok' }
          ]
        },
        okAction: function () {
          alert('重置');
          this.hide();
        }
      });
    },

    demo06: function () {
      if (!this.alert01) {
        this.alert01 = new UIAlert({
          datamodel: {
            content: '单独使用时，注意onHide时候释放资源，按钮样式需要自己定制',
            btns: [
              { name: '知道了', className: 'cui-btns-ok' },
              { name: '不知道', className: 'cui-btns-no' },
              { name: '未知', className: 'cui-btns-unknown' }
            ]
          },
          events: {
            'click .cui-btns-ok': 'okAction',
            'click .cui-btns-no': 'noAction',
            'click .cui-btns-unknown': 'unknownAction'
          },
          okAction: function () {
            alert('知道了');
            this.hide();
          },
          noAction: function () {
            alert('不知道');
            this.hide();
          },
          unknownAction: function () {
            alert('未知');
            this.hide();
          }
        });
      }

      this.alert01.show();
    },

    onCreate: function () {

    },
    onShow: function () {
      this.header.set({
     
        view: this,
        title: '警告框提示demo',
        back: true
      });

      this.header.show()


    },
    onHide: function () {
      if (this.alert01)
        this.alert01.hide();
    }
  });

  return View;
});