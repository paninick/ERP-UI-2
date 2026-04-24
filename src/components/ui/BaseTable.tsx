import {ReactNode} from 'react';

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
}

export default function BaseTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  rowKey = 'id',
  onRowClick,
}: BaseTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm">
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
                加载中...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                暂无数据
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={record[rowKey] ?? index}
                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                onClick={() => onRowClick?.(record)}
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
