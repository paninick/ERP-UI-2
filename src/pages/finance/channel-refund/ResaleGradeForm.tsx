import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseModal from '@/components/ui/BaseModal';
import * as api from '@/api/channelRefund';

interface Props {
  refundOrderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const gradeOptions = [
  { value: 'A', label: 'A - 良品（再销售）', color: 'text-green-600' },
  { value: 'B', label: 'B - 次品（折价销售）', color: 'text-yellow-600' },
  { value: 'C', label: 'C - 返修品', color: 'text-orange-600' },
  { value: 'D', label: 'D - 报废品', color: 'text-red-600' },
];

export default function ResaleGradeForm({ refundOrderId, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [gradeCode, setGradeCode] = useState('A');
  const [gradeQty, setGradeQty] = useState(1);
  const [gradeRemark, setGradeRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!gradeCode) { setError('请选择等级'); return; }
    if (gradeQty < 1) { setError('数量必须大于0'); return; }

    setLoading(true);
    setError('');
    try {
      await api.addResaleGrade({
        refundOrderId,
        gradeCode,
        gradeQty,
        gradeRemark,
      });
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.msg || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={true}
      onClose={onClose}
      title={t('page.resaleGrade.title', { defaultValue: '退货再分级' })}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('page.resaleGrade.gradeCode', { defaultValue: '等级' })}
          </label>
          <select
            value={gradeCode}
            onChange={(e) => setGradeCode(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {gradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className={opt.color}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('page.resaleGrade.qty', { defaultValue: '数量' })}
          </label>
          <input
            type="number"
            min={1}
            value={gradeQty}
            onChange={(e) => setGradeQty(parseInt(e.target.value) || 1)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('page.resaleGrade.remark', { defaultValue: '判级说明' })}
          </label>
          <textarea
            value={gradeRemark}
            onChange={(e) => setGradeRemark(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel', { defaultValue: '取消' })}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? t('common.submitting', { defaultValue: '提交中...' })
              : t('common.submit', { defaultValue: '提交' })}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
