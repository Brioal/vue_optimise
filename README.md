# Vue项目优化实践
## 最新版地址:[vue优化实践](http://leanote.com/blog/post/5ca190caab644136ad001ad5)
# 懒路由加载
### 默认加载方式,vue-cli 3x已经默认带了一个懒路由的模板,但是由于部分组件需要重用,所以采用第二种方式比较方便
```
....
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
```
### 第二种懒加载方式,效果相同,并且支持alt跳转和路径校验,重用
```
import Vue from 'vue';
import Router from 'vue-router';
const Home = () => import(/* webpackChunkName: "group-home" */ './views/Home.vue');
const About = () => import(/* webpackChunkName: "group-home" */ './views/About.vue');

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component:About ,
    },
  ],
});

```

# vue，vue-router等以js方式引入 (之前130k,之后34k)
#### `此种方法main.js类需要再导入element,iview等组件,因为忽略只在打包时候生效,不引用会导致本地运行不显示,但是打包时候必须取消引入,否则js没有打包,但是css会被打包,如果出现页面空白,尝试调整引入js的顺序`
### 1.index.html内以cdn的方式引入
```
<!--vue-router-->
<script src="https://cdn.bootcss.com/vue-router/3.0.1/vue-router.min.js"></script>
<!-- vue-->
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js"></script>
<!-- element -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<!--iview -->
<link rel="stylesheet" href="//unpkg.com/iview/dist/styles/iview.css">
<script src="//unpkg.com/iview/dist/iview.min.js"></script>
```
### 2.在`webpack.base.conf`/'vue.config.js' 中添加 `externals`来告诉`webpack`我们这些第三方库不需要打包
#### 注:在vue-cli 3.5当中vue.config.js默认不存在,手动创建,和package.json同级,基础内容如下:
```
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
    baseUrl: './',  // 配置基本url
}

```
### 设置external
#### vue-cli 2x版本
```
module.exports = {
    baseUrl: './',  // 配置基本url
    externals:{
        'vue':'Vue',
        'vue-router': 'VueRouter',
        'iview': 'iview',
        'element-ui': 'ELEMENT',
    }
}

```
#### vue-cli 3x版本
```
module.exports = {
    publicPath: './',  // 配置基本url

    configureWebpack:config=>{
       if (isProduction) {
      config.externals = {
        'vue': 'Vue',
        'vue-router': 'router',
        'iview': 'iview',
        'element-ui': 'ELEMENT',
      }
    }
    }
}

```

# 服务器开启Gzip(vue-cli 3x版本方式,需要在服务器端再开启gzip,压缩之后达到11k,包含第一步的效果下)
### Gzip是GNU zip的缩写，顾名思义是一种压缩技术。它将浏览器请求的文件先在服务器端进行压缩，然后传递给浏览器，浏览器解压之后再进行页面的解析工作。在服务端开启Gzip支持后，我们前端需要提供资源压缩包。
### 通过CompressionWebpackPlugin插件build提供压缩
### 1.安装插件
```
// 安装插件
cnpm i --save-dev compression-webpack-plugin
```
### 2.vue.config.jsp配置
```
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';

.....
module.exports = {
....
  configureWebpack: config => {
    if (isProduction) {
      config.plugins.push(new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      }))
    }
  }
}
```

### 2.nigex开启gzip
#### 修改`nginx.conf`文件,开启gzip
```
gzip  on;
gzip_min_length 1k;
gzip_buffers 4 16k;
#gzip_http_version 1.0;
gzip_comp_level 2;
gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
gzip_vary off;
gzip_disable "MSIE [1-6]\.";
```

# 以上两种方法配置之后的配置文件
```
const isProduction = process.env.NODE_ENV === 'production';
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];

module.exports = {
    publicPath: './',  // 配置基本url

    configureWebpack:config=>{

        if (isProduction) {
            // 打包忽略
            config.externals = {
                'vue': 'Vue',
                'vue-router': 'VueRouter',
                'iview': 'iview',
                'element-ui': 'ELEMENT',
            };
            // GZip
            config.plugins.push(new CompressionWebpackPlugin({
                algorithm: 'gzip',
                test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                threshold: 10240,
                minRatio: 0.8
            }))
        }
    }

}

```
