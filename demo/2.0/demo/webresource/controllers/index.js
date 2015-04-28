/**
 * Created by jp_wang on 2014/11/20.
 */
define([
  'cPageView',
  'precompile',
  'text!indexHtml'
], function (
  PageView,
  precompile,
  indexHtml
  ) {
    var View = PageView.extend({
        events: {
          'click .js-index-jump': 'indexJumpAction'
        },
        onCreate: function () {
          this.$('.js-test-precompile').html(
            precompile(indexHtml, {
              list: [
                { name: 'name1' },
                { name: 'name2' }
              ]
            })
          );
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
            this.header.show();
        },
        onHide: function () {
        },
        indexJumpAction: function(e) {
          var url = this.$(e.target).attr('data-filter');
          Lizard.goTo(Lizard.appBaseUrl + url);
        }
    });

    return View;
});