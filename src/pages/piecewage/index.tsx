import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as piecewageApi from '@/api/piecewage';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useCrud } from '@/hooks/useCrud';

const api = {
  list: piecewageApi.listPiecewage,
  get: piecewageApi.getPiecewage,
  add: piecewageApi.addPiecewage,
  update: piecewageApi.updatePiecewage,
  remove: piecewageApi.delPiecewage,
};

export default function PiecewagePage() {
  const { t } = useTranslation();
  const { data, loading, pagination, handleSearch, handleReset, handlePageChange, refresh } = useCrud(api);
  const [logOpen, setLogOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [searchParams, setSearchParams] = useState({
    employeeName: '',
    wageMonth: '',
    status: '',
  });
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));

  const PA = 'page.piecewageActions';

  const confirmStatus = useDictOptions('erp_confirm_status', [
    { value: '0', label: t('page.piecewage.status.pending') },
    { value: '1', label: t('page.piecewage.status.confirmed') },
    { value: '2', label: t('page.piecewage.status.paid', '已发放') },
  ]);

  const statusTag = useMemo(() => {
    return (value: string) => {
      const tag = confirmStatus.toTag(value, 'bg-slate-100 text-slate-600');
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
    };
  }, [confirmStatus]);

  const columns = [
    { key: 'employeeName', title: t('page.piecewage.columns.employeeName') },
    { key: 'wageMonth', title: t('page.piecewage.columns.wageMonth', '工资月份') },
    { key: 'totalProcessCount', title: t('page.piecewage.columns.totalProcessCount', '工序数') },
    { key: 'totalOkQty', title: t('page.piecewage.columns.totalOkQty', '合格数') },
    { key: 'totalDefectQty', title: t('page.piecewage.columns.totalDefectQty', '次品数') },
    {
      key: 'shouldWage',
      title: t('page.piecewage.columns.shouldWage', '应发工资'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
    {
      key: 'deductWage',
      title: t('page.piecewage.columns.deductWage', '扣款金额'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
    {
      key: 'actualWage',
      title: t('page.piecewage.columns.actualWage', '实发工资'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
    {
      key: 'status',
      title: t('page.piecewage.columns.status'),
      render: (value: string) => statusTag(value),
    },
  ];

  const detailColumns = [
    { key: 'processName', title: t('page.piecewage.columns.processName') },
    { key: 'jobId', title: t('page.piecewage.columns.jobId', '生产单ID') },
    { key: 'okQty', title: t('page.piecewage.columns.okQty', '合格数') },
    { key: 'defectQty', title: t('page.piecewage.columns.defectQty', '次品数') },
    {
      key: 'processPrice',
      title: t('page.piecewage.columns.processPrice', '工序单价'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(4)}` : '-'),
    },
    {
      key: 'shouldWage',
      title: t('page.piecewage.columns.shouldWage', '应发工资'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
    {
      key: 'actualWage',
      title: t('page.piecewage.columns.actualWage', '实发工资'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
  ];

  const resolveSettleStatus = (record: any) => {
    if (record?.settleStatus) {
      return record.settleStatus;
    }
    if (record?.status === '2') {
      return 'PAID';
    }
    if (record?.status === '1') {
      return 'CONFIRMED';
    }
    return 'DRAFT';
  };

  const loadApprovalLogs = async (record: any) => {
    setCurrentRecord(record);
    setLogOpen(true);
    setLogLoading(true);
    try {
      const response: any = await approvalApi.listApprovalLog({
        businessType: 'PIECE_WAGE',
        businessId: record.id,
        pageNum: 1,
        pageSize: 50,
      });
      setApprovalLogs(response?.rows || []);
    } catch {
      setApprovalLogs([]);
    } finally {
      setLogLoading(false);
    }
  };

  const openDetails = async (record: any) => {
    setCurrentRecord(record);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response: any = await piecewageApi.listPiecewageDetailByWage(record.id);
      setDetailRows(response?.data || []);
    } catch (error: any) {
      setDetailRows([]);
      toast.error(error.message || t('page.piecewage.loadDetailFailed', '加载工资明细失败'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmAction = async (record: any) => {
    const confirmed = await confirm(
      t('approval.confirmAction', {
        name: `${record.employeeName || '-'} / ${record.wageMonth || '-'}`,
        action: t(`${PA}.confirm`),
      }),
    );
    if (!confirmed) return;

    try {
      await piecewageApi.confirmPiecewage(record.id);
      toast.success(t(`${PA}.confirmSuccess`));
      if (logOpen && currentRecord?.id === record.id) {
        await loadApprovalLogs(record);
      }
      await refresh();
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  const handlePayAction = async (record: any) => {
    const confirmed = await confirm(
      t('approval.confirmAction', {
        name: `${record.employeeName || '-'} / ${record.wageMonth || '-'}`,
        action: t(`${PA}.pay`),
      }),
    );
    if (!confirmed) return;

    try {
      await piecewageApi.payPiecewage(record.id);
      toast.success(t(`${PA}.paySuccess`));
      if (logOpen && currentRecord?.id === record.id) {
        await loadApprovalLogs(record);
      }
      await refresh();
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  const handleSearchSubmit = () => { handleSearch(searchParams); };

  const handleResetSubmit = () => {
    setSearchParams({ employeeName: '', wageMonth: '', status: '' });
    handleReset();
  };

  const handleAutoGenerate = async () => {
    if (!generateMonth) {
      toast.error(t(`${PA}.selectMonth`, '请选择工资月份'));
      return;
    }
    setAutoGenerating(true);
    try {
      const response: any = await piecewageApi.autoGeneratePiecewage(generateMonth);
      toast.success(response?.msg || t(`${PA}.generateSuccess`));
      await refresh();
    } catch (error: any) {
      toast.error(error.message || t(`${PA}.generateFailed`, '工资汇总生成失败'));
    } finally {
      setAutoGenerating(false);
    }
  };

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t('page.piecewage.title')}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              {t(`${PA}.chainHint`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={generateMonth}
              onChange={(event) => setGenerateMonth(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {autoGenerating ? t(`${PA}.generating`) : t(`${PA}.autoGenerate`)}
            </button>
          </div>
        </div>

        <SearchForm onSearch={handleSearchSubmit} onReset={handleResetSubmit}>
          <SearchField label={t('page.piecewage.columns.employeeName')}>
            <input
              value={searchParams.employeeName}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, employeeName: event.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder={t('page.piecewage.columns.employeeName')}
            />
          </SearchField>
          <SearchField label={t('page.piecewage.columns.wageMonth', '工资月份')}>
            <input
              type="month"
              value={searchParams.wageMonth}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, wageMonth: event.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </SearchField>
          <SearchField label={t('page.piecewage.columns.status')}>
            <select
              value={searchParams.status}
              onChange={(event) => setSearchParams((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">{t('common.all')}</option>
              {confirmStatus.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </SearchField>
        </SearchForm>

        <BaseTable
          columns={[
            ...columns,
            {
              key: 'actions',
              title: t('common.actions'),
              width: '260px',
              render: (_: any, record: any) => (
                <div className="flex gap-1">
                  <button type="button" onClick={(event) => { event.stopPropagation(); openDetails(record); }} className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50">
                    {t(`${PA}.detail`)}
                  </button>
                  {resolveSettleStatus(record) === 'DRAFT' && (
                    <button type="button" onClick={(event) => { event.stopPropagation(); handleConfirmAction(record); }} className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50">
                      {t(`${PA}.confirm`)}
                    </button>
                  )}
                  {resolveSettleStatus(record) === 'CONFIRMED' && (
                    <button type="button" onClick={(event) => { event.stopPropagation(); handlePayAction(record); }} className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50">
                      {t(`${PA}.pay`)}
                    </button>
                  )}
                  <button type="button" onClick={(event) => { event.stopPropagation(); loadApprovalLogs(record); }} className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">
                    {t(`${PA}.log`)}
                  </button>
                </div>
              ),
            },
          ]}
          data={data}
          loading={loading}
          rowKey="id"
        />
        <Pagination current={pagination.pageNum} pageSize={pagination.pageSize} total={pagination.total} onChange={handlePageChange} />
      </div>

      <BaseModal
        open={logOpen}
        title={`${t(`${PA}.log`)} - ${currentRecord?.employeeName || '-'} / ${currentRecord?.wageMonth || '-'}`}
        onClose={() => setLogOpen(false)}
        width="760px"
      >
        <ApprovalTimeline title={t(`${PA}.log`)} logs={approvalLogs} loading={logLoading} />
      </BaseModal>

      <BaseModal
        open={detailOpen}
        title={`${t(`${PA}.detail`)} - ${currentRecord?.employeeName || '-'} / ${currentRecord?.wageMonth || '-'}`}
        onClose={() => setDetailOpen(false)}
        width="960px"
      >
        <BaseTable columns={detailColumns} data={detailRows} loading={detailLoading} rowKey="id" />
      </BaseModal>
    </>
  );
}
