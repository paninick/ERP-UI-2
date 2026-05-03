import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, ClipboardCheck, ChevronDown } from 'lucide-react';
import * as api from '@/api/qcControlPlan';
import { toast } from '@/components/ui/Toast';

const PRODUCT_FAMILIES = [
  { value: 'SWEATER', label: '毛衫' },
  { value: 'SPLICE', label: '拼接款' },
  { value: 'KNIT_TOP', label: '普通针织衫' },
];

interface ControlPlan {
  id: number;
  planName: string;
  productFamily: string;
  status: string;
  remark?: string;
}

interface Characteristic {
  id?: number;
  planId: number;
  processId?: number;
  charName: string;
  specValue?: string;
  toleranceMin?: number;
  toleranceMax?: number;
  measurementMethod?: string;
  samplingRatio?: number;
  aqlLevel?: string;
  sortOrder?: number;
}

export default function ControlPlanPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<ControlPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<ControlPlan | null>(null);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCharForm, setShowCharForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<ControlPlan> | null>(null);
  const [editingChar, setEditingChar] = useState<Partial<Characteristic> | null>(null);

  const loadPlans = () => {
    api.listControlPlan({}).then((res: any) => {
      setPlans(Array.isArray(res?.rows) ? res.rows : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadPlans(); }, []);

  const loadCharacteristics = (planId: number) => {
    api.listCharacteristics(planId).then((res: any) => {
      setCharacteristics(Array.isArray(res?.data) ? res.data : []);
    });
  };

  const handleSelectPlan = (plan: ControlPlan) => {
    setSelectedPlan(plan);
    loadCharacteristics(plan.id);
  };

  const handleSavePlan = async () => {
    if (!editingPlan?.planName || !editingPlan?.productFamily) {
      toast.error('请填写计划名称和产品族');
      return;
    }
    try {
      if (editingPlan.id) {
        await api.updateControlPlan(editingPlan);
        toast.success('更新成功');
      } else {
        await api.addControlPlan(editingPlan);
        toast.success('创建成功');
      }
      setShowForm(false);
      setEditingPlan(null);
      loadPlans();
    } catch (e: any) { toast.error(e?.message || '保存失败'); }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('确认删除此控制计划？关联的关键特性将被一并删除。')) return;
    try {
      await api.delControlPlan(id);
      toast.success('已删除');
      if (selectedPlan?.id === id) { setSelectedPlan(null); setCharacteristics([]); }
      loadPlans();
    } catch (e: any) { toast.error(e?.message || '删除失败'); }
  };

  const handleSaveChar = async () => {
    if (!editingChar?.charName) { toast.error('请填写特性名称'); return; }
    if (!selectedPlan) { toast.error('请先选择控制计划'); return; }
    try {
      const data = { ...editingChar, planId: selectedPlan.id };
      if (editingChar.id) {
        await api.updateCharacteristic(data);
        toast.success('特性更新成功');
      } else {
        await api.addCharacteristic(data);
        toast.success('特性已添加');
      }
      setShowCharForm(false);
      setEditingChar(null);
      loadCharacteristics(selectedPlan.id);
    } catch (e: any) { toast.error(e?.message || '保存失败'); }
  };

  const handleDeleteChar = async (id: number) => {
    if (!confirm('确认删除此关键特性？')) return;
    try {
      await api.delCharacteristic(id);
      toast.success('已删除');
      if (selectedPlan) loadCharacteristics(selectedPlan.id);
    } catch (e: any) { toast.error(e?.message || '删除失败'); }
  };

  const familyLabel = (code: string) => PRODUCT_FAMILIES.find(f => f.value === code)?.label || code;

  if (loading) {
    return <div className="p-10 text-center text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">质量控制计划</h1>
        <button
          onClick={() => { setEditingPlan({ status: '0' }); setShowForm(true); }}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> 新建控制计划
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Plan list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">计划模板列表</h2>
          {plans.length === 0 ? (
            <p className="text-sm text-slate-400">暂无控制计划，请新建。</p>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                    selectedPlan?.id === plan.id
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{plan.planName}</p>
                      <p className="text-xs text-slate-500">{familyLabel(plan.productFamily)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        plan.status === '0' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {plan.status === '0' ? '启用' : '停用'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); setShowForm(true); }}
                        className="rounded p-1 text-slate-400 hover:text-indigo-600"
                      ><Edit size={14} /></button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                        className="rounded p-1 text-slate-400 hover:text-red-600"
                      ><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Characteristics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {selectedPlan ? `关键特性 — ${selectedPlan.planName}` : '请选择一个控制计划'}
            </h2>
            {selectedPlan && (
              <button
                onClick={() => { setEditingChar({ sortOrder: characteristics.length + 1 }); setShowCharForm(true); }}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
              >
                <Plus size={14} /> 添加特性
              </button>
            )}
          </div>

          {!selectedPlan ? (
            <p className="text-sm text-slate-400">请从左侧列表选择控制计划查看其关键特性。</p>
          ) : characteristics.length === 0 ? (
            <p className="text-sm text-slate-400">暂无关键特性，请添加。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-2">特性名称</th>
                    <th className="pb-2 pr-2">规格值</th>
                    <th className="pb-2 pr-2">公差</th>
                    <th className="pb-2 pr-2">测量方法</th>
                    <th className="pb-2 pr-2">抽样%</th>
                    <th className="pb-2 pr-2">AQL</th>
                    <th className="pb-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {characteristics.map((c, idx) => (
                    <tr key={c.id || idx} className="border-b border-slate-100">
                      <td className="py-2 pr-2 text-slate-400">{c.sortOrder || idx + 1}</td>
                      <td className="py-2 pr-2 font-medium text-slate-800">{c.charName}</td>
                      <td className="py-2 pr-2">{c.specValue || '-'}</td>
                      <td className="py-2 pr-2">
                        {c.toleranceMin != null || c.toleranceMax != null
                          ? `${c.toleranceMin ?? '-'} ~ ${c.toleranceMax ?? '-'}`
                          : '-'}
                      </td>
                      <td className="py-2 pr-2">{c.measurementMethod || '-'}</td>
                      <td className="py-2 pr-2">{c.samplingRatio != null ? `${c.samplingRatio}%` : '-'}</td>
                      <td className="py-2 pr-2">{c.aqlLevel || '-'}</td>
                      <td className="py-2">
                        <button onClick={() => { setEditingChar(c); setShowCharForm(true); }}
                          className="mr-1 text-slate-400 hover:text-indigo-600"><Edit size={13} /></button>
                        <button onClick={() => c.id && handleDeleteChar(c.id)}
                          className="text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Plan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowForm(false); setEditingPlan(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingPlan?.id ? '编辑控制计划' : '新建控制计划'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">计划名称</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingPlan?.planName || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, planName: e.target.value })}
                  placeholder="如：毛衫品类质量控制计划"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">产品族</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingPlan?.productFamily || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, productFamily: e.target.value })}
                >
                  <option value="">请选择</option>
                  {PRODUCT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">备注</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingPlan?.remark || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, remark: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setEditingPlan(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
              <button onClick={handleSavePlan}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Characteristic Form Modal */}
      {showCharForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowCharForm(false); setEditingChar(null); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingChar?.id ? '编辑关键特性' : '添加关键特性'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">特性名称 *</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.charName || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, charName: e.target.value })}
                  placeholder="如：领口尺寸" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">规格值</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.specValue || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, specValue: e.target.value })}
                  placeholder="如：±0.5cm" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">AQL水准</label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.aqlLevel || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, aqlLevel: e.target.value })}>
                  <option value="">-</option>
                  <option value="1.0">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.5">2.5</option>
                  <option value="4.0">4.0</option>
                  <option value="6.5">6.5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">下公差</label>
                <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.toleranceMin ?? ''}
                  onChange={(e) => setEditingChar({ ...editingChar, toleranceMin: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">上公差</label>
                <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.toleranceMax ?? ''}
                  onChange={(e) => setEditingChar({ ...editingChar, toleranceMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">测量方法</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.measurementMethod || ''}
                  onChange={(e) => setEditingChar({ ...editingChar, measurementMethod: e.target.value })}
                  placeholder="如：卡尺" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">抽样比例(%)</label>
                <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.samplingRatio ?? ''}
                  onChange={(e) => setEditingChar({ ...editingChar, samplingRatio: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">排序号</label>
                <input type="number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={editingChar?.sortOrder ?? ''}
                  onChange={(e) => setEditingChar({ ...editingChar, sortOrder: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowCharForm(false); setEditingChar(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
              <button onClick={handleSaveChar}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
