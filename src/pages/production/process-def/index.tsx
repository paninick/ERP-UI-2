import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as processDefApi from '@/api/processDef';
import {useDictOptions} from '@/hooks/useDictOptions';

const api = {
  list: processDefApi.listProcessDef,
  get: processDefApi.getProcessDef,
  add: processDefApi.addProcessDef,
  update: processDefApi.updateProcessDef,
  remove: processDefApi.delProcessDef,
};

const yesNoOptions = [
  {value: '0', label: '否'},
  {value: '1', label: '是'},
];

const fallbackProcessTypes = [
  {value: '0', label: '本厂工序'},
  {value: '1', label: '外协工序'},
];

const fallbackStatus = [
  {value: '0', label: '启用'},
  {value: '1', label: '停用'},
];

export default function ProcessDefPage() {
  const processType = useDictOptions('erp_process_type', fallbackProcessTypes);
  const status = useDictOptions('sys_normal_disable', fallbackStatus);

  const columns = [
    {key: 'processCode', title: '工序编码'},
    {key: 'processName', title: '工序名称'},
    {
      key: 'processType',
      title: '工序类型',
      render: (value: string) => processType.toTag(value).label,
    },
    {
      key: 'needQualityCheck',
      title: '需质检',
      render: (value: number | string) => (String(value ?? '0') === '1' ? '是' : '否'),
    },
    {
      key: 'enableOutsource',
      title: '可外协',
      render: (value: number | string) => (String(value ?? '0') === '1' ? '是' : '否'),
    },
    {key: 'defaultPrice', title: '默认工价'},
    {key: 'sortOrder', title: '排序'},
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    {name: 'processCode', label: '工序编码'},
    {name: 'processName', label: '工序名称'},
    {name: 'processType', label: '工序类型', type: 'select' as const, options: processType.options},
    {name: 'status', label: '状态', type: 'select' as const, options: status.options},
  ];

  const formFields = [
    {name: 'processCode', label: '工序编码', required: true},
    {name: 'processName', label: '工序名称', required: true},
    {name: 'processType', label: '工序类型', type: 'select' as const, options: processType.options, required: true},
    {name: 'needQualityCheck', label: '需质检', type: 'select' as const, options: yesNoOptions},
    {name: 'enableOutsource', label: '可外协', type: 'select' as const, options: yesNoOptions},
    {name: 'defaultPrice', label: '默认工价', type: 'number' as const},
    {name: 'sortOrder', label: '排序', type: 'number' as const},
    {name: 'isSpliceProcess', label: '拼接工序', type: 'select' as const, options: yesNoOptions},
    {name: 'seamWidth', label: '拼缝宽度(mm)', type: 'number' as const},
    {name: 'shrinkageBaseline', label: '缩水基线(%)', type: 'number' as const},
    {name: 'elasticityCompensation', label: '弹力补偿(%)', type: 'number' as const},
    {name: 'spliceDirection', label: '拼接方向'},
    {name: 'fabricCompatibility', label: '面料兼容说明', type: 'textarea' as const},
    {name: 'status', label: '状态', type: 'select' as const, options: status.options},
    {name: 'remark', label: '备注', type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title="工序定义"
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
