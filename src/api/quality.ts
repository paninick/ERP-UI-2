import client from './client';

export function listQuality(params: any) {
  return client.get('/erp/qc/list', { params });
}

export function getQuality(id: number) {
  return client.get(`/erp/qc/${id}`);
}

export function addQuality(data: any) {
  return client.post('/erp/qc', data);
}

export function updateQuality(data: any) {
  return client.put('/erp/qc', data);
}

export function delQuality(ids: string) {
  return client.delete(`/erp/qc/${ids}`);
}
