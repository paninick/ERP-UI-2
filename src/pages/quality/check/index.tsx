import CrudPage from '../../../components/ui/CrudPage';
import * as api from '../../../api/check';
import { useTranslation } from 'react-i18next';

export default function Check() {
  const { t } = useTranslation();
  const columns = [
    { key: 'checkNo', title: t('page.check.checkNo') },
    { key: 'checkType', title: t('page.check.checkType') },
    { key: 'checkResult', title: t('page.check.checkResult') },
    { key: 'checker', title: t('page.check.checker') },
    { key: 'checkTime', title: t('page.check.checkTime') },
    { key: 'status', title: t('page.check.status') },
  ];
  return <CrudPage title={t('page.check.title')} api={api} columns={columns} entityKey="Check" />;
}
