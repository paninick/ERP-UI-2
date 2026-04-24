import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import * as productionApi from '@/api/production';
import { useDictOptions } from '@/hooks/useDictOptions';
import JobForm from './JobForm';

const api = {
  list: productionApi.listProduceJob,
  get: productionApi.getProduceJob,
  add: productionApi.addProduceJob,
  update: productionApi.updateProduceJob,
  remove: productionApi.delProduceJob,
};

export default function ProduceJobPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [tableKey, setTableKey] = useState(0);

  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待生产' },
    { value: '1', label: '生产中' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
  ]);

  const columns = [
    { key: 'jobNo', title: t('page.job.columns.jobNo') },
    { key: 'planNo', title: t('page.job.columns.planNo') },
    { key: 'salesNo', title: t('page.job.columns.salesNo') },
    { key: 'styleCode', title: t('page.job.columns.styleCode') },
    { key: 'colorCode', title: t('page.job.columns.colorCode') },
    { key: 'sizeCode', title: t('page.job.columns.sizeCode') },
    { key: 'planQty', title: t('page.job.columns.planQty') },
    { key: 'actualQty', title: t('page.job.columns.actualQty') },
    { key: 'defectQty', title: t('page.job.columns.defectQty') },
    {
      key: 'status',
      title: t('page.job.columns.status'),
      render: (value: string) => {
        const tag = planStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'jobNo', label: t('page.job.columns.jobNo') },
    { name: 'salesNo', label: t('page.job.columns.salesNo') },
    { name: 'styleCode', label: t('page.job.columns.styleCode') },
    { name: 'status', label: t('page.job.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  const handleInitProcesses = async (record: any) => {
    const routeId = record.processRouteId;
    if (!routeId) {
      toast.error(t('page.job.toasts.routeMissing'));
      return;
    }

    const confirmed = await confirm(
      t('page.job.confirmInit', { jobNo: record.jobNo }),
    );
    if (!confirmed) {
      return;
    }

    setLoading((prev) => ({ ...prev, [record.id]: true }));
    try {
      await productionApi.initJobProcesses(record.id, Number(routeId));
      toast.success(t('page.job.toasts.initSuccess'));
      setTableKey((prev) => prev + 1);
    } catch {
      toast.error(t('page.job.toasts.initFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title={t('page.job.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={JobForm}
      extraActions={(record: any) => (
        <>
          <NavLink
            to={`/production/job/print/${record.id}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t('common.print')}
          </NavLink>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleInitProcesses(record);
            }}
            disabled={loading[record.id]}
            className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            {loading[record.id] ? t('page.job.initializing') : t('page.job.initProcess')}
          </button>
        </>
      )}
    />
  );
}
