import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as dictApi from '@/api/dict';

const api = {
  list: dictApi.listDictType,
  get: dictApi.getDictType,
  add: dictApi.addDictType,
  update: dictApi.updateDictType,
  remove: dictApi.delDictType,
};

export default function SystemDictPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const statusOptions = [
    { value: '0', label: t('common.normal', '正常') },
    { value: '1', label: t('common.disabled', '停用') },
  ];

  const columns = [
    { key: 'dictId', title: t('systemDict.dictName'), width: '100px' },
    { key: 'dictName', title: t('systemDict.dictName') },
    { key: 'dictType', title: t('systemDict.dictType') },
    {
      key: 'status',
      title: t('systemDict.status'),
      render: (value: string) => {
        const isNormal = value === '0';
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isNormal ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isNormal ? t('common.normal', '正常') : t('common.disabled', '停用')}
          </span>
        );
      },
    },
    { key: 'remark', title: t('systemDict.remark') },
    { key: 'createTime', title: t('common.createTime') },
  ];

  const searchFields = [
    { name: 'dictName', label: t('systemDict.dictName') },
    { name: 'dictType', label: t('systemDict.dictType') },
    {
      name: 'status',
      label: t('systemDict.status'),
      type: 'select' as const,
      options: statusOptions,
    },
  ];

  const formFields = [
    { name: 'dictName', label: t('systemDict.dictName'), required: true },
    { name: 'dictType', label: t('systemDict.dictType'), required: true },
    {
      name: 'status',
      label: t('systemDict.status'),
      type: 'select' as const,
      options: statusOptions,
    },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];

  return (
    <CrudPage
      title={t('systemDict.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      rowKey="dictId"
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
      extraActions={(record) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/system/dict-data/${record.dictId}`, {
              state: {
                dictName: record.dictName,
                dictType: record.dictType,
              },
            });
          }}
          className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
        >
          {t('systemDict.dataButton')}
        </button>
      )}
    />
  );
}
