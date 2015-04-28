define([
  'cPageView'
], function(
  PageView
) {
  var View = PageView.extend({
    // 切换页面的时候，不要滚动到顶部
    scrollZero: false,
    events: {
      'click .js-jump-index': 'jumpAction'
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;

      this.header.set({
        back: true,
        title: '记录位置',
        btn: {
          title: 'RightBtn',
          classname: 'rightblue'
        },
        events: {
          returnHandler: function() {
            Lizard.goBack();
          },
          commitHandler: function() {     
            // _log('right');
          }
        }
      });

      // 返回到上次的位置
      this.restoreScrollPos();
      _log(this.scrollPos);
    },
    onHide: function() {
      _log(this.scrollPos);
    },
    jumpAction: function() {
      Lizard.goTo(Lizard.appBaseUrl + 'index');
    }
  });

  return View;
});