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
        title: 'pageView',
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
    initGoupList: function() {
      var groupList1 = [
        { uiname: 'dollarelement', name: '$el' },
        { uiname: 'dollar', name: '$' },
        { uiname: 'datas', name: 'datas' },
        { uiname: 'header', name: 'header' },
        { uiname: 'referrer', name: 'referrer' },
        { uiname: 'scrollZero', name: 'scrollZero' },
        { uiname: 'scrollPos', name: 'scrollPos' },
        { uiname: 'restoreScrollPos', name: 'restoreScrollPos' },
        { uiname: 'showFake', name: 'showFake'},
        { uiname: 'showConfirm', name: 'showConfirm' },
        { uiname: 'hideConfirm', name: 'hideConfirm' },
        { uiname: 'showLoading', name: 'showLoading' },
        { uiname: 'hideLoading', name: 'hideLoading' },
        { uiname: 'showMessage', name: 'showMessage' },
        { uiname: 'hideMessage', name: 'hideMessage' },
        { uiname: 'showToast', name: 'showToast' },
        { uiname: 'hideToast', name: 'hideToast' },
        { uiname: 'pageid', name: 'pageid / hpageid' },
        { uiname: 'on', name: 'once / on / off / trigger' },
      ];

      var uidata = [
        { name: 'lizard用法', data: groupList1 },
      ];

      var groupList = new UIGroupList({
        datamodel: {
          data: uidata,
          filter: 'uiname,name'
        },
        wrapper: this.$('.cui-citys-bd'),
        onItemClick: function (item, groupIndex, index, e) {
          Lizard.goTo(Lizard.appBaseUrl+ 'pageview/' + item.uiname);
        }
      });

      groupList.show();
    }
  });

  return View;
});