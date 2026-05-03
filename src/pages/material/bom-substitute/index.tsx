import { useMemo, useState } from 'react';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import * as bomSubstituteApi from '@/api/bomSubstitute';

const api = {
  list: bomSubstituteApi.listBomSubstitute,
  get: bomSubstituteApi.getBomSubstitute,
  add: bomSubstituteApi.addBomSubstitute,
  update: bomSubstituteApi.updateBomSubstitute,
  remove: bomSubstituteApi.delBomSubstitute,
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
  PENDING: { label: '待审批', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '已通过', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: '已驳回', color: 'bg-red-100 text-red-700' },
  VOIDED: { label: '已作废', color: 'bg-slate-200 text-slate-600' },
};

function renderStatus(value: string) {
  const meta = STATUS_META[value] || { label: value || '-', color: 'bg-slate-100 text-slate-600' };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>;
}

export default function BomSubstitutePage() {
  const [tableKey, setTableKey] = useState(0);

  const refreshTable = () => setTableKey((prev) => prev + 1);

  const fields = useMemo(
    () => [
      { name: 'bomId', label: 'BOM ID', type: 'number' as const, required: true, group: '来源BOM' },
      { name: 'originalMaterialType', label: '原料类型', type: 'select' as const, required: true, group: '原料信息', options: [
        { value: 'MAIN', label: '主料' },
        { value: 'AUX', label: '辅料' },
      ] },
      { name: 'originalMaterialId', label: '原料ID', type: 'number' as const, required: true, group: '原料信息' },
      { name: 'substituteMaterialType', label: '替代料类型', type: 'select' as const, required: true, group: '替代料信息', options: [
        { value: 'MAIN', label: '主料' },
        { value: 'AUX', label: '辅料' },
      ] },
      { name: 'substituteMaterialId', label: '替代料ID', type: 'number' as const, required: true, group: '替代料信息' },
      { name: 'scopeType', label: '生效范围', type: 'select' as const, required: true, group: '范围与原因', options: [
        { value: 'BOM', label: '整张BOM' },
        { value: 'ORDER', label: '订单级' },
        { value: 'PLAN', label: '计划级' },
        { value: 'BATCH', label: '批次级' },
      ] },
      { name: 'scopeRefId', label: '范围ID', type: 'number' as const, group: '范围与原因' },
      { name: 'applyReason', label: '申请原因', type: 'textarea' as const, required: true, group: '范围与原因' },
      { name: 'remark', label: '备注', type: 'textarea' as const },
    ],
    [],
  );

  const handleAction = async (
    record: any,
    action: 'submit' | 'approve' | 'reject' | 'void',
  ) => {
    const labelMap = {
      submit: '提交审批',
      approve: '审批通过',
      reject: '审批驳回',
      void: '作废替代关系',
    };
    if (!(await confirm(`确认${labelMap[action]}？记录 #${record.id || '-'} / ${record.originalMaterialName || record.originalMaterialCode || '-'}`))) {
      return;
    }
    try {
      if (action === 'submit') {
        await bomSubstituteApi.submitBomSubstitute(record.id);
      } else if (action === 'approve') {
        await bomSubstituteApi.approveBomSubstitute(record.id);
      } else if (action === 'reject') {
        await bomSubstituteApi.rejectBomSubstitute(record.id);
      } else {
        await bomSubstituteApi.voidBomSubstitute(record.id);
      }
      toast.success(`${labelMap[action]}成功`);
      refreshTable();
    } catch (error: any) {
      toast.error(error.message || `${labelMap[action]}失败`);
    }
  };

  return (
    <CrudPage
      key={tableKey}
      title="BOM 替代料申请"
      api={api}
      columns={[
        { key: 'bomId', title: 'BOM ID' },
        { key: 'bomSampleNo', title: '打样编号' },
        { key: 'styleCode', title: '款号' },
        { key: 'originalMaterialCode', title: '原料编码' },
        { key: 'originalMaterialName', title: '原料名称' },
        { key: 'substituteMaterialCode', title: '替代料编码' },
        { key: 'substituteMaterialName', title: '替代料名称' },
        { key: 'scopeType', title: '生效范围' },
        { key: 'applyReason', title: '申请原因' },
        { key: 'status', title: '状态', render: (value: string) => renderStatus(value) },
      ]}
      searchFields={[
        { name: 'bomId', label: 'BOM ID' },
        { name: 'styleCode', label: '款号' },
        { name: 'status', label: '状态', type: 'select', options: Object.keys(STATUS_META).map((key) => ({ value: key, label: STATUS_META[key].label })) },
      ]}
      FormComponent={(props) => <GenericForm {...props} fields={fields} />}
      isEditDisabled={(record) => !['DRAFT', 'REJECTED'].includes(String(record.status || ''))}
      isDeleteDisabled={(record) => !['DRAFT', 'REJECTED'].includes(String(record.status || ''))}
      extraActions={(record) => (
        <>
          {['DRAFT', 'REJECTED'].includes(String(record.status || '')) && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAction(record, 'submit');
              }}
              className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              提交
            </button>
          )}
          {String(record.status || '') === 'PENDING' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAction(record, 'approve');
              }}
              className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              通过
            </button>
          )}
          {String(record.status || '') === 'PENDING' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAction(record, 'reject');
              }}
              className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
            >
              驳回
            </button>
          )}
          {String(record.status || '') === 'APPROVED' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAction(record, 'void');
              }}
              className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              作废
            </button>
          )}
        </>
      )}
    />
  );
}
