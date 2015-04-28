var config = {
  webresourceSrc: "webresource",
  buConfig: "demoConfig.js",
  // 排除不想打的模块，只压缩不合并, 配置模块名字
  buConfigExclude: ['modulename'],
  // simple模式升级，请配置controller的路径
  isSimple: 'controllers',
  // 排除不打的controller,只压缩,不加js后缀
  controllerExclude: ['view/controller/indexdemo'],
  modules: [
    // 打包创建新模块
    {
      name: 'newModule1',
      create: true,
      include: [
      ]
    },
    {
      name: 'newModule2',
      create: true,
      include: [
      ]
    }
  ],
  jshint: false,
  // h5 项目名字
  channel: "demo",
  // hybrid包名字
  hybridChannel: "demo",
  // hybrid包index.html title标签里面的值
  pageTitle: "测试",
  // hybrid包自动生成的zip包放哪里
  zip: "dest",
  // hybrid包，configGen环境
  buEnv: "dev",
  // hybrid包，--debug的时候，引用资源的根路径
  host: "127.0.0.1:5389",
  // 排除项目里面不想打的模块
  frameworkExclude: [
  ],
  // 排除hybrid里面不想打的模块
  hybridExclude: [
  ],
  // 排除hybrid views下面的模板
  viewsExclude: [
    "templates/*.cshtml",
    "**/*.html"
  ],
  // 排除hybrid webresource下面的静态资源
  jsExclude: [
    "controllers/test.js"
  ],
  // hybrid打包会分析css cshtml里面的img标签，然后把资源下载到pic目录中去
  // 通过这个参数，可以排除哪些不要
  resourceExclude: [
    "http://pic.c-ctrip.com/h5/test/test.png",
    "http://pic.c-ctrip.com/h5/flight/fwcn.png",
    // flight_intl下面的所有图片都排除
    "http://pic.c-ctrip.com/flight_intl/"
  ],
  // 不是amd模块，但是通过define加载，只合并,压缩
  skipModuleInsertion: true,
  // 配置哪些html模板打包时候进行预编译
  // 要使用underscore模板预编译，不能在一个模板里面嵌套另一个带数据的模板
  htmlPrecompile: [
    'templates/**/*.html'
  ],
  // base64, 指定css里面哪些图片使用base64, 只针对web包
  base64: [
    'http://pic.c-ctrip.com/h5/**/*', // http远程的图片, 如果代码里面是//,也请使用http://开头
    '!http://pic.c-ctrip.com/h5/group_travel/un_entry_2014915.png',
    'webresource/img/**/*',           // 本地图片
    '!webresource/img/donot.png'      // 不转化的图片
  ],
  // 自定义的替换任务,filter路径依据都是根据相对源码
  replace: {
    web: [{
      // web view替换是在cshtml被压缩后进行的
      filter: [
        'views/none/empty.cshtml'
      ],
      replace: [
        {
          match: 'txtString',
          replacement: 'txtDestString'
        },
        {
          match: /txtString/g,
          replacement: function(match) {
            // 当前文件路径
            var filepath = this.filepath;
            // 当前版本号
            var version = this.version;
            return 'txtDestString';
          }
        },
        {
          match: /\s*(<.+>)\s*/g,
          replacement: '$1'
        }
      ]
    }, {
      // web静态资源是在合并js过后，开始替换任务
      filter: [
        'webresource/**/*.js',
      ],
      replace: [
      ]
    }],
    hybrid: [{
      // 现在hybrid的web view替换，是针对dest下面的view进行的
      filter: 'Views/Shared/_Layout.cshtml',
      replace: [
      ]
    }, {
      // hybrid的静态资源是在合并js后，开始替换任务
      filter: 'webresource/**/*.js',
      replace: []
    }]
  }
};

 module.exports = config;