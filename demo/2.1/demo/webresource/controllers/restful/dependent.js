define([
  'cPageView'
], function(
  PageView
) {
  var View = PageView.extend({
    events: {
      
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;
      this.header.set({
        back: true,
        title: '详情页',
        home: false,
        btn: {
          title: 'RightBtn',
          classname: 'rightblue'
        },
        events: {
          returnHandler: function() {
            _log('return');
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