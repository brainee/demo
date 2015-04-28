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
    },
    onShow: function() {
      this.header.set({
        title: 'Hybrid',
        back: true,
        events: {
          returnHandler: function(){
            Lizard.goBack();
          }
        }
      });
      this.initGoupList();
    },
    onHide: function() {
      
    },
    initGoupList: function () {
      if (this.groupList) return;
      var scope = this;

      //提示类
      var groupList1 = [
        { 'uiname': 'addresslist', 'name': '调用本地通讯录' }
      ];
      
      var groupList2 = [

      ];

      var groupList3 = [
        { 'uiname': 'skipchannel', 'name': '频道跳转'},
        { 'uiname': 'h5tohybrid', 'name': 'h5和hybrid跳转' },
      ];
      var uidata = [
        { name: '仅hybird', data: groupList1 },
        { name: '仅h5', data: groupList2},
        { name: 'h5和hybird', data: groupList3}
      ];

      this.uidata = uidata;

      this.groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl + 'hybrid/' + item.uiname);
        }
      });


      this.groupList.show();
    }
  });

  return View;
});