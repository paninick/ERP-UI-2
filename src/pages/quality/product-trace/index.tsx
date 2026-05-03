import {useCallback, useEffect, useMemo, useState} from 'react';
import { useTranslation } from 'react-i18next';
import * as productTraceApi from '@/api/productTrace';
import {toast} from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, {SearchField} from '@/components/ui/SearchForm';
import {Calendar, CheckCircle, GitBranch, PackageCheck, ShoppingCart, Tag} from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';

interface ProductTrace {
  salesOrderId: number;
  salesNo: string;
  styleCode: string;
  bulkOrderNo: string;
  customerName: string;
  producePlanId: number;
  planNo: string;
  produceJobId: number;
  jobNo: string;
  colorCode: string;
  sizeCode: string;
  planQty: number;
  actualQty: number;
  serialId: number;
  serialNo: string;
  serialStatus: string;
  serialStatusName: string;
  currentProcessName: string;
  serialCreateTime: string;
  finishTime: string;
  warehouseTime: string;
  shipTime: string;
}

const EMPTY_SEARCH = {
  salesNo: '',
  styleCode: '',
  jobNo: '',
  serialNo: '',
  serialStatus: '',
};

const STATUS_COLORS: Record<string, string> = {
  '0': 'bg-slate-100 text-slate-700',
  '1': 'bg-blue-100 text-blue-700',
  '2': 'bg-amber-100 text-amber-700',
  '3': 'bg-emerald-100 text-emerald-700',
};

function safeNumber(value: number | undefined) {
  return Number(value) || 0;
}

export default function ProductTracePage() {
  const { t } = useTranslation();
  const S = 'page.productTrace';
  const [data, setData] = useState<ProductTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState(EMPTY_SEARCH);
  const [detailRecord, setDetailRecord] = useState<ProductTrace | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await productTraceApi.listProductTrace({
        ...searchParams,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      const rows = res.rows || res || [];
      setData(rows);
      setPagination((prev) => ({...prev, total: res.total || rows.length}));
    } catch {
      setData([]);
      setPagination((prev) => ({...prev, total: 0}));
      toast.error(t(`${S}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    return {
      total: data.length,
      inProduction: data.filter((item) => item.serialStatus === '0').length,
      completed: data.filter((item) => item.serialStatus === '1').length,
      inWarehouse: data.filter((item) => item.serialStatus === '2').length,
      shipped: data.filter((item) => item.serialStatus === '3').length,
    };
  }, [data]);

  const columns = [
    {
      key: 'salesNo',
      title: t(`${S}.columns.salesOrder`),
      render: (value: string, record: ProductTrace) => (
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-slate-400" />
          <div>
            <div className="font-medium text-slate-900">{value || '-'}</div>
            <div className="text-xs text-slate-400">{record.customerName || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'styleCode',
      title: t(`${S}.columns.styleAndBulk`),
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.bulkOrderNo || '-'}</div>
        </div>
      ),
    },
    {
      key: 'jobNo',
      title: t(`${S}.columns.jobTicket`),
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.colorCode || '-'} / {record.sizeCode || '-'}</div>
        </div>
      ),
    },
    {
      key: 'serialNo',
      title: t(`${S}.columns.serialNo`),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-slate-400" />
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'serialStatus',
      title: t(`${S}.columns.status`),
      render: (value: string, record: ProductTrace) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[value] || STATUS_COLORS['0']}`}>
          {record.serialStatusName || '-'}
        </span>
      ),
    },
    {
      key: 'currentProcessName',
      title: t(`${S}.columns.currentProcess`),
      render: (value: string) => value || '-',
    },
    {
      key: 'planQty',
      title: t(`${S}.columns.planVsActual`),
      render: (_value: number, record: ProductTrace) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">{safeNumber(record.planQty)}</div>
          <div className="text-slate-400">{t(`${S}.completed`, { qty: safeNumber(record.actualQty) })}</div>
        </div>
      ),
    },
    {
      key: 'serialCreateTime',
      title: t(`${S}.columns.created`),
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-sm">{value ? value.split(' ')[0] : '-'}</span>
        </div>
      ),
    },
    {
      key: 'shipTime',
      title: t(`${S}.columns.shipped`),
      render: (value: string) => value ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} className="text-emerald-500" />
          <span className="text-sm">{value.split(' ')[0]}</span>
        </div>
      ) : '-',
    },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '90px',
      render: (_value: string, record: ProductTrace) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setDetailRecord(record);
          }}
          className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
        >
          {t('common.detail')}
        </button>
      ),
    },
  ];

  const traceSteps = detailRecord ? [
    {
      label: t(`${S}.detail.sales`),
      value: detailRecord.salesNo || '-',
      hint: `${detailRecord.customerName || '-'} / ${detailRecord.bulkOrderNo || '-'}`,
      active: true,
    },
    {
      label: t(`${S}.detail.plan`),
      value: detailRecord.planNo || '-',
      hint: `${t(`${S}.columns.planVsActual`)} ${safeNumber(detailRecord.planQty)} / ${safeNumber(detailRecord.actualQty)}`,
      active: Boolean(detailRecord.producePlanId),
    },
    {
      label: t(`${S}.detail.job`),
      value: detailRecord.jobNo || '-',
      hint: `${detailRecord.colorCode || '-'} / ${detailRecord.sizeCode || '-'}`,
      active: Boolean(detailRecord.produceJobId),
    },
    {
      label: t(`${S}.detail.process`),
      value: detailRecord.currentProcessName || '-',
      hint: detailRecord.finishTime || t(`${S}.detail.unfinished`),
      active: Boolean(detailRecord.currentProcessName),
    },
    {
      label: t(`${S}.detail.shipment`),
      value: detailRecord.serialStatusName || '-',
      hint: detailRecord.shipTime || detailRecord.warehouseTime || '-',
      active: Boolean(detailRecord.shipTime || detailRecord.warehouseTime),
    },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_38%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{t(`${S}.badge`)}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{t(`${S}.title`)}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {t(`${S}.subtitle`)}
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">{t(`${S}.stats.inProduction`)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.inProduction}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">{t(`${S}.stats.completed`)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.completed}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">{t(`${S}.stats.inWarehouse`)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.inWarehouse}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">{t(`${S}.stats.shipped`)}</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">{summary.shipped}</p>
            </div>
          </div>
        </div>
      </div>

      <SearchForm
        onSearch={() => {
          setPagination((prev) => ({...prev, pageNum: 1}));
          loadData();
        }}
        onReset={() => {
          setSearchParams(EMPTY_SEARCH);
          setPagination((prev) => ({...prev, pageNum: 1}));
        }}
      >
        <SearchField label={t(`${S}.search.salesNo`)}>
          <input
            value={searchParams.salesNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, salesNo: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.salesNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.styleCode`)}>
          <input
            value={searchParams.styleCode}
            onChange={(event) => setSearchParams((prev) => ({...prev, styleCode: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.styleCodePlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.jobNo`)}>
          <input
            value={searchParams.jobNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, jobNo: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.jobNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.serialNo`)}>
          <input
            value={searchParams.serialNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, serialNo: event.target.value}))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.serialNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.status`)}>
          <select
            aria-label={t(`${S}.search.status`)}
            value={searchParams.serialStatus}
            onChange={(event) => setSearchParams((prev) => ({...prev, serialStatus: event.target.value}))}
            className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t(`${S}.search.all`)}</option>
            <option value="0">{t(`${S}.search.statusInProduction`)}</option>
            <option value="1">{t(`${S}.search.statusCompleted`)}</option>
            <option value="2">{t(`${S}.search.statusInWarehouse`)}</option>
            <option value="3">{t(`${S}.search.statusShipped`)}</option>
          </select>
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} rowKey="serialId" onRowClick={setDetailRecord} />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => setPagination((prev) => ({...prev, pageNum: page, pageSize}))}
      />

      <BaseModal
        open={Boolean(detailRecord)}
        title={`${t(`${S}.detail.title`)} - ${detailRecord?.styleCode || '-'}`}
        onClose={() => setDetailRecord(null)}
        width="880px"
      >
        {detailRecord && (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-slate-400">{t(`${S}.columns.styleAndBulk`)}</p>
                <p className="mt-1 font-semibold text-slate-900">{detailRecord.styleCode || '-'}</p>
                <p className="text-xs text-slate-500">{detailRecord.bulkOrderNo || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">{t(`${S}.columns.serialNo`)}</p>
                <p className="mt-1 font-mono font-semibold text-slate-900">{detailRecord.serialNo || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">{t(`${S}.columns.status`)}</p>
                <p className="mt-1 font-semibold text-emerald-700">{detailRecord.serialStatusName || '-'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {traceSteps.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {index === traceSteps.length - 1 ? <PackageCheck size={16} /> : <GitBranch size={16} />}
                    </span>
                    {index < traceSteps.length - 1 && <span className="h-8 w-px bg-slate-200" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-slate-900">{step.label}: {step.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{step.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t(`${S}.detail.scopeHint`)}
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
