import client from './client'

export function listStockLog(params: any) {
  return client.get('/erp/stock/log/list', { params })
}

export function getStockLog(id: number) {
  return client.get(`/erp/stock/log/${id}`)
}

export function addStockLog(data: any) {
  return client.post('/erp/stock/log', data)
}

export function updateStockLog(data: any) {
  return client.put('/erp/stock/log', data)
}

export function delStockLog(ids: string) {
  return client.delete(`/erp/stock/log/${ids}`)
}
