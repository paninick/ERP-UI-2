import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CalendarRange,
  ClipboardList,
  Factory,
  Package,
  PanelsTopLeft,
  Route,
} from 'lucide-react';
import * as productionApi from '@/api/production';
import * as planClothesApi from '@/api/planClothes';
import * as planMaterialApi from '@/api/planMaterial';
import * as salesApi from '@/api/sales';
import * as processRouteApi from '@/api/processRoute';
import * as workCenterApi from '@/api/workCenter';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/appStore';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';
import { resolveApprovalState } from '@/utils/approval';
import { getCompanyLabel } from '@/utils/companyContext';

type PlanClothesLine = {
  id: number;
  color?: string;
  size?: string;
  orderQuantity?: number | string;
  extraQuantity?: number | string;
  planQuantity?: number | string;
  inboundQuantity?: number | string;
  remark?: string;
};

type PlanMaterialLine = {
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

function renderText(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '-';
}

function renderDate(value: unknown) {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, 10) : '-';
}

function renderNumber(value: unknown) {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function renderProduceType(value: unknown) {
  const text = String(value ?? '').trim();
  if (text === '1') return '本厂生产';
  if (text === '2') return '委外生产';
  return text || '-';
}

function renderMaterialType(value: unknown) {
  const text = String(value ?? '').trim();
  if (text === '1' || text.includes('主')) return '主料';
  if (text === '2' || text.includes('辅')) return '辅料';
  return text || '-';
}

function renderRouteText(value: unknown, routeName?: string) {
  if (routeName) return routeName;
  return value ? `路线#${value}` : '-';
}

function renderWorkCenterText(value: unknown, workCenterName?: string) {
  if (workCenterName) return workCenterName;
  return value ? `工作中心#${value}` : '-';
}

function renderCompanyLabel(code: string) {
  switch (code) {
    case 'HEADQUARTERS':
      return '总部';
    case 'SHUYANG':
      return '沭阳';
    case 'DONGCHUAN':
      return '东川';
    case 'CAMBODIA':
      return '柬埔寨';
    default:
      return code || '-';
  }
}

function renderApprovalTag(value: unknown) {
  const state = resolveApprovalState(value) || 'draft';
  if (state === 'approved') return { label: '已通过', className: 'bg-emerald-50 text-emerald-700' };
  if (state === 'submitted') return { label: '待审核', className: 'bg-blue-50 text-blue-700' };
  if (state === 'rejected') return { label: '已驳回', className: 'bg-amber-50 text-amber-700' };
  return { label: '待提交', className: 'bg-slate-100 text-slate-700' };
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Factory;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="w-fit rounded-2xl bg-white p-2 text-blue-700 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function GridField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-2 break-words text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
}

export default function ProducePlanOverviewPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const planId = Number(id);
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clothes' | 'materials' | 'flow'>('overview');
  const [plan, setPlan] = useState<any>(null);
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [clothesLines, setClothesLines] = useState<PlanClothesLine[]>([]);
  const [materialLines, setMaterialLines] = useState<PlanMaterialLine[]>([]);
  const [routeName, setRouteName] = useState('');
  const [workCenterName, setWorkCenterName] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!Number.isFinite(planId) || planId <= 0) {
        toast.error('缺少有效的生产计划编号');
        navigate('/production/plan');
        return;
      }

      setLoading(true);
      try {
        const planRes: any = await productionApi.getProducePlan(planId);
        const nextPlan = unwrapAjaxResultData<any>(planRes);

        if (!nextPlan) {
          throw new Error('未找到对应的生产计划');
        }

        const [clothesRes, materialRes, salesRes, routeRes, workCenterRes] = await Promise.all([
          planClothesApi.listPlanClothes({ planId, pageNum: 1, pageSize: 500 }),
          planMaterialApi.listPlanMaterial({ planId, pageNum: 1, pageSize: 500 }),
          nextPlan.salesOrderId ? salesApi.getSalesOrder(nextPlan.salesOrderId).catch(() => null) : Promise.resolve(null),
          nextPlan.processRouteId ? processRouteApi.getProcessRoute(nextPlan.processRouteId).catch(() => null) : Promise.resolve(null),
          nextPlan.workCenterId ? workCenterApi.getWorkCenter(nextPlan.workCenterId).catch(() => null) : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setPlan(nextPlan);
        setClothesLines(clothesRes?.rows || []);
        setMaterialLines(materialRes?.rows || []);
        setSalesOrder(unwrapAjaxResultData<any>(salesRes));
        setRouteName(routeRes?.data?.routeName || routeRes?.routeName || '');
        setWorkCenterName(workCenterRes?.data?.centerName || workCenterRes?.centerName || '');
      } catch (error: any) {
        if (mounted) {
          toast.error(error.message || '加载生产计划详情失败');
          navigate('/production/plan');
        }
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
  }, [companySignature, navigate, planId]);

  const clothesSummary = useMemo(() => {
    return clothesLines.reduce(
      (acc, item) => {
        acc.order += toNumber(item.orderQuantity);
        acc.extra += toNumber(item.extraQuantity);
        acc.plan += toNumber(item.planQuantity);
        acc.inbound += toNumber(item.inboundQuantity);
        return acc;
      },
      { order: 0, extra: 0, plan: 0, inbound: 0 },
    );
  }, [clothesLines]);

  const groupedMaterials = useMemo(() => {
    const mains = materialLines.filter((item) => renderMaterialType(item.materialType) === '主料');
    const auxiliaries = materialLines.filter((item) => renderMaterialType(item.materialType) !== '主料');
    return { mains, auxiliaries };
  }, [materialLines]);

  const materialSummary = useMemo(() => {
    return materialLines.reduce(
      (acc, item) => {
        acc.total += toNumber(item.totalQuantity);
        acc.plan += toNumber(item.planQuantity);
        return acc;
      },
      { total: 0, plan: 0 },
    );
  }, [materialLines]);

  const approvalTag = renderApprovalTag(plan?.auditStatus);
  const displayPlanQty = plan?.planQty != null && plan?.planQty !== '' ? renderNumber(plan.planQty) : renderNumber(clothesSummary.plan);
  const tabs = [
    { key: 'overview' as const, label: '基础总览' },
    { key: 'clothes' as const, label: '颜色尺码数量' },
    { key: 'materials' as const, label: '物料需求' },
    { key: 'flow' as const, label: '执行去向' },
  ];

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          正在加载生产计划详情...
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          未找到对应的生产计划
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-blue-700">
              排产基面
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/production/plan')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                返回生产计划
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${approvalTag.className}`}>
                {approvalTag.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                计划单 {renderText(plan.planNo)}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">生产计划详情</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里不是现场工单，而是大货进入执行前的计划基面。重点要看清这张计划准备在哪个工厂、什么时间上线、拆了哪些颜色尺码数量、材料是否已经具备排产条件。
            </p>
            <p className="mt-2 text-sm text-slate-500">
              当前公司：{renderCompanyLabel(currentCompany.code)}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={Factory} label="执行工厂" value={renderText(plan.inFactory || plan.outFactory)} />
              <MetricCard icon={Boxes} label="服装拆分行" value={`${clothesLines.length} 条`} />
              <MetricCard icon={Package} label="物料需求行" value={`${materialLines.length} 条`} />
              <MetricCard icon={CalendarRange} label="排产数量" value={displayPlanQty} />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              {
                to: `/production/plan-clothes?planId=${plan.id}&planNo=${encodeURIComponent(plan.planNo || '')}`,
                title: '继续看计划服装',
                detail: '下钻颜色、尺码、订单数、增产数和入库数的拆分明细。',
              },
              {
                to: `/production/plan-material?planId=${plan.id}&planNo=${encodeURIComponent(plan.planNo || '')}`,
                title: '继续看计划用料',
                detail: '继续判断主辅料需求、损耗、库存状态是否支持排产。',
              },
              {
                to: `/production/gantt`,
                title: '继续看甘特预排',
                detail: '当前这里仍是计划时间轴视图；真实预排要等计划层路线、工作中心和数量压实后再成立。',
              },
              {
                to: `/production/job?planId=${plan.id}&producePlanId=${plan.id}&styleCode=${encodeURIComponent(plan.styleCode || '')}&customerName=${encodeURIComponent(plan.customerName || '')}`,
                title: '继续下发工单',
                detail: '计划确认后，下一步应直接进入工单层，而不是让车间再自己拼上下文。',
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50/60"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-blue-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <SectionCard title="基础信息" hint="先确认计划属于谁、来自哪里、准备在哪个工厂、属于什么执行方式。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="客户名称" value={renderText(plan.customerName)} />
              <GridField label="业务员" value={renderText(plan.salesName)} />
              <GridField label="款号" value={renderText(plan.styleCode)} />
              <GridField label="款式品类" value={renderText(plan.styleCategory)} />
              <GridField label="大货款号" value={renderText(plan.bulkOrderNo)} />
              <GridField label="打样款号" value={renderText(plan.sampleStyleNo)} />
              <GridField label="计划类型" value={renderText(plan.type)} />
              <GridField label="生产方式" value={renderProduceType(plan.produceType)} />
              <GridField label="本厂" value={renderText(plan.inFactory)} />
              <GridField label="委外工厂" value={renderText(plan.outFactory)} />
              <GridField label="工艺路线" value={renderRouteText(plan.processRouteId, routeName)} />
              <GridField label="工作中心" value={renderWorkCenterText(plan.workCenterId, workCenterName)} />
              <GridField label="计划数量" value={displayPlanQty} />
              <GridField label="生产状态" value={renderText(plan.produceStatus)} />
              <GridField label="订单状态" value={renderText(plan.planStatus)} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <GridField label="来源单据" value={renderText(plan.srcBillNo || plan.srcBillType)} />
              <GridField label="备注" value={renderText(plan.remark)} />
            </div>
          </SectionCard>

          <SectionCard title="计划时间轴" hint="这一层回答什么时候原料到、什么时候前后道、什么时候上线下线、什么时候交付。">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <GridField label="开始时间" value={renderDate(plan.startDate)} />
              <GridField label="原料到货" value={renderDate(plan.materialArrivalDate)} />
              <GridField label="前道日期" value={renderDate(plan.preProcessDate)} />
              <GridField label="上线日期" value={renderDate(plan.upDate)} />
              <GridField label="下线日期" value={renderDate(plan.downDate)} />
              <GridField label="送检日期" value={renderDate(plan.inspectionDate)} />
              <GridField label="后道日期" value={renderDate(plan.postProcessDate)} />
              <GridField label="进仓日期" value={renderDate(plan.inBoundDate)} />
              <GridField label="船期" value={renderDate(plan.shippingDate)} />
              <GridField label="交期" value={renderDate(plan.dueDate)} />
              <GridField label="领料完成" value={renderDate(plan.pickedDate)} />
              <GridField label="完成日期" value={renderDate(plan.completeDate)} />
            </div>
          </SectionCard>

          <SectionCard title="来源关系" hint="计划单要能回到销售来源，不然排产和交付责任链会断。">
            <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-3 md:grid-cols-2">
                <GridField label="销售订单ID" value={renderText(plan.salesOrderId)} />
                <GridField label="打样通知ID" value={renderText(plan.noticeId)} />
                <GridField label="技术单ID" value={renderText(plan.techId)} />
                <GridField label="审批时间" value={renderDate(plan.auditTime)} />
                <GridField label="审批人" value={renderText(plan.auditBy)} />
                <GridField label="检验公司" value={renderText(plan.inspectionCorp)} />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">来源销售信息</h4>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>销售订单号：{renderText(salesOrder?.salesNo || plan.srcBillNo)}</p>
                  <p>客户：{renderText(salesOrder?.customerName || plan.customerName)}</p>
                  <p>款号：{renderText(salesOrder?.styleCode || plan.styleCode)}</p>
                  <p>数量：{renderNumber(salesOrder?.quantity)}</p>
                </div>
                {plan.salesOrderId ? (
                  <NavLink
                    to={`/sales/order/${plan.salesOrderId}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-blue-700 shadow-sm transition hover:bg-blue-50"
                  >
                    查看来源销售订单
                    <ArrowRight size={15} />
                  </NavLink>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'clothes' && (
        <div className="space-y-4">
          <SectionCard title="大货数量拆分" hint="这里要能直接看出每个颜色尺码的订单数、增产数、排产数与入库回流情况。">
            <div className="mb-4 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={ClipboardList} label="订单数量" value={renderNumber(clothesSummary.order)} />
              <MetricCard icon={PanelsTopLeft} label="增产数量" value={renderNumber(clothesSummary.extra)} />
              <MetricCard icon={Boxes} label="排产数量" value={renderNumber(clothesSummary.plan)} />
              <MetricCard icon={Package} label="已入库数量" value={renderNumber(clothesSummary.inbound)} />
            </div>
            {clothesLines.length ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-500">
                      <th className="px-4 py-3">颜色</th>
                      <th className="px-4 py-3">尺码</th>
                      <th className="px-4 py-3">订单数量</th>
                      <th className="px-4 py-3">增产数量</th>
                      <th className="px-4 py-3">排产数量</th>
                      <th className="px-4 py-3">入库数量</th>
                      <th className="px-4 py-3">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clothesLines.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">{renderText(item.color)}</td>
                        <td className="px-4 py-3">{renderText(item.size)}</td>
                        <td className="px-4 py-3">{renderNumber(item.orderQuantity)}</td>
                        <td className="px-4 py-3">{renderNumber(item.extraQuantity)}</td>
                        <td className="px-4 py-3">{renderNumber(item.planQuantity)}</td>
                        <td className="px-4 py-3">{renderNumber(item.inboundQuantity)}</td>
                        <td className="px-4 py-3 whitespace-pre-wrap text-slate-600">{renderText(item.remark)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                当前没有维护计划服装拆分明细
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-4">
          <SectionCard title="物料需求" hint="这里先回答主辅料够不够排，再继续流向采购、到货、领料和损耗控制。">
            <div className="mb-4 grid gap-3 sm:grid-cols-4">
              <MetricCard icon={Package} label="主料行数" value={`${groupedMaterials.mains.length} 条`} />
              <MetricCard icon={Boxes} label="辅料行数" value={`${groupedMaterials.auxiliaries.length} 条`} />
              <MetricCard icon={PanelsTopLeft} label="排产用量" value={renderNumber(materialSummary.plan)} />
              <MetricCard icon={ClipboardList} label="需求总量" value={renderNumber(materialSummary.total)} />
            </div>
            {materialLines.length ? (
              <div className="space-y-5">
                {[
                  { title: '主料信息', rows: groupedMaterials.mains },
                  { title: '辅料信息', rows: groupedMaterials.auxiliaries },
                ].map((group) => (
                  <div key={group.title}>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">{group.title}</h4>
                    {group.rows.length ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-slate-500">
                              <th className="px-4 py-3">材料ID</th>
                              <th className="px-4 py-3">颜色</th>
                              <th className="px-4 py-3">单耗</th>
                              <th className="px-4 py-3">损耗方式</th>
                              <th className="px-4 py-3">损耗</th>
                              <th className="px-4 py-3">排产数量</th>
                              <th className="px-4 py-3">需求总量</th>
                              <th className="px-4 py-3">材料状态</th>
                              <th className="px-4 py-3">库存状态</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((item) => (
                              <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">{renderText(item.materialId)}</td>
                                <td className="px-4 py-3">{renderText(item.color)}</td>
                                <td className="px-4 py-3">{renderNumber(item.unitConsumption)}</td>
                                <td className="px-4 py-3">{renderText(item.lossType)}</td>
                                <td className="px-4 py-3">{renderNumber(item.wastage)}</td>
                                <td className="px-4 py-3">{renderNumber(item.planQuantity)}</td>
                                <td className="px-4 py-3">{renderNumber(item.totalQuantity)}</td>
                                <td className="px-4 py-3">{renderText(item.materialStatus)}</td>
                                <td className="px-4 py-3">{renderText(item.inventoryStatus)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-500">
                        当前没有{group.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                当前没有维护计划用料明细
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="space-y-4">
          <SectionCard title="执行去向" hint="行业上这一步最重要的不是再录一遍数据，而是明确这张计划接下来流到哪里、卡在哪一关。">
            <div className="grid gap-4 lg:grid-cols-4">
              {[
                {
                  icon: Route,
                  title: '计划审批',
                  detail: '先确认这张计划是否已提交、已审核、允许进入执行。',
                },
                {
                  icon: ClipboardList,
                  title: '颜色尺码拆分',
                  detail: '再确认每个颜色尺码的排产数和增产数是否合理。',
                },
                {
                  icon: Package,
                  title: '材料齐套',
                  detail: '接着看主辅料需求、库存状态、是否具备领料条件。',
                },
                {
                  icon: PanelsTopLeft,
                  title: '工单与甘特',
                  detail: '最后才适合拆工单、上甘特、进看板和现场报工。',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-blue-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
