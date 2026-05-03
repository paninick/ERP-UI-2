import CrudPage from '../../../components/ui/CrudPage';
import * as api from '../../../api/dataImport';
import { useTranslation } from 'react-i18next';

export default function DataImport() {
  const { t } = useTranslation();
  const columns = [
    { key: 'importType', title: t('page.dataImport.importType') },
    { key: 'fileName', title: t('page.dataImport.fileName') },
    { key: 'totalCount', title: t('page.dataImport.totalCount') },
    { key: 'successCount', title: t('page.dataImport.successCount') },
    { key: 'failCount', title: t('page.dataImport.failCount') },
    { key: 'createTime', title: t('page.dataImport.createTime') },
  ];
  return <CrudPage title={t('page.dataImport.title')} api={api} columns={columns} entityKey="DataImport" />;
}
