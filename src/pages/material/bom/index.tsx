import {useNavigate} from 'react-router-dom';
import CrudPage from '@/components/ui/CrudPage';
import * as bomApi from '@/api/bom';
import {useDictOptions} from '@/hooks/useDictOptions';
import BomForm from './form';

const api = {
  list: bomApi.listBom,
  get: bomApi.getBom,
  add: bomApi.addBom,
  update: bomApi.updateBom,
  remove: bomApi.delBom,
};

export default function BomPage() {
  const navigate = useNavigate();
  const styleType = useDictOptions('erp_sample_style');
  const auditStatus = useDictOptions('erp_sample_audit_status');

  return (
    <CrudPage
      title="样衣 BOM"
      api={api}
      columns={[
        {key: 'sampleNo', title: 'BOM 编号'},
        {key: 'customerName', title: '客户'},
        {key: 'styleCode', title: '款号'},
        {key: 'bulkOrderNo', title: '大货订单号'},
        {
          key: 'styleType',
          title: '款式大类',
          render: (value: string) => {
            const tag = styleType.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        {
          key: 'auditStatus',
          title: '审批状态',
          render: (value: string) => {
            const tag = auditStatus.toTag(value);
            return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
          },
        },
        {key: 'dueDate', title: '交期'},
        {key: 'salesName', title: '业务员'},
        {
          key: 'detail',
          title: '详情',
          width: '70px',
          render: (_value: any, record: any) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/material/bom/${record.id}`);
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              详情
            </button>
          ),
        },
      ]}
      searchFields={[
        {name: 'sampleNo', label: 'BOM 编号'},
        {name: 'styleCode', label: '款号'},
        {
          name: 'auditStatus',
          label: '审批状态',
          type: 'select',
          options: auditStatus.options,
        },
      ]}
      FormComponent={BomForm}
      extraActions={(record) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/material/bom/${record.id}`);
          }}
          className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
        >
          详情页
        </button>
      )}
    />
  );
}
