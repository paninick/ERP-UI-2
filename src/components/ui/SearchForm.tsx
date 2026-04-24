import { FormEvent, ReactNode } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
  onSearch: () => void;
  onReset: () => void;
  children: ReactNode;
}

export default function SearchForm({ onSearch, onReset, children }: SearchFormProps) {
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {children}
        <div className="ml-auto flex gap-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <Search size={14} />
            {t('common.search')}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw size={14} />
            {t('common.reset')}
          </button>
        </div>
      </div>
    </form>
  );
}

interface SearchFieldProps {
  label: string;
  children: ReactNode;
}

export function SearchField({ label, children }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="whitespace-nowrap text-sm text-slate-600">{label}</label>
      {children}
    </div>
  );
}
