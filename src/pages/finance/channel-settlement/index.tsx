import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/channelSettlement';

export default function ChannelSettlementPage() {
  const { t } = useTranslation();

  const channelOptions = useMemo(() => [
    { value: '1688', label: '1688 批发' },
    { value: 'DOUYIN', label: '抖音零售' },
    { value: 'OFFLINE', label: '线下直营' },
    { value: 'OTHER', label: '其他' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'DRAFT', label: t('page.channelSettlement.status.draft', { defaultValue: '草稿' }) },
    { value: 'CALCULATED', label: t('page.channelSettlement.status.calculated', { defaultValue: '已计算' }) },
    { value: 'CONFIRMED', label: t('page.channelSettlement.status.confirmed', { defaultValue: '已确认' }) },
    { value: 'CLOSED', label: t('page.channelSettlement.status.closed', { defaultValue: '已关闭' }) },
  ], [t]);

  const statusMap = useMemo(() => Object.fromEntries(statusOptions.map((s) => [s.value, s.label])), [statusOptions]);

  const columns = [
    { key: 'settlementNo', title: t('page.channelSettlement.columns.settlementNo', { defaultValue: '结算单号' }) },
    { key: 'channelCode', title: t('page.channelSettlement.columns.channel', { defaultValue: '渠道' }), render: (v: string) => channelOptions.find((o) => o.value === v)?.label || v },
    { key: 'period', title: t('page.channelSettlement.columns.period', { defaultValue: '结算期间' }) },
    { key: 'totalRevenue', title: t('page.channelSettlement.columns.revenue', { defaultValue: '销售收入' }), render: (v: number) => (v != null ? `¥${Number(v).toFixed(2)}` : '-') },
    { key: 'netProfit', title: t('page.channelSettlement.columns.profit', { defaultValue: '净毛利' }), render: (v: number) => (v != null ? `¥${Number(v).toFixed(2)}` : '-') },
    { key: 'status', title: t('page.channelSettlement.columns.status', { defaultValue: '状态' }), render: (v: string) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{statusMap[v] || v}</span> },
  ];

  const searchFields = [
    { name: 'channelCode', label: t('page.channelSettlement.columns.channel', { defaultValue: '渠道' }), type: 'select' as const, options: channelOptions },
    { name: 'period', label: t('page.channelSettlement.columns.period', { defaultValue: '结算期间' }) },
    { name: 'status', label: t('page.channelSettlement.columns.status', { defaultValue: '状态' }), type: 'select' as const, options: statusOptions },
  ];

  const formFields = [
    { name: 'channelCode', label: t('page.channelSettlement.columns.channel', { defaultValue: '渠道' }), type: 'select' as const, required: true, options: channelOptions },
    { name: 'period', label: t('page.channelSettlement.columns.period', { defaultValue: '结算期间' }), required: true },
    { name: 'settlementNo', label: t('page.channelSettlement.columns.settlementNo', { defaultValue: '结算单号' }), required: true },
    { name: 'summaryRemark', label: t('page.channelSettlement.columns.remark', { defaultValue: '备注' }), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.channelSettlement.title', { defaultValue: '渠道结算' })}
      api={{ list: api.listChannelSettlement, get: api.getChannelSettlement, add: api.addChannelSettlement, update: api.updateChannelSettlement, remove: api.delChannelSettlement }}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      extraActions={(record: any) => (
        <div className="flex gap-1">
          {record.status === 'DRAFT' && (
            <button type="button" onClick={() => api.calculateChannelSettlement(record.id)} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100">计算利润</button>
          )}
          {record.status === 'CALCULATED' && (
            <button type="button" onClick={() => api.confirmChannelSettlement(record.id)} className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100">确认</button>
          )}
        </div>
      )}
    />
  );
}
