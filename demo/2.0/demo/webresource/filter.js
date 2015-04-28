/**
 * @fileoverview 首屏渲染共用js
 * @author wliao <wliao@Ctrip.com> 
 */
var demoChannel = {
  beautifyTime: function(date) {
    var hour = date.getHours();

    if (hour <= 12) {
      return '上午';
    } else {
      return '下午';
    }
  }
};