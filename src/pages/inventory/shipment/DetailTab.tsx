import { useEffect, useState } from 'react';
import { listDetailByShipment, addShipmentDetail, updateShipmentDetail, delShipmentDetail } from '@/api/shipmentDetail';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';

interface Props {
  shipmentId: number;
}

export default function DetailTab({ shipmentId }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    listDetailByShipment(shipmentId).then((res: any) => {
      if (res?.data) setItems(Array.isArray(res.data) ? res.data : []);
    });
  };

  useEffect(() => { load(); }, [shipmentId]);

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await updateShipmentDetail(editing);
      } else {
        await addShipmentDetail({ ...editing, shipmentId });
      }
      toast.success(t('common.saveSuccess', '保存成功'));
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || t('common.operationFailed', '操作失败'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await delShipmentDetail(String(id));
      toast.success(t('common.deleteSuccess', '删除成功'));
      load();
    } catch (err: any) {
      toast.error(err?.message || t('common.operationFailed', '操作失败'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => { setEditing({}); setShowForm(true); }} className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">
          {t('common.add', '新增')}
        </button>
      </div>

      {showForm && editing && (
        <div className="rounded border bg-gray-50 p-3">
          <div className="mb-2 grid grid-cols-4 gap-2">
            <input placeholder={t('shipment.styleCode', '款号')} value={editing.styleCode || ''} onChange={(e) => setEditing({ ...editing, styleCode: e.target.value })} className="rounded border px-2 py-1 text-xs" />
            <input placeholder={t('shipment.qty', '数量')} type="number" value={editing.quantity ?? ''} onChange={(e) => setEditing({ ...editing, quantity: Number(e.target.value) })} className="rounded border px-2 py-1 text-xs" />
            <input placeholder={t('shipment.unitPrice', '单价')} type="number" value={editing.unitPrice ?? ''} onChange={(e) => setEditing({ ...editing, unitPrice: Number(e.target.value) })} className="rounded border px-2 py-1 text-xs" />
            <input placeholder={t('shipment.carton', '箱数')} type="number" value={editing.cartonCount ?? ''} onChange={(e) => setEditing({ ...editing, cartonCount: Number(e.target.value) })} className="rounded border px-2 py-1 text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="rounded bg-emerald-600 px-3 py-1 text-xs text-white">{t('common.save', '保存')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded bg-gray-300 px-3 py-1 text-xs">{t('common.cancel', '取消')}</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400">{t('common.noData', '暂无数据')}</div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-2 py-1">{t('shipment.styleCode', '款号')}</th>
              <th className="px-2 py-1">{t('shipment.qty', '数量')}</th>
              <th className="px-2 py-1">{t('shipment.unitPrice', '单价')}</th>
              <th className="px-2 py-1">{t('shipment.subtotal', '小计')}</th>
              <th className="px-2 py-1">{t('shipment.carton', '箱数')}</th>
              <th className="px-2 py-1">{t('common.action', '操作')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-1">{item.styleCode}</td>
                <td className="px-2 py-1">{item.quantity}</td>
                <td className="px-2 py-1">{item.unitPrice != null ? `¥${Number(item.unitPrice).toFixed(2)}` : '-'}</td>
                <td className="px-2 py-1">{item.subtotal != null ? `¥${Number(item.subtotal).toFixed(2)}` : '-'}</td>
                <td className="px-2 py-1">{item.cartonCount}</td>
                <td className="px-2 py-1">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">{t('common.delete', '删除')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
