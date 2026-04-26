import client from './client';

const BASE = '/erp/inspection/booking';

export function listBooking(params?: any) { return client.get(BASE + '/list', { params }); }
export function getBooking(id: number) { return client.get(BASE + '/' + id); }
export function addBooking(data: any) { return client.post(BASE, data); }
export function updateBooking(data: any) { return client.put(BASE, data); }
export function delBooking(ids: string) { return client.delete(BASE + '/' + ids); }
export function releaseBooking(id: number) { return client.put(BASE + '/release/' + id); }
