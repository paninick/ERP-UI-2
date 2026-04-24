import {useCallback, useEffect, useState} from 'react';
import * as inventoryApi from '@/api/inventory';
import {toast} from '@/components/ui/Toast';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import SearchForm, {SearchField} from '@/components/ui/SearchForm';

const columns = [
  {key: 'warehouseName', title: '仓库'},
  {key: 'materialName', title: '物料名称'},
  {key: 'materialNo', title: '物料编号'},
  {key: 'quantity', title: '库存数量'},
  {key: 'unit', title: '单位'},
  {key: 'locationName', title: '库位'},
];

export default function InventoryListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({pageNum: 1, pageSize: 20, total: 0});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    materialName: '',
    warehouseName: '',
  });

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
      setPagination((prev) => ({...prev, total: response.total || 0}));
    } catch {
      setData([]);
      toast.error('加载库存数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNum, pagination.pageSize, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPagination((prev) => ({...prev, pageNum: 1}));
    fetchData({pageNum: 1});
  };

  const handleReset = () => {
    setQueryParams({materialName: '', warehouseName: ''});
    setPagination((prev) => ({...prev, pageNum: 1}));
    fetchData({pageNum: 1, materialName: '', warehouseName: ''});
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination((prev) => ({...prev, pageNum, pageSize}));
    fetchData({pageNum, pageSize});
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-800">库存查询</h2>

      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <SearchField label="物料名称">
          <input
            value={queryParams.materialName}
            onChange={(event) => setQueryParams((prev) => ({...prev, materialName: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="请输入物料名称"
          />
        </SearchField>
        <SearchField label="仓库">
          <input
            value={queryParams.warehouseName}
            onChange={(event) => setQueryParams((prev) => ({...prev, warehouseName: event.target.value}))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="请输入仓库名称"
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
