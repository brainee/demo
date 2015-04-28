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
      'click .js-loading-basic': 'showLoadingBasic',
      'click .js-loading-text': 'showLoadingText',
      'click .js-loading-close': 'showLoadingClose'
    },
    onCreate: function() {
    },
    onShow: function () {
      this.header.set({
        title: 'showLoading',
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
    showLoadingBasic: function() {
      this.showLoading();
      setTimeout($.proxy(function () {
        this.hideLoading();
      }, this), 2000);
    },
    showLoadingText: function() {
      this.showLoading({
        datamodel: {
          content: '文字'
        }
      });
      setTimeout($.proxy(function () {
        this.hideLoading();
      }, this), 2000);
    },
    showLoadingClose: function() {
      this.showLoading({
        datamodel: {
          content: '',
          closeBtn: true
        }
      });
    }
  });

  return View;
});