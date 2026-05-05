import { useEffect, useMemo, useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import BaseModal from '@/components/ui/BaseModal';
import GenericForm from '@/components/ui/GenericForm';
import * as employeeApi from '@/api/employee';
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
};

export default function EmployeeDispatchPage() {
  const [tableKey, setTableKey] = useState(0);
  const [employees, setEmployees] = useState<any[]>([]);
  const [bindOpen, setBindOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [reviewLevel, setReviewLevel] = useState<'team' | 'workshop'>('team');
  const refreshTable = () => setTableKey((prev) => prev + 1);

  useEffect(() => {
    employeeApi.listEmployee({ pageNum: 1, pageSize: 999, status: '0' })
      .then((res: any) => setEmployees(res.rows || []))
      .catch(() => {
        setEmployees([]);
        toast.error('员工列表加载失败，暂不能绑定任务卡');
      });
  }, []);

  const employeeOptions = useMemo(
    () => employees.map((item) => ({
      value: String(item.id),
      label: `${item.employeeName || item.employeeCode || item.id}${item.team ? ` · ${item.team}` : item.department ? ` · ${item.department}` : ''}`,
    })),
    [employees],
  );

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

  const openBind = (record: any) => {
    setActiveRecord(record);
    setBindOpen(true);
  };

  const openComplete = (record: any) => {
    setActiveRecord(record);
    setCompleteOpen(true);
  };

  const openReview = (record: any, level: 'team' | 'workshop') => {
    setActiveRecord(record);
    setReviewLevel(level);
    setReviewOpen(true);
  };

  const handleBind = async (values: any) => {
    if (!activeRecord) return;
    const employeeId = Number(values.employeeId);
    if (!(await confirm(`确认将任务卡 ${activeRecord.taskCardNo} 绑定给所选员工？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/bind/${activeRecord.taskCardNo}`, employeeId);
      toast.success('绑定成功');
      setBindOpen(false);
      setActiveRecord(null);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '绑定失败');
      throw error;
    }
  };

  const handleComplete = async (values: any) => {
    if (!activeRecord) return;
    const actualQty = Number(values.actualQty);
    const defectQty = Number(values.defectQty || 0);
    if (!Number.isFinite(actualQty) || actualQty < 0 || !Number.isFinite(defectQty) || defectQty < 0) {
      toast.error('请输入有效的数量');
      return;
    }
    if (defectQty > actualQty) {
      toast.error('次品数不能大于实际完成数');
      return;
    }
    if (!(await confirm(`确认提交任务卡 ${activeRecord.taskCardNo} 的完工结果？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/complete/${activeRecord.id}`, { actualQty, defectQty });
      toast.success('完工提交成功');
      setCompleteOpen(false);
      setActiveRecord(null);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '提交失败');
      throw error;
    }
  };

  const handleReview = async (values: any) => {
    if (!activeRecord) return;
    const reviewStatus = values.reviewResult === 'REJECTED'
      ? 'REJECTED'
      : reviewLevel === 'team' ? 'TEAM_LEADER_REVIEWED' : 'COMPLETED';
    if (!(await confirm(`确认提交${reviewLevel === 'team' ? '组长' : '主任'}复核？`))) return;
    try {
      await client.put(`/erp/employee/dispatch/review/${reviewLevel}/${activeRecord.id}`, {
        reviewStatus,
        reviewName: values.reviewName || (reviewLevel === 'team' ? '组长复核' : '主任复核'),
        reviewRemark: values.reviewRemark,
      });
      toast.success('复核成功');
      setReviewOpen(false);
      setActiveRecord(null);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '复核失败');
      throw error;
    }
  };

  return (
    <>
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
                  openBind(record);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                扫码/选择绑定
              </button>
            )}
            {record.dispatchStatus === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openComplete(record);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
              >
                完工报数
              </button>
            )}
            {record.dispatchStatus === 'WAIT_REVIEW' && record.reviewStatus === 'WAIT_REVIEW' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openReview(record, 'team');
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
                  openReview(record, 'workshop');
                }}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
              >
                主任复核
              </button>
            )}
          </>
        )}
      />

      <BaseModal
        open={bindOpen}
        title={activeRecord ? `任务卡绑定 · ${activeRecord.taskCardNo || '-'}` : '任务卡绑定'}
        onClose={() => {
          setBindOpen(false);
          setActiveRecord(null);
        }}
        width="640px"
      >
        <GenericForm
          initialValues={{ employeeId: activeRecord?.employeeId ? String(activeRecord.employeeId) : '' }}
          fields={[
            {
              name: 'employeeId',
              label: '绑定员工',
              type: 'select',
              required: true,
              options: employeeOptions,
              group: '任务卡扫码/选择',
            },
          ]}
          onSubmit={handleBind}
          onCancel={() => {
            setBindOpen(false);
            setActiveRecord(null);
          }}
        />
      </BaseModal>

      <BaseModal
        open={completeOpen}
        title={activeRecord ? `完工报数 · ${activeRecord.taskCardNo || '-'}` : '完工报数'}
        onClose={() => {
          setCompleteOpen(false);
          setActiveRecord(null);
        }}
        width="640px"
      >
        <GenericForm
          initialValues={{
            actualQty: activeRecord?.planQty ?? '',
            defectQty: activeRecord?.defectQty ?? 0,
          }}
          fields={[
            { name: 'actualQty', label: '实际完成', type: 'number', required: true, group: '完工数量' },
            { name: 'defectQty', label: '次品数量', type: 'number', group: '完工数量' },
          ]}
          onSubmit={handleComplete}
          onCancel={() => {
            setCompleteOpen(false);
            setActiveRecord(null);
          }}
        />
      </BaseModal>

      <BaseModal
        open={reviewOpen}
        title={`${reviewLevel === 'team' ? '组长' : '主任'}复核 · ${activeRecord?.taskCardNo || '-'}`}
        onClose={() => {
          setReviewOpen(false);
          setActiveRecord(null);
        }}
        width="640px"
      >
        <GenericForm
          initialValues={{
            reviewResult: 'PASS',
            reviewName: '',
            reviewRemark: '',
          }}
          fields={[
            {
              name: 'reviewResult',
              label: '复核结果',
              type: 'select',
              required: true,
              options: [
                { value: 'PASS', label: '通过' },
                { value: 'REJECTED', label: '驳回返工' },
              ],
              group: '复核结论',
            },
            { name: 'reviewName', label: '复核人', group: '复核结论' },
            { name: 'reviewRemark', label: '复核备注', type: 'textarea', group: '复核结论' },
          ]}
          onSubmit={handleReview}
          onCancel={() => {
            setReviewOpen(false);
            setActiveRecord(null);
          }}
        />
      </BaseModal>
    </>
  );
}
