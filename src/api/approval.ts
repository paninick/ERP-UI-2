import client from './client';

const BASE = '/erp/approvalLog';

export function listApprovalLog(params: any) { return client.get(BASE + '/list', { params }); }
export function getApprovalLog(id: number) { return client.get(BASE + '/' + id); }
export function getApprovalLogByBusiness(type: string, id: number) { return client.get(BASE + '/business/' + type + '/' + id); }
export function addApprovalLog(data: any) { return client.post(BASE, data); }
