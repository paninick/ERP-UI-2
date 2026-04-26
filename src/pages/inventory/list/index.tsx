import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as inventoryApi from '@/api/inventory';
import { toast } from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, { SearchField } from '@/components/ui/SearchForm';

export default function InventoryListPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20, total: 0 });
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    materialName: '',
    warehouseName: '',
  });

  const columns = [
    { key: 'warehouseName', title: t('page.inventoryList.columns.warehouseName') },
    { key: 'materialName', title: t('page.inventoryList.columns.materialName') },
    { key: 'materialNo', title: t('page.inventoryList.columns.materialNo') },
    { key: 'quantity', title: t('page.inventoryList.columns.quantity') },
    { key: 'unit', title: t('page.inventoryList.columns.unit') },
    { key: 'locationName', title: t('page.inventoryList.columns.locationName') },
  ];

  const fetchData = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    try {
      const response: any = await inventoryApi.listInventory({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...queryParams,
        ...params,
      });
      setData(response.rows || []);
      setPagination((prev) => ({ ...prev, total: response.total || 0 }));
    } catch {
      setData([]);
      toast.error(t('page.inventoryList.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, queryParams, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1 });
  };

  const handleReset = () => {
    setQueryParams({ materialName: '', warehouseName: '' });
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
    fetchData({ pageNum: 1, materialName: '', warehouseName: '' });
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageNum, pageSize }));
    fetchData({ pageNum, pageSize });
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{t('page.inventoryList.title')}</h2>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label={t('page.inventoryList.columns.materialName')}>
          <input
            value={queryParams.materialName}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, materialName: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.inventoryList.placeholders.materialName')}
          />
        </SearchField>
        <SearchField label={t('page.inventoryList.columns.warehouseName')}>
          <input
            value={queryParams.warehouseName}
            onChange={(event) => setQueryParams((prev) => ({ ...prev, warehouseName: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder={t('page.inventoryList.placeholders.warehouseName')}
          />
        </SearchField>
      </SearchForm>

      <BaseTable columns={columns} data={data} loading={loading} rowKey="id" />
      <Pagination
        current={pagination.pageNum}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePageChange}
      />
    </div>
  );
}
