const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 开发环境代理配置（仅本地 npm run serve 时生效）
  devServer: {
    port: 1011,
    proxy: {
      // 匹配所有接口路径
      '/': {
        target: 'http://139.155.144.90:8080', //服务器
        changeOrigin: true, // 强制开启跨域（核心）
        ws: false, // 关闭WebSocket（无需求时更稳定）
        pathRewrite: {
          '^/': '/' // 路径不重写（保持原有接口路径）
        }
      }
    }
  },
  // 生产环境打包配置（可选，优化打包体积）
  productionSourceMap: false
})