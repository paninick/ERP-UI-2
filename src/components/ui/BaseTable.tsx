import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
        <tr key={ri} className="animate-pulse border-b border-slate-100">
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
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm" data-testid={testId}>
      <table className="w-full text-sm" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {hasSelection && (
              <th className="w-10 px-4 py-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleSelectAll}
                  title={allChecked ? t('common.deselectAll') : t('common.selectAll')}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left font-medium text-slate-600"
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
                <p className="text-slate-400">{t('common.noData')}</p>
                {emptyAction && <div className="mt-3">{emptyAction}</div>}
              </td>
            </tr>
          ) : (
            data.map((record, index) => {
              const key = String(record[rowKey] ?? index);
              return (
                <tr
                  key={key}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                  onClick={() => onRowClick?.(record)}
                  onKeyDown={(e) => onRowClick && handleRowKeyDown(e, record)}
                >
                  {hasSelection && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(key)}
                        onChange={() => handleSelectRow(key)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-slate-700">
                      {column.render
                        ? column.render(record[column.key], record, index)
                        : (record[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
