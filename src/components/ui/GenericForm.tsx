import { useEffect, useState } from 'react';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  getOptions?: () => { value: string; label: string }[];
  loadOptions?: () => Promise<{ value: string; label: string }[]>;
  required?: boolean;
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

  useEffect(() => {
    fields.forEach((field) => {
      if (field.loadOptions) {
        field.loadOptions().then((opts) => {
          setAsyncOptions((prev) => ({ ...prev, [field.name]: opts }));
        }).catch(() => {});
      }
    });
  }, [fields]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    for (const field of fields) {
      if (field.required && !form[field.name]?.trim()) {
        alert(`${field.label} 不能为空`);
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
                onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                aria-label={field.label}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">请选择</option>
                {selectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={form[field.name] || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                aria-label={field.label}
                className="h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={form[field.name] || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
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
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '提交中...' : '确定'}
        </button>
      </div>
    </form>
  );
}
