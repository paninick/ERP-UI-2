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

interface PurchaseFormProps {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function PurchaseForm({ initialValues, onSubmit, onCancel }: PurchaseFormProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const purchaseType = useDictOptions('erp_purchase_type', [
    { value: '原材料', label: '原材料' },
    { value: '辅料', label: '辅料' },
    { value: '成品', label: '成品' },
    { value: '包材', label: '包材' },
  ]);

  const purchaseStatus = useDictOptions('erp_purchase_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
    { value: '待确认', label: '待确认' },
    { value: '已确认', label: '已确认' },
    { value: '已完成', label: '已完成' },
    { value: '已取消', label: '已取消' },
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
      <Field name="sn" label="采购单号" required />
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
      <Field name="type" label="采购类型" required type="select" options={purchaseType.options} />
      <Field name="bulkOrderNo" label="大货订单号" />
      <Field name="description" label="采购说明" type="textarea" />
      <Field name="expectedDeliveryDate" label="预计交期" required type="date" />
      <Field name="confirmTime" label="确认日期" type="date" />
      <Field name="status" label="状态" type="select" options={purchaseStatus.options} />
      <Field name="amount" label="金额" type="number" />
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
