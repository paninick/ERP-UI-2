import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as approvalApi from '@/api/approval';
import * as outsourceApi from '@/api/outsource';
import ApprovalTimeline from '@/components/business/ApprovalTimeline';
import CrudPage from '@/components/ui/CrudPage';
import BaseModal from '@/components/ui/BaseModal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useAuthStore } from '@/stores/authStore';
import {
  buildApprovalLog,
  buildApprovalPayload,
  getApprovalActorName,
  isApprovalLocked,
  resolveApprovalState,
  resolveApprovalValue,
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
  const user = useAuthStore((state) => state.user);
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

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actorName = getApprovalActorName(user);
    const actionText = action === 'submit' ? '提交' : action === 'approve' ? '确认' : '驳回';
    const confirmed = await confirm(`确认对 ${record.outsourceNo || record.jobNo || '-'} 执行「${actionText}」吗？`);
    if (!confirmed) {
      return;
    }

    const nextStatus = action === 'reject'
      ? resolveApprovalValue(processStatus.options, 'draft', '0')
      : action === 'approve'
        ? resolveApprovalValue(processStatus.options, 'approved', '1')
        : resolveApprovalValue(processStatus.options, 'submitted', '0');

    try {
      await outsourceApi.updateOutsource(buildApprovalPayload({
        record,
        statusField: 'status',
        nextStatus,
        action,
        actorName,
      }));
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'OUTSOURCE',
        businessId: record.id,
        businessNo: record.outsourceNo || record.jobNo,
        nodeCode: 'OUTSOURCE_APPROVE',
        actionType: action === 'submit' ? 'SUBMIT' : action === 'approve' ? 'APPROVE' : 'REJECT',
        fromStatus: String(record.status || ''),
        toStatus: String(nextStatus || ''),
        actionBy: actorName,
      })).catch(() => null);
      toast.success(action === 'approve' ? '外协单已确认' : action === 'reject' ? '外协单已驳回' : '外协单已提交');
      if (logOpen && currentRecord?.id === record.id) {
        loadApprovalLogs({ ...record, status: nextStatus });
      }
    } catch (error: any) {
      toast.error(error.message || '外协审批操作失败');
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
      <CrudPage
        title={t('page.outsource.title')}
        api={api}
        columns={columns}
        searchFields={searchFields}
        FormComponent={OutsourceForm}
        isEditDisabled={(record) => isApprovalLocked(record.status, processStatus.options)}
        isDeleteDisabled={(record) => isApprovalLocked(record.status, processStatus.options)}
        extraActions={(record) => (
          <>
            {resolveApprovalState(record.status, processStatus.options) !== 'approved' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'submit');
                }}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                提交
              </button>
            )}
            {resolveApprovalState(record.status, processStatus.options) !== 'approved' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproval(record, 'approve');
                }}
                className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
              >
                确认
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
              驳回
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                loadApprovalLogs(record);
              }}
              className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              记录
            </button>
          </>
        )}
      />

      <BaseModal
        open={logOpen}
        title={`外协审批记录 - ${currentRecord?.outsourceNo || currentRecord?.jobNo || '-'}`}
        onClose={() => setLogOpen(false)}
        width="760px"
      >
        <ApprovalTimeline title="外协审批记录" logs={approvalLogs} loading={logLoading} />
      </BaseModal>
    </>
  );
}
