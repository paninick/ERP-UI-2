import client from './client';

const BASE = '/erp/check';

export const listCheck = (params?: any) => client.get(BASE + '/list', { params });
export const getCheck = (id: number) => client.get(BASE + '/' + id);
export const addCheck = (data: any) => client.post(BASE, data);
export const updateCheck = (data: any) => client.put(BASE, data);
export const delCheck = (id: number) => client.delete(BASE + '/' + id);
export const approveCheck = (data: any) => client.post(BASE + '/approve', data);

export const list = listCheck;
export const get = getCheck;
export const add = addCheck;
export const update = updateCheck;
export const remove = delCheck;
