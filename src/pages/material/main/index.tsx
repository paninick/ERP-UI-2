import { AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Package2, Scale, Warehouse } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as materialApi from '@/api/material';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: materialApi.listMainMaterial,
  get: materialApi.getMainMaterial,
  add: materialApi.addMainMaterial,
  update: materialApi.updateMainMaterial,
  remove: materialApi.delMainMaterial,
};

export default function MainMaterialPage() {
  const { t } = useTranslation();
  const materialType = useDictOptions('erp_main_material_type');
  const supplyMethod = useDictOptions('erp_supply_method');
  const unitOptions = useDictOptions('erp_unit');

  const columns = [
    { key: 'mainMaterialNo', title: t('page.mainMaterial.columns.mainMaterialNo') },
    { key: 'name', title: t('page.mainMaterial.columns.name') },
    {
      key: 'mainMaterialType',
      title: t('page.mainMaterial.columns.mainMaterialType'),
      render: (value: string) => materialType.labelMap[String(value)] || value || '-',
    },
    { key: 'composition', title: t('page.mainMaterial.columns.composition') },
    { key: 'width', title: t('page.mainMaterial.columns.width') },
    { key: 'weight', title: t('page.mainMaterial.columns.weight') },
    {
      key: 'unit',
      title: t('page.mainMaterial.columns.unit'),
      render: (value: string) => unitOptions.labelMap[String(value)] || value || '-',
    },
    {
      key: 'supplyMethod',
      title: t('page.mainMaterial.columns.supplyMethod'),
      render: (value: string) => supplyMethod.labelMap[String(value)] || value || '-',
    },
    {
      key: 'price',
      title: t('page.mainMaterial.columns.price'),
      render: (value: number) => (value != null ? `CNY ${value}` : '-'),
    },
    {
      key: 'safeStockQty',
      title: t('page.mainMaterial.columns.safeStockQty'),
      render: (value: number) => value?.toFixed(2) || '-',
    },
    {
      key: 'currentStockQty',
      title: t('page.mainMaterial.columns.currentStockQty'),
      render: (value: number, record: any) => {
        const safe = record.safeStockQty;
        if (value === undefined || value === null || safe === undefined || safe === null) {
          return value?.toFixed(2) || '-';
        }
        if (value < safe) {
          return (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle size={14} />
              <span className="font-medium">{value.toFixed(2)}</span>
            </div>
          );
        }
        return <span className="text-green-600">{value.toFixed(2)}</span>;
      },
    },
    {
      key: 'stockAlert',
      title: t('page.mainMaterial.columns.stockAlert'),
      render: (_value: any, record: any) => {
        const current = record.currentStockQty;
        const safe = record.safeStockQty;
        if (current === undefined || current === null || safe === undefined || safe === null) {
          return '-';
        }
        if (current < safe) {
          return (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {t('page.mainMaterial.alerts.low')}
            </span>
          );
        }
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            {t('page.mainMaterial.alerts.normal')}
          </span>
        );
      },
    },
    { key: 'createTime', title: t('page.mainMaterial.columns.createTime') },
  ];

  const searchFields = [
    { name: 'mainMaterialNo', label: t('page.mainMaterial.columns.mainMaterialNo') },
    { name: 'name', label: t('page.mainMaterial.columns.name') },
    { name: 'mainMaterialType', label: t('page.mainMaterial.columns.mainMaterialType'), type: 'select' as const, options: materialType.options },
  ];

  const formFields = [
    { name: 'mainMaterialNo', label: t('page.mainMaterial.columns.mainMaterialNo'), required: true },
    { name: 'name', label: t('page.mainMaterial.columns.name'), required: true },
    { name: 'mainMaterialType', label: t('page.mainMaterial.columns.mainMaterialType'), type: 'select' as const, options: materialType.options },
    { name: 'composition', label: t('page.mainMaterial.columns.composition') },
    { name: 'width', label: t('page.mainMaterial.columns.width') },
    { name: 'weight', label: t('page.mainMaterial.columns.weight') },
    { name: 'yarnCount', label: t('page.mainMaterial.columns.yarnCount') },
    { name: 'unit', label: t('page.mainMaterial.columns.unit'), type: 'select' as const, options: unitOptions.options },
    { name: 'supplyMethod', label: t('page.mainMaterial.columns.supplyMethod'), type: 'select' as const, options: supplyMethod.options },
    { name: 'price', label: t('page.mainMaterial.columns.price'), type: 'number' as const },
    { name: 'safeStockQty', label: t('page.mainMaterial.columns.safeStockQty'), type: 'number' as const },
    { name: 'minStockQty', label: t('page.mainMaterial.columns.minStockQty'), type: 'number' as const },
    { name: 'maxStockQty', label: t('page.mainMaterial.columns.maxStockQty'), type: 'number' as const },
    { name: 'minOrderQty', label: t('page.mainMaterial.columns.minOrderQty'), type: 'number' as const },
    { name: 'purchasePrice', label: t('page.mainMaterial.columns.purchasePrice'), type: 'number' as const },
    { name: 'remark', label: t('page.mainMaterial.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">主料主数据</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.mainMaterial.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              主料是成衣核心材料主档，负责沉淀面料、纱线或主要成分的基础属性。它应服务 BOM、采购、库存和成本，是主料“是什么”的定义层，不是颜色尺码后的细颗粒库存记录。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Package2, label: '它是什么', value: '核心材料主档' },
                { icon: Scale, label: '核心内容', value: '成分 / 门幅 / 克重 / 单位' },
                { icon: Warehouse, label: '它不是什么', value: '不是 SKU 库存颗粒' },
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
              { to: '/masterdata/material-sku', title: '再看材料 SKU', detail: '主料确定后，颜色/尺码/库存颗粒可继续落到 SKU 层。' },
              { to: '/material/bom', title: '继续看 BOM', detail: 'BOM 应引用主料主档，而不是现场临时输入材料名。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        title={t('page.mainMaterial.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      />
    </div>
  );
}
