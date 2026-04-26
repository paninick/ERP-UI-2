import request from '@/utils/request';

const BASE = '/erp/style';

export function listStyle(params?: any) {
  return request({ url: BASE + '/list', method: 'get', params });
}

export function getStyle(id: number) {
  return request({ url: BASE + '/' + id, method: 'get' });
}

export function addStyle(data: any) {
  return request({ url: BASE, method: 'post', data });
}

export function updateStyle(data: any) {
  return request({ url: BASE, method: 'put', data });
}

export function delStyle(ids: string) {
  return request({ url: BASE + '/' + ids, method: 'delete' });
}
