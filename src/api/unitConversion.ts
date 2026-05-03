import client from './client';

const BASE = '/erp/unitConversion';

export const listUnitConversion = (params?: any) => client.get(BASE + '/list', { params });
export const getUnitConversion = (id: number) => client.get(BASE + '/' + id);
export const addUnitConversion = (data: any) => client.post(BASE, data);
export const updateUnitConversion = (data: any) => client.put(BASE, data);
export const delUnitConversion = (id: number) => client.delete(BASE + '/' + id);
