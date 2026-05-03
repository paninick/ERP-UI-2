import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as defectApi from '@/api/defect';
import * as jobProcessApi from '@/api/produceJobProcess';
import * as qualityApi from '@/api/quality';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import FirstPieceCard from '@/pages/quality/inspection/FirstPieceCard';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildApprovalLog } from '@/utils/approval';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel } from '@/utils/companyContext';

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

interface InspectionRecord {
  id: number;
  status?: string;
  result?: string;
  batchNo?: string;
  jobProcessId?: number;
  rejectReason?: string;
}

export default function QualityInspectionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId') || '';
  const initialJobNo = searchParams.get('jobNo') || '';
  const initialCustomerName = searchParams.get('customerName') || '';

  const user = useAuthStore((state) => state.user);
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const processStatus = useDictOptions('erp_process_status');
  const defectCategory = useDictOptions('erp_defect_category');
  const defectLevel = useDictOptions('erp_defect_level');

  const [data, setData] = useState<JobProcessRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({
    processStatus: recordId ? '' : 'WAIT_CHECK',
    jobNo: initialJobNo,
    customerName: initialCustomerName,
  });
  const [selectedRecord, setSelectedRecord] = useState<JobProcessRecord | null>(null);
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectionBookingNo, setInspectionBookingNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoOpenedRecordId, setAutoOpenedRecordId] = useState('');
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [inspectionRecord, setInspectionRecord] = useState<InspectionRecord | null>(null);

  const inspectorName = useMemo(
    () => user?.nickname || user?.username || t('page.qualityInspection.inspectorFallback'),
    [t, user],
  );
  const chainHintVisible = Boolean(initialJobNo || recordId);

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
      setAccessDenied(false);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, queryParams, companySignature]);

  useEffect(() => {
    setData([]);
    setSelectedRecord(null);
    setDefects([]);
    setApprovalLogs([]);
    setInspectionRecord(null);
    setAutoOpenedRecordId('');
    setAccessDenied(false);
    fetchData();
  }, [fetchData, companySignature]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    const nextParams = {
      processStatus: recordId ? '' : 'WAIT_CHECK',
      jobNo: '',
      customerName: '',
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
      const inspectionRes = await qualityApi.ensureQualityByJobProcess(record.id).catch(() => null);
      setInspectionRecord(unwrapAjaxResultData<InspectionRecord>(inspectionRes));
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
      setInspectionRecord(null);
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
      toast.warning(t('page.qualityInspection.inspectionBooking.enterBookingNo'));
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
        actionRemark: `${t('page.qualityInspection.inspectionBooking.bookingButton')}: ${bookingNo}`,
      }));
      toast.success(t('page.qualityInspection.inspectionBooking.bookingSuccess'));
      await refreshDialogData(record);
    } catch (error: any) {
      toast.error(error.message || t('page.qualityInspection.inspectionBooking.bookingFail'));
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
      const nextRecord = unwrapAjaxResultData<JobProcessRecord>(detail);
      if (!mounted || !nextRecord) {
        if (mounted) {
          setSelectedRecord(null);
          setInspectionRecord(null);
          setDefects([]);
          setApprovalLogs([]);
          setRejectReason('');
          setInspectionBookingNo('');
          setAccessDenied(true);
        }
        return;
      }
      setAutoOpenedRecordId(recordId);
      setAccessDenied(false);
      handleViewDetail(nextRecord);
    }

    loadRecord();
    return () => {
      mounted = false;
    };
  }, [autoOpenedRecordId, data, handleViewDetail, recordId, companySignature]);

  const handleInspect = async (result: 'PASS' | 'FAIL') => {
    if (!selectedRecord) {
      return;
    }
    if (!inspectionRecord?.id) {
      toast.warning('当前待检工序尚未生成有效质检单，请刷新后重试');
      return;
    }
    if (result === 'FAIL' && !rejectReason.trim()) {
      toast.warning(t('page.qualityInspection.toasts.rejectReasonRequired'));
      return;
    }

    setSubmitting(true);
    try {
      if (result === 'PASS') {
        await qualityApi.passQuality(inspectionRecord.id);
      } else {
        await qualityApi.rejectQuality(inspectionRecord.id, { reason: rejectReason.trim() });
      }
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'QUALITY_INSPECTION',
        businessId: inspectionRecord.id,
        businessNo: selectedRecord.jobNo || String(selectedRecord.jobId || ''),
        nodeCode: 'QUALITY_RELEASE',
        actionType: result === 'PASS' ? 'APPROVE' : 'REJECT',
        fromStatus: String(selectedRecord.processStatus || ''),
        toStatus: result,
        actionBy: inspectorName,
        actionRemark: result === 'FAIL' ? rejectReason.trim() : t('page.qualityInspection.inspectionBooking.passRemark'),
      })).catch(() => null);
      toast.success(
        result === 'PASS'
          ? t('page.qualityInspection.toasts.passSuccess')
          : t('page.qualityInspection.toasts.rejectSuccess'),
      );
      setSelectedRecord(null);
      setInspectionRecord(null);
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

  const hasInspectionFilters = Boolean(queryParams.jobNo || queryParams.customerName || queryParams.processStatus);
  const inspectionEmptyAction = (
    <div className="mx-auto max-w-3xl rounded-[28px] border border-emerald-100 bg-[linear-gradient(145deg,#f7fff9_0%,#eefbf4_48%,#f8fafc_100%)] p-5 text-left shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
      <div className="flex flex-wrap items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
          <ShieldCheck size={18} />
        </div>
        <div className="min-w-[220px] flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {hasInspectionFilters ? '当前筛选下还没有进入质检放行的工序' : `${getCompanyLabel(currentCompany.code, t)} 当前没有待检工序`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {hasInspectionFilters
              ? '这通常说明该工票还没完成上道报工，或者工序状态尚未推进到待检 / 待放行，所以质检闸门当前还不会生成待办。'
              : '质检页不是独立产生日志，它只承接已经完成报工、等待放行判断的工序。如果这里为空，说明产线还没有把工票推进到待检节点。'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <NavLink
          to={initialCustomerName ? `/production/job-process?customerName=${encodeURIComponent(initialCustomerName)}` : '/production/job-process'}
          className="group rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 transition hover:border-emerald-300 hover:bg-white"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Eye size={16} className="text-emerald-600" />
            回看工序执行
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            先确认这张工票是否还停在待生产、是否已经报工，以及当前工序有没有推进到待检。
          </p>
          <div className="mt-3 flex justify-end text-emerald-700">
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </div>
        </NavLink>
        <NavLink
          to="/production/report-log"
          className="group rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 transition hover:border-sky-300 hover:bg-white"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle size={16} className="text-sky-600" />
            查看报工日志
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            如果报工日志还为空，就说明问题在上游执行尚未发生，而不是质检页漏数据。
          </p>
          <div className="mt-3 flex justify-end text-sky-700">
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <div>
      <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">质量放行闸门</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.qualityInspection.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              质检检验不是单纯统计页，而是生产执行链里的放行闸门。工序报工后，是否 PASS、是否 FAIL、是否返工、是否需要预约检品公司，都应在这里形成明确判断，再决定能不能继续流向下道工序或出货放行。
            </p>
            {initialCustomerName ? (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                当前客户：{initialCustomerName}，当前公司：{getCompanyLabel(currentCompany.code, t)}
              </div>
            ) : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: '它是什么', value: '放行 / 驳回 / 返工关口' },
                { icon: AlertTriangle, label: '核心动作', value: 'PASS / FAIL / 缺陷记录 / 预约' },
                { icon: CheckCircle, label: '上游来源', value: '工序报工 / 现场执行结果' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: initialCustomerName ? `/production/job-process?customerName=${encodeURIComponent(initialCustomerName)}` : '/production/job-process', title: '回看工序报工', detail: '质检判断应建立在工序执行结果之上，而不是脱离报工单独存在。' },
              { to: '/quality/inspection-booking', title: '继续看检品预约', detail: '需要第三方检品或后续放行时，再往预约和出货关口下钻。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-2xl font-bold text-slate-800">{t('page.qualityInspection.title')}</h2>
      <div className="mb-4 text-sm text-slate-500">
        {t('companyContext.currentLabel', { defaultValue: '当前公司' })}：{getCompanyLabel(currentCompany.code, t)}
      </div>
      {chainHintVisible && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t('page.qualityInspection.chainHint', { jobNo: initialJobNo || '-' })}
        </div>
      )}
      {accessDenied ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          {t('page.qualityInspection.deniedHint', { defaultValue: '当前工厂无权查看该质检记录，系统已清空其他工厂的详情。' })}
        </div>
      ) : null}

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
        <SearchField label={t('page.plan.form.customerName', { defaultValue: '客户名称' })}>
          <input
            aria-label={t('page.plan.form.customerName', { defaultValue: '客户名称' })}
            value={queryParams.customerName}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, customerName: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.plan.form.customerName', { defaultValue: '客户名称' })}
          />
        </SearchField>
      </SearchForm>

      <BaseTable
        columns={columns}
        data={data}
        loading={loading}
        rowKey="id"
        ariaLabel={t('page.qualityInspection.title')}
        emptyAction={inspectionEmptyAction}
      />
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
                <div><span className="text-slate-500">质检批次</span>{inspectionRecord?.batchNo || '-'}</div>
                <div><span className="text-slate-500">质检状态</span>{inspectionRecord?.status || 'ACTIVE'}</div>
              </div>

              <FirstPieceCard jobProcessId={selectedRecord.id} onChanged={() => handleViewDetail(selectedRecord)} />

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
                        {defect.handleType && <span>{t('page.qualityInspection.defectHandle')} {defect.handleType}</span>}
                        {defect.responsibility && <span>{t('page.qualityInspection.defectResponsibility')} {defect.responsibility}</span>}
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
                <p className="mb-2 text-sm font-semibold text-slate-800">{t('page.qualityInspection.inspectionBooking.sectionTitle')}</p>
                <div className="flex gap-2">
                  <input
                    aria-label={t('page.qualityInspection.inspectionBooking.bookingButton')}
                    value={inspectionBookingNo}
                    onChange={(event) => setInspectionBookingNo(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    placeholder={t('page.qualityInspection.inspectionBooking.placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectionBooking(selectedRecord)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {t('page.qualityInspection.inspectionBooking.bookingButton')}
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

              <ApprovalTimeline title={t('page.qualityInspection.approvalLog')} logs={approvalLogs} />
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
