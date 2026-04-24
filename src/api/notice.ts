import client from './client';

export function listNotice(params: any) {
  return client.get('/erp/notice/list', { params });
}

export function getNotice(id: number) {
  return client.get(`/erp/notice/${id}`);
}

export function addNotice(data: any) {
  return client.post('/erp/notice', data);
}

export function updateNotice(data: any) {
  return client.put('/erp/notice', data);
}

export function delNotice(ids: string) {
  return client.delete(`/erp/notice/${ids}`);
}
