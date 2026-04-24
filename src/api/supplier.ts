import client from './client';

export function listSupplier(params: any) {
  return client.get('/erp/supplier/list', { params });
}

export function getSupplier(id: number) {
  return client.get(`/erp/supplier/${id}`);
}

export function addSupplier(data: any) {
  return client.post('/erp/supplier', data);
}

export function updateSupplier(data: any) {
  return client.put('/erp/supplier', data);
}

export function delSupplier(ids: string) {
  return client.delete(`/erp/supplier/${ids}`);
}
