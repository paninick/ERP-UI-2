import client from './client';

export function listPiecewage(params: any) {
  return client.get('/erp/piecewage/list', { params });
}

export function getPiecewage(id: number) {
  return client.get(`/erp/piecewage/${id}`);
}

export function addPiecewage(data: any) {
  return client.post('/erp/piecewage', data);
}

export function updatePiecewage(data: any) {
  return client.put('/erp/piecewage', data);
}

export function delPiecewage(ids: string) {
  return client.delete(`/erp/piecewage/${ids}`);
}

export function autoGeneratePiecewage(wageMonth: string) {
  return client.post('/erp/piecewage/autoGenerate', null, {
    params: { wageMonth },
  });
}

export function confirmPiecewage(id: number) {
  return client.put(`/erp/piecewage/confirm/${id}`);
}

export function payPiecewage(id: number) {
  return client.put(`/erp/piecewage/pay/${id}`);
}

export function listPiecewageDetailByWage(wageId: number) {
  return client.get(`/erp/piecewagedetail/listByWage/${wageId}`);
}
