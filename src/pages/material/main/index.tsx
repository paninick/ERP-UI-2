import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    <CrudPage
      title={t('page.mainMaterial.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
