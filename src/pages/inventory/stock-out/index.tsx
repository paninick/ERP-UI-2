import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as inventoryApi from '@/api/inventory';
import * as warehouseApi from '@/api/warehouse';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: inventoryApi.listStockOut,
  get: inventoryApi.getStockOut,
  add: inventoryApi.addStockOut,
  update: inventoryApi.updateStockOut,
  remove: inventoryApi.delStockOut,
};

export default function StockOutPage() {
  const statusOptions = useDictOptions('sys_common_status', [
    {value: '0', label: '待审核'},
    {value: '1', label: '已审核'},
  ]);

  const columns = [
    {key: 'stockOutNo', title: '出库单号'},
    {key: 'warehouseName', title: '仓库'},
    {key: 'materialName', title: '物料名称'},
    {key: 'quantity', title: '数量'},
    {key: 'stockOutDate', title: '出库日期'},
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = statusOptions.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    {name: 'stockOutNo', label: '出库单号'},
    {name: 'materialName', label: '物料名称'},
  ];

  const formFields = [
    {name: 'stockOutNo', label: '出库单号', required: true},
    {
      name: 'warehouseId',
      label: '仓库',
      type: 'select' as const,
      required: true,
      loadOptions: async () => {
        const res: any = await warehouseApi.listWarehouse({pageNum: 1, pageSize: 200});
        return (res.rows || []).map((w: any) => ({value: String(w.id), label: w.name || w.warehouseName || String(w.id)}));
      },
    },
    {name: 'materialName', label: '物料名称', required: true},
    {name: 'quantity', label: '数量', type: 'number' as const, required: true},
    {name: 'stockOutDate', label: '出库日期', type: 'date' as const},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="出库管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
