import client from './client';

export function listEmployee(params: any) {
  return client.get('/erp/employee/list', { params });
}

export function getEmployee(id: number) {
  return client.get(`/erp/employee/${id}`);
}

export function addEmployee(data: any) {
  return client.post('/erp/employee', data);
}

export function updateEmployee(data: any) {
  return client.put('/erp/employee', data);
}

export function delEmployee(ids: string) {
  return client.delete(`/erp/employee/${ids}`);
}
