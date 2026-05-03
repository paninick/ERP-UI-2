import { useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import client from '@/api/client';

const STATUS_TAGS: Record<string, { label: string; color: string }> = {
  WAIT_ASSIGN: { label: '待分配', color: 'bg-slate-100 text-slate-600' },
  ASSIGNED: { label: '已分配', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '进行中', color: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
};

// 使用现有 API 端点
const api = {
  list: (params: any) => client.get('/erp/team/task/list', { params }),
  get: (id: number) => client.get(`/erp/team/task/${id}`),
  add: (data: any) => client.post('/erp/team/task', data),
  update: (data: any) => client.put('/erp/team/task', data),
  remove: (ids: string) => client.delete(`/erp/team/task/${ids}`),
};

export default function TeamTaskPoolPage() {
  const [tableKey, setTableKey] = useState(0);
  const refreshTable = () => setTableKey((prev) => prev + 1);

  const columns = [
    { key: 'teamName', title: '班组' },
    { key: 'workshopName', title: '车间' },
    { key: 'jobNo', title: '工票编号' },
    { key: 'styleCode', title: '款号' },
    { key: 'processName', title: '工序' },
    { key: 'planQty', title: '计划数量' },
    { key: 'dispatchedQty', title: '已派数量' },
    { key: 'completedQty', title: '已完成' },
    {
      key: 'taskStatus',
      title: '状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || STATUS_TAGS.WAIT_ASSIGN;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'jobNo', label: '工票编号' },
    { name: 'styleCode', label: '款号' },
    { name: 'taskStatus', label: '状态', type: 'select' as const, options: Object.entries(STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
  ];

  const handleDispatch = async (record: any) => {
    const employeeText = window.prompt('请输入要派工的员工ID，多个员工用英文逗号分隔。', '');
    if (!employeeText) return;
    const employeeIds = employeeText
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item) && item > 0);
    if (!employeeIds.length) {
      toast.error('请输入有效的员工ID');
      return;
    }
    if (!(await confirm(`确认将任务 ${record.jobNo || record.id} 派给 ${employeeIds.length} 名员工？`))) return;
    try {
      await client.put(`/erp/team/task/dispatch/${record.id}`, employeeIds);
      toast.success('派工成功');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '派工失败');
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title="班组任务池"
      api={api}
      columns={columns}
      searchFields={searchFields}
      extraActions={(record: any) =>
        record.taskStatus !== 'COMPLETED' ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDispatch(record);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            派工
          </button>
        ) : null
      }
    />
  );
}
