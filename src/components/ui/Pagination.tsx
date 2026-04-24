import {ChevronLeft, ChevronRight} from 'lucide-react';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 300];

export default function Pagination({current, pageSize, total, onChange}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">共 {total} 条</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">每页</span>
          <select
            value={pageSize}
            onChange={(e) => onChange(1, Number(e.target.value))}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1, pageSize)}
          disabled={current <= 1}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-30"
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({length: Math.min(5, totalPages)}, (_, index) => {
          let page: number;
          if (totalPages <= 5) {
            page = index + 1;
          } else if (current <= 3) {
            page = index + 1;
          } else if (current >= totalPages - 2) {
            page = totalPages - 4 + index;
          } else {
            page = current - 2 + index;
          }

          return (
            <button
              key={page}
              onClick={() => onChange(page, pageSize)}
              className={`h-8 w-8 rounded-lg text-sm ${
                current === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onChange(current + 1, pageSize)}
          disabled={current >= totalPages}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-30"
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
