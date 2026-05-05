import { useEffect, useMemo, useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import BaseModal from '@/components/ui/BaseModal';
import * as employeeApi from '@/api/employee';
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
};

export default function TeamTaskPoolPage() {
  const [tableKey, setTableKey] = useState(0);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchRecord, setDispatchRecord] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const refreshTable = () => setTableKey((prev) => prev + 1);

  useEffect(() => {
    employeeApi.listEmployee({ pageNum: 1, pageSize: 999, status: '0' })
      .then((res: any) => setEmployees(res.rows || []))
      .catch(() => {
        setEmployees([]);
        toast.error('员工列表加载失败，暂不能派工');
      });
  }, []);

  const employeeOptions = useMemo(
    () => employees.map((item) => ({
      id: String(item.id),
      label: `${item.employeeName || item.employeeCode || item.id}${item.team ? ` · ${item.team}` : item.department ? ` · ${item.department}` : ''}`,
      meta: [item.workshopName || item.workshop, item.station, item.skillLevel].filter(Boolean).join(' / '),
    })),
    [employees],
  );

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

  const openDispatch = (record: any) => {
    setDispatchRecord(record);
    setSelectedEmployeeIds([]);
    setDispatchOpen(true);
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId) ? prev.filter((item) => item !== employeeId) : [...prev, employeeId],
    );
  };

  const handleDispatch = async () => {
    if (!dispatchRecord) return;
    const employeeIds = selectedEmployeeIds.map(Number).filter((item) => Number.isFinite(item) && item > 0);
    if (!employeeIds.length) {
      toast.error('请先从在职员工中选择派工对象');
      return;
    }
    if (!(await confirm(`确认将任务 ${dispatchRecord.jobNo || dispatchRecord.id} 派给 ${employeeIds.length} 名员工？`))) return;
    setDispatching(true);
    try {
      await client.put(`/erp/team/task/dispatch/${dispatchRecord.id}`, employeeIds);
      toast.success('派工成功');
      setDispatchOpen(false);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '派工失败');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <>
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
                openDispatch(record);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              选择员工派工
            </button>
          ) : null
        }
      />

      <BaseModal
        open={dispatchOpen}
        title="班组任务派工"
        onClose={() => setDispatchOpen(false)}
        onOk={handleDispatch}
        loading={dispatching}
        width="720px"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{dispatchRecord?.jobNo || '-'}</p>
            <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
              <span>款号：{dispatchRecord?.styleCode || '-'}</span>
              <span>工序：{dispatchRecord?.processName || '-'}</span>
              <span>未派：{Math.max(Number(dispatchRecord?.planQty || 0) - Number(dispatchRecord?.dispatchedQty || 0), 0)}</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">选择在职员工</p>
              <p className="text-xs text-slate-500">已选 {selectedEmployeeIds.length} 人</p>
            </div>
            {employeeOptions.length ? (
              <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {employeeOptions.map((employee) => {
                  const checked = selectedEmployeeIds.includes(employee.id);
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => toggleEmployee(employee.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        checked
                          ? 'border-blue-400 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                          checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-transparent'
                        }`}>
                          ✓
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{employee.label}</span>
                          <span className="block text-xs text-slate-500">{employee.meta || '暂无工位/技能标签'}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                暂无可选在职员工。请先在员工管理维护员工、班组和岗位信息，再回到任务池派工。
              </div>
            )}
          </div>
        </div>
      </BaseModal>
    </>
  );
}
