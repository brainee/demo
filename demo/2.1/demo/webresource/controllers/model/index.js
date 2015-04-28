/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'UIGroupList'
], function(
  PageView,
  UIGroupList
  ) {
  var View = PageView.extend({
    events: {
    },
    onCreate: function() {
      this.initGoupList();
    },
    onShow: function () {
      this.header.set({
        title: 'Model',
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
    initGoupList: function () {
      //提示类
      var groupList1 = [
        { uiname: 'timeout', name: 'timeout'},
        { uiname: 'cModel', name: 'cModel' },
        { uiname: 'cUserStore', name: 'cUserStore' },
        { uiname: 'cLocalStore', name: 'cLocalStore' },
        { uiname: 'cCommonStore', name: 'cCommonStore' },
        { uiname: 'cSessionStore', name: 'cSessionStore' }
      ];

      var groupList2 = [
        { uiname: 'customModel', name: '自定义模型' },
        { uiname: 'customModelStore', name: '自定义模型，然后存localStorage' }
      ];

      var uidata = [
        { name: 'model用法', data: groupList1 },
        { name: '实战', data: groupList2 },
      ];

      var groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl+ 'model/' + item.uiname);
        }
      });

      groupList.show();
    }
  });

  return View;
});