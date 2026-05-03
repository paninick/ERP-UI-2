import client from './client'

export function listCostSummary(params: any) {
  return client.get('/erp/costSummary/list', { params })
}

export function getCostSummary(id: number) {
  return client.get(`/erp/costSummary/${id}`)
}

export function calculateCostSummary(planId: number) {
  return client.post(`/erp/costSummary/calculate/${planId}`)
}
