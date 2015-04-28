/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'text!indexHtml'
], function (
  PageView,
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
                title: 'list',
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
          Lizard.goTo(Lizard.appBaseUrl + 'list', {
            
          });
        }
    });

    return View;
});