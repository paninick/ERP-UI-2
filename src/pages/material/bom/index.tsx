import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as bomApi from '@/api/bom';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useAuthStore } from '@/stores/authStore';
import * as approvalApi from '@/api/approval';
import {
  buildApprovalLog,
  buildApprovalPayload,
  getApprovalActorName,
  isApprovalLocked,
  resolveApprovalState,
  resolveApprovalValue,
} from '@/utils/approval';
import BomForm from './form';

const api = {
  list: bomApi.listBom,
  get: bomApi.getBom,
  add: bomApi.addBom,
  update: bomApi.updateBom,
  remove: bomApi.delBom,
};

export default function BomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tableKey, setTableKey] = useState(0);
  const user = useAuthStore((state) => state.user);
  const styleType = useDictOptions('erp_sample_style');
  const auditStatus = useDictOptions('erp_sample_audit_status');

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApproval = async (record: any, action: 'submit' | 'approve' | 'reject') => {
    const actorName = getApprovalActorName(user);
    const actionText = action === 'submit' ? t('common.submit') : action === 'approve' ? t('common.approve') : t('common.reject');
    const confirmed = await confirm(t('approval.confirmAction', { action: actionText, name: record.sampleNo || record.styleCode || '-' }));
    if (!confirmed) {
      return;
    }

    const nextStatus = action === 'reject'
      ? resolveApprovalValue(auditStatus.options, 'rejected')
      : action === 'approve'
        ? resolveApprovalValue(auditStatus.options, 'approved')
        : resolveApprovalValue(auditStatus.options, 'submitted');

    try {
      await bomApi.updateBom(buildApprovalPayload({
        record,
        statusField: 'auditStatus',
        nextStatus,
        action,
        actorName,
      }));
      await approvalApi.addApprovalLog(buildApprovalLog({
        businessType: 'BOM',
        businessId: record.id,
        businessNo: record.sampleNo || record.styleCode,
        nodeCode: 'BOM_APPROVE',
        actionType: action === 'submit' ? 'SUBMIT' : action === 'approve' ? 'APPROVE' : 'REJECT',
        fromStatus: String(record.auditStatus || ''),
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
      title={t('page.bom.title')}
      api={api}
      columns={[
        { key: 'sampleNo', title: t('page.bom.columns.sampleNo') },
        { key: 'customerName', title: t('page.bom.columns.customerName') },
        { key: 'styleCode', title: t('page.bom.columns.styleCode') },
        { key: 'bulkOrderNo', title: t('page.bom.columns.bulkOrderNo') },
        {
          key: 'styleType',
          title: t('page.bom.columns.styleType'),
          render: (value: string) => {
            const tag = styleType.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        {
          key: 'auditStatus',
          title: t('page.bom.columns.auditStatus'),
          render: (value: string) => {
            const tag = auditStatus.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        { key: 'dueDate', title: t('page.bom.columns.dueDate') },
        { key: 'salesName', title: t('page.bom.columns.salesName') },
      ]}
      searchFields={[
        { name: 'sampleNo', label: t('page.bom.columns.sampleNo') },
        { name: 'styleCode', label: t('page.bom.columns.styleCode') },
        {
          name: 'auditStatus',
          label: t('page.bom.columns.auditStatus'),
          type: 'select',
          options: auditStatus.options,
        },
      ]}
      FormComponent={BomForm}
      isEditDisabled={(record) => isApprovalLocked(record.auditStatus, auditStatus.options)}
      isDeleteDisabled={(record) => isApprovalLocked(record.auditStatus, auditStatus.options)}
      extraActions={(record) => (
        <>
          {resolveApprovalState(record.auditStatus, auditStatus.options) !== 'approved' && (
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
          {resolveApprovalState(record.auditStatus, auditStatus.options) !== 'approved' && (
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
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/material/bom/${record.id}`);
            }}
            className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
          >
            {t('common.detail')}
          </button>
        </>
      )}
    />
  );
}
