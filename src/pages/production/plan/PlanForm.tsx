import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as salesApi from '@/api/sales';
import * as processRouteApi from '@/api/processRoute';
import * as workCenterApi from '@/api/workCenter';
import * as ganttApi from '@/api/gantt';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { isApprovalLocked } from '@/utils/approval';

interface SalesOrderOption {
  id: number;
  salesNo?: string;
  customerName?: string;
  styleCode?: string;
  styleCategory?: string;
  quantity?: number;
  deliveryDate?: string;
  dueDate?: string;
  remark?: string;
}

const todayValue = () => new Date().toISOString().slice(0, 10);

interface ProcessRouteOption {
  id: number | string;
  routeName?: string;
  productCode?: string;
  productType?: string;
  isFallback?: boolean;
}

interface WorkCenterOption {
  id: number | string;
  centerName?: string;
  centerCode?: string;
  centerType?: string;
  capacity?: number;
  capacityUnit?: string;
  isFallback?: boolean;
}

interface PlanFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const FALLBACK_ROUTES: ProcessRouteOption[] = [
  { id: 'fallback-knitwear', routeName: '毛衫默认路线：横机 → 套口 → 水洗 → 整烫 → 检验 → 包装', productType: 'SWEATER', isFallback: true },
  { id: 'fallback-splice', routeName: '拼接默认路线：裁剪 → 拼接 → 缝制 → 整烫 → 检验 → 包装', productType: 'SPLICE', isFallback: true },
  { id: 'fallback-tshirt', routeName: '普通T恤默认路线：裁剪 → 缝制 → 整烫 → 检验 → 包装', productType: 'KNIT_TOP', isFallback: true },
];

const FALLBACK_WORK_CENTERS: WorkCenterOption[] = [
  { id: 'fallback-dongchuan-knitwear', centerName: '东川本部-毛衫综合线', centerCode: 'DC-KNIT', centerType: 'SWEATER', isFallback: true },
  { id: 'fallback-shuyang-knitwear', centerName: '沭阳毛纺厂-横机/套口线', centerCode: 'SY-KNIT', centerType: 'SWEATER', isFallback: true },
  { id: 'fallback-dongchuan-splice', centerName: '东川本部-拼接专线', centerCode: 'DC-SPLICE', centerType: 'SPLICE', isFallback: true },
  { id: 'fallback-dongchuan-tshirt', centerName: '东川本部-普通T恤缝制线', centerCode: 'DC-TEE', centerType: 'KNIT_TOP', isFallback: true },
  { id: 'fallback-outsource', centerName: '外发加工-需审批', centerCode: 'OUTSOURCE', centerType: 'OUTSOURCE', isFallback: true },
];

function extractRows(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.rows)) return response.data.rows;
  return [];
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  return String(value).slice(0, 10).replace(/\//g, '-');
}

function resolveProductType(value?: string) {
  const text = String(value || '').toUpperCase();
  if (!text) return 'KNIT_TOP';
  if (text.includes('拼') || text.includes('SPLICE') || text.includes('PATCH')) return 'SPLICE';
  if (text.includes('毛') || text.includes('SWEATER') || text.includes('KNITWEAR') || text.includes('WOOL')) return 'SWEATER';
  if (text.includes('TEE') || text.includes('T恤') || text.includes('TSHIRT') || text.includes('KNIT_TOP') || text.includes('针织')) return 'KNIT_TOP';
  return 'KNIT_TOP';
}

function productTypeMatches(candidate: string | undefined, target: string) {
  if (!candidate) return false;
  return resolveProductType(candidate) === target;
}

function isFallbackSelected<T extends { id: number | string; isFallback?: boolean }>(items: T[], value?: string) {
  return items.some((item) => String(item.id) === String(value || '') && item.isFallback);
}

function isNumericId(value?: string) {
  return Boolean(value && /^\d+$/.test(value));
}

function isSchedulableCapacityUnit(capacityUnit?: string) {
  const normalized = String(capacityUnit || '').trim().toLowerCase();
  return normalized === '工时/日' || normalized === '小时/日' || normalized === 'hour/day';
}

function resolveScheduledStatus(options: Array<{ value: string; label: string }>) {
  return (
    options.find((item) => item.value === '1')?.value
    || options.find((item) => item.label.includes('已排') || item.label.includes('已预排') || item.label.includes('已排程'))?.value
    || '1'
  );
}

export default function PlanForm({ initialValues, onSubmit, onCancel }: PlanFormProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
  const [routes, setRoutes] = useState<ProcessRouteOption[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenterOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.plan.form.status.pending') },
    { value: '1', label: t('page.plan.form.status.scheduled') },
    { value: '2', label: t('page.plan.form.status.running') },
    { value: '3', label: t('page.plan.form.status.completed') },
  ]);
  const locked = isApprovalLocked(initialValues?.auditStatus);
  const isExistingPlan = Boolean(initialValues?.id);
  const sourceContext = useMemo(
    () => ({
      salesOrderId: searchParams.get('salesOrderId') || '',
      salesNo: searchParams.get('salesNo') || '',
      styleCode: searchParams.get('styleCode') || '',
      styleCategory: searchParams.get('styleCategory') || '',
      customerName: searchParams.get('customerName') || '',
      bulkOrderNo: searchParams.get('bulkOrderNo') || '',
      sampleStyleNo: searchParams.get('sampleStyleNo') || searchParams.get('styleCode') || '',
      techId: searchParams.get('techId') || '',
      noticeId: searchParams.get('noticeId') || '',
      srcBillType: searchParams.get('srcBillType') || '',
      srcBillId: searchParams.get('srcBillId') || '',
      srcBillNo: searchParams.get('srcBillNo') || '',
    }),
    [searchParams],
  );
  const defaultPlanStatus = planStatus.options[0]?.value || '0';
  const scheduledPlanStatus = resolveScheduledStatus(planStatus.options);

  useEffect(() => {
    salesApi
      .listSalesOrder({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        setSalesOrders(res.rows || []);
      })
      .catch(() => {
        setSalesOrders([]);
      });
  }, []);

  useEffect(() => {
    processRouteApi
      .listProcessRoute({ pageNum: 1, pageSize: 500 })
      .then((res: any) => setRoutes(extractRows(res)))
      .catch(() => setRoutes([]));

    workCenterApi
      .listWorkCenter({ pageNum: 1, pageSize: 500 })
      .then((res: any) => setWorkCenters(extractRows(res)))
      .catch(() => setWorkCenters([]));
  }, []);

  const inferredOrderId = useMemo(() => {
    if (sourceContext.salesOrderId) {
      return sourceContext.salesOrderId;
    }
    if (!sourceContext.styleCode || salesOrders.length === 0) {
      return '';
    }
    const matched = salesOrders.filter((item) => {
      if (item.styleCode !== sourceContext.styleCode) {
        return false;
      }
      if (sourceContext.customerName && item.customerName !== sourceContext.customerName) {
        return false;
      }
      return true;
    });
    return matched.length === 1 ? String(matched[0].id) : '';
  }, [salesOrders, sourceContext.customerName, sourceContext.salesOrderId, sourceContext.styleCode]);

  useEffect(() => {
    if (initialValues) {
      const isEditing = Boolean(initialValues.id);
      const today = todayValue();
      setForm({
        planNo: String(initialValues.planNo ?? ''),
        salesOrderId: String(initialValues.salesOrderId ?? initialValues.orderId ?? ''),
        salesNo: String(initialValues.salesNo ?? ''),
        styleCode: String(initialValues.styleCode ?? ''),
        styleCategory: String(initialValues.styleCategory ?? ''),
        customerName: String(initialValues.customerName ?? ''),
        bulkOrderNo: String(initialValues.bulkOrderNo ?? ''),
        sampleStyleNo: String(initialValues.sampleStyleNo ?? initialValues.styleCode ?? ''),
        techId: String(initialValues.techId ?? ''),
        noticeId: String(initialValues.noticeId ?? ''),
        srcBillType: String(initialValues.srcBillType ?? ''),
        srcBillId: String(initialValues.srcBillId ?? ''),
        srcBillNo: String(initialValues.srcBillNo ?? ''),
        planQty: String(initialValues.planQty ?? ''),
        processRouteId: String(initialValues.processRouteId ?? ''),
        workCenterId: String(initialValues.workCenterId ?? ''),
        planDate: toDateInputValue(initialValues.planDate ?? (isEditing ? '' : today)),
        startDate: toDateInputValue(initialValues.startDate ?? (isEditing ? '' : today)),
        dueDate: toDateInputValue(initialValues.dueDate ?? initialValues.deliveryDate ?? ''),
        planStatus: String(initialValues.planStatus ?? initialValues.status ?? (isEditing ? defaultPlanStatus : scheduledPlanStatus)),
        remark: String(initialValues.remark ?? ''),
      });
      return;
    }

    setForm({
      planNo: '',
      salesOrderId: inferredOrderId,
      salesNo: sourceContext.salesNo,
      styleCode: sourceContext.styleCode,
      styleCategory: sourceContext.styleCategory,
      customerName: sourceContext.customerName,
      bulkOrderNo: sourceContext.bulkOrderNo,
      sampleStyleNo: sourceContext.sampleStyleNo,
      techId: sourceContext.techId,
      noticeId: sourceContext.noticeId,
      srcBillType:
        sourceContext.srcBillType
        || (sourceContext.techId ? 'sample_tech' : sourceContext.noticeId ? 'sample_notice' : inferredOrderId ? 'sales_order' : ''),
      srcBillId: sourceContext.srcBillId || sourceContext.techId || sourceContext.noticeId || inferredOrderId,
      srcBillNo: sourceContext.srcBillNo || sourceContext.salesNo,
      planQty: '',
      processRouteId: '',
      workCenterId: '',
      planDate: todayValue(),
      startDate: todayValue(),
      dueDate: '',
      planStatus: scheduledPlanStatus,
      remark: '',
    });
  }, [
    defaultPlanStatus,
    inferredOrderId,
    initialValues,
    scheduledPlanStatus,
    sourceContext.bulkOrderNo,
    sourceContext.customerName,
    sourceContext.noticeId,
    sourceContext.salesNo,
    sourceContext.salesOrderId,
    sourceContext.sampleStyleNo,
    sourceContext.srcBillId,
    sourceContext.srcBillNo,
    sourceContext.srcBillType,
    sourceContext.styleCategory,
    sourceContext.styleCode,
    sourceContext.techId,
  ]);

  const hasSourceOrder = Boolean(form.salesOrderId || form.salesNo || form.srcBillNo);
  const shouldLockSourceOrder = Boolean(isExistingPlan || hasSourceOrder);
  const displayedPlanNo = form.planNo || '保存后由系统生成';

  const selectedOrder = useMemo(
    () => salesOrders.find((item) => String(item.id) === String(form.salesOrderId || '')),
    [form.salesOrderId, salesOrders],
  );
  const salesDueDate = toDateInputValue(selectedOrder?.dueDate || selectedOrder?.deliveryDate || initialValues?.deliveryDate || initialValues?.dueDate);

  const productType = useMemo(
    () => resolveProductType(form.styleCategory || selectedOrder?.styleCategory || initialValues?.styleCategory || form.styleCode),
    [form.styleCategory, form.styleCode, initialValues?.styleCategory, selectedOrder?.styleCategory],
  );

  const routeOptions = useMemo(
    () => (routes.length > 0 ? routes : FALLBACK_ROUTES),
    [routes],
  );
  const workCenterOptions = useMemo(
    () => (workCenters.length > 0 ? workCenters : FALLBACK_WORK_CENTERS),
    [workCenters],
  );

  const filteredRoutes = useMemo(() => {
    if (!form.styleCode) {
      const matchedByType = routeOptions.filter((item) => !item.productType || productTypeMatches(item.productType, productType));
      return matchedByType.length > 0 ? matchedByType : routeOptions;
    }
    const matched = routeOptions.filter((item) => {
      if (item.productCode && item.productCode === form.styleCode) return true;
      if (item.productType && productTypeMatches(item.productType, productType)) return true;
      return !item.productCode && !item.productType;
    });
    return matched.length > 0 ? matched : routeOptions;
  }, [form.styleCode, productType, routeOptions]);

  const filteredWorkCenters = useMemo(() => {
    if (workCenters.length > 0) {
      const schedulable = workCenterOptions.filter((item) => isSchedulableCapacityUnit(item.capacityUnit));
      return schedulable.length > 0 ? schedulable : workCenterOptions;
    }
    const matched = workCenterOptions.filter((item) => {
      if (!item.centerType) return true;
      if (productType === 'SPLICE') return item.centerType === 'SPLICE';
      if (productType === 'SWEATER') return item.centerType === 'SWEATER' || item.centerType === 'OUTSOURCE';
      return item.centerType === 'KNIT_TOP' || item.centerType === 'OUTSOURCE';
    });
    return matched.length > 0 ? matched : workCenterOptions;
  }, [productType, workCenterOptions, workCenters.length]);

  const selectedRoute = useMemo(
    () => routeOptions.find((item) => String(item.id) === String(form.processRouteId || '')),
    [form.processRouteId, routeOptions],
  );

  const selectedWorkCenter = useMemo(
    () => workCenterOptions.find((item) => String(item.id) === String(form.workCenterId || '')),
    [form.workCenterId, workCenterOptions],
  );

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedOrder.salesNo || '',
      styleCode: selectedOrder.styleCode || '',
      styleCategory: prev.styleCategory || selectedOrder.styleCategory || '',
      customerName: prev.customerName || selectedOrder.customerName || '',
      sampleStyleNo: prev.sampleStyleNo || selectedOrder.styleCode || '',
      planQty: prev.planQty || String(selectedOrder.quantity ?? ''),
      dueDate: prev.dueDate || toDateInputValue(selectedOrder.dueDate || selectedOrder.deliveryDate),
      remark: prev.remark || selectedOrder.remark || '',
      srcBillType: prev.srcBillType || 'sales_order',
      srcBillId: prev.srcBillId || String(selectedOrder.id),
      srcBillNo: prev.srcBillNo || selectedOrder.salesNo || '',
    }));
  }, [selectedOrder]);

  useEffect(() => {
    setForm((prev) => {
      const next: Record<string, string> = { ...prev };
      const routeStillAvailable = filteredRoutes.some((item) => String(item.id) === String(next.processRouteId || ''));
      const workCenterStillAvailable = filteredWorkCenters.some((item) => String(item.id) === String(next.workCenterId || ''));
      if ((!next.processRouteId || !routeStillAvailable) && filteredRoutes.length > 0) {
        next.processRouteId = String(filteredRoutes[0].id);
      }
      if ((!next.workCenterId || !workCenterStillAvailable) && filteredWorkCenters.length > 0) {
        next.workCenterId = String(filteredWorkCenters[0].id);
      }
      return next;
    });
  }, [filteredRoutes, filteredWorkCenters]);

  const updateField = (name: string, value: string) => {
    const normalizedValue = ['planDate', 'startDate', 'dueDate'].includes(name) ? toDateInputValue(value) : value;
    setForm((prev) => ({ ...prev, [name]: normalizedValue }));
    if (['planQty', 'processRouteId', 'workCenterId', 'startDate', 'dueDate'].includes(name)) {
      setConflictResult(null);
    }
  };

  const handlePreviewConflict = async () => {
    if (!form.planQty || !form.processRouteId || !form.workCenterId || !form.startDate || !form.dueDate) {
      toast.warning('请先补齐计划数量、工艺路线、工作中心、计划开工日和计划下线日');
      return;
    }

    const routeIsFallback = isFallbackSelected(filteredRoutes, form.processRouteId);
    const workCenterIsFallback = isFallbackSelected(filteredWorkCenters, form.workCenterId);
    if (routeIsFallback || workCenterIsFallback) {
      setConflictResult({
        conflictLevel: 'WARNING',
        conflictReason: '当前使用的是系统推荐的临时路线/厂区。可以先做样板排产，但正式保存前需要维护真实工艺路线和真实工作中心。',
      });
      toast.warning('当前是临时推荐项，请先维护真实路线/工作中心后再做正式产能检测');
      return;
    }

    if (selectedWorkCenter && !isSchedulableCapacityUnit(selectedWorkCenter.capacityUnit)) {
      setConflictResult({
        conflictLevel: 'BLOCKED',
        conflictReason: `当前工作中心「${selectedWorkCenter.centerName || selectedWorkCenter.centerCode || selectedWorkCenter.id}」的产能单位是「${selectedWorkCenter.capacityUnit || '未维护'}」，不能用于正式预排。请改选“工时/日”口径的生产工作中心，样板/质检/件日产能中心只能做记录，不能做产能冲突计算。`,
      });
      toast.error('当前工作中心不是工时/日产能口径，不能正式预排');
      return;
    }

    setCheckingConflict(true);
    try {
      const response: any = await ganttApi.previewPlanConflict({
        ...initialValues,
        id: initialValues?.id,
        planNo: isExistingPlan ? form.planNo || undefined : undefined,
        customerName: form.customerName || selectedOrder?.customerName || undefined,
        styleCategory: initialValues?.styleCategory,
        planStatus: scheduledPlanStatus,
        planQty: Number(form.planQty),
        processRouteId: Number(form.processRouteId),
        workCenterId: Number(form.workCenterId),
        startDate: form.startDate,
        dueDate: form.dueDate,
      });
      const result = response?.data ?? response;
      setConflictResult(result);
      if (result?.conflictLevel === 'BLOCKED') {
        toast.error(result.conflictReason || '当前计划存在阻断冲突');
      } else if (result?.conflictLevel === 'WARNING') {
        toast.warning(result.conflictReason || '当前计划存在冲突风险');
      } else {
        toast.success('当前计划可预排');
      }
    } catch (error: any) {
      toast.error(error.message || '产能检测失败');
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.salesOrderId) {
      toast.error(t('page.plan.form.toasts.selectSalesOrder'));
      return;
    }

    if (!form.styleCode || !form.planQty) {
      toast.error(t('page.plan.form.toasts.invalidSource'));
      return;
    }

    if (isFallbackSelected(filteredRoutes, form.processRouteId) || isFallbackSelected(filteredWorkCenters, form.workCenterId)) {
      toast.error('当前只有临时推荐路线/厂区，不能正式保存。请先维护真实工艺路线和工作中心。');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...initialValues,
        planNo: isExistingPlan ? form.planNo || undefined : undefined,
        salesOrderId: Number(form.salesOrderId),
        orderId: Number(form.salesOrderId),
        salesNo: form.salesNo,
        styleCode: form.styleCode,
        styleCategory: form.styleCategory || productType,
        customerName: form.customerName || selectedOrder?.customerName || undefined,
        bulkOrderNo: form.bulkOrderNo || undefined,
        sampleStyleNo: form.sampleStyleNo || form.styleCode || undefined,
        techId: form.techId ? Number(form.techId) : undefined,
        noticeId: form.noticeId ? Number(form.noticeId) : undefined,
        srcBillType: form.srcBillType || undefined,
        srcBillId: form.srcBillId ? Number(form.srcBillId) : undefined,
        srcBillNo: form.srcBillNo || form.salesNo || undefined,
        planQty: Number(form.planQty),
        processRouteId: isNumericId(form.processRouteId) ? Number(form.processRouteId) : undefined,
        workCenterId: isNumericId(form.workCenterId) ? Number(form.workCenterId) : undefined,
        planDate: todayValue(),
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || selectedOrder?.dueDate || selectedOrder?.deliveryDate || undefined,
        planStatus: scheduledPlanStatus,
        remark: form.remark || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const ReadonlyField = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-center gap-3">
      <label className="w-28 shrink-0 text-right text-sm text-slate-600">{label}</label>
      <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {value || '-'}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {locked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t('approval.lockedHint')}
        </div>
      )}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {t('page.plan.form.banner')}
      </div>
      {(form.techId || form.noticeId || form.srcBillNo || form.srcBillType) && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          当前新增计划已带入上游来源：
          {form.srcBillNo || form.srcBillType || '未标识'}
          {form.techId ? ` · 技术单#${form.techId}` : ''}
          {form.noticeId ? ` · 打样通知#${form.noticeId}` : ''}
        </div>
      )}

      <DocumentCodeBoard
        title={t('page.plan.form.codeBoard.title')}
        description={t('page.plan.form.codeBoard.description')}
        items={[
          {
            label: t('page.plan.form.codeBoard.items.planNo.label'),
            value: displayedPlanNo,
            helper: isExistingPlan ? t('page.plan.form.codeBoard.items.planNo.helper') : '新建排产不在前端造号，保存成功后由后端 PP 规则生成。',
            tone: 'primary',
          },
          {
            label: t('page.plan.form.codeBoard.items.salesNo.label'),
            value: form.salesNo,
            helper: t('page.plan.form.codeBoard.items.salesNo.helper'),
            tone: 'secondary',
          },
          {
            label: t('page.plan.form.codeBoard.items.styleCode.label'),
            value: form.styleCode,
            helper: t('page.plan.form.codeBoard.items.styleCode.helper'),
          },
          {
            label: '来源单据',
            value: form.srcBillNo || form.srcBillType,
            helper: '承接上游核版/打样/销售来源，避免计划层重新断链。',
          },
          {
            label: t('page.plan.form.codeBoard.items.planQty.label'),
            value: form.planQty,
            helper: t('page.plan.form.codeBoard.items.planQty.helper'),
          },
          {
            label: '工艺路线',
            value: selectedRoute?.routeName || '',
            helper: '计划层先压实路线依据，工单层默认继承。',
          },
          {
            label: '工作中心',
            value: selectedWorkCenter?.centerName || '',
            helper: '为后续预排和工厂负荷视图提供正式执行位置。',
          },
        ]}
      />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.plan.columns.planNo')}
        </label>
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {displayedPlanNo}
        </div>
      </div>

      {shouldLockSourceOrder ? (
        <ReadonlyField
          label={t('page.plan.form.salesOrder')}
          value={[form.salesNo || form.srcBillNo || `订单#${form.salesOrderId}`, form.customerName, form.styleCode]
            .filter(Boolean)
            .join(' / ')}
        />
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          生产计划不能手工选择或伪造销售来源。请回到「待排产订单池」选择真实销售订单后再排产。
        </div>
      )}

      <ReadonlyField label={t('page.plan.columns.salesNo')} value={form.salesNo} />
      <ReadonlyField label={t('page.plan.columns.styleCode')} value={form.styleCode} />
      <ReadonlyField label="产品类型" value={form.styleCategory || productType} />
      <ReadonlyField label={t('page.plan.form.customerName', { defaultValue: '客户名称' })} value={form.customerName} />
      <ReadonlyField label="打样款号" value={form.sampleStyleNo} />
      <ReadonlyField label="大货款号" value={form.bulkOrderNo} />
      <ReadonlyField label="来源单据" value={form.srcBillNo || form.srcBillType} />
      <ReadonlyField
        label={t('page.plan.form.orderQty')}
        value={selectedOrder?.quantity != null ? String(selectedOrder.quantity) : ''}
      />
      <ReadonlyField
        label="销售交期"
        value={salesDueDate}
      />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.plan.columns.planQty')}
        </label>
        <input
          type="number"
          value={form.planQty || ''}
          onChange={(event) => updateField('planQty', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.plan.columns.planQty')}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">工艺路线</label>
        <div className="flex-1 space-y-2">
          <select
            value={form.processRouteId || ''}
            onChange={(event) => updateField('processRouteId', event.target.value)}
            disabled={locked}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            aria-label="工艺路线"
          >
            <option value="">请选择工艺路线</option>
            {filteredRoutes.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.routeName || `路线#${item.id}`}
                {item.productCode ? ` - ${item.productCode}` : ''}
                {item.isFallback ? '（临时推荐，需维护真实路线）' : ''}
              </option>
            ))}
          </select>
          <div className="grid gap-2 md:grid-cols-2">
            {filteredRoutes.slice(0, 4).map((item) => {
              const active = String(item.id) === String(form.processRouteId || '');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateField('processRouteId', String(item.id))}
                  disabled={locked}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    active
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="font-semibold">{item.routeName || `路线#${item.id}`}</div>
                  <div className="mt-1 text-[11px] opacity-80">
                    {item.productType || '通用路线'}
                    {item.isFallback ? ' · 临时推荐' : ' · 真实路线'}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-500">
            当前已选：{selectedRoute?.routeName || '未选择'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">工作中心</label>
        <div className="flex-1 space-y-2">
          <select
            value={form.workCenterId || ''}
            onChange={(event) => updateField('workCenterId', event.target.value)}
            disabled={locked}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            aria-label="工作中心"
          >
            <option value="">请选择工作中心</option>
            {filteredWorkCenters.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.centerName || `工作中心#${item.id}`}
                {item.centerCode ? ` - ${item.centerCode}` : ''}
                {item.capacityUnit ? ` - ${item.capacityUnit}` : ''}
                {item.isFallback ? '（临时推荐，需维护真实厂区）' : ''}
              </option>
            ))}
          </select>
          <div className="grid gap-2 md:grid-cols-2">
            {filteredWorkCenters.slice(0, 4).map((item) => {
              const active = String(item.id) === String(form.workCenterId || '');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateField('workCenterId', String(item.id))}
                  disabled={locked}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    active
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="font-semibold">{item.centerName || `工作中心#${item.id}`}</div>
                  <div className="mt-1 text-[11px] opacity-80">
                    {item.centerCode || item.centerType || '未维护编码'}
                    {item.capacityUnit ? ` · ${item.capacityUnit}` : ''}
                    {item.isFallback ? ' · 临时推荐' : ' · 真实工作中心'}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-500">
            当前已选：{selectedWorkCenter?.centerName || '未选择'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">计划开工日</label>
        <input
          type="date"
          value={form.startDate || ''}
          onChange={(event) => updateField('startDate', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="计划开工日"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">计划下线日</label>
        <input
          type="date"
          value={form.dueDate || ''}
          onChange={(event) => updateField('dueDate', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="计划下线日"
        />
      </div>
      <ReadonlyField label="销售交期" value={salesDueDate} />

      <div className="flex items-start gap-3">
        <div className="w-28 shrink-0 pt-2 text-right text-sm text-slate-600">预排检测</div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePreviewConflict}
              disabled={locked || checkingConflict}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              {checkingConflict ? '检测中...' : '检测产能冲突'}
            </button>
            <span className="text-xs text-slate-500">按计划开工日、计划下线日和工作中心检测是否可排，并对比销售交期</span>
          </div>

          {conflictResult ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                conflictResult.conflictLevel === 'BLOCKED'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : conflictResult.conflictLevel === 'WARNING'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">
                  {conflictResult.conflictLevel === 'BLOCKED'
                    ? '阻断'
                    : conflictResult.conflictLevel === 'WARNING'
                      ? '预警'
                      : '可预排'}
                </span>
                {typeof conflictResult.estimatedDays === 'number' ? <span>预计占用产能 {conflictResult.estimatedDays} 天</span> : null}
                {typeof conflictResult.loadPercent === 'number' ? <span>计划窗口负荷 {conflictResult.loadPercent}%</span> : null}
              </div>
              <div className="mt-2 leading-6">{conflictResult.conflictReason || '数据齐备，可进入正式预排判断'}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <label className="w-28 shrink-0 pt-2 text-right text-sm text-slate-600">{t('common.remark')}</label>
        <textarea
          value={form.remark || ''}
          onChange={(event) => updateField('remark', event.target.value)}
          disabled={locked}
          className="h-24 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('common.remark')}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading || locked}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : '提交排产'}
        </button>
      </div>
    </form>
  );
}
