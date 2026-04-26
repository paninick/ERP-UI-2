import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import { toast } from '@/components/ui/Toast';
import * as inventoryApi from '@/api/inventory';
import * as produceMaterialConsumeApi from '@/api/produceMaterialConsume';
import * as productionApi from '@/api/production';
import * as purchaseApi from '@/api/purchase';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: inventoryApi.listStockOut,
  get: inventoryApi.getStockOut,
  add: inventoryApi.addStockOut,
  update: inventoryApi.updateStockOut,
  remove: inventoryApi.delStockOut,
};

function normalizeRows(payload: any) {
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function StockOutPage() {
  const { t } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRows, setDetailRows] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [consumeOpen, setConsumeOpen] = useState(false);
  const [consumeRows, setConsumeRows] = useState<any[]>([]);
  const [consumeTitle, setConsumeTitle] = useState('');
  const [consumeLoading, setConsumeLoading] = useState(false);
  const [syncingStockOutId, setSyncingStockOutId] = useState<number | null>(null);

  const outType = useDictOptions('erp_stock_out_type', [
    { value: '1', label: '材料出库' },
    { value: '2', label: '成品出库' },
    { value: '3', label: '外协发料' },
  ]);
  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: '待确认' },
    { value: '1', label: '已确认' },
  ]);

  const columns = [
    { key: 'sn', title: t('page.stockOut.columns.stockOutNo') },
    {
      key: 'srcBillNo',
      title: '来源单据',
      render: (_: any, record: any) => record.srcBillNo || record.purchaseSn || '-',
    },
    {
      key: 'outType',
      title: '出库类型',
      render: (value: string) => {
        const tag = outType.toTag(String(value), 'bg-amber-100 text-amber-700');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'bulkOrderNo', title: '大货款号' },
    { key: 'applicant', title: '申请人' },
    {
      key: 'confirmStatus',
      title: '确认状态',
      render: (value: string) => {
        const tag = confirmStatus.toTag(String(value), 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'outDate', title: t('page.stockOut.columns.stockOutDate') },
  ];

  const searchFields = [
    { name: 'sn', label: t('page.stockOut.columns.stockOutNo') },
    { name: 'purchaseSn', label: '采购单号' },
    { name: 'bulkOrderNo', label: '大货款号' },
    { name: 'confirmStatus', label: '确认状态', type: 'select' as const, options: confirmStatus.options },
  ];

  const formFields = [
    { name: 'sn', label: t('page.stockOut.columns.stockOutNo'), required: true },
    {
      name: 'outType',
      label: '出库类型',
      type: 'select' as const,
      required: true,
      options: outType.options,
    },
    { name: 'outDate', label: t('page.stockOut.columns.stockOutDate'), type: 'date' as const, required: true },
    {
      name: 'srcBillType',
      label: '来源类型',
      type: 'select' as const,
      options: [
        { value: 'purchase', label: '采购单' },
        { value: 'produce_plan', label: '生产计划' },
        { value: 'produce_job', label: '生产工单' },
        { value: 'manual', label: '手工出库' },
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
    {
      name: 'planId',
      label: '关联生产计划',
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await productionApi.listProducePlan({ pageNum: 1, pageSize: 200 });
        return (res.rows || []).map((item: any) => ({
          value: String(item.id),
          label: `${item.planNo || item.id}${item.styleCode ? ` / ${item.styleCode}` : ''}`,
        }));
      },
    },
    { name: 'bulkOrderNo', label: '大货款号' },
    { name: 'applicant', label: '申请人' },
    { name: 'applyDate', label: '申请日期', type: 'date' as const },
    {
      name: 'confirmStatus',
      label: '确认状态',
      type: 'select' as const,
      options: confirmStatus.options,
    },
    { name: 'confirmBy', label: '确认人' },
    { name: 'confirmTime', label: '确认时间', type: 'date' as const },
    { name: 'outDescription', label: '出库说明', type: 'textarea' as const },
    { name: 'remark', label: t('page.stockOut.columns.remark'), type: 'textarea' as const },
  ];

  const materialTypeOptions = [
    { value: '1', label: '主料' },
    { value: '2', label: '辅料' },
  ];

  const detailColumns = [
    { key: 'sn', title: '出库单号' },
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
    { key: 'name', title: '名称' },
    { key: 'count', title: '数量' },
    { key: 'composition', title: '成分' },
    { key: 'width', title: '门幅' },
    { key: 'weight', title: '克重' },
    { key: 'substance', title: '辅料成分' },
    { key: 'size', title: '规格' },
    { key: 'warehouseId', title: '仓库' },
    { key: 'warehouseAreaId', title: '库区' },
    { key: 'warehouseLocationId', title: '库位' },
    { key: 'saveLocation', title: '存放位置' },
    {
      key: 'consumeAction',
      title: '关联用料',
      render: (_: any, record: any) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewConsume(record);
          }}
          className="rounded px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
        >
          查看关联用料
        </button>
      ),
    },
  ];

  const consumeColumns = [
    { key: 'id', title: '用料ID' },
    { key: 'jobId', title: '生产工单ID' },
    { key: 'jobProcessId', title: '工序快照ID' },
    { key: 'reportLogId', title: '报工事件ID' },
    { key: 'materialCode', title: '物料编号' },
    { key: 'materialName', title: '物料名称' },
    { key: 'materialType', title: '物料类型' },
    { key: 'batchNo', title: '批次' },
    { key: 'actualQty', title: '实际用量' },
    { key: 'actualLossQty', title: '实际损耗' },
    { key: 'unitPrice', title: '单价' },
    { key: 'theoreticalCost', title: '理论成本' },
    { key: 'actualCost', title: '实际成本' },
    {
      key: 'costDiff',
      title: '成本偏差',
      render: (value: any) => {
        const amount = Number(value || 0);
        return (
          <span className={amount > 0 ? 'text-red-600' : amount < 0 ? 'text-emerald-600' : 'text-slate-700'}>
            {amount}
          </span>
        );
      },
    },
    {
      key: 'isOverLimit',
      title: '超耗',
      render: (value: string) => (String(value) === '1' ? '是' : '否'),
    },
    { key: 'approvalStatus', title: '审批状态' },
  ];

  const handleViewDetail = async (record: any) => {
    setDetailOpen(true);
    setDetailTitle(`出库明细 - ${record.sn || record.id}`);
    setDetailLoading(true);
    try {
      const res: any = await inventoryApi.listStockOutItemByOutId(Number(record.id));
      setDetailRows(normalizeRows(res));
    } catch {
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewConsume = async (itemRecord: any) => {
    setConsumeOpen(true);
    setConsumeTitle(`关联用料 - ${itemRecord.materialNo || itemRecord.name || itemRecord.id}`);
    setConsumeLoading(true);
    try {
      const res: any = await produceMaterialConsumeApi.listProduceMaterialConsumeByStockOutItem(Number(itemRecord.id));
      setConsumeRows(normalizeRows(res));
    } catch {
      setConsumeRows([]);
    } finally {
      setConsumeLoading(false);
    }
  };

  const handleSyncConsume = async (record: any) => {
    const stockOutId = Number(record.id);
    if (!stockOutId) {
      toast.error('出库单ID无效');
      return;
    }
    setSyncingStockOutId(stockOutId);
    try {
      const res: any = await produceMaterialConsumeApi.syncProduceMaterialConsumeByStockOut(stockOutId);
      const data = res?.data || res || {};
      toast.success(
        `用料基线同步完成：新增 ${Number(data.insertedCount || 0)} 条，更新 ${Number(data.updatedCount || 0)} 条`
      );
      await handleViewDetail(record);
    } catch (error: any) {
      toast.error(error?.message || '用料基线同步失败');
    } finally {
      setSyncingStockOutId(null);
    }
  };

  return (
    <>
      <CrudPage
        title={t('page.stockOut.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
        extraActions={(record: any) => (
          <>
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
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleSyncConsume(record);
              }}
              disabled={syncingStockOutId === Number(record.id)}
              className="rounded px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              {syncingStockOutId === Number(record.id) ? '同步中...' : '同步用料'}
            </button>
          </>
        )}
      />

      <BaseModal
        open={detailOpen}
        title={detailTitle || '出库明细'}
        onClose={() => setDetailOpen(false)}
        width="1080px"
      >
        <BaseTable columns={detailColumns} data={detailRows} loading={detailLoading} rowKey="id" />
      </BaseModal>

      <BaseModal
        open={consumeOpen}
        title={consumeTitle || '关联用料'}
        onClose={() => setConsumeOpen(false)}
        width="1200px"
      >
        <BaseTable columns={consumeColumns} data={consumeRows} loading={consumeLoading} rowKey="id" />
      </BaseModal>
    </>
  );
}
