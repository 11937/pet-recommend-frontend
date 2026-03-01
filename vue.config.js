const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 开发环境代理配置（格式严格符合 Vue CLI 要求）
  devServer: {
    port: 1011,
    proxy: {
      // 这里的 "/api" 是请求前缀（context），必须是字符串
      '/api': {
        target: 'http://139.155.144.90:1010', 
        changeOrigin: true, // 强制跨域（布尔值，不能写错）
        ws: false,
        secure: false, // HTTP 协议需关闭 HTTPS 校验
        pathRewrite: {
          '^/api': '' // 路径重写规则（对象格式）
        }
      }
    }
  },
  productionSourceMap: false
})