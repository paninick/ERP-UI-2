import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as processRouteApi from '@/api/processRoute';
import * as productionApi from '@/api/production';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';

interface ProducePlanOption {
  id: number;
  planNo?: string;
  salesNo?: string;
  salesOrderId?: number;
  customerName?: string;
  bulkOrderNo?: string;
  sampleStyleNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  status?: string;
  processRouteId?: number;
  techId?: number;
  noticeId?: number;
  srcBillType?: string;
  srcBillId?: number;
  srcBillNo?: string;
}

interface ProcessRouteOption {
  id: number;
  routeName: string;
  productCode?: string;
}

interface JobFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function JobForm({ initialValues, onSubmit, onCancel }: JobFormProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ProducePlanOption[]>([]);
  const [routes, setRoutes] = useState<ProcessRouteOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const sourcePlanId = searchParams.get('producePlanId') || searchParams.get('planId') || '';

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.job.form.status.pending') },
    { value: '1', label: t('page.job.form.status.running') },
    { value: '2', label: t('page.job.form.status.completed') },
    { value: '3', label: t('page.job.form.status.cancelled') },
  ]);

  useEffect(() => {
    productionApi
      .listProducePlan({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        setPlans(res.rows || []);
      })
      .catch(() => setPlans([]));

    processRouteApi
      .listProcessRoute({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        setRoutes(res.rows || []);
      })
      .catch(() => setRoutes([]));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        jobNo: String(initialValues.jobNo ?? ''),
        producePlanId: String(initialValues.producePlanId ?? ''),
        salesNo: String(initialValues.salesNo ?? ''),
        customerName: String(initialValues.customerName ?? ''),
        bulkOrderNo: String(initialValues.bulkOrderNo ?? ''),
        sampleStyleNo: String(initialValues.sampleStyleNo ?? initialValues.styleCode ?? ''),
        techId: String(initialValues.techId ?? ''),
        noticeId: String(initialValues.noticeId ?? ''),
        srcBillType: String(initialValues.srcBillType ?? ''),
        srcBillId: String(initialValues.srcBillId ?? ''),
        srcBillNo: String(initialValues.srcBillNo ?? ''),
        styleCode: String(initialValues.styleCode ?? ''),
        colorCode: String(initialValues.colorCode ?? ''),
        sizeCode: String(initialValues.sizeCode ?? ''),
        planQty: String(initialValues.planQty ?? ''),
        processRouteId: String(initialValues.processRouteId ?? ''),
        status: String(initialValues.status ?? '0'),
        remark: String(initialValues.remark ?? ''),
      });
      return;
    }

    setForm({
      jobNo: '',
      producePlanId: sourcePlanId,
      salesNo: '',
      customerName: '',
      bulkOrderNo: '',
      sampleStyleNo: '',
      techId: '',
      noticeId: '',
      srcBillType: '',
      srcBillId: '',
      srcBillNo: '',
      styleCode: '',
      colorCode: '',
      sizeCode: '',
      planQty: '',
      processRouteId: '',
      status: planStatus.options[0]?.value || '0',
      remark: '',
    });
  }, [initialValues, planStatus.options, sourcePlanId]);

  const selectedPlan = useMemo(
    () => plans.find((item) => String(item.id) === String(form.producePlanId || '')),
    [form.producePlanId, plans],
  );

  const filteredRoutes = useMemo(() => {
    if (!selectedPlan?.styleCode) {
      return routes;
    }
    const matched = routes.filter((item) => !item.productCode || item.productCode === selectedPlan.styleCode);
    return matched.length > 0 ? matched : routes;
  }, [routes, selectedPlan?.styleCode]);
  const hasExactRoute = useMemo(() => {
    if (!selectedPlan?.styleCode) {
      return true;
    }
    return routes.some((item) => item.productCode === selectedPlan.styleCode);
  }, [routes, selectedPlan?.styleCode]);

  useEffect(() => {
    if (!selectedPlan) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedPlan.salesNo || '',
      customerName: selectedPlan.customerName || '',
      bulkOrderNo: selectedPlan.bulkOrderNo || '',
      sampleStyleNo: selectedPlan.sampleStyleNo || selectedPlan.styleCode || '',
      techId: selectedPlan.techId != null ? String(selectedPlan.techId) : prev.techId,
      noticeId: selectedPlan.noticeId != null ? String(selectedPlan.noticeId) : prev.noticeId,
      srcBillType: selectedPlan.srcBillType || prev.srcBillType,
      srcBillId: selectedPlan.srcBillId != null ? String(selectedPlan.srcBillId) : prev.srcBillId,
      srcBillNo: selectedPlan.srcBillNo || prev.srcBillNo,
      styleCode: selectedPlan.styleCode || '',
      colorCode: prev.colorCode || selectedPlan.colorCode || '',
      sizeCode: prev.sizeCode || selectedPlan.sizeCode || '',
      planQty: String(selectedPlan.planQty ?? ''),
      processRouteId: prev.processRouteId || (selectedPlan.processRouteId ? String(selectedPlan.processRouteId) : ''),
    }));
  }, [selectedPlan]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.producePlanId) {
      toast.error(t('page.job.form.toasts.selectPlan'));
      return;
    }

    if (!form.styleCode || !form.planQty) {
      toast.error(t('page.job.form.toasts.invalidPlan'));
      return;
    }

    if (!form.processRouteId) {
      toast.error(t('page.job.form.toasts.selectRoute'));
      return;
    }

    setLoading(true);
    try {
        await onSubmit({
          ...initialValues,
          jobNo: form.jobNo?.trim() ? form.jobNo.trim() : undefined,
          producePlanId: Number(form.producePlanId),
          orderId: selectedPlan?.salesOrderId ?? undefined,
          customerName: form.customerName || selectedPlan?.customerName || undefined,
          createdFrom: form.srcBillNo || form.srcBillType || selectedPlan?.planNo || undefined,
          salesNo: form.salesNo,
        styleCode: form.styleCode,
        colorCode: form.colorCode || undefined,
        sizeCode: form.sizeCode || undefined,
        planQty: Number(form.planQty),
        processRouteId: Number(form.processRouteId),
        status: form.status || planStatus.options[0]?.value || '0',
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
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('page.job.form.banner')}
      </div>
      {(form.producePlanId || form.srcBillNo || form.srcBillType) && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          当前工单已承接计划与来源：
          {selectedPlan?.planNo || form.producePlanId || '-'}
          {form.srcBillNo ? ` · ${form.srcBillNo}` : form.srcBillType ? ` · ${form.srcBillType}` : ''}
          {form.techId ? ` · 技术单#${form.techId}` : ''}
        </div>
      )}

      <DocumentCodeBoard
        title={t('page.job.form.codeBoard.title')}
        description={t('page.job.form.codeBoard.description')}
        items={[
          {
            label: t('page.job.form.codeBoard.items.jobNo.label'),
            value: form.jobNo || t('common.autoGenerate', { defaultValue: '保存后自动生成' }),
            helper: t('page.job.form.codeBoard.items.jobNo.helper'),
            tone: 'primary',
          },
          {
            label: t('page.job.form.codeBoard.items.planNo.label'),
            value: selectedPlan?.planNo,
            helper: t('page.job.form.codeBoard.items.planNo.helper'),
            tone: 'secondary',
          },
          {
            label: t('page.job.form.codeBoard.items.salesNo.label'),
            value: form.salesNo,
            helper: t('page.job.form.codeBoard.items.salesNo.helper'),
          },
          {
            label: '来源计划/单据',
            value: selectedPlan?.planNo || form.srcBillNo || form.srcBillType,
            helper: '工单应承接计划与上游来源，而不是现场重新断链。',
          },
          {
            label: t('page.job.form.codeBoard.items.styleQty.label'),
            value: form.styleCode ? `${form.styleCode}${form.planQty ? ` / ${form.planQty}` : ''}` : '',
            helper: t('page.job.form.codeBoard.items.styleQty.helper'),
          },
        ]}
      />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.job.columns.jobNo')}
        </label>
        <input
          value={form.jobNo || ''}
          onChange={(event) => updateField('jobNo', event.target.value)}
          placeholder={t('common.autoGenerate', { defaultValue: '保存后自动生成' })}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.job.columns.jobNo')}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.job.form.producePlan')}
        </label>
        <select
          value={form.producePlanId || ''}
          onChange={(event) => updateField('producePlanId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.job.form.producePlan')}
          disabled={Boolean(initialValues?.id)}
        >
          <option value="">{t('page.job.form.selectPlan')}</option>
          {plans.map((item) => (
            <option key={item.id} value={item.id}>
              {item.planNo || item.id}
              {item.salesNo ? ` - ${item.salesNo}` : ''}
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <ReadonlyField label={t('page.job.columns.salesNo')} value={form.salesNo} />
      <ReadonlyField label={t('page.plan.form.customerName', { defaultValue: '客户名称' })} value={form.customerName} />
      <ReadonlyField label="大货款号" value={form.bulkOrderNo} />
      <ReadonlyField label="打样款号" value={form.sampleStyleNo} />
      <ReadonlyField label={t('page.job.columns.styleCode')} value={form.styleCode} />
      <ReadonlyField label={t('page.job.columns.colorCode')} value={form.colorCode} />
      <ReadonlyField label={t('page.job.columns.sizeCode')} value={form.sizeCode} />
      <ReadonlyField label={t('page.job.columns.planQty')} value={form.planQty} />
      <ReadonlyField label="来源单据" value={form.srcBillNo || form.srcBillType} />
      <ReadonlyField label="计划承接路线" value={selectedPlan?.processRouteId ? `路线#${selectedPlan.processRouteId}` : '-'} />
      <ReadonlyField label="计划承接工作中心" value={selectedPlan?.workCenterId ? `工作中心#${selectedPlan.workCenterId}` : '-'} />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          {t('page.job.form.processRoute')}
        </label>
        <select
          value={form.processRouteId || ''}
          onChange={(event) => updateField('processRouteId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.job.form.processRoute')}
        >
          <option value="">{t('page.job.form.selectRoute')}</option>
          {filteredRoutes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.routeName}
              {item.productCode ? ` - ${item.productCode}` : ''}
            </option>
          ))}
        </select>
        {routes.length === 0 && (
          <span className="text-xs text-amber-600">{t('page.job.form.noRoutes', { defaultValue: '暂无可选工艺路线，请先维护工艺路线。' })}</span>
        )}
      </div>
      {selectedPlan?.styleCode && routes.length > 0 && !hasExactRoute && (
        <div className="ml-[7.75rem] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          {t('page.job.form.routeFallbackHint', { styleCode: selectedPlan.styleCode })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">{t('page.job.columns.status')}</label>
        <select
          value={form.status || ''}
          onChange={(event) => updateField('status', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label={t('page.job.columns.status')}
        >
          {planStatus.options
            .filter((item) => item.value !== '2')
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
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </button>
      </div>
    </form>
  );
}
