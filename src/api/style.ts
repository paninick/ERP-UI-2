import client from './client';

const BASE = '/erp/style';

export function listStyle(params?: any) { return client.get(BASE + '/list', { params }); }
export function getStyle(id: number) { return client.get(BASE + '/' + id); }
export function addStyle(data: any) { return client.post(BASE, data); }
export function updateStyle(data: any) { return client.put(BASE, data); }
export function delStyle(ids: string) { return client.delete(BASE + '/' + ids); }
