import client from './client';

export function getGanttData(params?: any) {
  return client.get('/erp/producegantt/list', { params });
}

export function updateGanttDate(id: number, startDate: string, dueDate: string) {
  return client.put(`/erp/producegantt/updateDate/${id}`, null, {
    params: { startDate, dueDate },
  });
}

export function detectGanttConflicts() {
  return client.post('/erp/producegantt/detectConflicts');
}

export function rescheduleGanttPlan(id: number, newStartDate?: string, newDueDate?: string) {
  return client.put(`/erp/producegantt/reschedule/${id}`, null, {
    params: { newStartDate, newDueDate },
  });
}
