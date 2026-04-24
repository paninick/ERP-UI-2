import client from './client';

export function listStyleProgress(params: any) {
  return client.get('/erp/styleProgress/list', { params });
}

export function getStyleProgress(styleCode: string) {
  return client.get(`/erp/styleProgress/${styleCode}`);
}
