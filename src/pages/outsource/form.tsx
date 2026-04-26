import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as supplierApi from '@/api/supplier';
import { useDictOptions } from '@/hooks/useDictOptions';
import { isApprovalLocked } from '@/utils/approval';

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

interface OutsourceFormProps {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function OutsourceForm({ initialValues, onSubmit, onCancel }: OutsourceFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: t('page.outsource.status.pending') },
    { value: '1', label: t('page.outsource.status.confirmed') },
    { value: '2', label: t('page.outsource.status.running') },
    { value: '3', label: t('page.outsource.status.completed') },
    { value: '4', label: t('page.outsource.status.cancelled') },
  ]);
  const locked = isApprovalLocked(initialValues?.status, processStatus.options);

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
        status: processStatus.options[0]?.value || '',
      });
    }
  }, [initialValues, processStatus.options]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
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
            disabled={locked || name === 'status'}
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
            disabled={locked}
            className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        ) : (
          <input
            type={type}
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, [name]: event.target.value }))}
            aria-label={label}
            disabled={locked}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        )
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {locked && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          当前外协单已提交或已确认，如需修改请先驳回。
        </div>
      )}
      <Field name="outsourceNo" label={t('page.outsource.columns.outsourceNo')} required />
      <Field name="supplierId" label={t('page.outsource.columns.supplierName')} required>
        <select
          value={form.supplierId || ''}
          onChange={(event) => setForm((prev) => ({ ...prev, supplierId: event.target.value }))}
          aria-label={t('page.outsource.columns.supplierName')}
          disabled={locked}
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
      <Field name="jobNo" label={t('page.outsource.columns.jobNo')} />
      <Field name="processName" label={t('page.outsource.columns.processName')} />
      <Field name="styleCode" label={t('page.outsource.columns.styleCode')} />
      <Field name="quantity" label={t('page.outsource.columns.quantity')} type="number" required />
      <Field name="unitPrice" label={t('page.outsource.columns.unitPrice')} type="number" />
      <Field name="expectedDate" label={t('page.outsource.columns.expectedDate')} type="date" />
      <Field name="status" label={t('page.outsource.columns.status')} type="select" options={processStatus.options} />
      <Field name="remark" label={t('page.outsource.form.remark')} type="textarea" />

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
