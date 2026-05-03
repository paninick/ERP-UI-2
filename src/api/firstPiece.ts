import client from './client';

const BASE = '/erp/qc/firstPiece';

export function listFirstPiece(params: any) { return client.get(BASE + '/list', { params }); }
export function getFirstPiece(id: number) { return client.get(BASE + '/' + id); }
export function getFirstPieceByJobProcess(jobProcessId: number) { return client.get(BASE + '/byJobProcess/' + jobProcessId); }
export function triggerFirstPiece(data: { jobProcessId: number; productFamily?: string; triggerReason?: string }) { return client.post(BASE + '/trigger', data); }
export function approveFirstPieceStage(data: { id: number; stage: string; status: string; remark?: string }) { return client.post(BASE + '/approve', data); }
export function isFirstPieceBlocked(jobProcessId: number) { return client.get(BASE + '/blocked/' + jobProcessId); }
export function delFirstPiece(id: number) { return client.delete(BASE + '/' + id); }
