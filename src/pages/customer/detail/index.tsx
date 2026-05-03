import { useMemo } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  Factory,
  FileText,
  KanbanSquare,
  MapPinned,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Workflow,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import {
  CompanyCode,
  buildCompanyContextOptionsFromBackend,
  type CompanyContextOption,
} from '@/utils/companyContext';

interface DetailLink {
  to: string;
  label: string;
  detail: string;
}

interface StageCard {
  title: string;
  description: string;
  accent: string;
  icon: typeof FileText;
  links: DetailLink[];
}

interface FactoryMatrixLink {
  label: string;
  detail: string;
  to: string;
  icon: typeof FileText;
}

export default function CustomerBusinessDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setCurrentCompany = useAppStore((state) => state.setCurrentCompany);
  const customerName = searchParams.get('customerName') || '';
  const customerNo = searchParams.get('customerNo') || '';
  const contactName = searchParams.get('contactName') || '';

  const customerQuery = customerName ? `?customerName=${encodeURIComponent(customerName)}` : '';
  const companyLabels: Record<CompanyCode, string> = {
    HEADQUARTERS: '总部',
    SHUYANG: '沭阳',
    DONGCHUAN: '东川',
    CAMBODIA: '柬埔寨',
  };
  const factoryCards = useMemo(
    () => [
      {
        code: 'HEADQUARTERS' as CompanyCode,
        description: '总部更适合先看全局排期和客户在各链路上的总口径，再决定切去哪个工厂追现场。',
        badge: '总部汇总',
      },
      {
        code: 'SHUYANG' as CompanyCode,
        description: '沭阳工厂入口适合从预排、现场、报工、质检四个角度继续追这个客户。',
        badge: '工厂现场',
      },
      {
        code: 'DONGCHUAN' as CompanyCode,
        description: '东川工厂入口适合先判断排产，再看报工和放行，不必在菜单里反复找页面。',
        badge: '执行工厂',
      },
      {
        code: 'CAMBODIA' as CompanyCode,
        description: '柬埔寨工厂入口继续承接该客户在当地工厂的预排、现场与放行。',
        badge: '放行工厂',
      },
    ],
    [],
  );
  const companyOptions = useMemo(
    () => buildCompanyContextOptionsFromBackend(user?.erpCompanyContexts || [], []),
    [user?.erpCompanyContexts],
  );
  const availableCompanyOptions = useMemo(() => {
    return companyOptions.reduce<Partial<Record<CompanyCode, CompanyContextOption>>>((acc, option) => {
      if (option.available) {
        acc[option.code] = option;
      }
      return acc;
    }, {});
  }, [companyOptions]);
  const availableFactoryCards = useMemo(
    () => factoryCards.filter((card) => Boolean(availableCompanyOptions[card.code])),
    [availableCompanyOptions, factoryCards],
  );
  const factoryMatrix = useMemo<Record<CompanyCode, FactoryMatrixLink[]>>(
    () => ({
      HEADQUARTERS: [
        { label: '甘特预排', detail: '先看总部总览下的客户排期池。', to: `/production/gantt${customerQuery}`, icon: Workflow },
        { label: '生产看板', detail: '看总部口径下客户当前执行情况。', to: `/production/kanban${customerQuery}`, icon: KanbanSquare },
        { label: '工序报工', detail: '继续看客户执行链落到哪道工序。', to: `/production/job-process${customerQuery}`, icon: Factory },
        { label: '质量检验', detail: '最终回到放行闸门判断。', to: `/quality/inspection${customerQuery}`, icon: ShieldCheck },
      ],
      SHUYANG: [
        { label: '甘特预排', detail: '看沭阳这边该客户预排是否合理。', to: `/production/gantt${customerQuery}`, icon: Workflow },
        { label: '生产看板', detail: '看沭阳现场今天有没有在跑、有没有风险。', to: `/production/kanban${customerQuery}`, icon: KanbanSquare },
        { label: '工序报工', detail: '落到沭阳工序级执行台账。', to: `/production/job-process${customerQuery}`, icon: Factory },
        { label: '质量检验', detail: '继续看沭阳这边的质检放行。', to: `/quality/inspection${customerQuery}`, icon: ShieldCheck },
      ],
      DONGCHUAN: [
        { label: '甘特预排', detail: '看东川的排期、插单与时间轴。', to: `/production/gantt${customerQuery}`, icon: Workflow },
        { label: '生产看板', detail: '看东川现场总览与今日执行。', to: `/production/kanban${customerQuery}`, icon: KanbanSquare },
        { label: '工序报工', detail: '看东川车间报工与流转明细。', to: `/production/job-process${customerQuery}`, icon: Factory },
        { label: '质量检验', detail: '看东川这边是否 PASS / FAIL / 返工。', to: `/quality/inspection${customerQuery}`, icon: ShieldCheck },
      ],
      CAMBODIA: [
        { label: '甘特预排', detail: '看柬埔寨工厂该客户的预排节奏。', to: `/production/gantt${customerQuery}`, icon: Workflow },
        { label: '生产看板', detail: '看柬埔寨现场在制与风险。', to: `/production/kanban${customerQuery}`, icon: KanbanSquare },
        { label: '工序报工', detail: '看柬埔寨现场工序推进与报工。', to: `/production/job-process${customerQuery}`, icon: Factory },
        { label: '质量检验', detail: '看柬埔寨这边的检验与放行。', to: `/quality/inspection${customerQuery}`, icon: ShieldCheck },
      ],
    }),
    [customerQuery],
  );

  const handleFactoryJump = (code: CompanyCode, to: string) => {
    const nextOption = availableCompanyOptions[code];
    if (!nextOption) {
      return;
    }

    setCurrentCompany({
      code: nextOption.code,
      factoryId: nextOption.factoryId,
      orgFactoryId: nextOption.orgFactoryId ?? null,
      mode: nextOption.mode,
    }, {
      userId: user?.userId,
      deptId: user?.deptId,
    });
    navigate(to);
  };

  const stages: StageCard[] = [
    {
      title: '1. 销售与开发',
      description: '先确认这个客户的订单、打样和开发任务，再决定后面采购、排期和交付怎么接。',
      accent: 'from-emerald-500/15 via-emerald-50 to-white',
      icon: FileText,
      links: [
        { to: `/sales/order${customerQuery}`, label: '销售订单', detail: '确认数量、颜色、尺码、交期与备注。' },
        { to: `/sales/proofing-notice${customerQuery}`, label: '打样通知', detail: '继续追一次样、二次样、摄影样与改样。' },
      ],
    },
    {
      title: '2. 生产与现场',
      description: '订单与样衣确认后，继续看到排期、工单、预排和现场报工，判断这个客户现在到底跑到哪一步。',
      accent: 'from-blue-500/15 via-blue-50 to-white',
      icon: Factory,
      links: [
        { to: `/production/plan${customerQuery}`, label: '生产计划', detail: '看该客户订单进入了哪些计划和交期安排。' },
        { to: `/production/job${customerQuery}`, label: '生产工单', detail: '查看已经正式下发执行的工单。' },
        { to: `/production/kanban${customerQuery}`, label: '生产看板', detail: '从现场总览看今天有没有在跑、有没有风险。' },
        { to: `/production/gantt${customerQuery}`, label: '甘特预排', detail: '按时间轴看预排、插单和计划调整。' },
        { to: `/production/job-process${customerQuery}`, label: '工序报工', detail: '落到工序级台账，看报工数量和执行进度。' },
      ],
    },
    {
      title: '3. 质量与放行',
      description: '客户的实际放行状态不应只停留在沟通层，应该继续落到质检与返工判断。',
      accent: 'from-lime-500/15 via-lime-50 to-white',
      icon: ClipboardCheck,
      links: [
        { to: `/quality/inspection${customerQuery}`, label: '质量检验', detail: '确认放行、驳回、返工和最终质检判断。' },
      ],
    },
    {
      title: '4. 仓储与结算',
      description: '完成质量关口后，再继续追出货动作和结算状态，闭合客户交付链。',
      accent: 'from-amber-500/15 via-amber-50 to-white',
      icon: ReceiptText,
      links: [
        { to: `/inventory/shipment${customerQuery}`, label: '出货单', detail: '继续看船务、放行和出货登记。' },
        { to: `/finance/invoice${customerQuery}`, label: '发票结算', detail: '继续看开票、核销与结算状态。' },
      ],
    },
  ];

  if (!customerName) {
    return (
      <div className="space-y-4 p-6">
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700">客户业务详情</div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">未选择客户</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            这个页面只负责承接某一个客户的全链业务入口，不会伪造默认客户数据。请先从客户主档或客户联系人选择具体客户后再进入。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <NavLink to="/customer" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800">
              返回客户主档
            </NavLink>
            <NavLink to="/customer/contacts" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100">
              返回客户联系人
            </NavLink>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white">客户统一业务详情</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{customerName}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                这个页面不再把你丢进一堆分散列表里找入口，而是先把该客户可继续追的真实业务链集中起来。销售、技术、生产、质量、出货、结算都从这里继续展开。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {customerNo ? <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">客户编号：{customerNo}</span> : null}
                {contactName ? <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">来源联系人：{contactName}</span> : null}
                <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">筛选字段：customerName</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem]">
              {[
                { icon: Users, label: '业务起点', value: '订单 / 打样 / 客户窗口' },
                { icon: Factory, label: '现场追踪', value: '计划 / 工单 / 看板 / 报工' },
                { icon: PackageCheck, label: '交付闭环', value: '质检 / 出货 / 结算' },
                { icon: ArrowRight, label: '当前边界', value: '工厂细分仍在业务页继续看' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 backdrop-blur">
                  <div className="w-fit rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">当前页只做统一入口，不伪造假统计</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              如果你要看总部、沭阳、东川、柬埔寨各自的产线预排和现场明细，应该继续进入下面真实支持客户筛选的业务页，不在这里凭空拼一张假看板。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/customer" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100">
              回客户主档
            </NavLink>
            <NavLink to="/customer/contacts" className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100">
              回客户联系人
            </NavLink>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">客户 + 工厂</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">先切工厂上下文，再继续追这个客户</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              这里不直接拼接一张“客户工厂假看板”，而是把你送到真实会吃公司上下文的业务页。点击某个公司后，会先切换到对应公司，再带着当前客户继续下钻。
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <MapPinned size={20} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-4">
          {availableFactoryCards.map((card) => (
            <div
              key={card.code}
              className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {card.badge}
                  </span>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{companyLabels[card.code]}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
                </div>
                <MapPinned size={16} className="mt-1 shrink-0 text-slate-400" />
              </div>
              <div className="mt-4 grid gap-2">
                {factoryMatrix[card.code].map((entry) => (
                  <button
                    key={`${card.code}-${entry.label}`}
                    type="button"
                    onClick={() => handleFactoryJump(card.code, entry.to)}
                    className="group rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                        <entry.icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{entry.detail}</p>
                      </div>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {stages.map((stage) => (
          <article key={stage.title} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${stage.accent} p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{stage.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stage.description}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                <stage.icon size={20} />
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {stage.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="group rounded-2xl border border-white/80 bg-white/90 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{link.detail}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1 shrink-0 text-slate-600 transition group-hover:translate-x-1" />
                  </div>
                </NavLink>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
