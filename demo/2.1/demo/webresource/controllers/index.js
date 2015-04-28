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
      this.header.set({
        title: '2.1框架相关demo',
        events: {
          returnHandler: function () {
            _log('返回');
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
        { 'uiname': 'hybrid', 'name': 'hybrid交互' },
        { 'uiname': 'lizard', 'name': 'lizard api' },
        { 'uiname': 'pageview', 'name': 'pageView api' },
        { 'uiname': 'model','name': 'Model(数据模型)'},
        { 'uiname': 'ui','name': 'UI'},
        { 'uiname': 'ux', 'name': 'UX(产品交互)' },
        { 'uiname': 'iphone', 'name': 'iPhone' },
        { 'uiname': 'andriod', 'name': 'Andriod' },
        { 'uiname': 'hole', 'name': '填过的坑' }
      ];
      var uidata = [
        { name: '功能列表', data: groupList1 }
      ];

      this.groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl + item.uiname);

        }
      });


      this.groupList.show();
    }
  });

  return View;
});