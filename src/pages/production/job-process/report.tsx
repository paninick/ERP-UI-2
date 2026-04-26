import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronRight, Save, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as defectApi from '@/api/defect';
import * as employeeApi from '@/api/employee';
import * as materialConsumeApi from '@/api/produceMaterialConsume';
import * as jobProcessApi from '@/api/produceJobProcess';
import * as reportLogApi from '@/api/produceReportLog';
import * as processDefApi from '@/api/processDef';
import * as jobApi from '@/api/production';
import { toast } from '@/components/ui/Toast';
import DefectForm from './DefectForm';
import ProcessFlow from './ProcessFlow';

interface ReportFormState {
  employeeId: string;
  employeeName: string;
  inQty: string;
  outQty: string;
  defectQty: string;
  lossQty: string;
  remark: string;
}

interface DefectItem {
  defectCategory: string;
  defectLevel: string;
  defectQty: string;
  handleType: string;
  responsibility: string;
  isBrokenNeedle: boolean;
  remark: string;
}

const EMPTY_FORM: ReportFormState = {
  employeeId: '',
  employeeName: '',
  inQty: '',
  outQty: '',
  defectQty: '',
  lossQty: '',
  remark: '',
};

function toNumber(value: string) {
  return Number(value) || 0;
}

interface ProduceJob {
  jobNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  producePlanId?: number;
}

interface ProcessStep {
  id: number;
  processId: number;
  processSeq: number;
  processName?: string;
  processStatus?: string;
  isOutsource?: string;
  outQty?: number;
}

interface ProcessDefOption {
  id: number;
  processCode?: string;
  processName?: string;
  needQualityCheck?: number;
  enableOutsource?: number;
}

interface EmployeeOption {
  id: number;
  employeeName: string;
  department?: string;
}

interface MaterialConsumeItem {
  id: number;
  jobId?: number;
  jobProcessId?: number;
  reportLogId?: number;
  materialCode?: string;
  materialName?: string;
  materialType?: string;
  actualQty?: number;
  actualLossQty?: number;
  actualCost?: number;
  theoreticalCost?: number;
  costDiff?: number;
  isOverLimit?: string;
  approvalStatus?: string;
  batchNo?: string;
  unit?: string;
}

function isReportableProcess(process: ProcessStep) {
  return process?.processStatus === 'PENDING' || process?.processStatus === 'RUNNING';
}

function normalizeProcessRows(response: any): ProcessStep[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function ProcessReportPage() {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProcessId = searchParams.get('processId');

  const [job, setJob] = useState<ProduceJob | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [currentProcess, setCurrentProcess] = useState<ProcessStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [form, setForm] = useState<ReportFormState>(EMPTY_FORM);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [processes, setProcesses] = useState<ProcessStep[]>([]);
  const [processDefs, setProcessDefs] = useState<ProcessDefOption[]>([]);
  const [materialConsumes, setMaterialConsumes] = useState<MaterialConsumeItem[]>([]);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [bindingConsumeId, setBindingConsumeId] = useState<number | null>(null);
  const [customAction, setCustomAction] = useState({
    processId: '',
    processSeq: '',
    reason: '',
    isOutsource: '0',
  });

  const inQtyNum = useMemo(() => toNumber(form.inQty), [form.inQty]);
  const outQtyNum = useMemo(() => toNumber(form.outQty), [form.outQty]);
  const lossQtyNum = useMemo(() => toNumber(form.lossQty), [form.lossQty]);
  const defectQtyNum = useMemo(
    () => Math.max(0, inQtyNum - outQtyNum - lossQtyNum),
    [inQtyNum, outQtyNum, lossQtyNum],
  );
  const lossRate = inQtyNum > 0 ? (lossQtyNum / inQtyNum) * 100 : 0;
  const isLossExceed = lossRate > 5;

  const defectSummary = useMemo(() => {
    const totalQty = defects.reduce((sum, item) => sum + toNumber(item.defectQty), 0);
    const hasInvalidLine = defects.some((item) => (
      !item.defectCategory ||
      !item.defectLevel ||
      !item.handleType ||
      !item.responsibility ||
      toNumber(item.defectQty) <= 0
    ));

    return {
      totalQty,
      hasInvalidLine,
      matchesFormQty: totalQty === defectQtyNum,
    };
  }, [defectQtyNum, defects]);

  const processContext = useMemo(() => {
    if (!currentProcess || processes.length === 0) {
      return {
        previousProcess: null,
        nextProcess: null,
      };
    }

    const currentIndex = processes.findIndex((item) => item.id === currentProcess.id);
    return {
      previousProcess: currentIndex > 0 ? processes[currentIndex - 1] : null,
      nextProcess: currentIndex >= 0 ? processes[currentIndex + 1] || null : null,
    };
  }, [currentProcess, processes]);

  const suggestedLossQty = useMemo(() => {
    if (inQtyNum <= 0 || outQtyNum <= 0) {
      return 0;
    }
    return Math.max(0, inQtyNum - outQtyNum - defectQtyNum);
  }, [defectQtyNum, inQtyNum, outQtyNum]);

  const materialSummary = useMemo(() => {
    return materialConsumes.reduce(
      (acc, item) => {
        acc.totalQty += Number(item.actualQty || 0);
        acc.totalActualCost += Number(item.actualCost || 0);
        acc.totalTheoreticalCost += Number(item.theoreticalCost || 0);
        acc.totalCostDiff += Number(item.costDiff || 0);
        acc.totalActualLoss += Number(item.actualLossQty || 0);
        if (item.isOverLimit === '1') {
          acc.overLimitCount += 1;
        }
        if (item.approvalStatus === '1') {
          acc.pendingApprovalCount += 1;
        }
        return acc;
      },
      {
        totalQty: 0,
        totalActualCost: 0,
        totalTheoreticalCost: 0,
        totalCostDiff: 0,
        totalActualLoss: 0,
        overLimitCount: 0,
        pendingApprovalCount: 0,
      },
    );
  }, [materialConsumes]);

  const pendingMaterialConsumes = useMemo(
    () => materialConsumes.filter((item) => !item.jobProcessId),
    [materialConsumes],
  );

  const formatAmount = (value: number) => value.toFixed(2);

  useEffect(() => {
    setForm((prev) => ({ ...prev, defectQty: String(defectQtyNum) }));
  }, [defectQtyNum]);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const numericJobId = Number(jobId);

    async function loadPage() {
      setLoading(true);
      try {
        const [jobRes, processRes, employeeRes] = await Promise.all([
          jobApi.getProduceJob(numericJobId).catch(() => null),
          jobProcessApi.listByJob(numericJobId).catch(() => null),
          employeeApi.listEmployee({ pageNum: 1, pageSize: 999, status: '0' }).catch(() => null),
        ]);

        setJob(jobRes?.data || jobRes || null);
        setEmployees(employeeRes?.rows || []);

        const rows = normalizeProcessRows(processRes);
        const sorted = [...rows].sort((a, b) => a.processSeq - b.processSeq);
        setProcesses(sorted);

        const scannedProcess = targetProcessId
          ? sorted.find((item) => String(item.id) === targetProcessId)
          : null;
        const nextProcess = (scannedProcess && isReportableProcess(scannedProcess))
          ? scannedProcess
          : sorted.find((item) => isReportableProcess(item)) || null;

        setCurrentProcess(nextProcess);

        if (nextProcess) {
          const currentIndex = sorted.findIndex((item) => item.id === nextProcess.id);
          const previousProcess = currentIndex > 0 ? sorted[currentIndex - 1] : null;
          setForm((prev) => ({
            ...EMPTY_FORM,
            employeeId: prev.employeeId,
            employeeName: prev.employeeName,
            inQty: previousProcess?.outQty ? String(previousProcess.outQty) : '',
          }));
        }
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [jobId, targetProcessId]);

  useEffect(() => {
    processDefApi.listProcessDef({ pageNum: 1, pageSize: 999, status: '0' })
      .then((res: any) => {
        const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res?.data) ? res.data : [];
        setProcessDefs(rows);
      })
      .catch(() => setProcessDefs([]));
  }, []);

  useEffect(() => {
    if (!jobId) {
      setMaterialConsumes([]);
      return;
    }

    const baseParams: Record<string, any> = {
      pageNum: 1,
      pageSize: 200,
      jobId: Number(jobId),
    };
    const processParams = currentProcess?.id
      ? { ...baseParams, jobProcessId: currentProcess.id }
      : baseParams;

    setMaterialLoading(true);
    Promise.all([
      materialConsumeApi.listProduceMaterialConsume(processParams),
      materialConsumeApi.listProduceMaterialConsume(baseParams),
    ])
      .then(([currentRes, allRes]: any) => {
        const currentRows = Array.isArray(currentRes?.rows) ? currentRes.rows : Array.isArray(currentRes?.data) ? currentRes.data : [];
        const allRows = Array.isArray(allRes?.rows) ? allRes.rows : Array.isArray(allRes?.data) ? allRes.data : [];
        const merged = [...currentRows];
        allRows.forEach((item: MaterialConsumeItem) => {
          if (!merged.some((existing) => existing.id === item.id) && !item.jobProcessId) {
            merged.push(item);
          }
        });
        setMaterialConsumes(merged);
      })
      .catch(() => setMaterialConsumes([]))
      .finally(() => setMaterialLoading(false));
  }, [currentProcess?.id, jobId]);

  const reloadProcessState = async (nextInQty?: number) => {
    const numericJobId = Number(jobId);
    const processRes = await jobProcessApi.listByJob(numericJobId);
    const rows = normalizeProcessRows(processRes);
    const sorted = [...rows].sort((a, b) => a.processSeq - b.processSeq);
    setProcesses(sorted);
    const nextProcess = sorted.find((item) => isReportableProcess(item)) || null;
    setCurrentProcess(nextProcess);
    setDefects([]);
    setForm({
      ...EMPTY_FORM,
      inQty: nextInQty ? String(nextInQty) : '',
    });
    return nextProcess;
  };

  const reloadMaterialConsumes = async () => {
    if (!jobId) {
      setMaterialConsumes([]);
      return;
    }
    const baseParams: Record<string, any> = {
      pageNum: 1,
      pageSize: 200,
      jobId: Number(jobId),
    };
    const processParams = currentProcess?.id
      ? { ...baseParams, jobProcessId: currentProcess.id }
      : baseParams;

    setMaterialLoading(true);
    try {
      const [currentRes, allRes]: any = await Promise.all([
        materialConsumeApi.listProduceMaterialConsume(processParams),
        materialConsumeApi.listProduceMaterialConsume(baseParams),
      ]);
      const currentRows = Array.isArray(currentRes?.rows) ? currentRes.rows : Array.isArray(currentRes?.data) ? currentRes.data : [];
      const allRows = Array.isArray(allRes?.rows) ? allRes.rows : Array.isArray(allRes?.data) ? allRes.data : [];
      const merged = [...currentRows];
      allRows.forEach((item: MaterialConsumeItem) => {
        if (!merged.some((existing) => existing.id === item.id) && !item.jobProcessId) {
          merged.push(item);
        }
      });
      setMaterialConsumes(merged);
    } catch {
      setMaterialConsumes([]);
    } finally {
      setMaterialLoading(false);
    }
  };

  const resetCustomAction = () => {
    setCustomAction({
      processId: '',
      processSeq: '',
      reason: '',
      isOutsource: '0',
    });
  };

  const handleInsertCustomProcess = async () => {
    if (!jobId) return;
    if (!customAction.processId) {
      toast.warning('请选择要插入的工序');
      return;
    }
    if (!customAction.reason.trim()) {
      toast.warning('请填写插入原因，便于追溯');
      return;
    }

    const selected = processDefs.find((item) => String(item.id) === customAction.processId);
    const insertSeq = customAction.processSeq
      ? Number(customAction.processSeq)
      : currentProcess
        ? currentProcess.processSeq
        : undefined;

    try {
      await jobProcessApi.insertCustomProcess({
        jobId: Number(jobId),
        processId: Number(customAction.processId),
        processSeq: insertSeq,
        isOutsource: customAction.isOutsource,
        qcRequired: selected?.needQualityCheck === 1 ? '1' : '0',
        insertReason: customAction.reason,
        remark: customAction.reason,
      });
      toast.success('已插入临时工序');
      resetCustomAction();
      await reloadProcessState();
    } catch (error: any) {
      toast.error(error.message || '插入临时工序失败');
    }
  };

  const handleSkipCurrentProcess = async () => {
    if (!currentProcess) {
      toast.warning('当前没有可跳过的工序');
      return;
    }
    if (!customAction.reason.trim()) {
      toast.warning('请填写跳过原因');
      return;
    }

    try {
      await jobProcessApi.skipProcess({
        id: currentProcess.id,
        skipReason: customAction.reason,
        remark: customAction.reason,
      });
      toast.success('当前工序已跳过');
      resetCustomAction();
      await reloadProcessState();
    } catch (error: any) {
      toast.error(error.message || '跳过工序失败');
    }
  };

  const handleInsertReworkProcess = async () => {
    if (!jobId || !currentProcess) {
      toast.warning('当前没有返修来源工序');
      return;
    }
    if (!customAction.processId) {
      toast.warning('请选择返修工序');
      return;
    }
    if (!customAction.reason.trim()) {
      toast.warning('请填写返修原因');
      return;
    }

    const selected = processDefs.find((item) => String(item.id) === customAction.processId);

    try {
      await jobProcessApi.insertReworkProcess({
        jobId: Number(jobId),
        processId: Number(customAction.processId),
        processSeq: currentProcess.processSeq + 1,
        isOutsource: customAction.isOutsource,
        qcRequired: selected?.needQualityCheck === 1 ? '1' : '0',
        reworkSourceProcessId: currentProcess.id,
        insertReason: customAction.reason,
        remark: customAction.reason,
      });
      toast.success('已插入返修工序');
      resetCustomAction();
      await reloadProcessState();
    } catch (error: any) {
      toast.error(error.message || '插入返修工序失败');
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((item) => String(item.id) === employeeId);
    setForm((prev) => ({
      ...prev,
      employeeId,
      employeeName: employee?.employeeName || '',
    }));
  };

  const applyRecommendedValues = () => {
    const recommendedInQty = processContext.previousProcess?.outQty
      ? String(processContext.previousProcess.outQty)
      : job?.planQty
        ? String(job.planQty)
        : '';

    setForm((prev) => ({
      ...prev,
      inQty: prev.inQty || recommendedInQty,
      outQty: prev.outQty || recommendedInQty,
      lossQty: prev.lossQty || '0',
    }));
  };

  const validateBeforeSubmit = () => {
    if (!currentProcess) {
      toast.warning(t('page.jobProcessReport.toasts.noReportableProcess'));
      return false;
    }
    if (!form.employeeId) {
      toast.warning(t('page.jobProcessReport.toasts.selectEmployee'));
      return false;
    }
    if (inQtyNum <= 0) {
      toast.warning(t('page.jobProcessReport.toasts.inQtyRequired'));
      return false;
    }
    if (outQtyNum < 0) {
      toast.warning(t('page.jobProcessReport.toasts.outQtyInvalid'));
      return false;
    }
    if (lossQtyNum < 0) {
      toast.warning(t('page.jobProcessReport.toasts.lossQtyInvalid'));
      return false;
    }
    if (outQtyNum + lossQtyNum > inQtyNum) {
      toast.warning(t('page.jobProcessReport.toasts.sumExceeded'));
      return false;
    }
    if (defectQtyNum > 0 && defects.length === 0) {
      toast.warning(t('page.jobProcessReport.toasts.needDefects'));
      setShowDefectForm(true);
      return false;
    }
    if (defectQtyNum === 0 && defects.length > 0) {
      toast.warning(t('page.jobProcessReport.toasts.clearDefects'));
      return false;
    }
    if (defects.length > 0 && defectSummary.hasInvalidLine) {
      toast.warning(t('page.jobProcessReport.toasts.invalidDefects'));
      setShowDefectForm(true);
      return false;
    }
    if (defects.length > 0 && !defectSummary.matchesFormQty) {
      toast.warning(t('page.jobProcessReport.toasts.mismatchDefects'));
      setShowDefectForm(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!jobId || !validateBeforeSubmit()) {
      return;
    }

    setSubmitting(true);
    try {
      await reportLogApi.addProduceReportLog({
        jobProcessId: currentProcess.id,
        employeeId: Number(form.employeeId),
        employeeName: form.employeeName,
        operatorName: form.employeeName,
        reportQty: inQtyNum,
        completedQty: outQtyNum,
        defectQty: defectQtyNum,
        lossQty: lossQtyNum,
        reportType: currentProcess.isOutsource === '1' ? 'OUTSOURCE_RETURN' : 'WORKSHOP',
        reportSource: 'PAPER_BATCH',
        isOutsourced: currentProcess.isOutsource || '0',
        remark: form.remark || `IN:${inQtyNum}; LOSS_EXCEED:${isLossExceed ? '1' : '0'}`,
      });

      if (defects.length > 0) {
        await Promise.all(defects.map((defect) => defectApi.addDefect({
          jobId: Number(jobId),
          processId: currentProcess.processId,
          employeeId: Number(form.employeeId),
          defectQty: toNumber(defect.defectQty),
          defectCategory: defect.defectCategory,
          defectLevel: defect.defectLevel,
          handleType: defect.handleType,
          responsibility: defect.responsibility,
          isBrokenNeedle: defect.isBrokenNeedle ? '1' : '0',
          remark: defect.remark,
        })));
      }

      toast.success(t('page.jobProcessReport.submitSuccess'));
      const nextProcess = await reloadProcessState(outQtyNum);
      if (!nextProcess) {
        toast.success(t('page.jobProcessReport.allDone'));
      }
    } catch (error: any) {
      toast.error(error.message || t('page.jobProcessReport.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBindMaterialConsume = async (consumeId: number) => {
    if (!currentProcess) {
      toast.warning('当前没有可绑定的工序');
      return;
    }
    setBindingConsumeId(consumeId);
    try {
      await materialConsumeApi.bindProduceMaterialConsumeToJobProcess(consumeId, currentProcess.id);
      toast.success('已绑定到当前工序');
      await reloadMaterialConsumes();
    } catch (error: any) {
      toast.error(error?.message || '绑定用料失败');
    } finally {
      setBindingConsumeId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return <div className="py-12 text-center text-slate-400">{t('page.jobProcessReport.notFound')}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/production/job-process')}
          className="rounded-lg p-2 hover:bg-slate-100"
          aria-label={t('page.jobProcessReport.backAriaLabel')}
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('page.jobProcessReport.title')}</h2>
          <p className="text-sm text-slate-500">
            {t('page.jobProcessReport.summary', {
              jobNo: job.jobNo || '-',
              styleCode: job.styleCode || '-',
              colorCode: job.colorCode || '-',
              sizeCode: job.sizeCode || '-',
              planQty: job.planQty || 0,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {currentProcess ? (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Sparkles size={16} />
                      <span className="text-sm font-medium">{t('page.jobProcessReport.recommendationTitle')}</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">{t('page.jobProcessReport.previousInput')}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {processContext.previousProcess?.processName || t('page.jobProcessReport.firstProcess')}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {processContext.previousProcess?.outQty ?? job?.planQty ?? 0}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">{t('page.jobProcessReport.currentProcess')}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{currentProcess.processName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {currentProcess.isOutsource === '1'
                            ? t('page.jobProcessReport.outsourceHint')
                            : t('page.jobProcessReport.inhouseHint')}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-400">{t('page.jobProcessReport.nextReceiver')}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {processContext.nextProcess?.processName || t('page.jobProcessReport.finalStep')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t('page.jobProcessReport.submitTransferHint')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applyRecommendedValues}
                    className="inline-flex items-center gap-2 self-start rounded-2xl border border-indigo-200 bg-white px-4 py-2 text-sm text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Sparkles size={14} />
                    {t('page.jobProcessReport.applySuggestion')}
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-lg font-bold text-indigo-600">{currentProcess.processSeq}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {currentProcess.processName || t('page.jobProcessReport.processFallback', { seq: currentProcess.processSeq })}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentProcess.isOutsource === '1'
                      ? t('page.jobProcessReport.outsourceProcess')
                      : t('page.jobProcessReport.inhouseProcess')}
                    {' / '}
                    {t('page.jobProcessReport.processStatus')} {currentProcess.processStatus}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    <span className="mr-1 text-red-500">*</span>{t('page.jobProcessReport.fields.employee')}
                  </label>
                  <select
                    aria-label={t('page.jobProcessReport.fields.employee')}
                    value={form.employeeId}
                    onChange={(event) => handleEmployeeChange(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">{t('page.jobProcessReport.placeholders.employee')}</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.employeeName} ({employee.department || '-'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    <span className="mr-1 text-red-500">*</span>{t('page.jobProcessReport.fields.inQty')}
                  </label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      aria-label={t('page.jobProcessReport.fields.inQty')}
                      type="number"
                      min="0"
                      value={form.inQty}
                      onChange={(event) => setForm((prev) => ({ ...prev, inQty: event.target.value }))}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      placeholder={t('page.jobProcessReport.placeholders.inQty')}
                    />
                    {processContext.previousProcess?.outQty ? (
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {t('page.jobProcessReport.previousOutQty', { qty: processContext.previousProcess.outQty })}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    <span className="mr-1 text-red-500">*</span>{t('page.jobProcessReport.fields.outQty')}
                  </label>
                  <input
                    aria-label={t('page.jobProcessReport.fields.outQty')}
                    type="number"
                    min="0"
                    max={form.inQty || undefined}
                    value={form.outQty}
                    onChange={(event) => setForm((prev) => ({ ...prev, outQty: event.target.value }))}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    placeholder={t('page.jobProcessReport.placeholders.outQty')}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    {t('page.jobProcessReport.fields.lossQty')}
                  </label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      aria-label={t('page.jobProcessReport.fields.lossQty')}
                      type="number"
                      min="0"
                      value={form.lossQty}
                      onChange={(event) => setForm((prev) => ({ ...prev, lossQty: event.target.value }))}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      placeholder={t('page.jobProcessReport.placeholders.lossQty')}
                    />
                    {inQtyNum > 0 && (
                      <span className={`whitespace-nowrap text-xs font-medium ${isLossExceed ? 'text-red-500' : 'text-slate-400'}`}>
                        {lossRate.toFixed(1)}%
                        {isLossExceed && <AlertTriangle size={12} className="ml-1 inline" />}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    {t('page.jobProcessReport.fields.defectQty')}
                  </label>
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      aria-label={t('page.jobProcessReport.fields.defectQty')}
                      type="number"
                      value={form.defectQty}
                      readOnly
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                    />
                    {defectQtyNum > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowDefectForm(true)}
                        className="relative z-10 whitespace-nowrap rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                      >
                        {t('page.jobProcessReport.defectDetailButton', { count: defects.length })}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-20 shrink-0 text-right text-sm text-slate-600">
                    {t('page.jobProcessReport.fields.remark')}
                  </label>
                  <input
                    aria-label={t('page.jobProcessReport.fields.remark')}
                    value={form.remark}
                    onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    placeholder={t('page.jobProcessReport.placeholders.remark')}
                  />
                </div>
              </div>

              {defectQtyNum > 0 && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {t('page.jobProcessReport.defectSummary', {
                    total: defectSummary.totalQty,
                    expected: defectQtyNum,
                  })}
                  {!defectSummary.matchesFormQty && (
                    <span className="ml-2 text-red-500">{t('page.jobProcessReport.defectSummaryMismatch')}</span>
                  )}
                </div>
              )}

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">{t('page.jobProcessReport.passFlow')}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {t('page.jobProcessReport.passFlowHint', {
                      target: processContext.nextProcess?.processName || t('page.jobProcessReport.finishedStockIn'),
                    })}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{outQtyNum}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">{t('page.jobProcessReport.pendingDefect')}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{t('page.jobProcessReport.pendingDefectHint')}</p>
                  <p className={`mt-1 text-lg font-semibold ${defectQtyNum > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {defectQtyNum}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">{t('page.jobProcessReport.suggestedCheck')}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{t('page.jobProcessReport.suggestedCheckHint')}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{suggestedLossQty}</p>
                </div>
              </div>

              {isLossExceed && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertTriangle size={16} className="shrink-0 text-red-500" />
                  <p className="text-sm text-red-600">
                    {t('page.jobProcessReport.lossWarning', { rate: lossRate.toFixed(1) })}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  onClick={() => navigate('/production/job-process')}
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save size={14} />
                  {submitting ? t('page.jobProcessReport.submitting') : t('page.jobProcessReport.confirmReport')}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <ChevronRight size={24} className="text-emerald-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">{t('page.jobProcessReport.noProcessTitle')}</h3>
              <p className="mb-4 text-sm text-slate-500">{t('page.jobProcessReport.noProcessHint')}</p>
              <button
                onClick={() => navigate('/production/job-process')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                {t('common.back')}
              </button>
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-20 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-800">{t('page.jobProcess.flowTitle')}</h3>
            <ProcessFlow jobId={Number(jobId)} />

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-slate-800">执行用料与成本</h4>
                <p className="mt-1 text-xs text-slate-500">
                  当前聚合的是本工单{currentProcess ? ' / 当前工序' : ''}的执行用料记录，用于观察损耗、超领和成本偏差是否开始沉淀。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-400">实际领用数量</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatAmount(materialSummary.totalQty)}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-400">实际成本</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatAmount(materialSummary.totalActualCost)}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-400">理论成本</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatAmount(materialSummary.totalTheoreticalCost)}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-400">成本偏差</p>
                  <p className={`mt-1 text-lg font-semibold ${materialSummary.totalCostDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatAmount(materialSummary.totalCostDiff)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-xs text-slate-400">累计实际损耗</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{formatAmount(materialSummary.totalActualLoss)}</p>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-xs text-slate-400">超限记录</p>
                  <p className={`mt-1 text-base font-semibold ${materialSummary.overLimitCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {materialSummary.overLimitCount}
                  </p>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-xs text-slate-400">待审批</p>
                  <p className={`mt-1 text-base font-semibold ${materialSummary.pendingApprovalCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {materialSummary.pendingApprovalCount}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">最近用料明细</p>
                  {materialLoading ? <span className="text-xs text-slate-400">加载中...</span> : null}
                </div>
                {materialConsumes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    当前还没有关联到执行用料记录。下一步应把领料/补料/超领审批与报工事件继续绑定。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {materialConsumes.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.materialCode || '-'} {item.materialName || ''}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.materialType || 'UNKNOWN'}
                              {item.batchNo ? ` / 批次 ${item.batchNo}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatAmount(Number(item.actualQty || 0))}{item.unit ? ` ${item.unit}` : ''}
                            </p>
                            <p className={`mt-1 text-xs ${Number(item.costDiff || 0) > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                              偏差 {formatAmount(Number(item.costDiff || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingMaterialConsumes.length > 0 ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-amber-700">待归属用料</p>
                    <span className="text-xs text-amber-600">{pendingMaterialConsumes.length} 条</span>
                  </div>
                  <div className="space-y-2">
                    {pendingMaterialConsumes.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg bg-white px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.materialCode || '-'} {item.materialName || ''}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.materialType || 'UNKNOWN'} / 数量 {formatAmount(Number(item.actualQty || 0))}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBindMaterialConsume(item.id)}
                            disabled={bindingConsumeId === item.id}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {bindingConsumeId === item.id ? '绑定中...' : '绑定当前工序'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-slate-800">现场工序调整</h4>
                <p className="mt-1 text-xs text-slate-500">
                  用于临时插入照灯/灯检、印花、绣花、检品公司、返修等节点；所有调整都会写入工单工序快照。
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-slate-600">
                  工序
                  <select
                    value={customAction.processId}
                    onChange={(event) => {
                      const selected = processDefs.find((item) => String(item.id) === event.target.value);
                      setCustomAction((prev) => ({
                        ...prev,
                        processId: event.target.value,
                        isOutsource: selected?.enableOutsource === 1 ? '1' : prev.isOutsource,
                      }));
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                  >
                    <option value="">请选择要插入的工序</option>
                    {processDefs.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.processCode ? `${item.processCode} ` : ''}{item.processName}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-xs text-slate-600">
                    插入序号
                    <input
                      type="number"
                      value={customAction.processSeq}
                      onChange={(event) => setCustomAction((prev) => ({ ...prev, processSeq: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                      placeholder={currentProcess ? String(currentProcess.processSeq) : '末尾'}
                    />
                  </label>
                  <label className="block text-xs text-slate-600">
                    是否外协
                    <select
                      value={customAction.isOutsource}
                      onChange={(event) => setCustomAction((prev) => ({ ...prev, isOutsource: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                    >
                      <option value="0">本厂</option>
                      <option value="1">外协</option>
                    </select>
                  </label>
                </div>

                <label className="block text-xs text-slate-600">
                  原因
                  <textarea
                    value={customAction.reason}
                    onChange={(event) => setCustomAction((prev) => ({ ...prev, reason: event.target.value }))}
                    className="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                    placeholder="例如：日单要求灯检；客户追加绣花；质检不合格返修；该工序无需执行。"
                  />
                </label>

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={handleInsertCustomProcess}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
                  >
                    插入临时工序
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertReworkProcess}
                    disabled={!currentProcess}
                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    插入返修工序
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipCurrentProcess}
                    disabled={!currentProcess}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    跳过当前工序
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDefectForm && (
        <DefectForm
          defectQty={defectQtyNum}
          existingDefects={defects}
          onSubmit={(items) => {
            setDefects(items);
            setShowDefectForm(false);
          }}
          onClose={() => setShowDefectForm(false)}
        />
      )}
    </div>
  );
}
