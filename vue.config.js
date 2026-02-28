const { defineConfig } = require('@vue/cli-service')
// 本地开发时的基础地址（生产环境不生效）
const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8080'

module.exports = defineConfig({
  transpileDependencies: true,
  // 开发环境代理配置（仅本地 npm run serve 时生效）
  devServer: {
    port: 1011,
    proxy: {
      // 匹配所有接口路径
      '/': {
        target: baseURL, // 动态代理地址（本地/服务器）
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