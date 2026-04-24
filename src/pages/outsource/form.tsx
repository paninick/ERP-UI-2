import { useEffect, useState } from 'react';
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

interface OutsourceFormProps {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function OutsourceForm({ initialValues, onSubmit, onCancel }: OutsourceFormProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
    { value: '2', label: '生产中' },
    { value: '3', label: '已完成' },
    { value: '4', label: '已取消' },
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
        ...initialValues,
        supplierId: String(initialValues.supplierId ?? ''),
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
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">请选择</option>
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
      <Field name="outsourceNo" label="外协单号" required />
      <Field name="supplierId" label="供应商" required>
        <select
          value={form.supplierId || ''}
          onChange={(event) => setForm((prev) => ({ ...prev, supplierId: event.target.value }))}
          aria-label="供应商"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">请选择供应商</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplierName}
            </option>
          ))}
        </select>
      </Field>
      <Field name="jobNo" label="工单编号" />
      <Field name="processName" label="工序" />
      <Field name="styleCode" label="款号" />
      <Field name="quantity" label="数量" type="number" required />
      <Field name="unitPrice" label="单价" type="number" />
      <Field name="expectedDate" label="预计交期" type="date" />
      <Field name="status" label="状态" type="select" options={processStatus.options} />
      <Field name="remark" label="备注" type="textarea" />

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '提交中...' : '确定'}
        </button>
      </div>
    </form>
  );
}
