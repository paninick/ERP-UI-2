import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/channelRefund';

export default function ChannelRefundPage() {
  const { t } = useTranslation();

  const channelOptions = useMemo(() => [
    { value: '1688', label: '1688 批发' },
    { value: 'DOUYIN', label: '抖音零售' },
    { value: 'OFFLINE', label: '线下直营' },
    { value: 'OTHER', label: '其他' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'PENDING_INSPECTION', label: '待复判' },
    { value: 'INSPECTING', label: '复判中' },
    { value: 'INSPECTED', label: '已复判' },
    { value: 'RESALE_GRADED', label: '已分级' },
    { value: 'REPAIR', label: '返修' },
    { value: 'SCRAPPED', label: '报废' },
  ], []);

  const statusMap = useMemo(() => Object.fromEntries(statusOptions.map((s) => [s.value, s.label])), [statusOptions]);

  const columns = [
    { key: 'refundNo', title: t('page.channelRefund.columns.refundNo', { defaultValue: '退货单号' }) },
    { key: 'sourceChannel', title: t('page.channelRefund.columns.channel', { defaultValue: '来源渠道' }), render: (v: string) => channelOptions.find((o) => o.value === v)?.label || v },
    { key: 'customerName', title: t('page.channelRefund.columns.customer', { defaultValue: '客户名称' }) },
    { key: 'salesOrderNo', title: t('page.channelRefund.columns.salesOrder', { defaultValue: '原销售单号' }) },
    { key: 'refundQty', title: t('page.channelRefund.columns.qty', { defaultValue: '退货数量' }) },
    { key: 'refundAmount', title: t('page.channelRefund.columns.amount', { defaultValue: '退款金额' }), render: (v: number) => (v != null ? `¥${Number(v).toFixed(2)}` : '-') },
    { key: 'status', title: t('page.channelRefund.columns.status', { defaultValue: '状态' }), render: (v: string) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{statusMap[v] || v}</span> },
  ];

  const searchFields = [
    { name: 'refundNo', label: t('page.channelRefund.columns.refundNo', { defaultValue: '退货单号' }) },
    { name: 'sourceChannel', label: t('page.channelRefund.columns.channel', { defaultValue: '来源渠道' }), type: 'select' as const, options: channelOptions },
    { name: 'status', label: t('page.channelRefund.columns.status', { defaultValue: '状态' }), type: 'select' as const, options: statusOptions },
  ];

  const formFields = [
    { name: 'refundNo', label: t('page.channelRefund.columns.refundNo', { defaultValue: '退货单号' }), required: true },
    { name: 'sourceChannel', label: t('page.channelRefund.columns.channel', { defaultValue: '来源渠道' }), type: 'select' as const, required: true, options: channelOptions },
    { name: 'customerName', label: t('page.channelRefund.columns.customer', { defaultValue: '客户名称' }) },
    { name: 'salesOrderNo', label: t('page.channelRefund.columns.salesOrder', { defaultValue: '原销售单号' }) },
    { name: 'refundQty', label: t('page.channelRefund.columns.qty', { defaultValue: '退货数量' }), type: 'number' as const },
    { name: 'refundAmount', label: t('page.channelRefund.columns.amount', { defaultValue: '退款金额' }), type: 'number' as const },
    { name: 'refundReason', label: t('page.channelRefund.columns.reason', { defaultValue: '退款原因' }), type: 'textarea' as const },
    { name: 'remark', label: t('page.channelRefund.columns.remark', { defaultValue: '备注' }), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.channelRefund.title', { defaultValue: '渠道退货管理' })}
      api={{ list: api.listChannelRefund, get: api.getChannelRefund, add: api.addChannelRefund, update: api.updateChannelRefund, remove: api.delChannelRefund }}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      extraActions={(record: any) => (
        <div className="flex gap-1">
          {record.status === 'PENDING_INSPECTION' && (
            <button type="button" onClick={() => api.startInspect(record.id)} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100">开始复判</button>
          )}
          {record.status === 'INSPECTING' && (
            <button type="button" onClick={() => api.completeInspect(record.id)} className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100">完成复判</button>
          )}
        </div>
      )}
    />
  );
}
