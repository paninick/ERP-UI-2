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

export function listStockInItem(params: any) {
  return client.get('/erp/stockIn/item/list', { params });
}

export function listStockInItemByInId(inId: number) {
  return client.get(`/erp/stockIn/item/listByIn/${inId}`);
}

export function getStockInItem(id: number) {
  return client.get(`/erp/stockIn/item/${id}`);
}

export function addStockInItem(data: any) {
  return client.post('/erp/stockIn/item', data);
}

export function updateStockInItem(data: any) {
  return client.put('/erp/stockIn/item', data);
}

export function delStockInItem(ids: string) {
  return client.delete(`/erp/stockIn/item/${ids}`);
}

export function listStockOutItem(params: any) {
  return client.get('/erp/stockOut/item/list', { params });
}

export function listStockOutItemByOutId(outId: number) {
  return client.get(`/erp/stockOut/item/listByOut/${outId}`);
}

export function getStockOutItem(id: number) {
  return client.get(`/erp/stockOut/item/${id}`);
}

export function addStockOutItem(data: any) {
  return client.post('/erp/stockOut/item', data);
}

export function updateStockOutItem(data: any) {
  return client.put('/erp/stockOut/item', data);
}

export function delStockOutItem(ids: string) {
  return client.delete(`/erp/stockOut/item/${ids}`);
}
