import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '@/components/ui/CrudPage';
import GenericForm from '@/components/ui/GenericForm';
import * as employeeApi from '@/api/employee';
import * as orgUnitApi from '@/api/orgUnit';
import { useDictOptions } from '@/hooks/useDictOptions';

const api = {
  list: employeeApi.listEmployee,
  get: employeeApi.getEmployee,
  add: employeeApi.addEmployee,
  update: employeeApi.updateEmployee,
  remove: employeeApi.delEmployee,
};

function flattenDeptTree(nodes: any[] = [], level = 0): Array<{ value: string; label: string }> {
  return nodes.flatMap((node) => {
    const label = `${'  '.repeat(level)}${node.label || node.deptName || node.name || node.id}`;
    const current = [{ value: String(node.id || node.deptId || node.value), label }];
    const children = flattenDeptTree(node.children || [], level + 1);
    return [...current, ...children];
  });
}

function flattenOrgTree(items: any[], parentId: number = 0, prefix: string = ''): Array<{ value: string; label: string }> {
  return items
    .filter((item: any) => item.parentId === parentId)
    .flatMap((item: any) => [
      { value: String(item.id), label: prefix + (item.orgName || item.label || '') },
      ...flattenOrgTree(items, item.id, prefix + '  '),
    ]);
}

function orgNameById(items: any[], id: number): string {
  if (!id) return '-';
  const match = items.find((o: any) => o.id === id);
  return match ? match.orgName : String(id);
}

export default function EmployeePage() {
  const { t } = useTranslation();
  const [orgItems, setOrgItems] = useState<any[]>([]);

  useEffect(() => {
    orgUnitApi.listOrgUnit({ pageNum: 1, pageSize: 999 }).then((res: any) => {
      setOrgItems(res.rows || []);
    });
  }, []);

  const employeeStatus = useDictOptions('sys_common_status', [
    { value: '0', label: t('page.employee.status.employed') },
    { value: '1', label: t('page.employee.status.left') },
  ]);

  const skillLevel = useDictOptions('erp_skill_level');
  const pieceCategory = useDictOptions('erp_piece_category');

  const orgOptions = useMemo(() => flattenOrgTree(orgItems), [orgItems]);
  const workshopOptions = useMemo(
    () => orgItems.filter((i: any) => i.orgType === 'WORKSHOP').map((i: any) => ({ value: String(i.id), label: i.orgName })),
    [orgItems]
  );

  // Cascade state: tracks selected parent to compute child options
  const [cascadeWs, setCascadeWs] = useState<number>(0);
  const [cascadeTeam, setCascadeTeam] = useState<number>(0);
  const [cascadeSt, setCascadeSt] = useState<number>(0);

  const cascadeTeamOptions = useMemo(
    () => {
      const options = orgItems
        .filter((i: any) => i.parentId === cascadeWs && i.orgType === 'TEAM')
        .map((i: any) => ({ value: String(i.id), label: i.orgName }));
      // Edit backfill: include currently selected team even if cascadeWs hasn't caught up yet
      if (cascadeTeam > 0 && !options.some(o => o.value === String(cascadeTeam))) {
        const item = orgItems.find((i: any) => i.id === cascadeTeam && i.orgType === 'TEAM');
        if (item) options.unshift({ value: String(item.id), label: item.orgName });
      }
      return options;
    },
    [orgItems, cascadeWs, cascadeTeam]
  );
  const cascadeStationOptions = useMemo(
    () => {
      const options = orgItems
        .filter((i: any) => i.parentId === cascadeTeam && i.orgType === 'STATION')
        .map((i: any) => ({ value: String(i.id), label: i.orgName }));
      if (cascadeSt > 0 && !options.some(o => o.value === String(cascadeSt))) {
        const item = orgItems.find((i: any) => i.id === cascadeSt && i.orgType === 'STATION');
        if (item) options.unshift({ value: String(item.id), label: item.orgName });
      }
      return options;
    },
    [orgItems, cascadeTeam, cascadeSt]
  );

  const handleWsChange = useCallback(
    (_name: string, value: string, setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => {
      const numVal = Number(value) || 0;
      setCascadeWs(numVal);
      setCascadeTeam(0);
      setCascadeSt(0);
      setForm((prev) => ({ ...prev, workshopId: value, teamId: '', stationId: '' }));
    },
    []
  );
  const handleTeamChange = useCallback(
    (_name: string, value: string, setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => {
      const numVal = Number(value) || 0;
      setCascadeTeam(numVal);
      setCascadeSt(0);
      setForm((prev) => ({ ...prev, teamId: value, stationId: '' }));
    },
    []
  );
  const handleOrgUnitChange = useCallback(
    (_name: string, value: string, setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => {
      setCascadeWs(0);
      setCascadeTeam(0);
      setCascadeSt(0);
      setForm((prev) => ({ ...prev, orgUnitId: value, workshopId: '', teamId: '', stationId: '' }));
    },
    []
  );
  const handleStationChange = useCallback(
    (_name: string, value: string, setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void) => {
      setCascadeSt(Number(value) || 0);
      setForm((prev) => ({ ...prev, stationId: value }));
    },
    []
  );

  const columns = useMemo(() => ([
    { key: 'employeeName', title: t('page.employee.columns.employeeName') },
    { key: 'employeeCode', title: t('page.employee.columns.employeeNo') },
    {
      key: 'department',
      title: t('page.employee.columns.department'),
      render: (_: string, record: any) => record.deptName || record.department || '-',
    },
    {
      key: 'orgUnitId',
      title: t('page.employee.columns.orgNode'),
      render: (value: number) => orgNameById(orgItems, value),
    },
    {
      key: 'workshopId',
      title: t('page.employee.columns.workshop'),
      render: (value: number) => orgNameById(orgItems, value),
    },
    {
      key: 'teamId',
      title: t('page.employee.columns.team'),
      render: (value: number) => orgNameById(orgItems, value),
    },
    {
      key: 'stationId',
      title: t('page.employee.columns.station'),
      render: (value: number) => orgNameById(orgItems, value),
    },
    {
      key: 'skillLevel',
      title: t('page.employee.columns.skillLevel'),
      render: (value: string) => {
        const tag = value ? skillLevel.toLabel(value) : null;
        return tag || '-';
      },
    },
    {
      key: 'pieceCategory',
      title: t('page.employee.columns.pieceCategory'),
      render: (value: string) => {
        const tag = value ? pieceCategory.toLabel(value) : null;
        return tag || '-';
      },
    },
    {
      key: 'crossWorkshop',
      title: t('page.employee.columns.crossWorkshop'),
      render: (value: boolean) => value ? t('page.employee.columns.yes') : t('page.employee.columns.no'),
    },
    {
      key: 'qualification',
      title: t('page.employee.columns.qualification'),
    },
    { key: 'phone', title: t('page.employee.columns.phone') },
    { key: 'entryDate', title: t('page.employee.columns.entryDate') },
    {
      key: 'status',
      title: t('page.employee.columns.status'),
      render: (value: string) => {
        const tag = employeeStatus.toTag(value);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tag.color}`}>{tag.label}</span>;
      },
    },
  ]), [employeeStatus, skillLevel, pieceCategory, orgItems, t]);

  const searchFields = [
    { name: 'employeeName', label: t('page.employee.columns.employeeName') },
    { name: 'employeeCode', label: t('page.employee.columns.employeeNo') },
    { name: 'department', label: t('page.employee.columns.department') },
    { name: 'orgUnitId', label: t('page.employee.columns.orgNode'), type: 'select' as const, options: orgOptions },
    { name: 'workshopId', label: t('page.employee.columns.workshop'), type: 'select' as const, options: workshopOptions },
  ];

  const formFields = [
    { name: 'employeeName', label: t('page.employee.columns.employeeName'), required: true },
    { name: 'employeeCode', label: t('page.employee.columns.employeeNo'), required: true },
    {
      name: 'deptId',
      label: t('page.employee.columns.department'),
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await employeeApi.listEmployeeDeptOptions();
        return flattenDeptTree(res.data || []);
      },
    },
    {
      name: 'postId',
      label: t('page.employee.columns.position'),
      type: 'select' as const,
      loadOptions: async () => {
        const res: any = await employeeApi.listEmployeePostOptions();
        return (res.data || []).map((item: any) => ({
          value: String(item.postId),
          label: item.postName || item.postCode || String(item.postId),
        }));
      },
    },
    {
      name: 'orgUnitId',
      label: t('page.employee.columns.orgNode'),
      type: 'select' as const,
      options: orgOptions,
      onFieldChange: handleOrgUnitChange,
    },
    {
      name: 'workshopId',
      label: t('page.employee.columns.workshop'),
      type: 'select' as const,
      options: workshopOptions,
      onFieldChange: handleWsChange,
    },
    {
      name: 'teamId',
      label: t('page.employee.columns.team'),
      type: 'select' as const,
      getOptions: () => cascadeTeamOptions,
      onFieldChange: handleTeamChange,
    },
    {
      name: 'stationId',
      label: t('page.employee.columns.station'),
      type: 'select' as const,
      getOptions: () => cascadeStationOptions,
      onFieldChange: handleStationChange,
    },
    {
      name: 'skillLevel',
      label: t('page.employee.columns.skillLevel'),
      type: 'select' as const,
      options: skillLevel.options,
    },
    {
      name: 'pieceCategory',
      label: t('page.employee.columns.pieceCategory'),
      type: 'select' as const,
      options: pieceCategory.options,
    },
    {
      name: 'crossWorkshop',
      label: t('page.employee.columns.crossWorkshop'),
      type: 'select' as const,
      options: [
        { value: '0', label: t('page.employee.columns.no') },
        { value: '1', label: t('page.employee.columns.yes') },
      ],
    },
    {
      name: 'qualification',
      label: t('page.employee.columns.qualification'),
      type: 'textarea' as const,
    },
    { name: 'phone', label: t('page.employee.columns.phone') },
    { name: 'entryDate', label: t('page.employee.columns.entryDate'), type: 'date' as const },
    { name: 'status', label: t('page.employee.columns.status'), type: 'select' as const, options: employeeStatus.options },
    { name: 'remark', label: t('page.employee.columns.remark'), type: 'textarea' as const },
  ];

  // Separate component to satisfy Rules of Hooks (useEffect on initialValues)
  const FormInner = useCallback(
    ({ initialValues, onSubmit, onCancel }: { initialValues?: any; onSubmit: (v: any) => void; onCancel: () => void }) => {
      useEffect(() => {
        if (initialValues) {
          setCascadeWs(Number(initialValues.workshopId) || 0);
          setCascadeTeam(Number(initialValues.teamId) || 0);
          setCascadeSt(Number(initialValues.stationId) || 0);
        } else {
          setCascadeWs(0);
          setCascadeTeam(0);
          setCascadeSt(0);
        }
      }, [initialValues]);
      return <GenericForm fields={formFields} initialValues={initialValues} onSubmit={onSubmit} onCancel={onCancel} />;
    },
    [formFields]
  );

  return (
    <CrudPage
      title={t('page.employee.title')}
      api={api}
      columns={columns}
      searchFields={searchFields}
      rowKey="id"
      FormComponent={FormInner}
    />
  );
}
