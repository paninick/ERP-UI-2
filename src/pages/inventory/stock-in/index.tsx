import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import * as inventoryApi from '@/api/inventory';
import * as purchaseApi from '@/api/purchase';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: inventoryApi.listStockIn,
  get: inventoryApi.getStockIn,
  add: inventoryApi.addStockIn,
  update: inventoryApi.updateStockIn,
  remove: inventoryApi.delStockIn,
};

export default function StockInPage() {
  const { t } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRows, setDetailRows] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const inType = useDictOptions('erp_stock_in_type', [
    { value: '1', label: '采购入库' },
    { value: '2', label: '其他入库' },
    { value: '3', label: '完工入库' },
  ]);
  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
  ]);

  const columns = [
    { key: 'sn', title: t('page.stockIn.columns.stockInNo') },
    {
      key: 'srcBillNo',
      title: '来源单据',
      render: (_: any, record: any) => record.srcBillNo || record.purchaseSn || '-',
    },
    {
      key: 'inType',
      title: '入库类型',
      render: (value: string) => {
        const tag = inType.toTag(String(value), 'bg-blue-100 text-blue-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'bulkOrderNo', title: '大货款号' },
    { key: 'totalPrice', title: '入库金额' },
    {
      key: 'confirmStatus',
      title: '确认状态',
      render: (value: string) => {
        const tag = confirmStatus.toTag(String(value), 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'inDate', title: t('page.stockIn.columns.stockInDate') },
  ];

  const searchFields = [
    { name: 'sn', label: t('page.stockIn.columns.stockInNo') },
    { name: 'purchaseSn', label: '采购单号' },
    { name: 'bulkOrderNo', label: '大货款号' },
    { name: 'confirmStatus', label: '确认状态', type: 'select' as const, options: confirmStatus.options },
  ];

  const formFields = [
    { name: 'sn', label: t('page.stockIn.columns.stockInNo'), required: true },
    {
      name: 'inType',
      label: '入库类型',
      type: 'select' as const,
      required: true,
      options: inType.options,
    },
    { name: 'inDate', label: t('page.stockIn.columns.stockInDate'), type: 'date' as const, required: true },
    {
      name: 'srcBillType',
      label: '来源类型',
      type: 'select' as const,
      options: [
        { value: 'purchase', label: '采购单' },
        { value: 'produce_job', label: '生产工单' },
        { value: 'manual', label: '手工入库' },
      ],
    },
    { name: 'srcBillNo', label: '来源单号' },
    {
      name: 'purchaseId',
      label: '关联采购单',
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await purchaseApi.listPurchase({ pageNum: 1, pageSize: 200 });
        return (res.rows || []).map((item: any) => ({
          value: String(item.id),
          label: `${item.sn || item.id}${item.supplierName ? ` / ${item.supplierName}` : ''}`,
        }));
      },
    },
    { name: 'purchaseSn', label: '采购单号' },
    { name: 'bulkOrderNo', label: '大货款号' },
    { name: 'totalPrice', label: '入库金额', type: 'number' as const },
    {
      name: 'confirmStatus',
      label: '确认状态',
      type: 'select' as const,
      options: confirmStatus.options,
    },
    { name: 'confirmBy', label: '确认人' },
    { name: 'confirmTime', label: '确认时间', type: 'date' as const },
    { name: 'inDescription', label: '入库说明', type: 'textarea' as const },
    { name: 'remark', label: t('page.stockIn.columns.remark'), type: 'textarea' as const },
  ];

  const materialTypeOptions = [
    { value: '1', label: '主料' },
    { value: '2', label: '辅料' },
  ];

  const detailColumns = [
    { key: 'sn', title: '入库单号' },
    { key: 'materialId', title: '物料ID' },
    {
      key: 'materialType',
      title: '物料类型',
      render: (value: string) => {
        const option = materialTypeOptions.find(o => o.value === String(value));
        return option?.label || value;
      },
    },
    { key: 'materialNo', title: '物料编号' },
    { key: 'name', title: '物料名称' },
    { key: 'count', title: '数量' },
    { key: 'price', title: '单价' },
    { key: 'purchasePrice', title: '采购价' },
    { key: 'inTotalPrice', title: '小计' },
    { key: 'warehouseId', title: '仓库' },
    { key: 'warehouseAreaId', title: '库区' },
    { key: 'warehouseLocationId', title: '库位' },
    { key: 'saveLocation', title: '存放位置' },
    { key: 'birthingTime', title: '生产日期' },
  ];

  const handleViewDetail = async (record: any) => {
    setDetailOpen(true);
    setDetailTitle(`入库明细 - ${record.sn || record.id}`);
    setDetailLoading(true);
    try {
      const res: any = await inventoryApi.listStockInItemByInId(Number(record.id));
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setDetailRows(rows);
    } catch {
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <CrudPage
        title={t('page.stockIn.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
        extraActions={(record: any) => (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleViewDetail(record);
            }}
            className="rounded px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
          >
            查看明细
          </button>
        )}
      />

      <BaseModal
        open={detailOpen}
        title={detailTitle || '入库明细'}
        onClose={() => setDetailOpen(false)}
        width="960px"
      >
        <BaseTable columns={detailColumns} data={detailRows} loading={detailLoading} rowKey="id" />
      </BaseModal>
    </>
  );
}
