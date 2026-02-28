// 前端接口请求核心封装（本地/生产环境通用）
import axios from 'axios'

// 生产环境读取Netlify环境变量，本地开发用localhost兜底
const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8080'

// 创建axios实例
const service = axios.create({
  baseURL: baseURL, // 接口基础地址（关键）
  timeout: 10000, // 请求超时时间（10秒）
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器（可选，比如添加token）
service.interceptors.request.use(
  (config) => {
    // 如果有登录token，在这里添加（示例）
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = token
    return config
  },
  (error) => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（统一处理返回结果）
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 接口返回成功（根据你的后端返回格式调整）
    if (res.code === 200 || res.success) {
      return res
    } else {
      // 接口返回失败（比如业务错误）
      alert(res.msg || '请求失败')
      return Promise.reject(res)
    }
  },
  (error) => {
    // 网络/服务器错误
    console.error('响应错误：', error)
    alert('服务器连接失败，请稍后重试')
    return Promise.reject(error)
  }
)

// 导出axios实例（所有接口都用这个实例请求）
export default service