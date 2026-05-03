import client from './client'

export function listProductSerial(params: any) {
  return client.get('/erp/productSerial/list', { params })
}

export function getProductSerialByScan(serialNo: string) {
  return client.get(`/erp/productSerial/scan/${serialNo}`)
}

export function listByJob(jobId: number) {
  return client.get(`/erp/productSerial/listByJob/${jobId}`)
}
