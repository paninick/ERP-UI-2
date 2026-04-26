import { useTranslation } from 'react-i18next';
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
    <CrudPage
      title={t('page.auxiliaryMaterial.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
