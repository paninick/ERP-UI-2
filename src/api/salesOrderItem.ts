import client from './client';

const BASE = '/erp/salesitem';

export const listSalesOrderItem = (params?: any) => client.get(BASE + '/list', { params });
export const getSalesOrderItem = (id: number) => client.get(BASE + '/' + id);
export const addSalesOrderItem = (data: any) => client.post(BASE, data);
export const updateSalesOrderItem = (data: any) => client.put(BASE, data);
export const delSalesOrderItem = (id: number) => client.delete(BASE + '/' + id);
