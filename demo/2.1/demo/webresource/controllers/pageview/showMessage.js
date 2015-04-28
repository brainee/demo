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
      'click .js-message-basic': 'showMessageBasic',
      'click .js-message-title': 'showMessageTitle',
      'click .js-message-callback': 'showMessageCallback'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'showMessage',
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
    showMessageBasic: function() {
      this.showMessage({
        datamodel: {
          content: '基本使用'
        }
      });
    },
    showMessageTitle: function() {
      this.showMessage({
        datamodel: {
          title: '标题',
          content: '内容'
        }
      });
    },
    showMessageCallback: function() {
      this.showMessage({
        datamodel: {
          title: '标题',
          content: '内容'
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