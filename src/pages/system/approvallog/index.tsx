import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/approval';

const pageApi = { list: api.listApprovalLog, get: api.getApprovalLog, add: api.addApprovalLog, update: api.addApprovalLog, remove: api.addApprovalLog };

export default function ApprovalLogPage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'businessType', title: t('approvalLog.businessType') },
    { key: 'businessId', title: t('approvalLog.businessId') },
    { key: 'nodeCode', title: t('approvalLog.nodeCode') },
    { key: 'actionType', title: t('approvalLog.actionType') },
    { key: 'fromStatus', title: t('approvalLog.from') },
    { key: 'toStatus', title: t('approvalLog.to') },
    { key: 'actionBy', title: t('approvalLog.by') },
    { key: 'actionTime', title: t('approvalLog.time') },
  ];
  const searchFields = [
    { name: 'businessType', label: t('approvalLog.businessType') },
    { name: 'businessId', label: t('approvalLog.businessId') },
  ];
  return <CrudPage title={t('approvalLog.title')} api={pageApi} columns={columns} searchFields={searchFields} />;
}
