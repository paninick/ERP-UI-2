import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/channelSettlement';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel } from '@/utils/companyContext';

export default function ChannelSettlementPage() {
  const { t } = useTranslation();
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companyLabel = getCompanyLabel(currentCompany.code, t);
  const isFactoryMode = currentCompany.mode === 'factory';

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
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <div className="text-lg font-semibold text-slate-800">当前视角</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Company</div>
            <div className="mt-1 font-medium text-slate-800">{companyLabel}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</div>
            <div className="mt-1 font-medium text-slate-800">{isFactoryMode ? 'factory' : 'summary'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Factory</div>
            <div className="mt-1 font-medium text-slate-800">{currentCompany.factoryId ?? 'HEADQUARTERS'}</div>
          </div>
        </div>
        <div className="mt-3 text-xs leading-6 text-slate-500">
          如果这里看不到结算记录，先不要默认判断“系统没数据”，请先确认公司切换是否与真实样本口径一致。
        </div>
      </div>

      <CrudPage
        title={t('page.channelSettlement.title', { defaultValue: '渠道结算' })}
        api={{ list: api.listChannelSettlement, get: api.getChannelSettlement, add: api.addChannelSettlement, update: api.updateChannelSettlement, remove: api.delChannelSettlement }}
        columns={columns}
        searchFields={searchFields}
        FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
        emptyState={
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
            <div className="font-semibold">当前视角下没有渠道结算记录</div>
            <div className="mt-2 leading-6">
              这通常意味着当前公司/工厂/期间与样板数据不一致，不一定是渠道结算本身断链。
            </div>
            <div className="mt-2 leading-6">
              当前视角：{companyLabel} / {isFactoryMode ? 'factory' : 'summary'} / {currentCompany.factoryId ?? 'HEADQUARTERS'}
            </div>
            <div className="mt-2 leading-6">
              若要查看已验证样本，请切到 `CAMBODIA + factory + 106`，期间看 `2026-05`。
            </div>
          </div>
        }
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
    </div>
  );
}
