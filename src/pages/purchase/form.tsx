import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as supplierApi from '@/api/supplier';
import { useDictOptions } from '@/hooks/useDictOptions';

interface SupplierOption {
  id: number;
  supplierName: string;
}

interface FieldProps {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

interface PurchaseFormProps {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function PurchaseForm({ initialValues, onSubmit, onCancel }: PurchaseFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const purchaseType = useDictOptions('erp_purchase_type', [
    { value: 'RAW', label: t('page.purchase.type.raw') },
    { value: 'AUX', label: t('page.purchase.type.auxiliary') },
    { value: 'FINISHED', label: t('page.purchase.type.finished') },
    { value: 'PACK', label: t('page.purchase.type.packaging') },
  ]);

  const purchaseStatus = useDictOptions('erp_purchase_status', [
    { value: '0', label: t('page.purchase.status.pending') },
    { value: '1', label: t('page.purchase.status.confirmed') },
    { value: '2', label: t('page.purchase.status.completed') },
    { value: '3', label: t('page.purchase.status.cancelled') },
  ]);

  useEffect(() => {
    supplierApi
      .listSupplier({ pageNum: 1, pageSize: 999 })
      .then((response: any) => {
        setSuppliers(response.rows || []);
      })
      .catch(() => {
        setSuppliers([]);
      });
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...(initialValues as Record<string, string>),
        supplierId: String((initialValues as any).supplierId ?? ''),
      });
    } else {
      setForm({
        status: purchaseStatus.options[0]?.value || '',
      });
    }
  }, [initialValues, purchaseStatus.options]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, required, type = 'text', options, children }: FieldProps) => (
    <div className="flex items-center gap-3">
      <label className="w-28 shrink-0 text-right text-sm text-slate-600">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}
      </label>
      {children || (
        type === 'select' ? (
          <select
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [name]: event.target.value }))}
            aria-label={label}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t('common.pleaseSelect')}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [name]: event.target.value }))}
            aria-label={label}
            className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        ) : (
          <input
            type={type}
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [name]: event.target.value }))}
            aria-label={label}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        )
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field name="sn" label={t('page.purchase.columns.sn')} required />
      <Field name="supplierId" label={t('page.purchase.columns.supplierName')} required>
        <select
          value={form.supplierId || ''}
          onChange={(event) => setForm((prev) => ({ ...prev, supplierId: event.target.value }))}
          aria-label={t('page.purchase.columns.supplierName')}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">{t('common.pleaseSelect')}</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplierName}
            </option>
          ))}
        </select>
      </Field>
      <Field name="type" label={t('page.purchase.columns.type')} required type="select" options={purchaseType.options} />
      <Field name="bulkOrderNo" label={t('page.purchase.columns.bulkOrderNo')} />
      <Field name="description" label={t('page.purchase.columns.description')} type="textarea" />
      <Field name="expectedDeliveryDate" label={t('page.purchase.columns.expectedDeliveryDate')} required type="date" />
      <Field name="confirmTime" label={t('page.purchase.form.confirmTime')} type="date" />
      <Field name="status" label={t('page.purchase.columns.status')} type="select" options={purchaseStatus.options} />
      <Field name="amount" label={t('page.purchase.columns.amount')} type="number" />
      <Field name="remark" label={t('page.purchase.form.remark')} type="textarea" />

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
