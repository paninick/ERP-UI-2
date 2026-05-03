import { useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import client from '@/api/client';

const RETURN_TYPE_TAGS: Record<string, { label: string; color: string }> = {
  '余料': { label: '余料退库', color: 'bg-blue-100 text-blue-700' },
  '错领': { label: '错领退库', color: 'bg-amber-100 text-amber-700' },
  '边角料': { label: '边角料', color: 'bg-purple-100 text-purple-700' },
  '报废': { label: '报废', color: 'bg-red-100 text-red-700' },
};

const STATUS_TAGS: Record<string, { label: string; color: string }> = {
  '待审批': { label: '待审批', color: 'bg-amber-100 text-amber-700' },
  '已通过': { label: '已通过', color: 'bg-emerald-100 text-emerald-700' },
  '已拒绝': { label: '已拒绝', color: 'bg-red-100 text-red-700' },
};

const api = {
  list: (params: any) => client.get('/erp/produceMaterialReturn/list', { params }),
  get: (id: number) => client.get(`/erp/produceMaterialReturn/${id}`),
  add: (data: any) => client.post('/erp/produceMaterialReturn', data),
  update: (data: any) => client.put('/erp/produceMaterialReturn', data),
  remove: (ids: string) => client.delete(`/erp/produceMaterialReturn/${ids}`),
};

export default function MaterialReturnPage() {
  const [tableKey, setTableKey] = useState(0);

  const columns = [
    { key: 'stockOutNo', title: '出库单号' },
    {
      key: 'returnType',
      title: '退库类型',
      render: (value: string) => {
        const tag = RETURN_TYPE_TAGS[value] || { label: value || '-', color: 'bg-slate-100 text-slate-600' };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'materialCode', title: '物料编码' },
    { key: 'materialName', title: '物料名称' },
    { key: 'batchNo', title: '批次' },
    { key: 'returnQty', title: '退库数量' },
    { key: 'unit', title: '单位' },
    { key: 'returnReason', title: '退库原因' },
    { key: 'warehouseName', title: '退入仓库' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || STATUS_TAGS['待审批'];
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'stockOutNo', label: '出库单号' },
    { name: 'materialName', label: '物料名称' },
    { name: 'returnType', label: '退库类型', type: 'select' as const, options: Object.entries(RETURN_TYPE_TAGS).map(([value, { label }]) => ({ value, label })) },
    { name: 'status', label: '状态', type: 'select' as const, options: Object.entries(STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
  ];

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleApprove = async (record: any) => {
    if (!(await confirm(`确认审批通过退库记录？物料 ${record.materialName}，数量 ${record.returnQty}`))) return;
    try {
      await client.post(`/erp/produceMaterialReturn/approve/${record.id}/已通过`);
      toast.success('退库已审批通过');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '审批失败');
    }
  };

  const handleReject = async (record: any) => {
    if (!(await confirm(`确认拒绝退库记录？物料 ${record.materialName}，数量 ${record.returnQty}`))) return;
    try {
      await client.post(`/erp/produceMaterialReturn/approve/${record.id}/已拒绝`);
      toast.success('退库已拒绝');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title="生产退库管理"
      api={api}
      columns={columns}
      searchFields={searchFields}
      extraActions={(record: any) => {
        if (record.status !== '待审批') return null;
        return (
          <>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); handleApprove(record); }}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              通过
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); handleReject(record); }}
              className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              拒绝
            </button>
          </>
        );
      }}
    />
  );
}
