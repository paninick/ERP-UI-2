import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Eye, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as defectApi from '@/api/defect';
import * as jobProcessApi from '@/api/produceJobProcess';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildApprovalLog } from '@/utils/approval';

interface JobProcessRecord {
  id: number;
  jobId?: number;
  jobNo?: string;
  processId?: number;
  processName?: string;
  processSeq?: number;
  processStatus?: string;
  employeeName?: string;
  inQty?: number;
  outQty?: number;
  defectQty?: number;
  lossQty?: number;
  lossExceed?: string;
  rejectReason?: string;
}

interface DefectRecord {
  defectCategory?: string;
  defectLevel?: string;
  defectQty?: number;
  handleType?: string;
  responsibility?: string;
  isBrokenNeedle?: string;
  remark?: string;
}

export default function QualityInspectionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId') || '';
  const initialJobNo = searchParams.get('jobNo') || '';

  const user = useAuthStore((state) => state.user);
  const processStatus = useDictOptions('erp_process_status');
  const defectCategory = useDictOptions('erp_defect_category');
  const defectLevel = useDictOptions('erp_defect_level');

  const [data, setData] = useState<JobProcessRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({
    processStatus: recordId ? '' : 'WAIT_CHECK',
    jobNo: initialJobNo,
  });
  const [selectedRecord, setSelectedRecord] = useState<JobProcessRecord | null>(null);
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectionBookingNo, setInspectionBookingNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoOpenedRecordId, setAutoOpenedRecordId] = useState('');
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);

  const inspectorName = useMemo(
    () => user?.nickname || user?.username || t('page.qualityInspection.inspectorFallback'),
    [t, user],
  );

  const fetchData = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    try {
      const response: any = await jobProcessApi.listProduceJobProcess({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...queryParams,
        ...params,
      });
      setData(response.rows || []);
      setPagination((prev) => ({ ...prev, total: response.total || 0 }));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    const nextParams = {
      processStatus: recordId ? '' : 'WAIT_CHECK',
      jobNo: '',
    };
    setQueryParams(nextParams);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1, ...nextParams });
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageNum, pageSize }));
    fetchData({ pageNum, pageSize });
  };

  const handleViewDetail = useCallback(async (record: JobProcessRecord) => {
    setSelectedRecord(record);
    setRejectReason(record.rejectReason || '');
    setInspectionBookingNo('');
    try {
      const response = await defectApi.listDefect({
        jobId: record.jobId,
        processId: record.processId,
      });
      setDefects((response as any).rows || []);
      const approvalRes: any = await approvalApi.listApprovalLog({
        businessType: 'QUALITY_INSPECTION',
        businessId: record.id,
        pageNum: 1,
        pageSize: 50,
      }).catch(() => null);
      setApprovalLogs(approvalRes?.rows || []);
    } catch {
      setDefects([]);
      setApprovalLogs([]);
    }
  }, []);

  const refreshDialogData = async (record: JobProcessRecord) => {
    await handleViewDetail(record);
    await fetchData();
  };

  const handleInspectionBooking = async (record: JobProcessRecord) => {
    const bookingNo = inspectionBookingNo.trim();
    if (!bookingNo) {
      toast.warning('请输入检品预约号');
      return;
    }

    try {
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'QUALITY_INSPECTION',
        businessId: record.id,
        businessNo: record.jobNo || String(record.jobId || ''),
        nodeCode: 'INSPECTION_RELEASE',
        actionType: 'SUBMIT',
        fromStatus: String(record.processStatus || ''),
        toStatus: 'BOOKED',
        actionBy: inspectorName,
        actionRemark: `检品预约号: ${bookingNo}`,
      }));
      toast.success('检品预约已记录');
      await refreshDialogData(record);
    } catch (error: any) {
      toast.error(error.message || '检品预约记录失败');
    }
  };

  const handleInspectionResult = async (result: 'PASS' | 'FAIL') => {
    if (!selectedRecord) {
      return;
    }
    if (result === 'FAIL' && !rejectReason.trim()) {
      toast.warning('检品不通过时请填写原因');
      return;
    }

    setSubmitting(true);
    try {
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'QUALITY_INSPECTION',
        businessId: selectedRecord.id,
        businessNo: selectedRecord.jobNo || String(selectedRecord.jobId || ''),
        nodeCode: 'INSPECTION_RELEASE',
        actionType: result === 'PASS' ? 'APPROVE' : 'REJECT',
        fromStatus: String(selectedRecord.processStatus || ''),
        toStatus: result === 'PASS' ? 'INSPECT_PASS' : 'INSPECT_FAIL',
        actionBy: inspectorName,
        actionRemark: result === 'PASS' ? '第三方检品通过' : rejectReason.trim(),
      }));
      toast.success(result === 'PASS' ? '检品通过已记录' : '检品不通过已记录');
      await refreshDialogData(selectedRecord);
    } catch (error: any) {
      toast.error(error.message || '检品结果记录失败');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!recordId || autoOpenedRecordId === recordId) {
      return;
    }

    const matchedRecord = data.find((item) => String(item.id) === recordId);
    if (matchedRecord) {
      setAutoOpenedRecordId(recordId);
      handleViewDetail(matchedRecord);
      return;
    }

    let mounted = true;

    async function loadRecord() {
      const detail = await jobProcessApi.getProduceJobProcess(Number(recordId)).catch(() => null);
      const nextRecord: JobProcessRecord | null = (detail as any)?.data || detail || null;
      if (!mounted || !nextRecord) {
        return;
      }
      setAutoOpenedRecordId(recordId);
      handleViewDetail(nextRecord);
    }

    loadRecord();
    return () => {
      mounted = false;
    };
  }, [autoOpenedRecordId, data, handleViewDetail, recordId]);

  const handleInspect = async (result: 'PASS' | 'FAIL') => {
    if (!selectedRecord) {
      return;
    }
    if (result === 'FAIL' && !rejectReason.trim()) {
      toast.warning(t('page.qualityInspection.toasts.rejectReasonRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await jobProcessApi.updateProduceJobProcess({
        id: selectedRecord.id,
        processStatus: result,
        releaseBy: inspectorName,
        rejectReason: result === 'FAIL' ? rejectReason.trim() : undefined,
      });
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'QUALITY_INSPECTION',
        businessId: selectedRecord.id,
        businessNo: selectedRecord.jobNo || String(selectedRecord.jobId || ''),
        nodeCode: 'QUALITY_RELEASE',
        actionType: result === 'PASS' ? 'APPROVE' : 'REJECT',
        fromStatus: String(selectedRecord.processStatus || ''),
        toStatus: result,
        actionBy: inspectorName,
        actionRemark: result === 'FAIL' ? rejectReason.trim() : '品质放行',
      })).catch(() => null);
      toast.success(
        result === 'PASS'
          ? t('page.qualityInspection.toasts.passSuccess')
          : t('page.qualityInspection.toasts.rejectSuccess'),
      );
      setSelectedRecord(null);
      setDefects([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || t('page.qualityInspection.toasts.actionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'jobId', title: t('page.qualityInspection.table.jobId'), width: '80px' },
    { key: 'processName', title: t('page.qualityInspection.table.process'), render: (value: string) => value || '-' },
    { key: 'processSeq', title: t('page.qualityInspection.table.seq'), width: '60px' },
    { key: 'employeeName', title: t('page.qualityInspection.table.employee'), render: (value: string) => value || '-' },
    { key: 'inQty', title: t('page.qualityInspection.table.inQty'), width: '80px' },
    { key: 'outQty', title: t('page.qualityInspection.table.outQty'), width: '80px' },
    {
      key: 'defectQty',
      title: t('page.qualityInspection.table.defectQty'),
      width: '80px',
      render: (value: number) => (
        <span className={value > 0 ? 'font-medium text-red-600' : 'text-slate-400'}>{value || 0}</span>
      ),
    },
    { key: 'lossQty', title: t('page.qualityInspection.table.lossQty'), width: '80px' },
    {
      key: 'lossExceed',
      title: t('page.qualityInspection.table.lossExceed'),
      width: '60px',
      render: (value: string) => (
        value === '1'
          ? <AlertTriangle size={14} className="text-red-500" />
          : <span className="text-slate-300">-</span>
      ),
    },
    {
      key: 'actions',
      title: t('page.qualityInspection.table.actions'),
      width: '180px',
      render: (_: unknown, record: JobProcessRecord) => (
        <div className="flex gap-1">
          <NavLink
            to={`/quality/inspection/print/${record.id}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t('page.qualityInspection.printCard')}
          </NavLink>
          <button
            onClick={() => handleViewDetail(record)}
            className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-100"
          >
            <Eye size={12} />
            {t('page.qualityInspection.reviewButton')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{t('page.qualityInspection.title')}</h2>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.qualityInspection.filters.processStatus')}>
          <select
            aria-label={t('page.qualityInspection.filters.processStatus')}
            value={queryParams.processStatus}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, processStatus: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t('common.all')}</option>
            {processStatus.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </SearchField>
        <SearchField label={t('page.qualityInspection.filters.jobNo')}>
          <input
            aria-label={t('page.qualityInspection.filters.jobNo')}
            value={queryParams.jobNo}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, jobNo: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.qualityInspection.filters.jobNoPlaceholder')}
          />
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} rowKey="id" />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />

      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">{t('page.qualityInspection.dialogTitle')}</h3>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">{t('page.qualityInspection.labels.jobId')}</span>{selectedRecord.jobId}</div>
                <div><span className="text-slate-500">{t('page.qualityInspection.labels.process')}</span>{selectedRecord.processName || `#${selectedRecord.processSeq}`}</div>
                <div><span className="text-slate-500">{t('page.qualityInspection.labels.employee')}</span>{selectedRecord.employeeName || '-'}</div>
                <div>
                  <span className="text-slate-500">{t('page.qualityInspection.labels.qtySummary')}</span>
                  {selectedRecord.inQty}/{selectedRecord.outQty}/{selectedRecord.defectQty}
                </div>
              </div>

              {defects.length > 0 && (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="mb-2 text-sm font-medium text-red-700">
                    {t('page.qualityInspection.defectCount', { count: defects.length })}
                  </p>
                  <div className="space-y-1">
                    {defects.map((defect, index) => (
                      <div key={index} className="flex flex-wrap gap-2 text-xs text-red-600">
                        <span>{defectCategory.labelMap[String(defect.defectCategory)] || defect.defectCategory}</span>
                        <span>{defectLevel.labelMap[String(defect.defectLevel)] || defect.defectLevel}</span>
                        <span>x{defect.defectQty}</span>
                        {defect.handleType && <span>处理: {defect.handleType}</span>}
                        {defect.responsibility && <span>责任: {defect.responsibility}</span>}
                        {defect.isBrokenNeedle === '1' && (
                          <span className="font-bold text-red-700">{t('page.qualityInspection.brokenNeedle')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.lossExceed === '1' && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <p className="text-sm text-amber-600">{t('page.qualityInspection.lossWarning')}</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">日单第三方检品</p>
                <div className="flex gap-2">
                  <input
                    aria-label="检品预约号"
                    value={inspectionBookingNo}
                    onChange={(event) => setInspectionBookingNo(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    placeholder="适用于日单第三方检品预约"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectionBooking(selectedRecord)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    预约
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInspectionResult('PASS')}
                    disabled={submitting}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    检品通过
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInspectionResult('FAIL')}
                    disabled={submitting}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  >
                    检品不通过
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">{t('page.qualityInspection.rejectReasonLabel')}</label>
                <textarea
                  aria-label={t('page.qualityInspection.rejectReasonLabel')}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  className="h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  placeholder={t('page.qualityInspection.rejectReasonPlaceholder')}
                />
              </div>

              <ApprovalTimeline title="质检 / 检品记录" logs={approvalLogs} />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleInspect('FAIL')}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle size={14} />
                {t('page.qualityInspection.reject')}
              </button>
              <button
                onClick={() => handleInspect('PASS')}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {t('page.qualityInspection.pass')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
