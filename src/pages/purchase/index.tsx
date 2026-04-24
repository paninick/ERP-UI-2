import CrudPage from '@/components/ui/CrudPage';
import * as purchaseApi from '@/api/purchase';
import { useDictOptions } from '@/hooks/useDictOptions';
import PurchaseForm from './form';

const api = {
  list: purchaseApi.listPurchase,
  get: purchaseApi.getPurchase,
  add: purchaseApi.addPurchase,
  update: purchaseApi.updatePurchase,
  remove: purchaseApi.delPurchase,
};

function renderTag(
  value: string,
  toTag: (value: any, fallbackColor?: string) => { label: string; color: string },
  fallbackColor: string,
) {
  const tag = toTag(value, fallbackColor);
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
}

export default function PurchasePage() {
  const purchaseType = useDictOptions('erp_purchase_type', [
    { value: '原材料', label: '原材料' },
    { value: '辅料', label: '辅料' },
    { value: '成品', label: '成品' },
    { value: '包材', label: '包材' },
  ]);

  const purchaseStatus = useDictOptions('erp_purchase_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
  ]);

  const columns = [
    { key: 'sn', title: '采购单号' },
    {
      key: 'type',
      title: '采购类型',
      render: (value: string) => renderTag(value, purchaseType.toTag, 'bg-blue-100 text-blue-600'),
    },
    { key: 'supplierName', title: '供应商' },
    { key: 'bulkOrderNo', title: '大货订单号' },
    { key: 'description', title: '采购说明' },
    { key: 'expectedDeliveryDate', title: '预计交期' },
    { key: 'purchaseName', title: '采购员' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => renderTag(value, purchaseStatus.toTag, 'bg-slate-100 text-slate-600'),
    },
    {
      key: 'amount',
      title: '金额',
      render: (value: number) => (value != null ? `¥${value.toFixed(2)}` : '-'),
    },
  ];

  const searchFields = [
    { name: 'sn', label: '采购单号' },
    { name: 'type', label: '采购类型', type: 'select' as const, options: purchaseType.options },
    { name: 'status', label: '状态', type: 'select' as const, options: purchaseStatus.options },
  ];

  return (
    <CrudPage
      title="采购管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={PurchaseForm}
    />
  );
}
