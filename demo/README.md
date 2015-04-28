## Lizard demo
* 开发请使用vs2013,下载地址：\\cn1\ctrip\工具区\
* web环境默认访问打包后的代码,加入`debug=1`变为源码
* 可以通过修改CustomViewEngine.cs保证不加debug,也能访问源码
* 开发过程中，发现代码缓存，可以尝试加入`debug=1`参数

### 2.0
* 部署: http://localhost/webapp/demo/

### 2.1
* 部署: http://localhost/webapp/demo2.1/

## hybrid test
* 修改gruntCfg.js里面的host参数，改成自己的ip
* 打demo的debug包
```
grunt package2.0 --path=demo路径 --debug
```
* 把打好的demo包放手机，ios访问路径
```
ctrip://wireless/h5?path=demo&page=index.html
```