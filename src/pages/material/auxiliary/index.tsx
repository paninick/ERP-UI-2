import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Badge, PackagePlus, Tags } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as auxiliaryApi from '@/api/auxiliary';
import * as supplierApi from '@/api/supplier';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: auxiliaryApi.listAuxiliary,
  get: auxiliaryApi.getAuxiliary,
  add: auxiliaryApi.addAuxiliary,
  update: auxiliaryApi.updateAuxiliary,
  remove: auxiliaryApi.delAuxiliary,
};

export default function AuxiliaryPage() {
  const { t } = useTranslation();
  const auxiliaryType = useDictOptions('erp_auxiliary_material_type');
  const unitOptions = useDictOptions('erp_unit');
  const supplyMethod = useDictOptions('erp_supply_method');

  const columns = [
    { key: 'auxiliaryMaterialNo', title: t('page.auxiliaryMaterial.columns.auxiliaryMaterialNo') },
    { key: 'name', title: t('page.auxiliaryMaterial.columns.name') },
    {
      key: 'auxiliaryMaterialType',
      title: t('page.auxiliaryMaterial.columns.auxiliaryMaterialType'),
      render: (value: string) => {
        const tag = auxiliaryType.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'substance', title: t('page.auxiliaryMaterial.columns.substance') },
    { key: 'size', title: t('page.auxiliaryMaterial.columns.size') },
    {
      key: 'unit',
      title: t('page.auxiliaryMaterial.columns.unit'),
      render: (value: string) => unitOptions.labelMap[String(value)] || value || '-',
    },
    {
      key: 'supplyMethod',
      title: t('page.auxiliaryMaterial.columns.supplyMethod'),
      render: (value: string) => supplyMethod.labelMap[String(value)] || value || '-',
    },
    { key: 'supplierName', title: t('page.auxiliaryMaterial.columns.supplierName') },
  ];

  const searchFields = [
    { name: 'auxiliaryMaterialNo', label: t('page.auxiliaryMaterial.columns.auxiliaryMaterialNo') },
    { name: 'name', label: t('page.auxiliaryMaterial.columns.name') },
    { name: 'auxiliaryMaterialType', label: t('page.auxiliaryMaterial.columns.auxiliaryMaterialType'), type: 'select' as const, options: auxiliaryType.options },
  ];

  const formFields = [
    { name: 'auxiliaryMaterialNo', label: t('page.auxiliaryMaterial.columns.auxiliaryMaterialNo') },
    { name: 'name', label: t('page.auxiliaryMaterial.columns.name') },
    { name: 'auxiliaryMaterialType', label: t('page.auxiliaryMaterial.columns.auxiliaryMaterialType'), type: 'select' as const, options: auxiliaryType.options },
    { name: 'substance', label: t('page.auxiliaryMaterial.columns.substance') },
    { name: 'size', label: t('page.auxiliaryMaterial.columns.size') },
    { name: 'unit', label: t('page.auxiliaryMaterial.columns.unit'), type: 'select' as const, options: unitOptions.options },
    { name: 'supplyMethod', label: t('page.auxiliaryMaterial.columns.supplyMethod'), type: 'select' as const, options: supplyMethod.options },
    {
      name: 'supplierId',
      label: t('page.auxiliaryMaterial.columns.supplierName'),
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await supplierApi.listSupplier({ pageNum: 1, pageSize: 200 });
        return (res.rows || []).map((item: any) => ({ value: String(item.id), label: item.supplierName || String(item.id) }));
      },
    },
    { name: 'remark', label: t('page.auxiliaryMaterial.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-orange-700">辅料主数据</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.auxiliaryMaterial.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              辅料负责记录扣子、拉链、吊牌、洗标、包装物等配套材料主档。它和主料一样属于供应链主数据，但更偏附件和配件层，目标是让 BOM、采购和仓储都能引用统一辅料定义。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: PackagePlus, label: '它是什么', value: '配件与附件主档' },
                { icon: Tags, label: '常见内容', value: '扣子 / 拉链 / 洗标 / 包材' },
                { icon: Badge, label: '它不是什么', value: '不是临时采购备注' },
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
              { to: '/material/bom', title: '继续看 BOM', detail: '辅料应和主料一起被 BOM 引用，而不是采购时临时补写。' },
              { to: '/supplier', title: '再看供应商', detail: '辅料主档和默认供应商关系应在供应链侧稳定维护。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-orange-300 hover:bg-orange-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-orange-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        title={t('page.auxiliaryMaterial.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      />
    </div>
  );
}
