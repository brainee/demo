define([
  'cPageView',
  'cMemberService'
], function(
  PageView,
  MemberService
) {
  var View = PageView.extend({
    events: {
      'click .js-login': 'setLocalStorage'
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;
      //登陆只能在fat、uat和生产环境下跳转，不跳转的情况下，将登陆后USER的localsorage复制到本地测试环境中
      var user = Lizard.S('USER');
      if(user){
        $('.main-viewport').append("<p>未登录</p>");
      }else{
        $('.js-login').css('display','none');
        $('.main-viewport').append("<p>已登录</p>");
      }
      this.header.set({
        back: true,
        title: '读取localstorage',
        events: {
          returnHandler: function() {
            Lizard.goBack();
          }
        }
      });
    },
    setLocalStorage: function(){
      //url要经过encodeURIComponent编码
      var param = "from=http%3A%2F%2F172.16.144.94%3A5389%2Fwebapp%2Fdemo2.1%2Frestful";
      var options = {
        param: param
      };
      var member = MemberService.memberLogin(options);
    },
    onHide: function() {
    }
  });

  return View;
});