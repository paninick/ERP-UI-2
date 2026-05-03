import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, FileText, GitBranch, ShieldCheck } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as changeApi from '@/api/change';
import ChangeOrderForm from './Form';

const STATUS_TAGS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  SUBMITTED: { label: '已提交', color: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: '已通过', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: '已驳回', color: 'bg-amber-100 text-amber-700' },
};

const EXECUTE_TAGS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待执行', color: 'bg-slate-100 text-slate-600' },
  EXECUTING: { label: '执行中', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  QTY_CHANGE: '数量变更',
  COLOR_SIZE_CHANGE: '颜色/尺码变更',
  DELIVERY_CHANGE: '交期变更',
  PROCESS_BOM_CHANGE: '工艺/BOM变更',
  FACTORY_LINE_CHANGE: '执行工厂/产线变更',
  INSERT_ORDER: '插单',
  COPY_ORDER: '翻单复制',
};

const api = {
  list: changeApi.listChangeOrder,
  get: changeApi.getChangeOrder,
  add: changeApi.addChangeOrder,
  update: changeApi.updateChangeOrder,
  remove: changeApi.delChangeOrder,
};

export default function ChangeOrderPage() {
  const { t } = useTranslation();
  const [tableKey, setTableKey] = useState(0);

  const columns = [
    { key: 'changeNo', title: '变更单号' },
    {
      key: 'changeType',
      title: '变更类型',
      render: (value: string) => CHANGE_TYPE_LABELS[value] || value || '-',
    },
    { key: 'sourceDocType', title: '来源类型' },
    { key: 'sourceDocNo', title: '来源单据号' },
    {
      key: 'changeStatus',
      title: '变更状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || STATUS_TAGS.DRAFT;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {
      key: 'auditStatus',
      title: '审批状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || STATUS_TAGS.DRAFT;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    {
      key: 'executeStatus',
      title: '执行状态',
      render: (value: string) => {
        const tag = EXECUTE_TAGS[value] || EXECUTE_TAGS.PENDING;
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'changeReason', title: '变更原因' },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'changeNo', label: '变更单号' },
    { name: 'changeType', label: '变更类型', type: 'select' as const, options: Object.entries(CHANGE_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
    { name: 'changeStatus', label: '变更状态', type: 'select' as const, options: Object.entries(STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
  ];

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const isLocked = (record: any) =>
    record.changeStatus === 'SUBMITTED' || record.changeStatus === 'APPROVED' || record.changeStatus === 'REJECTED' || record.executeStatus === 'COMPLETED';

  const handleSubmit = async (record: any) => {
    if (!(await confirm(`确认提交变更单 ${record.changeNo}？提交后将自动生成影响分析。`))) return;
    try {
      await changeApi.submitChangeOrder(record.id);
      toast.success('变更单已提交');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '提交失败');
    }
  };

  const handleApprove = async (record: any) => {
    if (!(await confirm(`确认审批通过变更单 ${record.changeNo}？`))) return;
    try {
      await changeApi.approveChangeOrder(record.id, { auditStatus: 'APPROVED' });
      toast.success('变更单已审批通过');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '审批失败');
    }
  };

  const handleReject = async (record: any) => {
    if (!(await confirm(`确认驳回变更单 ${record.changeNo}？`))) return;
    try {
      await changeApi.approveChangeOrder(record.id, { auditStatus: 'REJECTED' });
      toast.success('变更单已驳回');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '驳回失败');
    }
  };

  const handleExecute = async (record: any) => {
    if (!(await confirm(`确认执行变更单 ${record.changeNo}？执行后将锁定原单据并生成新版本。`))) return;
    try {
      await changeApi.executeChangeOrder(record.id);
      toast.success('变更单已执行');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '执行失败');
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700">变更控制层</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">变更单</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              销售订单、技术/BOM、生产计划在审核生效后，关键字段不可直接覆盖。所有受控变更必须通过变更单记录版本、分析影响、审批执行。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: FileText, label: '它是什么', value: '受控变更的唯一入口' },
                { icon: GitBranch, label: '核心能力', value: '版本管理 / 影响分析 / 审批链' },
                { icon: ShieldCheck, label: '保护对象', value: '订单 / 计划 / BOM / 工票' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/sales/order', title: '销售订单', detail: '变更单可追溯到销售订单，查看当前版本与变更轨迹。' },
              { to: '/production/plan', title: '生产计划', detail: '变更执行后，受影响计划会标记待重排状态。' },
              { to: '/production/gantt', title: '甘特预排', detail: '插单和交期变更后，可在甘特图查看冲突与锁定段。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-amber-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        key={tableKey}
        title="变更单"
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={ChangeOrderForm}
        isEditDisabled={isLocked}
        isDeleteDisabled={isLocked}
        extraActions={(record: any) => {
          const isDraft = record.changeStatus === 'DRAFT';
          const isSubmitted = record.changeStatus === 'SUBMITTED';
          const isApproved = record.auditStatus === 'APPROVED' && record.executeStatus !== 'COMPLETED';

          return (
            <>
              {isDraft && (
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleSubmit(record); }}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  提交
                </button>
              )}
              {isSubmitted && (
                <>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleApprove(record); }}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleReject(record); }}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
                  >
                    驳回
                  </button>
                </>
              )}
              {isApproved && (
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleExecute(record); }}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  执行
                </button>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
