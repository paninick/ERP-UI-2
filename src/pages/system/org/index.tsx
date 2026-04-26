import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as orgApi from '@/api/orgUnit';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import { useDictOptions } from '@/hooks/useDictOptions';
import { Plus, Edit3, Trash2, ChevronRight, ChevronDown, Building2, Factory, Wrench, Users, Search, X } from 'lucide-react';

interface OrgNode { id: number; parentId: number; orgName: string; orgCode: string; orgType: string; factoryId: number; orderNum: number; leader: string; phone: string; status: string; remark: string; children: OrgNode[]; }

function buildTree(list: OrgNode[], parentId: number = 0): OrgNode[] {
  return list.filter(n => n.parentId === parentId).sort((a,b) => a.orderNum - b.orderNum).map(n => ({...n, children: buildTree(list, n.id)}));
}

const icn = (t: string) => {
  if (t==='HEAD_OFFICE') return <Building2 size={15} className="text-indigo-500"/>;
  if (t==='FACTORY') return <Factory size={15} className="text-amber-500"/>;
  if (t==='WORKSHOP') return <Wrench size={15} className="text-emerald-500"/>;
  return <Users size={15} className="text-slate-400"/>;
};

export default function OrgUnitPage() {
  const { t } = useTranslation();
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [flatList, setFlatList] = useState<OrgNode[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<OrgNode|null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const orgType = useDictOptions('erp_org_type');
  const factoryDict = useDictOptions('erp_factory');

  const loadData = useCallback(async () => {
    try { const res:any = await orgApi.listOrgUnit({}); const list:OrgNode[]=res.rows||[]; setFlatList(list); setTree(buildTree(list)); setExpanded(new Set([0,...list.map(n=>n.id)])); } catch { toast.error('加载失败'); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggle = (id:number) => { setExpanded(p=>{ const s=new Set(p); s.has(id)?s.delete(id):s.add(id); return s; }); };
  const selectNode = (n:OrgNode) => { setSelected(n); setEditing(false); };
  const startAdd = (parentId:number) => { setSelected(null); setEditing(true); setForm({parentId,orgName:'',orgCode:'',orgType:'DEPT',factoryId:null,orderNum:0,leader:'',phone:'',status:'0',remark:''}); };
  const startEdit = () => { if(!selected) return; setEditing(true); setForm({...selected}); };

  const handleSave = async () => {
    try { form.id ? await orgApi.updateOrgUnit(form) : await orgApi.addOrgUnit(form); toast.success('保存成功'); setEditing(false); loadData(); } catch { toast.error('保存失败'); }
  };

  const handleDelete = async () => {
    if(!selected) return;
    if(!(await confirm(`确定删除「${selected.orgName}」？`))) return;
    try { await orgApi.delOrgUnit(String(selected.id)); toast.success('已删除'); setSelected(null); loadData(); } catch { toast.error('删除失败'); }
  };

  const renderNode = (node:OrgNode, depth:number): any => {
    const open = expanded.has(node.id); const kids = node.children.length>0; const sel = selected?.id===node.id;
    const match = !search || node.orgName.includes(search) || (node.orgCode||'').includes(search);
    if (!match && !kids) return null;
    return (
      <div key={node.id}>
        <div className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-100 ${sel?'bg-indigo-50 text-indigo-700 font-medium':'text-slate-700'}`}
          style={{paddingLeft:`${depth*20+8}px`}} onClick={()=>selectNode(node)}>
          <span onClick={e=>{e.stopPropagation();toggle(node.id)}} className="flex items-center">
            {kids ? (open?<ChevronDown size={14} className="text-slate-400"/>:<ChevronRight size={14} className="text-slate-400"/>) : <span className="w-3.5"/>}
          </span>
          <span className="ml-0.5">{icn(node.orgType)}</span>
          <span className="ml-1.5 truncate">{node.orgName}</span>
          {node.status!=='0' && <span className="ml-auto rounded bg-slate-100 px-1.5 text-[10px] text-slate-400">停用</span>}
        </div>
        {open && kids && node.children.map(c=>renderNode(c,depth+1))}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0">
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
          <h2 className="text-sm font-semibold text-slate-700">组织架构</h2>
          <button onClick={()=>startAdd(0)} className="rounded-md bg-indigo-600 p-1.5 text-white hover:bg-indigo-700"><Plus size={15}/></button>
        </div>
        <div className="border-b border-slate-100 px-3 py-2">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
            <Search size={13} className="text-slate-400"/><input className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder="搜索..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search && <button onClick={()=>setSearch('')}><X size={13} className="text-slate-400"/></button>}
          </div>
        </div>
        <div className="flex-1 overflow-auto px-2 py-2">{tree.map(n=>renderNode(n,0))}</div>
      </div>
      <div className="flex flex-1 flex-col bg-slate-50">
        {!editing && selected && (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-semibold text-slate-800">{selected.orgName}</h3><p className="text-xs text-slate-400 mt-0.5">{selected.orgCode||'—'}</p></div>
              <div className="flex gap-2">
                <button onClick={startEdit} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"><Edit3 size={13}/>编辑</button>
                <button onClick={()=>startAdd(selected.id)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"><Plus size={13}/>子节点</button>
                <button onClick={handleDelete} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 size={13}/>删除</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
              {[['类型',orgType.toLabel(String(selected.orgType))||selected.orgType],['工厂',factoryDict.labelMap[String(selected.factoryId)]||'—'],['负责人',selected.leader||'—'],['电话',selected.phone||'—'],['排序',String(selected.orderNum)],['状态',selected.status==='0'?'启用':'停用'],['备注',selected.remark||'—']].map(([l,v])=>(
                <div key={l as string}><p className="text-[10px] uppercase text-slate-400">{l}</p><p className="text-sm text-slate-700 mt-0.5">{v as string}</p></div>
              ))}
            </div>
          </div>
        )}
        {editing && (
          <div className="flex flex-col gap-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800">{form.id?'编辑':'新建'}组织节点</h3>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">名称 *</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.orgName} onChange={e=>setForm({...form,orgName:e.target.value})}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">编码</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.orgCode} onChange={e=>setForm({...form,orgCode:e.target.value})}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">类型 *</span><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.orgType} onChange={e=>setForm({...form,orgType:e.target.value})}>{orgType.options.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">工厂</span><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.factoryId||''} onChange={e=>setForm({...form,factoryId:e.target.value?Number(e.target.value):null})}><option value="">—</option>{factoryDict.options.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">排序</span><input type="number" className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.orderNum} onChange={e=>setForm({...form,orderNum:Number(e.target.value)})}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">负责人</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.leader} onChange={e=>setForm({...form,leader:e.target.value})}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">电话</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">状态</span><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="0">启用</option><option value="1">停用</option></select></label>
              <label className="col-span-2 flex flex-col gap-1"><span className="text-xs text-slate-500">备注</span><textarea className="rounded-md border border-slate-200 px-3 py-2 text-sm" rows={2} value={form.remark||''} onChange={e=>setForm({...form,remark:e.target.value})}/></label>
            </div>
            <div className="flex gap-2"><button onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">保存</button><button onClick={()=>setEditing(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button></div>
          </div>
        )}
        {!editing && !selected && <div className="flex flex-1 items-center justify-center text-sm text-slate-400">← 选择节点查看详情，或点击 + 新建</div>}
      </div>
    </div>
  );
}
