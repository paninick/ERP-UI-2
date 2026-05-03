import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as api from '@/api/shipment';

const pageApi = { list: api.listShipment, get: api.getShipment, add: api.addShipment, update: api.updateShipment, remove: api.delShipment };

export default function ShipmentPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const shipmentStatusMap = useMemo(
    () => ({
      '0': t('shipment.statusDraft', '草稿'),
      DRAFT: t('shipment.statusDraft', '草稿'),
      '1': t('shipment.statusConfirmed', '已确认'),
      CONFIRMED: t('shipment.statusConfirmed', '已确认'),
      '2': t('shipment.statusShipped', '已出货'),
      SHIPPED: t('shipment.statusShipped', '已出货'),
      '3': t('shipment.statusCancelled', '已取消'),
      CANCELLED: t('shipment.statusCancelled', '已取消'),
    }),
    [t],
  );
  const columns = [
    { key: 'shipmentNo', title: t('shipment.no') },
    { key: 'salesNo', title: t('shipment.salesNo') },
    { key: 'styleCode', title: t('shipment.styleCode') },
    { key: 'customerName', title: t('shipment.customer') },
    { key: 'totalQty', title: t('shipment.qty') },
    { key: 'totalCarton', title: t('shipment.carton') },
    {
      key: 'releaseStatus',
      title: t('shipment.release'),
      render: (value: any) => {
        const v = String(value ?? '0');
        if (v === '1' || v === 'RELEASED') return <span className="text-emerald-600 font-medium">{t('shipment.released', '已放行')}</span>;
        if (v === 'PENDING') return <span className="text-amber-600">{t('shipment.pending', '待放行')}</span>;
        return <span className="text-gray-500">{t('shipment.notReleased', '未放行')}</span>;
      },
    },
    {
      key: 'status',
      title: t('shipment.status'),
      render: (value: any) => {
        const v = String(value ?? '');
        return shipmentStatusMap[v as keyof typeof shipmentStatusMap] || v || '-';
      },
    },
    { key: 'shipmentDate', title: t('shipment.date') },
  ];
  const searchFields = [
    { name: 'shipmentNo', label: t('shipment.no') },
    { name: 'salesNo', label: t('shipment.salesNo') },
    { name: 'customerName', label: t('shipment.customer') },
  ];
  const initialSearchParams = useMemo(
    () => ({
      shipmentNo: searchParams.get('shipmentNo') || '',
      salesNo: searchParams.get('salesNo') || '',
      customerName: searchParams.get('customerName') || '',
    }),
    [searchParams],
  );
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

  const extraActions = (record: any) => {
    const released = String(record?.releaseStatus ?? '0') === '1';
    return (
      <button
        onClick={async (event) => {
          event.stopPropagation();
          const confirmed = await confirm(
            released
              ? t('shipment.cancelReleaseConfirm', '确认撤回该出货单放行状态吗？')
              : t('shipment.releaseConfirm', '确认执行该出货单放行吗？')
          );
          if (!confirmed) {
            return;
          }
          try {
            if (released) {
              await api.cancelReleaseShipment(Number(record.id));
              toast.success(t('shipment.cancelReleaseSuccess', '撤回放行成功'));
            } else {
              await api.releaseShipment(Number(record.id));
              toast.success(t('shipment.releaseSuccess', '放行成功'));
            }
            window.location.reload();
          } catch (error: any) {
            toast.error(error?.message || t('common.operationFailed', '操作失败'));
          }
        }}
        className="rounded px-2 py-2 text-xs text-emerald-600 hover:bg-emerald-50"
      >
        {released ? t('shipment.cancelRelease', '撤回放行') : t('shipment.releaseAction', '放行')}
      </button>
    );
  };

  return <CrudPage title={t('shipment.title')} api={pageApi} columns={columns} searchFields={searchFields} FormComponent={(props) => <GenericForm {...props} fields={formFields} />} extraActions={extraActions} initialSearchParams={initialSearchParams} />;
}
