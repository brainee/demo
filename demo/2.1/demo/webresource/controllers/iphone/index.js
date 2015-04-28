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
      this.initGroupList();
    },
    onShow: function () {
      this.header.set({
        title: 'iphone坑列表',
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
    initGroupList: function() {
      var groupList1 = [
        { uiname: 'keyboard', name: '键盘收起' },
      ];

      var uidata = [
        { name: 'iphone', data: groupList1 },
      ];

      var groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl+ 'iphone/' + item.uiname);
        }
      });

      groupList.show();
    }
  });

  return View;
});