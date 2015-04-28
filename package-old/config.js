var app = {
  channel: 'demo',
  // web package params
  defaultPath: '2.0.0',
  paths: {
    '1.0.0': 'Y:\\Documents\\code\\ctrip\\lizard2-0-demo\\demo\\2.0\\demo',
   // '2.0.0': '/Users/liaowei/Documents/code/bu/Ctrip.You.WebApp/Ctrip.You.WebApp.Host'
    '2.0.0': '../demo/2.1/demo'
  },
  // hybrid package params
  hybrid: {
    // Hybrid的包名跟h5不一样的时候可以配置
    channel: 'demo',
    // configGen 环境变量
    buEnv: 'dev',
    hostname: '10.211.55.3'
  }
};

module.exports = app;