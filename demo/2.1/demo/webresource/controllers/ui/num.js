/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UINum'], function (UIDemoView, UINum) {

  var cUINum = _.inherit(UINum, {
    setVal: function ($super, v) {
      if (!this.changeAble(v)) {
        return;
      }
      $super(v);
    },
    //@override
    changeAble: function () {
    }
  });

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '数组增减组件',
        back: true
      });

      this.header.show();

      this.demo01();
      this.demo02();

    },

    demo01: function () {
      if (!this.num01) {
        this.num01 = new cUINum({
          changeAble: function () {
            return true;
          },
          //数据模型，会影响插件渲染
          datamodel: {
            min: 1,//最小值
            max: 9,//最大值
            curNum: 1,//当前值
            unit: '个',//数字单位
            needText: true//是否需要编辑文本
          },
          //UI组件包裹器，会放到什么容器里面
          wrapper: this.$('.js_demo01'),
          //数字改变时触发的事件
          changed: function (num) {
            console.log('num changed ' + num);
          }
        });
      } else {
        //这里可以做重置工作
      }

      this.num01.show();

    },

    demo02: function () {
      var scope = this;

      if (!this.num02) {
        this.num02 = new UINum({
          wrapper: this.$('.js_demo02'),
          changed: function (num) {
            console.log('num changed ' + num);
          }
        });
      } else {
        //这里可以做重置工作
      }
      this.num02.show();

      //联动操作
      if (!this.num03) {
        this.num03 = new UINum({
          wrapper: this.$('.js_demo02'),
          changed: function (num) {
            console.log('num changed ' + num);
          },
          availableFn: function () {
            if (scope.num02.getVal() == 5) return true;
            alert('需要上一个组件为5才可选');
            return false;
          },
        });
      } else {
        //这里可以做重置工作
      }
      this.num03.show();

    },

    onHide: function () {

    }
  });

  return View;
});