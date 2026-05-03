import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Factory, Package, ShoppingCart, Truck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDashboardStats } from '@/api/dashboard';
import { useDictOptions } from '@/hooks/useDictOptions';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { t } = useTranslation();
  const salesOrderStatus = useDictOptions('sales_order_status');
  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.dashboard.planStatus.pending') },
    { value: '1', label: t('page.dashboard.planStatus.running') },
    { value: '2', label: t('page.dashboard.planStatus.completed') },
  ]);

  const [stats, setStats] = useState({
    salesCount: '-',
    customerCount: '-',
    jobCount: '-',
    inventoryCount: '-',
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [salesStatusBreakdown, setSalesStatusBreakdown] = useState<any[]>([]);
  const [jobStatusBreakdown, setJobStatusBreakdown] = useState<any[]>([]);

  useEffect(() => {
    getDashboardStats()
      .then((res: any) => {
        const data = res.data || res;
        if (data.stats) {
          setStats({
            salesCount: String(data.stats.salesCount ?? '-'),
            customerCount: String(data.stats.customerCount ?? '-'),
            jobCount: String(data.stats.jobCount ?? '-'),
            inventoryCount: String(data.stats.inventoryCount ?? '-'),
          });
        }
        setRecentSales(data.recentSales || []);
        setRecentJobs(data.recentJobs || []);
        setSalesStatusBreakdown(data.salesStatusBreakdown || []);
        setJobStatusBreakdown(data.jobStatusBreakdown || []);
      })
      .catch(() => {});
  }, []);

  const salesStatusData = useMemo(() =>
    salesStatusBreakdown.map((item: any) => {
      const tag = salesOrderStatus.toTag(String(item.status));
      return { name: tag.label, value: item.count };
    }),
    [salesStatusBreakdown, salesOrderStatus],
  );

  const jobStatusData = useMemo(() =>
    jobStatusBreakdown.map((item: any) => {
      const tag = planStatus.toTag(String(item.status));
      return { name: tag.label, value: item.count };
    }),
    [jobStatusBreakdown, planStatus],
  );

  const cards = [
    { label: t('page.dashboard.cards.salesCount'), value: stats.salesCount, icon: ShoppingCart, color: 'bg-indigo-500', link: '/sales/order' },
    { label: t('page.dashboard.cards.customerCount'), value: stats.customerCount, icon: Users, color: 'bg-blue-500', link: '/customer' },
    { label: t('page.dashboard.cards.jobCount'), value: stats.jobCount, icon: Factory, color: 'bg-emerald-500', link: '/production/job' },
    { label: t('page.dashboard.cards.inventoryCount'), value: stats.inventoryCount, icon: Package, color: 'bg-amber-500', link: '/inventory/list' },
  ];

  const flowCards = [
    {
      title: '1. 销售与客户',
      summary: '销售订单、客户、款号、打样通知',
      link: '/sales/order',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: '2. 技术与BOM',
      summary: '技术单、BOM、工艺路线、损耗矩阵',
      link: '/sales/tech',
      color: 'from-cyan-500 to-sky-500',
    },
    {
      title: '3. 采购与供应',
      summary: '采购单、供应商、外协链路',
      link: '/purchase',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '4. 生产与排期',
      summary: '生产计划、甘特、工单、报工、看板',
      link: '/production/plan',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: '5. 质量与放行',
      summary: '品质检验、检品预约、日单放行、缺陷闭环',
      link: '/quality/inspection',
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: '6. 仓储与出货',
      summary: '入库、出库、库存、出货单',
      link: '/inventory/stock-out',
      color: 'from-violet-500 to-fuchsia-500',
    },
    {
      title: '7. 财务与结算',
      summary: '成本汇总、发票、公司发票、计件工资',
      link: '/finance/invoice',
      color: 'from-slate-700 to-slate-500',
    },
  ];

  const chainCards = [
    {
      title: '销售订单',
      code: 'CODEX-TD23-SALES-C',
      detail: '客户下单起点',
      link: '/sales/order?salesNo=CODEX-TD23-SALES-C',
    },
    {
      title: '技术单',
      code: 'CODEX-TD24-STYLE-C',
      detail: '打样与工艺对象',
      link: '/sales/tech?styleCode=CODEX-TD24-STYLE-C',
    },
    {
      title: '采购单',
      code: 'CODEX-TD24-PURCHASE-C',
      detail: '采购联动样板',
      link: '/purchase?sn=CODEX-TD24-PURCHASE-C',
    },
    {
      title: '采购入库',
      code: 'CODEX-TD24-PURCHASE-STOCKIN-C',
      detail: '采购到货入库',
      link: '/inventory/stock-in?sn=CODEX-TD24-PURCHASE-STOCKIN-C',
    },
    {
      title: '生产计划',
      code: 'CODEX-TD23-PLAN-C',
      detail: '排期入口',
      link: '/production/plan?planNo=CODEX-TD23-PLAN-C',
    },
    {
      title: '生产工单',
      code: 'CODEX-TD23-JOB-C',
      detail: '生产执行入口',
      link: '/production/job?jobNo=CODEX-TD23-JOB-C',
    },
    {
      title: '品质检验',
      code: 'CODEX-TD23-JOB-C',
      detail: '按工单追到质检',
      link: '/quality/inspection?jobNo=CODEX-TD23-JOB-C',
    },
    {
      title: '成品出库',
      code: 'CODEX-TD23-STOCKOUT-C',
      detail: '成品发货前出库',
      link: '/inventory/stock-out?sn=CODEX-TD23-STOCKOUT-C',
    },
    {
      title: '出货单',
      code: 'CODEX-TD23-SHIPMENT-C',
      detail: '客户出货节点',
      link: '/inventory/shipment?shipmentNo=CODEX-TD23-SHIPMENT-C',
    },
    {
      title: '结算发票',
      code: 'INV-CODEX-TD23-C',
      detail: '销售结算端点',
      link: '/finance/invoice?invoiceNo=INV-CODEX-TD23-C',
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-slate-800">{t('page.dashboard.title')}</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <NavLink
            key={card.label}
            to={card.link}
            className="apple-card group flex items-center gap-4 p-6"
          >
            <div className={`${card.color} rounded-xl p-3 text-white`}>
              <card.icon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">{card.label}</p>
              <span className="text-2xl font-bold text-slate-800">{card.value}</span>
            </div>
            <ArrowRight size={16} className="text-slate-300 transition group-hover:text-slate-500" />
          </NavLink>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">业务主流程</h3>
            <p className="text-sm text-slate-500">按业务顺序查看上下游，不再按零散模块找页面。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {flowCards.map((item) => (
            <NavLink
              key={item.link}
              to={item.link}
              className={`group overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${item.color} p-[1px] shadow-sm`}
            >
              <div className="flex h-full items-center justify-between rounded-[calc(1.5rem-1px)] bg-white/95 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.summary}</p>
                </div>
                <div className="rounded-full bg-slate-900 p-2 text-white transition group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">柬埔寨联动样板链</h3>
            <p className="text-sm text-slate-500">在柬埔寨公司视角下，按同一组样板单号逐环查看销售到结算。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {chainCards.map((item) => (
            <NavLink
              key={item.link}
              to={item.link}
              className="group rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 break-all text-sm text-indigo-600">{item.code}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{item.detail}</span>
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {salesStatusData.length > 0 && (
          <div className="apple-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">{t('page.dashboard.chartSalesStatus')}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={salesStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {salesStatusData.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {jobStatusData.length > 0 && (
          <div className="apple-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">{t('page.dashboard.chartJobStatus')}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={jobStatusData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {jobStatusData.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="apple-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{t('page.dashboard.recentSales')}</h3>
            <NavLink to="/sales/order" className="text-sm text-indigo-600 hover:text-indigo-700">
              {t('page.dashboard.viewAll')}
            </NavLink>
          </div>
          {recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{t('page.dashboard.empty')}</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((item: any) => {
                const tag = salesOrderStatus.toTag(item.orderStatus);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.salesNo}</p>
                      <p className="text-xs text-slate-400">{item.customerName}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="apple-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{t('page.dashboard.recentJobs')}</h3>
            <NavLink to="/production/job" className="text-sm text-indigo-600 hover:text-indigo-700">
              {t('page.dashboard.viewAll')}
            </NavLink>
          </div>
          {recentJobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{t('page.dashboard.empty')}</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((item: any) => {
                const tag = planStatus.toTag(item.status);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.jobNo}</p>
                      <p className="text-xs text-slate-400">
                        {t('page.dashboard.jobSummary', {
                          styleCode: item.styleCode || '-',
                          qty: item.planQty ?? '-',
                        })}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('page.dashboard.quickActions.addSales'), path: '/sales/order', icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-50' },
          { label: t('page.dashboard.quickActions.addJob'), path: '/production/job', icon: Factory, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('page.dashboard.quickActions.stockIn'), path: '/inventory/stock-in', icon: Truck, color: 'text-amber-600 bg-amber-50' },
          { label: t('page.dashboard.quickActions.qualityCheck'), path: '/quality', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="apple-card flex items-center gap-3 p-4"
          >
            <div className={`rounded-lg p-2 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
