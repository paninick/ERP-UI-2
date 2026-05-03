import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/inspectionBooking';

const pageApi = { list: api.listBooking, get: api.getBooking, add: api.addBooking, update: api.updateBooking, remove: api.delBooking };

export default function JapanReleasePage() {
  const { t } = useTranslation();
  const S = 'japan';
  const columns = [
    { key: 'bookingNo', title: t(`${S}.bookingNo`) },
    { key: 'salesNo', title: t(`${S}.salesNo`) },
    { key: 'styleCode', title: t(`${S}.styleCode`) },
    { key: 'inspectionCompanyName', title: t(`${S}.company`) },
    { key: 'inspectionResult', title: t(`${S}.result`) },
    { key: 'status', title: t(`${S}.status`) },
    { key: 'daysSinceBooking', title: t(`${S}.days`) },
  ];
  const searchFields = [
    { name: 'bookingNo', label: t(`${S}.bookingNo`) },
    { name: 'status', label: t(`${S}.status`) },
  ];
  return <CrudPage title={t(`${S}.title`)} api={pageApi} columns={columns} searchFields={searchFields} />;
}
