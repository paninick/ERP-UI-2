import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/approval';

const pageApi = { list: api.listApprovalLog, get: api.getApprovalLog, add: api.addApprovalLog, update: api.addApprovalLog, remove: api.addApprovalLog };

export default function ApprovalLogPage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'businessType', title: t('approval.businessType') },
    { key: 'businessId', title: t('approval.businessId') },
    { key: 'nodeCode', title: t('approval.nodeCode') },
    { key: 'actionType', title: t('approval.actionType') },
    { key: 'fromStatus', title: t('approval.from') },
    { key: 'toStatus', title: t('approval.to') },
    { key: 'actionBy', title: t('approval.by') },
    { key: 'actionTime', title: t('approval.time') },
  ];
  const searchFields = [
    { name: 'businessType', label: t('approval.businessType') },
    { name: 'businessId', label: t('approval.businessId') },
  ];
  return <CrudPage title={t('approval.title')} api={pageApi} columns={columns} searchFields={searchFields} />;
}
