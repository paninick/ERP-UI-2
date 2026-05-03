import client from './client';

const BASE = '/erp/shipment/detail';

export function listShipmentDetail(params?: any) { return client.get(BASE + '/list', { params }); }
export function getShipmentDetail(id: number) { return client.get(BASE + '/' + id); }
export function listDetailByShipment(shipmentId: number) { return client.get(BASE + '/byShipment/' + shipmentId); }
export function addShipmentDetail(data: any) { return client.post(BASE, data); }
export function updateShipmentDetail(data: any) { return client.put(BASE, data); }
export function delShipmentDetail(ids: string) { return client.delete(BASE + '/' + ids); }
export function delDetailByShipment(shipmentId: number) { return client.delete(BASE + '/byShipment/' + shipmentId); }
