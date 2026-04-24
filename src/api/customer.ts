import client from './client';

export function listCustomer(params: any) {
  return client.get('/erp/customer/list', { params });
}

export function getCustomer(id: number) {
  return client.get(`/erp/customer/${id}`);
}

export function addCustomer(data: any) {
  return client.post('/erp/customer', data);
}

export function updateCustomer(data: any) {
  return client.put('/erp/customer', data);
}

export function delCustomer(ids: string) {
  return client.delete(`/erp/customer/${ids}`);
}
