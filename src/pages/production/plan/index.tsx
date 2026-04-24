import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import * as productionApi from '@/api/production';
import { useDictOptions } from '@/hooks/useDictOptions';
import PlanForm from './PlanForm';

const api = {
  list: productionApi.listProducePlan,
  get: productionApi.getProducePlan,
  add: productionApi.addProducePlan,
  update: productionApi.updateProducePlan,
  remove: productionApi.delProducePlan,
};

export default function ProducePlanPage() {
  const { t } = useTranslation();
  const planStatus = useDictOptions('erp_plan_status', [
    { value: '0', label: '待排产' },
    { value: '1', label: '已排产' },
    { value: '2', label: '生产中' },
    { value: '3', label: '已完成' },
  ]);

  const columns = [
    { key: 'planNo', title: t('page.plan.columns.planNo') },
    { key: 'salesNo', title: t('page.plan.columns.salesNo') },
    { key: 'styleCode', title: t('page.plan.columns.styleCode') },
    { key: 'planQty', title: t('page.plan.columns.planQty') },
    { key: 'planDate', title: t('page.plan.columns.planDate') },
    {
      key: 'status',
      title: t('page.plan.columns.status'),
      render: (value: string) => {
        const tag = planStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    { name: 'planNo', label: t('page.plan.columns.planNo') },
    { name: 'styleCode', label: t('page.plan.columns.styleCode') },
    { name: 'status', label: t('page.plan.columns.status'), type: 'select' as const, options: planStatus.options },
  ];

  return (
    <CrudPage
      title={t('page.plan.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={PlanForm}
      extraActions={(record: any) => (
        <NavLink
          to={`/production/plan/print/${record.id}`}
          onClick={(event) => event.stopPropagation()}
          className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
        >
          {t('common.print')}
        </NavLink>
      )}
    />
  );
}
