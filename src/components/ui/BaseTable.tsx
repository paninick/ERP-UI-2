import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: string;
  onRowClick?: (record: T) => void;
  ariaLabel?: string;
  emptyAction?: ReactNode;
}

export default function BaseTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  rowKey = 'id',
  onRowClick,
  ariaLabel,
  emptyAction,
}: BaseTableProps<T>) {
  const {t} = useTranslation();

  const handleRowKeyDown = (e: React.KeyboardEvent, record: T) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(record);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left font-medium text-slate-600"
                style={column.width ? {width: column.width} : undefined}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                {t('common.loading')}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <p className="text-slate-400">{t('common.noData')}</p>
                {emptyAction && <div className="mt-3">{emptyAction}</div>}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={record[rowKey] ?? index}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                onClick={() => onRowClick?.(record)}
                onKeyDown={(e) => onRowClick && handleRowKeyDown(e, record)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {column.render ? column.render(record[column.key], record, index) : (record[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
