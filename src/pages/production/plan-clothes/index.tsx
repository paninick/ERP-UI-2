import { useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CalendarRange, ClipboardList, Factory, Layers3, Shirt } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/planClothes';
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
  inFactory?: string;
  outFactory?: string;
  srcBillNo?: string;
  srcBillType?: string;
  salesOrderId?: number | string;
};

type PersistedClothesLine = {
  id: number;
  salesItemId?: number | string;
  color?: string;
  size?: string;
  orderQuantity?: number | string;
  extraQuantity?: number | string;
  planQuantity?: number | string;
  inboundQuantity?: number | string;
  remark?: string;
};

type SalesOrderItemLine = {
  id: number;
  color?: string;
  size?: string;
  orderQuantity?: number | string;
  planQuantity?: number | string;
  inboundAmount?: number | string;
};

type EffectiveClothesLine = {
  id: string | number;
  source: 'persisted' | 'derived';
  color: string;
  size: string;
  orderQuantity: number;
  extraQuantity: number;
  planQuantity: number;
  inboundQuantity: number;
  sourceLabel: string;
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
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function distributePlanQuantities(items: SalesOrderItemLine[], targetTotal: number) {
  if (items.length === 0) {
    return [];
  }
  const explicitTotal = items.reduce((sum, item) => sum + toNumber(item.planQuantity), 0);
  if (explicitTotal > 0) {
    return items.map((item) => toNumber(item.planQuantity));
  }
  const orderTotal = items.reduce((sum, item) => sum + toNumber(item.orderQuantity), 0);
  if (targetTotal <= 0 || orderTotal <= 0) {
    return items.map((item) => toNumber(item.orderQuantity));
  }
  let assigned = 0;
  return items.map((item, index) => {
    if (index === items.length - 1) {
      return Math.max(targetTotal - assigned, 0);
    }
    const value = Math.round((toNumber(item.orderQuantity) / orderTotal) * targetTotal);
    assigned += value;
    return value;
  });
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shirt;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-indigo-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function PlanClothes() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const planId = Number(searchParams.get('planId') || 0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ProducePlan | null>(null);
  const [persistedLines, setPersistedLines] = useState<PersistedClothesLine[]>([]);
  const [salesItems, setSalesItems] = useState<SalesOrderItemLine[]>([]);
  const pageApi = {
    list: api.listPlanClothes,
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!Number.isFinite(planId) || planId <= 0) {
        setPlan(null);
        setPersistedLines([]);
        setSalesItems([]);
        return;
      }

      setLoading(true);
      try {
        const planRes: any = await productionApi.getProducePlan(planId);
        const nextPlan = unwrapAjaxResultData<ProducePlan>(planRes);
        const [persistedRes, salesItemsRes] = await Promise.all([
          api.listPlanClothes({ planId, pageNum: 1, pageSize: 500 }).catch(() => ({ rows: [] })),
          nextPlan?.salesOrderId
            ? salesOrderItemApi.listSalesOrderItem({ salesOrderId: nextPlan.salesOrderId, pageNum: 1, pageSize: 500 }).catch(() => ({ rows: [] }))
            : Promise.resolve({ rows: [] }),
        ]);

        if (!mounted) {
          return;
        }

        setPlan(nextPlan);
        setPersistedLines(persistedRes?.rows || []);
        setSalesItems(salesItemsRes?.rows || []);
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

  const effectiveLines = useMemo<EffectiveClothesLine[]>(() => {
    if (persistedLines.length > 0) {
      return persistedLines.map((item) => ({
        id: item.id,
        source: 'persisted',
        color: renderText(item.color),
        size: renderText(item.size),
        orderQuantity: toNumber(item.orderQuantity),
        extraQuantity: toNumber(item.extraQuantity),
        planQuantity: toNumber(item.planQuantity),
        inboundQuantity: toNumber(item.inboundQuantity),
        sourceLabel: '正式明细',
        remark: item.remark || '已保存到计划服装明细表，可继续作为甘特和工单拆分依据。',
      }));
    }

    if (salesItems.length > 0) {
      const allocations = distributePlanQuantities(salesItems, toNumber(plan?.planQty));
      return salesItems.map((item, index) => {
        const orderQuantity = toNumber(item.orderQuantity);
        const planQuantity = toNumber(allocations[index]);
        return {
          id: `derived-${item.id}`,
          source: 'derived',
          color: renderText(item.color),
          size: renderText(item.size),
          orderQuantity,
          extraQuantity: Math.max(planQuantity - orderQuantity, 0),
          planQuantity,
          inboundQuantity: toNumber(item.inboundAmount),
          sourceLabel: '系统推导',
          remark: '当前未维护正式计划服装明细，系统按销售明细颜色/尺码/数量生成预览，便于先看排产拆分。',
        };
      });
    }

    if (plan && toNumber(plan.planQty) > 0) {
      return [
        {
          id: 'derived-plan-summary',
          source: 'derived',
          color: '待拆分',
          size: '待拆分',
          orderQuantity: toNumber(plan.planQty),
          extraQuantity: 0,
          planQuantity: toNumber(plan.planQty),
          inboundQuantity: 0,
          sourceLabel: '待补来源',
          remark: '当前计划头已存在，但还没有销售颜色尺码拆分，需先补销售明细或正式计划服装明细。',
        },
      ];
    }

    return [];
  }, [persistedLines, plan, salesItems]);

  const summary = useMemo(() => {
    return effectiveLines.reduce(
      (acc, item) => {
        acc.order += item.orderQuantity;
        acc.extra += item.extraQuantity;
        acc.plan += item.planQuantity;
        acc.inbound += item.inboundQuantity;
        return acc;
      },
      { order: 0, extra: 0, plan: 0, inbound: 0 },
    );
  }, [effectiveLines]);

  const viewMode = persistedLines.length > 0 ? 'persisted' : effectiveLines.length > 0 ? 'derived' : 'empty';
  const columns = [
    { key: 'salesItemId', title: '销售明细ID' },
    { key: 'color', title: '颜色' },
    { key: 'size', title: '尺码' },
    { key: 'orderQuantity', title: '订单数量' },
    { key: 'extraQuantity', title: '增产数量' },
    { key: 'planQuantity', title: '排产数量' },
    { key: 'inboundQuantity', title: '入库数量' },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-indigo-600">计划拆分</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('planClothes.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里看的是生产计划拆成哪些颜色、尺码、数量维度。页面会优先展示正式保存的计划服装明细；如果还没维护，系统会按销售明细自动给出一版可解释的拆分视图，先让厂长和计划员看得见。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Shirt, label: '计划单', value: renderText(plan?.planNo || searchParams.get('planNo')) },
                { icon: Factory, label: '执行工厂', value: renderText(plan?.inFactory || plan?.outFactory) },
                { icon: ClipboardList, label: '来源单据', value: renderText(plan?.srcBillNo || plan?.srcBillType) },
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
              { to: planId > 0 ? `/production/plan/${planId}/overview` : '/production/plan', title: '回看生产计划', detail: '先确认计划头、来源单据和计划总量，再看拆分结果。'},
              { to: '/production/gantt', title: '去预排甘特图', detail: '颜色尺码数量清楚后，再进入时间轴做预排与插单。'},
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-indigo-600">
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
              {viewMode === 'persisted' ? '当前展示：正式计划服装明细' : viewMode === 'derived' ? '当前展示：系统推导拆分视图' : '当前展示：待补拆分来源'}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">有效计划服装视图</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {viewMode === 'persisted'
                ? '这部分已经是正式保存的计划服装明细，可以直接作为工单、预排和后续入库统计的依据。'
                : viewMode === 'derived'
                  ? '这部分还没有正式保存到计划服装明细表，系统按销售明细和计划总量生成了一版可读视图，方便先判断拆分是否合理。'
                  : '当前既没有正式计划服装明细，也没有足够的销售拆分来源，建议先补销售订单颜色尺码明细。'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard icon={Shirt} label="拆分行数" value={`${effectiveLines.length} 条`} />
            <MetricCard icon={CalendarRange} label="订单数量" value={renderNumber(summary.order)} />
            <MetricCard icon={ClipboardList} label="排产数量" value={renderNumber(summary.plan)} />
            <MetricCard icon={Factory} label="已入库数量" value={renderNumber(summary.inbound)} />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['数据层', '颜色', '尺码', '订单数量', '增产数量', '排产数量', '入库数量', '说明'].map((title) => (
                  <th key={title} className="px-4 py-3 text-left font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    正在加载计划服装视图...
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
                    <td className="px-4 py-3 text-slate-800">{item.color}</td>
                    <td className="px-4 py-3 text-slate-800">{item.size}</td>
                    <td className="px-4 py-3 text-slate-800">{renderNumber(item.orderQuantity)}</td>
                    <td className="px-4 py-3 text-slate-800">{renderNumber(item.extraQuantity)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{renderNumber(item.planQuantity)}</td>
                    <td className="px-4 py-3 text-slate-800">{renderNumber(item.inboundQuantity)}</td>
                    <td className="px-4 py-3 text-slate-500">{item.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    当前没有可展示的计划服装明细，请先补销售颜色尺码数量或正式计划服装拆分。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CrudPage title="正式计划服装明细" api={pageApi} columns={columns} initialSearchParams={initialSearchParams} />
    </div>
  );
}
