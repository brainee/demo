/**
 * @description
 * 预编译模块
 * 源码text!加载的是html字符串
 * 压缩版加载的是编译后的function
 */
define(function() {
  function precompile(template, data) {
    if (_.isFunction(template)) {
      return template(data);
    } else {
      return _.template(template)(data);
    }
  }

  return precompile;
});