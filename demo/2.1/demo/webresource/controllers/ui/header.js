define(['UIDemoView', 'UIBubbleLayer'], function (UIDemoView, UIBubbleLayer) {
  var View = UIDemoView.extend({

    events: {
      'click code': function () {
      }
    },
    onCreate: function () {
    },
    onShow: function () {
      this.header.set({
        onShow: function () {
          this.$('.cm-header').addClass('cm-header--light');
        },

        title: '基本Header使用',
        subtitle: '中间副标题',
        //back: false,
        //backtext: '返回',
        citybtn: '城市按钮',
        tel: { number: 1111 },
        home: true,
        search: true,
        btn: { title: "登录", id: 'confirmBtn', classname: 'header_r' },
        events: {
          citybtnHandler: function () {
            console.log('citybtnHandler');
          },
          returnHandler: function () {
            Lizard.goBack();
          },
          homeHandler: function (e) {
            Lizard.appBaseUrl + 'ui/index';
          },
          commitHandler: function (e) {
            console.log('commit');
          }
        }
      });


    },
    onHide: function () {

    }
  });

  return View;
});

