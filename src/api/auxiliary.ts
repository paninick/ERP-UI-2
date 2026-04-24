import client from './client';

export function listAuxiliary(params: any) {
  return client.get('/erp/auxiliary/list', { params });
}

export function getAuxiliary(id: number) {
  return client.get(`/erp/auxiliary/${id}`);
}

export function addAuxiliary(data: any) {
  return client.post('/erp/auxiliary', data);
}

export function updateAuxiliary(data: any) {
  return client.put('/erp/auxiliary', data);
}

export function delAuxiliary(ids: string) {
  return client.delete(`/erp/auxiliary/${ids}`);
}
