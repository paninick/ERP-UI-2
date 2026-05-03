import client from './client'

export function listCostVariance(params: any) {
  return client.get('/erp/costVariance/list', { params })
}

export function getCostVariance(id: number) {
  return client.get(`/erp/costVariance/${id}`)
}

export function calculateCostVariance(planId: number, period?: string) {
  return client.post(`/erp/costVariance/calculate/${planId}`, null, {
    params: period ? { period } : undefined,
  })
}

export function freezeCostVariance(id: number, freezeReason?: string) {
  return client.post(`/erp/costVariance/freeze/${id}`, { freezeReason })
}

export function exportCostVariance(params: any) {
  return client.post('/erp/costVariance/export', params)
}
