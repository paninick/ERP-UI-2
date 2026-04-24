import client from './client';

export function listDefect(params: any) {
  return client.get('/erp/defect/list', { params });
}

export function getDefect(id: number) {
  return client.get(`/erp/defect/${id}`);
}

export function addDefect(data: any) {
  return client.post('/erp/defect', data);
}

export function updateDefect(data: any) {
  return client.put('/erp/defect', data);
}

export function delDefect(ids: string) {
  return client.delete(`/erp/defect/${ids}`);
}
