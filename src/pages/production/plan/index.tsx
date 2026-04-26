import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as approvalApi from '@/api/approval';
import * as productionApi from '@/api/production';
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
import PlanForm from './PlanForm';

const api = {
  list: productionApi.listProducePlan,
  get: productionApi.getProducePlan,
  add: productionApi.addProducePlan,
  update: productionApi.updateProducePlan,
  remove: productionApi.delProducePlan,
};

export default function ProducePlanPage() {
  const { t } = useTranslation();
  const [tableKey, setTableKey] = useState(0);
  const user = useAuthStore((state) => state.user);
  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: t('page.plan.form.status.pending') },
    { value: '1', label: t('page.plan.form.status.scheduled') },
    { value: '2', label: t('page.plan.form.status.running') },
    { value: '3', label: t('page.plan.form.status.completed') },
  ]);

  const columns = [
    { key: 'planNo', title: t('page.plan.columns.planNo') },
    { key: 'salesNo', title: t('page.plan.columns.salesNo') },
    { key: 'styleCode', title: t('page.plan.columns.styleCode') },
    { key: 'planQty', title: t('page.plan.columns.planQty') },
    { key: 'planDate', title: t('page.plan.columns.planDate') },
    {
      key: 'status',
      title: t('page.plan.columns.status'),
      render: (value: string) => {
        const tag = planStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'planNo', label: t('page.plan.columns.planNo') },
    { name: 'styleCode', label: t('page.plan.columns.styleCode') },
    { name: 'status', label: t('page.plan.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actorName = getApprovalActorName(user);
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.planNo || record.salesNo || '-' }));
    if (!confirmed) {
      return;
    }

    const nextStatus = action === 'reject'
      ? resolveApprovalValue(planStatus.options, 'draft', '0')
      : action === 'approve'
        ? resolveApprovalValue(planStatus.options, 'approved', '1')
        : resolveApprovalValue(planStatus.options, 'submitted', '0');

    try {
      await productionApi.updateProducePlan(buildApprovalPayload({
        record,
        statusField: 'status',
        nextStatus,
        action,
        actorName,
      }));
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'PRODUCE_PLAN',
        businessId: record.id,
        businessNo: record.planNo,
        nodeCode: 'PLAN_APPROVE',
        actionType: action === 'submit' ? 'SUBMIT' : action === 'approve' ? 'APPROVE' : 'REJECT',
        fromStatus: String(record.status || ''),
        toStatus: String(nextStatus || ''),
        actionBy: actorName,
      })).catch(() => null);
      toast.success(
        action === 'submit'
          ? t('approval.submitSuccess')
          : action === 'approve'
            ? t('approval.approveSuccess')
            : t('approval.rejectSuccess'),
      );
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || t('approval.actionFailed'));
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title={t('page.plan.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={PlanForm}
      isEditDisabled={(record) => isApprovalLocked(record.status, planStatus.options)}
      isDeleteDisabled={(record) => isApprovalLocked(record.status, planStatus.options)}
      extraActions={(record: any) => (
        <>
          {resolveApprovalState(record.status, planStatus.options) !== 'approved' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'submit');
              }}
              className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              {t('common.submit')}
            </button>
          )}
          {resolveApprovalState(record.status, planStatus.options) !== 'approved' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleApproval(record, 'approve');
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              {t('common.approve')}
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
            {t('common.reject')}
          </button>
          <NavLink
            to={`/production/plan/print/${record.id}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t('common.print')}
          </NavLink>
        </>
      )}
    />
  );
}
