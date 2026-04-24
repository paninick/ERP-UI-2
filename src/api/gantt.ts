import client from './client';

export function getGanttData() {
  return client.get('/erp/producegantt/list');
}

export function updateGanttDate(id: number, startDate: string, dueDate: string) {
  return client.put(`/erp/producegantt/updateDate/${id}`, null, {
    params: { startDate, dueDate },
  });
}
