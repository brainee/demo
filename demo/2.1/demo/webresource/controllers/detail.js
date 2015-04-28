/**
 * Created by jp_wang on 2014/11/7.
 */
define([
  'cPageView',
  'UIRadioList'
], function(
  PageView,
  UIRadioList
  ) {
  var View = PageView.extend({
    //header相关文档 http://conf.ctripcorp.com/display/Wireless/c.widget.headerview
    events: {
      'click .js-hybird-pop': 'showRadio'
    },
    onCreate: function() {
    },
    onShow: function() {
      var self = this;
      self.setHeader("上海出发");
    },
    setHeader: function(hdata) {
      var self = this;
      if(Lizard.isInCtripApp){
        _log('hybird环境');
      }else{
        _log('h5环境');
        _.extend(this.header.events,{
          'click .js-customer-title': function(){
            _log('弹层');
            self.showRadio();
          }
        });
      }
      this.header.set({
        back: true,
        btn: {title: "完成", id: 'confirmBtn', classname: 'rightblue'}, //设置头部右边的按钮，例如：完成按钮,对应用title而不是customtitle
        customtitle: '<h1 id="Chcity" class="js-customer-title">'+ hdata +'<em class="i_tri"></em></h1><i class="header_r cui-header-btn">完成</i>',
        citybtn: hdata,
        tel: null,
        events: {
          returnHandler: function () {
            if(this.uiRadio){
              this.uiRadio.destroy();
            }else{
              Lizard.goTo(Lizard.appBaseUrl + 'index');
            }
          },
          citybtnHandler: function () {
            _log('下拉');
            self.showRadio();
          },
          commitHandler: function(){
            _log('完成');
          }
        }
      });
     // window.header = this.header;
    },
    showRadio: function(){
      if (!this.uiRadio) {
        var demodata = [{ id: 'China' }, { id: 'Japan' }, { id: 'America' }];
        var scope = this;
        this.uiRadio = new UIRadioList({
          //数据模型
          datamodel: {
            title: '弹出层',
            data: demodata
          },

          onClick: function (data, e) {
            scope.setHeader(data.id);
            this.hide();
          }
        });
      }
      this.uiRadio.show();
      //window.uiRadio = this.uiRadio;
    },
    onHide: function() {
      _log('执行onhide');
      if(this.uiRadio){
        this.uiRadio.destroy();
      }
      //注销h5 header自定义事件
      if(!Lizard.isInCtripApp){
        delete this.header.events['click .js-customer-title'];
      }
    }
  });

  return View;
});