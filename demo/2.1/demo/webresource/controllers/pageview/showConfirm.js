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
      'click .js-confirm-basic': 'showConfirmBasic',
      'click .js-confirm-callback': 'showConfirmCallback'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'showConfirm',
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
    showConfirmBasic: function() {
      this.showConfirm({
        datamodel: {
          title: '标题',
          content: '内容'
        }
      });
    },
    showConfirmCallback: function() {
      this.showConfirm({
        datamodel: {
          content: '内容',
          btns: [
            { name: '取消', className: 'cui-btns-cancel' },
            { name: '确定', className: 'cui-btns-ok' }
          ]
        },
        okAction: function () {
          alert('回调');
          this.hide();
        }
      });
    }
  });

  return View;
});