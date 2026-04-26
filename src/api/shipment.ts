import client from './client';

const BASE = '/erp/shipment';

export function listShipment(params?: any) { return client.get(BASE + '/list', { params }); }
export function getShipment(id: number) { return client.get(BASE + '/' + id); }
export function addShipment(data: any) { return client.post(BASE, data); }
export function updateShipment(data: any) { return client.put(BASE, data); }
export function delShipment(ids: string) { return client.delete(BASE + '/' + ids); }
