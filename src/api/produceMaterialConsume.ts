import client from './client';

export function listProduceMaterialConsume(params: any) {
  return client.get('/erp/materialconsume/list', { params });
}

export function listProduceMaterialConsumeByPlan(producePlanId: number) {
  return client.get(`/erp/materialconsume/listByPlan/${producePlanId}`);
}

export function getProduceMaterialConsume(id: number) {
  return client.get(`/erp/materialconsume/${id}`);
}

export function addProduceMaterialConsume(data: any) {
  return client.post('/erp/materialconsume', data);
}

export function updateProduceMaterialConsume(data: any) {
  return client.put('/erp/materialconsume', data);
}

export function approveProduceMaterialConsume(id: number, approved: boolean, remark = '') {
  return client.put(`/erp/materialconsume/approve/${id}`, null, {
    params: { approved, remark },
  });
}

export function getProduceMaterialLossStats() {
  return client.get('/erp/materialconsume/lossStats');
}

export function listProduceMaterialConsumeByStockOut(stockOutId: number) {
  return client.get('/erp/materialconsume/list', {
    params: { pageNum: 1, pageSize: 200, stockOutId },
  });
}

export function listProduceMaterialConsumeByStockOutItem(stockOutItemId: number) {
  return client.get('/erp/materialconsume/list', {
    params: { pageNum: 1, pageSize: 200, stockOutItemId },
  });
}

export function syncProduceMaterialConsumeByStockOut(stockOutId: number) {
  return client.post(`/erp/materialconsume/syncByStockOut/${stockOutId}`);
}

export function bindProduceMaterialConsumeToJobProcess(consumeId: number, jobProcessId: number, reportLogId?: number) {
  return client.put(`/erp/materialconsume/bind/${consumeId}`, null, {
    params: { jobProcessId, reportLogId },
  });
}
