import client from './client';

export function listSalesOrder(params: any) {
  return client.get('/erp/sales/order/list', { params });
}

export function nextSalesNo() {
  return client.get('/erp/sales/order/nextNo');
}

export function getSalesOrder(id: number) {
  return client.get(`/erp/sales/order/${id}`);
}

export function addSalesOrder(data: any) {
  return client.post('/erp/sales/order', data);
}

export function updateSalesOrder(data: any) {
  return client.put('/erp/sales/order', data);
}

export function delSalesOrder(ids: string) {
  return client.delete(`/erp/sales/order/${ids}`);
}

export function exportSalesOrder(params: any) {
  return client.post('/erp/sales/order/export', params, { responseType: 'blob' });
}

export function submitSalesOrder(id: number) {
  return client.put(`/erp/sales/order/submit/${id}`);
}

export function approveSalesOrder(id: number, remark?: string) {
  return client.put(`/erp/sales/order/approve/${id}`, remark ? { remark } : undefined);
}

export function rejectSalesOrder(id: number, remark?: string) {
  return client.put(`/erp/sales/order/reject/${id}`, { remark: remark || '' });
}
