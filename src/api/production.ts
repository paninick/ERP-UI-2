import client from './client';

export function listProducePlan(params: any) {
  return client.get('/erp/plan/list', { params });
}

export function getProducePlan(id: number) {
  return client.get(`/erp/plan/${id}`);
}

export function addProducePlan(data: any) {
  return client.post('/erp/plan', data);
}

export function updateProducePlan(data: any) {
  return client.put('/erp/plan', data);
}

export function delProducePlan(ids: string) {
  return client.delete(`/erp/plan/${ids}`);
}

export function listProduceJob(params: any) {
  return client.get('/erp/produceJob/list', { params });
}

export function getProduceJob(id: number) {
  return client.get(`/erp/produceJob/${id}`);
}

export function addProduceJob(data: any) {
  return client.post('/erp/produceJob', data);
}

export function updateProduceJob(data: any) {
  return client.put('/erp/produceJob', data);
}

export function delProduceJob(ids: string) {
  return client.delete(`/erp/produceJob/${ids}`);
}

export function getProduceGantt(params: any) {
  return client.get('/erp/producegantt/list', { params });
}

export function getProduceBoard() {
  return client.get('/erp/produceboard/stats');
}

export function initJobProcesses(jobId: number, routeId: number) {
  return client.post(`/erp/produceJob/initProcesses/${jobId}/${routeId}`);
}
