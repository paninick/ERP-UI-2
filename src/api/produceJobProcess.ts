import client from './client';

export function listProduceJobProcess(params: any) {
  return client.get('/erp/produceJobProcess/list', { params });
}

export function getProduceJobProcess(id: number) {
  return client.get(`/erp/produceJobProcess/${id}`);
}

export function listByJob(jobId: number) {
  return client.get(`/erp/produceJobProcess/listByJob/${jobId}`);
}

export function getCurrentProcess(jobId: number) {
  return client.get(`/erp/produceJobProcess/currentProcess/${jobId}`);
}

export function addProduceJobProcess(data: any) {
  return client.post('/erp/produceJobProcess', data);
}

export function updateProduceJobProcess(data: any) {
  return client.put('/erp/produceJobProcess', data);
}

export function delProduceJobProcess(ids: string) {
  return client.delete(`/erp/produceJobProcess/${ids}`);
}
