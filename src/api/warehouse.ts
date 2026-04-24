import client from './client';

export function listWarehouse(params: any) {
  return client.get('/erp/warehouse/list', { params });
}

export function getWarehouse(id: number) {
  return client.get(`/erp/warehouse/${id}`);
}

export function addWarehouse(data: any) {
  return client.post('/erp/warehouse', data);
}

export function updateWarehouse(data: any) {
  return client.put('/erp/warehouse', data);
}

export function delWarehouse(ids: string) {
  return client.delete(`/erp/warehouse/${ids}`);
}
