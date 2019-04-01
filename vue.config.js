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
                'element-ui': 'ElementUI',
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
