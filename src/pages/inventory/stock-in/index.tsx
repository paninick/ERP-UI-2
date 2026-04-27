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
      title: t('stockInLabels.srcBillNo'),
      render: (_: any, record: any) => record.srcBillNo || record.purchaseSn || '-',
    },
    {
      key: 'inType',
      title: t('stockInLabels.inType'),
      render: (value: string) => {
        const tag = inType.toTag(String(value), 'bg-blue-100 text-blue-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'bulkOrderNo', title: t('stockInLabels.bulkOrderNo') },
    { key: 'totalPrice', title: t('stockInLabels.totalPrice') },
    {
      key: 'confirmStatus',
      title: t('stockInLabels.confirmStatus'),
      render: (value: string) => {
        const tag = confirmStatus.toTag(String(value), 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'inDate', title: t('page.stockIn.columns.stockInDate') },
  ];

  const searchFields = [
    { name: 'sn', label: t('page.stockIn.columns.stockInNo') },
    { name: 'purchaseSn', label: t('stockInLabels.purchaseSn') },
    { name: 'bulkOrderNo', label: t('stockInLabels.bulkOrderNo') },
    { name: 'confirmStatus', label: t('stockInLabels.confirmStatus'), type: 'select' as const, options: confirmStatus.options },
  ];

  const S = 'stockInLabels';
  const formFields = [
    { name: 'sn', label: t('page.stockIn.columns.stockInNo'), required: true, group: t(`${S}.groupBasic`) },
    {
      name: 'inType',
      label: t(`${S}.inType`),
      type: 'select' as const,
      required: true,
      options: inType.options,
      group: t(`${S}.groupBasic`),
    },
    { name: 'inDate', label: t('page.stockIn.columns.stockInDate'), type: 'date' as const, required: true, group: t(`${S}.groupBasic`) },
    { name: 'totalPrice', label: t(`${S}.totalPrice`), type: 'number' as const, group: t(`${S}.groupBasic`) },
    {
      name: 'srcBillType',
      label: t(`${S}.srcBillType`),
      type: 'select' as const,
      options: [
        { value: 'purchase', label: '采购单' },
        { value: 'produce_job', label: '生产工单' },
        { value: 'manual', label: '手工入库' },
      ],
      group: t(`${S}.groupSource`),
    },
    { name: 'srcBillNo', label: t(`${S}.srcBillNo`), group: t(`${S}.groupSource`) },
    {
      name: 'purchaseId',
      label: t(`${S}.purchaseId`),
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await purchaseApi.listPurchase({ pageNum: 1, pageSize: 200 });
        return (res.rows || []).map((item: any) => ({
          value: String(item.id),
          label: `${item.sn || item.id}${item.supplierName ? ` / ${item.supplierName}` : ''}`,
        }));
      },
      group: t(`${S}.groupSource`),
    },
    { name: 'purchaseSn', label: t(`${S}.purchaseSn`), group: t(`${S}.groupSource`) },
    { name: 'bulkOrderNo', label: t(`${S}.bulkOrderNo`), group: t(`${S}.groupSource`) },
    {
      name: 'confirmStatus',
      label: t(`${S}.confirmStatus`),
      type: 'select' as const,
      options: confirmStatus.options,
      group: t(`${S}.groupConfirm`),
    },
    { name: 'confirmBy', label: t(`${S}.confirmBy`), group: t(`${S}.groupConfirm`) },
    { name: 'confirmTime', label: t(`${S}.confirmTime`), type: 'date' as const, group: t(`${S}.groupConfirm`) },
    { name: 'inDescription', label: t(`${S}.inDescription`), type: 'textarea' as const },
    { name: 'remark', label: t('page.stockIn.columns.remark'), type: 'textarea' as const },
  ];

  const materialTypeOptions = [
    { value: '1', label: '主料' },
    { value: '2', label: '辅料' },
  ];

  const detailColumns = [
    { key: 'sn', title: t('stockInLabels.detailEntryNo', '入库单号') },
    { key: 'materialId', title: t('stockInLabels.detailMaterialId', '物料ID') },
    {
      key: 'materialType',
      title: t('stockInLabels.materialType'),
      render: (value: string) => {
        const option = materialTypeOptions.find(o => o.value === String(value));
        return option?.label || value;
      },
    },
    { key: 'materialNo', title: t('stockInLabels.detailMaterialNo', '物料编号') },
    { key: 'name', title: t('stockInLabels.detailMaterialName', '物料名称') },
    { key: 'count', title: t('stockInLabels.detailCount', '数量') },
    { key: 'price', title: t('stockInLabels.detailPrice', '单价') },
    { key: 'purchasePrice', title: t('stockInLabels.detailPurchasePrice', '采购价') },
    { key: 'inTotalPrice', title: t('stockInLabels.detailSubtotal', '小计') },
    { key: 'warehouseId', title: t('stockInLabels.detailWarehouse', '仓库') },
    { key: 'warehouseAreaId', title: t('stockInLabels.detailArea', '库区') },
    { key: 'warehouseLocationId', title: t('stockInLabels.detailLocation', '库位') },
    { key: 'saveLocation', title: t('stockInLabels.detailSaveLocation', '存放位置') },
    { key: 'birthingTime', title: t('stockInLabels.detailProduceDate', '生产日期') },
  ];

  const handleViewDetail = async (record: any) => {
    setDetailOpen(true);
    setDetailTitle(`${t('stockInLabels.detailTitle')} - ${record.sn || record.id}`);
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
            {t('stockInLabels.detailView')}
          </button>
        )}
      />

      <BaseModal
        open={detailOpen}
        title={detailTitle || t('stockInLabels.detailTitle')}
        onClose={() => setDetailOpen(false)}
        width="960px"
      >
        <BaseTable columns={detailColumns} data={detailRows} loading={detailLoading} rowKey="id" />
      </BaseModal>
    </>
  );
}
