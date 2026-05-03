import client from './client';

export function listChannelSettlement(params: any) {
  return client.get('/erp/channel/settlement/list', { params });
}

export function getChannelSettlement(id: number) {
  return client.get(`/erp/channel/settlement/${id}`);
}

export function addChannelSettlement(data: any) {
  return client.post('/erp/channel/settlement', data);
}

export function updateChannelSettlement(data: any) {
  return client.put('/erp/channel/settlement', data);
}

export function delChannelSettlement(ids: string) {
  return client.delete(`/erp/channel/settlement/${ids}`);
}

export function calculateChannelSettlement(id: number) {
  return client.post(`/erp/channel/settlement/calculate/${id}`);
}

export function confirmChannelSettlement(id: number) {
  return client.post(`/erp/channel/settlement/confirm/${id}`);
}
