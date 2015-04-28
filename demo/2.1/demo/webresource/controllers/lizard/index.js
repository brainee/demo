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
        title: 'Lizard',
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
        { uiname: 'appBaseUrl', name: 'appBaseUrl' },
        { uiname: 'restfullApi', name: 'restfullApi' },
        { uiname: 'jump', name: 'jump'},
        { uiname: 'goTo', name: 'goTo' },
        { uiname: 'goBack', name: 'goBack' },
        { uiname: 'isHybrid', name: 'isHybrid' },
        { uiname: 'isInCtripApp', name: 'isInCtripApp' },
        { uiname: 'D', name: 'D' },
        { uiname: 'renderAt', name: 'renderAt' },
        { uiname: 'runAt', name: 'runAt' }
      ];

      var uidata = [
        { name: 'lizard用法', data: groupList1 }
      ];

      var groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl+ 'lizard/' + item.uiname);
        }
      });

      groupList.show();
    }
  });

  return View;
});