import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyload from 'vue-lazyload'
import axios from 'axios';

// ========== 核心修改：baseURL 改成 /api ==========
axios.defaults.baseURL = '/api'; // 不再直接写服务器地址，交给代理转发
axios.defaults.timeout = 10000; // 延长超时到10秒（服务器请求可能慢一点）
axios.defaults.headers.post['Content-Type'] = 'application/json';

// ========== 新增：注册 el-loading-spinner 组件，解决警告 ==========
import { Loading } from 'element-ui'
Vue.use(Loading)

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