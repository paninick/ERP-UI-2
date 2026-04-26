import { ReactNode, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCrud } from '@/hooks/useCrud';
import { confirm } from './ConfirmDialog';
import BaseModal from './BaseModal';
import BaseTable from './BaseTable';
import Pagination from './Pagination';
import SearchForm, { SearchField } from './SearchForm';

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
  FormComponent: React.ComponentType<{
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
  }>;
  rowKey?: string;
  extraActions?: (record: any) => ReactNode;
  isEditDisabled?: (record: any) => boolean;
  isDeleteDisabled?: (record: any) => boolean;
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

  const allColumns = [
    ...columns,
    {
      key: 'actions',
      title: t('common.actions'),
      width: '160px',
      render: (_: any, record: any) => (
        <div className="flex gap-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setEditingRecord(record);
              setModalOpen(true);
            }}
            disabled={Boolean(isEditDisabled?.(record))}
            className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={async (event) => {
              event.stopPropagation();
              if (await confirm(t('crud.confirmDeleteCurrent'))) {
                handleDelete(String(record[rowKey]));
              }
            }}
            disabled={Boolean(isDeleteDisabled?.(record))}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          {t('common.add')}
        </button>
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

      <BaseTable columns={allColumns} data={data} loading={loading} rowKey={rowKey} />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />

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
    </div>
  );
}
