import client from './client';

const BASE = '/erp/planmaterial';

export const listPlanMaterial = (params?: any) => client.get(BASE + '/list', { params });
export const getPlanMaterial = (id: number) => client.get(BASE + '/' + id);
export const addPlanMaterial = (data: any) => client.post(BASE, data);
export const updatePlanMaterial = (data: any) => client.put(BASE, data);
export const delPlanMaterial = (id: number) => client.delete(BASE + '/' + id);
