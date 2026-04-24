import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDictOptions } from '@/hooks/useDictOptions';

interface DefectItem {
  defectCategory: string;
  defectLevel: string;
  defectQty: string;
  handleType: string;
  responsibility: string;
  isBrokenNeedle: boolean;
  remark: string;
}

interface DefectFormProps {
  defectQty: number;
  existingDefects: DefectItem[];
  onSubmit: (items: DefectItem[]) => void;
  onClose: () => void;
}

const createEmptyItem = (qty = '0'): DefectItem => ({
  defectCategory: '',
  defectLevel: '',
  defectQty: qty,
  handleType: '',
  responsibility: 'SELF',
  isBrokenNeedle: false,
  remark: '',
});

export default function DefectForm({ defectQty, existingDefects, onSubmit, onClose }: DefectFormProps) {
  const { t } = useTranslation();

  const defectCategoryFallback = [
    { value: 'WEAVE', label: t('page.defectForm.options.categories.WEAVE') },
    { value: 'DYE', label: t('page.defectForm.options.categories.DYE') },
    { value: 'SPLICE', label: t('page.defectForm.options.categories.SPLICE') },
    { value: 'SEW', label: t('page.defectForm.options.categories.SEW') },
    { value: 'NEEDLE', label: t('page.defectForm.options.categories.NEEDLE') },
    { value: 'PACK', label: t('page.defectForm.options.categories.PACK') },
  ];
  const defectLevelFallback = [
    { value: 'CRITICAL', label: t('page.defectForm.options.levels.CRITICAL') },
    { value: 'MAJOR', label: t('page.defectForm.options.levels.MAJOR') },
    { value: 'MINOR', label: t('page.defectForm.options.levels.MINOR') },
  ];
  const handleTypeFallback = [
    { value: 'REPAIR', label: t('page.defectForm.options.handleTypes.REPAIR') },
    { value: 'DOWNGRADE', label: t('page.defectForm.options.handleTypes.DOWNGRADE') },
    { value: 'SCRAP', label: t('page.defectForm.options.handleTypes.SCRAP') },
  ];
  const responsibilityFallback = [
    { value: 'SELF', label: t('page.defectForm.options.responsibilities.SELF') },
    { value: 'OUTSOURCE', label: t('page.defectForm.options.responsibilities.OUTSOURCE') },
    { value: 'MATERIAL', label: t('page.defectForm.options.responsibilities.MATERIAL') },
  ];

  const defectCategories = useDictOptions('erp_defect_category', defectCategoryFallback);
  const defectLevels = useDictOptions('erp_defect_level', defectLevelFallback);
  const handleTypes = useDictOptions('erp_defect_handle_type', handleTypeFallback);
  const responsibilities = useDictOptions('erp_defect_responsibility', responsibilityFallback);

  const [items, setItems] = useState<DefectItem[]>(
    existingDefects.length > 0 ? existingDefects : [createEmptyItem(String(defectQty))],
  );

  const summary = useMemo(() => {
    const total = items.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);
    const incomplete = items.some((item) => (
      !item.defectCategory ||
      !item.defectLevel ||
      !item.handleType ||
      !item.responsibility ||
      (Number(item.defectQty) || 0) <= 0
    ));

    return {
      total,
      incomplete,
      matched: total === defectQty,
    };
  }, [defectQty, items]);

  const updateItem = (index: number, field: keyof DefectItem, value: string | boolean) => {
    setItems((prev) => prev.map((item, current) => (
      current === index ? { ...item, [field]: value } : item
    )));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return [createEmptyItem(String(defectQty))];
      }
      return prev.filter((_, current) => current !== index);
    });
  };

  const handleSubmit = () => {
    if (summary.incomplete || !summary.matched) {
      return;
    }
    onSubmit(items);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">{t('page.defectForm.title')}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100"
            aria-label={t('page.defectForm.closeAriaLabel')}
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            {t('page.defectForm.summaryPrefix')}{' '}
            <span className="font-medium text-red-600">{defectQty}</span>
            {' '}
            {t('page.defectForm.allocatedPrefix')}{' '}
            <span className={`font-medium ${summary.matched ? 'text-emerald-600' : 'text-amber-600'}`}>
              {summary.total}
            </span>
            {!summary.matched && (
              <span className="ml-2 text-red-500">{t('page.defectForm.summaryMismatch')}</span>
            )}
          </div>

          {items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {t('page.defectForm.itemTitle', { index: index + 1 })}
                </span>
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                  aria-label={t('page.defectForm.removeAriaLabel', { index: index + 1 })}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    {t('page.defectForm.fields.category')} *
                  </label>
                  <select
                    aria-label={t('page.defectForm.fields.category')}
                    value={item.defectCategory}
                    onChange={(event) => updateItem(index, 'defectCategory', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">{t('page.defectForm.placeholders.category')}</option>
                    {defectCategories.options.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    {t('page.defectForm.fields.level')} *
                  </label>
                  <select
                    aria-label={t('page.defectForm.fields.level')}
                    value={item.defectLevel}
                    onChange={(event) => updateItem(index, 'defectLevel', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">{t('page.defectForm.placeholders.level')}</option>
                    {defectLevels.options.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    {t('page.defectForm.fields.qty')} *
                  </label>
                  <input
                    aria-label={t('page.defectForm.fields.qty')}
                    type="number"
                    min="0"
                    value={item.defectQty}
                    onChange={(event) => updateItem(index, 'defectQty', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    {t('page.defectForm.fields.handleType')} *
                  </label>
                  <select
                    aria-label={t('page.defectForm.fields.handleType')}
                    value={item.handleType}
                    onChange={(event) => updateItem(index, 'handleType', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">{t('page.defectForm.placeholders.handleType')}</option>
                    {handleTypes.options.map((handleType) => (
                      <option key={handleType.value} value={handleType.value}>{handleType.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    {t('page.defectForm.fields.responsibility')} *
                  </label>
                  <select
                    aria-label={t('page.defectForm.fields.responsibility')}
                    value={item.responsibility}
                    onChange={(event) => updateItem(index, 'responsibility', event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    {responsibilities.options.map((responsibility) => (
                      <option key={responsibility.value} value={responsibility.value}>{responsibility.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    id={`broken-needle-${index}`}
                    type="checkbox"
                    checked={item.isBrokenNeedle}
                    onChange={(event) => updateItem(index, 'isBrokenNeedle', event.target.checked)}
                    className="h-4 w-4 rounded text-red-600"
                  />
                  <label htmlFor={`broken-needle-${index}`} className="text-sm font-medium text-red-600">
                    {t('page.defectForm.brokenNeedle')}
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-500">{t('page.defectForm.fields.remark')}</label>
                <input
                  aria-label={t('page.defectForm.fields.remark')}
                  value={item.remark}
                  onChange={(event) => updateItem(index, 'remark', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  placeholder={t('page.defectForm.placeholders.remark')}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-100"
          >
            <Plus size={14} />
            {t('page.defectForm.addItem')}
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={summary.incomplete || !summary.matched}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('page.defectForm.confirm', { total: summary.total, expected: defectQty })}
          </button>
        </div>
      </div>
    </div>
  );
}
