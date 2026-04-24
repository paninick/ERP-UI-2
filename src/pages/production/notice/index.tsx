import {useNavigate} from 'react-router-dom';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import {useDictOptions} from '@/hooks/useDictOptions';
import * as noticeApi from '@/api/notice';

const api = {
  list: noticeApi.listNotice,
  get: noticeApi.getNotice,
  add: noticeApi.addNotice,
  update: noticeApi.updateNotice,
  remove: noticeApi.delNotice,
};

export default function NoticePage() {
  const navigate = useNavigate();
  const sampleType = useDictOptions('erp_sample_type');
  const taskStatus = useDictOptions('erp_sample_task_status');

  const formFields = [
    {name: 'noticeNo', label: '通知编号', required: true},
    {name: 'customerName', label: '客户'},
    {name: 'styleCode', label: '款号', required: true},
    {name: 'sampleType', label: '打样类型', type: 'select' as const, options: sampleType.options},
    {name: 'quantity', label: '数量', type: 'number' as const},
    {name: 'dueDate', label: '交期', type: 'date' as const},
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: taskStatus.options,
    },
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="打样通知"
      api={api}
      columns={[
        {key: 'noticeNo', title: '通知编号'},
        {key: 'customerName', title: '客户'},
        {key: 'styleCode', title: '款号'},
        {
          key: 'sampleType',
          title: '打样类型',
          render: (value: string) => sampleType.labelMap[String(value)] || value || '-',
        },
        {key: 'quantity', title: '数量'},
        {key: 'dueDate', title: '交期'},
        {
          key: 'status',
          title: '状态',
          render: (value: string) => {
            const tag = taskStatus.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        {key: 'createTime', title: '创建时间'},
        {
          key: 'detail',
          title: '详情',
          width: '70px',
          render: (_value: any, record: any) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/production/notice/${record.id}`);
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              详情
            </button>
          ),
        },
      ]}
      searchFields={[
        {name: 'noticeNo', label: '通知编号'},
        {name: 'styleCode', label: '款号'},
        {
          name: 'status',
          label: '状态',
          type: 'select',
          options: taskStatus.options,
        },
      ]}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      extraActions={(record) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/production/notice/${record.id}`);
          }}
          className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
        >
          详情页
        </button>
      )}
    />
  );
}
