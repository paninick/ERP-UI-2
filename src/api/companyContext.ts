import client from './client';

export function listCompanyContextMapping(params: any) {
  return client.get('/erp/company-context/list', { params });
}

export function getCompanyContextMapping(id: number) {
  return client.get(`/erp/company-context/${id}`);
}

export function addCompanyContextMapping(data: any) {
  return client.post('/erp/company-context', data);
}

export function updateCompanyContextMapping(data: any) {
  return client.put('/erp/company-context', data);
}

export function delCompanyContextMapping(ids: string) {
  return client.delete(`/erp/company-context/${ids}`);
}
