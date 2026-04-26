import request from '@/utils/request';

const BASE = '/erp/shipment';

export function listShipment(params?: any) {
  return request({ url: BASE + '/list', method: 'get', params });
}

export function getShipment(id: number) {
  return request({ url: BASE + '/' + id, method: 'get' });
}

export function addShipment(data: any) {
  return request({ url: BASE, method: 'post', data });
}

export function updateShipment(data: any) {
  return request({ url: BASE, method: 'put', data });
}

export function delShipment(ids: string) {
  return request({ url: BASE + '/' + ids, method: 'delete' });
}
