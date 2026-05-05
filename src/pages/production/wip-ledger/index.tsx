import { useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import BaseModal from '@/components/ui/BaseModal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import client from '@/api/client';

const STATUS_TAGS: Record<string, { label: string; color: string }> = {
  IN_PROCESS: { label: '在制', color: 'bg-blue-100 text-blue-700' },
  WAITING_QC: { label: '待质检', color: 'bg-amber-100 text-amber-700' },
  WAITING_REPAIR: { label: '待返修', color: 'bg-orange-100 text-orange-700' },
  WAITING_WAREHOUSE: { label: '待入库', color: 'bg-cyan-100 text-cyan-700' },
  WAITING_OUTBOUND: { label: '待出库', color: 'bg-violet-100 text-violet-700' },
  WAREHOUSED: { label: '已入库', color: 'bg-emerald-100 text-emerald-700' },
  OUTBOUNDED: { label: '已出库', color: 'bg-slate-100 text-slate-700' },
  OUTSOURCING: { label: '外协中', color: 'bg-purple-100 text-purple-700' },
  SCRAPPED: { label: '已报废', color: 'bg-red-100 text-red-700' },
};

const ABNORMAL_TAGS: Record<string, { label: string; color: string }> = {
  Y: { label: '异常', color: 'bg-red-100 text-red-700' },
  N: { label: '正常', color: 'bg-slate-100 text-slate-600' },
};

function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes === 0) return '-';
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分` : `${h}小时`;
}

// WIP 台账只读 API — 不暴露 add/remove，禁止手工新增/删除
const api = {
  list: (params: any) => client.get('/erp/production/wip/list', { params }),
  get: (id: number) => client.get(`/erp/production/wip/${id}`),
  update: (data: any) => client.put('/erp/production/wip', data),
};

interface WipStatusForm {
  currentStatus: string;
  quantity: string;
  remark: string;
}

interface WipLogEntry {
  operationType?: string;
  beforeStatus?: string;
  afterStatus?: string;
  operationTime?: string;
  remark?: string;
}

export default function WipLedgerPage() {
  const [tableKey, setTableKey] = useState(0);
  const refreshTable = () => setTableKey((prev) => prev + 1);

  // 状态修改 Modal
  const [statusTarget, setStatusTarget] = useState<any>(null);
  const [statusForm, setStatusForm] = useState<WipStatusForm>({ currentStatus: '', quantity: '', remark: '' });
  const [statusSaving, setStatusSaving] = useState(false);

  // 流水查看 Modal
  const [logTarget, setLogTarget] = useState<any>(null);
  const [logRows, setLogRows] = useState<WipLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const columns = [
    { key: 'ledgerNo', title: '台账编号' },
    { key: 'jobNo', title: '工票编号' },
    { key: 'processName', title: '工序名称' },
    {
      key: 'currentStatus',
      title: '当前状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || { label: value || '-', color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'quantity', title: '当前数量' },
    {
      key: 'isAbnormal',
      title: '异常标记',
      render: (value: string) => {
        const tag = ABNORMAL_TAGS[value] || { label: value || '-', color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'workshopName', title: '车间' },
    {
      key: 'duration',
      title: '在制时长',
      render: (value: number) => formatDuration(value),
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'ledgerNo', label: '台账编号' },
    { name: 'jobNo', label: '工票编号' },
    { name: 'processName', label: '工序名称' },
    { name: 'currentStatus', label: '当前状态', type: 'select' as const, options: Object.entries(STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
    { name: 'workshopName', label: '车间' },
  ];

  const handleInit = async (record: any) => {
    if (!record.jobId) {
      toast.error('当前台账没有工票ID');
      return;
    }
    if (!(await confirm(`确认对工票 ${record.jobNo || record.jobId} 重新初始化在制台账？`))) return;
    try {
      await client.post(`/erp/production/wip/init/${record.jobId}`);
      toast.success('在制台账已初始化');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '初始化失败');
    }
  };

  const openStatusModal = (record: any) => {
    setStatusTarget(record);
    setStatusForm({
      currentStatus: record.currentStatus || 'IN_PROCESS',
      quantity: record.quantity != null ? String(record.quantity) : '0',
      remark: record.remark || '',
    });
  };

  const handleStatusSubmit = async () => {
    if (!statusTarget) return;
    const quantity = Number(statusForm.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error('请输入有效数量');
      return;
    }
    if (!(await confirm(`确认将台账 ${statusTarget.ledgerNo} 更新为 ${STATUS_TAGS[statusForm.currentStatus]?.label || statusForm.currentStatus}？`))) return;
    setStatusSaving(true);
    try {
      await client.put('/erp/production/wip/status', {
        id: statusTarget.id,
        currentStatus: statusForm.currentStatus,
        quantity,
        remark: statusForm.remark,
      });
      toast.success('状态更新成功');
      setStatusTarget(null);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '状态更新失败');
    } finally {
      setStatusSaving(false);
    }
  };

  const openLogModal = async (record: any) => {
    setLogTarget(record);
    setLogRows([]);
    setLogLoading(true);
    try {
      const response: any = await client.get('/erp/production/wip/log/list', {
        params: { ledgerId: record.id, pageNum: 1, pageSize: 20 },
      });
      setLogRows(response.rows || response.data?.rows || []);
    } catch (error: any) {
      toast.error(error.message || '读取流水失败');
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 说明区：WIP 由系统自动驱动 */}
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-800">
          在制品台账由报工、质检、返工、外协自动驱动，不允许手工新增或删除记录。
          人工只允许异常调整（需填写原因）。
        </p>
      </section>

      <CrudPage
        key={tableKey}
        title="在制品台账"
        api={api}
        columns={columns}
        searchFields={searchFields}
        extraActions={(record: any) => (
          <>
            {record.jobId && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleInit(record);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                初始化
              </button>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openStatusModal(record);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
            >
              异常调整
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openLogModal(record);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
            >
              看流水
            </button>
          </>
        )}
      />

      {/* 异常调整 Modal — 替代 window.prompt */}
      <BaseModal
        open={!!statusTarget}
        title={`异常调整：${statusTarget?.ledgerNo || ''}`}
        onClose={() => setStatusTarget(null)}
      >
        <div className="space-y-4 p-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">状态</label>
            <select
              value={statusForm.currentStatus}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, currentStatus: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {Object.entries(STATUS_TAGS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">当前数量</label>
            <input
              type="number"
              min="0"
              value={statusForm.quantity}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, quantity: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              调整原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={statusForm.remark}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, remark: e.target.value }))}
              placeholder="请填写异常调整原因"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStatusTarget(null)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="button"
              disabled={statusSaving || !statusForm.remark.trim()}
              onClick={handleStatusSubmit}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {statusSaving ? '保存中…' : '确认调整'}
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 流水查看 Modal — 替代 window.alert */}
      <BaseModal
        open={!!logTarget}
        title={`台账流水：${logTarget?.ledgerNo || ''}`}
        onClose={() => setLogTarget(null)}
      >
        <div className="p-1">
          {logLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">加载中…</p>
          ) : logRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">暂无流水记录</p>
          ) : (
            <div className="space-y-2">
              {logRows.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700">{item.operationType || '-'}</span>
                    <span className="text-xs text-slate-400">{item.operationTime || '-'}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.beforeStatus || '-'} → {item.afterStatus || '-'}
                    {item.remark && <span className="ml-2 text-slate-400">({item.remark})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setLogTarget(null)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              关闭
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
