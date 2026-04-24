import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Factory, Package, ShoppingCart, Truck, Users } from 'lucide-react';
import * as customerApi from '@/api/customer';
import * as inventoryApi from '@/api/inventory';
import * as productionApi from '@/api/production';
import * as salesApi from '@/api/sales';
import { useDictOptions } from '@/hooks/useDictOptions';

export default function Dashboard() {
  const salesOrderStatus = useDictOptions('sales_order_status');
  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
  ]);

  const [stats, setStats] = useState({
    salesCount: '-',
    customerCount: '-',
    jobCount: '-',
    inventoryCount: '-',
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    salesApi
      .listSalesOrder({ pageNum: 1, pageSize: 1 })
      .then((response: any) => {
        setStats((prev) => ({ ...prev, salesCount: String(response.total ?? '-') }));
      })
      .catch(() => {});
    customerApi
      .listCustomer({ pageNum: 1, pageSize: 1 })
      .then((response: any) => {
        setStats((prev) => ({ ...prev, customerCount: String(response.total ?? '-') }));
      })
      .catch(() => {});
    productionApi
      .listProduceJob({ pageNum: 1, pageSize: 1 })
      .then((response: any) => {
        setStats((prev) => ({ ...prev, jobCount: String(response.total ?? '-') }));
      })
      .catch(() => {});
    inventoryApi
      .listInventory({ pageNum: 1, pageSize: 1 })
      .then((response: any) => {
        setStats((prev) => ({ ...prev, inventoryCount: String(response.total ?? '-') }));
      })
      .catch(() => {});

    salesApi
      .listSalesOrder({ pageNum: 1, pageSize: 5 })
      .then((response: any) => {
        setRecentSales(response.rows || []);
      })
      .catch(() => {});
    productionApi
      .listProduceJob({ pageNum: 1, pageSize: 5 })
      .then((response: any) => {
        setRecentJobs(response.rows || []);
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: '销售订单', value: stats.salesCount, icon: ShoppingCart, color: 'bg-indigo-500', link: '/sales/order' },
    { label: '客户总数', value: stats.customerCount, icon: Users, color: 'bg-blue-500', link: '/customer' },
    { label: '生产工单', value: stats.jobCount, icon: Factory, color: 'bg-emerald-500', link: '/production/job' },
    { label: '库存物料', value: stats.inventoryCount, icon: Package, color: 'bg-amber-500', link: '/inventory/list' },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-slate-800">工作台</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <NavLink
            key={card.label}
            to={card.link}
            className="group flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">最近销售订单</h3>
            <NavLink to="/sales/order" className="text-sm text-indigo-600 hover:text-indigo-700">
              查看全部
            </NavLink>
          </div>
          {recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((item) => {
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

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">最近生产工单</h3>
            <NavLink to="/production/job" className="text-sm text-indigo-600 hover:text-indigo-700">
              查看全部
            </NavLink>
          </div>
          {recentJobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((item) => {
                const tag = planStatus.toTag(item.status);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.jobNo}</p>
                      <p className="text-xs text-slate-400">
                        {item.styleCode} · 计划 {item.planQty}
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
          { label: '新增销售订单', path: '/sales/order', icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-50' },
          { label: '新增生产工单', path: '/production/job', icon: Factory, color: 'text-emerald-600 bg-emerald-50' },
          { label: '入库登记', path: '/inventory/stock-in', icon: Truck, color: 'text-amber-600 bg-amber-50' },
          { label: '品质检验', path: '/quality', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
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
