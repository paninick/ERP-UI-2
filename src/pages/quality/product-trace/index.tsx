import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, GitBranch, PackageCheck, ScanSearch, ShoppingCart, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as productTraceApi from '@/api/productTrace';
import { toast } from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
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

const STATUS_META: Record<string, { label: string; color: string; scene: string }> = {
  '0': { label: '生产中', color: 'bg-slate-100 text-slate-700', scene: '还在车间流转，未形成成品闭环' },
  '1': { label: '已完工', color: 'bg-blue-100 text-blue-700', scene: '生产已完成，等待后续入库或出货动作' },
  '2': { label: '已入库', color: 'bg-amber-100 text-amber-700', scene: '已回仓，可进入配货或出货' },
  '3': { label: '已出货', color: 'bg-emerald-100 text-emerald-700', scene: '链路已走到客户交付环节' },
};

function safeNumber(value: number | undefined) {
  return Number(value) || 0;
}

function resolveStatus(record: ProductTrace) {
  return STATUS_META[record.serialStatus] || {
    label: record.serialStatusName || '未知状态',
    color: 'bg-slate-100 text-slate-600',
    scene: '系统暂未定义该状态的业务含义',
  };
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
      setPagination((prev) => ({ ...prev, total: res.total || rows.length }));
    } catch {
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      toast.error('产品追溯数据加载失败');
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
      sample: data[0] || null,
    };
  }, [data]);

  const columns = [
    {
      key: 'salesNo',
      title: '订单来源',
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
      title: '款式 / 整单',
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.bulkOrderNo || '-'}</div>
        </div>
      ),
    },
    {
      key: 'jobNo',
      title: '工单案例',
      render: (value: string, record: ProductTrace) => (
        <div>
          <div className="font-medium text-slate-900">{value || '-'}</div>
          <div className="text-xs text-slate-400">{record.colorCode || '-'} / {record.sizeCode || '-'}</div>
        </div>
      ),
    },
    {
      key: 'serialNo',
      title: '成品流水号',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-slate-400" />
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'serialStatus',
      title: '当前状态',
      render: (_value: string, record: ProductTrace) => {
        const meta = resolveStatus(record);
        return (
          <div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.color}`}>{meta.label}</span>
            <div className="mt-1 text-xs text-slate-500">{meta.scene}</div>
          </div>
        );
      },
    },
    {
      key: 'currentProcessName',
      title: '当前工序节点',
      render: (value: string) => value || '已脱离现场工序，进入仓储/出货环节',
    },
    {
      key: 'planQty',
      title: '数量进度',
      render: (_value: number, record: ProductTrace) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">计划 {safeNumber(record.planQty)}</div>
          <div className="text-slate-400">已完成 {safeNumber(record.actualQty)}</div>
        </div>
      ),
    },
    {
      key: 'serialCreateTime',
      title: '建档时间',
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-sm">{value ? String(value).split(' ')[0] : '-'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: '链路详情',
      width: '100px',
      render: (_value: string, record: ProductTrace) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setDetailRecord(record);
          }}
          className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
        >
          查看链路
        </button>
      ),
    },
  ];

  const traceSteps = detailRecord ? [
    {
      label: '销售订单',
      value: detailRecord.salesNo || '-',
      hint: `${detailRecord.customerName || '-'} / ${detailRecord.bulkOrderNo || '-'}`,
      active: true,
    },
    {
      label: '生产计划',
      value: detailRecord.planNo || '-',
      hint: `计划 ${safeNumber(detailRecord.planQty)} / 完成 ${safeNumber(detailRecord.actualQty)}`,
      active: Boolean(detailRecord.producePlanId),
    },
    {
      label: '生产工单',
      value: detailRecord.jobNo || '-',
      hint: `${detailRecord.colorCode || '-'} / ${detailRecord.sizeCode || '-'}`,
      active: Boolean(detailRecord.produceJobId),
    },
    {
      label: '现场工序',
      value: detailRecord.currentProcessName || '已完成现场工序',
      hint: detailRecord.finishTime || '还未完工',
      active: Boolean(detailRecord.currentProcessName || detailRecord.finishTime),
    },
    {
      label: '仓储/出货',
      value: resolveStatus(detailRecord).label,
      hint: detailRecord.shipTime || detailRecord.warehouseTime || '尚未入库/出货',
      active: Boolean(detailRecord.shipTime || detailRecord.warehouseTime),
    },
  ] : [];

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#ecfeff_0%,#cffafe_38%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700">Product Trace Story</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">产品追溯案例</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              这里应该讲清楚“这件货从哪张销售单来、挂在哪个计划、落到哪张工单、现在停在哪个节点”，而不是只把视图字段列出来。
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">追溯样本</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">生产中</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.inProduction}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">已入库</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">{summary.inWarehouse}</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4">
              <p className="text-slate-400">已出货</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">{summary.shipped}</p>
            </div>
          </div>
        </div>
      </section>

      {summary.sample ? (
        <section className="rounded-3xl border border-cyan-200 bg-cyan-50 px-5 py-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-cyan-700 shadow-sm">
              <ScanSearch size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">当前追溯样板</p>
              <p className="mt-1 text-sm text-slate-700">
                成品流水号 <span className="font-semibold">{summary.sample.serialNo || '-'}</span> 来自销售单
                <span className="font-semibold"> {summary.sample.salesNo || '-'}</span>，
                当前处于 <span className="font-semibold">{resolveStatus(summary.sample).label}</span>，
                工单为 <span className="font-semibold">{summary.sample.jobNo || '-'}</span>，
                当前节点 <span className="font-semibold">{summary.sample.currentProcessName || '仓储/出货阶段'}</span>。
              </p>
            </div>
          </div>
        </section>
      ) : null}

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
        <SearchField label={t(`${S}.search.salesNo`)}>
          <input
            value={searchParams.salesNo}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, salesNo: event.target.value }))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.salesNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.styleCode`)}>
          <input
            value={searchParams.styleCode}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, styleCode: event.target.value }))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.styleCodePlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.jobNo`)}>
          <input
            value={searchParams.jobNo}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, jobNo: event.target.value }))}
            className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.jobNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.serialNo`)}>
          <input
            value={searchParams.serialNo}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, serialNo: event.target.value }))}
            className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t(`${S}.search.serialNoPlaceholder`)}
          />
        </SearchField>
        <SearchField label={t(`${S}.search.status`)}>
          <select
            aria-label={t(`${S}.search.status`)}
            value={searchParams.serialStatus}
            onChange={(event) => setSearchParams((prev) => ({ ...prev, serialStatus: event.target.value }))}
            className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            <option value="">{t(`${S}.search.all`)}</option>
            <option value="0">生产中</option>
            <option value="1">已完工</option>
            <option value="2">已入库</option>
            <option value="3">已出货</option>
          </select>
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} rowKey="serialId" onRowClick={setDetailRecord} />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => setPagination((prev) => ({ ...prev, pageNum: page, pageSize }))}
      />

      <BaseModal
        open={Boolean(detailRecord)}
        title={`追溯链路 - ${detailRecord?.styleCode || '-'}`}
        onClose={() => setDetailRecord(null)}
        width="880px"
      >
        {detailRecord && (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-slate-400">款式 / 整单</p>
                <p className="mt-1 font-semibold text-slate-900">{detailRecord.styleCode || '-'}</p>
                <p className="text-xs text-slate-500">{detailRecord.bulkOrderNo || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">成品流水号</p>
                <p className="mt-1 font-mono font-semibold text-slate-900">{detailRecord.serialNo || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">当前状态</p>
                <p className="mt-1 font-semibold text-emerald-700">{resolveStatus(detailRecord).label}</p>
              </div>
            </div>

            <div className="space-y-3">
              {traceSteps.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step.active ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400'}`}>
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

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
              这条链路用于回答“这件货现在到底停在哪”。如果缺少计划号、工单号、入库时间或出货时间，就说明链路还没有完全闭环。
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
