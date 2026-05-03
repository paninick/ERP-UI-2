import { useEffect, useState } from 'react';
import { listTrackingByShipment, addShipmentTracking } from '@/api/shipmentTracking';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';

interface Props {
  shipmentId: number;
}

const EVENT_TYPE_MAP: Record<string, string> = {
  LOADED: '已装船',
  DEPARTED: '已离港',
  ARRIVED: '已到港',
  CUSTOMS_CLEARED: '已清关',
  DELIVERED: '已签收',
};

export default function TrackingTab({ shipmentId }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);

  const load = () => {
    listTrackingByShipment(shipmentId).then((res: any) => {
      if (res?.data) setItems(Array.isArray(res.data) ? res.data : []);
    });
  };

  useEffect(() => { load(); }, [shipmentId]);

  const handleAdd = async (eventType: string) => {
    try {
      await addShipmentTracking({ shipmentId, eventType });
      toast.success(t('common.saveSuccess', '保存成功'));
      load();
    } catch (err: any) {
      toast.error(err?.message || t('common.operationFailed', '操作失败'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {Object.entries(EVENT_TYPE_MAP).map(([k, v]) => (
          <button key={k} onClick={() => handleAdd(k)} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100">
            {v}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400">{t('common.noData', '暂无数据')}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 rounded border bg-white p-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
                {EVENT_TYPE_MAP[item.eventType] || item.eventType}
              </span>
              <span className="text-gray-500">{item.eventTime ? new Date(item.eventTime).toLocaleString() : '-'}</span>
              {item.location && <span className="text-gray-400">{item.location}</span>}
              {item.operator && <span className="text-gray-400">{item.operator}</span>}
              {item.remark && <span className="text-gray-400">{item.remark}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
