import client from './client';

const BASE = '/erp/report';

export const listReport = (params?: any) => client.get(BASE + '/list', { params });
export const getReport = (id: number) => client.get(BASE + '/' + id);
export const exportReport = (data: any) => client.post(BASE + '/export', data, { responseType: 'blob' });

export const list = listReport;
export const get = getReport;
