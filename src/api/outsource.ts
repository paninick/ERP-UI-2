import client from './client';

export function listOutsource(params: any) {
  return client.get('/erp/outsource/list', { params });
}

export function getOutsource(id: number) {
  return client.get(`/erp/outsource/${id}`);
}

export function addOutsource(data: any) {
  return client.post('/erp/outsource', data);
}

export function updateOutsource(data: any) {
  return client.put('/erp/outsource', data);
}

export function delOutsource(ids: string) {
  return client.delete(`/erp/outsource/${ids}`);
}
