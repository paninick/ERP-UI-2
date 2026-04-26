import client from './client';

export function listProduceReportLog(params: any) {
  return client.get('/erp/produceReportLog/list', { params });
}

export function getProduceReportLog(id: number) {
  return client.get(`/erp/produceReportLog/${id}`);
}

export function addProduceReportLog(data: any) {
  return client.post('/erp/produceReportLog', data);
}

export function batchProduceReport(data: any[]) {
  return client.post('/erp/produceReportLog/batchReport', data);
}

export function updateProduceReportLog(data: any) {
  return client.put('/erp/produceReportLog', data);
}

export function delProduceReportLog(ids: string) {
  return client.delete(`/erp/produceReportLog/${ids}`);
}
