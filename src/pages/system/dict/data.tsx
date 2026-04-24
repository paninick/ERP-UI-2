import {useMemo} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as dictApi from '@/api/dict';

const STATUS_OPTIONS = [
  {value: '0', label: '正常'},
  {value: '1', label: '停用'},
];

const columns = [
  {key: 'dictCode', title: '字典编码', width: '100px'},
  {key: 'dictSort', title: '字典排序', width: '100px'},
  {key: 'dictLabel', title: '字典标签'},
  {key: 'dictValue', title: '字典键值'},
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
  {key: 'cssClass', title: '样式属性'},
  {key: 'listClass', title: '回显样式'},
  {key: 'remark', title: '备注'},
];

const formFields = [
  {name: 'dictSort', label: '字典排序', type: 'number' as const, required: true},
  {name: 'dictLabel', label: '字典标签', required: true},
  {name: 'dictValue', label: '字典键值', required: true},
  {name: 'cssClass', label: '样式属性'},
  {name: 'listClass', label: '回显样式'},
  {
    name: 'status',
    label: '状态',
    type: 'select' as const,
    options: STATUS_OPTIONS,
  },
  {name: 'remark', label: '备注', type: 'textarea' as const},
];

export default function SystemDictDataPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {dictId = ''} = useParams();

  const meta = (location.state || {}) as {dictName?: string; dictType?: string};

  const api = useMemo(() => ({
    list: (params: any) => dictApi.listDictData({...params, dictType: meta.dictType}),
    get: dictApi.getDictData,
    add: (data: any) => dictApi.addDictData({...data, dictType: meta.dictType}),
    update: dictApi.updateDictData,
    remove: dictApi.delDictData,
  }), [meta.dictType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/system/dict')}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">字典数据</h2>
          <p className="text-sm text-slate-500">
            {meta.dictName || `字典 ${dictId}`}{meta.dictType ? ` · ${meta.dictType}` : ''}
          </p>
        </div>
      </div>

      <CrudPage
        title="字典数据明细"
        api={api}
        columns={columns}
        rowKey="dictCode"
        searchFields={[
          {name: 'dictLabel', label: '字典标签'},
          {name: 'dictValue', label: '字典键值'},
          {
            name: 'status',
            label: '状态',
            type: 'select' as const,
            options: STATUS_OPTIONS,
          },
        ]}
        FormComponent={(props) => (
          <GenericForm
            {...props}
            fields={formFields}
            initialValues={{
              status: '0',
              ...props.initialValues,
            }}
          />
        )}
      />
    </div>
  );
}
