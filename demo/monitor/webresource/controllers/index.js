/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'cHybridShell',
  'text!indexHtml'
], function (
  PageView,
  cHybridShell,
  indexHtml
  ) {
    var View = PageView.extend({
        events: {
          'click .js-goto': 'goToAction'
        },
        onCreate: function () {
          
        },
        onShow: function () {
            this.header.set({
                title: '2.0框架相关demo',
                events: {
                    returnHandler: function () {
                        _log('返回');
                    }
                }
            });
        },
        onHide: function () {
        },
        goToAction: function() {
          alert('xxx');
          var fn = new cHybridShell.Fn('open_url');

         fn.run('demo/index.html#/list', 4, '',  '', false);
        }
    });

    return View;
});