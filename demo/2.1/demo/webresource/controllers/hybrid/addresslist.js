define([
  'cPageView',
  'cHybridShell'
], function(
  PageView,
  cHybridShell
) {
  var View = PageView.extend({
    events: {
      'click .js-address-list': 'showAddressList'
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;
      this.header.set({
        back: true,
        title: '调用本地通讯录',
        events: {
          returnHandler: function() {
            Lizard.goBack();
          }
        }
      });
      
    },
    showAddressList: function() {
        //注册callback，param即为返回的数据
        var callback = function(param) { 
          _log(param);
          $('.js-address-callback').val(param.phoneList[0]["电话"]);
        };
        cHybridShell.Fn('choose_contact_from_addressbook', callback).run();    
    },
    onHide: function() {

    }
  });

  return View;
});