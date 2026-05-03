import { useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, CalendarRange, Layers3, Package, ScrollText } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/planMaterial';
import * as bomApi from '@/api/bom';
import * as productionApi from '@/api/production';
import * as salesOrderItemApi from '@/api/salesOrderItem';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';

type ProducePlan = {
  id: number;
  planNo?: string;
  styleCode?: string;
  sampleStyleNo?: string;
  bulkOrderNo?: string;
  customerName?: string;
  planQty?: number | string;
  srcBillNo?: string;
  srcBillType?: string;
  salesOrderId?: number | string;
};

type PersistedMaterialLine = {
  id: number;
  materialType?: string;
  materialId?: number | string;
  color?: string;
  unitConsumption?: number | string;
  lossType?: string;
  wastage?: number | string;
  planQuantity?: number | string;
  totalQuantity?: number | string;
  materialStatus?: string;
  inventoryStatus?: string;
  remark?: string;
};

type SalesOrderItemLine = {
  id: number;
  color?: string;
};

type BomHeader = {
  id: number;
  sampleNo?: string;
  styleCode?: string;
  customerName?: string;
  bulkOrderNo?: string;
};

type EffectiveMaterialLine = {
  id: string | number;
  source: 'persisted' | 'derived';
  materialType: string;
  materialName: string;
  colorScope: string;
  unitConsumption: string;
  wastage: string;
  requiredQty: string;
  unit: string;
  sourceLabel: string;
  materialStatus: string;
  inventoryStatus: string;
  remark: string;
};

function renderText(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '-';
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function renderNumber(value: unknown) {
  const num = toNumber(value);
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function renderMaterialType(value: unknown) {
  const text = String(value ?? '').trim();
  if (text === '1' || text.includes('主')) return '主料';
  if (text === '2' || text.includes('辅')) return '辅料';
  return text || '待分类';
}

function renderPersistedMaterialName(item: PersistedMaterialLine) {
  if (item.remark) {
    return item.remark;
  }
  if (item.materialId) {
    return `物料#${item.materialId}`;
  }
  return `${renderMaterialType(item.materialType)}待命名`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function PlanMaterial() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const planId = Number(searchParams.get('planId') || 0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ProducePlan | null>(null);
  const [persistedLines, setPersistedLines] = useState<PersistedMaterialLine[]>([]);
  const [salesItems, setSalesItems] = useState<SalesOrderItemLine[]>([]);
  const [matchedBom, setMatchedBom] = useState<BomHeader | null>(null);
  const pageApi = {
    list: api.listPlanMaterial,
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!Number.isFinite(planId) || planId <= 0) {
        setPlan(null);
        setPersistedLines([]);
        setSalesItems([]);
        setMatchedBom(null);
        return;
      }

      setLoading(true);
      try {
        const planRes: any = await productionApi.getProducePlan(planId);
        const nextPlan = unwrapAjaxResultData<ProducePlan>(planRes);
        const [persistedRes, salesItemsRes, bomRes] = await Promise.all([
          api.listPlanMaterial({ planId, pageNum: 1, pageSize: 500 }).catch(() => ({ rows: [] })),
          nextPlan?.salesOrderId
            ? salesOrderItemApi.listSalesOrderItem({ salesOrderId: nextPlan.salesOrderId, pageNum: 1, pageSize: 500 }).catch(() => ({ rows: [] }))
            : Promise.resolve({ rows: [] }),
          nextPlan?.styleCode
            ? bomApi.listBom({ styleCode: nextPlan.styleCode, customerName: nextPlan.customerName || '', pageNum: 1, pageSize: 20 }).catch(() => ({ rows: [] }))
            : Promise.resolve({ rows: [] }),
        ]);

        if (!mounted) {
          return;
        }

        const bomRows = bomRes?.rows || [];
        const exactBom =
          bomRows.find((item: BomHeader) => item.styleCode === nextPlan?.styleCode && (!nextPlan?.customerName || item.customerName === nextPlan.customerName))
          || bomRows[0]
          || null;

        setPlan(nextPlan);
        setPersistedLines(persistedRes?.rows || []);
        setSalesItems(salesItemsRes?.rows || []);
        setMatchedBom(exactBom);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [planId]);

  const initialSearchParams = useMemo(
    () => ({
      planId: searchParams.get('planId') || '',
    }),
    [searchParams],
  );

  const effectiveLines = useMemo<EffectiveMaterialLine[]>(() => {
    if (persistedLines.length > 0) {
      return persistedLines.map((item) => ({
        id: item.id,
        source: 'persisted',
        materialType: renderMaterialType(item.materialType),
        materialName: renderPersistedMaterialName(item),
        colorScope: renderText(item.color),
        unitConsumption: item.unitConsumption != null ? renderNumber(item.unitConsumption) : '-',
        wastage: item.wastage != null ? renderNumber(item.wastage) : '-',
        requiredQty: renderNumber(item.totalQuantity),
        unit: '默认单位',
        sourceLabel: '正式明细',
        materialStatus: renderText(item.materialStatus),
        inventoryStatus: renderText(item.inventoryStatus),
        remark: item.remark || '已保存到计划用料明细表，可继续流向采购、入库和领料。',
      }));
    }

    if (!plan) {
      return [];
    }

    const colors = Array.from(new Set(salesItems.map((item) => renderText(item.color)).filter((item) => item !== '-')));
    const colorScope = colors.length > 0 ? colors.join(' / ') : '全色组待拆分';
    const sourceBill = renderText(plan.srcBillNo || plan.srcBillType);
    const bomHint = matchedBom ? `已匹配样衣BOM ${matchedBom.sampleNo || matchedBom.styleCode || matchedBom.id}` : '暂未匹配到上游BOM主表';
    const planQtyText = renderNumber(plan.planQty);

    return [
      {
        id: 'derived-main-material',
        source: 'derived',
        materialType: '主料',
        materialName: matchedBom ? '主料需求待从样衣BOM结构化' : '主料需求待技术/BOM建立',
        colorScope,
        unitConsumption: '待维护',
        wastage: '待维护',
        requiredQty: planQtyText,
        unit: '件基准',
        sourceLabel: '系统推导',
        materialStatus: matchedBom ? '已有上游BOM主表' : '待建立上游BOM',
        inventoryStatus: '未校验库存',
        remark: `${bomHint}；当前先以计划数量 ${planQtyText} 形成主料计划占位，待技术/BOM补结构化材料行后再替换为正式明细。来源单据：${sourceBill}。`,
      },
      {
        id: 'derived-aux-material',
        source: 'derived',
        materialType: '辅料',
        materialName: matchedBom ? '辅料需求待从样衣BOM结构化' : '辅料需求待技术/BOM建立',
        colorScope,
        unitConsumption: '待维护',
        wastage: '待维护',
        requiredQty: planQtyText,
        unit: '件基准',
        sourceLabel: '系统推导',
        materialStatus: matchedBom ? '已有上游BOM主表' : '待建立上游BOM',
        inventoryStatus: '未校验库存',
        remark: '当前页面先回答“这张计划需要开始准备主辅料”这一层，不捏造具体材料名和单耗，等上游结构化材料行打通后自动替换。',
      },
    ];
  }, [matchedBom, persistedLines, plan, salesItems]);

  const summary = useMemo(() => {
    return effectiveLines.reduce(
      (acc, item) => {
        acc.total += toNumber(item.requiredQty);
        if (item.materialType === '主料') {
          acc.main += 1;
        } else if (item.materialType === '辅料') {
          acc.auxiliary += 1;
        }
        return acc;
      },
      { total: 0, main: 0, auxiliary: 0 },
    );
  }, [effectiveLines]);

  const viewMode = persistedLines.length > 0 ? 'persisted' : effectiveLines.length > 0 ? 'derived' : 'empty';
  const columns = [
    { key: 'materialType', title: '材料类型', render: (value: string) => renderMaterialType(value) },
    { key: 'materialId', title: '物料ID', render: (value: string) => renderText(value) },
    { key: 'color', title: '颜色范围', render: (value: string) => renderText(value) },
    { key: 'unitConsumption', title: '单耗', render: (value: string) => renderText(value) },
    { key: 'wastage', title: '损耗', render: (value: string) => renderText(value) },
    { key: 'planQuantity', title: '排产数量', render: (value: string) => renderText(value) },
    { key: 'totalQuantity', title: '需求总量', render: (value: string) => renderText(value) },
    { key: 'inventoryStatus', title: '库存状态', render: (value: string) => renderText(value) },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">计划用料</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('planMaterial.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里承接的是计划层面的材料准备视图，不是采购执行单。页面会先展示正式的计划用料明细；如果还没有结构化材料行，系统会基于生产计划头、颜色范围和上游 BOM 存在性给出“待结构化”的计划用料视图。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Package, label: '计划单', value: renderText(plan?.planNo || searchParams.get('planNo')) },
                { icon: Boxes, label: '来源单据', value: renderText(plan?.srcBillNo || plan?.srcBillType) },
                { icon: CalendarRange, label: '上游 BOM', value: matchedBom ? renderText(matchedBom.sampleNo || matchedBom.styleCode) : '暂未匹配' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm w-fit">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: matchedBom ? `/material/bom/${matchedBom.id}` : '/material/bom', title: '回看样衣 BOM', detail: '先确认上游是否已有样衣 BOM 主表，以及主辅料结构化程度。'},
              { to: '/purchase', title: '继续看采购执行', detail: '计划用料确认后，下一步应继续到采购、到货和入库。'},
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <Layers3 size={14} />
              {viewMode === 'persisted' ? '当前展示：正式计划用料明细' : viewMode === 'derived' ? '当前展示：系统推导用料视图' : '当前展示：待补结构化材料'}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">有效计划用料视图</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {viewMode === 'persisted'
                ? '这部分已经是正式保存的计划用料明细，可以继续下钻采购、到货、入库和领料。'
                : viewMode === 'derived'
                  ? '当前还没有正式保存的计划用料明细，系统先给出主料/辅料计划占位视图，帮助判断这张计划是否已经具备启动采购和备料的条件。'
                  : '当前没有可展示的计划用料，也没有足够来源支撑推导，请先补生产计划来源或上游 BOM。'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard icon={Package} label="有效行数" value={`${effectiveLines.length} 条`} />
            <MetricCard icon={ScrollText} label="主料占位" value={`${summary.main} 条`} />
            <MetricCard icon={Boxes} label="辅料占位" value={`${summary.auxiliary} 条`} />
            <MetricCard icon={CalendarRange} label="需求总量" value={renderNumber(summary.total)} />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['数据层', '材料类型', '材料/说明', '颜色范围', '单耗', '损耗', '需求量', '状态', '说明'].map((title) => (
                  <th key={title} className="px-4 py-3 text-left font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    正在加载计划用料视图...
                  </td>
                </tr>
              ) : effectiveLines.length > 0 ? (
                effectiveLines.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.source === 'persisted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.sourceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{item.materialType}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.materialName}</td>
                    <td className="px-4 py-3 text-slate-800">{item.colorScope}</td>
                    <td className="px-4 py-3 text-slate-800">{item.unitConsumption}</td>
                    <td className="px-4 py-3 text-slate-800">{item.wastage}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {item.requiredQty} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <div>{item.materialStatus}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.inventoryStatus}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    当前没有可展示的计划用料，请先补生产计划来源、样衣 BOM 或正式计划用料明细。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CrudPage title="正式计划用料明细" api={pageApi} columns={columns} initialSearchParams={initialSearchParams} />
    </div>
  );
}
