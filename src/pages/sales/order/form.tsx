import {useEffect, useState} from 'react';

interface SalesOrderFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function SalesOrderForm({initialValues, onSubmit, onCancel}: SalesOrderFormProps) {
  const [form, setForm] = useState({
    salesNo: '',
    customerName: '',
    styleCode: '',
    orderDate: '',
    deliveryDate: '',
    quantity: '',
    amount: '',
    remark: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({
        salesNo: initialValues.salesNo || '',
        customerName: initialValues.customerName || '',
        styleCode: initialValues.styleCode || '',
        orderDate: initialValues.orderDate || '',
        deliveryDate: initialValues.deliveryDate || '',
        quantity: String(initialValues.quantity || ''),
        amount: String(initialValues.amount || ''),
        remark: initialValues.remark || '',
      });
    } else {
      setForm({
        salesNo: '',
        customerName: '',
        styleCode: '',
        orderDate: '',
        deliveryDate: '',
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
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="订单编号" name="salesNo" />
      <Field label="客户名称" name="customerName" />
      <Field label="款号" name="styleCode" />
      <Field label="订单日期" name="orderDate" type="date" />
      <Field label="交付日期" name="deliveryDate" type="date" />
      <Field label="数量" name="quantity" type="number" />
      <Field label="金额" name="amount" type="number" />
      <div className="flex items-start gap-3">
        <label className="w-20 pt-2 text-right text-sm text-slate-600">备注</label>
        <textarea
          aria-label="订单备注"
          value={form.remark}
          onChange={(event) => setForm((prev) => ({...prev, remark: event.target.value}))}
          className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>
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
