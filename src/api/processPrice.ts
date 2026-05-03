import client from './client';

const BASE = '/erp/processPrice';

export const listProcessPrice = (params?: any) => client.get(BASE + '/list', { params });
export const getProcessPrice = (id: number) => client.get(BASE + '/' + id);
export const addProcessPrice = (data: any) => client.post(BASE, data);
export const updateProcessPrice = (data: any) => client.put(BASE, data);
export const delProcessPrice = (id: number) => client.delete(BASE + '/' + id);
