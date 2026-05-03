import { useState } from 'react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
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

  const S = 'stockOutLabels';
  const D = 'stockOutLabels.detail';

  const columns = [
    { key: 'sn', title: t('page.stockOut.columns.stockOutNo') },
    {
      key: 'srcBillNo',
      title: t(`${S}.srcBillNo`),
      render: (_: any, record: any) => record.srcBillNo || record.purchaseSn || '-',
    },
    {
      key: 'outType',
      title: t(`${S}.outType`),
      render: (value: string) => {
        const tag = outType.toTag(String(value), 'bg-amber-100 text-amber-700');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'bulkOrderNo', title: t(`${S}.bulkOrderNo`) },
    { key: 'applicant', title: t(`${S}.applicant`, '申请人') },
    {
      key: 'confirmStatus',
      title: t(`${S}.confirmStatus`),
      render: (value: string) => {
        const tag = confirmStatus.toTag(String(value), 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'outDate', title: t('page.stockOut.columns.stockOutDate') },
  ];

  const searchFields = [
    { name: 'sn', label: t('page.stockOut.columns.stockOutNo') },
    { name: 'purchaseSn', label: t(`${S}.purchaseSn`, '采购单号') },
    { name: 'bulkOrderNo', label: t(`${S}.bulkOrderNo`) },
    { name: 'confirmStatus', label: t(`${S}.confirmStatus`), type: 'select' as const, options: confirmStatus.options },
  ];

  const initialSearchParams = useMemo(
    () => ({
      sn: searchParams.get('sn') || '',
      purchaseSn: searchParams.get('purchaseSn') || '',
      bulkOrderNo: searchParams.get('bulkOrderNo') || '',
      confirmStatus: searchParams.get('confirmStatus') || '',
    }),
    [searchParams],
  );

  const formFields = [
    { name: 'sn', label: t('page.stockOut.columns.stockOutNo'), required: true, group: t(`${S}.groupBasic`) },
    {
      name: 'outType',
      label: t(`${S}.outType`),
      type: 'select' as const,
      required: true,
      options: outType.options,
      group: t(`${S}.groupBasic`),
    },
    { name: 'outDate', label: t('page.stockOut.columns.stockOutDate'), type: 'date' as const, required: true, group: t(`${S}.groupBasic`) },
    { name: 'applicant', label: t(`${S}.applicant`, '申请人'), group: t(`${S}.groupBasic`) },
    { name: 'applyDate', label: t(`${S}.applyDate`, '申请日期'), type: 'date' as const, group: t(`${S}.groupBasic`) },
    {
      name: 'srcBillType',
      label: t(`${S}.srcBillType`),
      type: 'select' as const,
      options: [
        { value: 'purchase', label: '采购单' },
        { value: 'produce_plan', label: '生产计划' },
        { value: 'produce_job', label: '生产工单' },
        { value: 'manual', label: '手工出库' },
      ],
      group: t(`${S}.groupSource`),
    },
    { name: 'srcBillNo', label: t(`${S}.srcBillNo`), group: t(`${S}.groupSource`) },
    {
      name: 'purchaseId',
      label: t(`${S}.purchaseId`, '关联采购单'),
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
    { name: 'purchaseSn', label: t(`${S}.purchaseSn`, '采购单号'), group: t(`${S}.groupSource`) },
    {
      name: 'planId',
      label: t(`${S}.planId`, '关联生产计划'),
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await productionApi.listProducePlan({ pageNum: 1, pageSize: 200 });
        return (res.rows || []).map((item: any) => ({
          value: String(item.id),
          label: `${item.planNo || item.id}${item.styleCode ? ` / ${item.styleCode}` : ''}`,
        }));
      },
      group: t(`${S}.groupSource`),
    },
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
    { name: 'outDescription', label: t(`${S}.outDescription`), type: 'textarea' as const },
    { name: 'remark', label: t('page.stockOut.columns.remark'), type: 'textarea' as const },
  ];

  const materialTypeOptions = [
    { value: '1', label: '主料' },
    { value: '2', label: '辅料' },
  ];

  const detailColumns = [
    { key: 'sn', title: t(`${D}.entryNo`, '出库单号') },
    { key: 'materialId', title: t(`${D}.materialId`, '物料ID') },
    {
      key: 'materialType',
      title: t(`${S}.materialType`),
      render: (value: string) => {
        const option = materialTypeOptions.find(o => o.value === String(value));
        return option?.label || value;
      },
    },
    { key: 'materialNo', title: t(`${D}.materialNo`, '物料编号') },
    { key: 'name', title: t(`${D}.materialName`, '名称') },
    { key: 'count', title: t(`${D}.count`, '数量') },
    { key: 'composition', title: t(`${D}.composition`, '成分') },
    { key: 'width', title: t(`${D}.width`, '门幅') },
    { key: 'weight', title: t(`${D}.weight`, '克重') },
    { key: 'substance', title: t(`${D}.substance`, '辅料成分') },
    { key: 'size', title: t(`${D}.size`, '规格') },
    { key: 'warehouseId', title: t(`${D}.warehouse`, '仓库') },
    { key: 'warehouseAreaId', title: t(`${D}.area`, '库区') },
    { key: 'warehouseLocationId', title: t(`${D}.location`, '库位') },
    { key: 'saveLocation', title: t(`${D}.saveLocation`, '存放位置') },
    {
      key: 'consumeAction',
      title: t(`${D}.consumeAction`, '关联用料'),
      render: (_: any, record: any) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewConsume(record);
          }}
          className="rounded px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
        >
          {t(`${D}.viewConsume`, '查看关联用料')}
        </button>
      ),
    },
  ];

  const consumeColumns = [
    { key: 'id', title: t(`${D}.consumeId`, '用料ID') },
    { key: 'jobId', title: t(`${D}.jobId`, '生产工单ID') },
    { key: 'jobProcessId', title: t(`${D}.jobProcessId`, '工序快照ID') },
    { key: 'reportLogId', title: t(`${D}.reportLogId`, '报工事件ID') },
    { key: 'materialCode', title: t(`${D}.materialNo`, '物料编号') },
    { key: 'materialName', title: t(`${D}.materialName`, '物料名称') },
    { key: 'materialType', title: t(`${S}.materialType`) },
    { key: 'batchNo', title: t(`${D}.batchNo`, '批次') },
    { key: 'actualQty', title: t(`${D}.actualQty`, '实际用量') },
    { key: 'actualLossQty', title: t(`${D}.actualLossQty`, '实际损耗') },
    { key: 'unitPrice', title: t(`${D}.price`, '单价') },
    { key: 'theoreticalCost', title: t(`${D}.theoreticalCost`, '理论成本') },
    { key: 'actualCost', title: t(`${D}.actualCost`, '实际成本') },
    {
      key: 'costDiff',
      title: t(`${D}.costDiff`, '成本偏差'),
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
      title: t(`${D}.isOverLimit`, '超耗'),
      render: (value: string) => (String(value) === '1' ? t('common.yes') : t('common.no')),
    },
    { key: 'approvalStatus', title: t(`${D}.approvalStatus`, '审批状态') },
  ];

  const handleViewDetail = async (record: any) => {
    setDetailOpen(true);
    setDetailTitle(`${t(`${S}.detailTitle`)} - ${record.sn || record.id}`);
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
    setConsumeTitle(`${t(`${D}.consumeTitle`, '关联用料')} - ${itemRecord.materialNo || itemRecord.name || itemRecord.id}`);
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
      toast.error(t(`${S}.invalidId`, '出库单ID无效'));
      return;
    }
    setSyncingStockOutId(stockOutId);
    try {
      const res: any = await produceMaterialConsumeApi.syncProduceMaterialConsumeByStockOut(stockOutId);
      const data = res?.data || res || {};
      toast.success(
        t(`${S}.syncSuccess`, '用料基线同步完成：新增 {{inserted}} 条，更新 {{updated}} 条', { inserted: data.insertedCount || 0, updated: data.updatedCount || 0 })
      );
      await handleViewDetail(record);
    } catch (error: any) {
      toast.error(error?.message || t(`${S}.syncFailed`, '用料基线同步失败'));
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
        initialSearchParams={initialSearchParams}
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
              {t(`${S}.detailView`)}
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
              {syncingStockOutId === Number(record.id) ? t(`${S}.syncing`, '同步中...') : t(`${S}.syncConsume`, '同步用料')}
            </button>
          </>
        )}
      />

      <BaseModal
        open={detailOpen}
        title={detailTitle || t(`${S}.detailTitle`)}
        onClose={() => setDetailOpen(false)}
        width="1080px"
      >
        <BaseTable columns={detailColumns} data={detailRows} loading={detailLoading} rowKey="id" />
      </BaseModal>

      <BaseModal
        open={consumeOpen}
        title={consumeTitle || t(`${D}.consumeTitle`, '关联用料')}
        onClose={() => setConsumeOpen(false)}
        width="1200px"
      >
        <BaseTable columns={consumeColumns} data={consumeRows} loading={consumeLoading} rowKey="id" />
      </BaseModal>
    </>
  );
}
