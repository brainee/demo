## git 代码下载
1. Download [git](http://git-scm.com)
2. `git clone http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo.git`
3. Update code: `git pull`

## directory
```
demo                    // demo项目，用来测试及简单的代码示例
          
       ／  .net         // .net mvc版seo生产程序
html5 
       ﹨  node         // node seo生成程序
        
package                // 打包程序，包括web和hybrid打包
 
restful                // RESTful 接口，用于测试demo项目
```
## environment
### web environment
 * 把demo部署到IIS上面的webapp/demo目录下面
 * 压缩: [http://localhost/webapp/demo](http://localhost/webapp/demo)
 * 源码: [http://localhost/webapp/demo?debug=1](http://localhost/webapp/demo?debug=1)
 * 模拟数据接口环境运行
   * cd restful
   * grunt app
 * 产品环境下访问的dest目录的资源，开发环境访问源码

### seo environment
 * [H5 seo 环境搭建](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/tree/master/html5)
 * 访问: http://localhost/html5/demo

### hybrid environment
 * 直接运行package/webapp2hybrid/webapp/demo里面的index.html
 * 如果发现lizard.seed.js报错的话，可以从package/webapp2hybrid/lizard 里面对应的版本号复制过去（临时方案）
 
### H5 in native environment
 * cmd -> ipconfig查找自己的ip
 * demo项目绑定5389端口
 * 手机连接dev
 * 直接在携程调试包里面输入http://172.16.42.11:5389/webapp/demo

## [打包](http://git.dev.sh.ctripcorp.com/wliao/lizard2-0-demo/tree/master/package)