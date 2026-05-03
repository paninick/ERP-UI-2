import client from './client';

const BASE = '/erp/processLossMatrix';

export const listProcessLossMatrix = (params?: any) => client.get(BASE + '/list', { params });
export const getProcessLossMatrix = (id: number) => client.get(BASE + '/' + id);
export const addProcessLossMatrix = (data: any) => client.post(BASE, data);
export const updateProcessLossMatrix = (data: any) => client.put(BASE, data);
export const delProcessLossMatrix = (id: number) => client.delete(BASE + '/' + id);
