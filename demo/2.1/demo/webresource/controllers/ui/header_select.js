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
        center: {
            right: [
            {
              tagname: 'edit',
              value: '编辑',
              callback: function () {
                cHybridShell.Fn('call_system_share').run(null, '测试', '测试1');
              }
            }
            ],

          tagname: 'select',
          value: this.curCity,
          callback: function (e) {
            //这里做的操作是增加体验的，可有可无
            //var el = $(e.currentTarget);
            //if (el.hasClass('expanded')) {
            //  el.removeClass('expanded')
            //} else {
            //  el.addClass('expanded')
            //}

            if (!this.citylist) {
              this.citylist = new UIRadioList({
                datamodel: {
                  title: '城市选择',
                  data: [
                   { id: '北京' }, { id: '上海' }, { id: '广州' }, { id: '深圳' }, { id: '成都' }, { id: '杭州' }
                  ]
                },
                
                onClick: function (data) {
                  scope._setCurCity(data.id);
                  scope._updateHeader();
                  //document.activeElement && document.activeElement.blur()
                  this.hide();
                }
              });
            }

            this.citylist.show();

          }
        },
        back: true
      });
    },

    onHide: function() {

    }
  });

  return View;
});