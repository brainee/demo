## web打包文档 (老版)
### 压缩功能介绍
 * 只会处理Views和webresource文件夹了，view的引用，请根据debug参数来判断, demo里面有debug的简单代码。
 * 处理cshtml的时候，会自动给.png .jpg .css .js配置加上版本号，以免用户缓存老代码, 框架的css js不用管
 * 在引用js的时候直接在源码里面写 '/webapp/demo/webresource/controllers/index.js'和 '/webapp/demo/webresource/demoConfig.js', 然后再dest的view里面会自动加上dest的
 * 打完包过后，会有一个build.txt在webresource目录下，有每个模块打进去了哪些模块,可以根据这个进行模块打包分配
 * 图片压缩功能

### web参数说明
 1. ``webresourceSrc``  
 静态资源的根路径
 1. ``buConfig``  
 BU的全局配置js,配置所有自定义模块的路径
 1. ``isSimple``  
 如果开启的话，web打包就不需要设置modules,暴力打包，直接把config.js里面配置了路径的模块，
    全部打到config.js里面去
 1. ``jshint``  
 是否使用jshint检查源码
 1. ``modules``  
 js采用模块化打包, 一个controller为一个模块, 共用的打在demoConfig.js

### 配置步骤
 1. 在项目下面配置gruntCfg.json, 可以参考demo的
 1. cd package
 1. 修改config.js，改成自己项目的配置
 1. npm install(安装打包需要的模块)
 1. grunt web2.0 or grunt web2.0 --debug

## hybrid package

### hybrid参数说明
1. ``hostname``  
hybrid抓取的web路径
1. ``zip``  
hybrid打包自动生成zip包，如果是相对路径，就是在项目的根路径下面生成，当然也可以使用绝对路径  
```
zip: ""                  // 打在项目根目录下面
```
1. ``views``  
要打包的页面    
```
{
  "/webapp/demo/index": 1             //如果页面的url_schema配置了'index',这里就要加index

  "/webapp/demo/detail/1.html": 1     //如果页面的路径参数是动态的，只需要配置一个能访问到得，url query string不需要配置
}
```
1. ``resource``  
可以设置跳过css html静态资源抓取
```
"pic.c-ctrip.com": {
  "/h5/giftcard/nav_bg.png": 0
}
```
1. ``buEnv``  
打hybrid的时候，配置BU的哪个环境，打hybrid的时候，会去读取configGen的配置文件，然后替换到web模板里面的路径, 具体值，请参考ConfigProfile.xml
```
buEnv: 'prd'  
```
1. ``lizardEnv``  
以后如果打包可以不配置这个就好了,感觉有点鸡肋的属性  
```
lizardEnv: 'pro'
```
1. ``isSimplifyHtml``  
在打每个页面的时候，是否只保留子模板，去掉layout多余的html
```
isSimplifyHtml: true
```

### 配置步骤
 1. 找到项目的gruntCfg.json, 增加hybrid参数
 1. cd package
 1. 修改config.js，改成自己项目的配置
 1. node hybrid2.0 or node hybrid2.0 --debug