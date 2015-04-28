/**
 * @fileoverview lizard2.0 seo配置程序
 * @author wliao <wliao@Ctrip.com> 
 */
var config = {
  webapp: {
    protocol: 'http:',
   //hostname: '172.16.142.54',
   // host: '172.16.142.54'
    hostname: 'm.ctrip.com',
    host: 'm.ctrip.com'
  },
  // Cache controller
  ttl: {
    template: 0,     // seconds
  },
  nodePort: 3002,
  log: {
    // log的层级
    depth: 2
  }
  // 有些服务器网络不通，需要用代理
  // proxy: {
  //   protocol: 'http:',
  //   hostname: '10.2.6.203',
  //   port: 81
  // }
};

module.exports = config;