import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as dictApi from '@/api/dict';

export default function SystemDictDataPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { dictId = '' } = useParams();

  const meta = (location.state || {}) as { dictName?: string; dictType?: string };

  const statusOptions = [
    { value: '0', label: '正常' },
    { value: '1', label: '停用' },
  ];

  const api = useMemo(() => ({
    list: (params: any) => dictApi.listDictData({ ...params, dictType: meta.dictType }),
    get: dictApi.getDictData,
    add: (data: any) => dictApi.addDictData({ ...data, dictType: meta.dictType }),
    update: dictApi.updateDictData,
    remove: dictApi.delDictData,
  }), [meta.dictType]);

  const columns = [
    { key: 'dictCode', title: '字典编码', width: '100px' },
    { key: 'dictSort', title: '排序', width: '100px' },
    { key: 'dictLabel', title: '标签' },
    { key: 'dictValue', title: '键值' },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const isNormal = value === '0';
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isNormal ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isNormal ? '正常' : '停用'}
          </span>
        );
      },
    },
    { key: 'cssClass', title: '样式类' },
    { key: 'listClass', title: '列表样式' },
    { key: 'remark', title: t('common.remark') },
  ];

  const formFields = [
    { name: 'dictSort', label: '排序', type: 'number' as const, required: true },
    { name: 'dictLabel', label: '标签', required: true },
    { name: 'dictValue', label: '键值', required: true },
    { name: 'cssClass', label: '样式类' },
    { name: 'listClass', label: '列表样式' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusOptions,
    },
    { name: 'remark', label: t('common.remark'), type: 'textarea' as const },
  ];

  const searchFields = [
    { name: 'dictLabel', label: '标签' },
    { name: 'dictValue', label: '键值' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusOptions,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/system/dict')}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">字典数据</h2>
          <p className="text-sm text-slate-500">
            {meta.dictName || `字典 ${dictId}`}
            {meta.dictType ? ` / ${meta.dictType}` : ''}
          </p>
        </div>
      </div>

      <CrudPage
        title="字典数据明细"
        api={api}
        columns={columns}
        rowKey="dictCode"
        searchFields={searchFields}
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
