import { useTranslation } from 'react-i18next';
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

export default function ProcessDefPage() {
  const { t } = useTranslation();
  const processType = useDictOptions('erp_process_type', [
    {value: '0', label: '本厂工序'},
    {value: '1', label: '外协工序'},
  ]);
  const status = useDictOptions('sys_normal_disable', [
    {value: '0', label: '启用'},
    {value: '1', label: '停用'},
  ]);
  const yesNoOptions = [
    {value: '0', label: t('common.no')},
    {value: '1', label: t('common.yes')},
  ];

  const columns = [
    {key: 'processCode', title: t('processDef.processCode')},
    {key: 'processName', title: t('processDef.processName')},
    {
      key: 'processType',
      title: t('processDef.processType'),
      render: (value: string) => processType.toTag(value).label,
    },
    {
      key: 'needQualityCheck',
      title: t('processDef.needQualityCheck'),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {
      key: 'enableOutsource',
      title: t('processDef.enableOutsource'),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {key: 'defaultPrice', title: t('processDef.defaultPrice')},
    {key: 'sortOrder', title: t('processDef.sortOrder')},
    {
      key: 'status',
      title: t('processDef.status'),
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    {name: 'processCode', label: t('processDef.processCode')},
    {name: 'processName', label: t('processDef.processName')},
    {name: 'processType', label: t('processDef.processType'), type: 'select' as const, options: processType.options},
    {name: 'status', label: t('processDef.status'), type: 'select' as const, options: status.options},
  ];

  const formFields = [
    {name: 'processCode', label: t('processDef.processCode'), required: true},
    {name: 'processName', label: t('processDef.processName'), required: true},
    {name: 'processType', label: t('processDef.processType'), type: 'select' as const, options: processType.options, required: true},
    {name: 'needQualityCheck', label: t('processDef.needQualityCheck'), type: 'select' as const, options: yesNoOptions},
    {name: 'enableOutsource', label: t('processDef.enableOutsource'), type: 'select' as const, options: yesNoOptions},
    {name: 'defaultPrice', label: t('processDef.defaultPrice'), type: 'number' as const},
    {name: 'sortOrder', label: t('processDef.sortOrder'), type: 'number' as const},
    {name: 'isSpliceProcess', label: t('processDef.isSpliceProcess'), type: 'select' as const, options: yesNoOptions},
    {name: 'seamWidth', label: t('processDef.seamWidth'), type: 'number' as const},
    {name: 'shrinkageBaseline', label: t('processDef.shrinkageBaseline'), type: 'number' as const},
    {name: 'elasticityCompensation', label: t('processDef.elasticityCompensation'), type: 'number' as const},
    {name: 'spliceDirection', label: t('processDef.spliceDirection')},
    {name: 'fabricCompatibility', label: t('processDef.fabricCompatibility'), type: 'textarea' as const},
    {name: 'status', label: t('processDef.status'), type: 'select' as const, options: status.options},
    {name: 'remark', label: t('processDef.remark'), type: 'textarea' as const},
  ];

  return (
    <CrudPage
      title={t('processDef.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={(props) => <GenericForm {...props} fields={formFields} />}
    />
  );
}
