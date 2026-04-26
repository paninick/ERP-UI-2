import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as warehouseApi from '@/api/warehouse';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: warehouseApi.listWarehouse,
  get: warehouseApi.getWarehouse,
  add: warehouseApi.addWarehouse,
  update: warehouseApi.updateWarehouse,
  remove: warehouseApi.delWarehouse,
};

export default function WarehousePage() {
  const { t } = useTranslation();
  const commonStatus = useDictOptions('sys_common_status', [
    { value: '0', label: t('page.warehouse.status.enabled') },
    { value: '1', label: t('page.warehouse.status.disabled') },
  ]);

  const columns = [
    { key: 'warehouseName', title: t('page.warehouse.columns.warehouseName') },
    { key: 'warehouseCode', title: t('page.warehouse.columns.warehouseCode') },
    { key: 'address', title: t('page.warehouse.columns.address') },
    { key: 'manager', title: t('page.warehouse.columns.manager') },
    { key: 'phone', title: t('page.warehouse.columns.phone') },
    {
      key: 'status',
      title: t('page.warehouse.columns.status'),
      render: (value: string) => {
        const tag = commonStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'warehouseName', label: t('page.warehouse.columns.warehouseName') },
    { name: 'warehouseCode', label: t('page.warehouse.columns.warehouseCode') },
    { name: 'status', label: t('page.warehouse.columns.status'), type: 'select' as const, options: commonStatus.options },
  ];

  const formFields = [
    { name: 'warehouseName', label: t('page.warehouse.columns.warehouseName'), required: true },
    { name: 'warehouseCode', label: t('page.warehouse.columns.warehouseCode'), required: true },
    { name: 'address', label: t('page.warehouse.columns.address') },
    { name: 'manager', label: t('page.warehouse.columns.manager') },
    { name: 'phone', label: t('page.warehouse.columns.phone') },
    { name: 'status', label: t('page.warehouse.columns.status'), type: 'select' as const, options: commonStatus.options },
    { name: 'remark', label: t('page.warehouse.columns.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.warehouse.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
