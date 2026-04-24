import client from './client';

export function listProcessDef(params: any) {
  return client.get('/erp/processDef/list', { params });
}

export function getProcessDef(id: number) {
  return client.get(`/erp/processDef/${id}`);
}

export function addProcessDef(data: any) {
  return client.post('/erp/processDef', data);
}

export function updateProcessDef(data: any) {
  return client.put('/erp/processDef', data);
}

export function delProcessDef(ids: string) {
  return client.delete(`/erp/processDef/${ids}`);
}
