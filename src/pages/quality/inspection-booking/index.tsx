import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as api from '@/api/inspectionBooking';

const pageApi = { list: api.listBooking, get: api.getBooking, add: api.addBooking, update: api.updateBooking, remove: api.delBooking };

export default function InspectionBookingPage() {
  const { t } = useTranslation();
  const formatDate = (value: string | null | undefined) => {
    if (!value) return '-';
    return value.includes('T') ? value.split('T')[0] : value;
  };
  const columns = [
    { key: 'bookingNo', title: t('booking.no') },
    { key: 'salesNo', title: t('booking.salesNo') },
    { key: 'styleCode', title: t('booking.styleCode') },
    { key: 'inspectionCompanyName', title: t('booking.company') },
    { key: 'bookingDate', title: t('booking.date'), render: (value: string) => formatDate(value) },
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
    {
      name: 'inspectionCompanyId',
      label: t('booking.company'),
      type: 'select' as const,
      required: true,
      loadOptions: async () => {
        const res: any = await api.listInspectionCompany({ pageNum: 1, pageSize: 200 });
        const options = (res.rows || []).map((item: any) => ({
          value: String(item.id),
          label: item.companyName || item.companyCode || String(item.id),
        }));
        if (options.length === 0) {
          toast.warning(t('booking.companyEmpty'));
        }
        return options;
      },
    },
    { name: 'bookingDate', label: t('booking.date'), type: 'date' as const, required: true },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('booking.title')}
      api={pageApi}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      extraActions={(record: any) => (
        record?.status !== 'RELEASED' ? (
          <button
            type="button"
            onClick={async (event) => {
              event.stopPropagation();
              if (!(await confirm(t('approval.confirmAction', { name: record.bookingNo || record.id, action: t('common.approve') })))) {
                return;
              }
              try {
                await api.releaseBooking(Number(record.id));
                toast.success(t('approval.approveSuccess'));
                window.location.reload();
              } catch (error: any) {
                toast.error(error.message || t('approval.actionFailed'));
              }
            }}
            className="rounded px-2 py-2 text-xs text-emerald-600 hover:bg-emerald-50"
          >
            {t('common.approve')}
          </button>
        ) : null
      )}
      isEditDisabled={(record: any) => record?.status === 'RELEASED'}
      isDeleteDisabled={(record: any) => record?.status === 'RELEASED'}
    />
  );
}
