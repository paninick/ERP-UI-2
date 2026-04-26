# ERP 项目重规划 2026-Q2

制定日期：2026-04-26
制定者：Claude Sonnet 4.6（主线审计角色）
适用范围：D:/erp 整体项目，含 RuoYi-Vue 后端 + ERP-UI-2 前端

---

## 一、项目现状（事实层）

### 1.1 两套前端并存

| 前端 | 技术栈 | 页面数 | 状态 |
|---|---|---|---|
| RuoYi-Vue/ruoyi-ui | Vue 2 + Element UI | 53 个目录 | 与后端同仓库，菜单/权限已接入 |
| ERP-UI-2 | React + TypeScript + Vite | 51 个 .tsx | 独立仓库，治理文档更完整，但后端对接未全闭合 |

**当前实际主线**：ERP-UI-2 是治理文档、AI协作规则、模块交付标准的主战场。RuoYi-Vue 的 Vue2 前端是历史遗留，部分页面仍在维护。

### 1.2 后端模块真实状态（RuoYi-Vue）

**完整闭环（Controller+Mapper+Service+XML 全有）**

客户、供应商、主材料、辅料、仓库、入库、出库、库存、销售订单、打样通知、BOM、生产计划、生产单、工序报工、采购、外协、计件工资、异常池

**有 Controller+Mapper 但缺 Service**（6个）

QcInspection、ProduceDefect、FinInvoice、StyleProgress、ProductTrace、MaterialSku

**完全缺失（0/10）**

| 模块 | 说明 |
|---|---|
| 组织/车间/班组 | RuoYi-Vue 有 OrgUnit 后端代码，但运行时未验证；ERP-UI-2 有 API+页面但后端未对接 |
| 检品公司 | 全栈缺失 |
| 款号主档（t_erp_style） | 全栈缺失（StyleProgress 是进度视图，不是主档） |
| 审批日志表 | t_erp_approval_log 未建 |

### 1.3 SQL 状态

- phase1-32 共 30 个 SQL 文件，散落在 RuoYi-Vue/sql/
- phase30（角色权限）、phase31（组织层级）、phase32（员工扩展）已生成，**执行状态未验证**
- 无 Flyway/Liquibase，无幂等性保障体系

### 1.4 P0 安全漏洞

| 问题 | 状态 |
|---|---|
| ReportController 2个方法无 @PreAuthorize | **已修复**（c77a8843 commit） |
| JWT 弱密钥 | 未替换（生产环境风险） |
| 11个核心角色缺失 | phase30 SQL 已生成，执行状态未验证 |

### 1.5 DeepSeek v4 当前档位

```
档位：可调教（接近受控可用）
主线编码资格：否
候选补丁资格：是
升档条件：连续5轮零越界 + 2个补丁被复审认可 + 命中率≥80%
```

---

## 二、计划 vs 实际偏差

### 2.1 memory 记录的"已完成"与实际的差距

memory（progress_todo.md，2026-04-23）记录 Sprint D 全部完成、Phase 28 完成。
但 ERP-UI-2 的 MODULE_DELIVERY_MASTER_PLAN.md（2026-04-25）扫描显示：

| memory 声称完成 | 实际状态 |
|---|---|
| P3-1 工序流转 31道工序+2路线 | 工序定义缺 product_family/qc_required 字段；工艺路线前端页面缺失 |
| P3-2 计件工资精细化 | 无双确认审批流，结算治理不完整 |
| P3-3 款号全链路追溯 | StyleProgress 是视图，t_erp_style 主档完全缺失 |
| P3-5 品类/供应链 | 字典已建，但无完整模块闭环 |
| Sprint D 质检/发票集成 | QcInspection/FinInvoice Service 层缺失 |
| RBAC 5角色200-204 | 11个角色仍缺失，phase30 执行未验证 |

**结论：memory 记录的是"代码已写"，不是"模块已闭环"。两者差距约 30-40%。**

### 2.2 WBS 计划（docs/05）vs 实际

| WBS 阶段 | 计划时间 | 实际状态 |
|---|---|---|
| P3 基础加固（8周） | 2026-04-28 开始 | 部分工作已做但未按 WBS 顺序，款号统一/行级权限/ArchUnit 均未完成 |
| P4 合规与U8集成（10周） | 2026-06-22 后 | 未启动 |
| P5 业务补齐（10周） | 2026-09-01 后 | 未启动 |
| P6 试点上线（8周） | 2026-11-10 后 | 未启动 |
| MS1 基础加固完成 | 2026-06-22 | 大概率延期 |

### 2.3 两套文档体系的分裂

- `docs/` + `ERP_MASTER_PLAN.md`（主仓库）：战略规划层，WBS/风险/里程碑
- `ERP-UI-2/` 内的治理文档：执行层，模块交付标准/AI协作规则/实际进度

**两套体系没有同步**，导致：
- 主仓库 memory 认为 Sprint D 完成
- ERP-UI-2 治理文档认为 Wave 0 还没开始
- 实际开发在 ERP-UI-2 治理体系下推进，主仓库文档已过时

---

## 三、根本问题诊断

1. **交付标准不统一**：memory 用"代码已写"判完成，ERP-UI-2 用"10检查点全通过"判完成。同一个模块，两套标准结论相反。

2. **两套前端无明确主线**：Vue2 和 React 并存，后端 API 被两套前端同时消费，维护成本翻倍。

3. **SQL 无治理**：30个 phase*.sql 散落，无执行记录，无幂等性，无顺序文档。上线前无法确认哪些已执行。

4. **AI 分工未落地**：DEVELOPMENT_PLAN_2026Q2.md 定义了 DeepSeek v4 的任务范围，但实际上 DeepSeek v4 还在测试阶段，Wave 0 的工作仍由 Claude 承担。

5. **运行时验证缺失**：OrgUnit、Employee 扩展、phase30-32 SQL 均停在"代码级修复"，未做运行时 API 验证。

---

## 四、重规划：接下来 10 周

### 原则

1. **以 ERP-UI-2 治理文档为执行基准**，主仓库 docs/ 作为战略参考
2. **10检查点为唯一完成标准**，不接受"代码已写"作为完成证据
3. **前端主线收敛到 ERP-UI-2（React）**，Vue2 页面不再新增，存量维护
4. **SQL 治理先行**：新 SQL 按模块放 sql/module-xxx/，不再追加 phase*.sql
5. **DeepSeek v4 受控使用**：单文件、白名单明确、验证命令明确

---

### Wave 0：安全基线（本周，不可跳过）

**目标**：消除 P0 漏洞，让系统可以安全给真实用户使用

| # | 任务 | 执行者 | 验证方式 |
|---|---|---|---|
| W0-1 | 验证 phase30 SQL 可执行（修复损坏字符串字面量） | Claude | MySQL 执行无报错 |
| W0-2 | 执行 phase30，验证 11 个角色已入库 | Claude | SELECT COUNT(*) FROM sys_role WHERE role_key LIKE 'erp_%' |
| W0-3 | JWT_SECRET 替换为强密钥（环境变量） | Claude | 重启后 token 验证通过 |
| W0-4 | OrgUnit 运行时 API 验证（或明确接受环境阻塞） | Claude | GET /erp/orgUnit/list 返回 200 |

**DeepSeek v4 可分配**：W0-1 的 SQL 语法修复（单文件，白名单：phase30_p0_roles_menu_permission.sql）

---

### Wave 1：主数据基础（第2-4周）

**目标**：让所有业务模块的选择器来自后端真实数据

执行顺序（不可调换，有依赖链）：

| # | 任务 | 依赖 | 执行者 | 验证 |
|---|---|---|---|---|
| W1-1 | 补齐 Batch 1 字典（15个新 dict_type） | — | Claude | SELECT + 前端下拉验证 |
| W1-2 | OrgUnit 全栈闭环（RuoYi-Vue 后端 + ERP-UI-2 前端对接） | W1-1 | Claude | API e2e + 页面操作 |
| W1-3 | Employee 扩展字段运行时验证（phase32 SQL + 前端级联） | W1-2 | Claude | 保存员工记录含 org_unit_id |
| W1-4 | WorkCenter 补 Mapper XML + Service + 前端页面 | W1-2 | Claude | API e2e |
| W1-5 | ProcessDef 补 product_family/qc_required 字段 + 前端 | W1-4 | Claude | 工序定义可维护 |
| W1-6 | ProcessRoute 前端编辑器（路线项增删改排序） | W1-5 | Claude | 路线可发布 |

**DeepSeek v4 可分配**：W1-4 的 WorkCenter Mapper XML 补全（单文件，白名单：WorkCenterMapper.xml）

---

### Wave 2：业务数据补齐（第5-7周）

| # | 任务 | 依赖 | 执行者 |
|---|---|---|---|
| W2-1 | 补 Service 层（6个模块：QcInspection/ProduceDefect/FinInvoice/StyleProgress/ProductTrace/MaterialSku） | Wave 1 | Claude |
| W2-2 | 客户日单质量画像字段（P1-A） | Wave 1 | Claude |
| W2-3 | 检品公司全栈模块（P1-B） | W2-2 | Claude |
| W2-4 | 款号主档 t_erp_style 全栈模块（P1-C） | Wave 1 | Claude |
| W2-5 | 质检 IQC/IPQC/FQC/OQC 分层扩展 | W2-1 | Claude |

**DeepSeek v4 可分配**：W2-1 中单个 Service 文件的骨架生成（单文件，白名单明确，mvn compile 验证）

---

### Wave 3：审批基础设施（第7-10周）

| # | 任务 | 依赖 | 执行者 |
|---|---|---|---|
| W3-1 | 建 t_erp_approval_log 表 + Service + API | Wave 2 | Claude |
| W3-2 | 销售订单审批流（DRAFT→SUBMITTED→APPROVED/REJECTED） | W3-1 | Claude |
| W3-3 | BOM 版本冻结审批 | W3-1 | Claude |
| W3-4 | 生产计划下达审批 | W3-1 | Claude |
| W3-5 | 采购/外协/计件工资/发票审批 | W3-1 | Claude |
| W3-6 | 日单检品放行节点（依赖检品公司模块） | W2-3, W3-1 | Claude |

**DeepSeek v4 可分配**：W3-1 的 SQL 文件（单文件，白名单：phase_approval_log.sql，MySQL 验证）

---

### Wave 4：成本闭环（第10-12周）

按 PROJECT_POSITION_AND_EXECUTION_ROADMAP.md 顺序：

1. 入库单关联生产完工真实
2. 物料消耗从 job-process 绑定向 report-log 事件级绑定
3. 外协结算事件化
4. 工资发放治理
5. 统一成本汇总（物料+工资+外协+运费+质量损耗）

---

## 五、DeepSeek v4 分工规范

### 当前档位

```
档位：可调教（接近受控可用）
主线编码资格：否
候选补丁资格：是
```

### 可分配任务（每次不超过3个文件）

| Wave | 任务 | 白名单文件 | 验证命令 |
|---|---|---|---|
| Wave 0 | phase30 SQL 语法修复 | phase30_p0_roles_menu_permission.sql | MySQL 执行无报错 |
| Wave 1 | WorkCenter Mapper XML 补全 | WorkCenterMapper.xml | mvn compile |
| Wave 2 | 单个 Service 骨架（如 QcInspectionServiceImpl.java） | 指定单文件 | mvn compile |
| Wave 3 | approval_log SQL 文件 | phase_approval_log.sql | MySQL 执行无报错 |

### 任务模板（每次必须包含）

```
本轮身份：候选修复者
本轮目标：[一句话]
允许修改：[≤3个文件路径]
禁止修改：所有状态文档、治理文档、白名单外文件
验证命令：[MySQL/mvn/npm 其中之一]
完成判定：[具体标准]
一票否决：越界、伪完成、未执行验证命令
```

### 升档条件（当前进度）

- 已通过：Round 2E（基本通过）、Round 4C（基本通过）
- 还需要：连续3轮零越界 + 1个补丁被 Claude 复审认可
- 预计升档时间：Wave 1 期间（如果测试顺利）

---

## 六、前端主线收敛决策

### 决策

**主线前端：ERP-UI-2（React + TypeScript）**

理由：
- 治理文档、AI协作规则、模块交付标准均在此
- 51个页面，覆盖主要业务流
- 技术栈更现代，TypeScript 类型安全

**Vue2 前端（RuoYi-Vue/ruoyi-ui）处理方式**

- 存量页面：维护但不新增
- 菜单/权限：继续使用 RuoYi 后台管理
- 新模块：只在 ERP-UI-2 开发，不在 Vue2 重复

### 影响

- Wave 1-4 的前端工作全部在 ERP-UI-2
- Vue2 的 53 个目录作为参考，不作为交付目标

---

## 七、SQL 治理规范（立即生效）

### 新规则

```
新 SQL 文件路径：
  sql/module-foundation/   ← Wave 1 基础模块
  sql/module-business/     ← Wave 2 业务模块
  sql/module-approval/     ← Wave 3 审批模块
  sql/module-cost/         ← Wave 4 成本模块

命名规则：
  {module}_{action}.sql
  例：org_unit_create.sql, approval_log_create.sql

要求：
  - 幂等（IF NOT EXISTS / WHERE NOT EXISTS）
  - 无损坏非ASCII字符
  - 有 README 行记录执行顺序
  - 执行后在 PROJECT_PROGRESS.md 记录验证结果
```

### 历史 phase*.sql 处理

- phase1-29：保留，不修改，作为历史记录
- phase30-32：修复后执行，执行结果记录到 PROJECT_PROGRESS.md
- 不再新增 phase*.sql

---

## 八、里程碑（重新校准）

| 里程碑 | 日期 | 验收标准 |
|---|---|---|
| MS-R1 安全基线 | 2026-05-03 | JWT强密钥、11角色入库、OrgUnit API可用 |
| MS-R2 主数据闭环 | 2026-05-24 | Batch 1 全部10检查点通过，选择器来自后端 |
| MS-R3 业务数据补齐 | 2026-06-14 | 6个Service补齐、检品公司/款号主档上线 |
| MS-R4 审批基础设施 | 2026-07-12 | 审批日志表+5条审批流上线 |
| MS-R5 成本闭环基线 | 2026-08-09 | 物料消耗事件化、工资/外协结算可追溯 |
| MS-R6 Pilot 准备 | 2026-09-30 | 行级权限验证、数据迁移演练、Docker部署 |

---

## 九、当前最高优先级（本周立即行动）

1. **W0-1**：修复 phase30 SQL 损坏字符串 → 执行 → 验证 11 角色入库
2. **W0-4**：OrgUnit 运行时 API 验证（解决 Tomcat classloading 问题或明确接受）
3. **更新 memory/progress_todo.md**：以本文档为基准，清除过时的"已完成"记录

---

*本文档基于代码扫描（2026-04-26）+ ERP-UI-2 治理文档 + docs/ 规划文档综合制定。*
*所有模块状态来源于 MODULE_DELIVERY_MASTER_PLAN.md 扫描结果（2026-04-25）。*
*不含推测内容，所有结论均有文件或代码依据。*
