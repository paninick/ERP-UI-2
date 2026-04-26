import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/inspectionBooking';

const pageApi = { list: api.listBooking, get: api.getBooking, add: api.addBooking, update: api.updateBooking, remove: api.delBooking };

export default function InspectionBookingPage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'bookingNo', title: t('booking.no') },
    { key: 'salesNo', title: t('booking.salesNo') },
    { key: 'styleCode', title: t('booking.styleCode') },
    { key: 'bookingDate', title: t('booking.date') },
    { key: 'inspectionResult', title: t('booking.result') },
    { key: 'status', title: t('booking.status') },
  ];
  const searchFields = [
    { name: 'bookingNo', label: t('booking.no') },
    { name: 'salesNo', label: t('booking.salesNo') },
  ];
  const formFields = [
    { name: 'bookingNo', label: t('booking.no'), required: true },
    { name: 'salesNo', label: t('booking.salesNo') },
    { name: 'styleCode', label: t('booking.styleCode') },
    { name: 'inspectionCompanyId', label: t('booking.company') },
    { name: 'bookingDate', label: t('booking.date'), type: 'date' as const },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];
  return <CrudPage title={t('booking.title')} api={pageApi} columns={columns} searchFields={searchFields} FormComponent={(props) => <GenericForm {...props} fields={formFields} />} />;
}
