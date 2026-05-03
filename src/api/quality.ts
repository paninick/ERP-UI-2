import client from './client';

export function listQuality(params: any) {
  return client.get('/erp/qc/list', { params });
}

export function getQuality(id: number) {
  return client.get(`/erp/qc/${id}`);
}

export function getQualityByJobProcess(jobProcessId: number) {
  return client.get(`/erp/qc/jobProcess/${jobProcessId}`);
}

export function ensureQualityByJobProcess(jobProcessId: number) {
  return client.post(`/erp/qc/ensure/jobProcess/${jobProcessId}`);
}

export function addQuality(data: any) {
  return client.post('/erp/qc', data);
}

export function updateQuality(data: any) {
  return client.put('/erp/qc', data);
}

export function delQuality(ids: string) {
  return client.delete(`/erp/qc/${ids}`);
}

export function passQuality(id: number) {
  return client.post(`/erp/qc/pass/${id}`);
}

export function rejectQuality(id: number, data: { reason: string }) {
  return client.post(`/erp/qc/reject/${id}`, data);
}
