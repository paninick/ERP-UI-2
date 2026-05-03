import client from './client';

export function listNotice(params: any) {
  return client.get('/erp/notice/list', { params });
}

export function getNotice(id: number) {
  return client.get(`/erp/notice/${id}`);
}

export function addNotice(data: any) {
  return client.post('/erp/notice', data);
}

export function updateNotice(data: any) {
  return client.put('/erp/notice', data);
}

export function delNotice(ids: string) {
  return client.delete(`/erp/notice/${ids}`);
}

export function createTechFromNotice(noticeId: number) {
  return client.post(`/erp/tech/createFromNotice/${noticeId}`);
}

export function listNoticeFiles(params: any) {
  return client.get('/erp/notice/file/list', { params });
}

export function addNoticeFile(data: any) {
  return client.post('/erp/notice/file', data);
}

export function updateNoticeFile(data: any) {
  return client.put('/erp/notice/file', data);
}

export function delNoticeFile(ids: string) {
  return client.delete(`/erp/notice/file/${ids}`);
}

export function uploadCommonFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
