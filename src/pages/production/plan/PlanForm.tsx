import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as salesApi from '@/api/sales';
import * as processRouteApi from '@/api/processRoute';
import * as workCenterApi from '@/api/workCenter';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildDocNo } from '@/utils/detailDraft';
import { isApprovalLocked } from '@/utils/approval';

interface SalesOrderOption {
  id: number;
  salesNo?: string;
  customerName?: string;
  styleCode?: string;
  quantity?: number;
  deliveryDate?: string;
  remark?: string;
}

interface ProcessRouteOption {
  id: number;
  routeName?: string;
  productCode?: string;
}

interface WorkCenterOption {
  id: number;
  centerName?: string;
  centerCode?: string;
}

interface PlanFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

function buildPlanNo() {
  return buildDocNo('PLAN');
}

export default function PlanForm({ initialValues, onSubmit, onCancel }: PlanFormProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
  const [routes, setRoutes] = useState<ProcessRouteOption[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenterOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.plan.form.status.pending') },
    { value: '1', label: t('page.plan.form.status.scheduled') },
    { value: '2', label: t('page.plan.form.status.running') },
    { value: '3', label: t('page.plan.form.status.completed') },
  ]);
  const locked = isApprovalLocked(initialValues?.auditStatus);
  const sourceContext = useMemo(
    () => ({
      salesOrderId: searchParams.get('salesOrderId') || '',
      salesNo: searchParams.get('salesNo') || '',
      styleCode: searchParams.get('styleCode') || '',
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
      .then((res: any) => setRoutes(res.rows || []))
      .catch(() => setRoutes([]));

    workCenterApi
      .listWorkCenter({ pageNum: 1, pageSize: 500 })
      .then((res: any) => setWorkCenters(res.rows || []))
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
      setForm({
        planNo: String(initialValues.planNo ?? ''),
        salesOrderId: String(initialValues.salesOrderId ?? initialValues.orderId ?? ''),
        salesNo: String(initialValues.salesNo ?? ''),
        styleCode: String(initialValues.styleCode ?? ''),
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
        planDate: String(initialValues.planDate ?? ''),
        planStatus: String(initialValues.planStatus ?? initialValues.status ?? '0'),
        remark: String(initialValues.remark ?? ''),
      });
      return;
    }

    setForm({
      planNo: buildPlanNo(),
      salesOrderId: inferredOrderId,
      salesNo: sourceContext.salesNo,
      styleCode: sourceContext.styleCode,
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
      planDate: new Date().toISOString().slice(0, 10),
      planStatus: planStatus.options[0]?.value || '0',
      remark: '',
    });
  }, [inferredOrderId, initialValues, planStatus.options, sourceContext]);

  const selectedOrder = useMemo(
    () => salesOrders.find((item) => String(item.id) === String(form.salesOrderId || '')),
    [form.salesOrderId, salesOrders],
  );

  const filteredRoutes = useMemo(() => {
    if (!form.styleCode) {
      return routes;
    }
    const matched = routes.filter((item) => !item.productCode || item.productCode === form.styleCode);
    return matched.length > 0 ? matched : routes;
  }, [form.styleCode, routes]);

  const selectedRoute = useMemo(
    () => routes.find((item) => String(item.id) === String(form.processRouteId || '')),
    [form.processRouteId, routes],
  );

  const selectedWorkCenter = useMemo(
    () => workCenters.find((item) => String(item.id) === String(form.workCenterId || '')),
    [form.workCenterId, workCenters],
  );

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedOrder.salesNo || '',
      styleCode: selectedOrder.styleCode || '',
      customerName: prev.customerName || selectedOrder.customerName || '',
      sampleStyleNo: prev.sampleStyleNo || selectedOrder.styleCode || '',
      planQty: prev.planQty || String(selectedOrder.quantity ?? ''),
      remark: prev.remark || selectedOrder.remark || '',
      srcBillType: prev.srcBillType || 'sales_order',
      srcBillId: prev.srcBillId || String(selectedOrder.id),
      srcBillNo: prev.srcBillNo || selectedOrder.salesNo || '',
    }));
  }, [selectedOrder]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);
    try {
      await onSubmit({
        ...initialValues,
        planNo: form.planNo,
        salesOrderId: Number(form.salesOrderId),
        orderId: Number(form.salesOrderId),
        salesNo: form.salesNo,
        styleCode: form.styleCode,
        customerName: form.customerName || selectedOrder?.customerName || undefined,
        bulkOrderNo: form.bulkOrderNo || undefined,
        sampleStyleNo: form.sampleStyleNo || form.styleCode || undefined,
        techId: form.techId ? Number(form.techId) : undefined,
        noticeId: form.noticeId ? Number(form.noticeId) : undefined,
        srcBillType: form.srcBillType || undefined,
        srcBillId: form.srcBillId ? Number(form.srcBillId) : undefined,
        srcBillNo: form.srcBillNo || form.salesNo || undefined,
        planQty: Number(form.planQty),
        processRouteId: form.processRouteId ? Number(form.processRouteId) : undefined,
        workCenterId: form.workCenterId ? Number(form.workCenterId) : undefined,
        planDate: form.planDate || undefined,
        planStatus: form.planStatus || planStatus.options[0]?.value || '0',
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
            value: form.planNo,
            helper: t('page.plan.form.codeBoard.items.planNo.helper'),
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
        <input
          value={form.planNo || ''}
          onChange={(event) => updateField('planNo', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.plan.columns.planNo')}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.plan.form.salesOrder')}
        </label>
        <select
          value={form.salesOrderId || ''}
          onChange={(event) => updateField('salesOrderId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.plan.form.salesOrder')}
          disabled={Boolean(initialValues?.id) || locked}
        >
          <option value="">{t('page.plan.form.selectSalesOrder')}</option>
          {salesOrders.map((item) => (
            <option key={item.id} value={item.id}>
              {item.salesNo || item.id}
              {item.customerName ? ` - ${item.customerName}` : ''}
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <ReadonlyField label={t('page.plan.columns.salesNo')} value={form.salesNo} />
      <ReadonlyField label={t('page.plan.columns.styleCode')} value={form.styleCode} />
      <ReadonlyField label={t('page.plan.form.customerName', { defaultValue: '客户名称' })} value={form.customerName} />
      <ReadonlyField label="打样款号" value={form.sampleStyleNo} />
      <ReadonlyField label="大货款号" value={form.bulkOrderNo} />
      <ReadonlyField label="来源单据" value={form.srcBillNo || form.srcBillType} />
      <ReadonlyField
        label={t('page.plan.form.orderQty')}
        value={selectedOrder?.quantity != null ? String(selectedOrder.quantity) : ''}
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
        <select
          value={form.processRouteId || ''}
          onChange={(event) => updateField('processRouteId', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="工艺路线"
        >
          <option value="">请选择工艺路线</option>
          {filteredRoutes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.routeName || `路线#${item.id}`}
              {item.productCode ? ` - ${item.productCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">工作中心</label>
        <select
          value={form.workCenterId || ''}
          onChange={(event) => updateField('workCenterId', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="工作中心"
        >
          <option value="">请选择工作中心</option>
          {workCenters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.centerName || `工作中心#${item.id}`}
              {item.centerCode ? ` - ${item.centerCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">{t('page.plan.columns.planDate')}</label>
        <input
          type="date"
          value={form.planDate || ''}
          onChange={(event) => updateField('planDate', event.target.value)}
          disabled={locked}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.plan.columns.planDate')}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">{t('page.plan.columns.status')}</label>
        <select
          value={form.planStatus || ''}
          onChange={(event) => updateField('planStatus', event.target.value)}
          disabled
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.plan.columns.status')}
        >
          {planStatus.options
            .filter((item) => item.value !== '3')
            .map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
        </select>
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
          {loading ? t('common.submitting') : t('common.confirm')}
        </button>
      </div>
    </form>
  );
}
