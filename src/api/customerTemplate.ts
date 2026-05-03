import client from './client';

const BASE = '/erp/customerTemplate';

export const listCustomerTemplate = (params?: any) => client.get(BASE + '/list', { params });
export const getCustomerTemplate = (id: number) => client.get(BASE + '/' + id);
export const addCustomerTemplate = (data: any) => client.post(BASE, data);
export const updateCustomerTemplate = (data: any) => client.put(BASE, data);
export const delCustomerTemplate = (id: number) => client.delete(BASE + '/' + id);
