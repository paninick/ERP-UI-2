# Batch 1 Foundation Audit Matrix

Last updated: 2026-04-25

## Scope

This audit covers the first shared-foundation delivery batch:

1. organization / workshop / team
2. employee
3. work center
4. process definition
5. process route

The goal is to stop treating these modules as "already done" just because SQL or frontend pages exist.

## Executive summary

Current reality:

- frontend API exists for `employee`, `workCenter`, `processDef`, `processRoute`
- frontend page exists for `employee` and `processRoute`
- dictionary infrastructure exists and is reusable
- backend ERP controller / service / mapper / domain closure is not confirmed for any of the five modules
- RuoYi base organization capability exists through `sys_dept`, `sys_post`, and `sys_user_factory`

Conclusion:

- Batch 1 is still in `foundation incomplete`
- the highest-risk gap is not the page layer
- the highest-risk gap is backend module absence plus weak organization modeling

## Modeling decision

### Organization / workshop / team

Recommended model:

- use `sys_dept` as the organizational tree foundation
- do not create a second parallel organization tree unless current data proves `sys_dept` cannot carry factory hierarchy
- classify each department node by ERP business role:
  - factory
  - branch_factory
  - workshop
  - team
  - office_department
- keep `sys_user_factory` for user factory scope
- later add workshop / team scope through dept linkage rather than a separate user-scope table unless business truly needs multi-team sharing

Reason:

- permissions and data scope already align naturally with `sys_dept`
- workshop execution still needs ERP business classification, but not a brand-new org tree
- this is the lowest-risk way to support total company + branch factory + workshop + team reality

## Audit matrix

Legend:

- `done`: available and usable
- `partial`: exists but weak / not governed / not verified
- `missing`: not found in current codebase

| Module | Dict | SQL | Domain | Mapper | Service | Controller | Frontend API | Frontend Page | Approval / Print / Scan | Live verification | Current verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| organization / workshop / team | partial | partial | partial | partial | partial | missing | missing | missing | partial | missing | base exists in system layer, ERP governance missing |
| employee | partial | partial | missing | missing | missing | missing | done | done | partial | missing | frontend-first, backend closure missing |
| work center | partial | partial | missing | missing | missing | missing | done | missing | partial | missing | SQL/API naming exists, page and backend missing |
| process definition | partial | partial | missing | missing | missing | missing | done | missing | partial | missing | downstream depends on it, but backend not found |
| process route | partial | partial | missing | missing | missing | missing | done | done | partial | missing | page exists, but route model is still unfinished |

## Detailed findings

### 1. Organization / workshop / team

Available now:

- `sys_dept`
- `sys_post`
- `sys_user_factory`
- RuoYi data scope and role-dept linkage

Gap:

- no ERP classification layer telling which department is factory / workshop / team
- no dedicated ERP page for plant structure governance
- no explicit mapping standard for production, quality, outsource, warehouse ownership

Must deliver:

- dept type dict
- factory / workshop / team naming rule
- scope rule for sales, tech, purchase, production, quality, warehouse, finance
- organization view or ERP wrapper page

### 2. Employee

Available now:

- SQL traces for `t_erp_employee`
- frontend API `/erp/employee/*`
- frontend CRUD page

Current weakness:

- page still treats department / position as loose text business fields
- no confirmed backend module in Java
- no strong linkage to `sys_dept`, `sys_post`, skill level, wage category, workshop / team

Must deliver:

- employee domain
- mapper / service / controller
- dept / post foreign linkage strategy
- skill level dict
- wage category dict
- active / leave status dict standardization

### 3. Work center

Available now:

- SQL traces for `t_erp_work_center`
- frontend API `/erp/workCenter/*`

Current weakness:

- no confirmed backend module
- no dedicated frontend page in current route tree
- no stable workshop ownership display

Must deliver:

- center type dict
- work center page
- department / workshop binding
- manager / capacity / unit fields
- active status dict

### 4. Process definition

Available now:

- SQL traces for `t_erp_process_def`
- seed data exists
- process reporting, quality, defect, and piece wage all conceptually depend on it
- frontend API `/erp/processDef/*`

Current weakness:

- no confirmed backend module
- no current dedicated frontend management page
- dict usage is not yet standardized across process type, workshop type, QC requirement, outsource flag

Must deliver:

- process type dict
- workshop type dict
- QC requirement fields
- piece wage applicability
- loss threshold linkage
- dedicated management page

### 5. Process route

Available now:

- SQL traces for `t_erp_process_route` and `t_erp_process_route_item`
- route seed and `sp_erp_init_job_processes`
- frontend API `/erp/processRoute/*`
- frontend page exists

Current weakness:

- page was still carrying historical garbled text
- backend closure not found
- route item editing is not yet exposed in frontend
- route version / publish / default strategy is still weak

Must deliver:

- backend route header + route item module
- route item editor
- publish / default / active rules
- work center binding per step where needed
- real init-job-process invocation endpoint

## Required dictionaries for batch 1

The following dicts should be treated as batch-1 baseline:

- `sys_common_status`
- `erp_org_node_type`
- `erp_employee_skill_level`
- `erp_employee_wage_category`
- `erp_work_center_type`
- `erp_process_type`
- `erp_process_status`
- `erp_process_product_family`
- `erp_process_qc_mode`
- `erp_route_status`

Rule:

- use stable English business code values
- Chinese / Japanese are labels, not identity

## Required SQL governance output

Batch 1 should stop scattering ownership across unrelated historical phase files.

Recommended new governance folders under backend SQL:

- `sql/module-foundation/organization/`
- `sql/module-foundation/employee/`
- `sql/module-foundation/work-center/`
- `sql/module-foundation/process-def/`
- `sql/module-foundation/process-route/`

Historical `phase*.sql` files stay as history, but new delivery should land by module.

## Batch 1 delivery order

1. organization model
2. employee model
3. work center model
4. process definition model
5. process route model

## Immediate implementation rule

Before building more execution pages, we should complete at least the first two foundation closures:

1. organization / workshop / team classification on top of `sys_dept`
2. employee module normalized against organization and post

Without these two, later process reporting, quality assignment, abnormal ownership, and piece wage all remain structurally weak.
