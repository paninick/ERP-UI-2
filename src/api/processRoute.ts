import client from './client';

export function listProcessRoute(params: any) {
  return client.get('/erp/processRoute/list', { params });
}

export function getProcessRoute(id: number) {
  return client.get(`/erp/processRoute/${id}`);
}

export function getProcessRouteItems(routeId: number) {
  return client.get(`/erp/processRoute/items/${routeId}`);
}

export function addProcessRoute(data: any) {
  return client.post('/erp/processRoute', { route: data, items: [] });
}

export function updateProcessRoute(data: any) {
  return client.put('/erp/processRoute', { route: data, items: [] });
}

export function delProcessRoute(ids: string) {
  return client.delete(`/erp/processRoute/${ids}`);
}
