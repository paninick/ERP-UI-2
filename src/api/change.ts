import client from './client';

export function listChangeOrder(params: any) {
  return client.get('/erp/change/order/list', { params });
}

export function getChangeOrder(id: number) {
  return client.get(`/erp/change/order/${id}`);
}

export function addChangeOrder(data: any) {
  return client.post('/erp/change/order', data);
}

export function updateChangeOrder(data: any) {
  return client.put('/erp/change/order', data);
}

export function delChangeOrder(ids: string) {
  return client.delete(`/erp/change/order/${ids}`);
}

export function submitChangeOrder(id: number) {
  return client.put(`/erp/change/order/submit/${id}`);
}

export function approveChangeOrder(id: number, data?: { auditStatus?: string; remark?: string }) {
  return client.put(`/erp/change/order/approve/${id}`, data);
}

export function executeChangeOrder(id: number) {
  return client.put(`/erp/change/order/execute/${id}`);
}

export function generateChangeNo() {
  return client.get('/erp/change/order/generateNo');
}

export function listChangeOrderItem(params: any) {
  return client.get('/erp/change/order/item/list', { params });
}

export function addChangeOrderItem(data: any) {
  return client.post('/erp/change/order/item', data);
}

export function updateChangeOrderItem(data: any) {
  return client.put('/erp/change/order/item', data);
}

export function delChangeOrderItem(ids: string) {
  return client.delete(`/erp/change/order/item/${ids}`);
}
