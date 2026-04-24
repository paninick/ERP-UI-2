import client from './client';

export function listWorkCenter(params: any) {
  return client.get('/erp/workCenter/list', { params });
}

export function getWorkCenter(id: number) {
  return client.get(`/erp/workCenter/${id}`);
}

export function addWorkCenter(data: any) {
  return client.post('/erp/workCenter', data);
}

export function updateWorkCenter(data: any) {
  return client.put('/erp/workCenter', data);
}

export function delWorkCenter(ids: string) {
  return client.delete(`/erp/workCenter/${ids}`);
}
