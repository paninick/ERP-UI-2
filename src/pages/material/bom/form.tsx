import {useEffect, useState} from 'react';
import * as customerApi from '@/api/customer';
import {useDictOptions} from '@/hooks/useDictOptions';

interface BomFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function BomForm({initialValues, onSubmit, onCancel}: BomFormProps) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const sampleTypeOptions = useDictOptions('erp_sample_type').options;
  const styleTypeOptions = useDictOptions('erp_sample_style').options;
  const categoryOptions = useDictOptions('erp_sample_category').options;
  const auditStatusOptions = useDictOptions('erp_sample_audit_status').options;
  const progressOptions = useDictOptions('erp_sample_task_status').options;

  useEffect(() => {
    customerApi.listCustomer({pageNum: 1, pageSize: 999}).then((response: any) => {
      setCustomers(response.rows || []);
    }).catch(() => {
      setCustomers([]);
    });
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialValues,
        customerId: String(initialValues.customerId ?? ''),
        salesOrderId: String(initialValues.salesOrderId ?? ''),
      });
    } else {
      setForm({});
    }
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        customerId: form.customerId ? Number(form.customerId) : undefined,
        salesOrderId: form.salesOrderId ? Number(form.salesOrderId) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({name, label, required, type = 'text', options, children}: any) => (
    <div className="flex items-center gap-3">
      <label className="w-28 shrink-0 text-right text-sm text-slate-600">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}
      </label>
      {children || (
        type === 'select' ? (
          <select
            aria-label={label}
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({...prev, [name]: event.target.value}))}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">请选择</option>
            {options?.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            aria-label={label}
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({...prev, [name]: event.target.value}))}
            className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        ) : (
          <input
            aria-label={label}
            type={type}
            value={form[name] || ''}
            onChange={(event) => setForm((prev) => ({...prev, [name]: event.target.value}))}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        )
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field name="sampleNo" label="BOM 编号" />
      <Field name="customerId" label="客户" required>
        <select
          aria-label="客户"
          value={form.customerId || ''}
          onChange={(event) => setForm((prev) => ({...prev, customerId: event.target.value}))}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">请选择客户</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.customerName}</option>
          ))}
        </select>
      </Field>
      <Field name="styleCode" label="款号" />
      <Field name="bulkOrderNo" label="大货订单号" />
      <Field name="sampleType" label="打样类型" required type="select" options={sampleTypeOptions} />
      <Field name="styleType" label="款式大类" required type="select" options={styleTypeOptions} />
      <Field name="sampleCategoryType" label="样品类型" required type="select" options={categoryOptions} />
      <Field name="dueDate" label="交期" required type="date" />
      <Field name="salesName" label="业务员" />
      <Field name="auditStatus" label="审批状态" type="select" options={auditStatusOptions} />
      <Field name="progressStatus" label="进行状态" type="select" options={progressOptions} />
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
