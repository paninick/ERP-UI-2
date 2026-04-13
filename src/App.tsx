/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  FileCode,
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Monitor, 
  Briefcase, 
  GitBranch, 
  ClipboardList, 
  Database, 
  Shirt, 
  Warehouse, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Plus, 
  Filter, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Cloud,
  Package,
  Download,
  ChevronUp,
  ArrowUpDown,
  Zap,
  Target,
  Activity,
  ShieldCheck,
  TrendingDown,
  Globe,
  PieChart,
  X,
  ExternalLink,
  MapPin,
  CreditCard,
  Calendar as CalendarIcon,
  Calendar,
  Scale,
  History,
  Crown,
  Truck,
  Scan,
  Mail,
  DollarSign,
  Users,
  ClipboardCheck,
  Server,
  Calculator,
  Wrench,
  Wallet,
  Cpu,
  MessageSquare,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Target as TargetIcon,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  Legend
} from 'recharts';

// --- Types ---
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string }[];
}

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "completed" | "pending" | "cancelled";
  items: number;
}

interface Style {
  id: string;
  name: string;
  category: string;
  season: string;
  image: string;
  status: "developing" | "production" | "archived";
}

interface BOMItem {
  name: string;
  type: "fabric" | "trim" | "packaging";
  spec: string;
  unit: string;
  usage: number;
  loss: string;
}

interface Insight {
  id: string;
  type: "positive" | "negative" | "warning";
  title: string;
  description: string;
  impact: string;
  action?: string;
}

interface StrategicGoal {
  id: string;
  title: string;
  progress: number;
  target: string;
  status: "on-track" | "at-risk" | "behind";
}

interface MonthlyProductionTask {
  orderId: string;
  style: string;
  month: string;
  steps: {
    name: string;
    progress: number;
    status: "completed" | "in-progress" | "pending" | "delayed";
    startDate: string;
    endDate: string;
  }[];
}

interface ERPDevelopmentTask {
  phase: string;
  tasks: {
    title: string;
    owner: string;
    time: string;
    status: "done" | "doing" | "todo";
    desc: string;
  }[];
}

// --- Industry Dashboard Data Model ---
const INDUSTRY_DASHBOARD_DATA = {
  home: {
    metrics: [
      { label: "实时订单总额", value: "¥1,284,500", trend: "+12.5%", status: "up", progress: 75, icon: <TrendingUp size={20} /> },
      { label: "平均订单毛利率", value: "24.5%", trend: "+2.1%", status: "up", progress: 65, icon: <DollarSign size={20} /> },
      { label: "生产线稼动率", value: "92.8%", trend: "达标", status: "safe", progress: 92, icon: <Activity size={20} /> },
      { label: "预计退税总额", value: "¥16.7w", trend: "本月", status: "safe", progress: 80, icon: <ShieldCheck size={20} /> },
    ],
    strategicGoals: [
      { id: 1, title: "数字化工厂转型", target: "100% 联网", progress: 85, status: "on-track" },
      { id: 2, title: "海外市场扩张", target: "营收占比 40%", progress: 28, status: "at-risk" },
      { id: 3, title: "绿色生产认证", target: "Q4 完成", progress: 65, status: "on-track" },
      { id: 4, title: "研发投入占比", target: "营收 8%", progress: 92, status: "on-track" },
    ],
    salesChart: [
      { month: '1月', sales: 450000, predicted: 420000 },
      { month: '2月', sales: 520000, predicted: 480000 },
      { month: '3月', sales: 610000, predicted: 550000 },
      { month: '4月', sales: 580000, predicted: 620000 },
      { month: '5月', sales: 720000, predicted: 680000 },
      { month: '6月', sales: 850000, predicted: 800000 },
    ],
    recentOrders: [
      { id: "ORD-2024-001", customer: "Nordstrom", date: "2024-03-25", amount: "¥125,400", status: "shipped" },
      { id: "ORD-2024-002", customer: "ZARA Global", date: "2024-03-26", amount: "¥450,000", status: "processing" },
      { id: "ORD-2024-003", customer: "Uniqlo JP", date: "2024-03-27", amount: "¥89,200", status: "pending" },
      { id: "ORD-2024-004", customer: "Lululemon", date: "2024-03-27", amount: "¥210,000", status: "processing" },
      { id: "ORD-2024-005", customer: "H&M Group", date: "2024-03-28", amount: "¥320,000", status: "shipped" },
    ]
  },
  insights: [
    {
      id: "controller",
      role: "实际控制人 (Actual Controller)",
      icon: <Crown className="text-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      summary: "战略对齐与资本效率",
      content: "年度 ROI 预估 18%，资产周转率提升 12%。建议关注海外市场地缘政治风险，适度增加内销占比以对冲出口波动。",
      kpi: { label: "战略达成率", value: "92%", status: "up" }
    },
    {
      id: "finance",
      role: "财务 (Finance)",
      icon: <Wallet className="text-emerald-500" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      summary: "现金流与税务合规",
      content: "现金流充足，但增值税进项抵扣不足。建议优化辅料供应商结构，优先选择具备一般纳税人资质的供应商以降低税负。",
      kpi: { label: "综合税负率", value: "4.8%", status: "down" }
    },
    {
      id: "erp",
      role: "ERP 专家 (ERP Expert)",
      icon: <Database className="text-indigo-500" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      summary: "数字化架构与数据治理",
      content: "系统集成度 85%。建议加强生产端 IoT 数据实时采集，特别是横机联网，减少人工录入误差，实现‘账实相符’。",
      kpi: { label: "数据准确率", value: "99.8%", status: "up" }
    },
    {
      id: "production_mgr",
      role: "生产管理者 (Production Manager)",
      icon: <Settings className="text-slate-500" />,
      bg: "bg-slate-50",
      border: "border-slate-100",
      summary: "交付能力与瓶颈突破",
      content: "当前 WIP (在制品) 周转率为 4.2。套口环节仍是主要瓶颈，建议增加 2 台自动化套口设备或优化排班以提升 15% 产能。",
      kpi: { label: "瓶颈工序效率", value: "78%", status: "warning" }
    },
    {
      id: "sales",
      role: "销售 (Sales)",
      icon: <TrendingUp className="text-rose-500" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
      summary: "外贸订单盈利与退税优化",
      content: "当前 FOB 报价模型显示北美市场贡献度最高 (45%)。建议利用出口退税 (13%) 优势，在维持 24.5% 毛利率的前提下，对大宗订单进行 2% 的战略让利以抢占市场份额。",
      kpi: { label: "出口退税达成率", value: "98.5%", status: "up" }
    },
    {
      id: "legal",
      role: "律师 (Legal Counsel)",
      icon: <Scale className="text-blue-500" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      summary: "合规风险与知识产权",
      content: "新款设计已申请外观专利。代工合同中关于‘质量争议’的条款需重新修订，建议明确第三方质检效力以规避法律纠纷。",
      kpi: { label: "合规覆盖率", value: "100%", status: "safe" }
    },
    {
      id: "floor",
      role: "生产 (Production/Floor)",
      icon: <Wrench className="text-orange-500" />,
      bg: "bg-orange-50",
      border: "border-orange-100",
      summary: "作业效率与质量控制",
      content: "计件工资准确率 100%，员工离职率下降 5%。建议引入‘质量奖金’制度，挂钩后道检验合格率，激发一线员工质控意识。",
      kpi: { label: "一次合格率", value: "96.5%", status: "up" }
    }
  ],
  costing: {
    summary: [
      { label: "标准总成本", value: "¥98.00", color: "text-slate-600", icon: <Target size={18} /> },
      { label: "实际总成本", value: "¥107.80", color: "text-slate-900", icon: <Activity size={18} /> },
      { label: "总成本偏差", value: "+10.0%", color: "text-rose-600", icon: <TrendingUp size={18} />, sub: "超出预算 ¥9.80" },
    ],
    variance: [
      { item: "面料成本", standard: 42.00, actual: 45.50, variance: 3.50, status: "unfavorable", reason: "精梳棉市场价格上涨 8%，且裁剪损耗略高于预期。" },
      { item: "辅料成本", standard: 13.50, actual: 12.80, variance: -0.70, status: "favorable", reason: "大批量采购拉链获得 5% 折扣。" },
      { item: "人工成本", standard: 35.00, actual: 35.00, variance: 0.00, status: "neutral", reason: "符合标准工价体系。" },
      { item: "制造杂费", standard: 7.50, actual: 8.50, variance: 1.00, status: "unfavorable", reason: "夏季高峰电费上调及设备维护频率增加。" },
    ],
    financialModel: {
      depreciation: [
        { asset: "横机设备 (120台)", value: "¥12,000,000", method: "直线法", monthly: "¥100,000", accumulated: "¥2,400,000" },
        { asset: "数字化机房", value: "¥2,500,000", method: "双倍余额递减", monthly: "¥42,000", accumulated: "¥840,000" },
      ],
      productLoss: [
        { category: "织造损耗", rate: "2.5%", value: "¥45,000", benchmark: "2.0%", status: "warning" },
        { category: "成品次品率", rate: "1.2%", value: "¥22,000", benchmark: "1.5%", status: "safe" },
        { category: "仓储过期/污损", rate: "0.3%", value: "¥5,400", benchmark: "0.5%", status: "safe" },
      ]
    }
  },
  warehouse: {
    smartStatus: "Connected",
    lastSync: "2024-03-28 10:45:22",
    totalValue: "¥8,450,000",
    fabricInventory: [
      { id: "FAB-001", name: "精梳棉平纹", color: "藏青", stock: "2,500m", value: "¥125,000", location: "A-01-12", status: "Smart-Sync", linkedOrder: "ORD-2024-002" },
      { id: "FAB-002", name: "羊绒混纺", color: "原白色", stock: "850m", value: "¥425,000", location: "B-03-05", status: "Smart-Sync", linkedOrder: "ORD-2024-005" },
      { id: "FAB-003", name: "丝光棉", color: "酒红", stock: "1,200m", value: "¥84,000", location: "A-02-08", status: "Smart-Sync", linkedOrder: "ORD-2024-001" },
    ],
  },
  logistics: {
    status: "Active",
    pendingTasks: 12,
    realTimeTracking: [
      { id: "LOG-20240328-01", destination: "上海仓", status: "运输中", eta: "14:30", driver: "张师傅", linkedOrder: "ORD-2024-001" },
      { id: "LOG-20240328-02", destination: "广东分销中心", status: "待装车", eta: "16:00", driver: "李师傅", linkedOrder: "ORD-2024-005" },
    ],
    smartScheduling: {
      status: "Ready",
      lastOptimization: "2024-03-28 11:30:00",
      resources: {
        drivers: [
          { name: "张师傅", status: "Busy", vehicle: "沪A·88888", type: "4.2米厢货" },
          { name: "李师傅", status: "Available", vehicle: "沪B·66666", type: "6.8米中卡" },
          { name: "王师傅", status: "Available", vehicle: "沪C·99999", type: "面包车" },
        ],
        vehicles: [
          { id: "V-001", type: "4.2米厢货", capacity: "5吨", status: "On-Road" },
          { id: "V-002", type: "6.8米中卡", capacity: "10吨", status: "Standby" },
          { id: "V-003", type: "面包车", capacity: "1.5吨", status: "Standby" },
        ]
      },
      pendingOrders: [
        { id: "ORD-W001", priority: "High", destination: "苏州分拨中心", volume: "3.5吨", deadline: "16:00", stockStatus: "Ready", linkedOrder: "ORD-2024-001" },
        { id: "ORD-W002", priority: "Medium", destination: "无锡制造厂", volume: "8.2吨", deadline: "18:00", stockStatus: "Picking", linkedOrder: "ORD-2024-002" },
        { id: "ORD-W003", priority: "Low", destination: "杭州直营店", volume: "0.8吨", deadline: "20:00", stockStatus: "Ready", linkedOrder: "ORD-2024-004" },
      ],
      optimizedRoutes: [
        { id: "ROUTE-01", driver: "张师傅", stops: ["仓库", "苏州分拨中心", "无锡制造厂"], distance: "120km", efficiency: "94%" },
        { id: "ROUTE-02", driver: "王师傅", stops: ["仓库", "杭州直营店"], distance: "180km", efficiency: "88%" },
      ]
    }
  },
  erpMetrics: {
    modules: [
      {
        name: "销售管理 (Sales Management)",
        fields: [
          { field: "order_id", type: "String (PK)", source: "CRM/Manual", desc: "唯一订单编号，关联生产、采购、物流" },
          { field: "customer_id", type: "String (FK)", source: "Customer Master", desc: "客户唯一标识" },
          { field: "fob_price", type: "Decimal", source: "Costing Model", desc: "离岸价，用于核算毛利" },
          { field: "tax_rebate_rate", type: "Decimal", source: "Finance Config", desc: "退税率 (e.g. 0.13)" },
          { field: "incoterms", type: "Enum", source: "Contract", desc: "贸易术语 (FOB, CIF, etc.)" }
        ]
      },
      {
        name: "仓储管理 (Warehouse Management)",
        fields: [
          { field: "sku_id", type: "String (PK)", source: "Product Master", desc: "库存单位唯一标识" },
          { field: "location_id", type: "String", source: "Warehouse Map", desc: "货位编号，支持智能路径规划" },
          { field: "stock_qty", type: "Decimal", source: "IoT/Manual", desc: "实时库存数量" },
          { field: "batch_no", type: "String", source: "Production", desc: "生产批次号，用于质量追溯" }
        ]
      },
      {
        name: "生产管理 (Production Management)",
        fields: [
          { field: "plan_id", type: "String (PK)", source: "Planning Engine", desc: "生产计划编号" },
          { field: "machine_id", type: "String (FK)", source: "Asset Master", desc: "设备编号 (如横机、套口机)" },
          { field: "knitting_efficiency", type: "Decimal", source: "IoT Sensors", desc: "横机生产效率，实时采集" },
          { field: "linking_price", type: "Decimal", source: "Labor Config", desc: "套口工序单价" },
          { field: "output_qty", type: "Decimal", source: "IoT Sensors", desc: "实时产出数量" },
          { field: "loss_rate", type: "Decimal", source: "Calculated", desc: "实时损耗率，对比标准 BOM" }
        ]
      },
      {
        name: "物流调度 (Logistics Dispatch)",
        fields: [
          { field: "task_id", type: "String (PK)", source: "System Generated", desc: "物流任务编号" },
          { field: "shipping_schedule", type: "DateTime", source: "Carrier API", desc: "订船期/预定舱位时间" },
          { field: "customs_status", type: "Enum", source: "Customs API", desc: "海关报关状态 (未报关, 已报关, 已放行)" },
          { field: "driver_id", type: "String", source: "HR/Driver App", desc: "司机唯一标识" },
          { field: "route_json", type: "JSON", source: "Optimization Engine", desc: "优化后的路径坐标串" }
        ]
      },
      {
        name: "财务管理 (Financial Management)",
        fields: [
          { field: "voucher_id", type: "String (PK)", source: "Finance System", desc: "凭证编号" },
          { field: "tax_rebate_status", type: "Enum", source: "Tax System", desc: "退税办理状态 (申报中, 已退税)" },
          { field: "fx_settlement_rate", type: "Decimal", source: "Bank API", desc: "结汇汇率" },
          { field: "margin_actual", type: "Decimal", source: "Calculated", desc: "实际订单毛利率" }
        ]
      }
    ]
  },
  yarn: {
    inventory: [
      { id: 1, name: "精梳棉 40S", type: "面料", stock: 1250, dailyUsage: 120, unit: "kg", lowStock: 500, criticalStock: 200 },
      { id: 2, name: "羊绒混纺 2/48", type: "面料", stock: 450, dailyUsage: 45, unit: "kg", lowStock: 300, criticalStock: 100 },
      { id: 3, name: "高弹丝", type: "辅料", stock: 85, dailyUsage: 12, unit: "kg", lowStock: 50, criticalStock: 20 },
      { id: 4, name: "环保染料 (藏青)", type: "染料", stock: 210, dailyUsage: 18, unit: "kg", lowStock: 100, criticalStock: 40 },
    ]
  },
  salesModel: {
    metrics: [
      { 
        label: "FOB 报价模型 (单件)", 
        value: "$12.50", 
        formula: "FOB = (CMT + 面料 + 辅料 + 利润 + 国内杂费) / (汇率 * (1 - 佣金))", 
        desc: "针织服装核心报价基准，需精准核算每打/每件的克重与损耗。" 
      },
      { 
        label: "出口退税预估", 
        value: "¥1.24M", 
        formula: "退税额 = 采购发票金额 / (1 + 增值税率) * 出口退税率", 
        desc: "外贸企业核心利润补充，针织品类通常适用 13% 退税率。" 
      },
      { 
        label: "订单贡献毛益", 
        value: "24.5%", 
        formula: "贡献毛益 = (FOB * 汇率 + 退税额 - 变动成本) / (FOB * 汇率)", 
        desc: "综合考量退税后的实际盈利能力，是衡量订单质量的关键指标。" 
      },
      { 
        label: "盈亏平衡订单量", 
        value: "15,000 件", 
        formula: "BEP = 固定成本 / (单价 - 单位变动成本)", 
        desc: "覆盖工厂租金、设备折旧等固定开支所需的最小生产规模。" 
      },
    ],
    marketContribution: [
      { label: "北美市场 (US/CA)", value: 45, color: "bg-blue-600" },
      { label: "欧洲市场 (EU)", value: 30, color: "bg-indigo-600" },
      { label: "日本市场 (JP)", value: 15, color: "bg-rose-500" },
      { label: "其他地区", value: 10, color: "bg-slate-400" },
    ],
    orderFunnel: [
      { label: "询盘/意向", value: "1,200", percent: "100%", color: "bg-slate-100" },
      { label: "报价/打样", value: "450", percent: "37.5%", color: "bg-indigo-50" },
      { label: "确认订单", value: "180", percent: "15%", color: "bg-indigo-100" },
      { label: "按时交付", value: "176", percent: "97.8%", color: "bg-emerald-500 text-white" },
    ]
  }
};

const FLEXIBLE_MANUFACTURING_DATA = {
  productionLines: [
    { id: "LINE-01", name: "横机车间 A", status: "Running", efficiency: 94, currentTask: "ORD-2024-002", progress: 65, nextMaterial: "FAB-001", materialStatus: "In-Transit" },
    { id: "LINE-02", name: "横机车间 B", status: "Running", efficiency: 88, currentTask: "ORD-2024-005", progress: 42, nextMaterial: "FAB-002", materialStatus: "Delayed" },
    { id: "LINE-03", name: "套口车间 C", status: "Maintenance", efficiency: 0, currentTask: "-", progress: 0, nextMaterial: "-", materialStatus: "Ready" },
    { id: "LINE-04", name: "后整车间 D", status: "Running", efficiency: 92, currentTask: "ORD-2024-001", progress: 85, nextMaterial: "PKG-001", materialStatus: "Arrived" },
  ],
  logisticsSync: [
    { taskId: "LOG-SYNC-01", line: "LINE-01", material: "精梳棉 (藏青)", eta: "10:30", status: "On-Time", driver: "张师傅" },
    { taskId: "LOG-SYNC-02", line: "LINE-02", material: "羊绒混纺 (原白)", eta: "11:15", status: "Delayed", driver: "李师傅", reason: "交通拥堵" },
    { taskId: "LOG-SYNC-03", line: "LINE-04", material: "包装辅料", eta: "09:45", status: "Completed", driver: "王师傅" },
  ],
  aiOptimization: [
    { type: "warning", title: "缺料预警", content: "LINE-02 预计 45 分钟后缺料，物流车 LOG-SYNC-02 延误 20 分钟。", suggestion: "建议从 B 仓紧急调拨 200m 备用料，或调整 LINE-02 生产顺序。" },
    { type: "success", title: "效率优化", content: "LINE-01 生产超前，物流配送已自动提速。", suggestion: "无需干预，系统已自动同步。" },
  ]
};

// --- Mock Data ---
const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "老板座舱", icon: <LayoutDashboard size={20} /> },
  { 
    id: "reports", 
    label: "决策中心", 
    icon: <BarChart3 size={20} />,
    children: [
      { id: "report-center", label: "经营看板" },
      { id: "insights", label: "多维洞察" },
      { id: "sales", label: "销售分析" }, 
      { id: "finance", label: "资产损益" },
      { id: "inventory", label: "库存监控" },
      { id: "production", label: "供应链健康" },
      { id: "operational-cases", label: "实战案例复盘" },
      { id: "erp-guide", label: "ERP 实施指南" }
    ]
  },
  { 
    id: "business", 
    label: "核心业务", 
    icon: <Shirt size={20} />,
    children: [
      { id: "business", label: "款式研发" },
      { id: "sales-tracking", label: "销售订单跟踪" },
      { id: "order-lifecycle", label: "全流程模拟" },
      { id: "knitting", label: "工艺标准" },
      { id: "yarn", label: "物料管控" },
      { id: "quality", label: "品质专家" },
      { id: "costing", label: "利润模型" }
    ]
  },
  {
    id: "supply-chain-mgmt",
    label: "供应链管理",
    icon: <GitBranch size={20} />,
    children: [
      { id: "supply-chain-loop", label: "全链路闭环" },
      { id: "material-inbound", label: "智能入库" },
      { id: "logistics", label: "物流调度" }
    ]
  },
  {
    id: "production-exec",
    label: "生产执行",
    icon: <Activity size={20} />,
    children: [
      { id: "management-dispatch", label: "管理者派单" },
      { id: "flexible-dispatch", label: "柔性制造调度" },
      { id: "material-picking", label: "领料与补料管理" },
      { id: "production", label: "生产进度" },
      { id: "capacity-dashboard", label: "产能看板" },
      { id: "task-center", label: "待办中心" }
    ]
  },
  { id: "warehouse", label: "智能仓储", icon: <Warehouse size={20} /> },
];

const METRICS: Metric[] = [
  { label: "年度营收目标", value: "¥12.8M", change: "64.2%", trend: "up" },
  { label: "综合毛利率", value: "32.5%", change: "+1.2%", trend: "up" },
  { label: "订单交付率", value: "98.2%", change: "+0.5%", trend: "up" },
  { label: "库存周转天数", value: "42天", change: "-3天", trend: "down" },
];

const COCKPIT_INSIGHTS: Insight[] = [
  {
    id: "1",
    type: "negative",
    title: "物流调度异常：司机折返率过高",
    description: "本周发生 4 起司机中途折返取件事件，主因是‘装车清单’与‘实物’核对流程缺失。业务员临时用车占比 35%，导致调度计划被打乱。",
    impact: "增加额外油耗与人工成本 ¥8,500",
    action: "强制执行装车扫码核对"
  },
  {
    id: "2",
    type: "warning",
    title: "分工厂洗标数量不符 (ORD-002)",
    description: "锦绣分厂反馈洗标实收 4850 枚，系统发货 5000 枚。经查为点数环节误差，导致生产线停工待料。",
    impact: "生产线停工 4 小时，影响交期",
    action: "引入高精度点数设备"
  },
  {
    id: "3",
    type: "warning",
    title: "生产反馈：物料就绪未及时提取",
    description: "ORD-003 订单面料已于 3 天前入库，但生产车间今日才发起领料。反馈称‘不知道物料已备好’。",
    impact: "白白浪费 72 小时生产窗口",
    action: "开启物料就绪自动推送"
  },
  {
    id: "4",
    type: "negative",
    title: "检验反馈：返修率升至 12%",
    description: "本批次成衣发现大量‘线头未清’及‘缝线跳针’疵点。主因是外协工厂套口环节质控不严。",
    impact: "返修成本增加 ¥12,000，延误出货",
    action: "下派驻厂 QC 强化监督"
  }
];

const OPERATIONAL_CASES = [
  {
    category: "物流效率",
    issue: "司机走到半路折返 / 业务临时用车",
    case: "司机张师傅在前往上海港途中发现少带了‘原产地证’，被迫折返。同时业务部临时申请用车去见客户，导致原本的送货计划顺延。",
    solution: "系统上线‘出车前电子清单确认’，未勾选必带单证无法点击‘开始运输’。用车申请需提前 24 小时在系统预约，紧急用车需总经办审批。",
    status: "优化中"
  },
  {
    category: "物料管控",
    issue: "洗标在分工厂数量不对",
    case: "洗标、吊牌等小件辅料在分拨至外协厂时，常出现‘系统 5000，实收 4900’的情况，导致最后几百件衣服没标可钉。",
    solution: "辅料出库改为‘称重核对’+‘封条管理’。分工厂收货需拍照上传封条完整性，数量差异超过 0.5% 自动触发异常调查。",
    status: "已上线"
  },
  {
    category: "生产协同",
    issue: "物料备好不提前提取",
    case: "面料已完成缩率测试并入库，生产车间却在等‘开工指令’。车间主任反馈：‘我以为面料还没到，所以没排产’。",
    solution: "看板增加‘物料就绪’高亮状态。当订单所需物料 100% 到齐且质检合格，系统自动向生产主管发送‘可排产’推送，消除信息差。",
    status: "待实施"
  },
  {
    category: "品质管理",
    issue: "大量返修、线头和疵点",
    case: "成品检验环节发现 200 件衣服存在线头未剪干净、腋下跳针等低级错误，导致全检变全修。",
    solution: "建立‘工序质量追溯’。每件衣服挂码关联工位，发现疵点直接追溯到具体机台和工人。返修率与工人工资挂钩，并在照灯检查环节增加‘清线头’强制工序。",
    status: "强化中"
  }
];

const STRATEGIC_GOALS: StrategicGoal[] = [
  { id: "1", title: "数字化转型覆盖率", progress: 85, target: "100%", status: "on-track" },
  { id: "2", title: "海外市场销售占比", progress: 12, target: "25%", status: "at-risk" },
  { id: "3", title: "供应链碳中和达标", progress: 45, target: "60%", status: "on-track" },
];

const RECENT_ORDERS: Order[] = [
  { id: "ORD-2024-001", customer: "Nordstrom", date: "2024-03-25", amount: "¥125,400", status: "completed", items: 15 },
  { id: "ORD-2024-002", customer: "ZARA Global", date: "2024-03-26", amount: "¥450,000", status: "pending", items: 45 },
  { id: "ORD-2024-003", customer: "Uniqlo JP", date: "2024-03-27", amount: "¥89,200", status: "pending", items: 12 },
  { id: "ORD-2024-004", customer: "Lululemon", date: "2024-03-27", amount: "¥210,000", status: "pending", items: 21 },
  { id: "ORD-2024-005", customer: "H&M Group", date: "2024-03-28", amount: "¥320,000", status: "completed", items: 32 },
];

const FINANCE_DATA = {
  balanceSheet: [
    { category: "流动资产", items: [
      { name: "货币资金", value: "¥4,250,000", change: "+12%" },
      { name: "应收账款", value: "¥2,840,000", change: "-5%" },
      { name: "存货资产", value: "¥8,450,000", change: "+8%" },
    ]},
    { category: "非流动资产", items: [
      { name: "固定资产 (净值)", value: "¥12,500,000", change: "-2%" },
      { name: "无形资产", value: "¥1,200,000", change: "0%" },
    ]},
    { category: "负债", items: [
      { name: "短期借款", value: "¥3,000,000", change: "0%" },
      { name: "应付账款", value: "¥4,150,000", change: "+15%" },
    ]},
  ],
  profitAndLoss: [
    { month: '10月', revenue: 850, cost: 620, profit: 230 },
    { month: '11月', revenue: 920, cost: 680, profit: 240 },
    { month: '12月', revenue: 1100, cost: 810, profit: 290 },
    { month: '1月', revenue: 980, cost: 740, profit: 240 },
    { month: '2月', revenue: 890, cost: 670, profit: 220 },
    { month: '3月', revenue: 1284, cost: 963, profit: 321 },
  ]
};

const ORDER_SALES_ANALYSIS = [
  { id: "ORD-2024-001", customer: "Nordstrom", style: "极简廓形西装", qty: 1200, fobPrice: 15.5, unitCost: 85.0, rebate: 9.78, margin: 24.5, recommendation: "优先承接" },
  { id: "ORD-2024-002", customer: "ZARA Global", style: "丝光棉基础T恤", qty: 5000, fobPrice: 4.8, unitCost: 22.0, rebate: 2.53, margin: 18.2, recommendation: "成本优化" },
  { id: "ORD-2024-003", customer: "Uniqlo JP", style: "高腰直筒牛仔裤", qty: 800, fobPrice: 12.0, unitCost: 65.0, rebate: 7.48, margin: 21.8, recommendation: "利润预警" },
  { id: "ORD-2024-004", customer: "Lululemon", style: "法式复古碎花裙", qty: 2100, fobPrice: 18.5, unitCost: 95.0, rebate: 10.93, margin: 28.4, recommendation: "优质订单" },
  { id: "ORD-2024-005", customer: "H&M Group", style: "羊绒大衣系列", qty: 1500, fobPrice: 45.0, unitCost: 210.0, rebate: 24.16, margin: 32.1, recommendation: "核心利润源" },
];

const SALES_CHART_DATA = [
  { month: '10月', sales: 850000, predicted: 800000, conversion: 3.2, aov: 450 },
  { month: '11月', sales: 920000, predicted: 900000, conversion: 3.5, aov: 480 },
  { month: '12月', sales: 1100000, predicted: 1050000, conversion: 4.1, aov: 520 },
  { month: '1月', sales: 980000, predicted: 1000000, conversion: 3.8, aov: 490 },
  { month: '2月', sales: 890000, predicted: 950000, conversion: 3.4, aov: 470 },
  { month: '3月', sales: 1284500, predicted: 1200000, conversion: 4.5, aov: 550 },
  { month: '4月(预)', sales: null, predicted: 1450000, conversion: 4.8, aov: 580 },
  { month: '5月(预)', sales: null, predicted: 1600000, conversion: 5.1, aov: 610 },
];

const INVENTORY_CHART_DATA = [
  { category: '面料', current: 8500, safety: 5000, max: 12000, color: '#10b981' },
  { category: '辅料', current: 4500, safety: 6000, max: 10000, color: '#3b82f6' },
  { category: '样衣', current: 250, safety: 100, max: 500, color: '#f59e0b' },
  { category: '大货', current: 6500, safety: 3000, max: 15000, color: '#8b5cf6' },
  { category: '退货', current: 120, safety: 50, max: 300, color: '#ef4444' },
];

const STYLES: Style[] = [
  { id: "FQ-2024-S01", name: "极简廓形西装外套", category: "外套", season: "2024春季", image: "https://picsum.photos/seed/suit/200/200", status: "production" },
  { id: "FQ-2024-S02", name: "丝光棉基础T恤", category: "上衣", season: "2024夏季", image: "https://picsum.photos/seed/tshirt/200/200", status: "developing" },
  { id: "FQ-2024-S03", name: "高腰直筒牛仔裤", category: "裤装", season: "2024秋季", image: "https://picsum.photos/seed/jeans/200/200", status: "production" },
  { id: "FQ-2024-S04", name: "法式复古碎花裙", category: "连衣裙", season: "2024夏季", image: "https://picsum.photos/seed/dress/200/200", status: "archived" },
];

const SKU_MATRIX = {
  colors: ["珍珠白", "曜石黑", "雾霾蓝"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  data: [
    [120, 240, 180, 90, 45],
    [300, 450, 320, 150, 80],
    [80, 150, 120, 60, 30]
  ]
};

const BOM_DATA: BOMItem[] = [
  { name: "精梳棉面料", type: "fabric", spec: "200g/m² (针织)", unit: "米", usage: 1.8, loss: "5%" },
  { name: "32支全棉纱线", type: "fabric", spec: "32S/1 (针织原料)", unit: "kg", usage: 0.5, loss: "3%" },
  { name: "YKK金属拉链", type: "trim", spec: "20cm", unit: "条", usage: 1, loss: "2%" },
  { name: "高弹蚕丝线", type: "trim", spec: "40/2", unit: "卷", usage: 0.05, loss: "10%" },
  { name: "定制主标", type: "trim", spec: "织唛", unit: "枚", usage: 1, loss: "1%" },
  { name: "环保包装袋", type: "packaging", spec: "PE磨砂", unit: "个", usage: 1, loss: "3%" },
];

const KNITTING_TECH_DATA = [
  { id: "KT-001", name: "双面大圆机工艺", machine: "34寸/24针", yarn: "32S 精梳棉", gsm: "220g", shrinkage: "±3%", status: "active" },
  { id: "KT-002", name: "单面汗布工艺", machine: "30寸/28针", yarn: "40S 长绒棉", gsm: "160g", shrinkage: "±5%", status: "active" },
  { id: "KT-003", name: "罗纹组织工艺", machine: "18寸/14针", yarn: "20S 涤棉", gsm: "300g", shrinkage: "±2%", status: "draft" },
];

const PRODUCTION_STEPS = [
  "开发打样", 
  "物料采购", 
  "横机生产", 
  "裁剪验片", 
  "外协加工", 
  "套口缝制", 
  "照灯检查", 
  "整烫定型", 
  "成品检验", 
  "验针包装", 
  "物流出运", 
  "退税结汇"
];

const STEP_RESPONSIBILITIES: Record<string, string> = {
  "开发打样": "研发部-张工",
  "物料采购": "采购部-李经理",
  "横机生产": "织造车间-王主任",
  "裁剪验片": "裁剪组-赵组长",
  "外协加工": "外协部-孙主管",
  "套口缝制": "缝制车间-周主任",
  "照灯检查": "质检组-吴组长",
  "整烫定型": "后整车间-郑主任",
  "成品检验": "品控部-冯经理",
  "验针包装": "包装组-陈组长",
  "物流出运": "物流部-褚经理",
  "退税结汇": "财务部-卫会计"
};

const PRODUCTION_PROGRESS = [
  { 
    orderId: "ORD-2024-001", 
    style: "极简廓形西装", 
    currentStep: 5, 
    progress: 85, 
    status: "normal", 
    qty: 1200, 
    horizon: "current",
    materialStatus: { fabric: "arrived", accessories: "partial" },
    subSteps: [
      { name: "套口", status: "completed" },
      { name: "缝制", status: "in-progress" },
      { name: "手工", status: "pending" },
      { name: "整烫", status: "delayed" }
    ]
  },
  { 
    orderId: "ORD-2024-002", 
    style: "丝光棉基础T恤", 
    currentStep: 8, 
    progress: 45, 
    status: "warning", 
    qty: 5000, 
    horizon: "current",
    materialStatus: { fabric: "arrived", accessories: "complete" },
    subSteps: [
      { name: "初验", status: "completed" },
      { name: "复验", status: "delayed" },
      { name: "包装", status: "pending" }
    ]
  },
  { 
    orderId: "ORD-2024-006", 
    style: "羊绒大衣系列", 
    currentStep: 1, 
    progress: 5, 
    status: "normal", 
    qty: 1500, 
    horizon: "future",
    materialStatus: { fabric: "pending", accessories: "pending" }
  },
];

const MONTHLY_PRODUCTION_SCHEDULE: MonthlyProductionTask[] = [
  {
    orderId: "ORD-2024-001",
    style: "基础款圆领衫",
    month: "2024-03",
    steps: [
      { name: "横机生产", progress: 100, status: "completed", startDate: "03-01", endDate: "03-05" },
      { name: "裁剪验片", progress: 100, status: "completed", startDate: "03-06", endDate: "03-10" },
      { name: "外协加工", progress: 100, status: "completed", startDate: "03-11", endDate: "03-20" },
      { name: "套口缝制", progress: 85, status: "in-progress", startDate: "03-21", endDate: "03-28" },
      { name: "照灯检查", progress: 0, status: "pending", startDate: "03-29", endDate: "04-02" }
    ]
  },
  {
    orderId: "ORD-2024-002",
    style: "羊绒混纺开衫",
    month: "2024-03",
    steps: [
      { name: "物料采购", progress: 100, status: "completed", startDate: "03-10", endDate: "03-15" },
      { name: "横机生产", progress: 60, status: "in-progress", startDate: "03-16", endDate: "03-22" },
      { name: "裁剪验片", progress: 0, status: "pending", startDate: "03-23", endDate: "04-05" }
    ]
  },
  {
    orderId: "ORD-2024-003",
    style: "丝光棉 Polo",
    month: "2024-04",
    steps: [
      { name: "开发打样", progress: 20, status: "in-progress", startDate: "04-01", endDate: "04-05" },
      { name: "物料采购", progress: 0, status: "pending", startDate: "04-06", endDate: "04-12" }
    ]
  }
];

const ERP_DEVELOPMENT_PLAN: ERPDevelopmentTask[] = [
  {
    phase: "本周现场攻坚 (Week 1: On-site)",
    tasks: [
      { title: "全模块数据审计", owner: "ERP 专家", time: "周一", status: "done", desc: "对销售、生产、仓库现有数据进行‘账实核对’，清理冗余脏数据。" },
      { title: "数据治理工作坊", owner: "各部门主管", time: "周二", status: "doing", desc: "明确各环节录入标准，解决‘洗标数量不符’、‘物料就绪未提醒’等流程断点。" },
      { title: "月度排程模块上线", owner: "开发团队", time: "周三", status: "todo", desc: "实现生产计划的月度/次月视图，支持跨月进度追踪。" },
      { title: "全员操作培训", owner: "ERP 专家", time: "周四", status: "todo", desc: "针对一线员工和业务员进行系统标准化录入培训，确保数据源头准确。" },
      { title: "系统试运行与反馈", owner: "全员", time: "周五", status: "todo", desc: "模拟全流程运行，收集现场反馈并进行快速迭代优化。" }
    ]
  },
  {
    phase: "后续持续优化 (Future Roadmap)",
    tasks: [
      { title: "IoT 设备自动化集成", owner: "技术部", time: "Week 2-3", status: "todo", desc: "实现横机联网，自动采集产量与效率，减少人工干预。" },
      { title: "财务税务自动化", owner: "财务部", time: "Month 1", status: "todo", desc: "对接税务系统，实现出口退税自动核算与申报提醒。" },
      { title: "供应链全链路协同", owner: "采购/生产", time: "Month 2", status: "todo", desc: "打通供应商端，实现面料、辅料到货的自动预警与入库。" }
    ]
  }
];

const DATA_GOVERNANCE_FLOWS = [
  {
    role: "销售人员 (Sales)",
    steps: [
      "订单录入必须包含 FOB 报价及退税率",
      "客户特殊要求 (如洗标规格) 必须在附件明确",
      "订单状态变更需在 1 小时内同步至生产部"
    ]
  },
  {
    role: "生产主管 (Production)",
    steps: [
      "每日下午 6 点前完成当日产量录入",
      "发现物料短缺或质量异常必须在系统发起‘异常单’",
      "外协工厂进度需每 2 天进行一次实地/系统核对"
    ]
  },
  {
    role: "仓库管理员 (Warehouse)",
    steps: [
      "物料到货必须在 2 小时内完成扫码入库",
      "辅料出库必须执行‘称重+封条’双重核对",
      "物料就绪后必须点击‘通知生产’触发自动推送"
    ]
  }
];

// --- Components ---

const Sidebar = ({ currentView, onViewChange }: { currentView: string; onViewChange: (view: string) => void }) => {
  const [expanded, setExpanded] = useState<string | null>("reports");
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentView]);

  return (
    <div className="w-72 h-screen bg-slate-900/95 backdrop-blur-3xl text-slate-400 flex flex-col border-r border-white/5 shrink-0 z-20 shadow-2xl">
      <div className="p-8 flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
          <Shirt size={24} />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight block">富泉管理</span>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Digital Factory</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 py-4 custom-scrollbar">
        {NAV_ITEMS.map((item, index) => (
          <motion.div 
            key={item.id} 
            className="space-y-1"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
          >
            <button
              ref={currentView === item.id ? activeRef : null}
              onClick={() => {
                if (item.children) {
                  setExpanded(expanded === item.id ? null : item.id);
                  if (expanded !== item.id && item.children.length > 0) {
                    onViewChange(item.children[0].id);
                  }
                } else {
                  onViewChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                currentView === item.id || expanded === item.id || (item.children?.some(c => c.id === currentView)) 
                ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white shadow-xl ring-1 ring-white/10' 
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {(currentView === item.id || expanded === item.id || (item.children?.some(c => c.id === currentView))) && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-0 top-2 bottom-2 w-1.5 bg-indigo-500 rounded-l-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="flex items-center gap-3.5">
                <div className={`transition-all duration-500 ${
                  currentView === item.id || expanded === item.id || (item.children?.some(c => c.id === currentView))
                  ? 'text-indigo-400 scale-110'
                  : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-110'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-sm font-semibold tracking-tight transition-all duration-300 ${
                  currentView === item.id || expanded === item.id || (item.children?.some(c => c.id === currentView))
                  ? 'translate-x-1'
                  : 'group-hover:translate-x-1'
                }`}>{item.label}</span>
              </div>
              {item.children && (
                <ChevronDown size={14} className={`transition-transform duration-500 ${expanded === item.id ? 'rotate-180' : ''} ${
                  expanded === item.id ? 'text-indigo-400' : 'text-slate-600'
                }`} />
              )}
            </button>
            
            <AnimatePresence initial={false}>
              {expanded === item.id && item.children && (
                <motion.div
                  initial={{ height: 0, opacity: 0, x: -10 }}
                  animate={{ height: "auto", opacity: 1, x: 0 }}
                  exit={{ height: 0, opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden ml-11 space-y-1 border-l border-white/5"
                >
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      ref={currentView === child.id ? activeRef : null}
                      onClick={() => onViewChange(child.id)}
                      className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 relative group ${
                        currentView === child.id 
                        ? 'text-white font-bold bg-white/5' 
                        : 'text-slate-500 hover:text-indigo-400 hover:bg-white/5'
                      }`}
                    >
                      {currentView === child.id && (
                        <motion.div 
                          layoutId="active-child-indicator"
                          className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">{child.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden ring-2 ring-white/10 shadow-lg">
            <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">工程师小王</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">System Admin</p>
          </div>
          <Settings size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

const Header = ({ title }: { title: string }) => (
  <header className="h-20 apple-glass flex items-center justify-between px-10 border-b border-slate-200/50">
    <div className="flex items-center gap-6 flex-1">
      <div className="relative w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="搜索功能、订单、客户... (Cmd + K)" 
          className="w-full pl-12 pr-4 py-2.5 bg-slate-200/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
    
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4">
        <button className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
          <Mail size={20} />
        </button>
      </div>
      
      <div className="h-8 w-[1px] bg-slate-200"></div>
      
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Production Day 42</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-inner">
          <CalendarIcon size={20} />
        </div>
      </div>
    </div>
  </header>
);

const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const styles = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const icons = {
    completed: <CheckCircle2 size={14} />,
    pending: <Clock size={14} />,
    cancelled: <AlertCircle size={14} />,
  };
  const labels = {
    completed: "已完成",
    pending: "进行中",
    cancelled: "已取消",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};

const OrderModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
        >
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">订单详情</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-slate-500 font-mono">{order.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} />
                  客户信息
                </h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-900 text-lg">{order.customer}</p>
                  <p className="text-sm text-slate-500 mt-1">联系人: 张经理</p>
                  <p className="text-sm text-slate-500">电话: 138-xxxx-8888</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList size={14} />
                  订单摘要
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">日期</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <CalendarIcon size={14} className="text-indigo-500" />
                      {order.date}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">金额</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <CreditCard size={14} className="text-emerald-500" />
                      {order.amount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} />
                商品清单 ({order.items} 件)
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">商品名称</th>
                      <th className="px-4 py-3 text-center">数量</th>
                      <th className="px-4 py-3 text-right">单价</th>
                      <th className="px-4 py-3 text-right">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Shirt size={20} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">精梳棉针织衫 {i === 0 ? 'V领' : '圆领'}</p>
                              <p className="text-[10px] text-slate-400">SKU: FQ-2024-S0{i+1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-600">{i === 0 ? 2 : 3}</td>
                        <td className="px-4 py-3 text-right text-slate-600">¥2,480</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">¥{i === 0 ? '4,960' : '7,440'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} />
                收货信息
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">浙江省杭州市滨江区网商路 599 号</p>
                  <p className="text-xs text-slate-500 mt-1">收货人: 王小二 | 139-xxxx-9999</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              关闭
            </button>
            <button className="px-6 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <ExternalLink size={16} />
              打印订单
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const FlexibleManufacturingCockpit = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">柔性制造调度中心</h1>
          <p className="text-slate-500 font-medium">生产排产与物流配送全链路实时协同系统</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={`apple-button-primary flex items-center gap-2 ${isOptimizing ? 'opacity-70' : ''}`}
          >
            <Cpu size={18} className={isOptimizing ? 'animate-spin' : ''} />
            {isOptimizing ? 'AI 协同优化中...' : '启动 AI 产流协同'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Production Line Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="apple-card p-10 bg-white/80 border-slate-200/50">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 tracking-tight">车间生产线实时状态</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Line Real-time Monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  3 条运行中
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  1 条维护中
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {FLEXIBLE_MANUFACTURING_DATA.productionLines.map((line) => {
                const isLowEfficiency = line.efficiency < 85 && line.status === 'Running';
                const isMaterialDelayed = line.materialStatus === 'Delayed';
                const hasIssue = isLowEfficiency || isMaterialDelayed;

                return (
                  <motion.div 
                    key={line.id}
                    whileHover={{ x: 5 }}
                    className={`p-6 rounded-3xl border transition-all duration-500 group relative overflow-hidden ${
                      hasIssue 
                        ? 'bg-rose-50/30 border-rose-200/60 shadow-lg shadow-rose-100/20' 
                        : 'bg-slate-50/50 border-slate-200/50 hover:bg-white hover:shadow-xl'
                    }`}
                  >
                    {hasIssue && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">{line.id}</span>
                          <h4 className="font-bold text-slate-900">{line.name}</h4>
                          {hasIssue && (
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="text-rose-500"
                            >
                              <AlertTriangle size={14} />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            line.status === 'Running' ? 'bg-emerald-50 text-emerald-600' :
                            line.status === 'Maintenance' ? 'bg-rose-50 text-rose-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {line.status === 'Running' ? <Activity size={10} /> :
                             line.status === 'Maintenance' ? <Wrench size={10} /> :
                             <Clock size={10} />}
                            {line.status === 'Running' ? '运行中' :
                             line.status === 'Maintenance' ? '设备维护' : '空闲中'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            任务: <span className="text-slate-600">{line.currentTask}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">效率: <span className={isLowEfficiency ? 'text-rose-600 font-black' : 'text-slate-600'}>{line.efficiency}%</span></span>
                          <span className="text-xs font-bold text-slate-900">{line.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${line.progress}%` }}
                            className={`h-full rounded-full ${line.status === 'Running' ? (isLowEfficiency ? 'bg-rose-500' : 'bg-indigo-500') : 'bg-slate-300'}`}
                          />
                        </div>
                      </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">下序物料需求</p>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{line.nextMaterial}</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-sm ring-1 ring-inset ${
                        line.materialStatus === 'Arrived' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' :
                        line.materialStatus === 'In-Transit' ? 'bg-blue-50 text-blue-600 ring-blue-200' :
                        line.materialStatus === 'Delayed' ? 'bg-rose-50 text-rose-600 ring-rose-200 animate-pulse' :
                        'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}>
                        {line.materialStatus === 'Arrived' ? <CheckCircle2 size={12} /> : 
                         line.materialStatus === 'In-Transit' ? <Truck size={12} /> : 
                         line.materialStatus === 'Delayed' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        {line.materialStatus === 'Arrived' ? '物料已就绪' :
                         line.materialStatus === 'In-Transit' ? '物料配送中' :
                         line.materialStatus === 'Delayed' ? '配送延误' : '等待调度'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          </div>

          {/* Logistics Sync Timeline */}
          <div className="apple-card p-10 bg-white/80 border-slate-200/50">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">产流协同配送链</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production-Logistics Sync Chain</p>
              </div>
            </div>

            <div className="relative pl-8 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {FLEXIBLE_MANUFACTURING_DATA.logisticsSync.map((task, idx) => (
                <div key={task.taskId} className="relative">
                  <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 ${
                    task.status === 'Completed' ? 'bg-emerald-500' :
                    task.status === 'Delayed' ? 'bg-rose-500' : 'bg-blue-500'
                  }`} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                      <p className="text-sm font-bold text-slate-900">{task.eta}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{task.status === 'Completed' ? '已送达' : '预计送达'}</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">{task.line}</span>
                        <h5 className="font-bold text-slate-800">{task.material}</h5>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><User size={12} /> {task.driver}</span>
                        <span className="flex items-center gap-1"><FileCode size={12} /> {task.taskId}</span>
                      </div>
                    </div>
                    <div className="flex justify-end items-start">
                      {task.status === 'Delayed' && (
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl text-[10px] font-bold ring-1 ring-rose-200">
                          <AlertTriangle size={12} />
                          原因: {task.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Optimization & Insights */}
        <div className="space-y-8">
          <div className="apple-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-900/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-lg">AI 柔性调度建议</h3>
            </div>
            <div className="space-y-6">
              {FLEXIBLE_MANUFACTURING_DATA.aiOptimization.map((opt, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${opt.type === 'warning' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <h4 className="font-bold text-sm tracking-tight">{opt.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{opt.content}</p>
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">AI 建议对策</p>
                    <p className="text-[10px] text-indigo-100 leading-relaxed font-medium">{opt.suggestion}</p>
                  </div>
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                    立即执行建议
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="apple-card p-8 bg-white/80 border-slate-200/50">
            <h3 className="font-bold text-slate-900 mb-6">产流协同效率指标</h3>
            <div className="space-y-6">
              {[
                { label: "产流同步率", value: "92.5%", trend: "+2.4%", status: "up" },
                { label: "物料准时率", value: "96.8%", trend: "-0.5%", status: "down" },
                { label: "柔性切换耗时", value: "12.4 min", trend: "-15%", status: "up" },
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{metric.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{metric.value}</span>
                    <span className={`text-[10px] font-bold ${metric.status === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SmartScheduling = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 2000);
  };

  const handlePushToDingTalk = () => {
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="apple-card p-10 relative overflow-hidden bg-white/70 border-white/40 shadow-2xl shadow-slate-200/50"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
              <ActivityIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-900 tracking-tight">智能排程系统</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Intelligent AI Scheduling</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${isOptimizing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-95'}`}
            >
              <Cpu size={16} className={isOptimizing ? 'animate-spin' : ''} />
              {isOptimizing ? 'AI 优化中...' : '启动智能优化'}
            </button>
            <button 
              onClick={handlePushToDingTalk}
              disabled={isPushing}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${isPushing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-95'}`}
            >
              <MessageSquare size={16} />
              {isPushing ? '推送中...' : '同步至钉钉'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck size={14} className="text-indigo-500" /> 物流资源状态
            </h4>
            <div className="space-y-3">
              {INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.resources.drivers.map((driver, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ x: 5 }}
                  className="p-4 bg-white/50 rounded-2xl border border-slate-200/50 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-white shadow-inner text-xs font-bold group-hover:from-indigo-50 group-hover:to-indigo-100 group-hover:text-indigo-600 transition-all">
                      {driver.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{driver.vehicle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${driver.status === 'Available' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'}`}>
                    {driver.status === 'Available' ? '空闲' : '任务中'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pending Orders */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock size={14} className="text-rose-500" /> 待排单任务
            </h4>
            <div className="space-y-3">
              {INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.pendingOrders.map((order, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  className="p-5 bg-white/50 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{order.id}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm ${order.priority === 'High' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : order.priority === 'Medium' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>
                      {order.priority === 'High' ? '紧急' : order.priority === 'Medium' ? '普通' : '低'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-3">{order.destination}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100/50">
                    <p className="text-[10px] text-slate-500 font-bold">体积: {order.volume}</p>
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle size={10} />
                      截止: {order.deadline}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Optimized Routes */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <TargetIcon size={14} className="text-indigo-500" /> 优化建议路线
            </h4>
            <div className="space-y-4">
              {INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.optimizedRoutes.map((route, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100/50 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded-lg">{route.id}</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Zap size={10} />
                      效率: {route.efficiency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-4 font-bold relative z-10">
                    {route.stops.map((stop, sidx) => (
                      <span key={sidx} className="max-w-[70px] truncate hover:text-indigo-600 transition-colors cursor-default">{stop}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-indigo-100/50 relative z-10">
                    <p className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
                      <User size={12} className="text-indigo-400" />
                      执行: {route.driver}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">里程: {route.distance}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-2xl text-white px-6 py-4 rounded-2xl shadow-3xl flex items-center gap-4 border border-white/10 z-50"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">钉钉推送成功</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">排程更新已实时同步至物流调度群组</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ProductionGanttChart = () => {
  const [selectedMonth, setSelectedMonth] = useState("2024-03");
  
  // Calculate days in month (simplified for demo)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const filteredSchedule = MONTHLY_PRODUCTION_SCHEDULE.filter(s => s.month === selectedMonth);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-10 bg-white/70 border-white/40 shadow-2xl shadow-slate-200/50 space-y-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-slate-900 tracking-tight">生产排程甘特图</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Production Gantt Chart</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          {["2024-03", "2024-04"].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${selectedMonth === m ? 'bg-white shadow-lg text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="flex border-b border-slate-100 pb-4 mb-4">
            <div className="w-64 shrink-0 font-bold text-[10px] text-slate-400 uppercase tracking-widest">订单与工序</div>
            <div className="flex-1 flex justify-between px-4">
              {days.map(d => (
                <div key={d} className="w-8 text-center text-[10px] font-bold text-slate-400">{d}</div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-8">
            {filteredSchedule.map((order, oIdx) => (
              <div key={oIdx} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-sm font-black text-slate-800">{order.orderId} - {order.style}</span>
                </div>
                {order.steps.map((step, sIdx) => {
                  const startDay = parseInt(step.startDate.split('-')[1]);
                  const endDay = parseInt(step.endDate.split('-')[1]);
                  const duration = endDay - startDay + 1;
                  const leftOffset = (startDay - 1) * (100 / 31);
                  const width = duration * (100 / 31);
                  
                  return (
                    <div key={sIdx} className="flex items-center group">
                      <div className="w-64 shrink-0 pr-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">{step.name}</span>
                          <span className="text-[9px] font-bold text-slate-400">{STEP_RESPONSIBILITIES[step.name]?.split('-')[1] || '负责人'}</span>
                        </div>
                      </div>
                      <div className="flex-1 h-8 bg-slate-50/50 rounded-lg relative overflow-hidden ring-1 ring-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: 0.5 + (oIdx * 0.1) + (sIdx * 0.05), duration: 1 }}
                          style={{ left: `${leftOffset}%`, position: 'absolute' }}
                          className={`top-1 bottom-1 rounded-md shadow-sm flex items-center px-3 overflow-hidden group-hover:brightness-110 transition-all ${
                            step.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                            step.status === 'in-progress' ? 'bg-indigo-500/20 border border-indigo-500/30' :
                            'bg-slate-200/50 border border-slate-300/30'
                          }`}
                        >
                          <div 
                            className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ${
                              step.status === 'completed' ? 'bg-emerald-500' :
                              step.status === 'in-progress' ? 'bg-indigo-500' :
                              'bg-slate-300'
                            }`}
                            style={{ width: `${step.progress}%` }}
                          />
                          <span className="relative z-10 text-[9px] font-black text-white mix-blend-difference truncate">
                            {step.progress}%
                          </span>
                        </motion.div>
                        
                        {/* Day Grid Lines */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                          {days.map(d => (
                            <div key={d} className="w-[1px] h-full bg-slate-200"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">已完成</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded bg-indigo-500"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">进行中</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded bg-slate-300"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">待开始</span>
        </div>
      </div>
    </motion.div>
  );
};

const DevManualView = () => {
  const exportManualAsMarkdown = () => {
    const content = `
# 针织服装行业 ERP 系统开发手册 (RuoYi 单体版)

## 1. 项目概述
本项目旨在构建一个面向针织服装行业的现代化 ERP 系统，核心功能涵盖款式研发、生产排程、成本核算、仓储物流及老板座舱。

## 2. 技术栈要求
- **后端框架**: Spring Boot 2.x
- **权限安全**: Apache Shiro
- **持久层**: MyBatis (非 MyBatis-Plus, 遵循 RuoYi 原生规范)
- **前端模板**: Thymeleaf + Bootstrap 3
- **数据库**: MySQL 5.7+
- **缓存**: Redis (可选，用于 Shiro 会话或缓存)

## 3. 核心数据库表设计 (SQL)

### 3.1 订单表 (erp_order)
\`\`\`sql
CREATE TABLE erp_order (
    order_id varchar(64) NOT NULL COMMENT '订单编号',
    customer_name varchar(100) NOT NULL COMMENT '客户名称',
    style_id varchar(64) COMMENT '关联款式ID',
    order_date date COMMENT '下单日期',
    amount decimal(12,2) COMMENT '订单金额',
    status char(1) DEFAULT '0' COMMENT '状态（0待处理 1生产中 2已发货 3已结案）',
    fob_price decimal(10,2) COMMENT 'FOB报价',
    create_by varchar(64) COMMENT '创建者',
    create_time datetime COMMENT '创建时间',
    PRIMARY KEY (order_id)
) ENGINE=InnoDB COMMENT='订单信息表';
\`\`\`

### 3.2 款式表 (erp_style)
\`\`\`sql
CREATE TABLE erp_style (
    style_id varchar(64) NOT NULL COMMENT '款式编号',
    style_name varchar(100) NOT NULL COMMENT '款式名称',
    category varchar(50) COMMENT '品类',
    season varchar(20) COMMENT '季节',
    standard_cost decimal(10,2) COMMENT '标准成本',
    PRIMARY KEY (style_id)
) ENGINE=InnoDB COMMENT='款式信息表';
\`\`\`

### 3.3 领料记录表 (erp_material_picking)
\`\`\`sql
CREATE TABLE erp_material_picking (
    picking_id varchar(64) NOT NULL COMMENT '领料单号',
    order_id varchar(64) NOT NULL COMMENT '关联订单ID',
    item_id varchar(64) NOT NULL COMMENT '物料ID',
    standard_qty decimal(12,2) COMMENT 'BOM标准用量',
    actual_qty decimal(12,2) COMMENT '实际领料数量',
    variance_qty decimal(12,2) COMMENT '差异数量',
    reason_code varchar(20) COMMENT '差异原因代码（01损耗 02次品 03超领）',
    picking_type char(1) COMMENT '领料类型（0生产前领料 1补货领料）',
    status char(1) DEFAULT '0' COMMENT '状态（0正常 1待审批 2已驳回）',
    create_time datetime COMMENT '领料时间',
    PRIMARY KEY (picking_id)
) ENGINE=InnoDB COMMENT='面辅料领料差异表';
\`\`\`

### 3.4 物料入库表 (erp_material_inbound)
\`\`\`sql
CREATE TABLE erp_material_inbound (
    inbound_id varchar(64) NOT NULL COMMENT '入库单号',
    material_id varchar(64) NOT NULL COMMENT '物料ID',
    barcode varchar(64) COMMENT '物料条码',
    inbound_qty decimal(12,2) COMMENT '入库数量',
    operator varchar(64) COMMENT '入库操作人',
    inspector varchar(64) COMMENT '检验员',
    inbound_date date COMMENT '入库日期',
    create_time datetime COMMENT '创建时间',
    PRIMARY KEY (inbound_id)
) ENGINE=InnoDB COMMENT='物料智能入库表';
\`\`\`

### 3.5 外协分发表 (erp_distribution)
\`\`\`sql
CREATE TABLE erp_distribution (
    dist_id varchar(64) NOT NULL COMMENT '分发编号',
    order_id varchar(64) NOT NULL COMMENT '关联订单ID',
    factory_id varchar(64) NOT NULL COMMENT '加工点ID',
    material_id varchar(64) NOT NULL COMMENT '物料ID',
    dist_type char(1) COMMENT '分发类型（0总仓分发 1直接外发）',
    expected_qty decimal(12,2) COMMENT '预计分发数量',
    actual_qty decimal(12,2) COMMENT '实际分发数量',
    variance_qty decimal(12,2) COMMENT '差异数量',
    output_target int COMMENT '预计成品产出',
    create_time datetime COMMENT '分发时间',
    PRIMARY KEY (dist_id)
) ENGINE=InnoDB COMMENT='外协加工物料分发表';
\`\`\`

## 4. 核心业务逻辑实现 (AI 开发指令)

### 4.1 FOB 报价计算逻辑
**公式**: FOB = (CMT加工费 + 面料费 + 辅料费 + 利润 + 国内杂费) / (汇率 * (1 - 佣金率))
**实现建议**: 在 \`ErpOrderServiceImpl\` 中实现该计算方法，并提供接口供前端打样环节实时调用。

### 4.2 出口退税核算
**公式**: 退税额 = 采购发票金额 / (1 + 增值税率) * 出口退税率
**实现建议**: 针织品类退税率通常为 13%。需在财务模块中自动计算每笔订单的预估退税额。

### 4.4 智能入库与安全库存预警 (ErpMaterialInboundServiceImpl)
**实现逻辑**: 
1. **扫码识别**: 前端通过扫码枪输入 \`barcode\`，后端根据条码查询 \`erp_material\` 基础资料并返回。
2. **库存校验**: 入库完成后，计算当前总库存 \`current_stock\`。
3. **预警触发**: 若 \`current_stock < safety_threshold\`，系统自动调用邮件服务 \`MailService\` 发送提醒给仓库主管。

### 4.5 供应链全链路闭环逻辑
**核心流程**:
1. **到货确认**: 采购单到货时，必须进行 \`actual_qty\` 与 \`expected_qty\` 的核对，差异记录存入 \`erp_material_inbound\`。
2. **分发追踪**: 记录物料流向（总仓 -> 加工点 或 供应商 -> 加工点），建立物料投入与成品产出的关联。
3. **产出匹配**: 定期对比 \`erp_distribution.expected_qty\` 与实际成品入库数量，计算各加工点的‘投入产出比’及‘异常损耗’。

### 4.6 生产领料差异控制 (ErpMaterialPickingServiceImpl)
**实现逻辑**:
1. **BOM 校验**: 领料单提交时，后端根据 \`order_id\` 查询 \`erp_bom\` 标准用量 \`standard_qty\`。
2. **差异计算**: 计算 \`variance_rate = (actual_qty - standard_qty) / standard_qty\`。
3. **原因强制**: 若 \`actual_qty > standard_qty\`，前端必须选择 \`reason_code\`，后端校验 \`reason_code\` 是否在预设字典中。
4. **审批触发**: 若 \`variance_rate > 0.05\` (5%)，系统自动发起工作流 \`WorkflowService\`，将领料单状态设为“待审批”，并抄送车间主管。
5. **领料场景**: 区分“生产前领料”与“生产中补货领料”，补货领料通常默认需要更严格的审核。

**Java 代码参考**:
\`\`\`java
@Service
public class ErpMaterialInboundServiceImpl implements IErpMaterialInboundService {
    @Autowired
    private ErpMaterialInboundMapper inboundMapper;
    @Autowired
    private IMailService mailService; // RuoYi 邮件服务

    @Override
    @Transactional
    public int insertErpMaterialInbound(ErpMaterialInbound inbound) {
        // 1. 设置入库日期与操作人 (通常从 SecurityUtils 获取)
        inbound.setInboundDate(DateUtils.getNowDate());
        inbound.setOperator(SecurityUtils.getUsername());
        
        int rows = inboundMapper.insertErpMaterialInbound(inbound);
        
        // 2. 检查安全库存 (假设已更新库存表)
        Material material = materialMapper.selectMaterialById(inbound.getMaterialId());
        if (material.getCurrentStock().compareTo(material.getSafetyThreshold()) < 0) {
            sendSafetyAlertEmail(material);
        }
        return rows;
    }

    private void sendSafetyAlertEmail(Material m) {
        String content = String.format("物料【%s】库存低于安全阈值！当前：%s，阈值：%s", 
            m.getName(), m.getCurrentStock(), m.getSafetyThreshold());
        mailService.sendMail("supervisor@factory.com", "库存预警通知", content);
    }
}
\`\`\`

## 5. 前端开发规范 (Thymeleaf)
- **列表页**: 使用 RuoYi 封装的 \`$.table.init(options)\`。
- **弹窗**: 使用 \`$.modal.open()\`。
- **图表**: 集成 ECharts，在 \`main.html\` (老板座舱) 中展示销售趋势和库存水位。

## 6. AI 开发 Prompt 建议
> "请基于 RuoYi 单体版框架，根据 erp_order 表结构生成完整的 CRUD 代码。要求：Service 层需包含计算订单毛利率的方法，Controller 层需支持根据状态筛选订单，前端页面需使用 RuoYi 原生的 Bootstrap 样式。"
    `;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RuoYi_ERP_Dev_Manual.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">开发手册 (AI 专用)</h1>
            <p className="text-sm text-slate-500">严格控制的技术规范，可直接提供给 AI 工具进行开发</p>
          </div>
        </div>
        <button 
          onClick={exportManualAsMarkdown}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <Download size={18} />
          导出 Markdown 手册
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              1. 技术栈与环境
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Backend</p>
                <p className="font-bold text-slate-700">Spring Boot + Shiro + MyBatis</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Frontend</p>
                <p className="font-bold text-slate-700">Thymeleaf + Bootstrap 3</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              2. 核心数据库模型 (AI 重点)
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="font-bold text-indigo-900 text-sm">erp_order (订单主表)</p>
                <p className="text-xs text-indigo-700 mt-1">包含：order_id, customer_name, fob_price, tax_rebate, status 等核心字段。</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="font-bold text-emerald-900 text-sm">erp_bom (物料清单)</p>
                <p className="text-xs text-emerald-700 mt-1">包含：style_id, item_name, usage_qty, loss_rate 等字段。</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="font-bold text-amber-900 text-sm">erp_material_picking (领料差异表)</p>
                <p className="text-xs text-amber-700 mt-1">核心：standard_qty (标准), actual_qty (实际), variance (差异原因)。</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="font-bold text-blue-900 text-sm">erp_material_inbound (物料入库表)</p>
                <p className="text-xs text-blue-700 mt-1">新增：operator (操作人), inspector (检验员), inbound_date (日期), barcode (条码)。</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="font-bold text-rose-900 text-sm">erp_distribution (外协分发表)</p>
                <p className="text-xs text-rose-700 mt-1">核心：dist_type (直接/总仓), factory_id, expected_qty, actual_qty (差异记录)。</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              3. 业务逻辑与 AI 指令
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 text-sm mb-2">领料差异控制逻辑</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  当实际领料超过 BOM 标准时，系统必须拦截并要求选择原因（如：面料疵点、裁剪损耗、补片等）。
                  差异率超过 5% 时，自动发送通知给生产主管。
                </p>
              </div>
              <div className="p-6 bg-slate-900 rounded-3xl text-slate-300 font-mono text-xs leading-relaxed relative group">
                <p className="mb-4">"请在 ErpMaterialPickingServiceImpl 中实现领料校验：对比实际领料与 BOM 标准，若超领则强制要求 reason_code，并计算差异率..."</p>
                <p className="text-slate-500 italic">// 复制此段落提供给 AI 工具</p>
                <button 
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={() => navigator.clipboard.writeText("请基于 RuoYi 框架实现领料差异校验逻辑：1. 领料保存前对比 BOM 标准用量；2. 若超领则校验 reason_code 不能为空；3. 差异率超过 5% 时调用消息通知接口。")}
                >
                  <ClipboardCheck size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
        <AlertCircle className="text-amber-600 shrink-0" size={24} />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">严格控制说明</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            本手册已根据若依单体版的官方规范进行脱敏和结构化处理。在提供给其他 AI 工具时，请务必强调使用 <b>Apache Shiro</b> 而非 Spring Security，以确保代码能直接在您的本地 RuoYi 环境中运行。
          </p>
        </div>
      </div>
    </div>
  );
};

const ProductionAlertsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const ALERTS = [
    { id: "ALT-001", type: "面料到货", message: "订单 ORD-2024-006 精梳棉面料已到货（1500KG），质检合格，建议立即开启裁剪环节。", action: "去排产", color: "emerald" },
    { id: "ALT-002", type: "辅料齐备", message: "订单 ORD-2024-001 L码辅料（拉链、纽扣、洗标）已全部到齐，可开始领料出库。", action: "去领料", color: "blue" },
    { id: "ALT-003", type: "缺料预警", message: "订单 ORD-2024-002 蚕丝线库存低于安全值，预计影响后道工序，请及时补货。", action: "去采购", color: "rose" },
    { id: "ALT-004", type: "面料到货", message: "订单 ORD-2024-002 丝光棉面料已到货（3000KG），请仓库及时入库登记。", action: "去入库", color: "emerald" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ALERTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ALERTS.length]);

  const alert = ALERTS[currentIndex];

  return (
    <div className="apple-card relative overflow-hidden h-[120px] border-none shadow-xl shadow-indigo-100/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={alert.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 p-6 flex items-center gap-6"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            alert.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
            alert.color === 'blue' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {alert.color === 'emerald' ? <Package size={28} /> : alert.color === 'blue' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                alert.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 
                alert.color === 'blue' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {alert.type}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">实时监控中</span>
              </div>
            </div>
            <p className="text-base text-slate-900 font-bold tracking-tight truncate">{alert.message}</p>
          </div>
          <button className={`apple-button-primary !py-2.5 !px-6 !text-[10px] !font-bold uppercase tracking-widest shrink-0 ${
            alert.color === 'emerald' ? '!bg-emerald-600 hover:!bg-emerald-700' : 
            alert.color === 'blue' ? '!bg-indigo-600 hover:!bg-indigo-700' : '!bg-rose-600 hover:!bg-rose-700'
          }`}>
            {alert.action}
          </button>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {ALERTS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-200'}`} 
          />
        ))}
      </div>
    </div>
  );
};

const MaterialInboundView = () => {
  // 模拟物料数据库
  const MOCK_MATERIALS = {
    "690123456789": { id: "M-001", name: "精梳棉 32S/1", currentStock: 150, safetyThreshold: 200, unit: "KG" },
    "690987654321": { id: "M-002", name: "羊绒混纺 2/48", currentStock: 45, safetyThreshold: 100, unit: "KG" },
    "690111222333": { id: "M-003", name: "高弹丝 (白色)", currentStock: 12, safetyThreshold: 50, unit: "卷" },
  };

  const [barcode, setBarcode] = useState("");
  const [material, setMaterial] = useState<any>(null);
  const [orderId, setOrderId] = useState("ORD-2024-001");
  const [materialType, setMaterialType] = useState<"fabric" | "accessory">("fabric");
  const [qty, setQty] = useState(0);
  const [operator, setOperator] = useState("Admin");
  const [inspector, setInspector] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [history, setHistory] = useState<any[]>([
    { id: "IN-20240328-01", name: "精梳棉 32S/1", qty: 50, operator: "Admin", inspector: "李四", date: "2024-03-28", status: "正常", orderId: "ORD-2024-001", type: "fabric" },
    { id: "IN-20240328-02", name: "环保染料 (藏青)", qty: 20, operator: "张三", inspector: "王五", date: "2024-03-28", status: "预警", orderId: "ORD-2024-002", type: "accessory" },
  ]);

  // 模拟扫码自动填充
  const handleScan = (code: string) => {
    setBarcode(code);
    const found = MOCK_MATERIALS[code as keyof typeof MOCK_MATERIALS];
    if (found) {
      setMaterial(found);
      // 模拟根据条码自动判断类型
      setMaterialType(code.startsWith("6901") ? "fabric" : "accessory");
    } else {
      setMaterial(null);
    }
  };

  const simulateScan = () => {
    const codes = Object.keys(MOCK_MATERIALS);
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    handleScan(randomCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;

    const newStock = material.currentStock + qty;
    const alertTriggered = newStock < material.safetyThreshold;
    
    if (alertTriggered) {
      setShowAlert(true);
      console.log(`[SYSTEM] Sending alert email to warehouse supervisor: Stock level for ${material.name} is below safety threshold (${newStock} < ${material.safetyThreshold})`);
    } else {
      setShowAlert(false);
    }

    // 模拟向生产面板发送提醒
    if (materialType === "fabric") {
      console.log(`[PRODUCTION ALERT] Fabric arrived for ${orderId}: ${material.name}`);
    } else if (materialType === "accessory") {
      console.log(`[PRODUCTION ALERT] Accessory arrived for ${orderId}: ${material.name} (Checking size completeness...)`);
    }

    // 添加到历史记录
    const newRecord = {
      id: `IN-${new Date().getTime()}`,
      name: material.name,
      qty: qty,
      operator: operator,
      inspector: inspector,
      date: date,
      status: alertTriggered ? "预警" : "正常",
      orderId: orderId,
      type: materialType
    };
    setHistory([newRecord, ...history]);
    setIsSubmitted(true);
    
    // 3秒后重置提交状态，但保留历史记录
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200/50">
            <Scan size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">智能入库管理</h1>
            <p className="text-slate-500 font-medium">支持扫码自动识别，集成安全库存预警与生产面板联动</p>
          </div>
        </div>
        <button 
          onClick={simulateScan}
          className="apple-button-secondary flex items-center gap-2"
        >
          <Zap size={18} />
          模拟扫码
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 apple-card p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">关联订单号</label>
                <select 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                >
                  {PRODUCTION_PROGRESS.map(p => (
                    <option key={p.orderId} value={p.orderId}>{p.orderId} ({p.style})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">物料类型</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setMaterialType("fabric")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${materialType === 'fabric' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >面料 (Fabric)</button>
                  <button 
                    type="button"
                    onClick={() => setMaterialType("accessory")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${materialType === 'accessory' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >辅料 (Accessory)</button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">物料条码 (模拟扫码输入)</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={barcode}
                      onChange={(e) => handleScan(e.target.value)}
                      placeholder="请输入或扫描条码 (试用: 690123456789)"
                      className="w-full bg-slate-50 border border-transparent rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    />
                    <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                  <button 
                    type="button"
                    onClick={simulateScan}
                    className="apple-button-secondary flex items-center gap-2"
                  >
                    <Scan size={18} />
                    模拟扫码
                  </button>
                </div>
              </div>

            {material && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-2 gap-8 p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">物料名称 (Material Name)</p>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">{material.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">当前库存 (Current Stock)</p>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">{material.currentStock} {material.unit}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">入库操作人</label>
                <input 
                  type="text" 
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">检验员</label>
                <input 
                  type="text" 
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  placeholder="请输入检验员姓名"
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">入库日期</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">入库数量</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {material?.unit || '单位'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!material || qty <= 0}
              className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                !material || qty <= 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              <CheckCircle2 size={20} />
              确认入库并同步生产面板
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="apple-card p-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              库存状态监控 (Stock Monitor)
            </h3>
            {material ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">安全库存阈值</p>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">{material.safetyThreshold} {material.unit}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">入库后预计</p>
                  <p className={`text-xl font-bold tracking-tight ${material.currentStock + qty < material.safetyThreshold ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {material.currentStock + qty} {material.unit}
                  </p>
                </div>
                <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((material.currentStock + qty) / material.safetyThreshold) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className={`h-full rounded-full ${material.currentStock + qty < material.safetyThreshold ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Scan size={20} />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">等待扫描识别...</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`p-8 rounded-[32px] border-none shadow-2xl flex flex-col items-center text-center gap-4 ${
                  showAlert ? 'bg-rose-900 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${showAlert ? 'bg-white/10' : 'bg-white/10'}`}>
                  {showAlert ? <Mail className="text-rose-400" size={32} /> : <CheckCircle2 className="text-emerald-400" size={32} />}
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">{showAlert ? '库存预警已触发' : '入库登记成功'}</p>
                  <p className="text-xs text-white/60 font-medium mt-2 leading-relaxed">
                    {showAlert 
                      ? '当前库存仍低于安全阈值。系统已自动发送预警邮件至仓库主管邮箱。' 
                      : `入库单已保存，当前库存处于安全水平。操作人：${operator}`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="apple-card p-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" />
              最近入库记录 (History)
            </h3>
            <div className="space-y-6">
              {history.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{item.name}</p>
                      <span className={`text-[10px] font-bold ${item.status === '预警' ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded-full`}>+{item.qty}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.orderId}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 pt-6 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              查看完整历史记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupplyChainClosedLoopView = () => {
  const [activeTab, setActiveTab] = useState<"arrival" | "distribution" | "reconciliation" | "flow">("flow");
  
  const PROCUREMENT_DATA = [
    { id: "PO-20240301", material: "精梳棉 32S/1", supplier: "华纺集团", expected: 5000, actual: 4985, status: "已入库", variance: -15, date: "2024-03-28" },
    { id: "PO-20240305", material: "YKK 拉链", supplier: "威富辅料", expected: 10000, actual: 10000, status: "待确认", variance: 0, date: "2024-03-29" },
  ];

  const DISTRIBUTION_DATA = [
    { id: "DIS-001", orderId: "ORD-001", factory: "锦绣一厂", material: "精梳棉", qty: 1200, type: "总仓分发", outputTarget: 1000, currentOutput: 850 },
    { id: "DIS-002", orderId: "ORD-002", factory: "外协 A 厂", material: "羊绒混纺", qty: 500, type: "直接外发", outputTarget: 400, currentOutput: 0 },
  ];

  const MATERIAL_FLOW_DATA = [
    {
      id: "MT-2024-001",
      material: "精梳棉 32S/1",
      order: "ORD-2024-001",
      stages: [
        { name: "采购确认", status: "completed", qty: "5000 KG", date: "03-15", detail: "PO-20240301", icon: <ShoppingCart size={16} /> },
        { name: "到货质检", status: "completed", qty: "4985 KG", date: "03-20", detail: "合格率 99.7%", icon: <ShieldCheck size={16} /> },
        { name: "原材料入库", status: "completed", qty: "4985 KG", date: "03-20", detail: "A区-04架", icon: <Warehouse size={16} /> },
        { name: "生产领料", status: "completed", qty: "1200 KG", date: "03-25", detail: "工单: WO-001", icon: <ClipboardList size={16} /> },
        { name: "车间在制", status: "processing", qty: "1000 件", date: "进行中", detail: "当前工序: 套口", icon: <Activity size={16} /> },
        { name: "成品入库", status: "pending", qty: "预计 980 件", date: "待定", detail: "待完工", icon: <CheckCircle2 size={16} /> },
      ]
    },
    {
      id: "MT-2024-002",
      material: "YKK 拉链",
      order: "ORD-2024-002",
      stages: [
        { name: "采购确认", status: "completed", qty: "10000 条", date: "03-18", detail: "PO-20240305", icon: <ShoppingCart size={16} /> },
        { name: "到货质检", status: "completed", qty: "10000 条", date: "03-22", detail: "合格率 100%", icon: <ShieldCheck size={16} /> },
        { name: "原材料入库", status: "completed", qty: "10000 条", date: "03-22", detail: "B区-12架", icon: <Warehouse size={16} /> },
        { name: "生产领料", status: "pending", qty: "0 条", date: "未开始", detail: "等待工单", icon: <ClipboardList size={16} /> },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">供应链全链路闭环监控</h1>
          <p className="text-sm text-slate-500">从采购确认到成品产出的全生命周期物料追踪</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("flow")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'flow' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            全链路追踪
          </button>
          <button 
            onClick={() => setActiveTab("arrival")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'arrival' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            到货确认
          </button>
          <button 
            onClick={() => setActiveTab("distribution")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'distribution' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            外协分发
          </button>
          <button 
            onClick={() => setActiveTab("reconciliation")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'reconciliation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            闭环对账
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "flow" && (
          <motion.div 
            key="flow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {MATERIAL_FLOW_DATA.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <GitBranch size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{item.material}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">追踪编号: {item.id} · 关联订单: {item.order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                      查看详情
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors">
                      异常上报
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="relative flex justify-between">
                    {/* Background Line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
                    
                    {item.stages.map((stage, sIdx) => (
                      <div key={sIdx} className="relative z-10 flex flex-col items-center text-center group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          stage.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                          stage.status === 'processing' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 animate-pulse' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {stage.icon}
                        </div>
                        <div className="mt-4 space-y-1">
                          <p className={`text-xs font-bold ${stage.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{stage.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{stage.qty}</p>
                          <div className="pt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              stage.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                              stage.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                              'bg-slate-50 text-slate-400'
                            }`}>
                              {stage.date}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 italic mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{stage.detail}</p>
                        </div>
                        
                        {sIdx < item.stages.length - 1 && (
                          <div className="absolute top-5 left-full w-full flex justify-center -translate-x-1/2">
                            <ArrowRight size={12} className={stage.status === 'completed' ? 'text-emerald-500' : 'text-slate-200'} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "arrival" && (
          <motion.div 
            key="arrival"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-blue-500" />
                采购到货确认 (账实核对)
              </h3>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors">
                批量确认入库
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">采购单号</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">物料名称</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">供应商</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">预计到货</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">实际入库</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">差异记录</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">状态</th>
                </tr>
              </thead>
              <tbody>
                {PROCUREMENT_DATA.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-700">{item.id}</td>
                    <td className="p-4 text-xs text-slate-600">{item.material}</td>
                    <td className="p-4 text-xs text-slate-500">{item.supplier}</td>
                    <td className="p-4 text-xs text-slate-600 text-right font-mono">{item.expected}</td>
                    <td className="p-4 text-xs text-slate-900 text-right font-mono font-bold">{item.actual}</td>
                    <td className="p-4 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.variance < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {item.variance > 0 ? `+${item.variance}` : item.variance}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === '已入库' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "distribution" && (
          <motion.div 
            key="distribution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Warehouse size={18} className="text-indigo-500" />
                  物料分发与外发管理
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {DISTRIBUTION_DATA.map((item, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.id} · {item.orderId}</p>
                        <p className="text-sm font-bold text-slate-800">{item.factory}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === '直接外发' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">分发物料:</span>
                        <span className="font-bold text-slate-700">{item.material} ({item.qty} KG)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">预计产出:</span>
                        <span className="font-bold text-slate-700">{item.outputTarget} 件</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400 font-bold uppercase">当前产出进度</span>
                          <span className="text-indigo-600 font-bold">{((item.currentOutput / item.outputTarget) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${(item.currentOutput / item.outputTarget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-400" />
                分发差异预警
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-amber-400 mb-1">外协 A 厂 (直接外发)</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    面料由供应商直接发往 A 厂，系统记录预计 500KG，A 厂反馈实收 480KG。
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold">发起核销</button>
                    <button className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-bold">联系供应商</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "reconciliation" && (
          <motion.div 
            key="reconciliation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                全链路闭环对账 (投入产出比分析)
              </h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">面料总投入</p>
                  <p className="text-xl font-bold text-slate-900 font-mono">12,450 KG</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">成品总产出</p>
                  <p className="text-xl font-bold text-slate-900 font-mono">8,240 件</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">综合损耗率</p>
                  <p className="text-xl font-bold text-emerald-700 font-mono">4.2%</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">异常损耗金额</p>
                  <p className="text-xl font-bold text-amber-700 font-mono">¥12,400</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase">订单级闭环追踪</h4>
                <div className="space-y-3">
                  {[
                    { order: "ORD-001", material: "精梳棉", input: 1200, output: 1000, loss: "3.5%", status: "已结案" },
                    { order: "ORD-002", material: "羊绒混纺", input: 500, output: 400, loss: "5.2%", status: "生产中" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                          <ClipboardList size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{row.order}</p>
                          <p className="text-xs text-slate-500">{row.material}</p>
                        </div>
                      </div>
                      <div className="flex gap-12 text-right">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">投入/产出</p>
                          <p className="text-xs font-bold text-slate-700">{row.input}kg / {row.output}件</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">损耗率</p>
                          <p className={`text-xs font-bold ${parseFloat(row.loss) > 5 ? 'text-rose-600' : 'text-emerald-600'}`}>{row.loss}</p>
                        </div>
                        <div className="w-20">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">状态</p>
                          <p className="text-xs font-bold text-slate-600">{row.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrderLifecycleSimulationView = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState({
    orderId: "ORD-2024-SIM",
    style: "针织连帽卫衣-2024春季款",
    qty: 5000,
    bomStatus: "已确认",
    procurementStatus: "进行中",
    inboundStatus: "部分入库",
    productionPlan: "自产(3000) + 外协(2000)",
    progress: {
      cutting: 100,
      sewing: 65,
      post: 20,
      packaging: 0
    },
    settlement: {
      budget: 125000,
      actual: 128500,
      variance: 3500
    }
  });

  const STEPS = [
    { id: "bom", label: "BOM与打样", icon: <Shirt size={18} />, color: "blue" },
    { id: "procurement", label: "采购与入库", icon: <Truck size={18} />, color: "amber" },
    { id: "planning", label: "生产计划", icon: <ClipboardList size={18} />, color: "indigo" },
    { id: "production", label: "生产执行", icon: <Activity size={18} />, color: "emerald" },
    { id: "settlement", label: "出货与结算", icon: <Scale size={18} />, color: "rose" }
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">订单全生命周期模拟 (Order Command Center)</h1>
          <p className="text-sm text-slate-500">从打样到结算的全流程优化检查与实时模拟</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevStep} disabled={currentStep === 0} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">上一步</button>
          <button onClick={nextStep} disabled={currentStep === STEPS.length - 1} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">下一步</button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                idx <= currentStep ? `bg-${step.color}-500 text-white shadow-lg` : "bg-white border-2 border-slate-200 text-slate-400"
              }`}>
                {idx < currentStep ? <CheckCircle2 size={20} /> : step.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${idx <= currentStep ? `text-${step.color}-600` : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Simulation Area */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">打样与 BOM 确认 (Sampling & BOM)</h3>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">阶段 01</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">打样版本</p>
                    <p className="text-sm font-bold text-slate-700">V2.1 - 确认版</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">BOM 完整度</p>
                    <p className="text-sm font-bold text-emerald-600">100% (含面辅料)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">关键物料清单 (Critical BOM)</h4>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="pb-2">物料名称</th>
                        <th className="pb-2">标准用量</th>
                        <th className="pb-2">损耗预设</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-3">精梳棉面料</td><td className="py-3">1.2M / 件</td><td className="py-3 text-rose-500">3%</td></tr>
                      <tr><td className="py-3">YKK 拉链</td><td className="py-3">1 条 / 件</td><td className="py-3 text-emerald-500">0.5%</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <Zap className="text-amber-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-amber-900">优化建议 (Optimization):</p>
                    <p className="text-[10px] text-amber-800 mt-1">建议将面料损耗率从 3% 调整为 2.8%，基于历史同类款式生产数据，可节省约 ¥4,500 成本。</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">采购与原材料入库 (Procurement & Inbound)</h3>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase">阶段 02</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">采购单状态</p>
                    <p className="text-sm font-bold text-slate-700">已发单 (PO-099)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">到货率</p>
                    <p className="text-sm font-bold text-amber-600">85%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">检验合格率</p>
                    <p className="text-sm font-bold text-emerald-600">99.2%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">入库确认 (Inbound Confirmation)</h4>
                    <span className="text-[10px] text-slate-400">扫码入库已启用</span>
                  </div>
                  <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-4 bg-slate-50/50">
                    <Scan size={24} className="text-slate-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-600">等待扫描物料条码...</p>
                      <p className="text-[10px] text-slate-400">自动匹配采购单 PO-099</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">闭环优化 (Closed-loop):</p>
                    <p className="text-[10px] text-emerald-800 mt-1">面料已通过智能入库校验，系统自动触发“生产领料”预通知，减少等待时间 4 小时。</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">生产计划与产能分配 (Planning)</h3>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase">阶段 03</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Warehouse size={18} className="text-indigo-600" />
                      <h4 className="text-sm font-bold text-indigo-900">自有针织工厂 (Internal)</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-indigo-700 font-bold uppercase">分配数量</p>
                        <p className="text-2xl font-bold text-indigo-900">3,000 件</p>
                      </div>
                      <p className="text-[10px] text-indigo-600 font-bold">产能利用率: 88%</p>
                    </div>
                    <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-amber-600" />
                      <h4 className="text-sm font-bold text-amber-900">外加工工厂 A (Subcontractor)</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-amber-700 font-bold uppercase">分配数量</p>
                        <p className="text-2xl font-bold text-amber-900">2,000 件</p>
                      </div>
                      <p className="text-[10px] text-amber-600 font-bold">交期风险: 低</p>
                    </div>
                    <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Activity className="text-blue-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-blue-900">智能调度 (Smart Scheduling):</p>
                    <p className="text-[10px] text-blue-800 mt-1">根据外协工厂 A 的实时反馈，其缝制环节尚有余量，建议将 500 件订单从自有工厂调拨至外协，以优化整体交付周期。</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">生产执行全流程 (Execution)</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">阶段 04</span>
                </div>
                <div className="space-y-6">
                  {[
                    { name: "裁剪 (Cutting)", progress: 100, status: "已完成", color: "emerald" },
                    { name: "缝制 (Sewing)", progress: 65, status: "进行中", color: "blue" },
                    { name: "后道 (Post-processing)", progress: 20, status: "进行中", color: "amber" },
                    { name: "包装 (Packaging)", progress: 0, status: "待开始", color: "slate" }
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">{step.name}</span>
                        <span className={`text-[10px] font-bold text-${step.color}-600 uppercase`}>{step.status} {step.progress}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${step.progress}%` }}
                          className={`h-full bg-${step.color}-500`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                  <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-rose-900">异常监控 (Exception):</p>
                    <p className="text-[10px] text-rose-800 mt-1">缝制环节检测到 2% 的返工率，高于预设阈值 (1.5%)。系统已自动推送质量预警至车间主任，并建议检查 3 号生产线的针迹设置。</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">出货与财务结算 (Shipping & Settlement)</h3>
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold uppercase">阶段 05</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">出货确认 (Shipping)</h4>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">计划出货</span>
                        <span className="text-sm font-bold text-slate-900">5,000 件</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">实际入库</span>
                        <span className="text-sm font-bold text-emerald-600">4,985 件</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-600">差异 (损耗)</span>
                        <span className="text-sm font-bold text-rose-600">-15 件 (0.3%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">利润模型结算 (Settlement)</h4>
                    <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700">预算成本</span>
                        <span className="text-sm font-bold text-slate-900">¥125,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700">实际成本</span>
                        <span className="text-sm font-bold text-rose-600">¥128,500</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                        <span className="text-sm font-bold text-emerald-800">最终毛利</span>
                        <span className="text-lg font-bold text-emerald-600">¥42,500</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <BarChart3 className="text-indigo-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-indigo-900">结算优化 (Settlement Insights):</p>
                    <p className="text-[10px] text-indigo-800 mt-1">本单实际成本超出预算 2.8%，主要原因为缝制环节返工导致的工时增加。建议在下个类似订单中优化工艺单说明，并加强首件检验。</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">当前模拟订单</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400">订单编号</p>
                  <p className="text-lg font-bold font-mono">{orderData.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">款式名称</p>
                  <p className="text-sm font-bold">{orderData.style}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-slate-400">订单数量</p>
                    <p className="text-sm font-bold">{orderData.qty} 件</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">当前阶段</p>
                    <p className="text-sm font-bold text-emerald-400">{STEPS[currentStep].label}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">全流程健康度</h4>
              <div className="space-y-6">
                {[
                  { label: "物料供应", val: 92, color: "emerald" },
                  { label: "生产进度", val: 78, color: "blue" },
                  { label: "质量控制", val: 95, color: "emerald" },
                  { label: "成本控制", val: 65, color: "amber" }
                ].map((m, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 uppercase">{m.label}</span>
                      <span className={`text-${m.color}-600`}>{m.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-${m.color}-500`} style={{ width: `${m.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
              <Download size={18} />
              导出全流程优化报告
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const MaterialPickingView = () => {
  const [pickingType, setPickingType] = useState<"production" | "replenishment">("production");
  const [orderId, setOrderId] = useState("ORD-2024-001");
  const [unit, setUnit] = useState("KG");
  const [standardQty, setStandardQty] = useState(1000);
  const [actualQty, setActualQty] = useState(1000);
  const [reasonCode, setReasonCode] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMaterial, setScannedMaterial] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [scanMode, setScanMode] = useState<"set" | "increment">("set");
  const [recentScans, setRecentScans] = useState<string[]>([]);

  const scanInputRef = useRef<HTMLInputElement>(null);

  // 模拟物料条码数据库
  const MATERIAL_DATABASE: Record<string, any> = {
    "6901234567890": { name: "32S 精梳棉", unit: "KG", standardQty: 500, orderId: "ORD-2024-001" },
    "6901234567891": { name: "40S 丝光棉", unit: "M", standardQty: 1200, orderId: "ORD-2024-002" },
    "QR-YARN-003": { name: "高弹丝", unit: "KG", standardQty: 50, orderId: "ORD-2024-003" },
  };

  const handleScan = (code: string) => {
    const material = MATERIAL_DATABASE[code];
    if (material) {
      // 记录最近扫描
      setRecentScans(prev => [code, ...prev].slice(0, 5));

      if (scanMode === "increment") {
        // 增量模式：如果扫描的是当前正在操作的物料，则累加数量
        if (scannedMaterial && scannedMaterial.name === material.name && orderId === material.orderId) {
          setActualQty(prev => prev + 1);
        } else {
          // 如果是新物料，则切换并设为 1
          setOrderId(material.orderId);
          setUnit(material.unit);
          setStandardQty(material.standardQty);
          setActualQty(1);
          setScannedMaterial(material);
        }
      } else {
        // 覆盖模式：直接填入标准量
        setOrderId(material.orderId);
        setUnit(material.unit);
        setStandardQty(material.standardQty);
        setActualQty(material.standardQty);
        setScannedMaterial(material);
      }
      
      setScanStatus("success");
      setScanInput("");
      setTimeout(() => setScanStatus("idle"), 1000);
    } else {
      setScanStatus("error");
      setErrorMsg("未识别的条码，请检查物料标签");
      setShowError(true);
      setTimeout(() => {
        setScanStatus("idle");
        setShowError(false);
      }, 3000);
    }
  };

  const onScanInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScanInput(value);
    // 模拟 PDA 扫描器通常在结尾发送回车符
    if (value.endsWith("\n") || value.length > 12) { // 简单模拟
      handleScan(value.trim());
    }
  };

  const toggleScanMode = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  // 模拟历史记录
  const [pickingHistory, setPickingHistory] = useState([
    { id: "PK-001", orderId: "ORD-2024-001", type: "production", item: "32S 精梳棉", qty: 1000, unit: "KG", status: "completed", date: "2024-03-28" },
    { id: "PK-002", orderId: "ORD-2024-001", type: "replenishment", item: "32S 精梳棉", qty: 50, unit: "KG", status: "pending", date: "2024-03-29" },
    { id: "PK-003", orderId: "ORD-2024-002", type: "production", item: "40S 丝光棉", qty: 2500, unit: "M", status: "completed", date: "2024-03-29" },
  ]);

  // 预设的有效差异原因代码
  const VALID_REASON_CODES = ["01", "02", "03", "04", "99"];

  // 差异原因提示信息映射
  const REASON_TIPS: Record<string, string> = {
    "01": "【质量提示】面料疵点属于供应端质量问题，请同步记录疵点类型（如抽纱、色差）以便后续索赔。",
    "02": "【管理提示】裁剪损耗属于车间管理问题，请核实是否为排版不当或裁剪失误，并记录责任工位。",
    "03": "【技术提示】缩率异常可能影响成品尺寸，请立即通知工艺部重新核定该批次面料的缩率参数。",
    "04": "【业务提示】紧急补单属于前端需求变更，请确认补单数量已获得业务部及客户的正式确认。",
    "99": "【其他提示】请在备注中详细说明差异原因，以便后续归类分析。"
  };

  const variance = actualQty - standardQty;
  const varianceRate = standardQty > 0 ? (variance / standardQty) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setErrorMsg("");
    setIsSubmitted(false);
    setRequiresApproval(false);

    if (actualQty > standardQty) {
      if (!reasonCode) {
        setShowError(true);
        setErrorMsg("检测到超领，请必须选择差异原因代码");
        return;
      }
      if (!VALID_REASON_CODES.includes(reasonCode)) {
        setShowError(true);
        setErrorMsg("无效的差异原因代码，请重新选择");
        return;
      }
    }

    if (varianceRate > 5) {
      setRequiresApproval(true);
    }

    setIsSubmitted(true);
    
    // 模拟添加到历史
    const newRecord = {
      id: `PK-00${pickingHistory.length + 1}`,
      orderId,
      type: pickingType,
      item: "当前物料",
      qty: actualQty,
      unit,
      status: varianceRate > 5 ? "pending" : "completed",
      date: new Date().toISOString().split('T')[0]
    };
    setPickingHistory([newRecord, ...pickingHistory]);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">领料与补料统一管理</h1>
            <p className="text-sm text-slate-500">集成生产前标准领料与生产中异常补料流程</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setPickingType("production")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${pickingType === "production" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            生产前领料
          </button>
          <button 
            onClick={() => setPickingType("replenishment")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${pickingType === "replenishment" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            补货领料
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Form Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-amber-500" />
                新增领料登记
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleScanMode}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isScanning ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Scan size={14} />
                  {isScanning ? 'PDA 扫码模式中' : '开启 PDA 扫码'}
                </button>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${pickingType === 'production' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                  {pickingType === 'production' ? '生产前标准领料' : '生产中异常补料'}
                </span>
              </div>
            </div>

            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase">等待 PDA 扫描物料条码...</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setScanMode("set")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${scanMode === 'set' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}
                    >
                      单次覆盖
                    </button>
                    <button 
                      onClick={() => setScanMode("increment")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${scanMode === 'increment' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}
                    >
                      逐个累加
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    ref={scanInputRef}
                    type="text"
                    value={scanInput}
                    onChange={onScanInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan(scanInput)}
                    placeholder="请使用 PDA 扫描枪或手动输入条码..."
                    className={`w-full p-3 bg-white border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 ${
                      scanStatus === 'error' ? 'border-rose-300 ring-rose-500/20' : 'border-indigo-200 focus:ring-indigo-500/20'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                      onClick={() => handleScan("6901234567890")}
                      className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded hover:bg-indigo-200"
                    >
                      模拟扫码 (棉)
                    </button>
                    <button 
                      onClick={() => handleScan("QR-YARN-003")}
                      className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded hover:bg-indigo-200"
                    >
                      模拟扫码 (丝)
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {scannedMaterial ? (
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Package size={12} />
                        <span>已识别物料:</span>
                        <span className="font-bold text-slate-900">{scannedMaterial.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Target size={12} />
                        <span>标准量:</span>
                        <span className="font-bold text-slate-900">{scannedMaterial.standardQty} {scannedMaterial.unit}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400">暂无扫描数据</div>
                  )}
                  {recentScans.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">最近扫描:</span>
                      <div className="flex gap-1">
                        {recentScans.map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-mono">
                            {s.slice(-4)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">关联订单编号</label>
                  <input 
                    type="text" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">物料单位</label>
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="KG">KG (公斤)</option>
                    <option value="M">M (米)</option>
                    <option value="Y">Y (码)</option>
                    <option value="PCS">PCS (件)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">BOM 标准用量 ({unit})</label>
                  <input 
                    type="number" 
                    value={standardQty}
                    onChange={(e) => setStandardQty(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">实际领料数量 ({unit})</label>
                  <input 
                    type="number" 
                    value={actualQty}
                    onChange={(e) => setActualQty(Number(e.target.value))}
                    className={`w-full p-3 border rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 ${
                      actualQty > standardQty ? 'bg-rose-50 border-rose-200 text-rose-600 focus:ring-rose-500/20' : 'bg-slate-50 border-slate-100 text-slate-700 focus:ring-amber-500/20'
                    }`}
                  />
                </div>
              </div>

              {actualQty > standardQty && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-rose-500 uppercase">差异原因代码 (超领必填)</label>
                  <select 
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      showError && !reasonCode ? 'bg-rose-50 border-rose-500 focus:ring-rose-500/20' : 'bg-rose-50 border-rose-200 focus:ring-rose-500/20'
                    }`}
                  >
                    <option value="">请选择差异原因...</option>
                    <option value="01">01 - 面料疵点 (需补片)</option>
                    <option value="02">02 - 裁剪损耗 (人为失误)</option>
                    <option value="03">03 - 缩率异常 (面料问题)</option>
                    <option value="04">04 - 紧急补单 (业务变更)</option>
                    <option value="99">99 - 其他 (非预设代码测试用)</option>
                  </select>
                  {showError && (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errorMsg}
                    </p>
                  )}
                  {!showError && reasonCode && REASON_TIPS[reasonCode] && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
                    >
                      <p className="text-[11px] text-amber-700 leading-relaxed flex gap-2">
                        <Zap size={14} className="shrink-0 mt-0.5 text-amber-500" />
                        {REASON_TIPS[reasonCode]}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                确认领料登记
              </button>
            </form>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-indigo-500" />
                领料历史记录
              </h3>
              <button className="text-xs text-indigo-600 font-bold hover:underline">查看全部</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-8 py-4">单据编号</th>
                    <th className="px-8 py-4">订单号</th>
                    <th className="px-8 py-4">类型</th>
                    <th className="px-8 py-4">物料</th>
                    <th className="px-8 py-4 text-right">数量</th>
                    <th className="px-8 py-4">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pickingHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-xs font-bold text-slate-500">{item.id}</td>
                      <td className="px-8 py-4 font-medium text-slate-700">{item.orderId}</td>
                      <td className="px-8 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'production' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                          {item.type === 'production' ? '生产领料' : '补料'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-slate-600">{item.item}</td>
                      <td className="px-8 py-4 text-right font-mono font-bold text-slate-900">{item.qty} {item.unit}</td>
                      <td className="px-8 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                          item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {item.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {item.status === 'completed' ? '已发放' : '待审批'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">实时差异分析</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-sm text-slate-500 font-medium">差异数量</p>
                <p className={`text-xl font-mono font-bold ${variance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {variance > 0 ? `+${variance}` : variance} {unit}
                </p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-sm text-slate-500 font-medium">差异率</p>
                <p className={`text-xl font-mono font-bold ${varianceRate > 5 ? 'text-rose-600' : varianceRate > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {varianceRate.toFixed(2)}%
                </p>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max(varianceRate, 0), 100)}%` }}
                  className={`h-full ${varianceRate > 5 ? 'bg-rose-500' : 'bg-amber-500'}`}
                />
              </div>
            </div>
          </div>

          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-3xl border flex flex-col items-center text-center gap-3 ${
                requiresApproval ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              {requiresApproval ? (
                <>
                  <AlertTriangle className="text-rose-500" size={32} />
                  <div>
                    <p className="font-bold text-rose-900">触发超额审批工作流</p>
                    <p className="text-xs text-rose-700 mt-1">物料领用差异率超过 5%，系统已自动将领料记录发送给【车间主管】进行审批。审批通过后方可正式发料。</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="text-emerald-500" size={32} />
                  <div>
                    <p className="font-bold text-emerald-900">登记成功</p>
                    <p className="text-xs text-emerald-700 mt-1">领料信息已记录，差异在允许范围内。请前往仓库窗口领取物料。</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              领料流程优化点
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-bold">合并补领流程：</span> 统一入口管理，历史记录中可清晰区分标准领料与异常补料，便于后续损耗分析。
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-bold">差异原因强制化：</span> 凡是超领必须选择原因代码，为 BOM 准确度优化提供大数据支持。
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-bold">自动审批触发：</span> 差异率 &gt; 5% 自动拦截并转人工审批，平衡效率与风险控制。
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArchitectureView = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-indigo-600">
          <FileCode size={32} />
          <h1 className="text-3xl font-bold tracking-tight">若依 (RuoYi) 单体版构建指南</h1>
        </div>
        <p className="text-slate-600 text-lg leading-relaxed">
          根据您提供的文档 (<a href="https://doc.ruoyi.vip/ruoyi/" target="_blank" className="text-indigo-600 underline">doc.ruoyi.vip/ruoyi/</a>)，
          这是若依的<b>单体版本</b>，基于 Spring Boot、Apache Shiro、Thymeleaf 和 Bootstrap 构建。
          以下是针对该版本的 ERP 系统构建路径。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="text-blue-500" size={20} />
            后端架构 (Spring Boot + Shiro)
          </h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-blue-600">Apache Shiro 权限</span>
              <p className="text-slate-500 mt-1">使用 Shiro 进行身份验证和授权。通过 `@RequiresPermissions` 注解控制老板、财务等角色的访问。</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-blue-600">MyBatis 映射</span>
              <p className="text-slate-500 mt-1">在 `ruoyi-system` 模块中定义 Mapper 接口和 XML，处理复杂的针织行业订单关联查询。</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-blue-600">模块化结构</span>
              <p className="text-slate-500 mt-1">`ruoyi-admin` (核心入口), `ruoyi-system` (业务逻辑), `ruoyi-common` (工具类)。</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="text-emerald-500" size={20} />
            前端架构 (Thymeleaf + Bootstrap)
          </h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-emerald-600">Thymeleaf 模板</span>
              <p className="text-slate-500 mt-1">页面位于 `resources/templates`。使用 `th:text` 等指令渲染后端传来的 ERP 数据。</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-emerald-600">Bootstrap + jQuery</span>
              <p className="text-slate-500 mt-1">使用 RuoYi 封装的 `$.table` 和 `$.operate` 插件快速实现订单列表和弹窗操作。</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-emerald-600">静态资源</span>
              <p className="text-slate-500 mt-1">JS/CSS 位于 `resources/static`。集成 ECharts 实现老板座舱的图表展示。</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Server className="text-amber-500" size={20} />
            多工厂协同与部署建议 (分工厂使用)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
              <p className="font-bold text-amber-900">1. 是否需要服务器？</p>
              <p className="text-amber-800 leading-relaxed">
                <b>必须。</b> 若要分工厂访问，系统不能只跑在您的个人电脑上。您需要一台云服务器（如阿里云/腾讯云）或公司内部服务器，并配置固定 IP 或域名，让分工厂通过浏览器访问。
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
              <p className="font-bold text-amber-900">2. 性能表现如何？</p>
              <p className="text-amber-800 leading-relaxed">
                <b>单机性能强劲。</b> 若依单体版在 4 核 8G 的服务器上，配合 Redis 缓存，足以支撑 200-500 人同时在线。对于一般的针织厂+几个分工厂，单体版的响应速度非常快。
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
              <p className="font-bold text-amber-900">3. 还用单体版本吗？</p>
              <p className="text-amber-800 leading-relaxed">
                <b>建议继续使用单体版。</b> 除非您的分工厂超过 20 个且数据量达到千万级，否则单体版在开发效率、部署难度和运维成本上都远优于微服务版。
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Cloud className="text-sky-500" size={20} />
            阿里云部署与数据备份方案
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Server size={16} className="text-slate-400" />
                1. 阿里云服务器配置建议
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                  <span><b>实例规格：</b> 推荐选用 <b>ECS 共享型 s6</b> 或 <b>计算型 c6</b>，配置 2 核 4G 或 4 核 8G。</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                  <span><b>操作系统：</b> 推荐使用 <b>CentOS 7.9</b> 或 <b>Ubuntu 20.04</b>，稳定性高且社区文档丰富。</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                  <span><b>数据库：</b> 预算充足建议使用 <b>RDS MySQL 版</b>（自带备份），预算有限可直接在 ECS 上安装 MySQL。</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-slate-400" />
                2. 数据备份与安全策略
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                  <span><b>自动快照：</b> 开启阿里云 ECS 的 <b>自动快照策略</b>，每天凌晨自动备份系统盘，防止系统崩溃。</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                  <span><b>数据库备份：</b> 编写 Shell 脚本，每日定时执行 `mysqldump` 并将 SQL 文件上传至 <b>OSS 对象存储</b>。</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                  <span><b>代码备份：</b> 核心代码务必托管在 <b>Gitee</b> 或 <b>GitHub</b> 私有仓库，确保版本可追溯。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Zap className="text-yellow-400" />
          本地部署 4 步走
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold">环境搭建</h3>
            <p className="text-slate-400 text-sm">安装 JDK 1.8+, Maven 3.0+, MySQL 5.7+。</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold">导入数据库</h3>
            <p className="text-slate-400 text-sm">执行 `ry_202x.sql` 和 `quartz.sql` 初始化系统表。</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">3</div>
            <h3 className="font-bold">修改配置</h3>
            <p className="text-slate-400 text-sm">编辑 `application-druid.yml` 修改数据库账号密码。</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">4</div>
            <h3 className="font-bold">运行项目</h3>
            <p className="text-slate-400 text-sm">IDE 运行 `RuoYiApplication.java`，访问 localhost 即可。</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 md:col-span-2">
          <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <TargetIcon size={20} />
            ERP 核心模块迁移建议
          </h2>
          <div className="space-y-4 text-sm text-indigo-800">
            <div className="flex gap-3">
              <div className="font-bold whitespace-nowrap">代码生成器：</div>
              <p>利用若依的“代码生成”功能，直接根据 MySQL 的 `erp_order` 表生成完整的 Controller、Service、Mapper 和 HTML 页面。</p>
            </div>
            <div className="flex gap-3">
              <div className="font-bold whitespace-nowrap">字典管理：</div>
              <p>将订单状态（待处理、已发货）、物料类型（面料、辅料）配置在若依的“字典管理”中，方便全局维护。</p>
            </div>
            <div className="flex gap-3">
              <div className="font-bold whitespace-nowrap">定时任务：</div>
              <p>使用内置的 Quartz 模块，实现自动核算月度成本、自动提醒退税办理等功能。</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">版本选择建议</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <p className="p-2 bg-white rounded border border-slate-100">
              <span className="font-bold text-indigo-600">单体版 (Shiro)：</span> 适合中小型工厂，部署简单，开发速度极快。
            </p>
            <p className="p-2 bg-white rounded border border-slate-100">
              <span className="font-bold text-emerald-600">前后端分离版 (Vue)：</span> 适合对 UI 交互要求高、有专职前端的项目。
            </p>
            <p className="p-2 bg-white rounded border border-slate-100">
              <span className="font-bold text-blue-600">微服务版 (Cloud)：</span> 适合大型集团化 ERP，支持高并发和分布式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(STYLES[0]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSortConfig, setOrderSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'date', direction: 'desc' });
  const [orderFilters, setOrderFilters] = useState({ id: '', customer: '', status: '' });
  const [productionFilters, setProductionFilters] = useState({ searchTerm: '', status: '', step: '', horizon: 'all' });
  const [productionProgress, setProductionProgress] = useState(PRODUCTION_PROGRESS);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success' | 'warning'}[]>([]);

  // 自动清理通知
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(0, -1));
      }, 8000); // 8秒后自动移除最旧的一条
      return () => clearTimeout(timer);
    }
  }, [notifications]);
  const [tasks, setTasks] = useState<{
    id: string;
    orderId: string;
    step: string;
    assignee: string;
    status: 'pending' | 'completed';
    createdAt: string;
  }[]>([]);
  const [yarnThresholds, setYarnThresholds] = useState({
    lowStock: 500,
    criticalStock: 200,
    type: 'quantity' as 'quantity' | 'days'
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // 切换视图时平滑滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentView]);

  const [showFilters, setShowFilters] = useState(false);
  const [customCosts, setCustomCosts] = useState<any[]>([]);
  const [newCost, setNewCost] = useState({ label: '', value: '', standardValue: '', type: 'indirect', sub: '' });
  const [showAddCost, setShowAddCost] = useState(false);
  const [standardLaborCost, setStandardLaborCost] = useState(34.00);
  const [isEditingLaborStandard, setIsEditingLaborStandard] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [activeCompletion, setActiveCompletion] = useState<any>(null);
  const [completionForm, setCompletionForm] = useState({ actualQty: 0, bQty: 0, worker: '', notes: '' });

  const completeStep = (orderId: string) => {
    const item = productionProgress.find(i => i.orderId === orderId);
    if (!item) return;

    setActiveCompletion(item);
    setCompletionForm({ 
      actualQty: item.qty, 
      bQty: 0,
      worker: STEP_RESPONSIBILITIES[PRODUCTION_STEPS[item.currentStep]]?.split('-')[1] || '', 
      notes: '' 
    });
    setShowCompletionModal(true);
  };

  const handleConfirmCompletion = () => {
    if (!activeCompletion) return;
    const { orderId } = activeCompletion;
    const item = productionProgress.find(i => i.orderId === orderId);
    if (!item) return;

    const nextStepIdx = Math.min(item.currentStep + 1, PRODUCTION_STEPS.length - 1);
    const finishTime = new Date().toLocaleString();
    
    if (nextStepIdx >= item.currentStep) {
      const prevStepName = PRODUCTION_STEPS[item.currentStep];
      const nextStepName = PRODUCTION_STEPS[nextStepIdx];
      const assignee = STEP_RESPONSIBILITIES[nextStepName] || "相关负责人";
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1. 更新生产进度
      setProductionProgress(prev => prev.map(p => {
        if (p.orderId === orderId) {
          // 同步更新子工序状态
          const updatedSubSteps = p.subSteps?.map(sub => {
            if (nextStepIdx === PRODUCTION_STEPS.length - 1) {
              return { ...sub, status: 'completed' };
            }
            const currentStepName = PRODUCTION_STEPS[nextStepIdx];
            if (currentStepName.includes(sub.name)) {
              return { ...sub, status: 'in-progress' };
            }
            let hasPassed = false;
            for (let j = 0; j < nextStepIdx; j++) {
              if (PRODUCTION_STEPS[j].includes(sub.name)) {
                hasPassed = true;
                break;
              }
            }
            if (hasPassed) {
              return { ...sub, status: 'completed' };
            }
            return sub;
          });

          return {
            ...p,
            currentStep: nextStepIdx,
            progress: Math.round((nextStepIdx / (PRODUCTION_STEPS.length - 1)) * 100),
            actualFinishTime: finishTime,
            status: nextStepIdx === PRODUCTION_STEPS.length - 1 ? "completed" : p.status,
            subSteps: updatedSubSteps,
            // 记录本次完成的数据
            history: [
              ...(p.history || []),
              {
                step: prevStepName,
                actualQty: completionForm.actualQty,
                bQty: completionForm.bQty,
                worker: completionForm.worker,
                notes: completionForm.notes,
                time: finishTime
              }
            ]
          };
        }
        return p;
      }));

      // 2. 模拟发送外部消息
      console.log(`[DingTalk] 正在向 ${assignee} 发送消息: 订单 ${orderId} 的 ${prevStepName} 环节已完成，实收 A 品 ${completionForm.actualQty}，B 品 ${completionForm.bQty}，操作人 ${completionForm.worker}。请及时跟进 ${nextStepName}。`);

      // 3. 发送内部通知
      setNotifications(prev => [
        { id: `NOTIF-${uniqueId}`, message: `订单 ${orderId}：${prevStepName} 已完成 (A: ${completionForm.actualQty}, B: ${completionForm.bQty})。`, type: 'success' },
        ...prev
      ].slice(0, 5));

      // 4. 添加待办事项
      setTasks(prev => [
        {
          id: `TASK-${uniqueId}`,
          orderId,
          step: nextStepName,
          assignee,
          status: 'pending',
          createdAt: finishTime
        },
        ...prev
      ]);

      setShowCompletionModal(false);
      setActiveCompletion(null);
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
    setNotifications(prev => [
      { id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, message: "待办事项已标记为完成", type: 'success' },
      ...prev
    ].slice(0, 5));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (orderSortConfig.key === key && orderSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (orderSortConfig.key === key && orderSortConfig.direction === 'desc') {
      direction = null;
    }
    setOrderSortConfig({ key, direction });
  };

  const filteredOrders = useMemo(() => {
    return RECENT_ORDERS.filter(order => {
      return (
        order.id.toLowerCase().includes(orderFilters.id.toLowerCase()) &&
        order.customer.toLowerCase().includes(orderFilters.customer.toLowerCase()) &&
        (orderFilters.status === '' || order.status === orderFilters.status)
      );
    });
  }, [orderFilters]);

  const sortedOrders = useMemo(() => {
    if (!orderSortConfig.key || !orderSortConfig.direction) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      let aVal = a[orderSortConfig.key as keyof typeof a];
      let bVal = b[orderSortConfig.key as keyof typeof b];

      if (orderSortConfig.key === 'amount') {
        aVal = parseFloat(String(aVal).replace(/[¥,]/g, ''));
        bVal = parseFloat(String(bVal).replace(/[¥,]/g, ''));
      }

      if (aVal < bVal) return orderSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return orderSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, orderSortConfig]);

  const exportToCSV = () => {
    const headers = ["订单编号", "客户名称", "日期", "金额", "状态", "商品数量"];
    const rows = sortedOrders.map(order => [
      order.id,
      order.customer,
      order.date,
      order.amount.replace("¥", ""),
      order.status === "completed" ? "已完成" : order.status === "pending" ? "进行中" : "已取消",
      order.items
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `recent_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 经营报表</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          .card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <header class="flex justify-between items-end border-b pb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">富泉管理系统 - 经营报表</h1>
              <p class="text-slate-500 mt-2">生成时间: ${new Date().toLocaleString()}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-emerald-600">年度营收目标: ¥12.8M</p>
              <p class="text-xs text-slate-400">数据截止: 2024-03-28</p>
            </div>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${METRICS.map(m => `
              <div class="card">
                <p class="text-sm text-slate-500 font-medium">${m.label}</p>
                <div class="flex items-end justify-between mt-2">
                  <p class="text-2xl font-bold text-slate-900">${m.value}</p>
                  <span class="text-xs font-bold ${m.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}">
                    ${m.change}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="card overflow-hidden p-0">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 class="font-bold text-slate-800">最近订单明细</h2>
            </div>
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th class="px-6 py-4">订单编号</th>
                  <th class="px-6 py-4">客户名称</th>
                  <th class="px-6 py-4">日期</th>
                  <th class="px-6 py-4">金额</th>
                  <th class="px-6 py-4">状态</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${sortedOrders.map(o => `
                  <tr>
                    <td class="px-6 py-4 font-mono text-xs text-slate-600">${o.id}</td>
                    <td class="px-6 py-4 font-bold text-slate-800">${o.customer}</td>
                    <td class="px-6 py-4 text-slate-500">${o.date}</td>
                    <td class="px-6 py-4 font-bold text-slate-900">${o.amount}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-[10px] font-bold ${
                        o.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                        o.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }">
                        ${o.status === 'completed' ? '已完成' : o.status === 'pending' ? '进行中' : '已取消'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <footer class="text-center text-slate-400 text-xs py-8 border-t">
            © 2024 富泉服饰管理系统 - 数字化经营决策中心
          </footer>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fuquan_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProductionToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 生产进度报表</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          .card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <header class="flex justify-between items-end border-b pb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">生产进度全流程监控报表</h1>
              <p class="text-slate-500 mt-2">生成时间: ${new Date().toLocaleString()}</p>
            </div>
          </header>

          <div class="card overflow-hidden p-0">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th class="px-6 py-4">订单编号</th>
                  <th class="px-6 py-4">款式名称</th>
                  <th class="px-6 py-4">当前环节</th>
                  <th class="px-6 py-4">进度</th>
                  <th class="px-6 py-4">状态</th>
                  <th class="px-6 py-4">数量</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${productionProgress.map(p => `
                  <tr>
                    <td class="px-6 py-4 font-mono text-xs text-slate-600">${p.orderId}</td>
                    <td class="px-6 py-4 font-bold text-slate-800">${p.style}</td>
                    <td class="px-6 py-4 text-slate-500">${PRODUCTION_STEPS[p.currentStep]}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-emerald-500" style="width: ${p.progress}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-slate-400">${p.progress}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }">
                        ${p.status === 'normal' ? '正常' : '预警'}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold text-slate-900">${p.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `production_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportQualityToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 质量检验报表</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          .card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <header class="flex justify-between items-end border-b pb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">质量检验报表 (专家模型)</h1>
              <p class="text-slate-500 mt-2">生成时间: ${new Date().toLocaleString()}</p>
            </div>
          </header>

          <div class="card overflow-hidden p-0">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th class="px-6 py-4">检验日期</th>
                  <th class="px-6 py-4">批次编号</th>
                  <th class="px-6 py-4">检验类型</th>
                  <th class="px-6 py-4">检验项目</th>
                  <th class="px-6 py-4">结果</th>
                  <th class="px-6 py-4">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${[
                  { date: "2024-03-28", id: "QC-20240328-01", type: "在位检", item: "面料克重/缩率", result: "合格", note: "符合标准" },
                  { date: "2024-03-27", id: "QC-20240327-04", type: "出货检", item: "成衣尺寸检验", result: "合格", note: "腰围偏大0.5cm" },
                  { date: "2024-03-26", id: "QC-20240326-02", type: "第三方", item: "水洗色牢度", result: "合格", note: "4.5级" },
                ].map(qc => `
                  <tr>
                    <td class="px-6 py-4 text-slate-500">${qc.date}</td>
                    <td class="px-6 py-4 font-mono text-xs text-slate-600">${qc.id}</td>
                    <td class="px-6 py-4 text-slate-800">${qc.type}</td>
                    <td class="px-6 py-4 text-slate-800">${qc.item}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        ${qc.result}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-500">${qc.note}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `quality_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 库存报表</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          .card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <header class="flex justify-between items-end border-b pb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">库存报表 (多维监控)</h1>
              <p class="text-slate-500 mt-2">生成时间: ${new Date().toLocaleString()}</p>
            </div>
          </header>

          <div class="card overflow-hidden p-0">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th class="px-6 py-4">类目</th>
                  <th class="px-6 py-4">当前库存</th>
                  <th class="px-6 py-4">安全库存</th>
                  <th class="px-6 py-4">库存上限</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${INVENTORY_CHART_DATA.map(item => `
                  <tr>
                    <td class="px-6 py-4 font-bold text-slate-800">${item.category}</td>
                    <td class="px-6 py-4 font-bold text-emerald-600">${item.current}</td>
                    <td class="px-6 py-4 text-rose-600">${item.safety}</td>
                    <td class="px-6 py-4 text-slate-500">${item.max}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 销售报表</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          .card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <header class="flex justify-between items-end border-b pb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">销售报表 (专家模型)</h1>
              <p class="text-slate-500 mt-2">生成时间: ${new Date().toLocaleString()}</p>
            </div>
          </header>

          <div class="card overflow-hidden p-0">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th class="px-6 py-4">月份</th>
                  <th class="px-6 py-4">实际销售额</th>
                  <th class="px-6 py-4">预测销售额</th>
                  <th class="px-6 py-4">转化率</th>
                  <th class="px-6 py-4">客单价</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${SALES_CHART_DATA.map(item => `
                  <tr>
                    <td class="px-6 py-4 font-bold text-slate-800">${item.month}</td>
                    <td class="px-6 py-4 font-bold text-emerald-600">${item.sales ? '¥' + (item.sales / 10000).toFixed(1) + 'w' : '-'}</td>
                    <td class="px-6 py-4 text-slate-500">¥${(item.predicted / 10000).toFixed(1)}w</td>
                    <td class="px-6 py-4 text-indigo-600">${item.conversion}%</td>
                    <td class="px-6 py-4 text-slate-900">¥${item.aov}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportERPGuideToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ERP 实施指南 - 关键指标与字段定义</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
              .page-break { page-break-after: always; }
              @media print {
                  .no-print { display: none; }
                  .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
              }
          </style>
      </head>
      <body class="p-8 md:p-12">
          <div class="max-w-5xl mx-auto">
              <header class="flex justify-between items-end border-b-4 border-indigo-600 pb-8 mb-12">
                  <div>
                      <h1 class="text-4xl font-black text-slate-900 uppercase tracking-tighter">ERP Implementation Guide</h1>
                      <p class="text-indigo-600 font-bold mt-2">针织服装外贸企业数字化转型 - 实施技术文档</p>
                  </div>
                  <div class="text-right">
                      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">文档版本</p>
                      <p class="text-sm font-black text-slate-900">v1.0.20240330</p>
                  </div>
              </header>

              <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-12">
                  <h2 class="text-lg font-bold text-indigo-900 mb-2">实施目标 (Objectives)</h2>
                  <p class="text-sm text-indigo-800 leading-relaxed">
                      本指南旨在为 ERP 工程师提供核心业务逻辑与数据结构的映射参考。通过统一字段定义，确保销售、生产、仓储、物流及财务模块的数据无缝流转，实现“业财一体化”与“生产透明化”。
                  </p>
              </div>

              <div class="space-y-12">
                  ${INDUSTRY_DASHBOARD_DATA.erpMetrics.modules.map(module => `
                      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                              <h3 class="font-bold">${module.name}</h3>
                              <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Module Definition</span>
                          </div>
                          <div class="p-0">
                              <table class="w-full text-left text-xs">
                                  <thead>
                                      <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                                          <th class="px-6 py-4">字段名称 (Field)</th>
                                          <th class="px-6 py-4">数据类型 (Type)</th>
                                          <th class="px-6 py-4">数据来源 (Source)</th>
                                          <th class="px-6 py-4">业务描述 (Description)</th>
                                      </tr>
                                  </thead>
                                  <tbody class="divide-y divide-slate-50">
                                      ${module.fields.map(field => `
                                          <tr>
                                              <td class="px-6 py-4 font-mono font-bold text-indigo-600">${field.field}</td>
                                              <td class="px-6 py-4 text-slate-600">${field.type}</td>
                                              <td class="px-6 py-4 text-slate-500">${field.source}</td>
                                              <td class="px-6 py-4 text-slate-800">${field.desc}</td>
                                          </tr>
                                      `).join('')}
                                  </tbody>
                              </table>
                          </div>
                      </section>
                  `).join('')}
              </div>

              <div class="mt-12 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                  <div class="relative z-10">
                      <h2 class="text-xl font-bold mb-4">实施可行性建议 (Technical Recommendations)</h2>
                      <ul class="space-y-3 text-sm text-slate-300">
                          <li class="flex gap-3">
                              <span class="text-indigo-400 font-bold">01.</span>
                              <span><strong>数据一致性:</strong> 建议使用全局唯一订单 ID (order_id) 作为主键，贯穿从询盘到发货的全生命周期。</span>
                          </li>
                          <li class="flex gap-3">
                              <span class="text-indigo-400 font-bold">02.</span>
                              <span><strong>实时性要求:</strong> 生产端 (Production) 字段建议通过 IoT 接口实时推送，避免人工录入导致的 24 小时滞后。</span>
                          </li>
                          <li class="flex gap-3">
                              <span class="text-indigo-400 font-bold">03.</span>
                              <span><strong>财务集成:</strong> 销售模块的 FOB 报价与退税字段需与财务系统凭证自动关联，实现实时毛利核算。</span>
                          </li>
                      </ul>
                  </div>
                  <div class="absolute right-[-20px] bottom-[-20px] opacity-10">
                      <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
              </div>

              <footer class="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] no-print">
                  Generated by Smart Knit ERP System &copy; 2024
              </footer>
          </div>
          
          <div class="fixed bottom-8 right-8 no-print">
              <button onclick="window.print()" class="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  打印 / 保存 PDF
              </button>
          </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP_Implementation_Guide_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportFullDemoToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>富泉管理系统 - 全量业务演示中心 (OFFLINE DEMO)</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; overflow: hidden; }
          .sidebar { width: 280px; height: 100vh; background: #0f172a; color: #94a3b8; position: fixed; left: 0; top: 0; overflow-y: auto; z-index: 50; border-right: 1px solid #1e293b; }
          .main-content { margin-left: 280px; height: 100vh; overflow-y: auto; padding: 0; position: relative; }
          .view-container { display: none; padding: 2.5rem; max-width: 1400px; margin: 0 auto; }
          .view-container.active { display: block; animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; font-weight: 600; border-radius: 0.75rem; margin: 0.25rem 1rem; }
          .nav-item:hover { background: #1e293b; color: white; }
          .nav-item.active { background: #1e293b; color: #10b981; }
          
          .card { background: white; border-radius: 1.5rem; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .section-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
          .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
          .progress-bar { height: 0.6rem; background: #f1f5f9; border-radius: 9999px; overflow: hidden; }
          .progress-fill { height: 100%; border-radius: 9999px; transition: width 1s ease-in-out; }
          
          .stat-card { border-left: 4px solid transparent; }
          .stat-card.up { border-left-color: #10b981; }
          .stat-card.down { border-left-color: #ef4444; }
          
          .chart-container { position: relative; height: 300px; width: 100%; }
          
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          
          @media (max-width: 1024px) {
            .sidebar { width: 80px; }
            .sidebar span, .sidebar .px-6.py-2 { display: none; }
            .main-content { margin-left: 80px; }
            .nav-item { padding: 0.875rem; justify-content: center; }
          }
        </style>
      </head>
      <body>
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="p-8 flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">F</div>
            <span class="text-xl font-black text-white tracking-tighter">富泉管理 <span class="text-emerald-500">PRO</span></span>
          </div>
          
          <div class="space-y-1">
            <div class="px-8 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">核心看板</div>
            <div class="nav-item active" onclick="switchView('dashboard', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <span>老板座舱</span>
            </div>
            <div class="nav-item" onclick="switchView('reports', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              <span>报表中心</span>
            </div>
            <div class="nav-item" onclick="switchView('sales', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
              <span>销售模型</span>
            </div>
            <div class="nav-item" onclick="switchView('insights', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 8 0h6v18H2V3z"/><path d="M12 11v4"/><path d="M8 15h8"/></svg>
              <span>多维洞察</span>
            </div>
            
            <div class="mt-8 px-8 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">业务管理</div>
            <div class="nav-item" onclick="switchView('business', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
              <span>款式研发</span>
            </div>
            <div class="nav-item" onclick="switchView('costing', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>财务模型</span>
            </div>
            <div class="nav-item" onclick="switchView('warehouse', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              <span>智慧仓库</span>
            </div>
            <div class="nav-item" onclick="switchView('production', this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A9 9 0 0 0 20 11V5a2 2 0 0 0-2-2h-5a9 9 0 0 0-9 9v5a2 2 0 0 0 2 2h5Z"/><path d="M11 20v-9"/><path d="M20 11h-9"/></svg>
              <span>生产进度</span>
            </div>
          </div>

          <div class="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-[#0f172a]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-slate-700 border-2 border-emerald-500/30 overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer">
              </div>
              <div>
                <p class="text-sm font-bold text-white">演示管理员</p>
                <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">OFFLINE MODE</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
            <h1 id="view-title" class="text-xl font-black text-slate-900 tracking-tight">老板座舱 <span class="text-emerald-600">Executive Cockpit</span></h1>
            <div class="flex items-center gap-4">
              <div class="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                数据快照: ${new Date().toLocaleDateString()}
              </div>
              <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
            </div>
          </header>

          <!-- Dashboard View -->
          <div id="dashboard" class="view-container active space-y-10">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              ${METRICS.map(m => `
                <div class="card stat-card ${m.trend === 'up' ? 'up' : 'down'}">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">${m.label}</p>
                  <div class="flex items-end justify-between">
                    <p class="text-3xl font-black text-slate-900 tracking-tighter">${m.value}</p>
                    <div class="flex flex-col items-end">
                      <span class="text-xs font-black ${m.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1">
                        ${m.trend === 'up' ? '▲' : '▼'} ${m.change}
                      </span>
                      <span class="text-[8px] text-slate-300 font-bold uppercase tracking-widest">环比上月</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-8">
                <section class="card">
                  <div class="flex items-center justify-between mb-8">
                    <h2 class="section-title mb-0">销售趋势与预测分析</h2>
                    <div class="flex items-center gap-4">
                      <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> 实际销售</span>
                      <span class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span class="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> 预测目标</span>
                    </div>
                  </div>
                  <div class="chart-container">
                    <canvas id="salesChart"></canvas>
                  </div>
                </section>
                
                <section>
                  <h2 class="section-title">智能经营洞察 <span class="badge bg-emerald-50 text-emerald-600 ml-2">AI INSIGHTS</span></h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${COCKPIT_INSIGHTS.map(insight => `
                      <div class="p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-200 transition-all shadow-sm">
                        <div class="flex items-center gap-3 mb-3">
                          <div class="w-2.5 h-2.5 rounded-full ${insight.type === 'positive' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse"></div>
                          <h3 class="font-black text-slate-900 text-sm">${insight.title}</h3>
                        </div>
                        <p class="text-xs text-slate-500 leading-relaxed mb-4">${insight.description}</p>
                        <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">影响评估</span>
                          <span class="text-[9px] font-black ${insight.type === 'positive' ? 'text-emerald-600' : 'text-amber-600'} uppercase">${insight.impact}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>
              </div>
              
              <div class="space-y-8">
                <section class="card">
                  <h2 class="section-title">战略目标达成率</h2>
                  <div class="space-y-8">
                    ${STRATEGIC_GOALS.map(goal => `
                      <div class="space-y-3">
                        <div class="flex justify-between items-end">
                          <p class="text-xs font-black text-slate-800">${goal.title}</p>
                          <p class="text-xs font-black text-emerald-600">${goal.progress}%</p>
                        </div>
                        <div class="progress-bar"><div class="progress-fill bg-emerald-500" style="width: ${goal.progress}%"></div></div>
                        <div class="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>目标: ${goal.target}</span>
                          <span class="${goal.status === 'on-track' ? 'text-emerald-500' : 'text-amber-500'}">${goal.status}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>
                
                <section class="card">
                  <h2 class="section-title">实时库存分布</h2>
                  <div class="chart-container" style="height: 220px;">
                    <canvas id="inventoryChart"></canvas>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <!-- Reports View -->
          <div id="reports" class="view-container space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              ${[
                { title: "销售分析报表", desc: "追踪销售额、订单量及客户贡献度。", icon: "emerald" },
                { title: "库存预警报表", desc: "监控面料、辅料及成品库存水位。", icon: "blue" },
                { title: "生产进度报表", desc: "实时跟踪织造、染色、裁剪进度。", icon: "amber" },
              ].map(r => `
                <div class="card hover:border-emerald-500 cursor-pointer group transition-all">
                  <div class="w-12 h-12 bg-${r.icon}-50 text-${r.icon}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-${r.icon}-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <h3 class="font-black text-slate-800 mb-2">${r.title}</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">${r.desc}</p>
                </div>
              `).join('')}
            </div>
            
            <section class="card p-0 overflow-hidden">
              <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 class="text-lg font-black text-slate-900">最近订单明细 <span class="text-slate-400 font-normal text-sm ml-2">Recent Orders</span></h2>
                <button class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">导出 CSV</button>
              </div>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 font-black uppercase tracking-[0.1em]">
                    <th class="px-8 py-5">订单编号</th>
                    <th class="px-8 py-5">客户名称</th>
                    <th class="px-8 py-5">下单日期</th>
                    <th class="px-8 py-5">订单金额</th>
                    <th class="px-8 py-5">当前状态</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${sortedOrders.map(o => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-8 py-5 font-mono font-bold text-slate-500">${o.id}</td>
                      <td class="px-8 py-5 font-black text-slate-900">${o.customer}</td>
                      <td class="px-8 py-5 text-slate-500">${o.date}</td>
                      <td class="px-8 py-5 font-black text-slate-900">${o.amount}</td>
                      <td class="px-8 py-5">
                        <span class="badge ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                          ${o.status === 'completed' ? '已完成' : o.status === 'pending' ? '进行中' : '已取消'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>
          </div>

          <!-- Sales Model View -->
          <div id="sales" class="view-container space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              ${JSON.parse(JSON.stringify(INDUSTRY_DASHBOARD_DATA.salesModel.metrics)).map(stat => `
                <div class="card group hover:border-indigo-500 transition-all">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">${stat.label}</p>
                  <p class="text-2xl font-black text-slate-900">${stat.value}</p>
                  <div class="mt-4 pt-4 border-t border-slate-50">
                    <p class="text-[9px] font-bold text-indigo-600 mb-1 uppercase tracking-tighter">公式: ${stat.formula}</p>
                    <p class="text-[10px] text-slate-400 leading-tight">${stat.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 card">
                <div class="section-title">
                  <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
                  </div>
                  <span>出口营收趋势 (FOB 结算)</span>
                </div>
                <div class="chart-container">
                  <canvas id="salesModelChart"></canvas>
                </div>
              </div>
              <div class="space-y-8">
                <div class="card">
                  <h3 class="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest">外贸订单转化漏斗</h3>
                  <div class="space-y-4">
                    ${JSON.parse(JSON.stringify(INDUSTRY_DASHBOARD_DATA.salesModel.orderFunnel)).map(item => `
                      <div class="p-4 rounded-2xl ${item.color} flex justify-between items-center">
                        <span class="font-bold text-xs">${item.label}</span>
                        <div class="text-right">
                          <p class="font-black text-sm">${item.value}</p>
                          <p class="text-[10px] opacity-70">转化: ${item.percent}</p>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="card bg-slate-900 text-white">
                  <h3 class="font-black text-white mb-6 text-sm uppercase tracking-widest">全球市场贡献度</h3>
                  <div class="space-y-6">
                    ${JSON.parse(JSON.stringify(INDUSTRY_DASHBOARD_DATA.salesModel.marketContribution)).map(item => `
                      <div class="space-y-2">
                        <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span class="text-slate-400">${item.label}</span>
                          <span>${item.value}%</span>
                        </div>
                        <div class="progress-bar bg-white/10">
                          <div class="progress-fill ${item.color}" style="width: ${item.value}%"></div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
            <div class="card bg-indigo-50/50 border-indigo-100 p-8">
              <h3 class="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                <div class="p-2 bg-indigo-600 text-white rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18h.01"/><path d="M10 10l4 4m0-4l-4 4"/></svg>
                </div>
                外贸针织服装利润分析指南 (Foreign Trade Profit Analysis Guide)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="space-y-4">
                  <h4 class="text-xs font-black text-indigo-600 uppercase tracking-widest">1. FOB 报价逻辑</h4>
                  <div class="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                    <p class="text-[11px] font-bold text-slate-900 mb-2">核心公式:</p>
                    <code class="block p-2 bg-slate-50 rounded text-[10px] text-indigo-700 font-mono mb-3">FOB = (CMT + 面料 + 辅料 + 利润 + 杂费) / (汇率 * (1 - 佣金))</code>
                    <p class="text-[10px] text-slate-500 leading-relaxed">
                      针织服装报价需重点关注**面料克重**与**裁剪损耗**。CMT (加工费) 包含织造、染色、成衣工序。国内杂费需涵盖报关、拖车及港杂费。
                    </p>
                  </div>
                </div>
                <div class="space-y-4">
                  <h4 class="text-xs font-black text-indigo-600 uppercase tracking-widest">2. 出口退税机制</h4>
                  <div class="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                    <p class="text-[11px] font-bold text-slate-900 mb-2">核心公式:</p>
                    <code class="block p-2 bg-slate-50 rounded text-[10px] text-indigo-700 font-mono mb-3">退税额 = 采购金额 / (1 + 增值税率) * 退税率</code>
                    <p class="text-[10px] text-slate-500 leading-relaxed">
                      针织品类通常适用 **13%** 的退税率。退税是外贸企业的重要利润来源，在报价时通常会将退税部分作为利润补充或让利空间考虑。
                    </p>
                  </div>
                </div>
                <div class="space-y-4">
                  <h4 class="text-xs font-black text-indigo-600 uppercase tracking-widest">3. 订单贡献毛益</h4>
                  <div class="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                    <p class="text-[11px] font-bold text-slate-900 mb-2">核心公式:</p>
                    <code class="block p-2 bg-slate-50 rounded text-[10px] text-indigo-700 font-mono mb-3">毛益 = (FOB * 汇率 + 退税 - 变动成本) / (FOB * 汇率)</code>
                    <p class="text-[10px] text-slate-500 leading-relaxed">
                      该指标反映了订单在扣除变动成本（面料、辅料、计件工资）并计入退税收益后的**实际盈利能力**，是决策是否接单的关键。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Insights View -->
          <div id="insights" class="view-container space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${INDUSTRY_DASHBOARD_DATA.insights.map(insight => `
                <div class="card ${insight.bg} ${insight.border} border-2">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-white rounded-xl shadow-sm">
                      ${insight.id === 'controller' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>' : 
                        insight.id === 'finance' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>' :
                        insight.id === 'sales' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' :
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'}
                    </div>
                    <div>
                      <h3 class="font-black text-slate-900 text-sm">${insight.role}</h3>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${insight.summary}</p>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed mb-6">${insight.content}</p>
                  <div class="flex justify-between items-center pt-4 border-t border-slate-200/50">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${insight.kpi.label}</span>
                    <span class="text-sm font-black ${insight.kpi.status === 'up' ? 'text-emerald-600' : insight.kpi.status === 'warning' ? 'text-amber-600' : 'text-slate-600'}">${insight.kpi.value}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Business View -->
          <div id="business" class="view-container space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              ${STYLES.map(style => `
                <div class="card p-0 overflow-hidden group">
                  <div class="relative h-48 overflow-hidden">
                    <img src="${style.image}" alt="${style.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer">
                    <div class="absolute top-4 right-4">
                      <span class="badge bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm">${style.status}</span>
                    </div>
                  </div>
                  <div class="p-5">
                    <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">${style.category} | ${style.season}</p>
                    <h3 class="font-black text-slate-900 mb-2">${style.name}</h3>
                    <p class="text-[10px] font-mono text-slate-400">${style.id}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <section class="card">
              <h2 class="section-title">核心工艺标准 (Knitting Tech)</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${KNITTING_TECH_DATA.map(tech => `
                  <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-start mb-4">
                      <h3 class="font-black text-slate-900">${tech.name}</h3>
                      <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${tech.status}</span>
                    </div>
                    <div class="space-y-2 text-[11px]">
                      <div class="flex justify-between"><span class="text-slate-400">设备型号:</span><span class="font-bold">${tech.machine}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">纱线规格:</span><span class="font-bold">${tech.yarn}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">克重标准:</span><span class="font-bold">${tech.gsm}</span></div>
                      <div class="flex justify-between"><span class="text-slate-400">预估缩率:</span><span class="font-bold">${tech.shrinkage}</span></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          </div>

          <!-- Inventory View -->
          <div id="inventory" class="view-container space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 card p-0 overflow-hidden">
                <div class="p-6 border-b border-slate-100">
                  <h2 class="text-lg font-black text-slate-900">物料实时库存水位</h2>
                </div>
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                      <th class="px-8 py-5">物料名称</th>
                      <th class="px-8 py-5">规格类型</th>
                      <th class="px-8 py-5">当前库存</th>
                      <th class="px-8 py-5">安全水位</th>
                      <th class="px-8 py-5">状态</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${INDUSTRY_DASHBOARD_DATA.yarn.inventory.map(item => `
                      <tr>
                        <td class="px-8 py-5 font-black text-slate-900">${item.name}</td>
                        <td class="px-8 py-5 text-slate-500">${item.type}</td>
                        <td class="px-8 py-5 font-black text-slate-900">${item.stock} ${item.unit}</td>
                        <td class="px-8 py-5 text-slate-400">${item.lowStock} ${item.unit}</td>
                        <td class="px-8 py-5">
                          <span class="badge ${item.stock < item.lowStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}">
                            ${item.stock < item.lowStock ? '库存偏低' : '充足'}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="space-y-8">
                <section class="card">
                  <h2 class="section-title">库存价值占比</h2>
                  <div class="chart-container" style="height: 300px;">
                    <canvas id="inventoryChartLarge"></canvas>
                  </div>
                </section>
                <section class="card bg-slate-900 text-white border-none">
                  <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">仓储环境监控</h3>
                  <div class="space-y-6">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-slate-400">平均湿度</span>
                      <span class="text-sm font-black text-emerald-400">55% RH</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-slate-400">平均温度</span>
                      <span class="text-sm font-black text-emerald-400">22.4°C</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-slate-400">库位利用率</span>
                      <span class="text-sm font-black text-indigo-400">82.5%</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <!-- Production View -->
          <div id="production" class="view-container space-y-10">
            <section class="card p-0 overflow-hidden">
              <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 class="text-lg font-black text-slate-900">全链路生产进度追踪 (Real-time Tracking)</h2>
                <div class="flex gap-2">
                  <button class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">导出进度表</button>
                </div>
              </div>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                    <th class="px-8 py-5">订单编号</th>
                    <th class="px-8 py-5">款式名称</th>
                    <th class="px-8 py-5">当前环节</th>
                    <th class="px-8 py-5">任务进度</th>
                    <th class="px-8 py-5">交付状态</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${PRODUCTION_PROGRESS.map(p => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-8 py-5 font-mono font-bold text-slate-500">${p.orderId}</td>
                      <td class="px-8 py-5 font-black text-slate-900">${p.style}</td>
                      <td class="px-8 py-5 text-slate-500">${PRODUCTION_STEPS[p.currentStep]}</td>
                      <td class="px-8 py-5">
                        <div class="flex items-center gap-4">
                          <div class="w-32 progress-bar"><div class="progress-fill bg-emerald-500" style="width: ${p.progress}%"></div></div>
                          <span class="font-black text-slate-900">${p.progress}%</span>
                        </div>
                      </td>
                      <td class="px-8 py-5">
                        <span class="badge ${p.status === 'normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                          ${p.status === 'normal' ? '正常推进' : '进度滞后'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            <section class="card p-8">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-500" />
                  月度/次月生产排程 (Monthly Production Schedule)
                </h2>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">已完成</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-indigo-500 rounded"></div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">进行中</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-slate-200 rounded"></div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">待开始</span>
                  </div>
                </div>
              </div>

              <div class="space-y-10">
                ${MONTHLY_PRODUCTION_SCHEDULE.map(order => `
                  <div class="space-y-4">
                    <div class="flex justify-between items-end">
                      <div>
                        <h3 class="text-sm font-black text-slate-900">${order.style}</h3>
                        <p class="text-[10px] font-mono text-slate-400">${order.orderId} | 排程月份: ${order.month}</p>
                      </div>
                      <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">查看详情 →</span>
                    </div>
                    
                    <div class="relative pt-8 pb-4">
                      <div class="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                      <div class="grid grid-cols-5 gap-4 relative z-10">
                        ${order.steps.map(step => `
                          <div class="flex flex-col items-center text-center">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 ${
                              step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                              step.status === 'in-progress' ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse' :
                              'bg-white border-slate-200 text-slate-400'
                            }">
                              ${step.status === 'completed' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : 
                                step.status === 'in-progress' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' :
                                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>'
                              }
                            </div>
                            <p class="text-[10px] font-black text-slate-900 mb-1">${step.name}</p>
                            <p class="text-[9px] text-slate-400">${step.startDate} 至 ${step.endDate}</p>
                            <div class="mt-2 w-full px-2">
                              <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}" style="width: ${step.progress}%"></div>
                              </div>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          </div>

          <!-- Costing View -->
          <div id="costing" class="view-container space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="card bg-white p-6">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">平均单件成本</p>
                <h3 class="text-2xl font-black text-slate-900">¥${INDUSTRY_DASHBOARD_DATA.costing.summary[1].value.replace('¥', '')}</h3>
                <p class="text-[10px] font-bold text-emerald-600 mt-2">较上月 -2.4%</p>
              </div>
              <div class="card bg-white p-6">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">总利润率</p>
                <h3 class="text-2xl font-black text-slate-900">28.5%</h3>
                <p class="text-[10px] font-bold text-emerald-600 mt-2">较上月 +1.2%</p>
              </div>
              <div class="card bg-white p-6">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">财务折旧预估</p>
                <h3 class="text-2xl font-black text-slate-900">${INDUSTRY_DASHBOARD_DATA.costing.financialModel.depreciation[0].monthly}</h3>
                <p class="text-[10px] font-bold text-slate-400 mt-2">年度累计</p>
              </div>
              <div class="card bg-white p-6">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">成品损耗率</p>
                <h3 class="text-2xl font-black text-slate-900">${INDUSTRY_DASHBOARD_DATA.costing.financialModel.productLoss[0].rate}</h3>
                <p class="text-[10px] font-bold text-rose-600 mt-2">高于行业均值</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="card bg-white p-8">
                <h3 class="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">成本差异分析 (预算 vs 实际)</h3>
                <div class="h-[300px]">
                  <canvas id="costVarianceChart"></canvas>
                </div>
              </div>
              <div class="card bg-white p-8">
                <h3 class="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">财务模型说明</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-slate-50 rounded-xl">
                    <h4 class="text-xs font-black text-slate-900 mb-2">折旧计算模型</h4>
                    <p class="text-[11px] text-slate-500 leading-relaxed">采用年数总和法，针对生产设备进行加速折旧，确保财务报表真实反映资产价值。当前月度计提：${INDUSTRY_DASHBOARD_DATA.costing.financialModel.depreciation[0].monthly}</p>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-xl">
                    <h4 class="text-xs font-black text-slate-900 mb-2">损耗控制标准</h4>
                    <p class="text-[11px] text-slate-500 leading-relaxed">根据财务标准模型，成品损耗率控制在${INDUSTRY_DASHBOARD_DATA.costing.financialModel.productLoss[0].benchmark}以内。当前超出部分已计入管理费用，需生产部门进行专项整改。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Warehouse View -->
          <div id="warehouse" class="view-container space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-8">
                <section class="card">
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="section-title mb-0">智能排程系统 (Intelligent Scheduling)</h2>
                    <div class="flex gap-2">
                      <button onclick="simulateOptimization()" class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">启动智能优化</button>
                      <button onclick="simulateDingTalkPush()" class="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">同步至钉钉</button>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="space-y-4">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">物流资源状态</h4>
                      <div class="space-y-2">
                        ${INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.resources.drivers.map(driver => `
                          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                            <div>
                              <p class="text-xs font-black text-slate-900">${driver.name}</p>
                              <p class="text-[9px] text-slate-400">${driver.vehicle}</p>
                            </div>
                            <span class="text-[9px] font-black ${driver.status === 'Available' ? 'text-emerald-600' : 'text-amber-600'} uppercase tracking-tighter">${driver.status}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                    
                    <div class="space-y-4">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">待排单任务</h4>
                      <div class="space-y-2">
                        ${INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.pendingOrders.map(order => `
                          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div class="flex justify-between items-start mb-1">
                              <span class="text-[9px] font-mono text-slate-400">${order.id}</span>
                              <span class="text-[9px] font-black ${order.priority === 'High' ? 'text-rose-600' : 'text-amber-600'} uppercase tracking-tighter">${order.priority}</span>
                            </div>
                            <p class="text-xs font-black text-slate-900">${order.destination}</p>
                            <div class="flex justify-between mt-2">
                              <span class="text-[9px] text-slate-400">${order.volume}</span>
                              <span class="text-[9px] font-black text-rose-500">截止: ${order.deadline}</span>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <div class="space-y-4">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">优化建议路线</h4>
                      <div class="space-y-2">
                        ${INDUSTRY_DASHBOARD_DATA.logistics.smartScheduling.optimizedRoutes.map(route => `
                          <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <div class="flex justify-between items-center mb-2">
                              <span class="text-[9px] font-black text-indigo-600">${route.id}</span>
                              <span class="text-[9px] font-black text-emerald-600">效率: ${route.efficiency}</span>
                            </div>
                            <p class="text-[10px] font-black text-slate-900 mb-1">${route.driver}</p>
                            <p class="text-[9px] text-slate-500 truncate">${route.stops.join(' → ')}</p>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </section>

                <section class="card">
                  <h2 class="section-title">智慧仓库实时库存 (Fabric Inventory)</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${INDUSTRY_DASHBOARD_DATA.warehouse.fabricInventory.map(item => `
                      <div class="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                          <h4 class="font-black text-slate-900 text-sm">${item.name}</h4>
                          <span class="text-[10px] font-black text-slate-400">${item.color}</span>
                        </div>
                        <div class="flex justify-between items-end">
                          <div>
                            <p class="text-[10px] text-slate-400 uppercase font-bold">当前库存</p>
                            <p class="text-lg font-black text-slate-900">${item.stock}</p>
                          </div>
                          <div class="text-right">
                            <p class="text-[10px] text-slate-400 uppercase font-bold">库位</p>
                            <p class="text-xs font-bold text-indigo-600">${item.location}</p>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>

                <section class="card">
                  <h2 class="section-title">钉钉物流预排与实时追踪</h2>
                  <div class="space-y-4">
                    ${INDUSTRY_DASHBOARD_DATA.logistics.realTimeTracking.map(log => `
                      <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div class="flex justify-between items-center mb-3">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${log.status === '运输中' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}"></span>
                            <span class="text-xs font-black text-slate-900">${log.id}</span>
                          </div>
                          <span class="badge ${log.status === '运输中' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}">${log.status}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-[10px]">
                          <div>
                            <p class="text-slate-400 font-bold uppercase mb-1">目的地</p>
                            <p class="font-black text-slate-900">${log.destination}</p>
                          </div>
                          <div>
                            <p class="text-slate-400 font-bold uppercase mb-1">承运商</p>
                            <p class="font-black text-slate-900">${log.driver}</p>
                          </div>
                          <div>
                            <p class="text-slate-400 font-bold uppercase mb-1">预计到达</p>
                            <p class="font-black text-slate-900">${log.eta}</p>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>
              </div>

              <div class="space-y-8">
                <section class="card bg-indigo-600 text-white border-none">
                  <h3 class="text-xs font-black text-indigo-200 uppercase tracking-widest mb-6">智慧仓库接口状态</h3>
                  <div class="space-y-6">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-indigo-100">API 连接</span>
                      <span class="text-sm font-black text-emerald-300">已连接 (Active)</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-indigo-100">数据同步频率</span>
                      <span class="text-sm font-black">5s / 次</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-indigo-100">最后更新</span>
                      <span class="text-sm font-black">刚刚</span>
                    </div>
                  </div>
                  <div class="mt-8 pt-6 border-t border-indigo-500/50">
                    <button class="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">手动强制同步</button>
                  </div>
                </section>

                <section class="card">
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">物流预排计划 (Next 24h)</h3>
                  <div class="space-y-4">
                    <div class="flex gap-4 items-start">
                      <div class="w-10 text-center">
                        <p class="text-xs font-black text-slate-900">09:00</p>
                        <div class="w-px h-8 bg-slate-100 mx-auto my-1"></div>
                      </div>
                      <div class="flex-1 pb-4">
                        <p class="text-[11px] font-black text-slate-900">上海仓 - 顺丰快运</p>
                        <p class="text-[10px] text-slate-400">面料入库 500kg</p>
                      </div>
                    </div>
                    <div class="flex gap-4 items-start">
                      <div class="w-10 text-center">
                        <p class="text-xs font-black text-slate-900">14:30</p>
                        <div class="w-px h-8 bg-slate-100 mx-auto my-1"></div>
                      </div>
                      <div class="flex-1 pb-4">
                        <p class="text-[11px] font-black text-slate-900">杭州工厂 - 德邦快递</p>
                        <p class="text-[10px] text-slate-400">成品出库 1200件</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <!-- ERP Guide View -->
          <div id="erp-guide" class="view-container space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-8">
                <section class="card p-8">
                  <h2 class="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    ERP 实施路线图 (Implementation Roadmap)
                  </h2>
                  
                  <div class="space-y-12">
                    ${ERP_DEVELOPMENT_PLAN.map(phase => `
                      <div class="relative pl-8 border-l-2 border-slate-100">
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500"></div>
                        <h3 class="text-sm font-black text-slate-900 mb-6 uppercase tracking-tight">${phase.phase}</h3>
                        
                        <div class="space-y-4">
                          ${phase.tasks.map(task => `
                            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                              <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2">
                                  <span class="badge ${
                                    task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                    task.status === 'doing' ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-slate-200 text-slate-600'
                                  }">${task.status.toUpperCase()}</span>
                                  <h4 class="text-sm font-black text-slate-900">${task.title}</h4>
                                </div>
                                <span class="text-[10px] font-bold text-slate-400">${task.time} | 负责人: ${task.owner}</span>
                              </div>
                              <p class="text-xs text-slate-500 leading-relaxed">${task.desc}</p>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>

                <section class="card p-8">
                  <h2 class="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    数据治理流程 (Data Governance Flow)
                  </h2>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${DATA_GOVERNANCE_FLOWS.map(flow => `
                      <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 class="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-200 pb-2">${flow.role}</h3>
                        <ul class="space-y-4">
                          ${flow.steps.map((step, idx) => `
                            <li class="flex gap-3">
                              <span class="text-[10px] font-black text-indigo-500 mt-0.5">${(idx + 1).toString().padStart(2, '0')}</span>
                              <p class="text-xs text-slate-600 font-medium leading-snug">${step}</p>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    `).join('')}
                  </div>
                </section>
              </div>

              <div class="space-y-8">
                <section class="card bg-slate-900 text-white border-none p-8">
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">系统集成健康度 (Integration Health)</h3>
                  <div class="space-y-8">
                    <div>
                      <div class="flex justify-between items-end mb-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">数据准确率 (Data Accuracy)</span>
                        <span class="text-lg font-black text-emerald-400">94.2%</span>
                      </div>
                      <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" style="width: 94.2%"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between items-end mb-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">模块覆盖率 (Module Coverage)</span>
                        <span class="text-lg font-black text-indigo-400">85.0%</span>
                      </div>
                      <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500" style="width: 85%"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between items-end mb-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">接口稳定性 (API Stability)</span>
                        <span class="text-lg font-black text-emerald-400">99.9%</span>
                      </div>
                      <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" style="width: 99.9%"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-10 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p class="text-[10px] text-slate-400 leading-relaxed italic">
                      "ERP 的生命力在于数据的真实性。通过本周的现场攻坚，我们将打通从销售到仓库的最后 100 米，确保每一件衣服在系统里都有迹可循。"
                    </p>
                  </div>
                </section>

                <section class="card p-8">
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">关键指标定义 (KPI Definitions)</h3>
                  <div class="space-y-4">
                    <div class="p-3 bg-slate-50 rounded-lg">
                      <p class="text-[10px] font-black text-slate-900 mb-1">账实相符率</p>
                      <p class="text-[9px] text-slate-500">系统库存数量与仓库实物盘点数量的匹配程度。</p>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                      <p class="text-[10px] font-black text-slate-900 mb-1">流程合规度</p>
                      <p class="text-[9px] text-slate-500">业务操作是否严格遵循系统预设的审批与录入流程。</p>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                      <p class="text-[10px] font-black text-slate-900 mb-1">异常响应速度</p>
                      <p class="text-[9px] text-slate-500">从系统发起异常单到相关责任人处理完成的平均时长。</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <footer class="py-12 border-t border-slate-200 text-center">
            <div class="flex items-center justify-center gap-2 mb-4">
              <div class="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-[10px] font-black">F</div>
              <p class="text-slate-900 text-xs font-black tracking-widest uppercase">富泉服饰管理系统</p>
            </div>
            <p class="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">© 2024 FUQUAN GARMENT INTELLIGENCE - OFFLINE DEMO CENTER</p>
          </footer>
        </div>

        <script>
          function switchView(viewId, el) {
            // Update nav items
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            el.classList.add('active');
            
            // Update view containers
            document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            
            // Update title
            const titles = {
              'dashboard': '老板座舱 <span class="text-emerald-600">Executive Cockpit</span>',
              'reports': '报表中心 <span class="text-emerald-600">Report Center</span>',
              'sales': '销售模型 <span class="text-emerald-600">Sales Model</span>',
              'business': '款式研发 <span class="text-emerald-600">Style R&D</span>',
              'inventory': '库存监控 <span class="text-emerald-600">Inventory Monitor</span>',
              'production': '生产进度 <span class="text-emerald-600">Production Tracking</span>',
              'insights': '决策建议 <span class="text-emerald-600">Strategic Insights</span>',
              'costing': '财务成本 <span class="text-emerald-600">Financial Costing</span>',
              'warehouse': '智能仓储 <span class="text-emerald-600">Smart Warehouse</span>',
              'logistics': '物流调度 <span class="text-emerald-600">Logistics Dispatch</span>',
              'erp-guide': 'ERP 实施指南 <span class="text-emerald-600">ERP Guide</span>'
            };
            document.getElementById('view-title').innerHTML = titles[viewId];
            
            // Scroll to top
            document.querySelector('.main-content').scrollTop = 0;
          }

          function showToast(title, message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 z-[100] animate-bounce-in';
            toast.innerHTML = \`
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest">\${title}</p>
                <p class="text-[10px] text-slate-400 font-bold">\${message}</p>
              </div>
            \`;
            document.body.appendChild(toast);
            setTimeout(() => {
              toast.classList.add('opacity-0', 'translate-y-4');
              toast.style.transition = 'all 0.5s ease';
              setTimeout(() => toast.remove(), 500);
            }, 3000);
          }

          function simulateOptimization() {
            showToast('智能优化启动', '正在根据订单优先级与车辆资源计算最优排程...');
            setTimeout(() => {
              showToast('优化计算完成', '已生成 2 条建议路线，装载率提升 15%');
            }, 2000);
          }

          function simulateDingTalkPush() {
            showToast('钉钉同步中', '正在推送排程更新至物流群组与司机端...');
            setTimeout(() => {
              showToast('推送成功', '所有相关人员已收到实时排程更新通知');
            }, 1500);
          }

          // Charts Initialization
          const salesCtx = document.getElementById('salesChart').getContext('2d');
          new Chart(salesCtx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(SALES_CHART_DATA.map(d => d.month))},
              datasets: [{
                label: '实际销售',
                data: ${JSON.stringify(SALES_CHART_DATA.map(d => d.sales))},
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
              }, {
                label: '预测目标',
                data: ${JSON.stringify(SALES_CHART_DATA.map(d => d.predicted))},
                borderColor: '#cbd5e1',
                borderDash: [6, 6],
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } }
              }
            }
          });

          const salesModelCtx = document.getElementById('salesModelChart').getContext('2d');
          new Chart(salesModelCtx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(SALES_CHART_DATA.map(d => d.month))},
              datasets: [{
                label: '实际营收 (FOB)',
                data: ${JSON.stringify(SALES_CHART_DATA.map(d => d.sales))},
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 4,
                pointRadius: 4,
                pointBackgroundColor: '#6366f1'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } }
              }
            }
          });

          const invConfig = {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(INVENTORY_CHART_DATA.map(d => d.category))},
              datasets: [{
                data: ${JSON.stringify(INVENTORY_CHART_DATA.map(d => d.current))},
                backgroundColor: ${JSON.stringify(INVENTORY_CHART_DATA.map(d => d.color))},
                borderRadius: 10,
                barThickness: 24
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } }
              }
            }
          };
          new Chart(document.getElementById('inventoryChart').getContext('2d'), invConfig);
          new Chart(document.getElementById('inventoryChartLarge').getContext('2d'), {
            ...invConfig,
            type: 'doughnut',
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 10, weight: '700' }, padding: 20, usePointStyle: true } } },
              cutout: '70%'
            }
          });

          // Cost Variance Chart
          const ctxCost = document.getElementById('costVarianceChart').getContext('2d');
          new Chart(ctxCost, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(INDUSTRY_DASHBOARD_DATA.costing.variance.map(v => v.item))},
              datasets: [
                {
                  label: '预算',
                  data: ${JSON.stringify(INDUSTRY_DASHBOARD_DATA.costing.variance.map(v => v.standard))},
                  backgroundColor: '#94a3b8',
                  borderRadius: 4
                },
                {
                  label: '实际',
                  data: ${JSON.stringify(INDUSTRY_DASHBOARD_DATA.costing.variance.map(v => v.actual))},
                  backgroundColor: '#6366f1',
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 10 } } }
              },
              scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
              }
            }
          });

          // Initialize view
          switchView('dashboard', document.querySelector('.nav-item'));
        </script>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fuquan_full_demo_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (currentView) {
      case "report-center":
        return (
          <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <div className="flex items-center justify-between px-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">报表中心</h1>
                <p className="text-slate-500 font-medium">集成针织服装行业核心业务报表与数据模型</p>
              </div>
              <button 
                onClick={exportFullDemoToHTML}
                className="apple-button-primary flex items-center gap-2"
              >
                <FileCode size={18} />
                导出全量演示页面
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { id: "sales", title: "销售分析报表", desc: "追踪销售额、订单量及客户贡献度。", icon: <TrendingUp className="text-emerald-500" /> },
                { id: "inventory", title: "库存预警报表", desc: "监控面料、辅料及成品库存水位。", icon: <Warehouse className="text-blue-500" /> },
                { id: "production", title: "生产进度报表", desc: "实时跟踪织造、染色、裁剪、缝制进度。", icon: <GitBranch className="text-amber-500" /> },
                { id: "knitting", title: "工艺参数报表", desc: "记录大圆机、横机等织造工艺核心参数。", icon: <Settings className="text-indigo-500" /> },
                { id: "yarn", title: "纱线消耗报表", desc: "分析各批次纱线的使用率与损耗情况。", icon: <Database className="text-rose-500" /> },
                { id: "quality", title: "质量检验报表", desc: "记录面料疵点、成衣尺寸偏差等质量数据。", icon: <CheckCircle2 className="text-teal-500" /> },
              ].map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setCurrentView(report.id)}
                  className="apple-card p-8 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                      {report.icon}
                    </div>
                    <ArrowUpRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{report.title}</h3>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">{report.desc}</p>
                </div>
              ))}
            </div>

            <div className="apple-card p-12 bg-indigo-900 text-white border-none shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-3xl font-bold mb-6 tracking-tight">针织行业数据模型 <span className="text-indigo-300 font-normal text-xl ml-2">Knitting Data Models</span></h2>
                <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-medium">
                  针对针织服装行业特性，我们构建了五大核心数据模型，确保从原材料到成品的每一个环节都具备数字化可追溯性。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <p className="font-bold text-lg tracking-tight">1. 纱线批次模型</p>
                    <p className="text-sm text-indigo-200 mt-2 font-medium">管理支数、捻度、回潮率及缸号差异。</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <p className="font-bold text-lg tracking-tight">2. 织造工艺模型</p>
                    <p className="text-sm text-indigo-200 mt-2 font-medium">定义总针数、路数、针寸及下机克重。</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <p className="font-bold text-lg tracking-tight">3. 染整参数模型</p>
                    <p className="text-sm text-indigo-200 mt-2 font-medium">控制浴比、温度曲线、染料配方及缩率。</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <p className="font-bold text-lg tracking-tight">4. 针织BOM模型</p>
                    <p className="text-sm text-indigo-200 mt-2 font-medium">支持多级嵌套，包含面料损耗与辅料配比。</p>
                  </div>
                </div>
              </div>
              <div className="absolute right-[-80px] bottom-[-80px] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        );
      case "home":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto space-y-12 pb-20"
          >
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">老板座舱</h1>
                <p className="text-slate-500 font-medium text-lg">实时经营数据监控与战略决策支持系统</p>
              </motion.div>
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <button 
                  onClick={exportFullDemoToHTML}
                  className="apple-button-secondary flex items-center gap-2 group"
                >
                  <FileCode size={18} className="group-hover:rotate-12 transition-transform" />
                  导出演示页面
                </button>
                <div className="flex items-center gap-1 bg-slate-300/30 p-1.5 rounded-2xl border border-slate-300/50 backdrop-blur-xl shadow-inner">
                  <button className="px-6 py-2.5 text-xs font-bold bg-white text-indigo-600 rounded-xl shadow-lg ring-1 ring-black/5">今日</button>
                  <button className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-white/50 rounded-xl">本周</button>
                  <button className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-white/50 rounded-xl">本月</button>
                </div>
              </motion.div>
            </div>

            {/* Business Pulse Header */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="apple-card p-12 relative overflow-hidden bg-slate-900 text-white border-none shadow-3xl shadow-indigo-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-purple-600/30 opacity-60"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                <div className="space-y-10 max-w-2xl">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-xl"
                  >
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,199,89,1)]"></div>
                    系统实时运行中 (System Online)
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-7xl font-bold tracking-tight leading-[1.1]"
                  >
                    数字化工厂 <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">实时脉搏监控</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-slate-400 text-xl font-medium leading-relaxed"
                  >
                    集成销售、生产、财务及物流全链路数据。当前业务脉搏：<span className="text-emerald-400 font-bold underline decoration-emerald-400/30 underline-offset-8">稳健扩张</span>。
                    检测到 3 个生产环节存在物料就绪预警，建议优先处理。
                  </motion.p>
                  <div className="grid grid-cols-2 gap-16 pt-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="space-y-3"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">抗风险指数</p>
                      <p className="text-6xl font-bold text-white tracking-tighter flex items-baseline gap-2">
                        88<span className="text-2xl text-slate-600 font-medium">/100</span>
                        <TrendingUp size={24} className="text-emerald-400 mb-2" />
                      </p>
                    </motion.div>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="space-y-3"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">供应链稳定性</p>
                      <p className="text-6xl font-bold text-indigo-400 tracking-tighter flex items-baseline gap-2">
                        高 <span className="text-2xl text-slate-600 font-medium tracking-normal">Stable</span>
                      </p>
                    </motion.div>
                  </div>
                </div>
                <motion.div 
                  initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1, type: "spring" }}
                  className="hidden lg:block"
                >
                  <div className="relative w-80 h-80">
                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
                    <div className="absolute inset-6 border-2 border-purple-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-12 border-2 border-pink-500/5 rounded-full animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-48 h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] flex items-center justify-center shadow-3xl shadow-indigo-500/50 ring-2 ring-white/30 cursor-pointer"
                      >
                        <ShieldCheck size={96} className="text-white drop-shadow-2xl" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Data Interconnectivity Flow */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="apple-card p-12 relative overflow-hidden bg-slate-100/80 border-slate-300/50"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.03),transparent_50%)]"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-20">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">业务全链路实时监控</h2>
                    <p className="text-base text-slate-500 font-medium">Real-time Operational Pulse & Data Interconnectivity</p>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(52,199,89,0.6)]" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">系统在线</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">数据更新: 刚刚</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-rose-500/20 -translate-y-1/2 hidden md:block z-0"></div>
                  {[
                    { step: "销售订单", id: INDUSTRY_DASHBOARD_DATA.home.recentOrders[0].id, icon: <TrendingUp size={28} />, color: "from-emerald-400 to-emerald-600", status: "已确认", desc: `FOB ${INDUSTRY_DASHBOARD_DATA.home.recentOrders[0].amount}`, view: "sales" },
                    { step: "生产计划", id: `PROD-${productionProgress[0].orderId}`, icon: <GitBranch size={28} />, color: "from-indigo-400 to-indigo-600", status: "织造中", desc: `进度 ${productionProgress[0].progress}%`, view: "production" },
                    { step: "物料准备", id: "YRN-552", icon: <Database size={28} />, color: "from-amber-400 to-amber-600", status: "已出库", desc: "纱线 500kg", view: "yarn" },
                    { step: "智能仓储", id: "STK-990", icon: <Warehouse size={28} />, color: "from-blue-400 to-blue-600", status: "待检", desc: "库位 A-12", view: "warehouse" },
                    { step: "物流调度", id: "LOG-001", icon: <Truck size={28} />, color: "from-rose-400 to-rose-600", status: "待装车", desc: "目的地: 上海", view: "logistics" },
                  ].map((node, i) => (
                    <motion.button 
                      key={i} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                      onClick={() => setCurrentView(node.view as any)}
                      className="flex flex-col items-center text-center relative z-10 group cursor-pointer border-none bg-transparent p-0"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 5, y: -8 }}
                        className={`w-24 h-24 bg-gradient-to-br ${node.color} text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 transform transition-all duration-500 ring-[16px] ring-white/50 backdrop-blur-sm relative`}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {node.icon}
                      </motion.div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{node.step}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{node.id}</p>
                      <div className="mt-5 flex flex-col items-center gap-3">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-bold shadow-md ring-1 ring-inset transition-all group-hover:shadow-lg ${
                          node.status === '已确认' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' :
                          node.status === '织造中' ? 'bg-indigo-50 text-indigo-600 ring-indigo-200' :
                          'bg-white text-slate-600 ring-slate-200'
                        }`}>{node.status}</span>
                        <span className="text-xs text-slate-500 font-bold italic opacity-80">{node.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {INDUSTRY_DASHBOARD_DATA.home.metrics.map((metric, i) => (
                <motion.div 
                  key={metric.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                  whileHover={{ y: -10 }}
                  className="apple-card p-10 group bg-white/80 border-slate-200/50"
                >
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className={`p-5 rounded-2xl transition-all duration-300 shadow-lg ${metric.status === 'up' || metric.status === 'safe' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/40' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/40'}`}>
                      {metric.icon}
                    </motion.div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-5xl font-bold text-slate-900 tracking-tighter">{metric.value}</div>
                    <div className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm ${metric.status === 'up' || metric.status === 'safe' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {metric.trend}
                      {metric.status === 'up' ? <ArrowUpRight size={16} /> : metric.status === 'down' ? <ArrowDownRight size={16} /> : null}
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/60 h-3 rounded-full mt-10 overflow-hidden p-0.5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full shadow-sm relative ${metric.status === 'up' || metric.status === 'safe' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Strategic Insights */}
              <div className="lg:col-span-2 space-y-8">
                <div className="apple-card p-12 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-indigo-400">
                    <Zap size={200} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl ring-1 ring-white/10">
                          <Zap size={28} />
                        </div>
                        <div>
                          <h2 className="font-bold text-2xl tracking-tight">智能经营洞察</h2>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">AI Strategic Insights</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest border-b border-indigo-400/30 pb-1">查看全部洞察 →</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {COCKPIT_INSIGHTS.map((insight) => (
                        <div key={insight.id} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-500 group cursor-pointer hover:shadow-xl hover:shadow-black/20">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)] ${
                                insight.type === 'positive' ? 'bg-emerald-500' : 
                                insight.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <h3 className="font-bold text-lg tracking-tight">{insight.title}</h3>
                            </div>
                            <ArrowUpRight size={20} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed mb-8 line-clamp-2 font-medium">{insight.description}</p>
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Activity size={14} />
                              影响: <span className={insight.type === 'positive' ? 'text-emerald-400' : insight.type === 'warning' ? 'text-amber-400' : 'text-rose-400'}>{insight.impact}</span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">{insight.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actual Operational Cases Section */}
                <div className="apple-card p-12 bg-white/60">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                        <AlertCircle size={28} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">运营痛点与实际案例</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">问题诊断与闭环</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {OPERATIONAL_CASES.map((item, i) => (
                      <div key={i} className="p-6 border border-slate-200/50 rounded-3xl hover:border-rose-200 transition-all bg-slate-50/50 group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-slate-200/50 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                          <span className={`text-[10px] font-bold ${
                            item.status === '已上线' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>{item.status}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4 group-hover:text-rose-600 transition-colors">{item.issue}</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">实际案例</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">"{item.case}"</p>
                          </div>
                          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">系统对策</p>
                            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">{item.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Chart Integration */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <BarChart3 size={18} />
                      </div>
                      <h2 className="font-bold text-slate-800">营收增长与预测</h2>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> 实际营收</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded-sm border border-dashed border-slate-400"></div> 预测趋势</div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={INDUSTRY_DASHBOARD_DATA.home.salesChart}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `¥${v/10000}w`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(v: any) => [`¥${v.toLocaleString()}`, '金额']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="实际营收" />
                        <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="预测趋势" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders Table Integration */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <ClipboardList size={18} />
                      </div>
                      <h2 className="font-bold text-slate-800">最近订单</h2>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                      >
                        <Download size={14} />
                        导出 CSV
                      </button>
                      <button 
                        onClick={exportToHTML}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                      >
                        <FileCode size={14} />
                        导出 HTML
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                          <th 
                            className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => handleSort('id')}
                          >
                            <div className="flex items-center">
                              订单编号
                              {orderSortConfig.key === 'id' ? (
                                orderSortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
                              ) : <ArrowUpDown size={12} className="ml-1 opacity-30" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center">
                              客户名称
                              {orderSortConfig.key === 'customer' ? (
                                orderSortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
                              ) : <ArrowUpDown size={12} className="ml-1 opacity-30" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => handleSort('date')}
                          >
                            <div className="flex items-center">
                              日期
                              {orderSortConfig.key === 'date' ? (
                                orderSortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
                              ) : <ArrowUpDown size={12} className="ml-1 opacity-30" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => handleSort('amount')}
                          >
                            <div className="flex items-center">
                              金额
                              {orderSortConfig.key === 'amount' ? (
                                orderSortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
                              ) : <ArrowUpDown size={12} className="ml-1 opacity-30" />}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center">
                              状态
                              {orderSortConfig.key === 'status' ? (
                                orderSortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
                              ) : <ArrowUpDown size={12} className="ml-1 opacity-30" />}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-indigo-50/40 transition-all duration-200 group">
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{order.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{order.customer}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{order.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{order.amount}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={order.status as any} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setSelectedOrder(order as any)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                              >
                                <span>查看详情</span>
                                <ExternalLink size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setCurrentView("sales")}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      查看全部订单 →
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-8">
                {/* Strategic Goals */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Target size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800">年度战略目标</h2>
                  </div>
                  <div className="space-y-6">
                    {STRATEGIC_GOALS.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-700">{goal.title}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">目标: {goal.target}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              goal.status === 'on-track' ? 'bg-emerald-500' : 
                              goal.status === 'at-risk' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            goal.status === 'on-track' ? 'text-emerald-600' : 
                            goal.status === 'at-risk' ? 'text-amber-600' : 'text-rose-600'
                          }`}>{goal.status}</span>
                          <span className="text-xs font-bold text-slate-900">{goal.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Global Market Share */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Globe size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800">全球市场分布</h2>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-900">4</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">核心区域</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {[
                      { label: "华东地区", value: "45%", color: "bg-indigo-500" },
                      { label: "华南地区", value: "28%", color: "bg-emerald-500" },
                      { label: "欧美出口", value: "15%", color: "bg-blue-500" },
                      { label: "其他区域", value: "12%", color: "bg-slate-300" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-xs text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">系统运行状态: 良好</span>
                  </div>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case "users":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">新增用户</button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex gap-4">
                <input type="text" placeholder="输入用户名或手机号..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                <button className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium">搜索</button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-3">用户名</th>
                    <th className="px-6 py-3">部门</th>
                    <th className="px-6 py-3">角色</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3">创建时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "工程师小王", dept: "技术部", role: "管理员", status: "正常", time: "2024-01-15" },
                    { name: "张经理", dept: "销售部", role: "销售主管", status: "正常", time: "2024-02-10" },
                    { name: "李会计", dept: "财务部", role: "会计", status: "正常", time: "2024-03-05" },
                  ].map((user, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.dept}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.role}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-100">正常</span></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "insights":
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">多维决策洞察 (Multi-Perspective Insights)</h1>
                <p className="text-slate-500 mt-1">基于行业专家模型的全方位经营分析与风险评估</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <Download size={16} /> 导出决策报告
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-100">
                  <Zap size={16} /> AI 深度复盘
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRY_DASHBOARD_DATA.insights.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl border ${item.border} ${item.bg} shadow-sm hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      {item.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.kpi.label}</p>
                      <p className="text-lg font-bold text-slate-900">{item.kpi.value}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.role}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-tighter">{item.summary}</p>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/40">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      “{item.content}”
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">实控人战略看板: 经营韧性评估</h2>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    基于当前 ERP 实时数据（订单、库存、成本）的综合压力测试。在原材料上涨 10% 或汇率波动 5% 的极端情况下，企业仍能保持 12% 以上的净利率。
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">抗风险指数</p>
                      <p className="text-2xl font-bold text-emerald-400">88/100</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">供应链稳定性</p>
                      <p className="text-2xl font-bold text-indigo-400">高 (Stable)</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-pulse"></div>
                      <div className="absolute inset-4 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck size={64} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
            </div>
          </div>
        );
      case "sales":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">外贸销售与订单盈利分析</h1>
                <p className="text-sm text-slate-500">基于 FOB 报价、退税及贡献率的动态决策模型</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={exportSalesToHTML}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  导出 HTML
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <Calculator size={16} />
                  模拟报价工具
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {INDUSTRY_DASHBOARD_DATA.salesModel.metrics.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-500 transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-bold text-indigo-600 mb-1 uppercase tracking-tighter">公式: {stat.formula}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Calculator size={18} />
                  </div>
                  <h2 className="font-bold text-slate-800">订单精细化盈利分析 (单件/退税/贡献率)</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">动态决策依据</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                      <th className="px-6 py-4">订单编号</th>
                      <th className="px-6 py-4">款式/客户</th>
                      <th className="px-6 py-4 text-right">FOB 单价 (USD)</th>
                      <th className="px-6 py-4 text-right">含税成本 (CNY)</th>
                      <th className="px-6 py-4 text-right">单件退税 (CNY)</th>
                      <th className="px-6 py-4 text-right">贡献毛益率</th>
                      <th className="px-6 py-4">决策建议</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ORDER_SALES_ANALYSIS.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{order.style}</p>
                          <p className="text-[10px] text-slate-400">{order.customer}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">${order.fobPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-slate-600">¥{order.unitCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-bold">+¥{order.rebate.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold ${order.margin > 25 ? 'text-emerald-600' : 'text-indigo-600'}`}>{order.margin}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${order.margin > 25 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${order.margin}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.recommendation.includes('承接') ? 'bg-emerald-100 text-emerald-700' : 
                            order.recommendation.includes('优化') ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>{order.recommendation}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <TrendingUp size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800">出口营收趋势分析 (FOB 结算)</h2>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md">营收额</button>
                    <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">利润率</button>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SALES_CHART_DATA}>
                      <defs>
                        <linearGradient id="colorSalesPage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `¥${value / 10000}w`} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesPage)" name="实际营收 (FOB)" />
                      <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="预测营收" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">外贸订单转化漏斗</h3>
                  <div className="space-y-4">
                    {INDUSTRY_DASHBOARD_DATA.salesModel.orderFunnel.map((item, i) => (
                      <div key={i} className={`p-4 rounded-lg flex items-center justify-between ${item.color}`}>
                        <span className="font-bold text-xs">{item.label}</span>
                        <div className="text-right">
                          <p className="font-black text-sm">{item.value}</p>
                          <p className="text-[10px] opacity-70">占比/转化: {item.percent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">动态决策支持 (Decision Support)</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">价格策略</p>
                      <p className="text-xs text-slate-700 leading-relaxed">检测到“极简廓形西装”贡献率超 25%，建议对 Nordstrom 下季度订单上调 3% FOB 报价。</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">成本预警</p>
                      <p className="text-xs text-slate-700 leading-relaxed">“丝光棉基础T恤”退税后毛利仅 18%，低于 20% 警戒线，需核查面料采购成本。</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">产能分配</p>
                      <p className="text-xs text-slate-700 leading-relaxed">优先保障 Lululemon 订单生产，其单件贡献毛益额最高，利于现金流回笼。</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">全球市场贡献度</h3>
                  <div className="space-y-6 mt-4">
                    {INDUSTRY_DASHBOARD_DATA.salesModel.marketContribution.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-700">{item.label}</span>
                          <span className="font-black text-slate-900">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-black mb-4">外贸核心利润模型：出口退税</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    针织服装行业出口退税率通常为 <span className="text-emerald-400 font-bold">13%</span>。通过优化进项发票管理与出口报关一致性，可显著提升企业的净利润空间。
                  </p>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">退税计算演示</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-slate-400">含税采购金额:</span><span className="font-mono">¥1,130,000</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-400">增值税率 (VAT):</span><span className="font-mono">13%</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-400">退税率 (Rebate):</span><span className="font-mono">13%</span></div>
                      <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black">
                        <span className="text-emerald-400">应退税额:</span>
                        <span className="text-emerald-400">¥130,000</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-sm font-black mb-3 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-400" />
                      外贸合规与风险预警
                    </h4>
                    <ul className="space-y-3 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                        <span>汇率波动风险：建议锁定远期结汇，对冲汇率下行压力。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                        <span>信用证 (L/C) 审核：严格核对单证一致性，规避拒付风险。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                        <span>原产地证明：确保符合 RCEP 或其他协定，降低客户进口关税。</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <Globe size={300} />
              </div>
            </div>
          </div>
        );
      case "finance":
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">资产损益 (Financial Statements)</h1>
                <p className="text-sm text-slate-500">集成资产负债、利润核算及现金流监控</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <Download size={16} /> 导出财务报表
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Balance Sheet Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Scale size={20} className="text-indigo-500" />
                      资产负债概览 (Balance Sheet Overview)
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">截止今日</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FINANCE_DATA.balanceSheet.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{section.category}</h3>
                        <div className="space-y-3">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">{item.name}</span>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                <p className={`text-[10px] font-bold ${item.change.startsWith('+') ? 'text-emerald-500' : item.change === '0%' ? 'text-slate-400' : 'text-rose-500'}`}>{item.change}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profit and Loss Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp size={20} className="text-emerald-500" />
                      损益趋势分析 (P&L Trend)
                    </h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> 营收</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded-sm"></div> 成本</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> 利润</div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={FINANCE_DATA.profitAndLoss}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `¥${v}w`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#6366f1" name="营业收入" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cost" fill="#fb7185" name="营业成本" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#10b981" name="净利润" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Financial Insights Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    财务健康度评估
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">流动比率 (Current Ratio)</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-white">2.4</p>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">安全</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">资产负债率 (D/A Ratio)</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-white">35%</p>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">稳健</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">应收账款周转天数</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-white">28天</p>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">高效</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">税务与退税监控</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">待办理退税</p>
                          <p className="text-sm font-bold text-slate-900">¥167,400</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-bold text-emerald-600 hover:underline">去办理</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">进项抵扣不足</p>
                          <p className="text-sm font-bold text-slate-900">缺口 ¥45k</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-bold text-amber-600 hover:underline">优化建议</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "inventory":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">库存报表 (多维监控)</h1>
                <p className="text-sm text-slate-500">包含采购在途、生产中(WIP)及仓库成品数据</p>
              </div>
              <button 
                onClick={exportInventoryToHTML}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                导出 HTML
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "采购在途 (Procurement)", value: "12,500", color: "text-blue-600" },
                { label: "生产中 (WIP)", value: "8,280", color: "text-indigo-600" },
                { label: "仓库成品 (Warehouse)", value: "24,500", color: "text-emerald-600" },
                { label: "库存总价值", value: "¥892.4w", color: "text-slate-900" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Package size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800">各类目库存预警分析 (含上限/安全线)</h2>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> 当前值</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> 安全线</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div> 上限</div>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={INVENTORY_CHART_DATA} layout="vertical" margin={{ left: 20, right: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 'dataMax + 2000']} hide />
                      <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name) => [value, name === 'current' ? '当前库存' : name === 'safety' ? '安全库存' : '库存上限']}
                      />
                      <Bar dataKey="max" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'right', fill: '#94a3b8', fontSize: 10, formatter: (v: any) => `上限:${v}` }} />
                      <Bar dataKey="current" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'insideRight', fill: '#fff', fontSize: 10, fontWeight: 'bold' }} />
                      <Bar dataKey="safety" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">库存计算与预警逻辑</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">安全库存 (Safety Stock) 公式:</p>
                      <p className="text-xs font-mono font-bold text-slate-700">SS = (Max Lead Time × Max Daily Usage) - (Avg Lead Time × Avg Daily Usage)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">库存价值 (Valuation) 公式:</p>
                      <p className="text-xs font-mono font-bold text-slate-700">Value = Σ (Current Qty × Weighted Average Cost)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <TrendingUp size={18} />
                    </div>
                    <h2 className="font-bold text-slate-800">库存价值趋势 (全口径)</h2>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: '10月', procurement: 120, wip: 80, warehouse: 200 },
                      { month: '11月', procurement: 150, wip: 90, warehouse: 220 },
                      { month: '12月', procurement: 180, wip: 110, warehouse: 250 },
                      { month: '1月', procurement: 140, wip: 100, warehouse: 230 },
                      { month: '2月', procurement: 130, wip: 95, warehouse: 210 },
                      { month: '3月', procurement: 160, wip: 120, warehouse: 280 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `¥${v}w`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="procurement" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="采购在途" />
                      <Area type="monotone" dataKey="wip" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="生产中(WIP)" />
                      <Area type="monotone" dataKey="warehouse" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="仓库成品" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">库存预警明细 (实时)</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3">物料名称</th>
                    <th className="px-6 py-3">当前库存</th>
                    <th className="px-6 py-3">安全库存</th>
                    <th className="px-6 py-3">库存上限</th>
                    <th className="px-6 py-3">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "精梳棉面料-白色", stock: 120, safe: 500, max: 2000, status: "严重不足" },
                    { name: "YKK拉链-8号", stock: 45, safe: 200, max: 1000, status: "严重不足" },
                    { name: "涤纶线-黑色", stock: 800, safe: 1000, max: 5000, status: "库存偏低" },
                    { name: "包装纸箱-标准型", stock: 4500, safe: 1000, max: 4000, status: "超出上限" },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4">{item.stock}</td>
                      <td className="px-6 py-4">{item.safe}</td>
                      <td className="px-6 py-4">{item.max}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === '严重不足' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                          item.status === '超出上限' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "production":
        const filteredProduction = productionProgress.filter(item => {
          const matchesSearch = item.orderId.toLowerCase().includes(productionFilters.searchTerm.toLowerCase()) || 
                              item.style.toLowerCase().includes(productionFilters.searchTerm.toLowerCase());
          const matchesStatus = productionFilters.status === '' || item.status === productionFilters.status;
          const matchesStep = productionFilters.step === '' || PRODUCTION_STEPS[item.currentStep] === productionFilters.step;
          const matchesHorizon = productionFilters.horizon === 'all' || item.horizon === productionFilters.horizon;
          return matchesSearch && matchesStatus && matchesStep && matchesHorizon;
        });

        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-12 pb-20"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-6">
              <div className="space-y-2">
                <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">生产全流程监控</h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl">从面料到货到最终出货的实时环节追踪，集成智能预警与主动提醒系统</p>
              </div>
              <div className="flex gap-4">
                <button className="apple-button-secondary !px-10 shadow-sm hover:shadow-lg transition-all">刷新数据</button>
                <button 
                  onClick={exportProductionToHTML}
                  className="apple-button-primary flex items-center gap-3 !px-10 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all"
                >
                  <Download size={20} />
                  导出进度
                </button>
              </div>
            </div>

            {/* Proactive Alerts Carousel */}
            <ProductionAlertsCarousel />

            <SmartScheduling />

            {/* Filter Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="apple-card p-10 flex flex-wrap items-center gap-12 border-white/40 bg-white/70 shadow-2xl shadow-slate-200/50"
            >
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">排产周期 (Horizon)</span>
                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'current', label: '当前生产' },
                    { id: 'future', label: '远期计划' }
                  ].map(h => (
                    <button
                      key={h.id}
                      onClick={() => setProductionFilters({ ...productionFilters, horizon: h.id })}
                      className={`px-8 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                        productionFilters.horizon === h.id ? 'bg-white shadow-lg text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-12 w-[1px] bg-slate-200 hidden lg:block"></div>
              <div className="flex-1 min-w-[350px] relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="搜索订单号、款式名称或负责人..." 
                  className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-transparent rounded-[24px] text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-400 shadow-inner"
                  value={productionFilters.searchTerm}
                  onChange={(e) => setProductionFilters({ ...productionFilters, searchTerm: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">状态 (Status)</span>
                <select 
                  className="bg-slate-50/50 border border-transparent rounded-2xl px-8 py-5 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
                  value={productionFilters.status}
                  onChange={(e) => setProductionFilters({ ...productionFilters, status: e.target.value })}
                >
                  <option value="">全部状态</option>
                  <option value="normal">正常 (Normal)</option>
                  <option value="warning">预警 (Warning)</option>
                </select>
              </div>
              {(productionFilters.searchTerm || productionFilters.status || productionFilters.step || productionFilters.horizon !== 'all') && (
                <button 
                  onClick={() => setProductionFilters({ searchTerm: '', status: '', step: '', horizon: 'all' })}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-2 active:scale-95"
                >
                  <Activity size={14} />
                  重置筛选
                </button>
              )}
            </motion.div>

            <div className="space-y-8">
              {filteredProduction.length > 0 ? (
                filteredProduction.map((item, i) => {
                  const schedule = MONTHLY_PRODUCTION_SCHEDULE.find(s => s.orderId === item.orderId);
                  const days = Array.from({ length: 31 }, (_, i) => i + 1);
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                      className="apple-card p-0 space-y-0 border-white/40 bg-white/80 shadow-2xl shadow-slate-200/40 hover:shadow-3xl hover:shadow-slate-300/50 transition-all group relative overflow-hidden"
                    >
                      <div className="p-10 space-y-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none transition-all group-hover:bg-indigo-500/10"></div>
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-8">
                            <motion.div 
                              whileHover={{ rotate: 15, scale: 1.15 }}
                              className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl ${
                                item.status === 'warning' ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-indigo-50 text-indigo-600 shadow-indigo-100'
                              }`}
                            >
                              <GitBranch size={36} />
                            </motion.div>
                            <div>
                              <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{item.style}</h3>
                              <div className="flex flex-wrap items-center gap-6 mt-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">订单号: <span className="text-slate-600">{item.orderId}</span></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">数量: <span className="text-slate-900">{item.qty} 件</span></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">当前环节: <span className="font-black">{PRODUCTION_STEPS[item.currentStep]}</span></span>
                                {item.actualFinishTime && (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock size={14} className="text-slate-300" />
                                    最后更新: {item.actualFinishTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-6">
                            <div className="flex items-center gap-8">
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">总完成进度</p>
                                <span className={`text-5xl font-black tracking-tighter ${item.status === 'warning' ? 'text-rose-600' : 'text-indigo-600'}`}>
                                  {item.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Integrated Gantt Timeline */}
                        {schedule && (
                          <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
                            <div className="flex items-center justify-between mb-6">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={16} className="text-indigo-400" />
                                生产排程甘特图 (Schedule Timeline)
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">月份: {schedule.month}</span>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar no-scrollbar">
                              <div className="min-w-[800px] space-y-4">
                                <div className="flex border-b border-slate-200/50 pb-2">
                                  <div className="w-32 shrink-0"></div>
                                  <div className="flex-1 flex justify-between px-2">
                                    {days.filter(d => d % 2 !== 0).map(d => (
                                      <div key={d} className="w-6 text-center text-[9px] font-bold text-slate-300">{d}</div>
                                    ))}
                                  </div>
                                </div>
                                {schedule.steps.map((step, sIdx) => {
                                  const startDay = parseInt(step.startDate.split('-')[1]);
                                  const endDay = parseInt(step.endDate.split('-')[1]);
                                  const duration = endDay - startDay + 1;
                                  const leftOffset = (startDay - 1) * (100 / 31);
                                  const width = duration * (100 / 31);
                                  const isCurrentStep = PRODUCTION_STEPS[item.currentStep] === step.name;
                                  
                                  return (
                                    <div key={sIdx} className="flex items-center">
                                      <div className="w-32 shrink-0 pr-4">
                                        <span className={`text-[10px] font-bold ${isCurrentStep ? 'text-indigo-600' : 'text-slate-500'}`}>{step.name}</span>
                                      </div>
                                      <div className="flex-1 h-6 bg-white rounded-full relative overflow-hidden border border-slate-100 shadow-sm">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${width}%` }}
                                          style={{ left: `${leftOffset}%`, position: 'absolute' }}
                                          className={`top-1 bottom-1 rounded-full shadow-sm flex items-center px-2 ${
                                            step.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                                            step.status === 'in-progress' ? 'bg-indigo-500/20 border border-indigo-500/30' :
                                            'bg-slate-100 border border-slate-200'
                                          }`}
                                        >
                                          <div 
                                            className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ${
                                              step.status === 'completed' ? 'bg-emerald-500' :
                                              step.status === 'in-progress' ? 'bg-indigo-500' :
                                              'bg-slate-200'
                                            }`}
                                            style={{ width: `${step.progress}%` }}
                                          />
                                        </motion.div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Integrated Action Bar */}
                        {item.currentStep < PRODUCTION_STEPS.length - 1 && (
                          <div className="flex items-center justify-between bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Zap size={24} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">当前待办工序</p>
                                <p className="text-lg font-black text-slate-900">{PRODUCTION_STEPS[item.currentStep]}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => completeStep(item.orderId)}
                              className="apple-button-primary !py-4 !px-12 !text-xs !font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-200 active:scale-95 hover:shadow-indigo-300 transition-all"
                            >
                              <CheckCircle2 size={20} />
                              确认完成该工序
                            </button>
                          </div>
                        )}

                        {/* Stepper UI */}
                        <div className="relative mt-12 mb-12 px-10">
                          <div className="absolute top-1/2 left-16 right-16 h-[3px] bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                          <div className="flex justify-between relative z-10 overflow-x-auto pb-10 custom-scrollbar no-scrollbar">
                            {PRODUCTION_STEPS.map((step, index) => {
                              const isCompleted = index < item.currentStep;
                              const isCurrent = index === item.currentStep;
                              const stepHistory = item.history?.find(h => h.step === step);
                              return (
                                <div key={step} className="flex flex-col items-center group min-w-[140px]">
                                  <motion.div 
                                    whileHover={!isCompleted && !isCurrent ? { scale: 1.15, rotate: 5 } : { scale: 1.1 }}
                                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-lg font-black transition-all duration-500 border-none shadow-xl ${
                                      isCompleted ? 'bg-emerald-500 text-white shadow-emerald-200' :
                                      isCurrent ? 'bg-indigo-600 text-white scale-125 shadow-2xl shadow-indigo-300 ring-[8px] ring-indigo-50' :
                                      'bg-white text-slate-400 border border-slate-100'
                                    }`}
                                  >
                                    {isCompleted ? <CheckCircle2 size={28} /> : index + 1}
                                  </motion.div>
                                  <div className="mt-8 flex flex-col items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-500 ${
                                      isCurrent ? 'text-indigo-600' : 
                                      isCompleted ? 'text-slate-600' : 'text-slate-400'
                                    }`}>
                                      {step}
                                    </span>
                                    {isCompleted && stepHistory && (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            A: {stepHistory.actualQty}
                                          </span>
                                          {stepHistory.bQty > 0 && (
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                              B: {stepHistory.bQty}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[8px] text-slate-400">{stepHistory.worker}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Final Shipment Overview (Visible when near completion) */}
                        {item.currentStep >= 10 && (
                          <div className="mt-10 p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Truck size={28} className="text-indigo-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black tracking-tight">最终产出概览</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">基于末端环节实时数据汇总</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">实际出货 (A品)</p>
                                <p className="text-3xl font-black text-emerald-400 tracking-tighter">
                                  {item.history?.find(h => h.step === "验针包装")?.actualQty || item.history?.find(h => h.step === "成品检验")?.actualQty || "-"} <span className="text-xs font-normal ml-1">件</span>
                                </p>
                              </div>
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">累计次品 (B品)</p>
                                <p className="text-3xl font-black text-amber-400 tracking-tighter">
                                  {item.history?.reduce((acc, h) => acc + (h.bQty || 0), 0) || 0} <span className="text-xs font-normal ml-1">件</span>
                                </p>
                              </div>
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">综合正品率</p>
                                <p className="text-3xl font-black text-indigo-400 tracking-tighter">
                                  {(() => {
                                    const a = item.history?.find(h => h.step === "验针包装")?.actualQty || item.history?.find(h => h.step === "成品检验")?.actualQty || 0;
                                    const b = item.history?.reduce((acc, h) => acc + (h.bQty || 0), 0) || 0;
                                    if (a + b === 0) return "-";
                                    return ((a / (a + b)) * 100).toFixed(1) + "%";
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    {/* Detailed Sub-steps */}
                    {item.subSteps && (
                      <div className="mt-16 pt-16 border-t border-slate-100/80">
                        <div className="flex items-center justify-between mb-10">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                            <Activity size={20} className="text-indigo-400" />
                            工序明细进度 (Process Details)
                          </span>
                          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div><span className="text-slate-500">已完成</span></div>
                            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-200"></div><span className="text-slate-500">进行中</span></div>
                            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-slate-500">待开始</span></div>
                            <div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div><span className="text-slate-500">延期</span></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {item.subSteps.map((sub, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ y: -8, scale: 1.02 }}
                              className={`flex flex-col gap-4 p-6 rounded-3xl border transition-all duration-300 hover:shadow-2xl ${
                                sub.status === 'completed' ? 'bg-emerald-50/30 border-emerald-100/50' :
                                (sub.status === 'in-progress' || sub.status === 'processing') ? 'bg-indigo-50/30 border-indigo-100/50 ring-1 ring-indigo-100/20 shadow-lg shadow-indigo-100/20' :
                                sub.status === 'delayed' ? 'bg-rose-50/30 border-rose-100/50 ring-1 ring-rose-100/20 shadow-lg shadow-rose-100/20' :
                                'bg-slate-50/30 border-slate-100/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-black tracking-tight ${
                                  sub.status === 'completed' ? 'text-emerald-700' :
                                  (sub.status === 'in-progress' || sub.status === 'processing') ? 'text-indigo-700' :
                                  sub.status === 'delayed' ? 'text-rose-700' :
                                  'text-slate-600'
                                }`}>{sub.name}</span>
                                <div className={`w-3 h-3 rounded-full ${
                                  sub.status === 'completed' ? 'bg-emerald-500 shadow-sm shadow-emerald-200' :
                                  (sub.status === 'in-progress' || sub.status === 'processing') ? 'bg-indigo-500 animate-pulse shadow-sm shadow-indigo-200' :
                                  sub.status === 'delayed' ? 'bg-rose-500 shadow-sm shadow-rose-200' :
                                  'bg-slate-200'
                                }`}></div>
                              </div>
                              
                              <div className="h-2 w-full bg-slate-100/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: sub.status === 'completed' ? '100%' : 
                                           (sub.status === 'in-progress' || sub.status === 'processing') ? '65%' : 
                                           sub.status === 'delayed' ? '40%' : '0%' 
                                  }}
                                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 + idx * 0.05 }}
                                  className={`h-full rounded-full shadow-sm ${
                                    sub.status === 'completed' ? 'bg-emerald-500' :
                                    (sub.status === 'in-progress' || sub.status === 'processing') ? 'bg-indigo-500' :
                                    sub.status === 'delayed' ? 'bg-rose-500' :
                                    'bg-slate-200'
                                  }`}
                                ></motion.div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {sub.status === 'completed' ? '100%' : 
                                   (sub.status === 'in-progress' || sub.status === 'processing') ? '65%' : 
                                   sub.status === 'delayed' ? '40%' : '0%'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                  <User size={12} className="text-slate-300" />
                                  {sub.operator}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="apple-card p-24 text-center space-y-8 bg-white/50 border-dashed border-slate-300"
                >
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                    <Search size={56} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">未找到匹配的订单</h3>
                    <p className="text-slate-500 font-medium text-lg">请尝试调整筛选条件或搜索关键词</p>
                  </div>
                  <button 
                    onClick={() => setProductionFilters({ searchTerm: '', status: '', step: '', horizon: 'all' })}
                    className="apple-button-secondary !px-12 !py-4"
                  >
                    清除所有筛选
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      case "management-dispatch":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">管理者派单中心</h1>
                <p className="text-sm text-slate-500">根据产能负荷，将订单分配至最优生产线或分工厂</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">待派单订单: 3</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">订单编号</th>
                    <th className="px-6 py-4">款式名称</th>
                    <th className="px-6 py-4">数量</th>
                    <th className="px-6 py-4">交期</th>
                    <th className="px-6 py-4">建议工厂</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: "ORD-2024-008", style: "夏季轻薄夹克", qty: 2000, date: "2024-05-15", suggestion: "锦绣分厂 (负荷 65%)" },
                    { id: "ORD-2024-009", style: "商务休闲西裤", qty: 1500, date: "2024-05-20", suggestion: "本部 A 线 (负荷 40%)" },
                    { id: "ORD-2024-010", style: "重磅卫衣", qty: 3000, date: "2024-06-01", suggestion: "外协 C 厂 (负荷 20%)" },
                  ].map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{o.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{o.style}</td>
                      <td className="px-6 py-4 text-slate-600">{o.qty} 件</td>
                      <td className="px-6 py-4 text-slate-500">{o.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-indigo-600 font-medium">{o.suggestion}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">
                          立即派单
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "flexible-dispatch":
        return <FlexibleManufacturingCockpit />;
      case "sales-tracking":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">销售订单进度跟踪</h1>
                <p className="text-sm text-slate-500">业务员实时查看名下订单的生产、物流及结汇状态</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">我的订单列表</h3>
                  <div className="space-y-2">
                    {productionProgress.map(p => (
                      <button 
                        key={p.orderId}
                        onClick={() => setSelectedOrder(p as any)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${selectedOrder?.id === p.orderId ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                      >
                        <p className="text-xs font-bold text-slate-800">{p.orderId}</p>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">{p.style}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[9px] font-bold text-indigo-600">{PRODUCTION_STEPS[p.currentStep]}</span>
                          <span className="text-[9px] text-slate-400">{p.progress}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3">
                {selectedOrder ? (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedOrder.id} - {selectedOrder.customer || (selectedOrder as any).style}</h2>
                        <p className="text-sm text-slate-500 mt-1">当前状态: <span className="text-indigo-600 font-bold">{PRODUCTION_STEPS[(selectedOrder as any).currentStep]}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{(selectedOrder as any).progress}%</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">总体完成度</p>
                      </div>
                    </div>

                    <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                      {PRODUCTION_STEPS.map((step, i) => {
                        const isCompleted = i < (selectedOrder as any).currentStep;
                        const isCurrent = i === (selectedOrder as any).currentStep;
                        return (
                          <div key={step} className="relative">
                            <div className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                              isCompleted ? 'border-emerald-500 bg-emerald-500' : 
                              isCurrent ? 'border-indigo-500 scale-125 shadow-lg shadow-indigo-100' : 'border-slate-200'
                            }`}>
                              {isCompleted && <CheckCircle2 size={10} className="text-white mx-auto mt-0.5" />}
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-bold ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step}</h4>
                                {isCompleted && (selectedOrder as any).history?.find((h: any) => h.step === step) && (
                                  <div className="flex gap-2">
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      A: {(selectedOrder as any).history.find((h: any) => h.step === step).actualQty}
                                    </span>
                                    {(selectedOrder as any).history.find((h: any) => h.step === step).bQty > 0 && (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                        B: {(selectedOrder as any).history.find((h: any) => h.step === step).bQty}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {isCompleted ? `已于 ${(selectedOrder as any).history?.find((h: any) => h.step === step)?.time || new Date().toLocaleDateString()} 完成` : 
                                 isCurrent ? '正在进行中，预计 2 天后完成' : '尚未开始'}
                              </p>
                              {isCompleted && (selectedOrder as any).history?.find((h: any) => h.step === step)?.notes && (
                                <p className="text-[10px] text-slate-400 italic mt-1">备注: {(selectedOrder as any).history.find((h: any) => h.step === step).notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(selectedOrder as any).currentStep >= 10 && (
                      <div className="mt-12 p-6 bg-slate-900 rounded-3xl text-white">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Truck size={24} className="text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">最终出货概览</h3>
                            <p className="text-xs text-slate-400">基于“验针包装”及“物流出运”环节数据汇总</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">实际出货 (A品)</p>
                            <p className="text-2xl font-black text-emerald-400">
                              {(selectedOrder as any).history?.find((h: any) => h.step === "验针包装")?.actualQty || (selectedOrder as any).history?.find((h: any) => h.step === "成品检验")?.actualQty || "-"} <span className="text-xs font-normal">件</span>
                            </p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">累计次品 (B品)</p>
                            <p className="text-2xl font-black text-amber-400">
                              {(selectedOrder as any).history?.reduce((acc: number, h: any) => acc + (h.bQty || 0), 0) || 0} <span className="text-xs font-normal">件</span>
                            </p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">综合正品率</p>
                            <p className="text-2xl font-black text-indigo-400">
                              {(() => {
                                const a = (selectedOrder as any).history?.find((h: any) => h.step === "验针包装")?.actualQty || (selectedOrder as any).history?.find((h: any) => h.step === "成品检验")?.actualQty || 0;
                                const b = (selectedOrder as any).history?.reduce((acc: number, h: any) => acc + (h.bQty || 0), 0) || 0;
                                if (a + b === 0) return "-";
                                return ((a / (a + b)) * 100).toFixed(1) + "%";
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400">请从左侧选择一个订单查看详细进度时间轴</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "capacity-dashboard":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">全工厂产能看板</h1>
                <p className="text-sm text-slate-500">实时监控各生产线、分工厂的负荷状态，优化资源配置</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "本部 A 线 (西装专线)", load: 85, status: "busy", workers: 45, orders: 3 },
                { name: "本部 B 线 (休闲专线)", load: 40, status: "normal", workers: 38, orders: 2 },
                { name: "锦绣分厂 (针织专线)", load: 92, status: "critical", workers: 120, orders: 8 },
                { name: "外协 C 厂 (大衣外协)", load: 15, status: "idle", workers: 50, orders: 1 },
                { name: "外协 D 厂 (衬衫外协)", load: 60, status: "normal", workers: 30, orders: 4 },
              ].map(line => (
                <div key={line.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{line.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      line.status === 'critical' ? 'bg-rose-50 text-rose-600' :
                      line.status === 'busy' ? 'bg-amber-50 text-amber-600' :
                      line.status === 'idle' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {line.status === 'critical' ? '超负荷' : line.status === 'busy' ? '高负荷' : line.status === 'idle' ? '空闲' : '正常'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">当前负荷</span>
                      <span className="font-bold text-slate-900">{line.load}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${line.load}%` }}
                        className={`h-full rounded-full ${
                          line.load > 90 ? 'bg-rose-500' : line.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">在职员工</p>
                      <p className="text-lg font-bold text-slate-800">{line.workers}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">在制订单</p>
                      <p className="text-lg font-bold text-slate-800">{line.orders}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "task-center":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">个人待办中心</h1>
                <p className="text-sm text-slate-500">实时接收生产环节流转提醒，确保工序无缝衔接</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                  未完成: {tasks.filter(t => t.status === 'pending').length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      task.status === 'completed' ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-sm hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-xl ${task.status === 'completed' ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                          <ClipboardList size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              订单 {task.orderId}：请跟进 {task.step} 环节
                            </h3>
                            {task.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase animate-pulse">待处理</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <User size={12} />
                              负责人: <span className="font-bold text-slate-700">{task.assignee}</span>
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} />
                              发送时间: {task.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      {task.status === 'pending' && (
                        <button 
                          onClick={() => completeTask(task.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                        >
                          <CheckCircle2 size={14} />
                          标记完成
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ClipboardList size={32} />
                  </div>
                  <p className="text-slate-400">暂无待办事项，当生产环节流转时会自动提醒</p>
                </div>
              )}
            </div>
          </div>
        );
      case "knitting":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">针织工艺管理</h1>
                <p className="text-sm text-slate-500">管理针织面料的织造参数、克重及缩率控制</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                新建工艺单
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Monitor size={18} className="text-indigo-500" />
                  缩率监控公式与步骤 (Shrinkage Control)
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {['1. 取样', '2. 测量(洗前)', '3. 标准洗涤', '4. 测量(洗后)', '5. 计算'].map((step, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">{step}</div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {[
                    { name: "面料缩率 (Shrinkage %)", formula: "((L1 - L2) / L1) × 100%", desc: "L1: 洗前长度, L2: 洗后长度" },
                    { name: "克重变化率 (GSM Change %)", formula: "((G2 - G1) / G1) × 100%", desc: "G1: 洗前克重, G2: 洗后克重" },
                    { name: "扭度计算 (Spirality %)", formula: "(S / W) × 100%", desc: "S: 位移距离, W: 布幅宽度" },
                  ].map((f, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-800">{f.name}</span>
                        <span className="text-[10px] font-mono bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">核心公式</span>
                      </div>
                      <p className="text-lg font-mono font-bold text-indigo-600 my-2">{f.formula}</p>
                      <p className="text-xs text-slate-500">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  缩率波动监控 (实时)
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '10:00', val: 2.1 },
                      { time: '11:00', val: 2.3 },
                      { time: '12:00', val: 1.9 },
                      { time: '13:00', val: 2.5 },
                      { time: '14:00', val: 2.2 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 4]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">工艺编号</th>
                    <th className="px-6 py-4">工艺名称</th>
                    <th className="px-6 py-4">机台规格</th>
                    <th className="px-6 py-4">原料纱线</th>
                    <th className="px-6 py-4 text-center">设计克重</th>
                    <th className="px-6 py-4 text-center">预估缩率</th>
                    <th className="px-6 py-4">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {KNITTING_TECH_DATA.map((tech) => (
                    <tr key={tech.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{tech.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{tech.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{tech.machine}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{tech.yarn}</td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-slate-900">{tech.gsm}</td>
                      <td className="px-6 py-4 text-sm text-center text-rose-500 font-medium">{tech.shrinkage}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tech.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                          {tech.status === 'active' ? '已启用' : '草稿'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "yarn":
        const MATERIAL_DATA = [
          { id: "Y-20240301", name: "32S/1 精梳棉", type: "纱线", supplier: "华纺纱线", stock: 1200, avgUsage: 45, unit: "kg" },
          { id: "F-20240305", name: "40S/2 丝光棉面料", type: "面料", supplier: "鲁泰纺织", stock: 2500, avgUsage: 150, unit: "m" },
          { id: "T-20240310", name: "YKK 5号金属拉链", type: "辅料", supplier: "YKK 中国", stock: 5000, avgUsage: 200, unit: "条" },
          { id: "P-20240315", name: "出口级加厚纸箱", type: "包装", supplier: "胜达包装", stock: 800, avgUsage: 40, unit: "个" },
          { id: "L-20240320", name: "定制织唛主标", type: "唛头", supplier: "艾利丹尼森", stock: 12000, avgUsage: 500, unit: "枚" },
        ];

        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">全口径物料管控</h1>
                <p className="text-sm text-slate-500">实时监控纱线、面料、辅料及包材库存水位</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Plus size={16} />
                入库登记
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "物料总价值", value: "¥2.45M", color: "text-blue-600", icon: <Package size={18} /> },
                { label: "本月采购额", value: "¥850k", color: "text-emerald-600", icon: <TrendingUp size={18} /> },
                { label: "待入库批次", value: "12 批", color: "text-amber-600", icon: <Clock size={18} /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList size={18} className="text-slate-400" />
                    物料明细与水位监控
                  </h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input type="text" placeholder="搜索物料..." className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/10" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3">物料类型</th>
                        <th className="px-6 py-3">名称/规格</th>
                        <th className="px-6 py-3 text-right">当前库存</th>
                        <th className="px-6 py-3 text-right">供应天数</th>
                        <th className="px-6 py-3">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MATERIAL_DATA.map((material, i) => {
                        const daysOfSupply = Math.round(material.stock / material.avgUsage);
                        
                        let status = { label: '正常', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', icon: null };
                        
                        const isCritical = daysOfSupply <= 5;
                        const isLow = daysOfSupply <= 15;

                        if (isCritical) {
                          status = { label: '严重不足', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <AlertTriangle size={12} /> };
                        } else if (isLow) {
                          status = { label: '库存偏低', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AlertCircle size={12} /> };
                        }

                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                material.type === '纱线' ? 'bg-blue-50 text-blue-600' :
                                material.type === '面料' ? 'bg-emerald-50 text-emerald-600' :
                                material.type === '辅料' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-slate-100 text-slate-600'
                              }`}>{material.type}</span>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">{material.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-700">{material.name}</p>
                              <p className="text-[10px] text-slate-400">{material.supplier}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-bold ${isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                {material.stock.toLocaleString()} {material.unit}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-medium text-slate-600">{daysOfSupply} 天</span>
                                <span className="text-[10px] text-slate-400">日均: {material.avgUsage}{material.unit}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-indigo-500" />
                    物料预警设置
                  </h3>
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      系统已根据生产计划自动计算物料需求。当前有 <span className="text-rose-600 font-bold">2</span> 项物料低于安全库存。
                    </p>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">采购建议</p>
                          <p className="text-[10px] text-amber-700 mt-1">
                            建议立即补货 <span className="font-bold">40S/2 丝光棉面料</span>，预计缺口 1,200m。
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                      生成采购申请单
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "quality":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">质量检验与外协反馈</h1>
                <p className="text-sm text-slate-500">解决“线头、疵点多”痛点，建立外协厂质量闭环反馈</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={exportQualityToHTML}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  导出 HTML
                </button>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  新增质检记录
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "本月合格率", value: "98.2%", color: "text-emerald-600", detail: "目标 99%" },
                { label: "主要疵点", value: "线头/跳针", color: "text-rose-600", detail: "占返修 73%" },
                { label: "外协返修率", value: "12.5%", color: "text-amber-600", detail: "高于自有工厂" },
                { label: "待检批次", value: "5", color: "text-indigo-600", detail: "平均等待 4h" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stat.detail}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-500" />
                外协厂质量反馈闭环 (Outsourced Quality Loop)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { type: "异常通报", status: "已发送", desc: "分工厂 A 订单 ORD-2024-006 发现大量未清线头，已发送整改通知。", icon: <AlertCircle className="text-rose-500" /> },
                  { type: "驻场指导", status: "进行中", desc: "QC 专家已入驻分工厂 B，针对跳针问题进行机台校准培训。", icon: <Users className="text-blue-500" /> },
                  { type: "质量扣款", status: "待确认", desc: "因返修率超标 5%，系统建议扣除该批次加工费的 2% 作为质量保证金。", icon: <DollarSign className="text-amber-500" /> },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="font-bold text-slate-800">{item.type}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">{item.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-500" />
                  返修原因深度分析 (Rework Reason Analysis)
                </h3>
                <span className="text-xs text-slate-400">数据范围: 最近 30 天</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    { reason: "线头未清", count: 450, percent: 45, color: "bg-rose-500" },
                    { reason: "缝线跳针/断线", count: 280, percent: 28, color: "bg-amber-500" },
                    { reason: "尺寸超标", count: 120, percent: 12, color: "bg-indigo-500" },
                    { reason: "污渍/色差", count: 80, percent: 8, color: "bg-slate-400" },
                    { reason: "其他疵点", count: 70, percent: 7, color: "bg-slate-300" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-700">{item.reason}</span>
                        <span className="text-slate-500">{item.count} 件 ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-widest">品质改进建议 (AI Advisor)</h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
                      <p><span className="font-bold text-slate-800">强化后道清线头工序：</span> 45% 的返修由线头引起，建议在整烫前增加强制性照灯清线头环节。</p>
                    </li>
                    <li className="flex gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                      <p><span className="font-bold text-slate-800">设备维护预警：</span> 跳针多发于 3 号、7 号机台，建议立即进行梭床间隙校准。</p>
                    </li>
                    <li className="flex gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></div>
                      <p><span className="font-bold text-slate-800">外协厂分级：</span> 锦绣分厂返修率高于均值 8%，建议下派 QC 驻场指导或削减订单量。</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">质检明细</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3">检验日期</th>
                    <th className="px-6 py-3">批次编号</th>
                    <th className="px-6 py-3">检验类型</th>
                    <th className="px-6 py-3">检验项目</th>
                    <th className="px-6 py-3">结果</th>
                    <th className="px-6 py-3">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { date: "2024-03-28", id: "QC-20240328-01", type: "在位检", item: "面料克重/缩率", result: "合格", note: "符合标准" },
                    { date: "2024-03-27", id: "QC-20240327-04", type: "出货检", item: "成衣尺寸检验", result: "合格", note: "腰围偏大0.5cm" },
                    { date: "2024-03-26", id: "QC-20240326-02", type: "第三方", item: "水洗色牢度", result: "合格", note: "4.5级" },
                  ].map((qc, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{qc.date}</td>
                      <td className="px-6 py-4 font-mono text-xs">{qc.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          qc.type === '在位检' ? 'bg-blue-50 text-blue-600' : 
                          qc.type === '出货检' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {qc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{qc.item}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                          {qc.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{qc.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "business":
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">款式管理</h1>
                <p className="text-sm text-slate-500">管理服装款式、SKU矩阵及物料清单(BOM)</p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                创建新款式
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Style List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="搜索款式编号或名称..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    {STYLES.map((style) => (
                      <div 
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedStyle?.id === style.id 
                            ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img src={style.image} alt={style.name} className="w-12 h-12 rounded-md object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{style.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{style.id}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{style.category}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                style.status === 'production' ? 'bg-emerald-100 text-emerald-700' : 
                                style.status === 'developing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {style.status === 'production' ? '大货生产' : style.status === 'developing' ? '样衣开发' : '已归档'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                {selectedStyle ? (
                  <>
                    {/* Style Header */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-6">
                      <img src={selectedStyle.image} alt={selectedStyle.name} className="w-32 h-32 rounded-xl object-cover border border-slate-100" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">{selectedStyle.name}</h2>
                            <p className="text-slate-500 font-mono text-sm">{selectedStyle.id}</p>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">类目</p>
                            <p className="text-sm font-medium text-slate-700">{selectedStyle.category}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">季节</p>
                            <p className="text-sm font-medium text-slate-700">{selectedStyle.season}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">状态</p>
                            <p className="text-sm font-medium text-slate-700">{selectedStyle.status === 'production' ? '大货生产' : '样衣开发'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SKU Matrix */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Package size={18} className="text-indigo-500" />
                          SKU 库存矩阵
                        </h3>
                        <div className="flex gap-2">
                          <button className="text-xs text-indigo-600 font-medium hover:underline">编辑矩阵</button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-4 py-3 text-xs font-bold text-slate-400 border-b border-r border-slate-100">颜色 \ 尺码</th>
                              {SKU_MATRIX.sizes.map(size => (
                                <th key={size} className="px-4 py-3 text-xs font-bold text-slate-600 border-b border-slate-100">{size}</th>
                              ))}
                              <th className="px-4 py-3 text-xs font-bold text-slate-800 border-b border-l border-slate-100 bg-slate-50/80">合计</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SKU_MATRIX.colors.map((color, i) => {
                              const rowTotal = SKU_MATRIX.data[i].reduce((a, b) => a + b, 0);
                              return (
                                <tr key={color}>
                                  <td className="px-4 py-3 text-sm font-bold text-slate-700 border-r border-slate-50 bg-slate-50/30">{color}</td>
                                  {SKU_MATRIX.data[i].map((val, j) => (
                                    <td key={j} className="px-4 py-3 text-sm text-slate-600 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                      {val}
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 text-sm font-bold text-slate-900 border-l border-slate-100 bg-slate-50/50">{rowTotal}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-50/80 font-bold">
                              <td className="px-4 py-3 text-xs text-slate-800 border-r border-slate-100">合计</td>
                              {SKU_MATRIX.sizes.map((_, j) => {
                                const colTotal = SKU_MATRIX.data.reduce((acc, row) => acc + row[j], 0);
                                return <td key={j} className="px-4 py-3 text-sm text-slate-900">{colTotal}</td>;
                              })}
                              <td className="px-4 py-3 text-sm text-indigo-600 bg-indigo-50/50">
                                {SKU_MATRIX.data.flat().reduce((a, b) => a + b, 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* BOM List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <ClipboardList size={18} className="text-emerald-500" />
                          物料清单 (BOM)
                        </h3>
                        <button className="text-xs text-emerald-600 font-medium hover:underline">导出 BOM</button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="px-6 py-3">物料名称</th>
                            <th className="px-6 py-3">规格/属性</th>
                            <th className="px-6 py-3 text-center">单位</th>
                            <th className="px-6 py-3 text-center">单件用量</th>
                            <th className="px-6 py-3 text-center">损耗率</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {BOM_DATA.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800">{item.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase">{item.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{item.spec}</td>
                              <td className="px-6 py-4 text-center text-slate-500">{item.unit}</td>
                              <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">{item.usage}</td>
                              <td className="px-6 py-4 text-center text-rose-500 font-medium">{item.loss}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Shirt size={48} className="mb-4 opacity-20" />
                    <p>请从左侧选择一个款式查看详情</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "costing":
        const addCustomCost = () => {
          if (newCost.label && newCost.value) {
            setCustomCosts([...customCosts, { ...newCost, id: Date.now() }]);
            setNewCost({ label: '', value: '', standardValue: '', type: 'indirect', sub: '' });
            setShowAddCost(false);
          }
        };

        const removeCustomCost = (id: number) => {
          setCustomCosts(customCosts.filter(c => c.id !== id));
        };

        const directCosts = [
          { label: "面料成本 (含损耗 5%)", value: "¥45.50", sub: "精梳棉 1.8m @ ¥25/m", standard: 45.50 },
          { label: "辅料成本 (含损耗 3%)", value: "¥12.80", sub: "拉链、主标、吊牌、包装袋", standard: 13.00 },
          { label: "人工成本 (全流程)", value: "¥35.00", sub: "含横机、套口、缝纫、后道", standard: standardLaborCost, isLabor: true },
          ...customCosts.filter(c => c.type === 'direct').map(c => ({ 
            label: c.label, 
            value: `¥${parseFloat(c.value).toFixed(2)}`, 
            sub: c.sub || '自定义直接成本',
            standard: parseFloat(c.standardValue || 0),
            actual: parseFloat(c.value || 0),
            isCustom: true,
            id: c.id
          }))
        ];

        const indirectCosts = [
          { label: "制造杂费/能耗", value: "¥8.50", sub: "水电、房租分摊、设备折旧", standard: 8.00, actual: 8.50 },
          { label: "增值税 (13%)", value: "¥19.50", sub: "基于销项税额计算", standard: 19.50, actual: 19.50 },
          { label: "出口退税 (预计 9%)", value: "-¥13.50", sub: "政策性补贴 (冲减成本)", highlight: "text-emerald-600", standard: -13.50, actual: -13.50 },
          ...customCosts.filter(c => c.type === 'indirect').map(c => ({ 
            label: c.label, 
            value: `¥${parseFloat(c.value).toFixed(2)}`, 
            sub: c.sub || '自定义间接成本',
            standard: parseFloat(c.standardValue || 0),
            actual: parseFloat(c.value || 0),
            isCustom: true,
            id: c.id
          }))
        ];

        const totalCost = (45.5 + 12.8 + 35.0 + 8.5 + 19.5 - 13.5) + 
          customCosts.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);

        const standardTotalCost = (45.5 + 13.0 + standardLaborCost + 8.0 + 19.5 - 13.5) + 
          customCosts.reduce((acc, curr) => acc + parseFloat(curr.standardValue || 0), 0);

        const costingSummary = [
          { label: "标准总成本", value: `¥${standardTotalCost.toFixed(2)}`, color: "text-slate-600", icon: <Target size={18} /> },
          { label: "实际总成本", value: `¥${totalCost.toFixed(2)}`, color: "text-slate-900", icon: <Activity size={18} /> },
          { 
            label: "总成本偏差", 
            value: `${(((totalCost - standardTotalCost) / standardTotalCost) * 100).toFixed(1)}%`, 
            color: totalCost > standardTotalCost ? "text-rose-600" : "text-emerald-600", 
            icon: <TrendingUp size={18} />, 
            sub: totalCost > standardTotalCost ? `超出预算 ¥${(totalCost - standardTotalCost).toFixed(2)}` : `低于预算 ¥${(standardTotalCost - totalCost).toFixed(2)}` 
          },
        ];

        const varianceData = [
          ...INDUSTRY_DASHBOARD_DATA.costing.variance.map(v => {
            if (v.item === "人工成本") {
              return { name: v.item, standard: standardLaborCost, actual: v.actual };
            }
            return { name: v.item, standard: v.standard, actual: v.actual };
          }),
          ...customCosts.map(c => ({ name: c.label, standard: parseFloat(c.standardValue || 0), actual: parseFloat(c.value || 0) }))
        ];

        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">成本核算与经营模型</h1>
                <p className="text-sm text-slate-500">从面辅料到人工、损耗、税收及退税的全口径成本管理</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddCost(!showAddCost)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  添加自定义成本项
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  发起调价审批
                </button>
              </div>
            </div>

            {showAddCost && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">成本项名称</label>
                    <input 
                      type="text" 
                      placeholder="如：跨境运费"
                      value={newCost.label}
                      onChange={e => setNewCost({...newCost, label: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">标准成本 (¥)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newCost.standardValue}
                      onChange={e => setNewCost({...newCost, standardValue: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">实际金额 (¥)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newCost.value}
                      onChange={e => setNewCost({...newCost, value: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">成本分类</label>
                    <select 
                      value={newCost.type}
                      onChange={e => setNewCost({...newCost, type: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="direct">直接成本 (Direct)</option>
                      <option value="indirect">间接成本 (Indirect)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">备注/说明</label>
                    <input 
                      type="text" 
                      placeholder="选填"
                      value={newCost.sub}
                      onChange={e => setNewCost({...newCost, sub: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowAddCost(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                  >
                    取消
                  </button>
                  <button 
                    onClick={addCustomCost}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                  >
                    确认添加
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Summary Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {costingSummary.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                        {stat.sub && <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <Database size={18} className="text-emerald-500" />
                      款式成本拆解 (FQ-2024-S01)
                    </h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">毛利率: {((159 - totalCost) / 159 * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">直接成本 (Direct Costs)</h3>
                      <div className="space-y-3">
                        {directCosts.map((item, i) => {
                          const diff = (item.actual || parseFloat(item.value.replace('¥', ''))) - (item.standard || 0);
                          return (
                            <div key={i} className={`flex justify-between items-start p-3 rounded-lg transition-all ${item.isCustom ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50'}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                  {item.isCustom && (
                                    <button 
                                      onClick={() => removeCustomCost(item.id)}
                                      className="text-rose-400 hover:text-rose-600 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                  {item.isLabor && (
                                    <button 
                                      onClick={() => setIsEditingLaborStandard(!isEditingLaborStandard)}
                                      className="text-indigo-400 hover:text-indigo-600 transition-colors"
                                      title="调整标准成本"
                                    >
                                      <Calculator size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">{item.sub}</p>
                                {item.standard !== undefined && (
                                  <div className="flex items-center gap-2 mt-1">
                                    {item.isLabor && isEditingLaborStandard ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-slate-400">标准: ¥</span>
                                        <input 
                                          type="number" 
                                          value={standardLaborCost}
                                          onChange={(e) => setStandardLaborCost(parseFloat(e.target.value) || 0)}
                                          className="w-12 px-1 py-0.5 bg-white border border-indigo-200 rounded text-[9px] focus:ring-1 focus:ring-indigo-500 outline-none"
                                          autoFocus
                                        />
                                        <button 
                                          onClick={() => setIsEditingLaborStandard(false)}
                                          className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800"
                                        >
                                          确定
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-[9px] text-slate-400">标准: ¥{item.standard.toFixed(2)}</span>
                                        <span className={`text-[9px] font-bold ${diff > 0 ? 'text-rose-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                          {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-slate-900">{item.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">间接与政策影响 (Indirect & Policy)</h3>
                      <div className="space-y-3">
                        {indirectCosts.map((item, i) => {
                          const diff = (item.actual || parseFloat(item.value.replace('¥', ''))) - (item.standard || 0);
                          return (
                            <div key={i} className={`flex justify-between items-start p-3 rounded-lg transition-all ${item.isCustom ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50'}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                  {item.isCustom && (
                                    <button 
                                      onClick={() => removeCustomCost(item.id)}
                                      className="text-rose-400 hover:text-rose-600 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">{item.sub}</p>
                                {item.standard !== undefined && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-slate-400">标准: ¥{item.standard.toFixed(2)}</span>
                                    <span className={`text-[9px] font-bold ${diff > 0 ? 'text-rose-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className={`font-bold ${item.highlight || 'text-slate-900'}`}>{item.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">最终核算成本 (含税/退税)</p>
                      <p className="text-3xl font-bold text-slate-900">¥{totalCost.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">建议零售价 (MSRP)</p>
                      <p className="text-3xl font-bold text-emerald-600">¥159.00</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 size={18} className="text-indigo-500" />
                      成本差异可视化 (Cost Variance Visualization)
                    </h3>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={varianceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickFormatter={(value) => `¥${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="standard" name="标准成本" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                        <Bar dataKey="actual" name="实际成本" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Scale className="text-indigo-500" size={20} />
                      <h3 className="font-bold text-slate-900">资产折旧模型 (Asset Depreciation)</h3>
                    </div>
                    <div className="space-y-4">
                      {INDUSTRY_DASHBOARD_DATA.costing.financialModel.depreciation.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">{item.asset}</span>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-widest">{item.method}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-[11px]">
                            <div><p className="text-slate-400">资产原值</p><p className="font-bold text-slate-900">{item.value}</p></div>
                            <div><p className="text-slate-400">月折旧额</p><p className="font-bold text-slate-900">{item.monthly}</p></div>
                            <div><p className="text-slate-400">累计折旧</p><p className="font-bold text-slate-900">{item.accumulated}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingDown className="text-rose-500" size={20} />
                      <h3 className="font-bold text-slate-900">成品损耗与次品分析 (Loss Analysis)</h3>
                    </div>
                    <div className="space-y-4">
                      {INDUSTRY_DASHBOARD_DATA.costing.financialModel.productLoss.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-slate-700">{item.category}</span>
                            <span className={`text-xs font-bold ${item.status === 'warning' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {item.rate} (基准: {item.benchmark})
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.status === 'warning' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${(parseFloat(item.rate) / parseFloat(item.benchmark)) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-slate-400">预估财务损失: <span className="font-bold text-slate-600">{item.value}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Activity size={18} className="text-rose-500" />
                      标准成本 vs. 实际成本 差异分析 (Variance Analysis)
                    </h3>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <ArrowDownRight size={12} /> 有利差异 (Favorable)
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        <ArrowUpRight size={12} /> 不利差异 (Unfavorable)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-3">成本项目</th>
                          <th className="pb-3 text-right">标准成本</th>
                          <th className="pb-3 text-right">实际成本</th>
                          <th className="pb-3 text-right">差异金额</th>
                          <th className="pb-3 pl-8">差异原因分析与说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {INDUSTRY_DASHBOARD_DATA.costing.variance.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-4 font-bold text-slate-700">{row.item}</td>
                            <td className="py-4 text-right font-mono text-slate-500">¥{row.standard.toFixed(2)}</td>
                            <td className="py-4 text-right font-mono font-bold text-slate-900">¥{row.actual.toFixed(2)}</td>
                            <td className={`py-4 text-right font-mono font-bold ${
                              row.status === 'unfavorable' ? 'text-rose-600' : 
                              row.status === 'favorable' ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {row.variance > 0 ? '+' : ''}{row.variance.toFixed(2)}
                            </td>
                            <td className="py-4 pl-8">
                              <div className="flex items-start gap-2">
                                {row.status === 'unfavorable' && <AlertCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />}
                                {row.status === 'favorable' && <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />}
                                <p className="text-xs text-slate-500 leading-relaxed">{row.reason}</p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Monitor size={18} className="text-indigo-500" />
                    人工工价明细 (Labor Rate Breakdown)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-3">工序环节</th>
                          <th className="pb-3">设备/方式</th>
                          <th className="pb-3 text-center">标准工时 (min)</th>
                          <th className="pb-3 text-center">工价 (¥/件)</th>
                          <th className="pb-3">备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { step: "横机 (Knitting)", tool: "电脑横机", time: 15, price: 8.5, note: "含前片、后片、袖子" },
                          { step: "套口 (Linking)", tool: "套口机", time: 12, price: 6.0, note: "领口、肩缝对位" },
                          { step: "裁剪 (Cutting)", tool: "自动裁床", time: 3, price: 2.0, note: "含排料损耗控制" },
                          { step: "缝纫 (Sewing)", tool: "平缝/包缝", time: 20, price: 10.5, note: "侧缝、下摆、袖口" },
                          { step: "水洗 (Washing)", tool: "工业洗机", time: 5, price: 3.0, note: "柔软处理/缩率控制" },
                          { step: "后道-照灯/检验", tool: "人工/灯箱", time: 4, price: 2.5, note: "疵点、漏针检查" },
                          { step: "后道-包装/钉标", tool: "手工", time: 3, price: 2.5, note: "吊牌、锁扣、装袋" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-bold text-slate-700">{row.step}</td>
                            <td className="py-3 text-slate-500">{row.tool}</td>
                            <td className="py-3 text-center font-mono">{row.time}</td>
                            <td className="py-3 text-center font-bold text-indigo-600">¥{row.price.toFixed(2)}</td>
                            <td className="py-3 text-xs text-slate-400">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Expert Advice Column */}
              <div className="space-y-6">
                <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Briefcase size={18} />
                    行业专家经营建议
                  </h3>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase mb-2">1. 成本核算时机</p>
                      <p className="text-sm leading-relaxed">
                        <span className="font-bold text-white">打样环节 (Sampling)</span> 是成本核算的黄金期。此时应进行“预估成本”，决定该款式是否具备量产价值。
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase mb-2">2. 人工核算节点</p>
                      <p className="text-sm leading-relaxed">
                        人工核算应在 <span className="font-bold text-white">产前样 (PPS)</span> 阶段通过 GSD/SMV 测试确定标准工时，在大货生产中进行实时偏差监控。
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase mb-2">3. 历史基准值 (Benchmark)</p>
                      <p className="text-sm leading-relaxed">
                        必须建立 <span className="font-bold text-white">历史款式基准库</span>。通过对比相似款式的面料利用率和工时，快速发现异常损耗。
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase mb-2">4. 调价审批流程</p>
                      <p className="text-sm leading-relaxed">
                        当实际成本偏差超过 <span className="font-bold text-white">±3%</span> 时，系统应自动触发调价审批流，由经营层确认利润空间。
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">经营预警模型</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-rose-500" />
                        <span className="text-sm font-bold text-rose-700">面料损耗超标</span>
                      </div>
                      <span className="text-xs font-bold text-rose-600">+2.4%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-sm font-bold text-amber-700">套口环节效率偏低</span>
                      </div>
                      <span className="text-xs font-bold text-amber-600">-15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "warehouse":
        const MATERIAL_DISCREPANCIES = [
          { factory: "分工厂 A", item: "洗标", expected: 5000, actual: 4500, diff: -500, status: "待核实", date: "2024-03-28" },
          { factory: "分工厂 B", item: "主标", expected: 3000, actual: 3000, diff: 0, status: "正常", date: "2024-03-28" },
          { factory: "分工厂 C", item: "吊牌", expected: 2000, actual: 1980, diff: -20, status: "已补发", date: "2024-03-27" },
        ];

        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">智能仓储与物料核对</h1>
                <p className="text-sm text-slate-500">解决“外协厂洗标数量不对”痛点，实现物料收发闭环</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">库存盘点</button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  物料入库
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Cpu className="text-indigo-500" size={20} />
                      <h3 className="font-bold text-slate-900">外协厂物料核对 (Outsourced Material Reconciliation)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">发现差异</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-4 py-3">外协工厂</th>
                          <th className="px-4 py-3">物料名称</th>
                          <th className="px-4 py-3 text-right">应发数量</th>
                          <th className="px-4 py-3 text-right">实收数量</th>
                          <th className="px-4 py-3 text-right">差异</th>
                          <th className="px-4 py-3">状态</th>
                          <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MATERIAL_DISCREPANCIES.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-900">{item.factory}</td>
                            <td className="px-4 py-3 text-slate-600">{item.item}</td>
                            <td className="px-4 py-3 text-right font-mono">{item.expected}</td>
                            <td className="px-4 py-3 text-right font-mono">{item.actual}</td>
                            <td className={`px-4 py-3 text-right font-bold font-mono ${item.diff < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {item.diff > 0 ? `+${item.diff}` : item.diff}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === '正常' ? 'bg-emerald-50 text-emerald-600' : 
                                item.status === '待核实' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                              }`}>{item.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.diff !== 0 && (
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">核对清单</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Package className="text-indigo-500" size={20} />
                      <h3 className="font-bold text-slate-900">核心面料库存 (Core Fabric Inventory)</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-4 py-3">面料编号</th>
                          <th className="px-4 py-3">名称/规格</th>
                          <th className="px-4 py-3">颜色</th>
                          <th className="px-4 py-3">库存数量</th>
                          <th className="px-4 py-3">关联订单</th>
                          <th className="px-4 py-3">库位</th>
                          <th className="px-4 py-3">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {INDUSTRY_DASHBOARD_DATA.warehouse.fabricInventory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-slate-600">{item.color}</td>
                            <td className="px-4 py-3 font-bold text-indigo-600">{item.stock}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.linkedOrder}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-50">{item.location}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl text-white">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    仓储安全与合规
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">温湿度监控</span>
                      <span className="text-sm font-bold text-emerald-400">正常 (24°C / 55%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">消防系统</span>
                      <span className="text-sm font-bold text-emerald-400">在线</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">异常告警</span>
                      <span className="text-sm font-bold text-rose-400">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "material-picking":
        return <MaterialPickingView />;
      case "supply-chain-loop":
        return <SupplyChainClosedLoopView />;
      case "material-inbound":
        return <MaterialInboundView />;
      case "logistics":
        const LOGISTICS_DATA = [
          { id: "LOG-20240328-01", destination: "上海港 (出口)", status: "报关中", eta: "14:30", driver: "张师傅", linkedOrder: "ORD-2024-001", type: "大货出运", customs: "申报中", warehouse: "海关监管仓 A区", booking: "已订舱", checklist: "已确认" },
          { id: "LOG-20240328-02", destination: "广东分销中心", status: "运输中", eta: "16:00", driver: "李师傅", linkedOrder: "ORD-2024-005", type: "内销配送", customs: "无需报关", warehouse: "自有成品仓", booking: "无需订舱", checklist: "已确认" },
          { id: "LOG-20240328-03", destination: "海关监管仓", status: "已放行", eta: "10:00", driver: "王师傅", linkedOrder: "ORD-2024-002", type: "保税物流", customs: "已放行", warehouse: "保税仓 B区", booking: "已订舱", checklist: "已确认" },
          { id: "LOG-20240328-04", destination: "外协加工厂", status: "运输中", eta: "11:30", driver: "赵师傅", linkedOrder: "ORD-2024-006", type: "半成品运输", customs: "无需报关", warehouse: "外协待收", booking: "无需订舱", checklist: "待确认" },
        ];

        const VEHICLE_STATS = [
          { label: "自有车辆使用率", value: "92%", trend: "up", detail: "高负荷运行" },
          { label: "空驶率", value: "8.5%", trend: "down", detail: "路线已优化" },
          { label: "临时用车占比", value: "15%", trend: "up", detail: "业务员临时需求增加" },
        ];

        const AD_HOC_REQUESTS = [
          { id: "REQ-001", requester: "业务员 A", time: "10:15", reason: "紧急打样送样", status: "待审批", priority: "高" },
          { id: "REQ-002", requester: "业务员 B", time: "11:00", reason: "客户紧急补货", status: "已安排", priority: "紧急" },
        ];

        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">物流调度与车辆管理</h1>
                <p className="text-sm text-slate-500">解决“司机半路折返”与“临时用车”痛点，实现精细化调度</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <ClipboardCheck size={16} />
                  出车清单模板
                </button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  发起临时用车申请
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {VEHICLE_STATS.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      stat.trend === 'up' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>{stat.detail}</span>
                  </div>
                </div>
              ))}
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center text-white">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">异常提醒</p>
                  <p className="text-[10px] text-rose-700 font-medium">2个任务未进行出车确认</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Truck size={20} className="text-rose-500" />
                    实时物流追踪 (含出车前电子清单确认)
                  </h3>
                  <div className="space-y-4">
                    {LOGISTICS_DATA.map((track, idx) => (
                      <div key={idx} className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                            <Globe size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{track.destination}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{track.type} | 任务编号: {track.id}</p>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  track.checklist === '已确认' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'
                                }`}>清单: {track.checklist}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  track.status === '已放行' ? 'bg-emerald-100 text-emerald-700' : 
                                  track.status === '报关中' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>{track.status}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">承运/报关</p>
                                <p className="text-xs font-bold text-slate-700">{track.driver}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">预计/实际 ETA</p>
                                <p className="text-xs font-bold text-slate-700">{track.eta}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">关联订单</p>
                                <p className="text-xs font-mono font-bold text-indigo-600">{track.linkedOrder}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase">海关状态:</span>
                              <span className="text-[10px] font-bold text-slate-700">{track.customs}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Warehouse size={14} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase">当前位置:</span>
                              <span className="text-[10px] font-bold text-slate-700">{track.warehouse}</span>
                            </div>
                          </div>
                          {track.checklist === '待确认' && (
                            <button className="px-3 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 transition-colors">
                              确认出车清单 (防漏拿)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-500" />
                    临时用车申请 (业务员)
                  </h3>
                  <div className="space-y-4">
                    {AD_HOC_REQUESTS.map((req, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-slate-900">{req.requester}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            req.priority === '紧急' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>{req.priority}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{req.reason}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-slate-400 font-medium">申请时间: {req.time}</p>
                          <span className={`text-[10px] font-bold ${
                            req.status === '已安排' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>{req.status}</span>
                        </div>
                        {req.status === '待审批' && (
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50">拒绝</button>
                            <button className="flex-1 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700">批准</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="text-blue-500" size={20} />
                      <h3 className="font-bold text-slate-900">订船期与舱位 (Booking)</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { ship: "COSCO SHIPPING", date: "2024-04-05", status: "已订舱", route: "上海 -> 纽约", container: "40' HQ x 2" },
                      { ship: "MAERSK LINE", date: "2024-04-12", status: "待确认", route: "宁波 -> 汉堡", container: "20' GP x 1" },
                      { ship: "EVERGREEN", date: "2024-04-18", status: "询价中", route: "上海 -> 鹿特丹", container: "40' HQ x 5" },
                    ].map((ship, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-800">{ship.ship}</span>
                          <span className={`text-[10px] font-bold ${ship.status === '已订舱' ? 'text-emerald-600' : ship.status === '待确认' ? 'text-amber-600' : 'text-slate-500'}`}>{ship.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{ship.route}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[10px] font-bold text-indigo-600">开船日: {ship.date}</p>
                          <p className="text-[10px] font-bold text-slate-700">箱型: {ship.container}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    异常预警
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <p className="text-xs font-bold text-rose-900">报关延迟</p>
                      <p className="text-[10px] text-rose-700 mt-1">ORD-2024-001 报关单据缺失，请及时补齐。</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs font-bold text-amber-900">船期变动</p>
                      <p className="text-[10px] text-amber-700 mt-1">MAERSK LINE 预计推迟 2 天开船。</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-400" />
                    调度优化建议
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold">1</span>
                      </div>
                      <p className="text-xs text-indigo-100 leading-relaxed">
                        <span className="font-bold text-white">合并同向运输：</span>
                        外协厂 A 与 B 距离仅 5km，建议合并上午 10:00 的两个任务，可降低 12% 空驶率。
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold">2</span>
                      </div>
                      <p className="text-xs text-indigo-100 leading-relaxed">
                        <span className="font-bold text-white">强制清单确认：</span>
                        上周发生 3 起司机半路折返事件，均因未核对“洗标”数量。已开启“出车前电子清单”强制确认。
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case "operational-cases":
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">实战案例复盘 (Operational Case Studies)</h1>
                <p className="text-sm text-slate-500">针对针织服装行业 4 大核心痛点的数字化解决方案</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  id: "case-1",
                  title: "1. 物流调度：解决‘折返’与‘临时用车’",
                  painPoint: "司机走到半路发现少带单证被迫折返；业务员随时‘截胡’车辆导致计划被打乱。",
                  solution: "出车前电子清单强制核对（未扫码无法开始运输）；用车申请提前 24h 预约制，紧急用车总经办审批。",
                  impact: "物流成本下降 15%，调度准确率提升 40%。",
                  icon: <Truck className="text-rose-500" />,
                  bg: "bg-rose-50",
                  border: "border-rose-100"
                },
                {
                  id: "case-2",
                  title: "2. 物料管控：解决‘洗标数量不符’",
                  painPoint: "洗标、吊牌等小件辅料在分工厂点数误差大，导致最后几百件衣服没标可钉。",
                  solution: "出库改为‘高精度称重核对’ + ‘封条管理’。分工厂收货拍照上传，差异超 0.5% 自动触发异常调查。",
                  impact: "辅料损耗率从 3% 降至 0.2%，杜绝停工待料。",
                  icon: <Database className="text-amber-500" />,
                  bg: "bg-amber-50",
                  border: "border-amber-100"
                },
                {
                  id: "case-3",
                  title: "3. 生产协同：解决‘物料就绪不提前’",
                  painPoint: "面料已入库 3 天，车间却因‘不知道’而未领料，白白浪费生产窗口。",
                  solution: "‘物料就绪’自动推送至车间主任手机。系统根据交期自动计算‘最晚领料日’并进行红色预警。",
                  impact: "生产准备周期缩短 72 小时，产能利用率提升 12%。",
                  icon: <Zap className="text-indigo-500" />,
                  bg: "bg-indigo-50",
                  border: "border-indigo-100"
                },
                {
                  id: "case-4",
                  title: "4. 质量闭环：解决‘大量返修/线头/疵点’",
                  painPoint: "外协厂套口、缝制环节质控不严，成衣发现大量线头、跳针，返修成本高。",
                  solution: "下派驻厂 QC 移动端实时传图。系统自动分析疵点分布，返修率超标自动触发‘加工费扣减’预警。",
                  impact: "一次合格率从 88% 提升至 96.5%，返修成本下降 60%。",
                  icon: <ShieldCheck className="text-emerald-500" />,
                  bg: "bg-emerald-50",
                  border: "border-emerald-100"
                }
              ].map((c) => (
                <div key={c.id} className={`p-8 rounded-3xl border ${c.border} ${c.bg} shadow-sm space-y-6`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      {c.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">核心痛点 (Pain Point)</p>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{c.painPoint}</p>
                    </div>
                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">数字化对策 (Solution)</p>
                      <p className="text-sm text-slate-700 leading-relaxed italic">“{c.solution}”</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">实测成效 (Impact)</p>
                      <p className="text-sm font-bold text-slate-800">{c.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "erp-guide":
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">ERP 实施指南 <span className="text-indigo-600">Implementation Guide</span></h1>
                <p className="text-sm text-slate-500">面向 ERP 工程师的业务字段定义与实施指标</p>
              </div>
              <button 
                onClick={exportERPGuideToHTML}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                导出实施文档
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {INDUSTRY_DASHBOARD_DATA.erpMetrics.modules.map((module, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800">{module.name}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                          <th className="px-6 py-4">字段名称 (Field)</th>
                          <th className="px-6 py-4">数据类型 (Type)</th>
                          <th className="px-6 py-4">数据来源 (Source)</th>
                          <th className="px-6 py-4">业务描述 (Description)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {module.fields.map((field, fIdx) => (
                          <tr key={fIdx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-indigo-600">{field.field}</td>
                            <td className="px-6 py-4 text-slate-600">{field.type}</td>
                            <td className="px-6 py-4 text-slate-500">{field.source}</td>
                            <td className="px-6 py-4 text-slate-800">{field.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">实施可行性检查 (Feasibility Check)</h3>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    当前系统已定义 15 个核心业务字段，其中 80% 可通过现有 CRM/WMS 系统自动同步。建议在实施初期重点解决“物料损耗率”的实时采集问题。
                  </p>
                  <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                    运行完整可行性报告
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "order-lifecycle":
        return <OrderLifecycleSimulationView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <LayoutDashboard size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">视图正在开发中...</p>
            <button 
              onClick={() => setCurrentView("home")}
              className="mt-4 text-indigo-600 hover:underline text-sm font-bold"
            >
              返回老板座舱
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Notifications Toast */}
      <div className="fixed top-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none max-h-[80vh] overflow-visible">
        <AnimatePresence mode="popLayout">
          {notifications.map(n => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-2xl border pointer-events-auto flex items-start gap-3 w-[320px] ${
                n.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
                n.type === 'warning' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {n.type === 'success' ? <CheckCircle2 size={18} /> : n.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight break-words">{n.message}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.filter(item => item.id !== n.id));
                  }}
                  className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    n.type === 'success' || n.type === 'warning' 
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  我知道了
                </button>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifications(prev => prev.filter(item => item.id !== n.id));
                }}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={NAV_ITEMS.find(n => n.id === currentView)?.label || NAV_ITEMS.find(n => n.children?.some(c => c.id === currentView))?.children?.find(c => c.id === currentView)?.label || "管理系统"} />
        
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />

      {/* Production Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && activeCompletion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompletionModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <ClipboardCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">确认环节完成</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {PRODUCTION_STEPS[activeCompletion.currentStep]} · {activeCompletion.orderId}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCompletionModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">A品数量 (合格)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={completionForm.actualQty}
                          onChange={(e) => setCompletionForm({ ...completionForm, actualQty: parseInt(e.target.value) || 0 })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">B品数量 (次品)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={completionForm.bQty}
                          onChange={(e) => setCompletionForm({ ...completionForm, bQty: parseInt(e.target.value) || 0 })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic ml-1">计划总数: {activeCompletion.qty} · 当前合计: {completionForm.actualQty + completionForm.bQty}</p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">执行人 / 计件人员</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="输入姓名或工号"
                        value={completionForm.worker}
                        onChange={(e) => setCompletionForm({ ...completionForm, worker: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">备注 (异常说明)</label>
                    <textarea 
                      placeholder="选填：记录损耗原因或质量备注"
                      value={completionForm.notes}
                      onChange={(e) => setCompletionForm({ ...completionForm, notes: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCompletionModal(false)}
                    className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleConfirmCompletion}
                    className="flex-1 py-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
                  >
                    确认提交
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
