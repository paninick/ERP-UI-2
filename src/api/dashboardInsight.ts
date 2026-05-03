import client from './client'

export function getDashboardInsightOverview(period?: string) {
  return client.get('/erp/dashboard/insight/overview', {
    params: period ? { period } : undefined,
  })
}

export function listSupplierRatings(windowMonths?: number) {
  return client.get('/erp/dashboard/insight/supplierRatings', {
    params: windowMonths ? { windowMonths } : undefined,
  })
}
