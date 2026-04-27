import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import GanttChart, { GanttTask } from '@/components/ui/GanttChart';
import * as ganttApi from '@/api/gantt';
import { toast } from '@/components/ui/Toast';

type ViewMode = 'Day' | 'Week' | 'Month';

export default function ProductionGanttPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    ganttApi
      .getGanttData()
      .then((res: any) => {
        const raw: any[] = res.data || res || [];
        setRawData(raw);
        setLoading(false);
      })
      .catch(() => {
        setError(t('gantt.loadFailed'));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? rawData.filter((task: any) =>
            (task.name || '').toLowerCase().includes(search.toLowerCase()),
          )
        : rawData,
    [rawData, search],
  );

  const tasks: GanttTask[] = useMemo(
    () =>
      filtered.map((task: any) => ({
        id: String(task.id),
        name: task.name || `${t('gantt.planPrefix')}#${task.id}`,
        start: task.start ? task.start.split('T')[0] : new Date().toISOString().split('T')[0],
        end: task.end ? task.end.split('T')[0] : new Date().toISOString().split('T')[0],
        progress: task.progress ?? 0,
        custom_class: 'gantt-bar',
      })),
    [filtered, t],
  );

  const handleDateChange = (task: GanttTask, start: Date, end: Date) => {
    ganttApi
      .updateGanttDate(
        Number(task.id),
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
      )
      .catch(() => toast.error(t('gantt.updateFailed')));
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">{t('gantt.title')}</h1>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <Search size={14} className="text-slate-400" />
          <input
            className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder={t('gantt.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {(['Day', 'Week', 'Month'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                viewMode === m
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t(m === 'Day' ? 'gantt.viewModeDay' : m === 'Week' ? 'gantt.viewModeWeek' : 'gantt.viewModeMonth')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {t('gantt.totalLabel', { count: filtered.length })}
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}
        {!loading && error && (
          <div className="flex h-64 items-center justify-center text-slate-400">{error}</div>
        )}
        {!loading && !error && tasks.length === 0 && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            {search ? t('gantt.noData') : t('gantt.noData')}
          </div>
        )}
        {!loading && !error && tasks.length > 0 && (
          <GanttChart tasks={tasks} viewMode={viewMode} onDateChange={handleDateChange} />
        )}
      </div>
    </div>
  );
}
