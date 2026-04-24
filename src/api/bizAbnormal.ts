import client from './client';

export function listBizAbnormal(params: any) {
  return client.get('/erp/bizabnormal/list', { params });
}

export function getBizAbnormal(id: number) {
  return client.get(`/erp/bizabnormal/${id}`);
}

export function addBizAbnormal(data: any) {
  return client.post('/erp/bizabnormal', data);
}

export function updateBizAbnormal(data: any) {
  return client.put('/erp/bizabnormal', data);
}

export function delBizAbnormal(ids: string) {
  return client.delete(`/erp/bizabnormal/${ids}`);
}
