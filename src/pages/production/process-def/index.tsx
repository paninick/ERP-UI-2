import { useEffect, useState } from 'react';
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
  const S = 'page.processDef';
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
  const workshopTypeOptions = [
    {value: 'KNITTING', label: '横机'},
    {value: 'LINKING', label: '套口'},
    {value: 'SEWING', label: '缝制'},
    {value: 'WASHING', label: '水洗'},
    {value: 'IRONING', label: '整烫'},
    {value: 'QC', label: '质检'},
    {value: 'PACKING', label: '包装'},
    {value: 'OUTSOURCE', label: '外协'},
  ];

  const columns = [
    {key: 'processCode', title: t(`${S}.processCode`)},
    {key: 'processName', title: t(`${S}.processName`)},
    {
      key: 'processType',
      title: t(`${S}.processType`),
      render: (value: string) => processType.toTag(value).label,
    },
    {
      key: 'workshopType',
      title: t(`${S}.workshopType`),
      render: (value: string) => workshopTypeOptions.find((item) => item.value === value)?.label || value || '-',
    },
    {
      key: 'qcRequired',
      title: t(`${S}.qcRequired`),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {
      key: 'lossTracked',
      title: t(`${S}.lossTracked`),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {
      key: 'pieceWageApplicable',
      title: t(`${S}.pieceWageApplicable`),
      render: (value: number | string) => (String(value ?? '0') === '1' ? t('common.yes') : t('common.no')),
    },
    {key: 'defaultPrice', title: t(`${S}.defaultPrice`)},
    {key: 'sortOrder', title: t(`${S}.sortOrder`)},
    {
      key: 'status',
      title: t(`${S}.status`),
      render: (value: string) => {
        const tag = status.toTag(value, 'bg-slate-100 text-slate-600');
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ];

  const searchFields = [
    {name: 'processCode', label: t(`${S}.processCode`)},
    {name: 'processName', label: t(`${S}.processName`)},
    {name: 'processType', label: t(`${S}.processType`), type: 'select' as const, options: processType.options},
    {name: 'status', label: t(`${S}.status`), type: 'select' as const, options: status.options},
  ];

  const formFields = [
    {name: 'processCode', label: t(`${S}.processCode`), required: true, group: t(`${S}.groups.basic`)},
    {name: 'processName', label: t(`${S}.processName`), required: true, group: t(`${S}.groups.basic`)},
    {name: 'processType', label: t(`${S}.processType`), type: 'select' as const, options: processType.options, required: true, group: t(`${S}.groups.basic`)},
    {name: 'productFamily', label: t(`${S}.productFamily`), group: t(`${S}.groups.basic`)},
    {name: 'workshopType', label: t(`${S}.workshopType`), type: 'select' as const, options: workshopTypeOptions, group: t(`${S}.groups.character`)},
    {name: 'qcRequired', label: t(`${S}.qcRequired`), type: 'select' as const, options: yesNoOptions, group: t(`${S}.groups.character`)},
    {name: 'lossTracked', label: t(`${S}.lossTracked`), type: 'select' as const, options: yesNoOptions, group: t(`${S}.groups.character`)},
    {name: 'pieceWageApplicable', label: t(`${S}.pieceWageApplicable`), type: 'select' as const, options: yesNoOptions, group: t(`${S}.groups.character`)},
    {name: 'defaultPrice', label: t(`${S}.defaultPrice`), type: 'number' as const, group: t(`${S}.groups.character`)},
    {name: 'sortOrder', label: t(`${S}.sortOrder`), type: 'number' as const, group: t(`${S}.groups.character`)},
    {name: 'isSpliceProcess', label: t(`${S}.isSpliceProcess`), type: 'select' as const, options: yesNoOptions, group: t(`${S}.groups.fabric`)},
    {name: 'seamWidth', label: t(`${S}.seamWidth`), type: 'number' as const, group: t(`${S}.groups.fabric`)},
    {name: 'shrinkageBaseline', label: t(`${S}.shrinkageBaseline`), type: 'number' as const, group: t(`${S}.groups.fabric`)},
    {name: 'elasticityCompensation', label: t(`${S}.elasticityCompensation`), type: 'number' as const, group: t(`${S}.groups.fabric`)},
    {name: 'spliceDirection', label: t(`${S}.spliceDirection`), group: t(`${S}.groups.fabric`)},
    {name: 'fabricCompatibility', label: t(`${S}.fabricCompatibility`), type: 'textarea' as const, group: t(`${S}.groups.fabric`)},
    {name: 'status', label: t(`${S}.status`), type: 'select' as const, options: status.options, group: t(`${S}.groups.basic`)},
    {name: 'remark', label: t(`${S}.remark`), type: 'textarea' as const, group: t(`${S}.groups.remark`)},
  ];

  const ProcessDefForm = (props: {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
  }) => {
    const [nextCode, setNextCode] = useState('');

    useEffect(() => {
      if (props.initialValues?.id) {
        setNextCode('');
        return;
      }

      let cancelled = false;
      processDefApi.getNextProcessCode()
        .then((res: any) => {
          if (!cancelled) {
            setNextCode(res.data || 'GX001');
          }
        })
        .catch(() => {
          if (!cancelled) {
            setNextCode('GX001');
          }
        });
      return () => {
        cancelled = true;
      };
    }, [props.initialValues?.id]);

    if (!props.initialValues?.id && !nextCode) {
      return <div className="py-8 text-center text-sm text-slate-500">{t('common.loading')}</div>;
    }

    const initialValues = props.initialValues || {
      processCode: nextCode,
      status: '0',
      processType: '0',
      qcRequired: 0,
      lossTracked: 0,
      pieceWageApplicable: 1,
      isSpliceProcess: '0',
    };

    return <GenericForm {...props} initialValues={initialValues} fields={formFields} />;
  };

  return (
    <CrudPage
      title={t(`${S}.title`)}
      api={api}
      columns={columns}
      searchFields={searchFields}
      FormComponent={ProcessDefForm}
    />
  );
}
