/**
 * Created by jp_wang on 2014/11/20.
 */
define(['UIDemoView', 'UIRadioList'], function (UIDemoView, UIRadioList) {

  var View = UIDemoView.extend({
    events: {
    },
    onCreate: function () {
      this.citylist = null;

      //该值默认为上海，可被URL传递或者localstorage读取，下面会流出一个接口
      this._setCurCity();
    },

    //这个接口需要被重写
    _setCurCity: function (city) {
      if (!city) city = '上海';
      //这里首先可能会读取localstorage
      //city = this.getLocalStorageCity();
      //也许这里会读取url
      //city = this.getUrlCity();

      //也有可能什么都不做
      this.curCity = city;

    },

    onShow: function () {
      this._updateHeader();
    },

    //每次更新在这个地方做
    _updateHeader: function () {
      var scope = this;

this.header.set({
  template: '<header style="height: 44px; line-height: 44px; "><h1 style="height: 44px; line-height: 44px; position: absolute; text-align: center; width: 100%; " >标题</h1><span style=" float: left; z-index: 9; position: relative;" class="js_back">返回</span><span style="float: right; z-index: 9; position: relative;" class="js_ok">确定</span></header>',
  events: {
    'click .js_ok': 'okAction',
    'click .js_back': 'okBack'
  },
  okAction: function () {
    alert('确定');
  },
  okBack: function () {
    Liard.goBack();
  }
});
    },

    onHide: function() {

    }
  });

  return View;
});