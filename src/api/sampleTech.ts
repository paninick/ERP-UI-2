import client from './client'

export function listSampleTech(params: any) {
  return client.get('/erp/tech/list', { params })
}

export function getSampleTech(id: number) {
  return client.get(`/erp/tech/${id}`)
}

export function addSampleTech(data: any) {
  return client.post('/erp/tech', data)
}

export function updateSampleTech(data: any) {
  return client.put('/erp/tech', data)
}

export function delSampleTech(ids: string) {
  return client.delete(`/erp/tech/${ids}`)
}

export function submitSampleTech(id: number) {
  return client.put(`/erp/tech/submit/${id}`)
}

export function approveSampleTech(id: number, remark?: string) {
  return client.put(`/erp/tech/approve/${id}`, remark ? { remark } : undefined)
}

export function rejectSampleTech(id: number, remark?: string) {
  return client.put(`/erp/tech/reject/${id}`, { remark: remark || '' })
}

export function assignSampleTech(
  id: number,
  data: {
    pattenMarker: number
    pattenChecker?: number
    remark?: string
  },
) {
  return client.put(`/erp/tech/assign/${id}`, data)
}

export function acceptSampleTech(id: number) {
  return client.put(`/erp/tech/accept/${id}`)
}

export function startSampleTech(id: number) {
  return client.put(`/erp/tech/start/${id}`)
}
