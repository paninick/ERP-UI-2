import client from './client';

const BASE = '/erp/standardColor';

export const listStandardColor = (params?: any) => client.get(BASE + '/list', { params });
export const getStandardColor = (id: number) => client.get(BASE + '/' + id);
export const addStandardColor = (data: any) => client.post(BASE, data);
export const updateStandardColor = (data: any) => client.put(BASE, data);
export const delStandardColor = (id: number) => client.delete(BASE + '/' + id);
