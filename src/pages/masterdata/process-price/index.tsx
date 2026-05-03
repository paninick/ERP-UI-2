import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, ClipboardList, Factory } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/processPrice';

export default function ProcessPrice() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listProcessPrice,
    get: api.getProcessPrice,
    add: api.addProcessPrice,
    update: api.updateProcessPrice,
    remove: (ids: string) => api.delProcessPrice(Number(ids)),
  };
  const columns = [
    { key: 'processName', title: t('processPrice.processName') },
    { key: 'price', title: t('processPrice.price') },
    { key: 'unit', title: t('processPrice.unit') },
    { key: 'currency', title: t('processPrice.currency') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700">财务成本口径</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('processPrice.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里维护的是工序成本标准，不是现场班组临时报价。生产执行只能引用价格快照，真正生效的工序价格应由财务或成本岗位维护，并作为计件、外协和成本归集的统一口径。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: BadgeDollarSign, label: '谁维护', value: '财务 / 成本会计' },
                { icon: Factory, label: '谁使用', value: '生产 / 外协 / 计件结算' },
                { icon: ClipboardList, label: '用途', value: '工序标准价 / 成本归集' },
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
              { to: '/production/process-def', title: '先核对工序定义', detail: '工序价格应建立在稳定的工序编码和名称之上。' },
              { to: '/piecewage', title: '再看计件工资', detail: '计件工资和外协结算应读取工序价格口径，而不是现场随意改价。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-amber-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('processPrice.title')} api={pageApi} columns={columns} />
    </div>
  );
}
