import client from './client';

const BASE = '/erp/planclothes';

export const listPlanClothes = (params?: any) => client.get(BASE + '/list', { params });
export const getPlanClothes = (id: number) => client.get(BASE + '/' + id);
export const addPlanClothes = (data: any) => client.post(BASE, data);
export const updatePlanClothes = (data: any) => client.put(BASE, data);
export const delPlanClothes = (id: number) => client.delete(BASE + '/' + id);
