import { useCallback, useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as checkApi from '@/api/check';
import * as jobProcessApi from '@/api/produceJobProcess';
import BaseModal from '@/components/ui/BaseModal';
import BaseTable from '@/components/ui/BaseTable';
import Pagination from '@/components/ui/Pagination';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';

const listApi = {
  list: checkApi.listCheck,
  get: checkApi.getCheck,
  update: checkApi.updateCheck,
  remove: checkApi.delCheck,
};

export default function CheckPage() {
  const { t } = useTranslation();
  const [urlSearchParams] = useSearchParams();

  // 已有质检单列表
  const [checks, setChecks] = useState<any[]>([]);
  const [checksLoading, setChecksLoading] = useState(false);
  const [checksPagination, setChecksPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [checksQuery, setChecksQuery] = useState({
    checkNo: urlSearchParams.get('checkNo') || '',
    jobNo: urlSearchParams.get('jobNo') || '',
  });

  // 待检工序池
  const [pendingProcesses, setPendingProcesses] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingQuery, setPendingQuery] = useState({
    jobNo: urlSearchParams.get('jobNo') || '',
    processName: '',
  });

  // 新建质检 Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSource, setCreateSource] = useState<any>(null);
  const [createForm, setCreateForm] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const fetchChecks = useCallback(async (page = 1) => {
    setChecksLoading(true);
    try {
      const res: any = await checkApi.listCheck({
        pageNum: page,
        pageSize: checksPagination.pageSize,
        ...checksQuery,
      });
      setChecks(res.rows || []);
      setChecksPagination((prev) => ({ ...prev, current: page, total: res.total || 0 }));
    } catch {
      setChecks([]);
    } finally {
      setChecksLoading(false);
    }
  }, [checksQuery, checksPagination.pageSize]);

  const fetchPendingProcesses = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res: any = await jobProcessApi.listProduceJobProcess({
        pageNum: 1,
        pageSize: 30,
        processStatus: 'WAIT_CHECK',
        jobNo: pendingQuery.jobNo,
        processName: pendingQuery.processName,
      });
      setPendingProcesses(res.rows || []);
    } catch {
      setPendingProcesses([]);
    } finally {
      setPendingLoading(false);
    }
  }, [pendingQuery]);

  useEffect(() => { fetchChecks(1); }, [checksQuery]);
  useEffect(() => { fetchPendingProcesses(); }, [pendingQuery]);

  const openCreateFromProcess = (process: any) => {
    setCreateSource(process);
    setCreateForm({
      jobProcessId: String(process.id || ''),
      jobNo: process.jobNo || '',
      processName: process.processName || '',
      checkType: 'PROCESS',
      checker: '',
      checkResult: '',
      remark: '',
    });
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.checker) {
      toast.error('请填写检验员');
      return;
    }
    if (!createForm.checkResult) {
      toast.error('请选择检验结果');
      return;
    }
    setCreating(true);
    try {
      await checkApi.addCheck(createForm);
      toast.success('质检单已创建');
      setCreateModalOpen(false);
      setCreateSource(null);
      fetchChecks(1);
      fetchPendingProcesses();
    } catch (error: any) {
      toast.error(error.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (record: any) => {
    if (!(await confirm(`确认删除质检单 ${record.checkNo || record.id}？`))) return;
    try {
      await checkApi.delCheck(record.id);
      toast.success(t('common.deleteSuccess'));
      fetchChecks(checksPagination.current);
    } catch (error: any) {
      toast.error(error.message || t('common.deleteFailed'));
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* 说明区 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">质量检验</div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{t('page.check.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              质检单必须来自待检工序。在下方「待检工序池」找到对应工序，点「新建检验」进入质检表单，系统自动带入工票号和工序信息。
            </p>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              禁止空白新增质检单。质检必须有来源工序，否则无法追溯责任链。
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { to: '/quality/inspection', title: '工序质检工作台', detail: '按工票/工序检索待检批次，记录疵点和判定结果。' },
              { to: '/production/job', title: '查看生产工单', detail: '质检来源于工单工序，先确认工单已下发。' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                <div className="mt-3 flex justify-end text-emerald-700">
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* 待检工序池 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">待检工序池</h2>
            <p className="mt-1 text-sm text-slate-500">状态为「待检」的工序，点「新建检验」进入质检表单。</p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="工票号..."
            value={pendingQuery.jobNo}
            onChange={(e) => setPendingQuery((prev) => ({ ...prev, jobNo: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 w-40"
          />
          <input
            type="text"
            placeholder="工序名称..."
            value={pendingQuery.processName}
            onChange={(e) => setPendingQuery((prev) => ({ ...prev, processName: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 w-40"
          />
          <button
            type="button"
            onClick={fetchPendingProcesses}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Search size={14} />
            搜索
          </button>
        </div>
        {pendingLoading ? (
          <div className="py-6 text-center text-sm text-slate-400">加载中...</div>
        ) : pendingProcesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
            暂无待检工序。请先在生产工单中推进工序到「待检」状态。
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3">工票号</th>
                  <th className="px-4 py-3">工序</th>
                  <th className="px-4 py-3">员工</th>
                  <th className="px-4 py-3">入库数</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingProcesses.map((process) => (
                  <tr key={process.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{process.jobNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{process.processName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{process.employeeName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{process.inQty ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">待检</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openCreateFromProcess(process)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <ShieldCheck size={12} />
                        新建检验
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 已有质检单列表 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">已有质检单</h2>
            <p className="mt-1 text-sm text-slate-500">查看和管理已创建的质检记录。</p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="质检单号..."
            value={checksQuery.checkNo}
            onChange={(e) => setChecksQuery((prev) => ({ ...prev, checkNo: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 w-40"
          />
          <input
            type="text"
            placeholder="工票号..."
            value={checksQuery.jobNo}
            onChange={(e) => setChecksQuery((prev) => ({ ...prev, jobNo: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 w-40"
          />
          <button
            type="button"
            onClick={() => fetchChecks(1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Search size={14} />
            搜索
          </button>
        </div>
        <BaseTable
          columns={[
            { key: 'checkNo', title: t('page.check.checkNo') },
            { key: 'checkType', title: t('page.check.checkType') },
            { key: 'checkResult', title: t('page.check.checkResult') },
            { key: 'checker', title: t('page.check.checker') },
            { key: 'checkTime', title: t('page.check.checkTime') },
            { key: 'status', title: t('page.check.status') },
            {
              key: 'actions',
              title: '',
              render: (_: any, record: any) => (
                <button
                  type="button"
                  onClick={() => handleDelete(record)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  {t('common.delete')}
                </button>
              ),
            },
          ]}
          data={checks}
          loading={checksLoading}
          rowKey="id"
          ariaLabel="质检单列表"
        />
        <Pagination
          current={checksPagination.current}
          pageSize={checksPagination.pageSize}
          total={checksPagination.total}
          onChange={(page) => fetchChecks(page)}
        />
      </section>

      {/* 新建质检 Modal */}
      <BaseModal
        open={createModalOpen}
        title="新建质检单"
        onClose={() => { setCreateModalOpen(false); setCreateSource(null); }}
        onOk={handleCreate}
        loading={creating}
        width="480px"
      >
        <div className="space-y-4">
          {createSource && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <p className="font-medium text-emerald-800">来源工序</p>
              <p className="mt-1 text-emerald-700">工票号：{createSource.jobNo || '-'} | 工序：{createSource.processName || '-'}</p>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">检验员 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={createForm.checker || ''}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, checker: e.target.value }))}
              placeholder="请输入检验员姓名"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">检验结果 <span className="text-red-500">*</span></label>
            <select
              aria-label="检验结果"
              value={createForm.checkResult || ''}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, checkResult: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            >
              <option value="">-- 请选择 --</option>
              <option value="PASS">合格</option>
              <option value="FAIL">不合格</option>
              <option value="CONDITIONAL">有条件合格</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">备注</label>
            <textarea
              value={createForm.remark || ''}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, remark: e.target.value }))}
              placeholder="检验备注..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
