import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isApprovalLocked } from '@/utils/approval';

interface SalesOrderFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

type SalesOrderFormState = {
  salesNo: string;
  customerName: string;
  bulkOrderNo: string;
  sampleStyleNo: string;
  styleCode: string;
  styleCategory: string;
  sampleNo: string;
  salesName: string;
  salesDate: string;
  dueDate: string;
  quantity: string;
  amount: string;
  salesType: string;
  orderStatus: string;
  bulkOpinion: string;
  productionExceed: string;
  japanOrderNo: string;
  exportDeclareType: string;
  tradeTerms: string;
  colorConfirmed: string;
  colorConfirmDate: string;
  remark: string;
};

const EMPTY_FORM: SalesOrderFormState = {
  salesNo: '',
  customerName: '',
  bulkOrderNo: '',
  sampleStyleNo: '',
  styleCode: '',
  styleCategory: '',
  sampleNo: '',
  salesName: '',
  salesDate: '',
  dueDate: '',
  quantity: '',
  amount: '',
  salesType: '',
  orderStatus: '',
  bulkOpinion: '',
  productionExceed: '',
  japanOrderNo: '',
  exportDeclareType: '',
  tradeTerms: '',
  colorConfirmed: '',
  colorConfirmDate: '',
  remark: '',
};

function normalizeDate(value: any) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
}

export default function SalesOrderForm({ initialValues, onSubmit, onCancel }: SalesOrderFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<SalesOrderFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const locked = isApprovalLocked(initialValues?.auditStatus);

  useEffect(() => {
    if (initialValues) {
      setForm({
        salesNo: initialValues.salesNo || '',
        customerName: initialValues.customerName || '',
        bulkOrderNo: initialValues.bulkOrderNo || '',
        sampleStyleNo: initialValues.sampleStyleNo || '',
        styleCode: initialValues.styleCode || '',
        styleCategory: initialValues.styleCategory || '',
        sampleNo: initialValues.sampleNo || '',
        salesName: initialValues.salesName || '',
        salesDate: normalizeDate(initialValues.salesDate),
        dueDate: normalizeDate(initialValues.dueDate),
        quantity: initialValues.quantity != null ? String(initialValues.quantity) : '',
        amount: initialValues.amount != null ? String(initialValues.amount) : '',
        salesType: initialValues.salesType || '',
        orderStatus: initialValues.orderStatus || '',
        bulkOpinion: initialValues.bulkOpinion || '',
        productionExceed: initialValues.productionExceed || '',
        japanOrderNo: initialValues.japanOrderNo || '',
        exportDeclareType: initialValues.exportDeclareType || '',
        tradeTerms: initialValues.tradeTerms || '',
        colorConfirmed: initialValues.colorConfirmed || '',
        colorConfirmDate: normalizeDate(initialValues.colorConfirmDate),
        remark: initialValues.remark || '',
      });
      return;
    }
    setForm(EMPTY_FORM);
  }, [initialValues]);

  const setField = (name: keyof SalesOrderFormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        colorConfirmDate: form.colorConfirmDate || undefined,
        salesDate: form.salesDate || undefined,
        dueDate: form.dueDate || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClassName = 'text-sm font-medium text-slate-700';
  const inputClassName = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400';
  const textareaClassName = 'h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400';

  const Field = ({
    label,
    name,
    type = 'text',
    placeholder,
  }: {
    label: string;
    name: keyof SalesOrderFormState;
    type?: string;
    placeholder?: string;
  }) => (
    <label className="space-y-2">
      <span className={labelClassName}>{label}</span>
      <input
        aria-label={label}
        type={type}
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        disabled={locked}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  );

  const SelectField = ({
    label,
    name,
    options,
  }: {
    label: string;
    name: keyof SalesOrderFormState;
    options: Array<{ value: string; label: string }>;
  }) => (
    <label className="space-y-2">
      <span className={labelClassName}>{label}</span>
      <select
        aria-label={label}
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        disabled={locked}
        className={inputClassName}
      >
        <option value="">{t('common.pleaseSelect')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {locked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t('approval.lockedHint')}
        </div>
      )}

      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-slate-50 px-5 py-4">
        <p className="text-base font-semibold text-slate-900">{t('page.sales.form.quickTitle')}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('page.sales.form.quickHint')}
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.sales.form.sections.orderSource')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.sales.form.sectionHints.orderSource')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('page.sales.columns.salesNo')} name="salesNo" placeholder={t('page.sales.placeholders.salesNo')} />
          <Field label={t('page.sales.columns.customerName')} name="customerName" placeholder={t('page.sales.placeholders.customerName')} />
          <Field label={t('page.sales.form.fields.bulkOrderNo')} name="bulkOrderNo" />
          <Field label={t('page.sales.form.fields.sampleStyleNo')} name="sampleStyleNo" />
          <Field label={t('page.sales.columns.styleCode')} name="styleCode" />
          <Field label={t('page.sales.form.fields.styleCategory')} name="styleCategory" />
          <Field label={t('page.sales.form.fields.sampleNo')} name="sampleNo" />
          <Field label={t('page.sales.form.fields.salesName')} name="salesName" />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.sales.form.sections.deliveryCommercial')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.sales.form.sectionHints.deliveryCommercial')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('page.sales.columns.orderDate')} name="salesDate" type="date" />
          <Field label={t('page.sales.columns.deliveryDate')} name="dueDate" type="date" />
          <Field label={t('page.sales.columns.quantity')} name="quantity" type="number" />
          <Field label={t('page.sales.columns.amount')} name="amount" type="number" />
          <Field label={t('page.sales.form.fields.japanOrderNo')} name="japanOrderNo" />
          <Field label={t('page.sales.form.fields.tradeTerms')} name="tradeTerms" />
          <Field label={t('page.sales.form.fields.exportDeclareType')} name="exportDeclareType" />
          <Field label={t('page.sales.form.fields.orderStatus')} name="orderStatus" />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.sales.form.sections.productionRisk')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.sales.form.sectionHints.productionRisk')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label={t('page.sales.form.fields.salesType')}
            name="salesType"
            options={[
              { value: 'SAMPLE', label: t('page.sales.form.options.salesType.sample') },
              { value: 'BULK', label: t('page.sales.form.options.salesType.bulk') },
              { value: 'DEVELOP', label: t('page.sales.form.options.salesType.develop') },
            ]}
          />
          <SelectField
            label={t('page.sales.form.fields.colorConfirmed')}
            name="colorConfirmed"
            options={[
              { value: 'Y', label: t('page.sales.form.options.boolean.yes') },
              { value: 'N', label: t('page.sales.form.options.boolean.no') },
            ]}
          />
          <Field label={t('page.sales.form.fields.colorConfirmDate')} name="colorConfirmDate" type="date" />
          <SelectField
            label={t('page.sales.form.fields.productionExceed')}
            name="productionExceed"
            options={[
              { value: 'Y', label: t('page.sales.form.options.boolean.yes') },
              { value: 'N', label: t('page.sales.form.options.boolean.no') },
            ]}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.sales.form.sections.customerNotes')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.sales.form.sectionHints.customerNotes')}</p>
        </div>
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className={labelClassName}>{t('page.sales.form.fields.bulkOpinion')}</span>
            <textarea
              aria-label={t('page.sales.form.fields.bulkOpinion')}
              value={form.bulkOpinion}
              onChange={(event) => setField('bulkOpinion', event.target.value)}
              disabled={locked}
              className={textareaClassName}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClassName}>{t('page.sales.form.fields.remark')}</span>
            <textarea
              aria-label={t('page.sales.form.fields.remark')}
              value={form.remark}
              onChange={(event) => setField('remark', event.target.value)}
              disabled={locked}
              placeholder={t('page.sales.form.placeholders.remark')}
              className={textareaClassName}
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading || locked}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </button>
      </div>
    </form>
  );
}
