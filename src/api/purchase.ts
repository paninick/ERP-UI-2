import client from './client';

export function listPurchase(params: any) {
  return client.get('/erp/purchase/list', { params });
}

export function getPurchase(id: number) {
  return client.get(`/erp/purchase/${id}`);
}

export function addPurchase(data: any) {
  return client.post('/erp/purchase', data);
}

export function updatePurchase(data: any) {
  return client.put('/erp/purchase', data);
}

export function delPurchase(ids: string) {
  return client.delete(`/erp/purchase/${ids}`);
}
