import client from './client';

const BASE = '/erp/processRouteItem';

export const listProcessRouteItem = (params?: any) => client.get(BASE + '/list', { params });
export const getProcessRouteItem = (id: number) => client.get(BASE + '/' + id);
export const addProcessRouteItem = (data: any) => client.post(BASE, data);
export const updateProcessRouteItem = (data: any) => client.put(BASE, data);
export const delProcessRouteItem = (id: number) => client.delete(BASE + '/' + id);
