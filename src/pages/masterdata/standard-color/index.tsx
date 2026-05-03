import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Palette, Pipette, SwatchBook } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/standardColor';

export default function StandardColor() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listStandardColor,
    get: api.getStandardColor,
    add: api.addStandardColor,
    update: api.updateStandardColor,
    remove: (ids: string) => api.delStandardColor(Number(ids)),
  };
  const columns = [
    { key: 'colorCode', title: t('standardColor.colorCode') },
    { key: 'colorName', title: t('standardColor.colorName') },
    { key: 'colorType', title: t('standardColor.colorType') },
    { key: 'rgb', title: t('standardColor.rgb') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-pink-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-pink-700">颜色基准库</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('standardColor.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              标准色不是某一张订单的临时颜色备注，而应作为系统颜色基准库。材料、BOM、客户色卡沟通和材料 SKU 的颜色维度都应尽量围绕这里统一表达，减少不同页面各写一套颜色名称的混乱。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Palette, label: '它是什么', value: '统一颜色基准库' },
                { icon: Pipette, label: '关联对象', value: '材料 / BOM / SKU / 色卡' },
                { icon: SwatchBook, label: '它不是什么', value: '不是订单临时备注色' },
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
              { to: '/masterdata/material-sku', title: '继续看材料 SKU', detail: '颜色基准统一后，SKU 的颜色维度才容易稳定管理。' },
              { to: '/material/bom', title: '再看 BOM', detail: 'BOM 中的颜色表达应尽量继承标准色口径。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-pink-300 hover:bg-pink-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-pink-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('standardColor.title')} api={pageApi} columns={columns} />
    </div>
  );
}
