import client from './client';

const BASE = '/erp/dataimport';

export const listDataImport = (params?: any) => client.get(BASE + '/list', { params });
export const getDataImport = (id: number) => client.get(BASE + '/' + id);
export const addDataImport = (data: any) => client.post(BASE, data);
export const updateDataImport = (data: any) => client.put(BASE, data);
export const delDataImport = (id: number) => client.delete(BASE + '/' + id);

export const list = listDataImport;
export const get = getDataImport;
export const add = addDataImport;
export const update = updateDataImport;
export const remove = delDataImport;
