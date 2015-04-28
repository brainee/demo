/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'cHybridShell'
], function(
  PageView,
  HybridShell
  ) {
  var View = PageView.extend({
    events: {
      'click .js-hybrid-channel': 'hybridChannel',
      'click .js-h5-channel': 'h5Channel'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: '频道跳转',
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
    h5Channel: function() {
      var options = {
        targetModel: 4,
        title: '用车首页',
        pageName: 'car_index_page_id',
        hideloading: true
      };
      Lizard.goTo(Lizard.appBaseUrl + 'car/index.html',options);
    },
    hybridChannel: function() {
      HybridShell.Fn('open_url').run("car/index.html", 4, "用车首页", "car_index_page_id");
    }
  });

  return View;
});