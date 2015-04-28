/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView'
], function(
  PageView
  ) {
  var View = PageView.extend({
    events: {
      'click .js-once': 'onceTask',
      'click .js-on': 'onTask',
      'click .js-off': 'offTask',
      'click .js-trigger': 'triggerTask'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'once on off trigger',
        back: true,
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });
      this.header.show();
    },
    onHide: function() {

    },
    onceTask: function(){
      this.once('mainTask',function() {
        console.log('once');
        this.$('.js-once').css('background','#52bce8');
      })
    },
    onTask: function() {
      //重复注册会形成队列
      this.on('mainTask',function() {
        console.log('on');
        this.$('.js-once').css('background','#52bce8');
      });
    },
    //解除.js-on的click事件后，点击.js-on按钮将不会变色
    offTask: function(){
      this.off('mainTask');
    },
    //添加trigger函数后,.js-on按钮将会自动变色
    triggerTask: function(){
      this.trigger('mainTask');
    }
  });

  return View;
});