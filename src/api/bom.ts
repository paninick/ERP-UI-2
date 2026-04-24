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
