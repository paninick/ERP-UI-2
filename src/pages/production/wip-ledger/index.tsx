import { useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
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

const api = {
  list: (params: any) => client.get('/erp/production/wip/list', { params }),
  get: (id: number) => client.get(`/erp/production/wip/${id}`),
  add: (data: any) => client.post('/erp/production/wip', data),
  update: (data: any) => client.put('/erp/production/wip', data),
  remove: (ids: string) => client.delete(`/erp/production/wip/${ids}`),
};

export default function WipLedgerPage() {
  const [tableKey, setTableKey] = useState(0);
  const refreshTable = () => setTableKey((prev) => prev + 1);

  const columns = [
    { key: 'ledgerNo', title: '台账编号' },
    { key: 'jobNo', title: '工票编号' },
    { key: 'processName', title: '工序' },
    { key: 'materialName', title: '物料' },
    {
      key: 'currentStatus',
      title: '当前状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || { label: value || '-', color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'quantity', title: '数量' },
    { key: 'unit', title: '单位' },
    { key: 'workshopName', title: '所在车间' },
    { key: 'teamName', title: '所在班组' },
    { key: 'operatorName', title: '操作人员' },
    { key: 'outsourceVendorName', title: '外协单位' },
    {
      key: 'stayDuration',
      title: '停留时长',
      render: (value: number) => {
        const text = formatDuration(value);
        const isLong = value != null && value > 1440;
        return <span className={isLong ? 'font-medium text-red-600' : 'text-slate-600'}>{text}</span>;
      },
    },
    {
      key: 'abnormalFlag',
      title: '异常标记',
      render: (value: string) => {
        const tag = ABNORMAL_TAGS[value] || ABNORMAL_TAGS.N;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
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

  const handleStatusUpdate = async (record: any) => {
    const currentStatus = window.prompt(
      `请输入新的状态值：${Object.keys(STATUS_TAGS).join(' / ')}`,
      record.currentStatus || 'IN_PROCESS',
    );
    if (!currentStatus) return;
    const quantityText = window.prompt('请输入当前数量', record.quantity != null ? String(record.quantity) : '0');
    const quantity = Number(quantityText);
    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error('请输入有效数量');
      return;
    }
    const remark = window.prompt('请输入备注', record.remark || '') || '';
    if (!(await confirm(`确认将台账 ${record.ledgerNo} 更新为 ${currentStatus}？`))) return;
    try {
      await client.put('/erp/production/wip/status', {
        id: record.id,
        currentStatus,
        quantity,
        remark,
      });
      toast.success('状态更新成功');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '状态更新失败');
    }
  };

  const handleViewLogs = async (record: any) => {
    try {
      const response = await client.get('/erp/production/wip/log/list', {
        params: { ledgerId: record.id, pageNum: 1, pageSize: 5 },
      });
      const rows = response.rows || response.data?.rows || [];
      if (!rows.length) {
        toast.success('暂无台账流水');
        return;
      }
      const summary = rows
        .slice(0, 5)
        .map((item: any) => `${item.operationType || '-'}: ${item.beforeStatus || '-'} -> ${item.afterStatus || '-'} @ ${item.operationTime || '-'}`)
        .join('\n');
      window.alert(summary);
    } catch (error: any) {
      toast.error(error.message || '读取流水失败');
    }
  };

  return (
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
              handleStatusUpdate(record);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
          >
            改状态
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleViewLogs(record);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            看流水
          </button>
        </>
      )}
    />
  );
}
