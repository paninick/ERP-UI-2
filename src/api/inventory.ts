import client from './client';

export function listStockIn(params: any) {
  return client.get('/erp/stockIn/list', { params });
}

export function getStockIn(id: number) {
  return client.get(`/erp/stockIn/${id}`);
}

export function addStockIn(data: any) {
  return client.post('/erp/stockIn', data);
}

export function updateStockIn(data: any) {
  return client.put('/erp/stockIn', data);
}

export function delStockIn(ids: string) {
  return client.delete(`/erp/stockIn/${ids}`);
}

export function listStockOut(params: any) {
  return client.get('/erp/stockOut/list', { params });
}

export function getStockOut(id: number) {
  return client.get(`/erp/stockOut/${id}`);
}

export function addStockOut(data: any) {
  return client.post('/erp/stockOut', data);
}

export function updateStockOut(data: any) {
  return client.put('/erp/stockOut', data);
}

export function delStockOut(ids: string) {
  return client.delete(`/erp/stockOut/${ids}`);
}

export function listInventory(params: any) {
  return client.get('/erp/inventory/list', { params });
}
