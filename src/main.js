import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyload from 'vue-lazyload'
import axios from 'axios'; // 引入原生axios

// 核心：给原生axios配置全局baseURL（关键！）
axios.defaults.baseURL = 'https://api.catrecommend.cloud:8443';
axios.defaults.timeout = 5000; // 全局超时时间
axios.defaults.headers.post['Content-Type'] = 'application/json'; // 全局POST请求头

// 把原生axios挂载到Vue原型（组件中可通过this.$axios调用）
Vue.prototype.$axios = axios;

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueLazyload, {
  lazyComponent: true
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')