import client from './client';

export function listBomSubstitute(params: any) {
  return client.get('/erp/bomSubstitute/list', { params });
}

export function getBomSubstitute(id: number) {
  return client.get(`/erp/bomSubstitute/${id}`);
}

export function listApprovedBomSubstituteByBomId(bomId: number) {
  return client.get(`/erp/bomSubstitute/bom/${bomId}`);
}

export function addBomSubstitute(data: any) {
  return client.post('/erp/bomSubstitute', data);
}

export function updateBomSubstitute(data: any) {
  return client.put('/erp/bomSubstitute', data);
}

export function delBomSubstitute(ids: string) {
  return client.delete(`/erp/bomSubstitute/${ids}`);
}

export function submitBomSubstitute(id: number) {
  return client.post(`/erp/bomSubstitute/submit/${id}`);
}

export function approveBomSubstitute(id: number, remark?: string) {
  return client.post(`/erp/bomSubstitute/approve/${id}`, remark ? { remark } : undefined);
}

export function rejectBomSubstitute(id: number, remark?: string) {
  return client.post(`/erp/bomSubstitute/reject/${id}`, remark ? { remark } : undefined);
}

export function voidBomSubstitute(id: number, remark?: string) {
  return client.post(`/erp/bomSubstitute/void/${id}`, remark ? { remark } : undefined);
}
