/**
 * @fileoverview 首页controller
 * @author wliao <wliao@Ctrip.com> 
 */
define([
  'cPageView',
  'text!indexHtml',
  'cUtility',
  'cWidgetFactory',
  'cWidgetGuider'
], function (
  PageView, 
  indexHtml,
  util,
  WidgetFactory
) {
  var Guider = WidgetFactory.create('Guider');

  var View = PageView.extend({
    events: {
    },
    onCreate: function() {
     // _log('detail create');
    },
    onShow: function() {
      var self = this;
      this.header.set({
        back: true,
        title: '详情页',
        home: false,
        btn: {
          title: 'Right btn',
          classname: 'rightblue'
        },
        events: {
          returnHandler: function() {
            var referrer = self.referrer;
            
            if (referrer.indexOf('/webapp/demo/list') != -1) {
              Lizard.goBack();
            } else {
              Lizard.goTo(Lizard.appBaseUrl);
            }
          },
          commitHandler: function() {     //Rigt btn
           // _log('right');
          }
        }
      });
    },
    onHide: function() {
    }
  });

  return View;
});