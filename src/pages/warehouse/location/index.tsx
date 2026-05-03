import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/warehouseLocation';
import { useDictOptions } from '@/hooks/useDictOptions';

const pageApi = {
  list: api.listWarehouseLocation,
  get: api.getWarehouseLocation,
  add: api.addWarehouseLocation,
  update: api.updateWarehouseLocation,
  remove: api.delWarehouseLocation,
};

export default function WarehouseLocationPage() {
  const { t } = useTranslation();
  const status = useDictOptions('sys_normal_disable');

  const columns = [
    { key: 'code', title: t('warehouseLocation.locationCode') },
    { key: 'name', title: t('warehouseLocation.locationName') },
    { key: 'warehouseName', title: t('warehouseLocation.warehouseId') },
    { key: 'warehouseAreaName', title: t('warehouseLocation.areaId') },
    {
      key: 'status',
      title: t('warehouseLocation.status'),
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'remark', title: t('warehouseLocation.remark') },
  ];

  const searchFields = [
    { name: 'code', label: t('warehouseLocation.locationCode') },
    { name: 'name', label: t('warehouseLocation.locationName') },
  ];

  const formFields = [
    { name: 'code', label: t('warehouseLocation.locationCode'), required: true },
    { name: 'name', label: t('warehouseLocation.locationName'), required: true },
    { name: 'warehouseAreaId', label: t('warehouseLocation.areaId') },
    { name: 'warehouseId', label: t('warehouseLocation.warehouseId') },
    { name: 'status', label: t('warehouseLocation.status'), type: 'select' as const, options: status.options },
    { name: 'remark', label: t('warehouseLocation.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('warehouseLocation.title')}
      api={pageApi}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
