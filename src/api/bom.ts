import client from './client';

export function listBom(params: any) {
  return client.get('/erp/bom/list', { params });
}

export function getBom(id: number) {
  return client.get(`/erp/bom/${id}`);
}

export function addBom(data: any) {
  return client.post('/erp/bom', data);
}

export function updateBom(data: any) {
  return client.put('/erp/bom', data);
}

export function delBom(ids: string) {
  return client.delete(`/erp/bom/${ids}`);
}

export function submitBom(id: number) {
  return client.put(`/erp/bom/submit/${id}`);
}

export function approveBom(id: number, remark?: string) {
  return client.put(`/erp/bom/approve/${id}`, remark ? { remark } : undefined);
}

export function rejectBom(id: number, remark?: string) {
  return client.put(`/erp/bom/reject/${id}`, { remark: remark || '' });
}
