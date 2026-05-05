import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Search } from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as qualityApi from '@/api/quality';
import * as jobProcessApi from '@/api/produceJobProcess';
import { useDictOptions } from '@/hooks/useDictOptions';

// 只读列表 API — 不暴露 add，禁止空白新增
const listApi = {
  list: qualityApi.listQuality,
  get: qualityApi.getQuality,
  update: qualityApi.updateQuality,
  remove: qualityApi.delQuality,
};

interface QcCreateForm {
  jobProcessId: string;
  orderNo: string;
  styleCode: string;
  batchNo: string;
  qcType: string;
  sampleQty: string;
  defectQty: string;
  result: string;
  inspectorName: string;
  remark: string;
}

const EMPTY_QC_FORM: QcCreateForm = {
  jobProcessId: '',
  orderNo: '',
  styleCode: '',
  batchNo: '',
  qcType: 'FINAL',
  sampleQty: '',
  defectQty: '0',
  result: 'PENDING',
  inspectorName: '',
  remark: '',
};

export default function QualityPage() {
  const { t } = useTranslation();
  const [urlParams] = useSearchParams();

  const qcResult = useDictOptions('erp_qc_result', [
    { value: 'PASS', label: t('quality.result.pass') },
    { value: 'FAIL', label: t('quality.result.fail') },
    { value: 'PENDING', label: t('quality.result.pending') },
  ]);
  const qcType = useDictOptions('erp_qc_type', [
    { value: 'DAILY', label: t('quality.type.daily') },
    { value: 'FINAL', label: t('quality.type.final') },
    { value: 'OUTSOURCE', label: t('quality.type.outsource') },
  ]);

  // 列表状态
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState({
    batchNo: urlParams.get('batchNo') || '',
    orderNo: urlParams.get('orderNo') || '',
    styleCode: urlParams.get('styleCode') || '',
    result: '',
  });

  // 工序检索状态
  const [processSearch, setProcessSearch] = useState({
    jobNo: urlParams.get('jobNo') || '',
    orderNo: urlParams.get('orderNo') || '',
  });
  const [processList, setProcessList] = useState<any[]>([]);
  const [processLoading, setProcessLoading] = useState(false);

  // 新建质检 Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<QcCreateForm>(EMPTY_QC_FORM);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true);
      try {
        const res: any = await qualityApi.listQuality({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          ...queryParams,
          ...params,
        });
        setData(res.rows || []);
        setPagination((prev) => ({ ...prev, total: res.total || 0 }));
      } catch {
        setData([]);
        toast.error(t('common.loadDataFailed'));
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, queryParams, t],
  );

  useEffect(() => { fetchData(); }, [fetchData]);

  // 从工票/工序检索待检工序
  const handleProcessSearch = async () => {
    if (!processSearch.jobNo && !processSearch.orderNo) {
      toast.error('请输入工票编号或订单号');
      return;
    }
    setProcessLoading(true);
    try {
      const res: any = await jobProcessApi.listProduceJobProcess({
        jobNo: processSearch.jobNo || undefined,
        orderNo: processSearch.orderNo || undefined,
        pageNum: 1,
        pageSize: 50,
      });
      setProcessList(res.rows || []);
      if ((res.rows || []).length === 0) {
        toast.success('未找到匹配的工序记录');
      }
    } catch (error: any) {
      toast.error(error.message || '检索失败');
    } finally {
      setProcessLoading(false);
    }
  };

  // 从工序发起质检
  const openCreateFromProcess = (process: any) => {
    setCreateForm({
      ...EMPTY_QC_FORM,
      jobProcessId: String(process.id || ''),
      orderNo: process.jobNo || process.planNo || '',
      styleCode: process.styleCode || '',
      batchNo: `QC-${process.jobNo || process.id}-${Date.now().toString().slice(-6)}`,
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createForm.jobProcessId && !createForm.orderNo) {
      toast.error('质检单必须关联工序或订单号');
      return;
    }
    if (!createForm.batchNo.trim()) {
      toast.error('请填写批次号');
      return;
    }
    const sampleQty = Number(createForm.sampleQty);
    const defectQty = Number(createForm.defectQty);
    if (!Number.isFinite(sampleQty) || sampleQty <= 0) {
      toast.error('请填写有效的抽检数量');
      return;
    }
    setCreating(true);
    try {
      await qualityApi.addQuality({
        ...createForm,
        jobProcessId: createForm.jobProcessId ? Number(createForm.jobProcessId) : undefined,
        sampleQty,
        defectQty: Number.isFinite(defectQty) ? defectQty : 0,
        passRate: sampleQty > 0 ? (sampleQty - (Number.isFinite(defectQty) ? defectQty : 0)) / sampleQty : 0,
      });
      toast.success('质检单已创建');
      setCreateOpen(false);
      fetchData({ pageNum: 1 });
    } catch (error: any) {
      toast.error(error.message || t('common.saveFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handlePass = async (record: any) => {
    if (!(await confirm(`确认放行质检单 ${record.batchNo}？`))) return;
    try {
      await qualityApi.passQuality(record.id);
      toast.success('已放行');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || '放行失败');
    }
  };

  const handleDelete = async (record: any) => {
    if (!(await confirm(`确认删除质检单 ${record.batchNo}？`))) return;
    try {
      await qualityApi.delQuality(String(record.id));
      toast.success(t('common.deleteSuccess'));
      fetchData();
    } catch (error: any) {
      toast.error(error.message || t('common.deleteFailed'));
    }
  };

  const columns = [
    { key: 'batchNo', title: t('quality.columns.batchNo') },
    { key: 'orderNo', title: t('quality.columns.orderNo') },
    { key: 'styleCode', title: t('quality.columns.styleCode') },
    { key: 'sampleQty', title: t('quality.columns.sampleQty') },
    { key: 'defectQty', title: t('quality.columns.defectQty') },
    {
      key: 'passRate',
      title: t('quality.columns.passRate'),
      render: (value: number) => (value != null ? `${(value * 100).toFixed(1)}%` : '-'),
    },
    {
      key: 'result',
      title: t('quality.columns.result'),
      render: (value: string) => {
        const tag = qcResult.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'inspectorName', title: t('quality.columns.inspector') },
    { key: 'createTime', title: t('quality.columns.checkDate') },
    {
      key: 'actions',
      title: '操作',
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          {record.result === 'PENDING' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePass(record); }}
              className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              放行
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-6">
      {/* 页面说明 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{t('quality.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">
              质检必须通过工票或订单号检索进入，不允许空白新建。从下方"检索待检工序"找到对应工序后，点"发起质检"创建质检单。
            </p>
          </div>
        </div>
      </section>

      {/* 工序检索入口 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">检索待检工序</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">工票编号</label>
            <input
              type="text"
              value={processSearch.jobNo}
              onChange={(e) => setProcessSearch((prev) => ({ ...prev, jobNo: e.target.value }))}
              placeholder="如 DEMO-JOB-2026-001"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">订单号</label>
            <input
              type="text"
              value={processSearch.orderNo}
              onChange={(e) => setProcessSearch((prev) => ({ ...prev, orderNo: e.target.value }))}
              placeholder="如 PP-20260504-00001"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            type="button"
            onClick={handleProcessSearch}
            disabled={processLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Search size={14} />
            {processLoading ? '检索中…' : '检索工序'}
          </button>
        </div>

        {processList.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="pb-2 pr-4">工序名称</th>
                  <th className="pb-2 pr-4">工票编号</th>
                  <th className="pb-2 pr-4">款号</th>
                  <th className="pb-2 pr-4">状态</th>
                  <th className="pb-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {processList.map((process) => (
                  <tr key={process.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-medium text-slate-700">{process.processName || '-'}</td>
                    <td className="py-2 pr-4 text-slate-500">{process.jobNo || '-'}</td>
                    <td className="py-2 pr-4 text-slate-500">{process.styleCode || '-'}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        {process.status || '待检'}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => openCreateFromProcess(process)}
                        className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                      >
                        发起质检
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 质检记录列表 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">质检记录</h2>
        <SearchForm
          onSearch={() => { setPagination((p) => ({ ...p, current: 1 })); fetchData({ pageNum: 1 }); }}
          onReset={() => {
            const next = { batchNo: '', orderNo: '', styleCode: '', result: '' };
            setQueryParams(next);
            setPagination((p) => ({ ...p, current: 1 }));
            fetchData({ pageNum: 1, ...next });
          }}
        >
          <SearchField label={t('quality.columns.batchNo')}>
            <input
              className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              value={queryParams.batchNo}
              onChange={(e) => setQueryParams((p) => ({ ...p, batchNo: e.target.value }))}
            />
          </SearchField>
          <SearchField label={t('quality.columns.orderNo')}>
            <input
              className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              value={queryParams.orderNo}
              onChange={(e) => setQueryParams((p) => ({ ...p, orderNo: e.target.value }))}
            />
          </SearchField>
          <SearchField label={t('quality.columns.styleCode')}>
            <input
              className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              value={queryParams.styleCode}
              onChange={(e) => setQueryParams((p) => ({ ...p, styleCode: e.target.value }))}
            />
          </SearchField>
          <SearchField label={t('quality.columns.result')}>
            <select
              className="rounded border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              value={queryParams.result}
              onChange={(e) => setQueryParams((p) => ({ ...p, result: e.target.value }))}
            >
              <option value="">全部</option>
              {qcResult.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </SearchField>
        </SearchForm>
        <div className="mt-4">
          <BaseTable columns={columns} data={data} loading={loading} />
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
              fetchData({ pageNum: page, pageSize });
            }}
          />
        </div>
      </section>

      {/* 新建质检 Modal — 必须有来源工序 */}
      <BaseModal
        open={createOpen}
        title="新建质检单"
        onClose={() => setCreateOpen(false)}
      >
        <div className="space-y-4 p-1">
          {createForm.jobProcessId && (
            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              来源工序 ID：{createForm.jobProcessId}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">批次号 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={createForm.batchNo}
                onChange={(e) => setCreateForm((p) => ({ ...p, batchNo: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">订单号</label>
              <input
                type="text"
                value={createForm.orderNo}
                onChange={(e) => setCreateForm((p) => ({ ...p, orderNo: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">款号</label>
              <input
                type="text"
                value={createForm.styleCode}
                onChange={(e) => setCreateForm((p) => ({ ...p, styleCode: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">检验类型</label>
              <select
                value={createForm.qcType}
                onChange={(e) => setCreateForm((p) => ({ ...p, qcType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                {qcType.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">抽检数量 <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={createForm.sampleQty}
                onChange={(e) => setCreateForm((p) => ({ ...p, sampleQty: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">疵点数量</label>
              <input
                type="number"
                min="0"
                value={createForm.defectQty}
                onChange={(e) => setCreateForm((p) => ({ ...p, defectQty: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">判定结果</label>
              <select
                value={createForm.result}
                onChange={(e) => setCreateForm((p) => ({ ...p, result: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                {qcResult.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">检验员</label>
              <input
                type="text"
                value={createForm.inspectorName}
                onChange={(e) => setCreateForm((p) => ({ ...p, inspectorName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">备注</label>
            <textarea
              value={createForm.remark}
              onChange={(e) => setCreateForm((p) => ({ ...p, remark: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateSubmit}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creating ? '创建中…' : '创建质检单'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
