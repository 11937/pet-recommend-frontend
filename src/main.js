import Vue from 'vue'
import App from './App.vue'
import router from './router' // 引入路由实例
import ElementUI from 'element-ui' // 引入Element UI核心库
import 'element-ui/lib/theme-chalk/index.css' // 引入Element UI样式
import VueLazyload from 'vue-lazyload'//引入懒加载

Vue.config.productionTip = false
Vue.use(ElementUI) // 全局注册Element UI，所有组件可直接使用
Vue.use(VueLazyload, {
  lazyComponent: true // 启用懒加载组件支持，确保v-lazy指令生效
})

// Vue实例注入路由，完成核心配置
new Vue({
  router, // 将路由注入Vue实例
  render: h => h(App),
}).$mount('#app')