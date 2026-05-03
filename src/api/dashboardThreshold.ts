import client from './client'

export function listDashboardThresholdRules(params: any) {
  return client.get('/erp/dashboard/threshold/list', { params })
}

export function getDashboardThresholdRule(id: number) {
  return client.get(`/erp/dashboard/threshold/${id}`)
}

export function addDashboardThresholdRule(data: any) {
  return client.post('/erp/dashboard/threshold', data)
}

export function updateDashboardThresholdRule(data: any) {
  return client.put('/erp/dashboard/threshold', data)
}

export function delDashboardThresholdRule(ids: string) {
  return client.delete(`/erp/dashboard/threshold/${ids}`)
}
