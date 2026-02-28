const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 开发环境代理配置（转发到后端8080）
  devServer: {
    port:1011,
    proxy: {
      '': {
        target: 'http://localhost:8080', // 后端基础地址
        changeOrigin: true, // 开启跨域转发（必设true，核心）
        ws: false // 无WebSocket需求，设为false更稳定
      }
    }
  }
})