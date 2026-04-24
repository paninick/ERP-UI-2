import client from './client';

export function listMainMaterial(params: any) {
  return client.get('/erp/material/main/list', { params });
}

export function getMainMaterial(id: number) {
  return client.get(`/erp/material/main/${id}`);
}

export function addMainMaterial(data: any) {
  return client.post('/erp/material/main', data);
}

export function updateMainMaterial(data: any) {
  return client.put('/erp/material/main', data);
}

export function delMainMaterial(ids: string) {
  return client.delete(`/erp/material/main/${ids}`);
}

export function listAuxiliaryMaterial(params: any) {
  return client.get('/erp/auxiliary/list', { params });
}

export function getAuxiliaryMaterial(id: number) {
  return client.get(`/erp/auxiliary/${id}`);
}

export function addAuxiliaryMaterial(data: any) {
  return client.post('/erp/auxiliary', data);
}

export function updateAuxiliaryMaterial(data: any) {
  return client.put('/erp/auxiliary', data);
}

export function delAuxiliaryMaterial(ids: string) {
  return client.delete(`/erp/auxiliary/${ids}`);
}
