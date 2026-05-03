import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle, Play, ShieldCheck } from 'lucide-react';
import * as api from '@/api/firstPiece';
import { toast } from '@/components/ui/Toast';
import { unwrapAjaxResultData } from '@/utils/ajaxResult';

const PRODUCT_FAMILIES = [
  { value: 'SWEATER', label: '毛衫' },
  { value: 'SPLICE', label: '拼接款' },
  { value: 'KNIT_TOP', label: '普通针织衫' },
];

const STAGES = [
  { key: 'SELF', label: '自检', icon: '👤' },
  { key: 'TEAM', label: '互检', icon: '👥' },
  { key: 'QC', label: '专检', icon: '🔍' },
];

interface StageData {
  status?: string;
  by?: string;
  time?: string;
  remark?: string;
}

interface FirstPieceRecord {
  id: number;
  jobProcessId: number;
  productFamily?: string;
  triggerReason?: string;
  stageSelfStatus?: string;
  stageSelfBy?: string;
  stageSelfTime?: string;
  stageSelfRemark?: string;
  stageTeamStatus?: string;
  stageTeamBy?: string;
  stageTeamTime?: string;
  stageTeamRemark?: string;
  stageQcStatus?: string;
  stageQcBy?: string;
  stageQcTime?: string;
  stageQcRemark?: string;
  finalResult?: string;
}

export default function FirstPieceCard({ jobProcessId, onChanged }: { jobProcessId: number; onChanged?: () => void }) {
  const [record, setRecord] = useState<FirstPieceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [productFamily, setProductFamily] = useState('SWEATER');
  const [triggerReason, setTriggerReason] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [approving, setApproving] = useState('');
  const [remark, setRemark] = useState('');

  const load = async () => {
    try {
      const res = await api.getFirstPieceByJobProcess(jobProcessId);
      const data = unwrapAjaxResultData<FirstPieceRecord>(res);
      setRecord(data ?? null);
      const blockRes = await api.isFirstPieceBlocked(jobProcessId);
      setBlocked((blockRes as any)?.data?.blocked ?? (blockRes as any)?.blocked ?? false);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [jobProcessId]);

  const handleTrigger = async () => {
    if (!triggerReason.trim()) { toast.error('请填写触发原因'); return; }
    setTriggering(true);
    try {
      await api.triggerFirstPiece({ jobProcessId, productFamily, triggerReason: triggerReason.trim() });
      toast.success('首件三检已触发');
      await load();
      onChanged?.();
    } catch (e: any) { toast.error(e?.message || '触发失败'); }
    finally { setTriggering(false); }
  };

  const handleApprove = async (stage: string, status: string) => {
    if (!record) return;
    setApproving(stage);
    try {
      await api.approveFirstPieceStage({ id: record.id, stage, status, remark });
      toast.success(status === '1' ? `${STAGES.find(s => s.key === stage)?.label}已通过` : `${STAGES.find(s => s.key === stage)?.label}已打回`);
      setRemark('');
      await load();
      onChanged?.();
    } catch (e: any) { toast.error(e?.message || '操作失败'); }
    finally { setApproving(''); }
  };

  const getStage = (key: string): StageData => {
    if (!record) return {};
    switch (key) {
      case 'SELF': return { status: record.stageSelfStatus, by: record.stageSelfBy, time: record.stageSelfTime, remark: record.stageSelfRemark };
      case 'TEAM': return { status: record.stageTeamStatus, by: record.stageTeamBy, time: record.stageTeamTime, remark: record.stageTeamRemark };
      case 'QC': return { status: record.stageQcStatus, by: record.stageQcBy, time: record.stageQcTime, remark: record.stageQcRemark };
      default: return {};
    }
  };

  const familyLabel = (code?: string) => PRODUCT_FAMILIES.find(f => f.value === code)?.label || code || '-';

  if (loading) {
    return <div className="rounded-xl border border-slate-200 p-4 text-center text-sm text-slate-400">加载首件三检数据...</div>;
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={18} className="text-amber-600" />
          <h4 className="font-semibold text-amber-800">首件三检</h4>
        </div>
        <p className="text-sm text-amber-700 mb-3">该工序尚未触发首件三检。换款/换料/换班等场景需执行首件确认。</p>
        <div className="space-y-2">
          <select className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-sm" value={productFamily} onChange={e => setProductFamily(e.target.value)}>
            {PRODUCT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <input className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-sm" placeholder="触发原因，如：换款首件、换料首件" value={triggerReason} onChange={e => setTriggerReason(e.target.value)} />
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <Play size={14} /> 触发首件三检
          </button>
        </div>
      </div>
    );
  }

  const statusIcon = (status?: string) => {
    switch (status) {
      case '1': return <CheckCircle size={16} className="text-emerald-500" />;
      case '2': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-slate-300" />;
    }
  };

  const statusText = (status?: string) => {
    switch (status) {
      case '1': return '通过';
      case '2': return '不通过';
      default: return '待检';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className={record.finalResult === '1' ? 'text-emerald-600' : record.finalResult === '2' ? 'text-red-600' : 'text-amber-600'} />
          <h4 className="font-semibold text-slate-800">首件三检</h4>
        </div>
        {blocked && record.finalResult !== '1' && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-medium">阻断中</span>
        )}
        {record.finalResult === '1' && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 font-medium">全部通过</span>
        )}
      </div>

      <div className="text-xs text-slate-500 mb-3">
        <span>产品族：{familyLabel(record.productFamily)}</span>
        <span className="ml-4">触发原因：{record.triggerReason || '-'}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STAGES.map((stage) => {
          const s = getStage(stage.key);
          const isPending = s.status === '0' || !s.status;
          const prevStage = stage.key === 'TEAM' ? getStage('SELF') : stage.key === 'QC' ? getStage('TEAM') : null;
          const prevPassed = !prevStage || prevStage.status === '1';

          return (
            <div key={stage.key} className={`rounded-lg border p-3 text-center ${s.status === '1' ? 'border-emerald-200 bg-emerald-50' : s.status === '2' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex justify-center mb-1">
                <span className="text-lg">{stage.icon}</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{stage.label}</p>
              <div className="flex justify-center gap-1 mt-1">{statusIcon(s.status)}</div>
              <p className="text-xs text-slate-500 mt-0.5">{statusText(s.status)}</p>
              {s.by && <p className="text-xs text-slate-400 mt-0.5">{s.by}</p>}
              {s.remark && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]" title={s.remark}>{s.remark}</p>}

              {isPending && prevPassed && (
                <div className="mt-2 space-y-1">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                    placeholder="备注(可选)"
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApprove(stage.key, '1')}
                      disabled={approving === stage.key}
                      className="flex-1 rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => handleApprove(stage.key, '2')}
                      disabled={approving === stage.key}
                      className="flex-1 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      驳回
                    </button>
                  </div>
                </div>
              )}

              {isPending && !prevPassed && (
                <p className="text-xs text-amber-500 mt-2">请先完成前序检查</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
