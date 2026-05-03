import { useCallback, useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, Factory, LayoutList, TimerReset } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as jobApi from '@/api/production';
import { toast } from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { useDictOptions } from '@/hooks/useDictOptions';
import ProcessFlow from './ProcessFlow';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel } from '@/utils/companyContext';

export default function JobProcessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentCompany = useAppStore((state) => state.currentCompany);
  const companySignature = `${currentCompany.code}:${currentCompany.factoryId ?? 'all'}:${currentCompany.mode}`;
  const jobStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
  ]);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const customerName = searchParams.get('customerName') || '';
  const [queryParams, setQueryParams] = useState({ jobNo: '', styleCode: '', status: '', customerName });
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
    [pagination.pageNum, pagination.pageSize, queryParams, companySignature, t],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, customerName }));
  }, [customerName]);

  useEffect(() => {
    setSelectedJob(null);
  }, [companySignature]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    const nextParams = { jobNo: '', styleCode: '', status: '', customerName };
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
      <section className="mb-6 overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#e0f2fe_100%)] px-6 py-6 text-white shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">现场执行明细</p>
            <h2 className="mt-2 text-3xl font-semibold">{t('page.jobProcess.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">这里不是总览看板，而是工票和工序级执行台账。适合班组长、车间主管查看某张工单当前跑到哪道工序、实际报工多少、是否有次品和返工。</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200/90">在执行链里，它位于“工单之后、质检之前”。也就是说，工单决定做什么，报工记录做到哪里，而质检再根据这里的结果判断是否放行或返工。</p>
            {customerName ? (
              <div className="mt-4 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-slate-100">
                当前客户：{customerName}，当前公司：{getCompanyLabel(currentCompany.code, t)}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: TimerReset, title: '回到预排甘特图', to: customerName ? `/production/gantt?customerName=${encodeURIComponent(customerName)}` : '/production/gantt' },
              { icon: Factory, title: '回到生产看板', to: customerName ? `/production/kanban?customerName=${encodeURIComponent(customerName)}` : '/production/kanban' },
              { icon: LayoutList, title: '查看工厂总览', to: '/production/work-center' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-white/12 bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/15 p-2">
                    <item.icon size={18} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.title}</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

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
        <SearchField label={t('page.plan.form.customerName', { defaultValue: '客户名称' })}>
          <input
            value={queryParams.customerName}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, customerName: event.target.value }))}
            aria-label={t('page.plan.form.customerName', { defaultValue: '客户名称' })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.plan.form.customerName', { defaultValue: '客户名称' })}
          />
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
