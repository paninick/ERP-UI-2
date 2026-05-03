import client from './client';

const BASE = '/erp/shipment/tracking';

export function listShipmentTracking(params?: any) { return client.get(BASE + '/list', { params }); }
export function getShipmentTracking(id: number) { return client.get(BASE + '/' + id); }
export function listTrackingByShipment(shipmentId: number) { return client.get(BASE + '/byShipment/' + shipmentId); }
export function addShipmentTracking(data: any) { return client.post(BASE, data); }
