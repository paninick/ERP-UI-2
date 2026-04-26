import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import { useDictOptions } from '@/hooks/useDictOptions';
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
  const { t } = useTranslation();
  const sampleType = useDictOptions('erp_sample_type');
  const taskStatus = useDictOptions('erp_sample_task_status');

  const formFields = [
    { name: 'noticeNo', label: t('page.notice.form.noticeNo'), required: true },
    { name: 'customerName', label: t('page.notice.form.customerName') },
    { name: 'styleCode', label: t('page.notice.form.styleCode'), required: true },
    { name: 'sampleType', label: t('page.notice.form.sampleType'), type: 'select' as const, options: sampleType.options },
    { name: 'quantity', label: t('page.notice.form.quantity'), type: 'number' as const },
    { name: 'dueDate', label: t('page.notice.form.dueDate'), type: 'date' as const },
    {
      name: 'status',
      label: t('page.notice.form.status'),
      type: 'select' as const,
      options: taskStatus.options,
    },
    { name: 'remark', label: t('page.notice.form.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('page.notice.title')}
      api={api}
      columns={[
        { key: 'noticeNo', title: t('page.notice.columns.noticeNo') },
        { key: 'customerName', title: t('page.notice.columns.customerName') },
        { key: 'styleCode', title: t('page.notice.columns.styleCode') },
        {
          key: 'sampleType',
          title: t('page.notice.columns.sampleType'),
          render: (value: string) => sampleType.labelMap[String(value)] || value || '-',
        },
        { key: 'quantity', title: t('page.notice.columns.quantity') },
        { key: 'dueDate', title: t('page.notice.columns.dueDate') },
        {
          key: 'status',
          title: t('page.notice.columns.status'),
          render: (value: string) => {
            const tag = taskStatus.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        { key: 'createTime', title: t('page.notice.columns.createTime') },
        {
          key: 'detail',
          title: t('page.notice.columns.detail'),
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
              {t('common.detail')}
            </button>
          ),
        },
      ]}
      searchFields={[
        { name: 'noticeNo', label: t('page.notice.columns.noticeNo') },
        { name: 'styleCode', label: t('page.notice.columns.styleCode') },
        {
          name: 'status',
          label: t('page.notice.columns.status'),
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
          {t('page.notice.actions.detailPage')}
        </button>
      )}
    />
  );
}
