import { useEffect, useMemo, useState } from 'react';
import * as processRouteApi from '@/api/processRoute';
import * as productionApi from '@/api/production';
import DocumentCodeBoard from '@/components/business/DocumentCodeBoard';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { buildDocNo } from '@/utils/detailDraft';

interface ProducePlanOption {
  id: number;
  planNo?: string;
  salesNo?: string;
  styleCode?: string;
  colorCode?: string;
  sizeCode?: string;
  planQty?: number;
  status?: string;
  processRouteId?: number;
}

interface ProcessRouteOption {
  id: number;
  routeName: string;
  styleCode?: string;
}

interface JobFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

function buildJobNo() {
  return buildDocNo('JOB');
}

export default function JobForm({ initialValues, onSubmit, onCancel }: JobFormProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ProducePlanOption[]>([]);
  const [routes, setRoutes] = useState<ProcessRouteOption[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
  ]);

  useEffect(() => {
    productionApi
      .listProducePlan({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        setPlans(res.rows || []);
      })
      .catch(() => setPlans([]));

    processRouteApi
      .listProcessRoute({ pageNum: 1, pageSize: 500 })
      .then((res: any) => {
        setRoutes(res.rows || []);
      })
      .catch(() => setRoutes([]));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        jobNo: String(initialValues.jobNo ?? ''),
        producePlanId: String(initialValues.producePlanId ?? ''),
        salesNo: String(initialValues.salesNo ?? ''),
        styleCode: String(initialValues.styleCode ?? ''),
        colorCode: String(initialValues.colorCode ?? ''),
        sizeCode: String(initialValues.sizeCode ?? ''),
        planQty: String(initialValues.planQty ?? ''),
        processRouteId: String(initialValues.processRouteId ?? ''),
        status: String(initialValues.status ?? '0'),
        remark: String(initialValues.remark ?? ''),
      });
      return;
    }

    setForm({
      jobNo: buildJobNo(),
      producePlanId: '',
      salesNo: '',
      styleCode: '',
      colorCode: '',
      sizeCode: '',
      planQty: '',
      processRouteId: '',
      status: planStatus.options[0]?.value || '0',
      remark: '',
    });
  }, [initialValues, planStatus.options]);

  const selectedPlan = useMemo(
    () => plans.find((item) => String(item.id) === String(form.producePlanId || '')),
    [form.producePlanId, plans],
  );

  const filteredRoutes = useMemo(() => {
    if (!selectedPlan?.styleCode) {
      return routes;
    }
    const matched = routes.filter((item) => !item.styleCode || item.styleCode === selectedPlan.styleCode);
    return matched.length > 0 ? matched : routes;
  }, [routes, selectedPlan?.styleCode]);

  useEffect(() => {
    if (!selectedPlan) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      salesNo: selectedPlan.salesNo || '',
      styleCode: selectedPlan.styleCode || '',
      colorCode: prev.colorCode || selectedPlan.colorCode || '',
      sizeCode: prev.sizeCode || selectedPlan.sizeCode || '',
      planQty: String(selectedPlan.planQty ?? ''),
      processRouteId: prev.processRouteId || (selectedPlan.processRouteId ? String(selectedPlan.processRouteId) : ''),
    }));
  }, [selectedPlan]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.producePlanId) {
      toast.error('请先选择生产计划，再创建生产工单。');
      return;
    }

    if (!form.styleCode || !form.planQty) {
      toast.error('生产计划未带出款号或数量，请先检查计划数据。');
      return;
    }

    if (!form.processRouteId) {
      toast.error('请为工单选择工艺路线。');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...initialValues,
        jobNo: form.jobNo,
        producePlanId: Number(form.producePlanId),
        salesNo: form.salesNo,
        styleCode: form.styleCode,
        colorCode: form.colorCode || undefined,
        sizeCode: form.sizeCode || undefined,
        planQty: Number(form.planQty),
        processRouteId: Number(form.processRouteId),
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
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        工单应从生产计划派生。销售来源、款号和计划数量由计划带出，现场不再重复维护。
      </div>

      <DocumentCodeBoard
        title="工单打印规则"
        description="车间流转卡和报工界面应以工单号为主，计划号和销售号只作为追溯辅助字段。"
        items={[
          {
            label: '工单主号',
            value: form.jobNo,
            helper: '现场报工、质检、流转卡建议用这个主号。',
            tone: 'primary',
          },
          {
            label: '计划来源号',
            value: selectedPlan?.planNo,
            helper: '用于追溯该工单来自哪张生产计划。',
            tone: 'secondary',
          },
          {
            label: '销售来源号',
            value: form.salesNo,
            helper: '客户交期、业务追单时使用。',
          },
          {
            label: '款号 / 数量',
            value: form.styleCode ? `${form.styleCode}${form.planQty ? ` / ${form.planQty}` : ''}` : '',
            helper: '打印时作为辅助字段，不替代工单主号。',
          },
        ]}
      />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          工单编号
        </label>
        <input
          value={form.jobNo || ''}
          onChange={(event) => updateField('jobNo', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="工单编号"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          生产计划
        </label>
        <select
          value={form.producePlanId || ''}
          onChange={(event) => updateField('producePlanId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="生产计划"
          disabled={Boolean(initialValues?.id)}
        >
          <option value="">请选择生产计划</option>
          {plans.map((item) => (
            <option key={item.id} value={item.id}>
              {item.planNo || item.id}
              {item.salesNo ? ` - ${item.salesNo}` : ''}
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
      </div>

      <ReadonlyField label="销售单号" value={form.salesNo} />
      <ReadonlyField label="款号" value={form.styleCode} />
      <ReadonlyField label="颜色" value={form.colorCode} />
      <ReadonlyField label="尺码" value={form.sizeCode} />
      <ReadonlyField label="计划数量" value={form.planQty} />

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>
          工艺路线
        </label>
        <select
          value={form.processRouteId || ''}
          onChange={(event) => updateField('processRouteId', event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          aria-label="工艺路线"
        >
          <option value="">请选择工艺路线</option>
          {filteredRoutes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.routeName}
              {item.styleCode ? ` - ${item.styleCode}` : ''}
            </option>
          ))}
        </select>
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
            .filter((item) => item.value !== '2')
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
