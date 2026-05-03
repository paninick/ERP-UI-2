import CrudPage from '../../components/ui/CrudPage';
import * as api from '../../api/report';
import { useTranslation } from 'react-i18next';

export default function Report() {
  const { t } = useTranslation();
  const columns = [
    { key: 'reportName', title: t('page.report.reportName') },
    { key: 'reportType', title: t('page.report.reportType') },
    { key: 'period', title: t('page.report.period') },
    { key: 'createTime', title: t('page.report.createTime') },
  ];
  return <CrudPage title={t('page.report.title')} api={api} columns={columns} entityKey="Report" />;
}
