/**
 * @fileoverview demo模型文件
 * @author wliao <wliao@Ctrip.com> 
 */
 define([
  'cBase',
  'cModel'
], function(
  Base,
  Model
) {
  var ListModel = Base.Class(Model, {
    buildurl: function() {
      return Lizard.restfullApi + 'list';
    },
    __propertys__: function () {
      this.param = {
        cityid: ''
      };
    }
  });

  var DetailModel = Base.Class(Model, {
    buildurl: function() {
      return Lizard.restfullApi + 'detail';
    },
    __propertys__: function () {
      this.param = {
        hotelId: '',
        date: ''
      };
    }
  });

  return {
    list: new ListModel(),
    detail: new DetailModel()
  };
});