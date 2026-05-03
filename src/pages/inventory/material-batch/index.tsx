import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, PackageSearch, ScanSearch, ShieldCheck } from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { toast } from '@/components/ui/Toast';
import * as inventoryApi from '@/api/inventory';
import client from '@/api/client';

type MaterialBatchRow = {
  id: number;
  batchNo: string;
  materialId: number;
  materialType?: string;
  sourceType?: string;
  qty?: number;
  remainingQty?: number;
  unit?: string;
  status?: string;
  warehouseId?: number;
  factoryId?: number;
  createTime?: string;
  remark?: string;
};

type TraceRow = Record<string, any>;

type SerialScanResult = {
  id?: number;
  serialNo?: string;
  jobId?: number;
  producePlanId?: number;
  status?: string;
};

const EMPTY_SEARCH = {
  batchNo: '',
  materialId: '',
  status: '',
  sourceType: '',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  CONSUMED: 'bg-slate-200 text-slate-700',
  LOCKED: 'bg-rose-100 text-rose-700',
};

export default function MaterialBatchPage() {
  const { t } = useTranslation();
  const S = 'page.materialBatch';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MaterialBatchRow[]>([]);
  const [searchParams, setSearchParams] = useState(EMPTY_SEARCH);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  });

  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardLoading, setForwardLoading] = useState(false);
  const [forwardRows, setForwardRows] = useState<TraceRow[]>([]);
  const [forwardTitle, setForwardTitle] = useState('');

  const [backwardOpen, setBackwardOpen] = useState(false);
  const [backwardLoading, setBackwardLoading] = useState(false);
  const [backwardRows, setBackwardRows] = useState<TraceRow[]>([]);
  const [backwardTitle, setBackwardTitle] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [serialContext, setSerialContext] = useState<SerialScanResult | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await inventoryApi.listMaterialBatch({
        ...searchParams,
        materialId: searchParams.materialId ? Number(searchParams.materialId) : undefined,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      const dataRows = Array.isArray(res?.rows) ? res.rows : [];
      setRows(dataRows);
      setPagination((prev) => ({ ...prev, total: Number(res?.total || dataRows.length || 0) }));
    } catch (error: any) {
      setRows([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      toast.error(error?.message || t(`${S}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, searchParams, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    const remainingQty = rows.reduce((sum, row) => sum + Number(row.remainingQty || 0), 0);
    const activeCount = rows.filter((row) => row.status === 'ACTIVE').length;
    return {
      activeCount,
      rowCount: rows.length,
      totalQty,
      remainingQty,
    };
  }, [rows]);

  const columns = [
    {
      key: 'batchNo',
      title: t(`${S}.columns.batchNo`),
      render: (value: string, record: MaterialBatchRow) => (
        <div>
          <div className="font-mono text-sm font-semibold text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">
            {t(`${S}.columns.materialId`)}: {record.materialId ?? '-'}
          </div>
        </div>
      ),
    },
    { key: 'sourceType', title: t(`${S}.columns.sourceType`) },
    {
      key: 'qty',
      title: t(`${S}.columns.qty`),
      render: (value: any, record: MaterialBatchRow) => `${Number(value || 0)} ${record.unit || ''}`.trim(),
    },
    {
      key: 'remainingQty',
      title: t(`${S}.columns.remainingQty`),
      render: (value: any, record: MaterialBatchRow) => (
        <span className={Number(value || 0) > 0 ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
          {`${Number(value || 0)} ${record.unit || ''}`.trim()}
        </span>
      ),
    },
    {
      key: 'status',
      title: t(`${S}.columns.status`),
      render: (value: string) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[value] || 'bg-slate-100 text-slate-600'}`}>
          {value || '-'}
        </span>
      ),
    },
    { key: 'warehouseId', title: t(`${S}.columns.warehouseId`) },
    { key: 'factoryId', title: t(`${S}.columns.factoryId`) },
    { key: 'createTime', title: t(`${S}.columns.createTime`) },
    {
      key: 'actions',
      title: t('common.actions'),
      width: '160px',
      render: (_value: any, record: MaterialBatchRow) => (
        <button
          type="button"
          data-testid={`material-batch-forward-${record.id}`}
          onClick={(event) => {
            event.stopPropagation();
            handleForwardTrace(record);
          }}
          className="rounded-lg px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
        >
          {t(`${S}.actions.forwardTrace`)}
        </button>
      ),
    },
  ];

  const forwardColumns = [
    { key: 'job_no', title: t(`${S}.traceForward.jobNo`) },
    { key: 'style_code', title: t(`${S}.traceForward.styleCode`) },
    { key: 'produce_plan_id', title: t(`${S}.traceForward.planId`) },
    { key: 'material_name', title: t(`${S}.traceForward.materialName`) },
    { key: 'actual_qty', title: t(`${S}.traceForward.actualQty`) },
    { key: 'serial_no', title: t(`${S}.traceForward.serialNo`) },
    { key: 'serial_status', title: t(`${S}.traceForward.serialStatus`) },
  ];

  const backwardColumns = [
    { key: 'batch_no', title: t(`${S}.traceBackward.batchNo`) },
    { key: 'material_id', title: t(`${S}.traceBackward.materialId`) },
    { key: 'material_name', title: t(`${S}.traceBackward.materialName`) },
    { key: 'actual_qty', title: t(`${S}.traceBackward.actualQty`) },
    { key: 'job_no', title: t(`${S}.traceBackward.jobNo`) },
    { key: 'style_code', title: t(`${S}.traceBackward.styleCode`) },
    { key: 'source_type', title: t(`${S}.traceBackward.sourceType`) },
    { key: 'source_id', title: t(`${S}.traceBackward.sourceId`) },
  ];

  async function handleForwardTrace(record: MaterialBatchRow) {
    setForwardOpen(true);
    setForwardTitle(`${t(`${S}.forwardTitle`)} - ${record.batchNo || record.id}`);
    setForwardLoading(true);
    try {
      const res: any = await inventoryApi.traceMaterialBatchForward(Number(record.id));
      setForwardRows(Array.isArray(res?.data) ? res.data : []);
    } catch (error: any) {
      setForwardRows([]);
      toast.error(error?.message || t(`${S}.traceForwardFailed`));
    } finally {
      setForwardLoading(false);
    }
  }

  async function handleBackwardTrace() {
    const trimmed = serialNo.trim();
    if (!trimmed) {
      toast.error(t(`${S}.search.serialRequired`));
      return;
    }
    setBackwardOpen(true);
    setBackwardLoading(true);
    setBackwardTitle(`${t(`${S}.backwardTitle`)} - ${trimmed}`);
    try {
      const serialRes: any = await client.get(`/erp/productSerial/scan/${encodeURIComponent(trimmed)}`);
      const serialData = serialRes?.data || serialRes;
      if (!serialData?.id) {
        throw new Error(t(`${S}.serialNotFound`));
      }
      setSerialContext(serialData);
      const traceRes: any = await inventoryApi.traceMaterialBatchBackward(Number(serialData.id));
      setBackwardRows(Array.isArray(traceRes?.data) ? traceRes.data : []);
    } catch (error: any) {
      setSerialContext(null);
      setBackwardRows([]);
      toast.error(error?.message || t(`${S}.traceBackwardFailed`));
    } finally {
      setBackwardLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#ecfeff_0%,#cffafe_34%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700">{t(`${S}.badge`)}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{t(`${S}.title`)}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{t(`${S}.subtitle`)}</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">{t(`${S}.stats.active`)}</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{summary.activeCount}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">{t(`${S}.stats.rows`)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.rowCount}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">{t(`${S}.stats.totalQty`)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.totalQty}</p>
            </div>
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="text-slate-400">{t(`${S}.stats.remainingQty`)}</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-700">{summary.remainingQty}</p>
            </div>
          </div>
        </div>
      </div>

      <SearchForm
        onSearch={() => {
          setPagination((prev) => ({ ...prev, pageNum: 1 }));
          loadData();
        }}
        onReset={() => {
          setSearchParams(EMPTY_SEARCH);
          setPagination((prev) => ({ ...prev, pageNum: 1 }));
        }}
      >
        <SearchField label={t(`${S}.search.batchNo`)}>
          <input
            value={searchParams.batchNo}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, batchNo: event.target.value }))}
            className="w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            placeholder={t(`${S}.search.batchNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.materialId`)}>
          <input
            value={searchParams.materialId}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, materialId: event.target.value }))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            placeholder={t(`${S}.search.materialIdPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.status`)}>
          <select
            value={searchParams.status}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, status: event.target.value }))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="">{t(`${S}.search.all`)}</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CONSUMED">CONSUMED</option>
          </select>
        </SearchField>
        <SearchField label={t(`${S}.search.sourceType`)}>
          <input
            value={searchParams.sourceType}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, sourceType: event.target.value }))}
            className="w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            placeholder={t(`${S}.search.sourceTypePlaceholder`)}
          />
        </SearchField>
      </SearchForm>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <ScanSearch size={16} className="text-cyan-600" />
              {t(`${S}.serialCard.title`)}
            </div>
            <p className="mt-1 text-sm text-slate-500">{t(`${S}.serialCard.subtitle`)}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={serialNo}
            onChange={(event) => setSerialNo(event.target.value)}
            data-testid="material-batch-serial-input"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 sm:w-72"
            placeholder={t(`${S}.serialCard.placeholder`)}
          />
          <button
            type="button"
            onClick={handleBackwardTrace}
            data-testid="material-batch-backward-trigger"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700"
          >
            {t(`${S}.serialCard.action`)}
          </button>
          </div>
        </div>
      </div>

      <BaseTable columns={columns} data={rows} loading={loading} rowKey="id" />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => setPagination((prev) => ({ ...prev, pageNum: page, pageSize }))}
      />

      <BaseModal
        open={forwardOpen}
        title={forwardTitle || t(`${S}.forwardTitle`)}
        onClose={() => setForwardOpen(false)}
        width="1100px"
        testId="material-batch-forward-modal"
      >
        <div className="mb-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          <div className="flex items-center gap-2 font-medium">
            <GitBranch size={16} />
            {t(`${S}.forwardHint.title`)}
          </div>
          <p className="mt-1 text-cyan-800">{t(`${S}.forwardHint.body`)}</p>
        </div>
        <BaseTable
          columns={forwardColumns}
          data={forwardRows}
          loading={forwardLoading}
          rowKey="serial_id"
          testId="material-batch-forward-table"
        />
      </BaseModal>

      <BaseModal
        open={backwardOpen}
        title={backwardTitle || t(`${S}.backwardTitle`)}
        onClose={() => setBackwardOpen(false)}
        width="1100px"
        testId="material-batch-backward-modal"
      >
        <div className="mb-4 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-medium">
              <PackageSearch size={16} />
              {t(`${S}.serialCard.serialNo`)}
            </div>
            <p className="mt-1 font-mono">{serialContext?.serialNo || serialNo || '-'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck size={16} />
              {t(`${S}.serialCard.jobId`)}
            </div>
            <p className="mt-1">{serialContext?.jobId ?? '-'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium">
              <GitBranch size={16} />
              {t(`${S}.serialCard.planId`)}
            </div>
            <p className="mt-1">{serialContext?.producePlanId ?? '-'}</p>
          </div>
        </div>
        <BaseTable
          columns={backwardColumns}
          data={backwardRows}
          loading={backwardLoading}
          rowKey="batch_id"
          testId="material-batch-backward-table"
        />
      </BaseModal>
    </div>
  );
}
