import {useCallback, useEffect, useMemo, useState} from 'react';
import * as productTraceApi from '@/api/productTrace';
import {toast} from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, {SearchField} from '@/components/ui/SearchForm';
import {Calendar, CheckCircle, ShoppingCart, Tag} from 'lucide-react';

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
  const [data, setData] = useState<ProductTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState(EMPTY_SEARCH);

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
      toast.error('加载产品追溯数据失败');
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
      title: '销售订单',
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
      title: '款号 / 大货单',
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.bulkOrderNo || '-'}</div>
        </div>
      ),
    },
    {
      key: 'jobNo',
      title: '工票',
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.colorCode || '-'} / {record.sizeCode || '-'}</div>
        </div>
      ),
    },
    {
      key: 'serialNo',
      title: '序列号',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-slate-400" />
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'serialStatus',
      title: '状态',
      render: (value: string, record: ProductTrace) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[value] || STATUS_COLORS['0']}`}>
          {record.serialStatusName || '-'}
        </span>
      ),
    },
    {
      key: 'currentProcessName',
      title: '当前工序',
      render: (value: string) => value || '-',
    },
    {
      key: 'planQty',
      title: '计划 / 完成',
      render: (_value: number, record: ProductTrace) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">{safeNumber(record.planQty)}</div>
          <div className="text-slate-400">完成 {safeNumber(record.actualQty)}</div>
        </div>
      ),
    },
    {
      key: 'serialCreateTime',
      title: '建档',
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-sm">{value ? value.split(' ')[0] : '-'}</span>
        </div>
      ),
    },
    {
      key: 'shipTime',
      title: '出货',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} className="text-emerald-500" />
          <span className="text-sm">{value.split(' ')[0]}</span>
        </div>
      ) : '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_38%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">Traceability</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">产品全链路追溯</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              从销售单、款号、工票到成品序列号，追到当前工序和出货状态，便于售后追责、品质闭环和工厂复盘。
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">在制</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.inProduction}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">完工待入库</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.completed}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">已入库</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.inWarehouse}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">已出货</p>
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
        <SearchField label="销售单号">
          <input
            value={searchParams.salesNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, salesNo: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入销售单号"
          />
        </SearchField>
        <SearchField label="款号">
          <input
            value={searchParams.styleCode}
            onChange={(event) => setSearchParams((prev) => ({...prev, styleCode: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入款号"
          />
        </SearchField>
        <SearchField label="工票号">
          <input
            value={searchParams.jobNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, jobNo: event.target.value}))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入工票号"
          />
        </SearchField>
        <SearchField label="序列号">
          <input
            value={searchParams.serialNo}
            onChange={(event) => setSearchParams((prev) => ({...prev, serialNo: event.target.value}))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="输入序列号"
          />
        </SearchField>
        <SearchField label="状态">
          <select
            aria-label="状态"
            value={searchParams.serialStatus}
            onChange={(event) => setSearchParams((prev) => ({...prev, serialStatus: event.target.value}))}
            className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">全部</option>
            <option value="0">在制</option>
            <option value="1">已完工</option>
            <option value="2">已入库</option>
            <option value="3">已出货</option>
          </select>
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} rowKey="serialId" />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => setPagination((prev) => ({...prev, pageNum: page, pageSize}))}
      />
    </div>
  );
}
