import * as noticeApi from './notice';
import client from './client';

export function getNoticeDetailLines(params: { noticeId: number; pageNum?: number; pageSize?: number }) {
  return client.get('/erp/notice/detail/list', {
    params: {
      pageNum: params.pageNum ?? 1,
      pageSize: params.pageSize ?? 200,
      noticeId: params.noticeId,
    },
  });
}

export function getNoticeMaterialLines(params: { noticeId: number; pageNum?: number; pageSize?: number }) {
  return client.get('/erp/sampleNotice/material/list', {
    params: {
      pageNum: params.pageNum ?? 1,
      pageSize: params.pageSize ?? 500,
      noticeId: params.noticeId,
    },
  });
}

export function getNoticeHistoryLines(params: {
  currentNoticeId?: number;
  noticeId?: number;
  pageNum?: number;
  pageSize?: number;
}) {
  return client.get('/erp/notice/his/list', {
    params: {
      pageNum: params.pageNum ?? 1,
      pageSize: params.pageSize ?? 200,
      ...(params.currentNoticeId != null ? { currentNoticeId: params.currentNoticeId } : {}),
      ...(params.noticeId != null ? { noticeId: params.noticeId } : {}),
    },
  });
}

export const getNotice = noticeApi.getNotice;
export const listNoticeFiles = noticeApi.listNoticeFiles;
