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
  const commonStatus = useDictOptions('sys_common_status', [
    { value: '0', label: '启用' },
    { value: '1', label: '停用' },
  ]);

  const columns = [
    { key: 'warehouseName', title: '仓库名称' },
    { key: 'warehouseCode', title: '仓库编码' },
    { key: 'address', title: '地址' },
    { key: 'manager', title: '负责人' },
    { key: 'phone', title: '联系电话' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = commonStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'warehouseName', label: '仓库名称' },
    { name: 'warehouseCode', label: '仓库编码' },
    { name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options },
  ];

  const formFields = [
    { name: 'warehouseName', label: '仓库名称', required: true },
    { name: 'warehouseCode', label: '仓库编码', required: true },
    { name: 'address', label: '地址' },
    { name: 'manager', label: '负责人' },
    { name: 'phone', label: '联系电话' },
    { name: 'status', label: '状态', type: 'select' as const, options: commonStatus.options },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="仓库管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
