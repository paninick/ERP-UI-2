import client from './client';

export function listPiecewage(params: any) {
  return client.get('/erp/piecewage/list', { params });
}

export function getPiecewage(id: number) {
  return client.get(`/erp/piecewage/${id}`);
}

export function addPiecewage(data: any) {
  return client.post('/erp/piecewage', data);
}

export function updatePiecewage(data: any) {
  return client.put('/erp/piecewage', data);
}

export function delPiecewage(ids: string) {
  return client.delete(`/erp/piecewage/${ids}`);
}
