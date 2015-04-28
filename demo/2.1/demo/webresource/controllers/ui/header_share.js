/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'cHybridShell'], function (UIDemoView, cHybridShell) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        view: this,
        title: 'native联调-分享功能',
        back: true,
        right: [
          {
            tagname: 'share',
            callback: function () {
              cHybridShell.Fn('call_system_share').run(null, '测试', '测试1');
            }
          }
        ]
      });

      this.header.show()
    },
    onHide: function () {

    }
  });

  return View;
});