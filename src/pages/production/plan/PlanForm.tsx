import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as salesApi from '@/api/sales';
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
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.plan.form.status.pending') },
    { value: '1', label: t('page.plan.form.status.scheduled') },
    { value: '2', label: t('page.plan.form.status.running') },
    { value: '3', label: t('page.plan.form.status.completed') },
  ]);
  const locked = isApprovalLocked(initialValues?.status, planStatus.options);

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
    if (initialValues) {
      setForm({
        planNo: String(initialValues.planNo ?? ''),
        salesOrderId: String(initialValues.salesOrderId ?? initialValues.orderId ?? ''),
        salesNo: String(initialValues.salesNo ?? ''),
        styleCode: String(initialValues.styleCode ?? ''),
        planQty: String(initialValues.planQty ?? ''),
        planDate: String(initialValues.planDate ?? ''),
        status: String(initialValues.status ?? '0'),
        remark: String(initialValues.remark ?? ''),
      });
      return;
    }

    setForm({
      planNo: buildPlanNo(),
      salesOrderId: '',
      salesNo: '',
      styleCode: '',
      planQty: '',
      planDate: new Date().toISOString().slice(0, 10),
      status: planStatus.options[0]?.value || '0',
      remark: '',
    });
  }, [initialValues, planStatus.options]);

  const selectedOrder = useMemo(
    () => salesOrders.find((item) => String(item.id) === String(form.salesOrderId || '')),
    [form.salesOrderId, salesOrders],
  );

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedOrder.salesNo || '',
      styleCode: selectedOrder.styleCode || '',
      planQty: prev.planQty || String(selectedOrder.quantity ?? ''),
      remark: prev.remark || selectedOrder.remark || '',
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
        planQty: Number(form.planQty),
        planDate: form.planDate || undefined,
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
      {locked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t('approval.lockedHint')}
        </div>
      )}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {t('page.plan.form.banner')}
      </div>

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
            label: t('page.plan.form.codeBoard.items.planQty.label'),
            value: form.planQty,
            helper: t('page.plan.form.codeBoard.items.planQty.helper'),
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
          value={form.status || ''}
          onChange={(event) => updateField('status', event.target.value)}
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
