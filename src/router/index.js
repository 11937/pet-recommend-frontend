import Vue from "vue";
import VueRouter from "vue-router"; 

Vue.use(VueRouter); // 注册路由插件

// 路由规则配置：保留懒加载
const routes = [
  {
    path: "/",
    name: "Home", // 英文命名，替换原中文“首页”
    component: () => import("@/components/HomeIndex.vue")// 父路由组件
    
  }
];

// 创建路由实例
const router = new VueRouter({
  mode: "history", 
  routes // 路由规则注入
});

export default router;