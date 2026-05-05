import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 300];

export default function Pagination({ current, pageSize, total, onChange }: PaginationProps) {
  const uiTheme = useAppStore((state) => state.uiTheme);
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) return null;

  const base = `flex items-center justify-between rounded-b-xl px-4 py-3 ${
    uiTheme === 'night'
      ? 'border-t border-white/8 bg-slate-900/50'
      : uiTheme === 'google'
        ? 'border-t border-slate-100 bg-white'
      : 'border-t border-amber-100/50 bg-white/80'
  }`;

  const pageBtn = (page: number) => {
    const active = current === page;
    return (
      <motion.button
        key={page}
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(page, pageSize)}
        className={`h-8 w-8 rounded-lg text-sm transition ${
          active
            ? uiTheme === 'google'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.28)]'
            : uiTheme === 'night'
              ? 'text-slate-300 hover:bg-white/8'
              : 'text-slate-600 hover:bg-amber-50'
        }`}
      >
        {page}
      </motion.button>
    );
  };

  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (current <= 3) {
    for (let i = 1; i <= 5; i++) pages.push(i);
  } else if (current >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = current - 2; i <= current + 2; i++) pages.push(i);
  }

  return (
    <div className={base}>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>共 {total} 条</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>每页</span>
          <select
            value={pageSize}
            onChange={(e) => onChange(1, Number(e.target.value))}
            className={`rounded-lg border px-2 py-1 text-sm outline-none transition ${
              uiTheme === 'night'
                ? 'border-white/10 bg-slate-900 text-slate-100 focus:border-amber-400/50'
                : uiTheme === 'google'
                  ? 'border-slate-200 bg-white focus:border-blue-400'
                : 'border-amber-200/22 bg-white focus:border-amber-400/50'
            }`}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(current - 1, pageSize)}
          disabled={current <= 1}
          className={`rounded-lg p-1.5 transition disabled:opacity-30 ${
            uiTheme === 'night' ? 'hover:bg-white/8 text-slate-300' : 'hover:bg-amber-50 text-slate-600'
          }`}
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </motion.button>
        {pages.map(pageBtn)}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(current + 1, pageSize)}
          disabled={current >= totalPages}
          className={`rounded-lg p-1.5 transition disabled:opacity-30 ${
            uiTheme === 'night' ? 'hover:bg-white/8 text-slate-300' : 'hover:bg-amber-50 text-slate-600'
          }`}
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
