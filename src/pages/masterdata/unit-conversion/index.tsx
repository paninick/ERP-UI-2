import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Boxes, Scale, Shirt } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/unitConversion';

export default function UnitConversion() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listUnitConversion,
    get: api.getUnitConversion,
    add: api.addUnitConversion,
    update: api.updateUnitConversion,
    remove: (ids: string) => api.delUnitConversion(Number(ids)),
  };
  const columns = [
    { key: 'fromUnit', title: t('unitConversion.fromUnit') },
    { key: 'toUnit', title: t('unitConversion.toUnit') },
    { key: 'factor', title: t('unitConversion.factor') },
    { key: 'category', title: t('unitConversion.category') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-700">供应链主数据</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('unitConversion.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              这里维护的是基础单位换算口径，服务 BOM 单耗、采购数量、库存收发和成本折算。当前页面更适合维护通用换算关系，针织服装专用公式仍需要在后续把纱线、克重、用量估算等场景继续补强。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Scale, label: '维护内容', value: 'kg / g / m / 件 等基础换算' },
                { icon: Boxes, label: '服务对象', value: 'BOM / 采购 / 仓储 / 成本' },
                { icon: Shirt, label: '当前边界', value: '针织专用公式后续补齐' },
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
              { to: '/material/bom', title: '先看 BOM 应用', detail: '单位换算首先服务于 BOM 单耗和材料需求计算。' },
              { to: '/material/main', title: '再核对材料主档', detail: '主料辅料的采购和库存单位应和这里的换算口径一致。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-cyan-300 hover:bg-cyan-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-cyan-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('unitConversion.title')} api={pageApi} columns={columns} />
    </div>
  );
}
