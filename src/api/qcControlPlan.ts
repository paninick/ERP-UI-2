import client from './client';

const BASE = '/erp/qc/controlPlan';

export function listControlPlan(params: any) { return client.get(BASE + '/list', { params }); }
export function getControlPlan(id: number) { return client.get(BASE + '/' + id); }
export function getControlPlanByFamily(productFamily: string) { return client.get(BASE + '/byFamily/' + productFamily); }
export function addControlPlan(data: any) { return client.post(BASE, data); }
export function updateControlPlan(data: any) { return client.put(BASE, data); }
export function delControlPlan(id: number) { return client.delete(BASE + '/' + id); }

export function listCharacteristics(planId: number) { return client.get(BASE + '/characteristics/' + planId); }
export function addCharacteristic(data: any) { return client.post(BASE + '/characteristic', data); }
export function updateCharacteristic(data: any) { return client.put(BASE + '/characteristic', data); }
export function delCharacteristic(id: number) { return client.delete(BASE + '/characteristic/' + id); }
