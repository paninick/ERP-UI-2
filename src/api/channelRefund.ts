import client from './client';

export function listChannelRefund(params: any) {
  return client.get('/erp/channel/refundOrder/list', { params });
}

export function getChannelRefund(id: number) {
  return client.get(`/erp/channel/refundOrder/${id}`);
}

export function addChannelRefund(data: any) {
  return client.post('/erp/channel/refundOrder', data);
}

export function updateChannelRefund(data: any) {
  return client.put('/erp/channel/refundOrder', data);
}

export function delChannelRefund(ids: string) {
  return client.delete(`/erp/channel/refundOrder/${ids}`);
}

export function startInspect(id: number) {
  return client.post(`/erp/channel/refundOrder/startInspect/${id}`);
}

export function completeInspect(id: number, inspectRemark?: string) {
  return client.post(`/erp/channel/refundOrder/completeInspect/${id}`, { inspectRemark });
}

export function listResaleGrade(refundOrderId: number) {
  return client.get(`/erp/channel/resaleGrade/list/${refundOrderId}`);
}

export function getResaleGrade(id: number) {
  return client.get(`/erp/channel/resaleGrade/${id}`);
}

export function addResaleGrade(data: any) {
  return client.post('/erp/channel/resaleGrade', data);
}

export function delResaleGrade(id: number) {
  return client.delete(`/erp/channel/resaleGrade/${id}`);
}
