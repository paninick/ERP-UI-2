import { useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import client from '@/api/client';

const DISPATCH_STATUS_TAGS: Record<string, { label: string; color: string }> = {
  WAIT_DISPATCH: { label: '待派工', color: 'bg-slate-100 text-slate-600' },
  DISPATCHED: { label: '已派工', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '进行中', color: 'bg-amber-100 text-amber-700' },
  WAIT_REVIEW: { label: '待复核', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
};

const REVIEW_STATUS_TAGS: Record<string, { label: string; color: string }> = {
  WAIT_REVIEW: { label: '待复核', color: 'bg-slate-100 text-slate-600' },
  TEAM_LEADER_REVIEWED: { label: '组长已复核', color: 'bg-blue-100 text-blue-700' },
  WORKSHOP_LEADER_REVIEWED: { label: '主任已复核', color: 'bg-emerald-100 text-emerald-700' },
  COMPLETED: { label: '主任已复核', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: '已驳回', color: 'bg-red-100 text-red-700' },
};

const api = {
  list: (params: any) => client.get('/erp/employee/dispatch/list', { params }),
  get: (id: number) => client.get(`/erp/employee/dispatch/${id}`),
  add: (data: any) => client.post('/erp/employee/dispatch', data),
  update: (data: any) => client.put('/erp/employee/dispatch', data),
  remove: (ids: string) => client.delete(`/erp/employee/dispatch/${ids}`),
};

export default function EmployeeDispatchPage() {
  const [tableKey, setTableKey] = useState(0);
  const refreshTable = () => setTableKey((prev) => prev + 1);

  const columns = [
    { key: 'taskCardNo', title: '任务卡号' },
    { key: 'employeeName', title: '员工' },
    { key: 'jobNo', title: '工票编号' },
    { key: 'processName', title: '工序' },
    { key: 'teamName', title: '班组' },
    { key: 'planQty', title: '计划数量' },
    { key: 'actualQty', title: '实际完成' },
    { key: 'defectQty', title: '次品数' },
    {
      key: 'dispatchStatus',
      title: '派工状态',
      render: (value: string) => {
        const tag = DISPATCH_STATUS_TAGS[value] || DISPATCH_STATUS_TAGS.WAIT_DISPATCH;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {
      key: 'reviewStatus',
      title: '复核状态',
      render: (value: string) => {
        const tag = REVIEW_STATUS_TAGS[value] || REVIEW_STATUS_TAGS.WAIT_REVIEW;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'taskCardNo', label: '任务卡号' },
    { name: 'employeeName', label: '员工姓名' },
    { name: 'dispatchStatus', label: '派工状态', type: 'select' as const, options: Object.entries(DISPATCH_STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
  ];

  const handleBind = async (record: any) => {
    const employeeIdText = window.prompt(`请输入绑定员工ID，任务卡 ${record.taskCardNo}`, record.employeeId ? String(record.employeeId) : '');
    const employeeId = Number(employeeIdText);
    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      toast.error('请输入有效的员工ID');
      return;
    }
    if (!(await confirm(`确认将任务卡 ${record.taskCardNo} 绑定给员工 ${employeeId}？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/bind/${record.taskCardNo}`, employeeId);
      toast.success('绑定成功');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '绑定失败');
    }
  };

  const handleComplete = async (record: any) => {
    const actualQtyText = window.prompt(`请输入任务卡 ${record.taskCardNo} 的实际完成数量`, record.planQty ? String(record.planQty) : '');
    const defectQtyText = window.prompt('请输入次品数量', record.defectQty ? String(record.defectQty) : '0');
    const actualQty = Number(actualQtyText);
    const defectQty = Number(defectQtyText);
    if (!Number.isFinite(actualQty) || actualQty < 0 || !Number.isFinite(defectQty) || defectQty < 0) {
      toast.error('请输入有效的数量');
      return;
    }
    if (!(await confirm(`确认提交任务卡 ${record.taskCardNo} 的完工结果？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/complete/${record.id}`, { actualQty, defectQty });
      toast.success('完工提交成功');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '提交失败');
    }
  };

  const handleReview = async (record: any, level: 'team' | 'workshop') => {
    const reviewStatusDefault = level === 'team' ? 'TEAM_LEADER_REVIEWED' : 'COMPLETED';
    const reviewStatus = window.prompt(
      `请输入复核状态：${level === 'team' ? 'TEAM_LEADER_REVIEWED 或 REJECTED' : 'COMPLETED 或 REJECTED'}`,
      reviewStatusDefault,
    );
    if (!reviewStatus) return;
    const reviewName = window.prompt('请输入复核人姓名', '');
    if (!(await confirm(`确认提交${level === 'team' ? '组长' : '主任'}复核？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/review/${level}/${record.id}`, {
        reviewStatus,
        reviewName,
      });
      toast.success('复核成功');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '复核失败');
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title="员工派工单"
      api={api}
      columns={columns}
      searchFields={searchFields}
      extraActions={(record: any) => (
        <>
          {record.dispatchStatus === 'DISPATCHED' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleBind(record);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              绑定
            </button>
          )}
          {record.dispatchStatus === 'IN_PROGRESS' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleComplete(record);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
            >
              完工
            </button>
          )}
          {record.dispatchStatus === 'WAIT_REVIEW' && record.reviewStatus === 'WAIT_REVIEW' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleReview(record, 'team');
              }}
              className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
            >
              组长复核
            </button>
          )}
          {record.reviewStatus === 'TEAM_LEADER_REVIEWED' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleReview(record, 'workshop');
              }}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              主任复核
            </button>
          )}
        </>
      )}
    />
  );
}
