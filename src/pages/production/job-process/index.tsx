import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as jobApi from '@/api/production';
import { toast } from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { useDictOptions } from '@/hooks/useDictOptions';
import ProcessFlow from './ProcessFlow';

export default function JobProcessPage() {
  const { t } = useTranslation();
  const jobStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
  ]);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({ jobNo: '', styleCode: '', status: '' });
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true);
      try {
        const response: any = await jobApi.listProduceJob({
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        });
        setData(response.rows || []);
        setPagination((prev) => ({ ...prev, total: response.total || 0 }));
      } catch {
        setData([]);
        toast.error(t('page.jobProcess.toasts.loadFailed'));
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNum, pagination.pageSize, queryParams, t],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    const nextParams = { jobNo: '', styleCode: '', status: '' };
    setQueryParams(nextParams);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1, ...nextParams });
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageNum, pageSize }));
    fetchData({ pageNum, pageSize });
  };

  const columns = [
    {
      key: 'jobNo',
      title: t('page.jobProcess.columns.jobNo'),
      render: (value: string, record: any) => (
        <button
          onClick={() => setSelectedJob(record)}
          className="font-medium text-indigo-600 hover:text-indigo-800"
        >
          {value}
        </button>
      ),
    },
    { key: 'planNo', title: t('page.jobProcess.columns.planNo') },
    { key: 'styleCode', title: t('page.jobProcess.columns.styleCode') },
    { key: 'colorCode', title: t('page.jobProcess.columns.colorCode') },
    { key: 'sizeCode', title: t('page.jobProcess.columns.sizeCode') },
    { key: 'planQty', title: t('page.jobProcess.columns.planQty') },
    { key: 'actualQty', title: t('page.jobProcess.columns.actualQty') },
    {
      key: 'defectQty',
      title: t('page.jobProcess.columns.defectQty'),
      render: (value: number) => (
        <span className={value > 0 ? 'font-medium text-red-600' : 'text-slate-400'}>{value || 0}</span>
      ),
    },
    { key: 'currentProcessName', title: t('page.jobProcess.columns.currentProcessName'), render: (value: string) => value || '-' },
    {
      key: 'status',
      title: t('page.jobProcess.columns.status'),
      render: (value: string) => {
        const tag = jobStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '90px',
      render: (_: any, record: any) =>
        record.status !== '2' ? (
          <NavLink
            to={`/production/job-process/report/${record.id}`}
            className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
          >
            {t('page.jobProcess.report')} <ChevronRight size={12} />
          </NavLink>
        ) : (
          <span className="text-xs text-slate-400">{t('page.jobProcess.completed')}</span>
        ),
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{t('page.jobProcess.title')}</h2>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.jobProcess.columns.jobNo')}>
          <input
            value={queryParams.jobNo}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, jobNo: event.target.value }))}
            aria-label={t('page.jobProcess.columns.jobNo')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.jobProcess.placeholders.jobNo')}
          />
        </SearchField>
        <SearchField label={t('page.jobProcess.columns.styleCode')}>
          <input
            value={queryParams.styleCode}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, styleCode: event.target.value }))}
            aria-label={t('page.jobProcess.columns.styleCode')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.jobProcess.placeholders.styleCode')}
          />
        </SearchField>
        <SearchField label={t('page.jobProcess.columns.status')}>
          <select
            value={queryParams.status}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, status: event.target.value }))}
            aria-label={t('page.jobProcess.columns.status')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t('common.all')}</option>
            {jobStatus.options.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </SearchField>
      </SearchForm>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={selectedJob ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <BaseTable columns={columns} data={data} loading={loading} rowKey="id" />
          <Pagination
            current={pagination.pageNum}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
          />
        </div>

        {selectedJob && (
          <div className="xl:col-span-1">
            <div className="sticky top-20 rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{t('page.jobProcess.flowTitle')}</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  {t('common.close')}
                </button>
              </div>
              <ProcessFlow jobId={selectedJob.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
