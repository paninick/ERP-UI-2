import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  getOptions?: () => { value: string; label: string }[];
  loadOptions?: () => Promise<{ value: string; label: string }[]>;
  required?: boolean;
  /** 字段值变化时的回调。setForm 可传入清空子级。 */
  onFieldChange?: (name: string, value: string, setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => void;
}

interface GenericFormProps {
  fields: FieldConfig[];
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

function normalizeValue(fieldType: FieldConfig['type'], value: string) {
  if (value === '') return undefined;
  if (fieldType === 'number') return Number(value);
  if (fieldType === 'select') return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
  return value;
}

export default function GenericForm({ fields, initialValues, onSubmit, onCancel }: GenericFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  useEffect(() => {
    const nextForm: Record<string, string> = {};
    fields.forEach((field) => {
      nextForm[field.name] = initialValues ? String(initialValues[field.name] ?? '') : '';
    });
    setForm(nextForm);
  }, [initialValues, fields]);

  // Sync cascade state from initialValues for edit backfill
  const cascadeInitRef = useRef<any>(null);
  useEffect(() => {
    if (!initialValues || cascadeInitRef.current === initialValues) return;
    cascadeInitRef.current = initialValues;
    fields.forEach((field) => {
      if (field.onFieldChange) {
        const val = initialValues[field.name];
        if (val != null && val !== '') {
          field.onFieldChange(field.name, String(val), setForm);
        }
      }
    });
  }, [initialValues, fields]);

  useEffect(() => {
    fields.forEach((field) => {
      if (field.loadOptions) {
        field.loadOptions()
          .then((opts) => {
            setAsyncOptions((prev) => ({ ...prev, [field.name]: opts }));
          })
          .catch(() => {});
      }
    });
  }, [fields]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    for (const field of fields) {
      if (field.required && !form[field.name]?.trim()) {
        alert(t('common.requiredField', { field: field.label }));
        return;
      }
    }
    setLoading(true);
    try {
      const values: Record<string, any> = {};
      fields.forEach((field) => {
        values[field.name] = normalizeValue(field.type, form[field.name] || '');
      });
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const selectOptions = field.loadOptions
          ? (asyncOptions[field.name] || [])
          : (field.getOptions ? field.getOptions() : field.options) || [];

        return (
          <div key={field.name} className="flex items-center gap-3">
            <label className="w-24 text-right text-sm text-slate-600">
              {field.required && <span className="mr-1 text-red-500">*</span>}
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={form[field.name] || ''}
                onChange={(event) => {
                  const val = event.target.value;
                  if (field.onFieldChange) {
                    field.onFieldChange(field.name, val, setForm);
                  } else {
                    setForm((prev) => ({ ...prev, [field.name]: val }));
                  }
                }}
                aria-label={field.label}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">{t('common.pleaseSelect')}</option>
                {selectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={form[field.name] || ''}
                onChange={(event) => {
                  const val = event.target.value;
                  if (field.onFieldChange) {
                    field.onFieldChange(field.name, val, setForm);
                  } else {
                    setForm((prev) => ({ ...prev, [field.name]: val }));
                  }
                }}
                aria-label={field.label}
                className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={form[field.name] || ''}
                onChange={(event) => {
                  const val = event.target.value;
                  if (field.onFieldChange) {
                    field.onFieldChange(field.name, val, setForm);
                  } else {
                    setForm((prev) => ({ ...prev, [field.name]: val }));
                  }
                }}
                aria-label={field.label}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            )}
          </div>
        );
      })}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </button>
      </div>
    </form>
  );
}
