import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCrud } from '@/hooks/useCrud';
import { confirm } from './ConfirmDialog';
import BaseModal from './BaseModal';
import BaseTable from './BaseTable';
import Pagination from './Pagination';
import SearchForm, { SearchField } from './SearchForm';
import { exportToCsv } from '@/utils/exportToCsv';
import { useAppStore } from '@/stores/appStore';

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
    get?: (id: number) => Promise<any>;
    add?: (data: any) => Promise<any>;
    update?: (data: any) => Promise<any>;
    remove?: (ids: string) => Promise<any>;
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
  initialSearchParams?: Record<string, string>;
  emptyState?: ReactNode;
  onSaved?: (record: any, mode: 'add' | 'edit') => void | Promise<void>;
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
  initialSearchParams,
  emptyState,
  onSaved,
}: CrudPageProps) {
  const { t } = useTranslation();
  const uiTheme = useAppStore((state) => state.uiTheme);
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

  const emptySearchParams = useMemo(() => {
    const initialValues: Record<string, string> = {};
    searchFields.forEach((field) => {
      initialValues[field.name] = '';
    });
    return initialValues;
  }, [searchFields]);
  const resolvedInitialSearchParams = useMemo(
    () => ({ ...emptySearchParams, ...(initialSearchParams || {}) }),
    [emptySearchParams, initialSearchParams],
  );
  const resolvedInitialSearchKey = useMemo(
    () => JSON.stringify(resolvedInitialSearchParams),
    [resolvedInitialSearchParams],
  );
  const [searchParams, setSearchParams] = useState<Record<string, string>>(resolvedInitialSearchParams);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const appliedInitialSearchKeyRef = useRef<string>('');

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

  useEffect(() => {
    if (appliedInitialSearchKeyRef.current === resolvedInitialSearchKey) {
      return;
    }
    appliedInitialSearchKeyRef.current = resolvedInitialSearchKey;
    setSearchParams(resolvedInitialSearchParams);
    if (Object.values(resolvedInitialSearchParams).some((value) => String(value || '').trim() !== '')) {
      handleSearch(resolvedInitialSearchParams);
    } else {
      handleReset();
    }
  }, [resolvedInitialSearchKey]);

  const allColumns = [
    ...columns,
    {
      key: 'actions',
      title: t('common.actions'),
      width: '160px',
      render: (_: any, record: any) => (
        <div className="flex flex-wrap gap-1.5">
          {FormComponent && api.update && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                setEditingRecord(record);
                setModalOpen(true);
              }}
              disabled={Boolean(isEditDisabled?.(record))}
              className={`rounded-full border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent ${
                uiTheme === 'google'
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : uiTheme === 'night'
                    ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/8'
                  : 'border-amber-200/28 bg-amber-50/80 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t('common.edit')}
            </button>
          )}
          {api.remove && (
            <button
              onClick={async (event) => {
                event.stopPropagation();
                if (await confirm(t('crud.confirmDeleteCurrent'))) {
                  handleDelete(String(record[rowKey]));
                }
              }}
              disabled={Boolean(isDeleteDisabled?.(record))}
              className="rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              {t('common.delete')}
            </button>
          )}
          {extraActions && extraActions(record)}
        </div>
      ),
    },
  ].filter((column) => column.key !== 'actions' || Boolean(FormComponent || api.remove || extraActions));

  const handleAddNew = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleModalOk = async (values: any) => {
    if (editingRecord) {
      if (!api.update) return;
      const payload = { ...values, [rowKey]: editingRecord[rowKey] };
      await handleUpdate(payload);
      await onSaved?.(payload, 'edit');
    } else {
      if (!api.add) return;
      await handleAdd(values);
      await onSaved?.(values, 'add');
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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        className={`overflow-hidden rounded-[28px] p-5 ${
          uiTheme === 'google'
            ? 'border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
            : uiTheme === 'night'
              ? 'border border-white/8 bg-slate-950/72 shadow-[0_28px_90px_rgba(2,8,18,0.32)] backdrop-blur-2xl'
            : 'jtech-panel border border-amber-200/18 bg-white/86 shadow-[0_28px_90px_rgba(120,80,20,0.08)]'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className={`text-[11px] uppercase tracking-[0.34em] ${
              uiTheme === 'google' ? 'text-slate-500' : uiTheme === 'night' ? 'text-slate-400/70' : 'text-amber-700/50'
            }`}>Business Surface</p>
            <h2 className={`text-2xl font-semibold tracking-[0.04em] ${uiTheme === 'night' ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
            <p className={`max-w-2xl text-sm ${uiTheme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>统一为更轻的业务工作面，保留动作入口，减少字段墙和按钮噪音。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              disabled={data.length === 0}
              className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${
                uiTheme === 'google'
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : uiTheme === 'night'
                    ? 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/8'
                  : 'border-amber-200/22 bg-white text-slate-700 hover:bg-amber-50'
              }`}
            >
              <Download size={14} />
              {t('common.exportCsv')}
            </motion.button>
            {FormComponent && api.add && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddNew}
                className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                  uiTheme === 'google'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : uiTheme === 'night'
                      ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_8px_24px_rgba(245,158,11,0.22)]'
                    : 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_8px_24px_rgba(245,158,11,0.22)]'
                }`}
              >
                <Plus size={14} />
                {t('common.add')}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {searchFields.length > 0 && (
        <SearchForm
          onSearch={() => handleSearch(searchParams)}
          onReset={() => {
            setSearchParams(emptySearchParams);
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
                  className="rounded-xl border border-amber-200/20 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-400/50"
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
                  className="rounded-xl border border-amber-200/20 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400/50"
                  placeholder={t('common.pleaseEnterField', { field: field.label })}
                />
              )}
            </SearchField>
          ))}
        </SearchForm>
      )}

      {selectedRowKeys.length > 0 && (
        <div className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm backdrop-blur ${
          uiTheme === 'google'
            ? 'border border-blue-200 bg-blue-50/90'
            : uiTheme === 'night'
              ? 'border border-white/10 bg-white/5'
            : 'border border-amber-200/28 bg-amber-50/85'
        }`}>
          <span className={uiTheme === 'google' ? 'text-blue-700' : uiTheme === 'night' ? 'text-slate-100' : 'text-amber-700'}>
            {t('common.selectedCount', { count: selectedRowKeys.length })}
          </span>
          <div className="flex items-center gap-2">
            {api.remove && (
              <button
                onClick={handleBatchDelete}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  uiTheme === 'night'
                    ? 'border-red-300/18 bg-red-500/10 text-red-200 hover:bg-red-500/15'
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {t('common.batchDelete')}
              </button>
            )}
            {batchActions?.(selectedRowKeys)}
          </div>
          <button
            onClick={() => setSelectedRowKeys([])}
            className={`ml-auto rounded-full border px-3 py-1.5 text-xs transition ${
              uiTheme === 'night'
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'
                : 'border-amber-200/22 bg-white text-slate-600 hover:bg-amber-50'
            }`}
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
        emptyAction={emptyState}
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
