import client from './client';

export function listQuality(params: any) {
  return client.get('/erp/quality/list', { params });
}

export function getQuality(id: number) {
  return client.get(`/erp/quality/${id}`);
}

export function addQuality(data: any) {
  return client.post('/erp/quality', data);
}

export function updateQuality(data: any) {
  return client.put('/erp/quality', data);
}

export function delQuality(ids: string) {
  return client.delete(`/erp/quality/${ids}`);
}
