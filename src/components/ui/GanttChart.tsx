import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import '../../../node_modules/frappe-gantt/dist/frappe-gantt.css';

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  owner?: string;
  status?: string;
  customerName?: string;
  styleCategory?: string;
  dependencies?: string;
  custom_class?: string;
  color?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  viewMode?: 'Day' | 'Week' | 'Month';
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void;
  onClick?: (task: GanttTask) => void;
}

export default function GanttChart({
  tasks,
  viewMode = 'Week',
  onDateChange,
  onClick,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<Gantt | null>(null);

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;
    const normalizedTasks = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      start: task.start,
      end: task.end,
      progress: task.progress,
      dependencies: task.dependencies,
      color: task.color,
    }));

    if (ganttRef.current) {
      ganttRef.current = null;
    }
    containerRef.current.innerHTML = '';

    ganttRef.current = new Gantt(containerRef.current, normalizedTasks, {
      view_mode: viewMode,
      date_format: 'YYYY-MM-DD',
      bar_height: 28,
      padding: 16,
      popup_trigger: 'click',
      on_date_change: (task: any, start: Date, end: Date) => {
        onDateChange?.(task, start, end);
      },
      on_click: (task: any) => {
        onClick?.(task);
      },
    } as any);

    return () => {
      if (ganttRef.current) {
        ganttRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tasks, viewMode]);

  return <div ref={containerRef} className="min-h-[600px]" />;
}
