import client from './client';

export function listProductTrace(params: any) {
  return client.get('/erp/productTrace/list', { params });
}
