import client from './client';

export function listInvoice(params: any) {
  return client.get('/erp/invoice/list', { params });
}

export function getInvoice(id: number) {
  return client.get(`/erp/invoice/${id}`);
}

export function addInvoice(data: any) {
  return client.post('/erp/invoice', data);
}

export function updateInvoice(data: any) {
  return client.put('/erp/invoice', data);
}

export function delInvoice(ids: string) {
  return client.delete(`/erp/invoice/${ids}`);
}
