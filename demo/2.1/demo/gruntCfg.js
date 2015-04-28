var config = {
  webresourceSrc: "webresource",
  buConfig: "demoConfig.js",
  isSimple: true,
  jshint: false,
  channel: "demo2.1",
  hybridChannel: "demo2.1",
  pageTitle: "测试",
  zip: "",
  buEnv: "dev",
  host: "127.0.0.1:5389",
  viewsExclude: [
    "templates/*.cshtml"
  ],
  jsExclude: [
    "controllers/test.js"
  ],
  resourceExclude: [
    "http://pic.c-ctrip.com/h5/test/test.png",
    "http://pic.c-ctrip.com/h5/flight/fwcn.png",
    "http://pic.c-ctrip.com/flight_intl/airline_logo/40x35/MU.png"
  ]
};

 module.exports = config;