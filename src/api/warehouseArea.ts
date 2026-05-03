import client from './client';

const BASE = '/erp/warehousearea';

export const listWarehouseArea = (params?: any) => client.get(BASE + '/list', { params });
export const getWarehouseArea = (id: number) => client.get(BASE + '/' + id);
export const addWarehouseArea = (data: any) => client.post(BASE, data);
export const updateWarehouseArea = (data: any) => client.put(BASE, data);
export const delWarehouseArea = (id: number) => client.delete(BASE + '/' + id);
