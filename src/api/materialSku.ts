import client from './client';

const BASE = '/erp/material/sku';

export const listMaterialSku = (params?: any) => client.get(BASE + '/list', { params });
export const getMaterialSku = (id: number) => client.get(BASE + '/' + id);
export const addMaterialSku = (data: any) => client.post(BASE, data);
export const updateMaterialSku = (data: any) => client.put(BASE, data);
export const delMaterialSku = (id: number) => client.delete(BASE + '/' + id);
