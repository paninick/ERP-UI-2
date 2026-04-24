import {useEffect, useMemo, useState} from 'react';
import {AlertTriangle, CheckCircle, Circle, Clock, Truck} from 'lucide-react';
import * as jobProcessApi from '@/api/produceJobProcess';
import {useDictOptions} from '@/hooks/useDictOptions';

interface ProcessStep {
  id: number;
  processId: number;
  processName: string;
  processSeq: number;
  employeeName: string;
  inQty: number;
  outQty: number;
  defectQty: number;
  lossQty: number;
  processStatus: string;
  isOutsource: string;
}

import type { ComponentType } from 'react';

const STATUS_ICON_MAP: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  PENDING: Circle,
  RUNNING: Clock,
  WAIT_CHECK: AlertTriangle,
  PASS: CheckCircle,
  FAIL: AlertTriangle,
};

function getIcon(status: string, isOutsource: string) {
  if (isOutsource === '1') {
    return Truck;
  }
  return STATUS_ICON_MAP[status] || Circle;
}

export default function ProcessFlow({jobId}: {jobId: number}) {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const processStatus = useDictOptions('erp_process_status');

  useEffect(() => {
    setLoading(true);
    jobProcessApi.listByJob(jobId).then((response: any) => {
      const rows = response?.rows || response || [];
      setSteps([...rows].sort((a: ProcessStep, b: ProcessStep) => a.processSeq - b.processSeq));
    }).catch(() => {
      setSteps([]);
    }).finally(() => setLoading(false));
  }, [jobId]);

  const progressedCount = useMemo(
    () => steps.filter((step) => step.processStatus === 'WAIT_CHECK' || step.processStatus === 'PASS').length,
    [steps]
  );

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (steps.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">暂无工序数据，可能尚未初始化工序队列。</p>;
  }

  const progressPercent = Math.round((progressedCount / steps.length) * 100);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>进度</span>
          <span>{progressedCount}/{steps.length} 道工序已完成报工（{progressPercent}%）</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
            style={{width: `${progressPercent}%`}}
          />
        </div>
      </div>

      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {steps.map((step, index) => {
          const tag = processStatus.toTag(step.processStatus);
          const Icon = getIcon(step.processStatus, step.isOutsource);
          const isFinished = step.processStatus === 'WAIT_CHECK' || step.processStatus === 'PASS';
          const isRunning = step.processStatus === 'RUNNING';

          return (
            <div key={step.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 transition">
              <div className="flex shrink-0 flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  isFinished
                    ? 'border-emerald-400 bg-emerald-100'
                    : isRunning
                      ? 'border-amber-400 bg-amber-100'
                      : 'border-slate-200 bg-white'
                }`}>
                  <span className={`text-xs font-bold ${
                    isFinished
                      ? 'text-emerald-600'
                      : isRunning
                        ? 'text-amber-600'
                        : 'text-slate-400'
                  }`}>
                    {step.processSeq}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mt-1 h-4 w-0.5 ${isFinished ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={step.isOutsource === '1' ? 'text-purple-500' : 'text-slate-500'} />
                  <span className="text-sm font-medium text-slate-800">
                    {step.processName || `工序 ${step.processSeq}`}
                  </span>
                  {step.isOutsource === '1' && (
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">外协</span>
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tag.color}`}>
                    {tag.label}
                  </span>
                </div>

                {(step.inQty > 0 || step.outQty > 0) && (
                  <div className="mt-1 flex gap-4 text-xs text-slate-500">
                    <span>收 {step.inQty}</span>
                    <span>出 {step.outQty}</span>
                    {step.defectQty > 0 && <span className="text-red-500">次品 {step.defectQty}</span>}
                    {step.lossQty > 0 && <span className="text-amber-500">损耗 {step.lossQty}</span>}
                  </div>
                )}

                {step.employeeName && (
                  <p className="mt-0.5 text-xs text-slate-400">操作工：{step.employeeName}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
