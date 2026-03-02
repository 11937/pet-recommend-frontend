const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 适配 GitHub Pages 路径（仓库名必须完全一致）
  publicPath: '/pet-recommend-frontend/',
  // 开发环境代理配置（保留不动）
  devServer: {
    port: 1011,
    proxy: {
      '/api': {
        target: 'http://139.155.144.90:1010', 
        changeOrigin: true,
        ws: false,
        secure: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  productionSourceMap: false
})