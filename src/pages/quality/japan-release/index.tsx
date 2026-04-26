import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/inspectionBooking';

const pageApi = { list: api.listBooking, get: api.getBooking, add: api.addBooking, update: api.updateBooking, remove: api.delBooking };

export default function JapanReleasePage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'bookingNo', title: t('japan.bookingNo') },
    { key: 'salesNo', title: t('japan.salesNo') },
    { key: 'styleCode', title: t('japan.styleCode') },
    { key: 'inspectionCompany', title: t('japan.company') },
    { key: 'inspectionResult', title: t('japan.result') },
    { key: 'status', title: t('japan.status') },
    { key: 'daysSinceBooking', title: t('japan.days') },
  ];
  const searchFields = [
    { name: 'bookingNo', label: t('japan.bookingNo') },
    { name: 'status', label: t('japan.status') },
  ];
  return <CrudPage title={t('japan.title')} api={pageApi} columns={columns} searchFields={searchFields} />;
}
