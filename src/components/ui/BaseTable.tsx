import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string;
}

interface RowSelection<T> {
  selectedRowKeys: string[];
  onChange: (keys: string[]) => void;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: string;
  rowSelection?: RowSelection<T>;
  onRowClick?: (record: T) => void;
  ariaLabel?: string;
  emptyAction?: ReactNode;
  testId?: string;
}

const skeletonWidths = [80, 65, 90, 55, 75, 60, 85, 50, 70, 55];

function getSkeletonWidth(rowIdx: number, colIdx: number): string {
  return `${skeletonWidths[(rowIdx * 3 + colIdx * 7) % skeletonWidths.length]}%`;
}

export default function BaseTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  rowKey = 'id',
  rowSelection,
  onRowClick,
  ariaLabel,
  emptyAction,
  testId,
}: BaseTableProps<T>) {
  const { t } = useTranslation();
  const uiTheme = useAppStore((state) => state.uiTheme);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allKeys = data.map((r) => String(r[rowKey] ?? ''));
  const selectedKeys = rowSelection?.selectedRowKeys ?? [];
  const hasSelection = rowSelection != null;
  const allChecked = selectedKeys.length > 0 && selectedKeys.length === allKeys.length && allKeys.length > 0;
  const someChecked = selectedKeys.length > 0 && selectedKeys.length < allKeys.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  const handleSelectAll = () => {
    if (!rowSelection) return;
    if (allChecked) {
      rowSelection.onChange([]);
    } else {
      rowSelection.onChange(allKeys);
    }
  };

  const handleSelectRow = (key: string) => {
    if (!rowSelection) return;
    if (selectedKeys.includes(key)) {
      rowSelection.onChange(selectedKeys.filter((k) => k !== key));
    } else {
      rowSelection.onChange([...selectedKeys, key]);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, record: T) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(record);
    }
  };

  const colSpan = hasSelection ? columns.length + 1 : columns.length;

  const Skeleton = () => (
    <>
      {Array.from({ length: 8 }).map((_, ri) => (
        <tr key={ri} className="animate-pulse border-b border-slate-200/70">
          {hasSelection && (
            <td className="px-4 py-3">
              <div className="h-4 w-4 rounded bg-slate-200" />
            </td>
          )}
          {columns.map((col, ci) => (
            <td key={col.key} className="px-4 py-3">
              <div
                className="h-4 rounded bg-slate-200"
                style={{ width: getSkeletonWidth(ri, ci) }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div
      className={`overflow-hidden rounded-[26px] ${
        uiTheme === 'google'
          ? 'border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
          : uiTheme === 'night'
            ? 'border border-white/8 bg-slate-950/78 shadow-[0_28px_90px_rgba(2,8,18,0.32)] backdrop-blur-2xl'
          : 'jtech-panel border border-amber-200/18 bg-white/86 shadow-[0_28px_90px_rgba(120,80,20,0.08)]'
      }`}
      data-testid={testId}
    >
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-700'}`} aria-label={ariaLabel}>
          <thead>
            <tr className={`border-b ${
              uiTheme === 'google' ? 'border-slate-200 bg-slate-50' : uiTheme === 'night' ? 'border-white/8 bg-white/5' : 'border-amber-200/20 bg-amber-50/40'
            }`}>
              {hasSelection && (
                <th className="w-10 px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allChecked}
                    onChange={handleSelectAll}
                    title={allChecked ? t('common.deselectAll') : t('common.selectAll')}
                    className={`h-4 w-4 rounded ${
                      uiTheme === 'google' ? 'border-slate-300 text-blue-500' : uiTheme === 'night' ? 'border-white/18 bg-slate-950/70 text-amber-400' : 'border-amber-200 text-amber-500'
                    }`}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.2em] ${
                    uiTheme === 'google' ? 'text-slate-500' : uiTheme === 'night' ? 'text-slate-400/70' : 'text-amber-700/60'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <Skeleton />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center">
                  <p className={uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}>{t('common.noData')}</p>
                  {emptyAction && <div className="mt-3">{emptyAction}</div>}
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const key = String(record[rowKey] ?? index);
                return (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.028, 0.32), duration: 0.2, ease: 'easeOut' }}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={`cursor-pointer border-b transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 ${
                      uiTheme === 'google'
                        ? 'border-slate-100 hover:bg-slate-50'
                        : uiTheme === 'night'
                          ? 'border-white/6 hover:bg-white/6'
                          : 'border-amber-100/40 hover:bg-amber-50/60'
                    }`}
                    onClick={() => onRowClick?.(record)}
                    onKeyDown={(e) => onRowClick && handleRowKeyDown(e, record)}
                  >
                    {hasSelection && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(key)}
                          onChange={() => handleSelectRow(key)}
                          className={`h-4 w-4 rounded ${
                            uiTheme === 'google' ? 'border-slate-300 text-blue-500' : uiTheme === 'night' ? 'border-white/18 bg-slate-950/70 text-amber-400' : 'border-amber-200 text-amber-500'
                          }`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-3 align-top ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-700'}`}>
                        {column.render
                          ? column.render(record[column.key], record, index)
                          : (record[column.key] ?? '-')}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
