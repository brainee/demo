/**
 * @fileoverview 
 * @author wliao <wliao@Ctrip.com> 
 */
 define([
  'cBase',
  'cStore'
], function(
  Base,
  Store
) {
  // 单个值存储
  var Position = Base.Class(Store, {
    __propertys__: function () {
      this.lifeTime = '30M';
      this.key = 'demo_position'; // 注意不要和其他频道冲突，最好用频道名字为前缀
    }
  });

  // 存对象
  var CityHistroy = Base.Class(Store, {
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

  return {
    position: new Position(),
    cityHistroy: new CityHistroy()
  };
});