import request from '@/utils/request';

const BASE = '/erp/inspection/booking';

export function listBooking(params?: any) {
  return request({ url: BASE + '/list', method: 'get', params });
}

export function getBooking(id: number) {
  return request({ url: BASE + '/' + id, method: 'get' });
}

export function addBooking(data: any) {
  return request({ url: BASE, method: 'post', data });
}

export function updateBooking(data: any) {
  return request({ url: BASE, method: 'put', data });
}

export function delBooking(ids: string) {
  return request({ url: BASE + '/' + ids, method: 'delete' });
}

export function releaseBooking(id: number) {
  return request({ url: BASE + '/release/' + id, method: 'put' });
}
