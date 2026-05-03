import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const purchaseType = useDictOptions('erp_purchase_type', [
    { value: 'RAW', label: t('page.purchase.type.raw') },
    { value: 'AUX', label: t('page.purchase.type.auxiliary') },
    { value: 'FINISHED', label: t('page.purchase.type.finished') },
    { value: 'PACK', label: t('page.purchase.type.packaging') },
  ]);

  const purchaseStatus = useDictOptions('erp_purchase_status', [
    { value: '0', label: t('page.purchase.status.pending') },
    { value: '1', label: t('page.purchase.status.confirmed') },
    { value: '2', label: t('page.purchase.status.completed') },
    { value: '3', label: t('page.purchase.status.cancelled') },
  ]);

  const columns = [
    { key: 'sn', title: t('page.purchase.columns.sn') },
    {
      key: 'type',
      title: t('page.purchase.columns.type'),
      render: (value: string) => renderTag(value, purchaseType.toTag, 'bg-blue-100 text-blue-600'),
    },
    { key: 'supplierName', title: t('page.purchase.columns.supplierName') },
    { key: 'bulkOrderNo', title: t('page.purchase.columns.bulkOrderNo') },
    { key: 'description', title: t('page.purchase.columns.description') },
    {
      key: 'substituteSummary',
      title: '替代提示',
      render: (_value: string, record: any) => {
        if (!record?.approvedSubstituteCount) {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <div className="max-w-[240px] text-xs leading-5 text-amber-700">
            <div className="font-medium">已命中 {record.approvedSubstituteCount} 条批准替代</div>
            <div className="mt-1 text-slate-500">{record.substituteSummary || '请按替代关系复核采购物料'}</div>
          </div>
        );
      },
    },
    { key: 'expectedDeliveryDate', title: t('page.purchase.columns.expectedDeliveryDate') },
    { key: 'purchaseName', title: t('page.purchase.columns.purchaseName') },
    {
      key: 'status',
      title: t('page.purchase.columns.status'),
      render: (value: string) => renderTag(value, purchaseStatus.toTag, 'bg-slate-100 text-slate-600'),
    },
    {
      key: 'amount',
      title: t('page.purchase.columns.amount'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
  ];

  const searchFields = [
    { name: 'sn', label: t('page.purchase.columns.sn') },
    { name: 'type', label: t('page.purchase.columns.type'), type: 'select' as const, options: purchaseType.options },
    { name: 'status', label: t('page.purchase.columns.status'), type: 'select' as const, options: purchaseStatus.options },
  ];

  const initialSearchParams = useMemo(
    () => ({
      sn: searchParams.get('sn') || '',
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
    }),
    [searchParams],
  );

  return (
    <CrudPage
      title={t('page.purchase.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={PurchaseForm}
      initialSearchParams={initialSearchParams}
    />
  );
}
