import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as processRouteApi from '@/api/processRoute';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: processRouteApi.listProcessRoute,
  get: processRouteApi.getProcessRoute,
  add: processRouteApi.addProcessRoute,
  update: processRouteApi.updateProcessRoute,
  remove: processRouteApi.delProcessRoute,
};

export default function ProcessRoutePage() {
  const processStatus = useDictOptions('erp_process_status', [
    { value: '0', label: '草稿' },
    { value: '1', label: '已发布' },
  ]);

  const columns = [
    { key: 'routeName', title: '工艺路线名称' },
    { key: 'routeCode', title: '路线编码' },
    { key: 'styleCode', title: '款号' },
    { key: 'processCount', title: '工序数' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = processStatus.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
    { key: 'createTime', title: '创建时间' },
  ];

  const searchFields = [
    { name: 'routeName', label: '工艺路线名称' },
    { name: 'styleCode', label: '款号' },
    { name: 'status', label: '状态', type: 'select' as const, options: processStatus.options },
  ];

  const formFields = [
    { name: 'routeName', label: '工艺路线名称', required: true },
    { name: 'routeCode', label: '路线编码' },
    { name: 'styleCode', label: '款号' },
    { name: 'status', label: '状态', type: 'select' as const, options: processStatus.options },
    { name: 'remark', label: '备注', type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title="工艺路线"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
