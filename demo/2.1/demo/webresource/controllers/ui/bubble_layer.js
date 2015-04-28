/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIBubbleLayer'], function (UIDemoView, UIBubbleLayer) {

  var View = UIDemoView.extend({
    events: {
      'click .js_demo01': 'demo01',
      'click .js_demo02': 'demo02'
    },

    demo01: function (e) {
      if (!this.demo1) {
        this.dom01 = this.$('.js_demo01');
        var scope = this;
        var data = [
          { name: '价格/星级' },
          { name: '位置区域' },
          { name: '品牌' },
          { name: '测试' }
        ];
        var el = $(e.currentTarget);
        var index = parseInt(Math.random() * 4);
        var dir = (e.pageY > 200) ? 'down' : 'up';
        this.demo1 = new UIBubbleLayer({
          triggerEl: el,
          datamodel: {
            data: data,
            dir: dir,
            index: index
          },
          onClick: function (data, index, el) {
            console.log(arguments);
            this.setIndex(index);
            this.hide();
            scope.dom01.html(data.name);
          }
        });
      }

      this.demo1.show();

    },

    demo02: function (e) {
      if (!this.layer) {
        var scope = this;
        var data = [
          { name: '价格/星级' },
          { name: '评分', tips: '越高越好' },
          { name: '价格', tips: '越低越好' },
          { name: '距离', tips: '测试换行 测试换行测试换行测试换行测试换行测试换行' }
        ];
        var el = $(e.currentTarget);
        var index = parseInt(Math.random() * 4);
        var dir = (e.pageY > 200) ? 'down' : 'up';
        this.layer = new UIBubbleLayer({
          triggerEl: el,
          datamodel: {
            //设置该函数的话，每一项目的结构便定制化了，这里要求返还一个字符串，这个里作用域指向组件本身
            //第一个参数为对应数据，第二个参数为索引
            itemFn: function (item, index) {
              var str = item.name;
              if (item.tips) str += '-<span style="color: red;">' + item.tips + '</span>';
              return str
            },
            data: data,
            dir: dir,
            index: index
          },
          //这里可以设置宽度，按照实际需求设置
          width: '200px',
          //这里定制化动画效果
          animateInClass: 'cm-up-in',
          animateOutClass: 'cm-up-out',
          //这里定制化三角形的位置，按实际需要设置
          triangleLeft: '20px',
          onClick: function (data, index, el) {
            console.log(arguments);
            this.setIndex(index);
            this.hide();
          }
        });
      }

      this.layer.show();

    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: '气泡组件的使用',
        back: true,
        right: [
          {
            tagname: 'test', value: '侧边栏', callback: function (e) {
              var data = [
          {
            tagname: 'share', value: '分享', callback: function (data, index, el) {
              console.log('分享');
              console.log(arguments);
            }
          },
          {
            tagname: 'comment', value: '预约携程', callback: function () {
              console.log('预约携程');
            }
          },
          {
            tagname: 'tel', value: '联系携程', callback: function () {
              console.log('联系携程');
            }
          },
          {
            tagname: 'compass', value: '团队助手', callback: function () {
              console.log('团队助手');
            }
          },
          {
            tagname: 'file', value: '我的订单', callback: function () {
              console.log('我的订单');
            }
          }
        ];
              //由于这里设置了view，所以this指向当前view
              if (!this.sidebar) {
                this.sidebar = new UIBubbleLayer({
                  datamodel: {
                    data: data,
                    wrapperClass: 'cm-pop--user-nav',
                    itemFn: function (item) {
                      return '<i class="icon-' + item.tagname + '"></i>' + item.value;
                    }
                  },
                  triangleRight: '16px',
                  triggerEl: $(e.currentTarget),
                  width: '128px',
                  onCreate: function () {
                    this.mask.$el.addClass('cm-overlay--transparent');
                    this.mask.$el.removeClass('cui-mask');
                  },
                 
                  onClick: function (data, index, el) {
                    if (_.isFunction(data.callback))
                      data.callback.call(this.viewScope, data, index, el);
                    this.hide();
                  }
                });
              }

              if (this.sidebar.status == 'show') {
                this.sidebar.hide();
              } else {
                this.sidebar.show();
              }
            }
          }
        ]
      });

      this.header.show()
    },

    //简单扩展重构知识
    hideViewUI: function () {
      var slice = Array.prototype.slice;
      var uiArr = slice.call(arguments)
      console.log(uiArr)
      //if (ins && ins.hide) ins.hide();
      for (var k in uiArr) if (uiArr[k] && uiArr[k].hide) {
        uiArr[k].hide();
      }
    },

    onHide: function () {

      //以重构的观点来说，这个代码就可以优化为一个方法，比如hideViewUI
      //重构建议
      this.hideViewUI(this.demo1, this.layer, this.sidebar);

      //if (this.demo1) {
      //  this.demo1.hide();
      //}
      //if (this.layer) {
      //  this.layer.hide();
      //}
      //if (this.sidebar) {
      //  this.sidebar.hide();
      //}



    }
  });

  return View;
});