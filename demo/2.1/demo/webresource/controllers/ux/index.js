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
    },
    onShow: function () {

      console.log(this.$('.cui-citys-bd'));
      this.header.set({
        title: 'UI',
        back: true,
        events: {
          returnHandler: function () {
            Lizard.goBack();
          }
        }
      });

      this.header.show();

      this.initGoupList();
    },
    onHide: function() {

    },
    initGoupList: function () {
      if (this.groupList) return;
      var scope = this;

      //提示类
      var groupList1 = [
        { 'uiname': 'scroll', 'name': '滑动记录位置' }
      ];
      var uidata = [
        { name: '产品交互', data: groupList1 },
      ];
      this.groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl+ 'ux/' + item.uiname);

        }
      });
      this.groupList.show();
    }
  });

  return View;
});