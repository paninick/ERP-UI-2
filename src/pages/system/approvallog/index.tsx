import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '@/api/approval';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { toast } from '@/components/ui/Toast';

interface ApprovalLogRecord {
  id: number;
  businessType?: string;
  businessId?: number;
  businessNo?: string;
  nodeCode?: string;
  actionType?: string;
  fromStatus?: string;
  toStatus?: string;
  actionBy?: string;
  actionTime?: string;
  actionRemark?: string;
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  return value.includes('T') ? value.replace('T', ' ').slice(0, 19) : value;
}

export default function ApprovalLogPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ApprovalLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({
    businessType: '',
    businessId: '',
    businessNo: '',
    actionBy: '',
  });

  const fetchData = async (params?: Partial<typeof queryParams>, pageNum?: number, pageSize?: number) => {
    setLoading(true);
    try {
      const mergedParams = { ...queryParams, ...params };
      const response: any = await api.listApprovalLog({
        pageNum: pageNum ?? pagination.pageNum,
        pageSize: pageSize ?? pagination.pageSize,
        businessType: mergedParams.businessType || undefined,
        businessId: mergedParams.businessId ? Number(mergedParams.businessId) : undefined,
        businessNo: mergedParams.businessNo || undefined,
        actionBy: mergedParams.actionBy || undefined,
      });
      setData(response.rows || []);
      setPagination((prev) => ({
        ...prev,
        pageNum: pageNum ?? prev.pageNum,
        pageSize: pageSize ?? prev.pageSize,
        total: response.total || 0,
      }));
    } catch (error: any) {
      toast.error(error.message || t('common.loadDataFailed'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'businessType', title: t('approvalLog.businessType') },
    { key: 'businessId', title: t('approvalLog.businessId') },
    { key: 'businessNo', title: t('approvalLog.businessNo', '业务单号') },
    { key: 'nodeCode', title: t('approvalLog.nodeCode') },
    { key: 'actionType', title: t('approvalLog.actionType') },
    { key: 'fromStatus', title: t('approvalLog.from') },
    { key: 'toStatus', title: t('approvalLog.to') },
    { key: 'actionBy', title: t('approvalLog.by') },
    { key: 'actionTime', title: t('approvalLog.time'), render: (value: string) => formatDateTime(value) },
    { key: 'actionRemark', title: t('approvalLog.remark', '审批意见') },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('approvalLog.title')}</h2>
      </div>

      <SearchForm
        onSearch={() => {
          setPagination((prev) => ({ ...prev, pageNum: 1 }));
          fetchData(undefined, 1, pagination.pageSize);
        }}
        onReset={() => {
          const nextParams = { businessType: '', businessId: '', businessNo: '', actionBy: '' };
          setQueryParams(nextParams);
          setPagination((prev) => ({ ...prev, pageNum: 1 }));
          fetchData(nextParams, 1, pagination.pageSize);
        }}
      >
        <SearchField label={t('approvalLog.businessType')}>
          <input
            aria-label={t('approvalLog.businessType')}
            value={queryParams.businessType}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, businessType: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('common.pleaseEnterField', { field: t('approvalLog.businessType') })}
          />
        </SearchField>
        <SearchField label={t('approvalLog.businessId')}>
          <input
            aria-label={t('approvalLog.businessId')}
            value={queryParams.businessId}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, businessId: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('common.pleaseEnterField', { field: t('approvalLog.businessId') })}
          />
        </SearchField>
        <SearchField label={t('approvalLog.businessNo', '业务单号')}>
          <input
            aria-label={t('approvalLog.businessNo', '业务单号')}
            value={queryParams.businessNo}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, businessNo: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('common.pleaseEnterField', { field: t('approvalLog.businessNo', '业务单号') })}
          />
        </SearchField>
        <SearchField label={t('approvalLog.by')}>
          <input
            aria-label={t('approvalLog.by')}
            value={queryParams.actionBy}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, actionBy: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('common.pleaseEnterField', { field: t('approvalLog.by') })}
          />
        </SearchField>
      </SearchForm>

      <BaseTable
        columns={columns}
        data={data}
        loading={loading}
        rowKey="id"
        ariaLabel={t('approvalLog.title')}
      />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(pageNum, pageSize) => {
          setPagination((prev) => ({ ...prev, pageNum, pageSize }));
          fetchData(undefined, pageNum, pageSize);
        }}
      />
    </div>
  );
}
