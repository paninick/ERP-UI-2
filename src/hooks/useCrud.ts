import {useCallback, useEffect, useState} from 'react';
import {toast} from '@/components/ui/Toast';

interface CrudApi {
  list: (params: any) => Promise<any>;
  get: (id: number) => Promise<any>;
  add: (data: any) => Promise<any>;
  update: (data: any) => Promise<any>;
  remove: (ids: string) => Promise<any>;
}

interface PaginationState {
  pageNum: number;
  pageSize: number;
  total: number;
}

export function useCrud(api: CrudApi) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({pageNum: 1, pageSize: 10, total: 0});
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await api.list({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...queryParams,
      });
      setData(response.rows || []);
      setPagination((prev) => ({...prev, total: response.total || 0}));
    } catch (error: any) {
      toast.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [api, pagination.pageNum, pagination.pageSize, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (params: Record<string, any>) => {
    setQueryParams(params);
    setPagination((prev) => ({...prev, pageNum: 1}));
  };

  const handleReset = () => {
    setQueryParams({});
    setPagination((prev) => ({...prev, pageNum: 1}));
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    setPagination((prev) => ({...prev, pageNum, pageSize}));
  };

  const handleAdd = async (formData: any) => {
    try {
      await api.add(formData);
      toast.success('新增成功');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || '新增失败');
      throw error;
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      await api.update(formData);
      toast.success('修改成功');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || '修改失败');
      throw error;
    }
  };

  const handleDelete = async (ids: string) => {
    try {
      await api.remove(ids);
      toast.success('删除成功');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
      throw error;
    }
  };

  return {
    data,
    loading,
    pagination,
    queryParams,
    handleSearch,
    handleReset,
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    refresh: fetchData,
  };
}
