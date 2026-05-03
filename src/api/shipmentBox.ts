import client from './client';

const BASE = '/erp/shipment/box';

export function listShipmentBox(params?: any) { return client.get(BASE + '/list', { params }); }
export function getShipmentBox(id: number) { return client.get(BASE + '/' + id); }
export function listBoxByShipment(shipmentId: number) { return client.get(BASE + '/byShipment/' + shipmentId); }
export function addShipmentBox(data: any) { return client.post(BASE, data); }
export function updateShipmentBox(data: any) { return client.put(BASE, data); }
export function delShipmentBox(ids: string) { return client.delete(BASE + '/' + ids); }
