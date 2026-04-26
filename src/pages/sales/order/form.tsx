import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDictOptions} from '@/hooks/useDictOptions';
import {isApprovalLocked} from '@/utils/approval';

interface SalesOrderFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function SalesOrderForm({initialValues, onSubmit, onCancel}: SalesOrderFormProps) {
  const {t} = useTranslation();
  const orderStatus = useDictOptions('sales_order_status');
  const [form, setForm] = useState({
    salesNo: '',
    customerName: '',
    styleCode: '',
    salesDate: '',
    dueDate: '',
    quantity: '',
    amount: '',
    remark: '',
  });
  const [loading, setLoading] = useState(false);
  const locked = isApprovalLocked(initialValues?.orderStatus, orderStatus.options);

  useEffect(() => {
    if (initialValues) {
      setForm({
        salesNo: initialValues.salesNo || '',
        customerName: initialValues.customerName || '',
        styleCode: initialValues.styleCode || '',
        salesDate: initialValues.salesDate || '',
        dueDate: initialValues.dueDate || '',
        quantity: String(initialValues.quantity || ''),
        amount: String(initialValues.amount || ''),
        remark: initialValues.remark || '',
      });
    } else {
      setForm({
        salesNo: '',
        customerName: '',
        styleCode: '',
        salesDate: '',
        dueDate: '',
        quantity: '',
        amount: '',
        remark: '',
      });
    }
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({label, name, type = 'text'}: { label: string; name: string; type?: string }) => (
    <div className="flex items-center gap-3">
      <label className="w-20 text-right text-sm text-slate-600">{label}</label>
      <input
        aria-label={label}
        type={type}
        value={(form as any)[name]}
        onChange={(event) => setForm((prev) => ({...prev, [name]: event.target.value}))}
        disabled={locked}
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {locked && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t('approval.lockedHint')}
        </div>
      )}
      <Field label={t('page.sales.columns.salesNo')} name="salesNo" />
      <Field label={t('page.sales.columns.customerName')} name="customerName" />
      <Field label={t('page.sales.columns.styleCode')} name="styleCode" />
      <Field label={t('page.sales.columns.salesDate')} name="salesDate" type="date" />
      <Field label={t('page.sales.columns.dueDate')} name="dueDate" type="date" />
      <Field label={t('page.sales.columns.quantity')} name="quantity" type="number" />
      <Field label={t('page.sales.columns.amount')} name="amount" type="number" />
      <div className="flex items-start gap-3">
        <label className="w-20 pt-2 text-right text-sm text-slate-600">{t('page.systemRole.columns.remark')}</label>
        <textarea
          aria-label={t('page.systemRole.columns.remark')}
          value={form.remark}
          onChange={(event) => setForm((prev) => ({...prev, remark: event.target.value}))}
          disabled={locked}
          className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
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
