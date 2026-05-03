import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Boxes, Palette, ScanBarcode } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/materialSku';

export default function MaterialSku() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listMaterialSku,
    get: api.getMaterialSku,
    add: api.addMaterialSku,
    update: api.updateMaterialSku,
    remove: (ids: string) => api.delMaterialSku(Number(ids)),
  };
  const columns = [
    { key: 'materialName', title: t('materialSku.materialName') },
    { key: 'colorCode', title: t('materialSku.colorCode') },
    { key: 'sizeCode', title: t('materialSku.sizeCode') },
    { key: 'skuCode', title: t('materialSku.skuCode') },
    { key: 'stockQty', title: t('materialSku.stockQty') },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-violet-700">库存颗粒层</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('materialSku.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              材料 SKU 不是材料主档本身，它是材料在颜色、尺码、规格等维度上的细颗粒库存编码层。主料和辅料先定义“是什么”，SKU 再回答“同一材料的哪个颜色、哪个规格、当前还有多少库存”。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ScanBarcode, label: '它是什么', value: '材料细颗粒编码层' },
                { icon: Palette, label: '核心维度', value: '颜色 / 尺码 / SKU 编码' },
                { icon: Boxes, label: '它不是什么', value: '不是材料主档替身' },
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
              { to: '/material/main', title: '回看主料主档', detail: '先定义材料主档，再细化到 SKU 层。' },
              { to: '/masterdata/standard-color', title: '再看标准色', detail: 'SKU 的颜色维度应尽量引用统一标准色基准。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-violet-300 hover:bg-violet-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-violet-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage title={t('materialSku.title')} api={pageApi} columns={columns} />
    </div>
  );
}
