/**
 * @fileoverview localStorage demo
 * @author wliao <wliao@Ctrip.com> 
 */
define([
  'cCoreInherit',
  'cStore',
], function(
  CoreInherit,
  Store
) {
  // 存对象
  var City = CoreInherit.Class(Store, {
    __propertys__: function () {
      this.key = 'demo_city';
      this.length = 5;
    },
    get: function($super) {
      var city = $super() || {
        list: [],
        time: new Date()
      };
      return city;
    },
    push: function(item) {
      var result = this.get().list;

      result.unshift(item);
      if (result.length > this.length) {
        result.pop();
      }

      this.setAttr('list', result);
    }
  });

  // 存数据库记录
  var List = CoreInherit.Class(Store, {
    __propertys__: function () {
      this.key = 'demo_list';
      
      /**
       * 数据存活时间, 参数传递格式为“时间+时间单位",如30M
       * 时间单位有D:day,H:hour,M:minutes,S:secend,
       * 如过不传递时间单位,默认时间单位为M
       * @var {String} Store.cAbstractStore.lifeTime
       */
      this.lifeTime = '10S';
    }
  });

  return {
    city: new City(),
    list: new List()
  };
});