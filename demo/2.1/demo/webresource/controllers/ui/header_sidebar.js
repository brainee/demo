/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'UIDemoView'
], function(
  UIDemoView
) {
  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function() {
    },
    onShow: function () {
this.header.set({
  view: this,
  title: '侧边栏的使用',
  back: true,
        
  //这里侧边栏会被内部框架封装
  moreMenus: [
    {
      tagname: 'more_my_favorite', iconname: 'share', value: '分享', callback: function (data, index, el) {
        console.log('分享');
        console.log(arguments);
      }
    },
    {
      tagname: 'more_phone', iconname: 'tel', value: '联系携程', callback: function () {
        console.log('联系携程');
      }
    },
    {
      tagname: 'more_my_order', iconname: 'file', value: '我的订单', callback: function () {
        console.log('我的订单');
      }
    },
    {
      tagname: 'more_my_favorite', iconname: 'love', value: '我的收藏', callback: function () {
        console.log('我的收藏');
      }
    },
    {
      tagname: 'more_message_center', iconname: 'email', value: '消息中心', callback: function () {
        console.log('消息中心');
      }
    },
    {
      tagname: 'more_home', iconname: 'home', value: '携程首页', callback: function () {
        console.log('携程首页');
      }
    }
  ]
});

    },
    onHide: function() {

    }
  });

  return View;
});