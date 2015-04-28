/**
 * @fileoverview demo模型文件
 * @author wliao <wliao@Ctrip.com> 
 */
 define([
  'cCoreInherit',
  'cModel',
  'demoStorage'
], function(
  CoreInherit,
  Model,
  demoStorage
) {
  var ListModel = CoreInherit.Class(Model, {
    buildurl: function() {
      return Lizard.restfullApi + 'list';
    },
    __propertys__: function () {
      this.param = {
        cityid: ''
      };
    }
  });

  var DetailModel = CoreInherit.Class(Model, {
    buildurl: function() {
      return Lizard.restfullApi + 'detail';
    },
    //参数优先级较低，如果controller中未传参数,则param中是默认参数
    __propertys__: function () {
      this.param = {
        hotelId: 'default'
      };
    }
  });

  var StorageModel = CoreInherit.Class(Model, {
    buildurl: function() {
      return Lizard.restfullApi + 'detail';
    },
    __propertys__: function() {
      this.param = {};
      // 把取回来的数据放localStorage中去
      this.result = demoStorage.list;
    }
  });

   var TimeoutModel = CoreInherit.Class(Model, {
     buildurl: function() {
       return Lizard.restfullApi + 'restful/timeout';
     },
     //参数优先级较低，如果controller中未传参数,则param中是默认参数
     __propertys__: function () {
       this.timeout = 5000;
       this.param = {
         hotelId: 'default'
       };
     }
   });

  return {
    list: new ListModel(),
    detail: new DetailModel(),
    detailStore: new StorageModel(),
    timeout: new TimeoutModel()
  };
});