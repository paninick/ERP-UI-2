import client from './client'

export function listQcDefect(params: any) {
  return client.get('/erp/qcDefect/list', { params })
}

export function getQcDefect(id: number) {
  return client.get(`/erp/qcDefect/${id}`)
}

export function addQcDefect(data: any) {
  return client.post('/erp/qcDefect', data)
}

export function updateQcDefect(data: any) {
  return client.put('/erp/qcDefect', data)
}

export function delQcDefect(ids: string) {
  return client.delete(`/erp/qcDefect/${ids}`)
}
