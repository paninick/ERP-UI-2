import { ReactNode, useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCrud } from '@/hooks/useCrud';
import { confirm } from './ConfirmDialog';
import BaseModal from './BaseModal';
import BaseTable from './BaseTable';
import Pagination from './Pagination';
import SearchForm, { SearchField } from './SearchForm';
import { exportToCsv } from '@/utils/exportToCsv';

interface Column {
  key: string;
  title: string;
  render?: (value: any, record: any, index: number) => ReactNode;
  width?: string;
}

interface SearchFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface CrudPageProps {
  title: string;
  api: {
    list: (params: any) => Promise<any>;
    get: (id: number) => Promise<any>;
    add: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    remove: (ids: string) => Promise<any>;
  };
  columns: Column[];
  searchFields?: SearchFieldConfig[];
  FormComponent?: React.ComponentType<{
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
  }>;
  rowKey?: string;
  extraActions?: (record: any) => ReactNode;
  isEditDisabled?: (record: any) => boolean;
  isDeleteDisabled?: (record: any) => boolean;
  batchActions?: (selectedRowKeys: string[]) => ReactNode;
}

export default function CrudPage({
  title,
  api,
  columns,
  searchFields = [],
  FormComponent,
  rowKey = 'id',
  extraActions,
  isEditDisabled,
  isDeleteDisabled,
  batchActions,
}: CrudPageProps) {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    handleSearch,
    handleReset,
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useCrud(api);

  const [searchParams, setSearchParams] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    searchFields.forEach((field) => {
      initialValues[field.name] = '';
    });
    return initialValues;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!FormComponent) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setEditingRecord(null);
        setModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [FormComponent]);

  const allColumns = [
    ...columns,
    {
      key: 'actions',
      title: t('common.actions'),
      width: '160px',
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          {FormComponent && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                setEditingRecord(record);
                setModalOpen(true);
              }}
              disabled={Boolean(isEditDisabled?.(record))}
              className="rounded px-2 py-2 text-xs text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              {t('common.edit')}
            </button>
          )}
          <button
            onClick={async (event) => {
              event.stopPropagation();
              if (await confirm(t('crud.confirmDeleteCurrent'))) {
                handleDelete(String(record[rowKey]));
              }
            }}
            disabled={Boolean(isDeleteDisabled?.(record))}
            className="rounded px-2 py-2 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            {t('common.delete')}
          </button>
          {extraActions && extraActions(record)}
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleModalOk = async (values: any) => {
    if (editingRecord) {
      await handleUpdate({ ...values, [rowKey]: editingRecord[rowKey] });
    } else {
      await handleAdd(values);
    }
    setModalOpen(false);
  };

  const handleBatchDelete = async () => {
    if (
      await confirm(t('crud.confirmBatchDelete', { count: selectedRowKeys.length }))
    ) {
      await handleDelete(selectedRowKeys.join(','));
      setSelectedRowKeys([]);
    }
  };

  const handleExport = () => {
    const exportCols = columns.map((c) => ({ key: c.key, title: c.title }));
    const exportData = data.map((row) => {
      const item: Record<string, any> = {};
      columns.forEach((col) => {
        const val = row[col.key];
        item[col.key] = val != null ? String(val) : '';
      });
      return item;
    });
    exportToCsv(exportCols, exportData, title);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 min-h-[44px]"
          >
            <Download size={14} />
            {t('common.exportCsv')}
          </button>
          {FormComponent && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-3 text-sm text-white hover:bg-indigo-700 min-h-[44px]"
            >
              <Plus size={14} />
              {t('common.add')}
            </button>
          )}
        </div>
      </div>

      {searchFields.length > 0 && (
        <SearchForm
          onSearch={() => handleSearch(searchParams)}
          onReset={() => {
            const nextSearchParams: Record<string, string> = {};
            searchFields.forEach((field) => {
              nextSearchParams[field.name] = '';
            });
            setSearchParams(nextSearchParams);
            handleReset();
          }}
        >
          {searchFields.map((field) => (
            <SearchField key={field.name} label={field.label}>
              {field.type === 'select' ? (
                <select
                  value={searchParams[field.name] || ''}
                  onChange={(event) =>
                    setSearchParams((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                  aria-label={field.label}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                >
                  <option value="">{t('common.all')}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={searchParams[field.name] || ''}
                  onChange={(event) =>
                    setSearchParams((prev) => ({ ...prev, [field.name]: event.target.value }))
                  }
                  aria-label={field.label}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  placeholder={t('common.pleaseEnterField', { field: field.label })}
                />
              )}
            </SearchField>
          ))}
        </SearchForm>
      )}

      {selectedRowKeys.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm">
          <span className="text-indigo-700">
            {t('common.selectedCount', { count: selectedRowKeys.length })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchDelete}
              className="rounded px-3 py-1 text-xs text-red-600 hover:bg-red-100"
            >
              {t('common.batchDelete')}
            </button>
            {batchActions?.(selectedRowKeys)}
          </div>
          <button
            onClick={() => setSelectedRowKeys([])}
            className="ml-auto rounded px-3 py-1 text-xs text-slate-500 hover:bg-indigo-100"
          >
            {t('common.deselectAll')}
          </button>
        </div>
      )}

      <BaseTable
        columns={allColumns}
        data={data}
        loading={loading}
        rowKey={rowKey}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />

      {FormComponent && (
        <BaseModal
          open={modalOpen}
          title={editingRecord ? t('crud.editTitle', { title }) : t('crud.addTitle', { title })}
          onClose={() => setModalOpen(false)}
        >
          <FormComponent
            initialValues={editingRecord}
            onSubmit={handleModalOk}
            onCancel={() => setModalOpen(false)}
          />
        </BaseModal>
      )}
    </div>
  );
}
