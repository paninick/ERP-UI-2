import {useEffect, useRef, useState, useMemo} from 'react';
import Gantt from 'frappe-gantt';
import '/node_modules/frappe-gantt/dist/frappe-gantt.css';
import * as ganttApi from '@/api/gantt';
import {toast} from '@/components/ui/Toast';
import {Search} from 'lucide-react';

type ViewMode = 'Day' | 'Week' | 'Month';

export default function ProductionGanttPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    ganttApi.getGanttData().then((res: any) => {
      const raw: any[] = res.data || res || [];
      setRawData(raw);
      setLoading(false);
    }).catch(() => {
      setError('加载甘特图数据失败');
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() =>
    search ? rawData.filter((t: any) => (t.name || '').toLowerCase().includes(search.toLowerCase())) : rawData,
    [rawData, search]);

  useEffect(() => {
    if (!containerRef.current || !filtered.length) return;
    if (ganttRef.current) { ganttRef.current = null; }
    containerRef.current.innerHTML = '';

    const tasks = filtered.map((t: any) => ({
      id: String(t.id),
      name: t.name || `计划#${t.id}`,
      start: t.start ? t.start.split('T')[0] : new Date().toISOString().split('T')[0],
      end: t.end ? t.end.split('T')[0] : new Date().toISOString().split('T')[0],
      progress: t.progress ?? 0,
      custom_class: 'gantt-bar',
    }));

    ganttRef.current = new Gantt(containerRef.current, tasks, {
      view_mode: viewMode,
      date_format: 'YYYY-MM-DD',
      bar_height: 28,
      padding: 16,
      popup_trigger: 'click',
      on_date_change: (task: any, start: Date, end: Date) => {
        ganttApi.updateGanttDate(Number(task.id), start.toISOString().split('T')[0], end.toISOString().split('T')[0]).catch(() => toast.error('更新排期失败'));
      },
    } as any);
  }, [filtered, viewMode]);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">生产甘特图</h1>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <Search size={14} className="text-slate-400" />
          <input
            className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜索计划名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {(['Day','Week','Month'] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${viewMode===m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {m==='Day'?'日':m==='Week'?'周':'月'}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} 条计划</span>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        {loading && <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>}
        {!loading && !filtered.length && <div className="flex h-64 items-center justify-center text-slate-400">{search ? '无匹配结果' : '暂无生产计划数据'}</div>}
        <div ref={containerRef} className={loading || !filtered.length ? 'hidden' : 'min-h-[600px]'} />
      </div>
    </div>
  );
}
