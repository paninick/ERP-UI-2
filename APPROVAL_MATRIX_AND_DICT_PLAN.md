# 针织服装 ERP / MES 审批节点清单、字典规划与角色矩阵

最后更新：2026-04-24

## 1. 目的

本文件用于把审批蓝图进一步收口成可执行的系统设计，包括：

- 审批节点清单
- 状态字典规划
- 角色审批矩阵
- 与当前系统字典接入方式的衔接建议

适用前提：

- 当前项目已恢复字典管理
- 前端统一通过 `useDictOptions(dictType)` 读取字典
- 后端可通过 `/system/dict/data/list` 提供字典数据

相关代码：

- 字典 API：[src/api/dict.ts](D:\erp\ERP-UI-2\src\api\dict.ts:1)
- 字典 Hook：[src/hooks/useDictOptions.ts](D:\erp\ERP-UI-2\src\hooks\useDictOptions.ts:1)

## 2. 当前已使用的关键状态字典

从现有项目代码看，以下字典已被业务页面使用：

- `sales_order_status`
- `erp_plan_status`
- `erp_process_status`
- `erp_purchase_status`
- `erp_confirm_status`
- `erp_sample_audit_status`
- `erp_sample_task_status`
- `erp_defect_category`
- `erp_defect_level`
- `erp_handle_type`
- `erp_responsibility`

这说明系统已经具备“字典驱动状态流”的基础，不建议改成写死枚举。

## 3. 审批节点总清单

建议将审批节点按业务主线拆成 8 组。

### 3.1 销售域审批节点

- 销售草稿
- 销售提交
- 销售主管审核
- 驳回修改
- 订单生效
- 订单关闭

### 3.2 技术域审批节点

- 打样任务建立
- 样衣确认
- BOM 提交
- 工艺提交
- 技术主管审核
- 版本冻结
- 技术变更审批

### 3.3 计划域审批节点

- 计划草稿
- PMC 提交
- 计划审核
- 工厂分配确认
- 计划下达
- 计划变更审批

### 3.4 采购与外协域审批节点

- 采购申请
- 采购审核
- 采购确认下单
- 外协申请
- 外协审核
- 外发确认
- 收回确认
- 外协结算确认

### 3.5 生产执行域审批节点

- 生产单下达
- 工序初始化确认
- 报工提交
- 班组校验
- 待检
- 返工确认
- 工序完结

### 3.6 品质域审批节点

- IQC 判定
- IPQC 判定
- FQC 判定
- OQC 判定
- PASS 放行
- FAIL 驳回
- 复检放行

### 3.7 日单检品域审批节点

- 检品预约申请
- 检品公司确认
- 检品结果回传
- 出货放行
- 返工复检

### 3.8 财务与结算域审批节点

- 计件确认
- 工资锁定
- 对账确认
- 开票审核
- 回款确认
- 结案确认

## 4. 建议状态字典规划

建议分为两层：

- 第一层：业务单据状态
- 第二层：审批动作状态

这样做的原因是：

- 单据状态负责业务生命周期
- 审批状态负责审批过程
- 避免一个字段既表达业务进度又表达审批结果

## 5. 建议保留并优化的现有字典

### 5.1 `sales_order_status`

建议用途：

- 销售订单业务状态

建议值：

- `DRAFT` 草稿
- `SUBMITTED` 已提交
- `APPROVED` 已审核
- `REJECTED` 已驳回
- `RUNNING` 执行中
- `CLOSED` 已关闭

### 5.2 `erp_plan_status`

建议用途：

- 计划业务状态

建议值：

- `DRAFT` 草稿
- `SUBMITTED` 已提交
- `APPROVED` 已审核
- `SCHEDULED` 已排产
- `RUNNING` 生产中
- `COMPLETED` 已完成
- `CANCELLED` 已取消

### 5.3 `erp_process_status`

建议用途：

- 工序执行状态

建议值：

- `PENDING` 待开工
- `RUNNING` 进行中
- `WAIT_CHECK` 待检
- `PASS` 已放行
- `FAIL` 已驳回
- `REWORK` 返工中
- `COMPLETED` 已完结
- `OUTSOURCE` 外协中

### 5.4 `erp_purchase_status`

建议用途：

- 采购业务状态

建议值：

- `DRAFT` 草稿
- `SUBMITTED` 已提交
- `APPROVED` 已审核
- `CONFIRMED` 已下单
- `PARTIAL_RECEIVED` 部分到货
- `COMPLETED` 已完成
- `CANCELLED` 已取消

### 5.5 `erp_confirm_status`

建议用途：

- 轻量确认类流程

建议值：

- `PENDING` 待确认
- `CONFIRMED` 已确认
- `LOCKED` 已锁定

不建议继续把 `erp_confirm_status` 用在所有审批场景，只适合简单确认流程。

### 5.6 `erp_sample_audit_status`

建议用途：

- 打样 / BOM / 技术审核结果

建议值：

- `DRAFT` 草稿
- `SUBMITTED` 已提交
- `APPROVED` 已审核
- `REJECTED` 已驳回
- `FROZEN` 已冻结

### 5.7 `erp_sample_task_status`

建议用途：

- 打样 / 技术任务进度状态

建议值：

- `PENDING` 待开始
- `RUNNING` 进行中
- `WAIT_CONFIRM` 待确认
- `COMPLETED` 已完成
- `CANCELLED` 已取消

## 6. 建议新增字典类型

以下字典建议新增，而不是继续混用老字典。

### 6.1 审批结果类

- `erp_approval_result`

建议值：

- `SUBMITTED`
- `APPROVED`
- `REJECTED`
- `RECALLED`
- `CLOSED`

### 6.2 审批节点类

- `erp_approval_node`

建议值：

- `SALES_APPROVE`
- `TECH_APPROVE`
- `BOM_APPROVE`
- `PLAN_APPROVE`
- `PURCHASE_APPROVE`
- `OUTSOURCE_APPROVE`
- `PROCESS_CHECK`
- `QUALITY_RELEASE`
- `INSPECTION_RELEASE`
- `FINANCE_CONFIRM`

### 6.3 日单检品结果类

- `erp_inspection_result`

建议值：

- `WAIT_BOOKING`
- `BOOKED`
- `PASS`
- `FAIL`
- `RECHECK`
- `RELEASED`

### 6.4 外协结算状态类

- `erp_outsource_settlement_status`

建议值：

- `UNSETTLED`
- `CHECKED`
- `CONFIRMED`
- `SETTLED`

### 6.5 返工状态类

- `erp_rework_status`

建议值：

- `PENDING`
- `RUNNING`
- `WAIT_CHECK`
- `PASSED`
- `CLOSED`

### 6.6 变更原因类

- `erp_change_reason`

建议值：

- `DELIVERY_CHANGE`
- `QTY_CHANGE`
- `STYLE_CHANGE`
- `ROUTE_CHANGE`
- `MATERIAL_SHORTAGE`
- `QUALITY_ISSUE`
- `CUSTOMER_REQUEST`

### 6.7 客户质量画像类

- `erp_customer_quality_profile`

建议值建议按客户档案字段挂，不建议单独作为单个状态码，但可以补这些标准枚举：

- 检品方式
- AQL 等级
- 检针要求
- 包装标准
- 尺寸允差等级

## 7. 字典命名建议

建议统一规则：

- 业务状态：`erp_xxx_status`
- 审批结果：`erp_xxx_audit_status` 或 `erp_xxx_approve_status`
- 类型枚举：`erp_xxx_type`
- 结果枚举：`erp_xxx_result`
- 特殊行业字典：`erp_knitwear_xxx`

不建议出现的问题：

- 同一个含义使用多个 dictType
- 一个 dictType 同时表达业务状态和审批状态
- 数字码和英文码混用且无映射

建议新字典优先使用英文业务码，如：

- `DRAFT`
- `SUBMITTED`
- `APPROVED`
- `REJECTED`
- `RUNNING`
- `COMPLETED`

这样中日双语显示时更稳定。

## 8. 审批日志模型建议

建议新增统一审批日志表，而不是每张表零散加一堆字段后又查不出来历史。

建议结构：

- `businessType`
- `businessId`
- `businessNo`
- `nodeCode`
- `actionType`
- `fromStatus`
- `toStatus`
- `actionBy`
- `actionTime`
- `actionRemark`
- `factoryId`
- `workshopId`

建议动作值：

- `SUBMIT`
- `APPROVE`
- `REJECT`
- `RECALL`
- `RELEASE`
- `CLOSE`
- `CHANGE_APPROVE`

## 9. 角色审批矩阵

建议角色矩阵不要只按菜单权限，而要加“可审批节点”。

### 9.1 销售域

- 业务员：新建、编辑、提交
- 销售主管：审核、驳回、关闭
- 跟单员：查看、跟踪、打印
- 单证员：出货后查看、单证处理

### 9.2 技术域

- 工艺员：新建、编辑、提交 BOM / 工艺
- 技术主管：审核、冻结版本、驳回
- 打样员：执行打样、反馈样衣结果
- 样衣担当：确认样衣、补充说明

### 9.3 计划域

- 计划员：编制计划、提交
- PMC 主管：审核计划、调整产能
- 厂长：确认工厂接单、确认排产

### 9.4 采购域

- 采购员：建单、提交
- 采购主管：审核、确认下单
- 财务：大额采购复核

### 9.5 外协域

- 外协专员：建单、提交、登记发出收回
- 生产经理：审核外发
- 品质：确认外协回厂质量
- 财务 / 成本：确认外协结算

### 9.6 生产执行域

- 车间主任：开工确认、报工复核
- 班组长：报工校验、异常上报
- 操作工：报工提交
- 统计员：数量复核

### 9.7 品质域

- IQC / IPQC / FQC / OQC：检验录入、判定
- QA / 品质主管：复核、放行、驳回
- 检品协调员：预约第三方检品

### 9.8 财务与结算域

- 人事 / 薪资：计件确认
- 财务：开票、回款、结算确认
- 成本会计：成本锁定、差异分析

## 10. 模块级审批权限矩阵

### 10.1 销售订单

- 新建：业务员
- 编辑：业务员
- 提交：业务员
- 审核：销售主管
- 关闭：销售主管

### 10.2 BOM / 工艺

- 新建：工艺员
- 编辑：工艺员
- 提交：工艺员
- 审核：技术主管
- 冻结：技术主管
- 变更审批：技术主管 + PMC 联签

### 10.3 生产计划

- 新建：计划员
- 编辑：计划员
- 提交：计划员
- 审核：PMC 主管
- 工厂确认：厂长

### 10.4 采购

- 新建：采购员
- 提交：采购员
- 审核：采购主管
- 大额复核：财务 / 总经理

### 10.5 外协

- 新建：外协专员
- 提交：外协专员
- 审核：生产经理
- 收回确认：仓库 / 车间
- 质检确认：品质
- 结算确认：财务

### 10.6 工序报工

- 报工提交：操作工 / 班组长
- 报工复核：统计员 / 车间主任
- 放行：品质
- 驳回：品质

### 10.7 日单检品

- 预约申请：跟单 / 检品协调员
- 检品结果录入：检品协调员 / 品质
- 出货放行：品质主管 / 单证主管

### 10.8 计件与财务

- 计件确认：车间 + 人事
- 工资锁定：财务 / 人事
- 开票审核：财务
- 回款确认：财务

## 11. 数据范围矩阵

审批权限还应加数据范围控制：

- 总部角色：可跨工厂审批
- 工厂角色：仅审批本工厂
- 车间角色：仅审批本车间
- 班组角色：仅查看和提交本班组
- 跟单 / 单证：按客户或品牌线查看
- 财务：按公司主体查看

建议权限维度：

- companyId
- factoryId
- branchFactoryId
- workshopId
- teamId
- customerId
- brandId

## 12. 优先落地建议

如果按开发优先级推进，建议先做以下 3 组字典和审批矩阵：

第一组：

- `sales_order_status`
- `erp_sample_audit_status`
- `erp_plan_status`

第二组：

- `erp_process_status`
- `erp_approval_result`
- `erp_approval_node`

第三组：

- `erp_inspection_result`
- `erp_outsource_settlement_status`
- `erp_rework_status`

## 13. 结合当前项目的实施建议

当前项目已经恢复字典管理，因此后续审批开发建议遵循以下顺序：

1. 先补字典，不先写死页面按钮
2. 再补审批字段和审批日志
3. 再补审批页面和审批动作
4. 最后补打印、扫码和审批联动

不建议的做法：

- 在页面里直接把审批状态写死成中文
- 每个模块各自造一套状态码
- 没有审批日志就直接做审批按钮

推荐下一步实现顺序：

1. 销售审核字典与审批日志
2. 技术 / BOM 审核字典与审批日志
3. 计划审批字典与审批日志
4. 日单检品放行字典与审批日志

