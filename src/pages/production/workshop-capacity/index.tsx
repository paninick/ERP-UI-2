import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { getCompanyLabel } from '@/utils/companyContext';
import * as api from '@/api/workCenter';
import { toast } from '@/components/ui/Toast';
import { Factory, Users, Wrench, Clock, Hash } from 'lucide-react';

interface WorkshopCapacityRow {
  workshopId: number;
  workshopName: string;
  centerCount: number;
  totalCapacity: number;
  totalSewingMachines: number;
  totalKnittingMachines: number;
  totalLinkingMachines: number;
  totalIroningStations: number;
  totalInspectionStations: number;
  totalRepairStations: number;
  totalHeadcount: number;
  totalTeamSize: number;
}

const EQUIPMENT_CARDS = [
  { key: 'totalSewingMachines' as const, labelKey: 'sewingMachines', icon: Wrench },
  { key: 'totalKnittingMachines' as const, labelKey: 'knittingMachines', icon: Wrench },
  { key: 'totalLinkingMachines' as const, labelKey: 'linkingMachines', icon: Wrench },
  { key: 'totalIroningStations' as const, labelKey: 'ironingStations', icon: Wrench },
  { key: 'totalInspectionStations' as const, labelKey: 'inspectionStations', icon: Wrench },
  { key: 'totalRepairStations' as const, labelKey: 'repairStations', icon: Wrench },
];

export default function WorkshopCapacityPage() {
  const { t } = useTranslation();
  const S = 'workCenter';
  const currentCompany = useAppStore((state) => state.currentCompany);
  const [data, setData] = useState<WorkshopCapacityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.getWorkshopCapacity()
      .then((res: any) => {
        if (cancelled) return;
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setData(rows);
        setLoading(false);
      })
      .catch((err: any) => {
        if (cancelled) return;
        toast.error(err?.message || t(`${S}.workshopLoadFailed`));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentCompany.code, t, S]);

  const totalEquipment = (row: WorkshopCapacityRow) =>
    (row.totalSewingMachines || 0) +
    (row.totalKnittingMachines || 0) +
    (row.totalLinkingMachines || 0) +
    (row.totalIroningStations || 0) +
    (row.totalInspectionStations || 0) +
    (row.totalRepairStations || 0);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.95),_rgba(30,41,59,0.88),_rgba(99,102,241,0.78))] px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
            {t('companyContext.currentLabel')}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{getCompanyLabel(currentCompany.code, t)}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">{t(`${S}.workshopCapacityHint`)}</p>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          {t('common.loading')}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          {t(`${S}.noWorkshopCapacity`)}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((row) => (
            <div
              key={row.workshopId}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{row.workshopName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {row.centerCount} {t(`${S}.centerCount`)}
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <Factory size={22} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <p className="text-xs text-slate-500">{t(`${S}.capacity`)}</p>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{row.totalCapacity || '-'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <p className="text-xs text-slate-500">{t(`${S}.headcount`)}</p>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{row.totalHeadcount || 0}{t(`${S}.people`)}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={14} className="text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">{t(`${S}.equipmentGroup`)}</p>
                  <span className="text-xs text-slate-400">({totalEquipment(row)})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {EQUIPMENT_CARDS.map(({ key, labelKey, icon: Icon }) => (
                    <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Icon size={12} className="text-slate-400" />
                        <p className="text-[10px] text-slate-400">{t(`${S}.${labelKey}`)}</p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{row[key] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600">{t(`${S}.teamSize`)}</span>
                  <span className="text-sm font-semibold text-indigo-700">{row.totalTeamSize || 0}{t(`${S}.people`)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
