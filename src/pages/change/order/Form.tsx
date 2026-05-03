import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import * as changeApi from '@/api/change';

const CHANGE_TYPES = [
  { value: 'QTY_CHANGE', label: '数量变更' },
  { value: 'COLOR_SIZE_CHANGE', label: '颜色/尺码变更' },
  { value: 'DELIVERY_CHANGE', label: '交期变更' },
  { value: 'PROCESS_BOM_CHANGE', label: '工艺/BOM变更' },
  { value: 'FACTORY_LINE_CHANGE', label: '执行工厂/产线变更' },
  { value: 'INSERT_ORDER', label: '插单' },
  { value: 'COPY_ORDER', label: '翻单复制' },
];

const SOURCE_DOC_TYPES = [
  { value: 'SALES_ORDER', label: '销售订单' },
  { value: 'PRODUCE_PLAN', label: '生产计划' },
  { value: 'BOM', label: 'BOM/技术单' },
];

interface ChangeOrderFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function ChangeOrderForm({ initialValues, onSubmit, onCancel }: ChangeOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const isEdit = Boolean(initialValues?.id);

  useEffect(() => {
    if (initialValues) {
      setForm({
        changeNo: String(initialValues.changeNo ?? ''),
        changeType: String(initialValues.changeType ?? ''),
        sourceDocType: String(initialValues.sourceDocType ?? ''),
        sourceDocId: String(initialValues.sourceDocId ?? ''),
        sourceDocNo: String(initialValues.sourceDocNo ?? ''),
        oldVersion: String(initialValues.oldVersion ?? '1'),
        changeReason: String(initialValues.changeReason ?? ''),
        remark: String(initialValues.remark ?? ''),
      });
    } else {
      changeApi.generateChangeNo().then((res: any) => {
        setForm((prev) => ({ ...prev, changeNo: res.data ?? '' }));
      }).catch(() => {});
      setForm({
        changeNo: '',
        changeType: '',
        sourceDocType: 'SALES_ORDER',
        sourceDocId: '',
        sourceDocNo: '',
        oldVersion: '1',
        changeReason: '',
        remark: '',
      });
    }
  }, [initialValues]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.changeType) {
      toast.error('请选择变更类型');
      return;
    }
    if (!form.sourceDocId) {
      toast.error('请填写来源单据ID');
      return;
    }
    if (!form.changeReason) {
      toast.error('请填写变更原因');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...initialValues,
        changeNo: form.changeNo,
        changeType: form.changeType,
        sourceDocType: form.sourceDocType,
        sourceDocId: form.sourceDocId ? Number(form.sourceDocId) : undefined,
        sourceDocNo: form.sourceDocNo || undefined,
        oldVersion: form.oldVersion ? Number(form.oldVersion) : 1,
        newVersion: form.oldVersion ? Number(form.oldVersion) + 1 : 2,
        changeReason: form.changeReason,
        remark: form.remark || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">变更单号</label>
        <input
          value={form.changeNo || ''}
          disabled
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>变更类型
        </label>
        <select
          value={form.changeType || ''}
          onChange={(event) => updateField('changeType', event.target.value)}
          disabled={isEdit}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">请选择变更类型</option>
          {CHANGE_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>来源单据类型
        </label>
        <select
          value={form.sourceDocType || ''}
          onChange={(event) => updateField('sourceDocType', event.target.value)}
          disabled={isEdit}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          {SOURCE_DOC_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>来源单据ID
        </label>
        <input
          type="number"
          value={form.sourceDocId || ''}
          onChange={(event) => updateField('sourceDocId', event.target.value)}
          disabled={isEdit}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">来源单据号</label>
        <input
          value={form.sourceDocNo || ''}
          onChange={(event) => updateField('sourceDocNo', event.target.value)}
          disabled={isEdit}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">原版本</label>
        <input
          type="number"
          value={form.oldVersion || ''}
          onChange={(event) => updateField('oldVersion', event.target.value)}
          disabled={isEdit}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex items-start gap-3">
        <label className="w-28 shrink-0 text-right text-sm text-slate-600">
          <span className="mr-1 text-red-500">*</span>变更原因
        </label>
        <textarea
          value={form.changeReason || ''}
          onChange={(event) => updateField('changeReason', event.target.value)}
          className="h-24 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex items-start gap-3">
        <label className="w-28 shrink-0 pt-2 text-right text-sm text-slate-600">备注</label>
        <textarea
          value={form.remark || ''}
          onChange={(event) => updateField('remark', event.target.value)}
          className="h-24 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
          取消
        </button>
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? '提交中...' : '确认'}
        </button>
      </div>
    </form>
  );
}
