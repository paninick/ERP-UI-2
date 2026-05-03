import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ClipboardCheck, Factory, Truck } from 'lucide-react';
import * as approvalApi from '@/api/approval';
import * as outsourceApi from '@/api/outsource';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import CrudPage from '@/components/ui/CrudPage';
import BaseModal from '@/components/ui/BaseModal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import {
  isApprovalLocked,
  resolveApprovalState,
} from '@/utils/approval';
import OutsourceForm from './form';

const api = {
  list: outsourceApi.listOutsource,
  get: outsourceApi.getOutsource,
  add: outsourceApi.addOutsource,
  update: outsourceApi.updateOutsource,
  remove: outsourceApi.delOutsource,
};

export default function OutsourcePage() {
  const { t } = useTranslation();
  const [tableKey, setTableKey] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);

  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: t('page.outsource.status.pending') },
    { value: '1', label: t('page.outsource.status.confirmed') },
    { value: '2', label: t('page.outsource.status.running') },
    { value: '3', label: t('page.outsource.status.completed') },
    { value: '4', label: t('page.outsource.status.cancelled') },
  ]);

  const loadApprovalLogs = async (record: any) => {
    setCurrentRecord(record);
    setLogOpen(true);
    setLogLoading(true);
    try {
      const response: any = await approvalApi.listApprovalLog({
        businessType: 'OUTSOURCE',
        businessId: record.id,
        pageNum: 1,
        pageSize: 50,
      });
      setApprovalLogs(response?.rows || []);
    } catch {
      setApprovalLogs([]);
    } finally {
      setLogLoading(false);
    }
  };

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actionText = action === 'submit' ? t('page.outsource.approval.submit') : action === 'approve' ? t('page.outsource.approval.approve') : t('page.outsource.approval.reject');
    const confirmed = await confirm(t('page.outsource.approval.confirmText', { no: record.outsourceNo || record.jobNo || '-', action: actionText }));
    if (!confirmed) {
      return;
    }

    try {
      if (action === 'submit') {
        await outsourceApi.submitOutsource(record.id);
      } else if (action === 'approve') {
        await outsourceApi.approveOutsource(record.id);
      } else {
        await outsourceApi.rejectOutsource(record.id);
      }
      toast.success(action === 'approve' ? t('page.outsource.approval.toastSuccess') : action === 'reject' ? t('page.outsource.approval.toastReject') : t('page.outsource.approval.toastSubmit'));
      if (logOpen && currentRecord?.id === record.id) {
        loadApprovalLogs(record);
      }
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || t('page.outsource.approval.toastFail'));
    }
  };

  const columns = [
    { key: 'outsourceNo', title: t('page.outsource.columns.outsourceNo') },
    { key: 'supplierName', title: t('page.outsource.columns.supplierName') },
    { key: 'jobNo', title: t('page.outsource.columns.jobNo') },
    { key: 'processName', title: t('page.outsource.columns.processName') },
    { key: 'styleCode', title: t('page.outsource.columns.styleCode') },
    { key: 'quantity', title: t('page.outsource.columns.quantity') },
    {
      key: 'unitPrice',
      title: t('page.outsource.columns.unitPrice'),
      render: (value: number) => (value != null ? `CNY ${value.toFixed(2)}` : '-'),
    },
    { key: 'expectedDate', title: t('page.outsource.columns.expectedDate') },
    {
      key: 'status',
      title: t('page.outsource.columns.status'),
      render: (value: string) => {
        const tag = processStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'outsourceNo', label: t('page.outsource.columns.outsourceNo') },
    { name: 'styleCode', label: t('page.outsource.columns.styleCode') },
    { name: 'status', label: t('page.outsource.columns.status'), type: 'select' as const, options: processStatus.options },
  ];

  return (
    <>
      <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-orange-700">生产执行口径</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.outsource.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              外协不是普通采购，它更接近生产执行的一环。这里应当管理“哪些工序外发、发给谁、何时回厂、回厂后如何质检和结算”，采购与财务更多是在供应协同和结算阶段参与，而不是替代生产路由决策。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Factory, label: '业务归口', value: '生产 / PMC / 厂长' },
                { icon: Truck, label: '核心动作', value: '外发 / 回厂 / 数量损耗' },
                { icon: ClipboardCheck, label: '下游节点', value: '质检 / 结算 / 放行' },
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
              { to: '/production/plan', title: '先看生产计划', detail: '是否需要外协，通常从产能与工序路由判断。' },
              { to: '/quality/inspection', title: '再看回厂质检', detail: '外协回厂后需要和品质检验、损耗确认一起闭环。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-orange-300 hover:bg-orange-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-orange-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        key={tableKey}
        title={t('page.outsource.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={OutsourceForm}
        isEditDisabled={(record) => isApprovalLocked(record.auditStatus)}
        isDeleteDisabled={(record) => isApprovalLocked(record.auditStatus)}
        extraActions={(record) => (
          <>
            {resolveApprovalState(record.auditStatus) !== 'approved' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'submit');
                }}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                {t('page.outsource.approval.submit')}
              </button>
            )}
            {resolveApprovalState(record.auditStatus) !== 'approved' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'approve');
                }}
                className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
              >
                {t('page.outsource.approval.approve')}
              </button>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'reject');
              }}
              className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
            >
              {t('page.outsource.approval.reject')}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                loadApprovalLogs(record);
              }}
              className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              {t('page.outsource.approval.log')}
            </button>
          </>
        )}
      />

      <BaseModal
        open={logOpen}
        title={t('page.outsource.approval.modalTitle', { no: currentRecord?.outsourceNo || currentRecord?.jobNo || '-' })}
        onClose={() => setLogOpen(false)}
        width="760px"
      >
        <ApprovalTimeline title={t('page.outsource.approval.approvalLog')} logs={approvalLogs} loading={logLoading} />
      </BaseModal>
    </>
  );
}
