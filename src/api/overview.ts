import client from './client'

export function listOverview(params: any) {
  return client.get('/erp/overview/list', { params })
}
