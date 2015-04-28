## hybrid包只需要放一次手机调试
 * 打debug包
 * 在项目下面的dest目录下有个hybrid包文件夹，ios用itools替换ctrip系统文件，安卓放到webapp目录或者用rootexplorer替换ctrip的系统文件
 * 如何修改代码,两种方式
   * 改源码，然后打debug包，然后刷新手机界面
   * 直接改dest下面的代码，这样免打包，但是需要注意把改后的代码返回到源码

## 新版打包
### 功能介绍
 * 打包分两种，一种web包, 一种web+hybrid包
 * 打hybrid包无需配置环境，只读本地文件打包
 * web, hybrid打包提供调试功能, hybrid调试包，可以直接改dest目录下面的代码，然后再手机
   里面直接刷新，就能访问到新的文件，调试的时候，无需再次打包。

### 项目优化
#### web
1. js
  * simple模式就是把config.js里面配置了路径的模块都打进这个js
  * modules是根据需要，自动分析文件依赖，而进行模块划分
    * 最常用的modules分配，是把通用的打在``config.js``里面, 其余每个页面的controller配置一遍就行了
  * 类似``/webapp/demo/webresource/controller/index.js``会自动增加dest目录  
    替换为``/webapp/demo/dest/webresource/controller/index.js``
1. css
  * 压缩css
  * 图片自动转化为base64 ``需配置`` ``推荐``
1. cshtml
  * 压缩cshtml,可能会出错，如果压错了，请参考模板自测功能
  * 路径替换，一样的逻辑需要插入``dest``
1. html
  * 直接压缩html
  * 模板预编译 ``需配置``  ``推荐``
1. image
  * 压缩本地图片
1. 线上测试
  * 正式版 http://m.ctrip.com/webapp/cruise
  * 源码版 http://m.ctrip.com/webapp/cruise?debug=1

#### hybrid
1. js
 * 默认采用simple模式进行js合并
 * 类似``/webapp/demo/webresource/controller/index.js``会自动替换为``webresource/controller/index.js``
1. css
  * 压缩css
  * 找到``http://``, 然后下载图片到本地, 然后css代码里面自动转化路径。
1. cshtml
  * 把chtml代码转化为js
  * 路径替换
1. html
  * 直接压缩html
  * 模板预编译 ``需配置``  ``推荐``
1. image
  * 压缩本地图片
  * 压缩``http``上面的图片

### 配置步骤
 1. 在项目下面配置gruntCfg.js, 可以参考[demo](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/blob/master/demo/2.0/demo/gruntCfg.js)的。
 1. 进入打包目录, ``npm install`` 已安装过的，可以跳过 
 1. 运行命令打包

### 参数说明
 1. ``webresourceSrc``  
 静态资源的根路径
 1. ``buConfig``  
 BU的全局配置js,配置所有自定义模块的路径
 1. ``isSimple``  
 强化了simple模式，请配置为controller的路径,建议全部使用simple模式打包，simple模式也支持模块创建功能
 1. ``modules``  
 打包的时候可以创建新的模块
 1. ``jshint``    
 是否使用jshint检查源码
 1. ``channel``  
 web频道名字
 1. ``base64`` 只在web包生效  
 配置css里面哪些图片采用base64编码,以减少h5 http request. 支持本地图片和线上图片的转化。  
 线上的图片会先下载下来，压缩优化，然后才转base64,所以优势明显比http请求的优势大。建议首页的图片都配置base64转化。  
 转化的时候，会检测是否有两个一样的路径配置在不同的类名中，如果重复的话，会停止打包。  
 建议把需要转化成base64的图片，写在一个类中，避免重复转化，造成样式文件过大。如:
   * 源码: ```.csl1 {background: url(../image/bg.png);} .cls2 { background: url(../iamge/bg.png)}```
   * 改成: ```.cls1,.cls2 { background: url(../image/bg.png); }```
 1. ``hybridChannel``   
 hybrid频道名字
 1. ``pageTitle``  
 layout title标签的值
 1. ``defaultView``  
 hybrid的首页，默认为index,可以不用配置
 1. ``zip``  
 如果是相对路径，就是在项目的根路径下面生成，当然也可以使用绝对路径
 1. ``buEnv``  
 指明当前bu环境, 替换掉模板里面的configGen变量。
 1. ``host``  
 hybrid调试的时候，非常有用，让包里面的静态资源访问配置的这个目录，实现无打包调试
 1. ``htmlPrecompile``   
 配置哪些html模板打包时候进行预编译
 1. ``frameworkExclude``  {array}  
 排除自定义的框架包
 1. ``viewsExclude``  
 排除不打的模板    
 ```
 ui/index.cshtml
 templates/**/*.cshtml
 templates/**/*.{html,js}
 ```

 1. ``jsExclude``  
 排除不打的静态资源, 配置方式同viewsExclude
 1. ``resourceExclude``  
 hybrid打包，会分析css, cshtml里面绝对路径的图片, 可以在这里面配置不打包的静态资源
 ```
 // 这个路径下的所有图片都排除
 ['http://pic.c-ctrip.com/h5/']
 ```
 
 1. ``replace``  
 自定义替换功能，具体使用可以参考[demo](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/blob/master/demo/2.0/demo/gruntCfg.js)配置, 自定义替换任务都优先框架替换，也就是说自定义替换是基于BU源码的，文件filter语法参考[file-match](https://github.com/douzi8/file-match)
 1. ``envCodeRemove`` {boolean} [envCodeRemove = false]   
 删除不属于本环境的代码, 目的是减少size,提升代码性能。
 ```
 window.ISHYBRID = Lizard.isHybrid;
 var a;
 if (ISHYBRID) {
   a = 1;
 } else {
   a = 2;
 }

 // web包
 var a = 2;
 // hybrid包
 var a = 1;
 ```

### 命令
#### web (只打web包)
```
// path参数，bu代码路径, demo的路径为../demo/2.0/demo,当然路径也可以为绝对路径
grunt web2.0 --path=../demo/2.0/demo
grunt web2.0 --debug --path=../demo/2.0/demo
```
#### web + hybrid （两个包一起打）
```
grunt package2.0 --path=c:\\path\\1
grunt package2.0 --path=c:\\path\\1 --debug
grunt package2.0 --path=.. --imagemin=false  // 不执行图片压缩
grunt package2.0 --path=c:\\path\\1 --weinre // weinre调试
```

### 注意事项
* 如果imagemin报``fatal error： This socket isclosed``，请尝试使用以下命令

```
npm uninstall grunt-contrib-imagemin
npm install grunt-contrib-imagemin@0.8.0
```
* 模板里面的controller，请使用静态化代码，这样打包才能加dest目录, 如果不愿修改。
* 排除功能都是针对hybrid包的
* hybrid压缩机制  
hybrid现在除了支持``configGen``和``@RenderPage``语法，其他.net代码在hybrid包下面都会直接删掉，
如果定制了.net代码，请在gruntCfg.js中使用自定义replace替换成等量的变量,如:
```
replace: {
  hybrid: [
    {
      filter: ['Views/Cruise/*.cshtml'],
      replae: [
      {
        match: /@Url\.Content("~\/")/g,
        replacement: '/webapp/cruise/'
      }
      ]
    }
  ]
}
```

* underscore代码注意事项  

```
right: 

class="cls1<% if (true) { print(' cls'); } %>"
class="<%= util.help('123') %>"

// 禁止代码
<%
 var a = 5
 var b = 5              //换行语句必须有分号，不然压成一行就bug
 var fn = function() {

 }                     // 定义函数没有分号也不行
 var d = 5 
%>

<div data-id=<%= item.id %>></div>  // 属性没有分号
```

* 使用``envCodeRemove``步骤
  1. 先在buconfig.js最前面写一段代码``window.ISHYBRID = Lizard.ISHYBRID;``
  1. js代码全局替换``Lizard.isHybrid``为``ISHYBRID``
  1. 后续环境判断代码，请使用``ISHYBRID``, 尽量是直接使用，不要赋值给其他变量，在来判断


### 模板预编译
1. 创建预编译模块,参考[precompile.js](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/blob/master/demo/2.0/demo/webresource/lib/precompile.js)
1. 在全局的buConfig.js中配置路径, 参考[demoConfig](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/blob/master/demo/2.0/demo/webresource/demoConfig.js)
1. 在controller中使用预编译模块，参考[index.js](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/blob/master/demo/2.0/demo/webresource/controllers/index.js)  

```
define([
  'precompile',
  'text!indexHtml'
], function(
  precompile,
  indexHtml
) {
  
  var data = [{}, {}];
  var html = precompile(indexHtml, data);

});
```

1. 注意事项
   * 打包的时候,indexHtml模块会变成编译好的function，源码还是字符串html
   * 一个模板只能对应一个数据源。
1. 为什么要使用预编译
   * 提升渲染性能，大概23%
   * 压缩不容易出错

## 如何测试模板压缩后的结果
1. ``npm install mocha -g``
1. 进入``package/test/demo``目录
1. 修改index.html或者index.cshtml, html对应的是压缩html模板，cshtml对应的是压缩cshtml模板
1. 运行``mocha``
1. 查看对应的index.dest.html或者index.dest.cshtml
1. [排错方法](http://conf.ctripcorp.com/pages/viewpage.action?pageId=59940338)