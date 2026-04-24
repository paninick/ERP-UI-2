import { useEffect, useMemo, useState } from 'react';
import * as salesApi from '@/api/sales';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildDocNo } from '@/utils/detailDraft';

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
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待排产' },
    { value: '1', label: '已排产' },
    { value: '2', label: '生产中' },
    { value: '3', label: '已完成' },
  ]);

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
      toast.error('请先选择销售订单，再生成生产计划。');
      return;
    }

    if (!form.styleCode || !form.planQty) {
      toast.error('销售订单未带出款号或计划数量，请先检查来源数据。');
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
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        计划单应从销售订单派生。选择销售订单后，款号和计划数量自动带出，避免重复维护。
      </div>

      <DocumentCodeBoard
        title="计划单展示规则"
        description="计划单以计划编号作为排产主号，销售单号作为来源号，款号和数量仅展示不重复造数。"
        items={[
          {
            label: '计划主号',
            value: form.planNo,
            helper: '排产、看板、车间调度使用。',
            tone: 'primary',
          },
          {
            label: '销售来源号',
            value: form.salesNo,
            helper: '来源锁定后不建议在计划层改挂单。',
            tone: 'secondary',
          },
          {
            label: '款号',
            value: form.styleCode,
            helper: '由销售订单带出。',
          },
          {
            label: '计划数量',
            value: form.planQty,
            helper: '默认继承订单数量，可按排产场景拆分。',
          },
        ]}
      />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          计划编号
        </label>
        <input
          value={form.planNo || ''}
          onChange={(event) => updateField('planNo', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="计划编号"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          销售订单
        </label>
        <select
          value={form.salesOrderId || ''}
          onChange={(event) => updateField('salesOrderId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="销售订单"
          disabled={Boolean(initialValues?.id)}
        >
          <option value="">请选择销售订单</option>
          {salesOrders.map((item) => (
            <option key={item.id} value={item.id}>
              {item.salesNo || item.id}
              {item.customerName ? ` - ${item.customerName}` : ''}
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <ReadonlyField label="销售单号" value={form.salesNo} />
      <ReadonlyField label="款号" value={form.styleCode} />
      <ReadonlyField label="订单数量" value={selectedOrder?.quantity != null ? String(selectedOrder.quantity) : ''} />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          计划数量
        </label>
        <input
          type="number"
          value={form.planQty || ''}
          onChange={(event) => updateField('planQty', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="计划数量"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">计划日期</label>
        <input
          type="date"
          value={form.planDate || ''}
          onChange={(event) => updateField('planDate', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="计划日期"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">状态</label>
        <select
          value={form.status || ''}
          onChange={(event) => updateField('status', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="状态"
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
        <label className="w-28 shrink-0 pt-2 text-right text-sm text-slate-600">备注</label>
        <textarea
          value={form.remark || ''}
          onChange={(event) => updateField('remark', event.target.value)}
          className="h-24 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="备注"
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
