import client from './client';

export function listFinInvoice(params: any) {
  return client.get('/erp/finInvoice/list', { params });
}

export function getFinInvoice(id: number) {
  return client.get(`/erp/finInvoice/${id}`);
}

export function addFinInvoice(data: any) {
  return client.post('/erp/finInvoice', data);
}

export function updateFinInvoice(data: any) {
  return client.put('/erp/finInvoice', data);
}

export function delFinInvoice(ids: string) {
  const [firstId] = String(ids).split(',');
  return client.delete(`/erp/finInvoice/${firstId}`);
}
