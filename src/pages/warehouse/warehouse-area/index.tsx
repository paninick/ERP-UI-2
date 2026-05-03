import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as api from '@/api/warehouseArea';

export default function WarehouseArea() {
  const { t } = useTranslation();
  const pageApi = {
    list: api.listWarehouseArea,
    get: api.getWarehouseArea,
    add: api.addWarehouseArea,
    update: api.updateWarehouseArea,
    remove: (ids: string) => api.delWarehouseArea(Number(ids)),
  };
  const columns = [
    { key: 'areaName', title: t('warehouseArea.areaName') },
    { key: 'warehouseName', title: t('warehouseArea.warehouseName') },
    { key: 'areaType', title: t('warehouseArea.areaType') },
    { key: 'capacity', title: t('warehouseArea.capacity') },
  ];
  return <CrudPage title={t('warehouseArea.title')} api={pageApi} columns={columns} />;
}
