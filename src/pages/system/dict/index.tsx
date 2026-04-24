import {useNavigate} from 'react-router-dom';
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

const STATUS_OPTIONS = [
  {value: '0', label: '正常'},
  {value: '1', label: '停用'},
];

const columns = [
  {key: 'dictId', title: '字典编号', width: '100px'},
  {key: 'dictName', title: '字典名称'},
  {key: 'dictType', title: '字典类型'},
  {
    key: 'status',
    title: '状态',
    render: (value: string) => {
      const ok = value === '0';
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {ok ? '正常' : '停用'}
        </span>
      );
    },
  },
  {key: 'remark', title: '备注'},
  {key: 'createTime', title: '创建时间'},
];

const searchFields = [
  {name: 'dictName', label: '字典名称'},
  {name: 'dictType', label: '字典类型'},
  {
    name: 'status',
    label: '状态',
    type: 'select' as const,
    options: STATUS_OPTIONS,
  },
];

const formFields = [
  {name: 'dictName', label: '字典名称', required: true},
  {name: 'dictType', label: '字典类型', required: true},
  {
    name: 'status',
    label: '状态',
    type: 'select' as const,
    options: STATUS_OPTIONS,
  },
  {name: 'remark', label: '备注', type: 'textarea' as const},
];

export default function SystemDictPage() {
  const navigate = useNavigate();

  return (
    <CrudPage
      title="字典管理"
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
          数据
        </button>
      )}
    />
  );
}
