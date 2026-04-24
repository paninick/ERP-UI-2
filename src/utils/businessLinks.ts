type QueryValue = string | number | null | undefined;

function getBrowserOrigin() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return '';
}

export function buildAppLink(path: string, query?: Record<string, QueryValue>) {
  const origin = getBrowserOrigin() || 'http://localhost';
  const url = new URL(path, origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return getBrowserOrigin() ? url.toString() : `${url.pathname}${url.search}`;
}

export function buildSalesOrderDetailLink(id: string | number) {
  return buildAppLink(`/sales/order/${id}`);
}

export function buildSalesOrderPrintLink(id: string | number) {
  return buildAppLink(`/sales/order/print/${id}`);
}

export function buildProducePlanPrintLink(id: string | number) {
  return buildAppLink(`/production/plan/print/${id}`);
}

export function buildProduceJobPrintLink(id: string | number) {
  return buildAppLink(`/production/job/print/${id}`);
}

export function buildProduceJobReportLink(jobId: string | number, processId?: string | number | null) {
  return buildAppLink(`/production/job-process/report/${jobId}`, { processId });
}

export function buildQualityInspectionLink(recordId: string | number) {
  return buildAppLink('/quality/inspection', { recordId });
}

export function buildQualityInspectionPrintLink(id: string | number) {
  return buildAppLink(`/quality/inspection/print/${id}`);
}
