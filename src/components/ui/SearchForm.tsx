import { FormEvent, ReactNode } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';

interface SearchFormProps {
  onSearch: () => void;
  onReset: () => void;
  children: ReactNode;
}

export default function SearchForm({ onSearch, onReset, children }: SearchFormProps) {
  const { t } = useTranslation();
  const uiTheme = useAppStore((state) => state.uiTheme);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mb-4 overflow-hidden rounded-[24px] p-4 ${
        uiTheme === 'google'
          ? 'border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
          : uiTheme === 'night'
            ? 'border border-white/8 bg-slate-950/72 text-slate-100 shadow-[0_24px_80px_rgba(2,8,18,0.32)] backdrop-blur-2xl'
          : 'jtech-panel border border-amber-200/18 bg-white/82 shadow-[0_24px_80px_rgba(120,80,20,0.08)]'
      }`}
    >
      <div className={`mb-4 flex items-center justify-between gap-3 pb-3 ${
        uiTheme === 'google' ? 'border-b border-slate-200' : uiTheme === 'night' ? 'border-b border-white/8' : 'border-b border-amber-200/18'
      }`}>
        <div>
          <p className={`text-[11px] uppercase tracking-[0.32em] ${
            uiTheme === 'google' ? 'text-slate-500' : uiTheme === 'night' ? 'text-slate-400/70' : 'text-amber-700/48'
          }`}>Query Console</p>
          <h3 className={`text-sm font-medium ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>筛选当前业务视图</h3>
        </div>
        <span className={`hidden rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] sm:inline-flex ${
          uiTheme === 'google'
            ? 'border border-slate-200 bg-slate-50 text-slate-500'
            : uiTheme === 'night'
              ? 'border border-white/10 bg-white/5 text-slate-400'
            : 'jtech-pill text-amber-700/70'
        }`}>
          Live Filter
        </span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {children}
        <div className="ml-auto flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
              uiTheme === 'google'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : uiTheme === 'night'
                  ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_6px_20px_rgba(245,158,11,0.22)]'
                : 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_6px_20px_rgba(245,158,11,0.22)]'
            }`}
          >
            <Search size={14} />
            {t('common.search')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onReset}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm text-slate-600 transition duration-200 hover:-translate-y-0.5 ${
              uiTheme === 'google'
                ? 'border-slate-200 bg-white hover:bg-slate-50'
                : uiTheme === 'night'
                  ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'
                : 'border-amber-200/22 bg-white hover:bg-amber-50'
            }`}
          >
            <RotateCcw size={14} />
            {t('common.reset')}
          </motion.button>
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
  const uiTheme = useAppStore((state) => state.uiTheme);
  return (
    <div className={`min-w-[220px] flex-1 rounded-2xl border px-3 py-3 transition duration-200 ${
      uiTheme === 'google'
        ? 'border-slate-200 bg-white hover:border-slate-300'
        : uiTheme === 'night'
          ? 'border-white/8 bg-white/5 hover:border-white/14 hover:bg-white/8'
        : 'border-amber-200/18 bg-slate-50/90 hover:border-amber-300/30 hover:bg-white'
    }`}>
      <label className={`mb-2 block whitespace-nowrap text-[11px] uppercase tracking-[0.22em] ${
        uiTheme === 'google' ? 'text-slate-500' : uiTheme === 'night' ? 'text-slate-400/70' : 'text-amber-700/50'
      }`}>
        {label}
      </label>
      <div className={`text-sm ${
        uiTheme === 'night'
          ? 'text-slate-100 [&_input]:h-10 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-slate-950/70 [&_input]:px-3 [&_input]:text-slate-100 [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-slate-500 [&_input]:focus:border-amber-400/50 [&_input]:focus:bg-slate-950 [&_select]:h-10 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/10 [&_select]:bg-slate-950/70 [&_select]:px-3 [&_select]:text-slate-100 [&_select]:outline-none [&_select]:transition [&_select]:focus:border-amber-400/50 [&_select]:focus:bg-slate-950'
          : 'text-slate-700 [&_input]:h-10 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-amber-200/20 [&_input]:bg-white [&_input]:px-3 [&_input]:text-slate-700 [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-amber-400/50 [&_input]:focus:bg-white [&_select]:h-10 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-amber-200/20 [&_select]:bg-white [&_select]:px-3 [&_select]:text-slate-700 [&_select]:outline-none [&_select]:transition [&_select]:focus:border-amber-400/50 [&_select]:focus:bg-white'
      }`}>
        {children}
      </div>
    </div>
  );
}
