import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyload from 'vue-lazyload'
import axios from 'axios';

// 适配netlify/vercel
axios.defaults.baseURL = '/api'; 
axios.defaults.timeout = 10000; 
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 新增：注册 el-loading-spinner 组件，解决警告
import { Loading } from 'element-ui'
Vue.use(Loading)

// 挂载到 Vue 原型
Vue.prototype.$axios = axios;
// 新增：同时挂载到 window，方便控制台调试
window.axios = axios;

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueLazyload, {
  lazyComponent: true
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')