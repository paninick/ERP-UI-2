import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// 请求拦截器：添加 JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理错误
client.interceptors.response.use(
  (res) => {
    const data = res.data;
    // RuoYi 格式：{ code: 200, msg: '...', data: ... }
    if (data.code !== undefined && data.code !== 200) {
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
