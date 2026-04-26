import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as api from '@/api/shipment';

const pageApi = { list: api.listShipment, get: api.getShipment, add: api.addShipment, update: api.updateShipment, remove: api.delShipment };

export default function ShipmentPage() {
  const { t } = useTranslation();
  const columns = [
    { key: 'shipmentNo', title: t('shipment.no') },
    { key: 'salesNo', title: t('shipment.salesNo') },
    { key: 'styleCode', title: t('shipment.styleCode') },
    { key: 'customerName', title: t('shipment.customer') },
    { key: 'totalQty', title: t('shipment.qty') },
    { key: 'totalCarton', title: t('shipment.carton') },
    { key: 'releaseStatus', title: t('shipment.release') },
    { key: 'status', title: t('shipment.status') },
    { key: 'shipmentDate', title: t('shipment.date') },
  ];
  const searchFields = [
    { name: 'shipmentNo', label: t('shipment.no') },
    { name: 'salesNo', label: t('shipment.salesNo') },
  ];
  const formFields = [
    { name: 'shipmentNo', label: t('shipment.no'), required: true },
    { name: 'salesNo', label: t('shipment.salesNo') },
    { name: 'styleCode', label: t('shipment.styleCode') },
    { name: 'customerName', label: t('shipment.customer') },
    { name: 'totalQty', label: t('shipment.qty') },
    { name: 'totalCarton', label: t('shipment.carton') },
    { name: 'vesselName', label: t('shipment.vessel') },
    { name: 'containerNo', label: t('shipment.container') },
    { name: 'blNo', label: t('shipment.bl') },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];
  return <CrudPage title={t('shipment.title')} api={pageApi} columns={columns} searchFields={searchFields} FormComponent={(props) => <GenericForm {...props} fields={formFields} />} />;
}
