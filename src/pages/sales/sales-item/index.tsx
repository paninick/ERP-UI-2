import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ListTree, Palette, Ruler } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/salesOrderItem';

export default function SalesItem() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listSalesOrderItem,
    get: api.getSalesOrderItem,
    add: api.addSalesOrderItem,
    update: api.updateSalesOrderItem,
    remove: (ids: string) => api.delSalesOrderItem(Number(ids)),
  };
  const columns = [
    { key: 'orderNo', title: t('salesItem.orderNo') },
    { key: 'styleCode', title: t('salesItem.styleCode') },
    { key: 'colorCode', title: t('salesItem.colorCode') },
    { key: 'qty', title: t('salesItem.qty') },
    { key: 'unitPrice', title: t('salesItem.unitPrice') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-700">订单拆分口径</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('salesItem.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              销售明细不是另一张独立订单，它负责把销售订单拆成颜色、尺码、单价、数量等可执行分项。后续打样、技术、采购和生产更容易围绕这些明细确认差异，而不是直接在整单层面反复沟通。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ListTree, label: '它是什么', value: '销售订单的履约拆分' },
                { icon: Palette, label: '关键维度', value: '颜色 / 数量 / 单价' },
                { icon: Ruler, label: '它不是什么', value: '不是独立业务单据' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
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
              { to: '/sales/order', title: '回到销售订单', detail: '先确认整单交期、客户、数量，再看分项明细。' },
              { to: '/sales/tech', title: '继续看技术单', detail: '技术页应承接这些明细差异，而不是脱离订单单独存在。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-rose-300 hover:bg-rose-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-rose-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('salesItem.title')} api={pageApi} columns={columns} />
    </div>
  );
}
