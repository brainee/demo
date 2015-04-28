/**
 * @fileoverview 列表页controller
 * @author wliao <wliao@Ctrip.com> 
 */
define([
  'cPageView',
  'demoModel',
  'demoStore',
  'cWidgetFactory',
  'cWidgetGuider'
], function (
  PageView,
  demoModel,
  demoStore,
  WidgetFactory
) {
  var Guider = WidgetFactory.create('Guider');

  // Header share
  Guider.register({
    tagname: 'METHOD_SHARE',
    callback: function() {
      Guider.app_call_system_share("../wb_cache/pkg_name/md5_url_hash", "text to share weibo", "this is titile", "http://www.ctrip.com/", false);
      return true;
    }
  });
  
  var View = PageView.extend({
    events: {
      'click .js-jump': 'jumpAction',
      'click .js-jump1': 'jump1Action',
      'click .js-jump2': 'jump2Action',
      'click .js-jump3': 'jump3Action',
      'click .js-jump4': 'jump4Action',
      'click .js-demo1': 'demo1Action',
      'click .js-ctrip': 'demo2Action',
      'click .js-model': 'modelAction',
      'click .js-localstore1-set': 'setStore1',
      'click .js-localstore1-get': 'getStore1',
      'click .js-localstore1-remove': 'removeStore1',
      'click .js-localstore2-set': 'setStore2',
      'click .js-localstore2-setAttr': 'setStoreAttr2',
      'click .js-localstore2-add': 'addStore2',
      'click .js-localstore2-get': 'getStore2',
      'click .js-localstore2-getAttr': 'getStoreAttr2',
      'click .js-update-header': 'updateHeaderAction'
    },
    onCreate: function () {
      _log('list create');
    },
    onShow: function () {
      this.updateHeader({
        share: true
      });
    },
    onHide: function() {
    },
    jumpAction: function(e) {       // 各种跳转
      var obj = {
        url: '/webpp/hotel'
      };

      if (Lizard.isHybrid) {
        obj = {
          targetModel: 'app',
          url: 'ctrip://wireless/hotel?id=1234'
        };
      }
      Guider.jump(obj);
    },
    jump1Action: function() {
      var obj = {
        url: '/webpp/hhtravel'
      };

      if (Lizard.isHybrid) {
        obj = {
          targetModel: 'open',
          url: 'hhtravel/index.html'
        };
      }

      Guider.jump(obj);
    },
    jump2Action: function() {
      var params = $.param({
        key: 'value',
        form: '/webapp/myctrip/index.html'
      });
      var obj = {
        url: '/webpp/hhtravel?' + params
      };

      if (Lizard.isHybrid) {
        obj = {
          targetModel: 'open',
          url: 'hhtravel/index.html#index?' + params
        };
      }

      Guider.jump(obj);
    },
    jump3Action: function() {
      Lizard.goTo(Lizard.appBaseUrl + 'detail/1.html', {
        viewName: 'detail'
      });
    },
    jump4Action: function() {
      Lizard.goTo(Lizard.appBaseUrl + 'detail/1.html', {
        viewName: 'detail',
        cache: true
      });
    },
    updateHeader: function(options) {
      options = _.extend({
        back: true,
        title: '列表页',
        events: {
          returnHandler: function() {
            Lizard.goBack({
              defaultView: Lizard.appBaseUrl + 'test'
            });
          }
        }
      }, options || {});

      this.header.set(options);
    },
    updateHeaderAction: function() {
      this.updateHeader({
        title: '动态更新title'
      });
    },
    demo1Action: function () {
      Lizard.goTo(Lizard.appBaseUrl + 'list', {
        viewName: 'list'
      });
    },
    demo2Action: function () {
      location.href = 'http://m.ctrip.com/html5/';
    },
    modelAction: function() {
      var detail = demoModel.detail;

      detail.setParam({
        hotelId: 5,
        date: new Date()
      });
      detail.excute(function(data) {
        _log(data);
      }, function(e) {
        console.log(e);
      });
    },
    setStore1: function() {
      var position = demoStore.position;
      position.set(5);
    },
    getStore1: function() {
      var position = demoStore.position;
      _log('localStorage ' + position.key + ':' + position.get());
    },
    removeStore1: function() {
      var position = demoStore.position;
      position.remove();
    },
    setStore2: function() {
      var city = demoStore.cityHistroy;

      city.set({
        time: new Date(),
        list: [{
          title: '上海',
        }, {
          title: '北京'
        }]
      });
    },
    getStore2: function() {
      var city = demoStore.cityHistroy;

      _log(city.get());
    },
    setStoreAttr2: function() {
      var city = demoStore.cityHistroy;

      city.setAttr('length', 5);
    },
    getStoreAttr2: function() {
      var city = demoStore.cityHistroy;

     _log(city.getAttr('time'));
    },
    addStore2: function() {
      var city = demoStore.cityHistroy;

      city.push({
        title: '南京'
      });

      city.push({
        title: '四川'
      });
    }
  });

  return View;
});