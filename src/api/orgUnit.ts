import client from './client';

export function listOrgUnit(params: any) {
  return client.get('/erp/orgunit/list', { params });
}

export function getOrgUnit(id: number) {
  return client.get(`/erp/orgunit/${id}`);
}

export function listOrgUnitChildren(parentId: number) {
  return client.get(`/erp/orgunit/children/${parentId}`);
}

export function addOrgUnit(data: any) {
  return client.post('/erp/orgunit', data);
}

export function updateOrgUnit(data: any) {
  return client.put('/erp/orgunit', data);
}

export function delOrgUnit(ids: string) {
  return client.delete(`/erp/orgunit/${ids}`);
}
