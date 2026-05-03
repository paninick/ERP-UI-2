import client from './client';

export function listWarehouseLocation(params: any) {
  return client.get('/erp/warehouselocation/list', { params });
}

export function getWarehouseLocation(id: number) {
  return client.get(`/erp/warehouselocation/${id}`);
}

export function addWarehouseLocation(data: any) {
  return client.post('/erp/warehouselocation', data);
}

export function updateWarehouseLocation(data: any) {
  return client.put('/erp/warehouselocation', data);
}

export function delWarehouseLocation(ids: string) {
  return client.delete(`/erp/warehouselocation/${ids}`);
}
