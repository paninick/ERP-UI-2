import {useEffect, useRef, useState} from 'react';
import Gantt from 'frappe-gantt';
import '/node_modules/frappe-gantt/dist/frappe-gantt.css';
import * as ganttApi from '@/api/gantt';
import {toast} from '@/components/ui/Toast';

type ViewMode = 'Day' | 'Week' | 'Month';

const STATUS_COLOR: Record<string, string> = {
  '0': '#6366f1',
  '1': '#f59e0b',
  '2': '#10b981',
};

export default function ProductionGanttPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    ganttApi.getGanttData().then((res: any) => {
      const raw: any[] = res.data || res || [];
      if (!raw.length) {
        setError('暂无生产计划数据');
        setLoading(false);
        return;
      }

      const tasks = raw.map((t: any) => ({
        id: String(t.id),
        name: t.name || `计划#${t.id}`,
        start: t.start ? t.start.split('T')[0] : new Date().toISOString().split('T')[0],
        end: t.end ? t.end.split('T')[0] : new Date().toISOString().split('T')[0],
        progress: t.progress ?? 0,
        custom_class: `status-${t.status || '0'}`,
      }));

      if (!containerRef.current) return;

      ganttRef.current = new Gantt(containerRef.current, tasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        on_date_change: (task: any, start: Date, end: Date) => {
          ganttApi.updateGanttDate(
            Number(task.id),
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0],
          ).catch(() => {
            toast.error('更新排期失败');
          });
        },
        popup_trigger: 'click',
      } as any);

      setLoading(false);
    }).catch(() => {
      setError('加载甘特图数据失败');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (ganttRef.current) {
      ganttRef.current.change_view_mode(viewMode);
    }
  }, [viewMode]);

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">生产甘特图</h1>
        <div className="flex gap-2">
          {(['Day', 'Week', 'Month'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {m === 'Day' ? '日' : m === 'Week' ? '周' : '月'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />待生产</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />生产中</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />已完成</span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}
        {error && (
          <div className="flex h-64 items-center justify-center text-slate-400">{error}</div>
        )}
        <div ref={containerRef} className={loading || error ? 'hidden' : ''} />
      </div>
    </div>
  );
}
