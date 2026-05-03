import axios from 'axios';
import { useAppStore } from '@/stores/appStore';

const resolvedBaseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL || '';
export const SKIP_FACTORY_CONTEXT_HEADER = 'X-ERP-Skip-Factory-Context';

function clearExpiredSession() {
  localStorage.removeItem('token');
  useAppStore.getState().resetCurrentCompany();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function isExpiredAuthMessage(message: unknown) {
  const text = String(message || '');
  return text.includes('获取用户信息异常') || text.includes('请重新登录') || text.includes('登录状态已过期');
}

const client = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 30000,
});

// 请求拦截器：添加 JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const company = useAppStore.getState().currentCompany;
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const skipFactoryContext = String(config.headers?.[SKIP_FACTORY_CONTEXT_HEADER] || '') === '1';

  if (url.startsWith('/erp/') && !skipFactoryContext) {
    config.headers['X-ERP-Company-Code'] = company.code;
    config.headers['X-ERP-View-Mode'] = company.mode;
  }

  if (
    !skipFactoryContext &&
    method === 'get' &&
    url.startsWith('/erp/') &&
    company.mode === 'factory' &&
    company.factoryId != null
  ) {
    config.params = {
      ...(config.params || {}),
      factoryId: config.params?.factoryId ?? company.factoryId,
    };
  }
  return config;
});

// 响应拦截器：统一处理错误
client.interceptors.response.use(
  (res) => {
    const data = res.data;
    // RuoYi 格式：{ code: 200, msg: '...', data: ... }
    if (data.code !== undefined && data.code !== 200) {
      if (isExpiredAuthMessage(data.msg)) {
        clearExpiredSession();
      }
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401 || isExpiredAuthMessage(error.response?.data?.msg)) {
      clearExpiredSession();
    }
    return Promise.reject(error);
  }
);

export default client;
