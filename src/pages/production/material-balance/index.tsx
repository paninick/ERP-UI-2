import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, Calculator, FileText, ShieldCheck } from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import client from '@/api/client';

const STATUS_TAGS: Record<string, { label: string; color: string }> = {
  '待平衡': { label: '待平衡', color: 'bg-slate-100 text-slate-600' },
  '已平衡': { label: '已平衡', color: 'bg-emerald-100 text-emerald-700' },
  '差异待处理': { label: '差异待处理', color: 'bg-amber-100 text-amber-700' },
  '已审批': { label: '已审批', color: 'bg-blue-100 text-blue-700' },
};

const api = {
  list: (params: any) => client.get('/erp/produceMaterialBalance/list', { params }),
  get: (id: number) => client.get(`/erp/produceMaterialBalance/${id}`),
  add: (data: any) => client.post('/erp/produceMaterialBalance', data),
  update: (data: any) => client.put('/erp/produceMaterialBalance', data),
  remove: (ids: string) => client.delete(`/erp/produceMaterialBalance/${ids}`),
};

export default function MaterialBalancePage() {
  const [tableKey, setTableKey] = useState(0);

  const columns = [
    { key: 'balanceNo', title: '平衡单号' },
    { key: 'planNo', title: '计划编号' },
    { key: 'jobNo', title: '工票编号' },
    { key: 'materialCode', title: '物料编码' },
    { key: 'materialName', title: '物料名称' },
    { key: 'batchNo', title: '批次' },
    { key: 'bomQty', title: 'BOM定额' },
    { key: 'outQty', title: '出库量' },
    { key: 'consumeQty', title: '消耗量' },
    { key: 'returnQty', title: '退库量' },
    { key: 'lossQty', title: '损耗量' },
    {
      key: 'balanceDiff',
      title: '差异',
      render: (value: number) => {
        const isZero = value != null && Math.abs(value) < 0.001;
        return <span className={isZero ? 'text-emerald-600' : 'font-medium text-red-600'}>{value ?? '-'}</span>;
      },
    },
    { key: 'diffRate', title: '差异率' },
    {
      key: 'balanceStatus',
      title: '平衡状态',
      render: (value: string) => {
        const tag = STATUS_TAGS[value] || STATUS_TAGS['待平衡'];
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'balanceNo', label: '平衡单号' },
    { name: 'planNo', label: '计划编号' },
    { name: 'materialName', label: '物料名称' },
    { name: 'balanceStatus', label: '平衡状态', type: 'select' as const, options: Object.entries(STATUS_TAGS).map(([value, { label }]) => ({ value, label })) },
  ];

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const handleCalculatePlan = async (record: any) => {
    if (!(await confirm(`确认对计划 ${record.planNo || record.producePlanId} 重新计算物料平衡？`))) return;
    try {
      await client.post(`/erp/produceMaterialBalance/calculate/plan/${record.producePlanId}`);
      toast.success('平衡计算完成');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '计算失败');
    }
  };

  const handleCalculateJob = async (record: any) => {
    if (!(await confirm(`确认对工票 ${record.jobNo || record.jobId} 重新计算物料平衡？`))) return;
    try {
      await client.post(`/erp/produceMaterialBalance/calculate/job/${record.jobId}`);
      toast.success('平衡计算完成');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '计算失败');
    }
  };

  const handleApprove = async (record: any) => {
    const status = window.prompt('请输入审批结果：已审批 / 已驳回', '已审批');
    if (!status) return;
    const remark = window.prompt('请输入审批备注', record.approvalRemark || '') || '';
    if (!(await confirm(`确认将 ${record.balanceNo} 审批为 ${status}？`))) return;
    try {
      await client.post(`/erp/produceMaterialBalance/approve/${record.id}/${encodeURIComponent(status)}`, null, {
        params: { approvalRemark: remark },
      });
      toast.success('审批完成');
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || '审批失败');
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700">物料平衡</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">生产物料平衡表</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              对每个生产计划/工票，按物料+批次维度汇总出库、消耗、退库、损耗数据，计算平衡差异与差异率。差异超阈值需审批处理。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: FileText, label: '它是什么', value: '物料"出-耗-退-损"闭环总账' },
                { icon: Calculator, label: '核心能力', value: '按计划/工票一键计算平衡' },
                { icon: ShieldCheck, label: '保护对象', value: '物料差异 / 成本偏差 / 盘盈盘亏' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="w-fit rounded-2xl bg-white p-2 text-slate-700 shadow-sm"><item.icon size={18} /></div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/production/material-return', title: '退库管理', detail: '登记余料退库、错领退库、边角料退库、报废记录。' },
              { to: '/inventory/material-consume', title: '物料消耗', detail: '按工票/工序维度查看物料消耗明细与超损记录。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-sky-700"><ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <CrudPage
        key={tableKey}
        title="物料平衡表"
        api={api}
        columns={columns}
        searchFields={searchFields}
        extraActions={(record: any) => (
          <>
            {record.producePlanId && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); handleCalculatePlan(record); }}
                className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition-colors"
              >
                <Calculator size={14} /> 按计划重算
              </button>
            )}
            {record.jobId && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); handleCalculateJob(record); }}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Calculator size={14} /> 按工票重算
              </button>
            )}
            {record.balanceStatus === '差异待处理' && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); handleApprove(record); }}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <ShieldCheck size={14} /> 审批
              </button>
            )}
          </>
        )}
      />
    </div>
  );
}
