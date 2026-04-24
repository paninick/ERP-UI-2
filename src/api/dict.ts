import client from './client';

export function listDictType(params: any) {
  return client.get('/system/dict/type/list', {params});
}

export function getDictType(dictId: number) {
  return client.get(`/system/dict/type/${dictId}`);
}

export function addDictType(data: any) {
  return client.post('/system/dict/type', data);
}

export function updateDictType(data: any) {
  return client.put('/system/dict/type', data);
}

export function delDictType(dictIds: string) {
  return client.delete(`/system/dict/type/${dictIds}`);
}

export function refreshDictCache() {
  return client.delete('/system/dict/type/refreshCache');
}

export function listDictData(params: any) {
  return client.get('/system/dict/data/list', {params});
}

export function getDictData(dictCode: number) {
  return client.get(`/system/dict/data/${dictCode}`);
}

export function addDictData(data: any) {
  return client.post('/system/dict/data', data);
}

export function updateDictData(data: any) {
  return client.put('/system/dict/data', data);
}

export function delDictData(dictCodes: string) {
  return client.delete(`/system/dict/data/${dictCodes}`);
}
