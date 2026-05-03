import client from './client'

export function listCorpContacts(params: any) {
  return client.get('/erp/contacts/list', { params })
}

export function getCorpContacts(id: number) {
  return client.get(`/erp/contacts/${id}`)
}

export function addCorpContacts(data: any) {
  return client.post('/erp/contacts', data)
}

export function updateCorpContacts(data: any) {
  return client.put('/erp/contacts', data)
}

export function delCorpContacts(ids: string) {
  return client.delete(`/erp/contacts/${ids}`)
}
