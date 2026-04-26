import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as processRouteApi from '@/api/processRoute';
import * as productionApi from '@/api/production';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildDocNo } from '@/utils/detailDraft';

interface ProducePlanOption {
  id: number;
  planNo?: string;
  salesNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  status?: string;
  processRouteId?: number;
}

interface ProcessRouteOption {
  id: number;
  routeName: string;
  styleCode?: string;
}

interface JobFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

function buildJobNo() {
  return buildDocNo('JOB');
}

export default function JobForm({ initialValues, onSubmit, onCancel }: JobFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ProducePlanOption[]>([]);
  const [routes, setRoutes] = useState<ProcessRouteOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

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
      jobNo: buildJobNo(),
      producePlanId: '',
      salesNo: '',
      styleCode: '',
      colorCode: '',
      sizeCode: '',
      planQty: '',
      processRouteId: '',
      status: planStatus.options[0]?.value || '0',
      remark: '',
    });
  }, [initialValues, planStatus.options]);

  const selectedPlan = useMemo(
    () => plans.find((item) => String(item.id) === String(form.producePlanId || '')),
    [form.producePlanId, plans],
  );

  const filteredRoutes = useMemo(() => {
    if (!selectedPlan?.styleCode) {
      return routes;
    }
    const matched = routes.filter((item) => !item.styleCode || item.styleCode === selectedPlan.styleCode);
    return matched.length > 0 ? matched : routes;
  }, [routes, selectedPlan?.styleCode]);

  useEffect(() => {
    if (!selectedPlan) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedPlan.salesNo || '',
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
        jobNo: form.jobNo,
        producePlanId: Number(form.producePlanId),
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

      <DocumentCodeBoard
        title={t('page.job.form.codeBoard.title')}
        description={t('page.job.form.codeBoard.description')}
        items={[
          {
            label: t('page.job.form.codeBoard.items.jobNo.label'),
            value: form.jobNo,
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
      <ReadonlyField label={t('page.job.columns.styleCode')} value={form.styleCode} />
      <ReadonlyField label={t('page.job.columns.colorCode')} value={form.colorCode} />
      <ReadonlyField label={t('page.job.columns.sizeCode')} value={form.sizeCode} />
      <ReadonlyField label={t('page.job.columns.planQty')} value={form.planQty} />

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
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
      </div>

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
