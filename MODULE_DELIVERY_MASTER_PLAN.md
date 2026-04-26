# Knitwear ERP / MES Module Delivery Master Plan

Last updated: 2026-04-25

## Purpose

This plan resets the development route around one non-negotiable rule:

- every business module must be delivered as one complete chain
- dictionary
- SQL
- domain
- mapper
- service
- controller API
- frontend API
- frontend page
- print / scan / approval linkage when applicable

If any one of these layers is skipped, the module is treated as incomplete.

Long-term model reference:

- `ERP_PROJECT_GOVERNANCE.md`
- `ERP_ENGINEERING_BASELINE.md`
- `LONG_TERM_PRODUCTION_MODEL_PLAN.md`
- `FULL_SCORE_DELIVERY_STANDARD.md`
- `DOUBAO_EXECUTION_CONSTRAINTS.md`
- `DOUBAO_VALIDATION_CASES.md`

This reference is mandatory for all new production, quality, outsource, wage, and scan-related work.
New features must follow the long-term model and compatibility strategy there, especially:

- source document truth
- execution event truth
- execution snapshot truth

For any Doubao-delivered task or any audited repair batch, `DOUBAO_EXECUTION_CONSTRAINTS.md` is also mandatory.
That file defines:

- evidence-driven completion
- case-driven repair
- restart-safe execution rules
- forbidden false-completion patterns

For audited repair work, `DOUBAO_VALIDATION_CASES.md` and `VERIFY_DOUBAO_REPAIR_CASES.ps1` are also mandatory.
They define:

- real failure-based exam cases
- local PASS/FAIL validation for known repair blockers

The project target is now explicitly:

- business: 100
- purchase: 100
- production: 120
- finance: 100
- project landing: 100

Production is rated at 120 because it must absorb real factory variation and future mobile / scan execution without model rewrite.

## Current reality

The project has already made strong progress in frontend workflow restoration:

- sales -> plan -> job -> process -> quality main line is visible
- dictionary pages and dict hook are restored
- process reporting, quality release, print, scan-back, and approval skeleton are already in place

But the backend ERP model is not yet consistently organized as:

- stable SQL phase ownership
- clear ERP domain package grouping
- clear mapper XML grouping
- one module = one end-to-end delivery unit

This mismatch is now the main source of rework risk.

An additional risk is now explicitly recognized:

- if we keep expanding snapshot-only execution logic without an event layer, future wage, outsource settlement, traceability, and batch-scan support will force a large refactor

## Core delivery rule

For every business module, delivery must pass all 10 checkpoints:

1. `dict`
2. `sql`
3. `domain`
4. `mapper`
5. `service`
6. `controller`
7. `frontend api`
8. `frontend page`
9. `approval / print / scan linkage`
10. `live data verification`

No module should jump directly from SQL to page, or from page to temporary hardcoded logic.

## Active execution rule

During project execution, the model must actively use:

- the relevant skill or plugin workflow when available
- short progress reports during non-trivial work
- explicit validation after every meaningful closure

This means:

- do not wait for the user to request validation
- do not wait for the user to ask for a browser check after frontend changes
- do not wait for the user to ask whether a repair really fixed the audited issue

The model must actively:

1. choose the right workflow
2. report what is being checked
3. validate the result
4. report pass/fail honestly

For Doubao-audited work, the active validation path must include:

- `DOUBAO_EXECUTION_CONSTRAINTS.md`
- `DOUBAO_VALIDATION_CASES.md`
- `VERIFY_DOUBAO_REPAIR_CASES.ps1`

For execution modules, one more architecture checkpoint is mandatory:

11. `event layer vs snapshot layer ownership is explicit`

## Process route customization rule

Process flow is now a governed foundation module, not a fixed page list.

Reference plan:

- `PROCESS_ROUTE_CUSTOMIZATION_PLAN.md`

Hard rules:

- `ProcessDef` must support add / edit / disable from the frontend.
- `ProcessRoute` must support ordered route items, insert before / after, reorder, optional / conditional steps, outsource flag, QC flag, and publish / freeze status.
- `ProduceJobProcess` must be an actual job-level snapshot copied from the route template, not a live pointer to a mutable route.
- job-level inserted, skipped, outsource, and rework steps must keep reason and source linkage.
- no report page may accept free-text process names.
- `照灯 / 灯检` is a required formal process node and must be available in process definition, route template, job process, reporting, quality release, print, scan, progress, and trace.

Practical consequence:

- steps such as `印花`, `绣花`, `水洗`, `检品公司`, `照灯/灯检`, and special finishing are maintained as controlled process definitions, then selected into route templates or inserted into a production job with traceable reason.

## Standard module structure

**Actual backend structure (confirmed by code scan 2026-04-25):**

```
ruoyi-admin/src/main/java/com/ruoyi/erp/controller/
ruoyi-admin/src/main/java/com/ruoyi/erp/domain/
ruoyi-admin/src/main/java/com/ruoyi/erp/mapper/
ruoyi-admin/src/main/java/com/ruoyi/erp/service/
ruoyi-admin/src/main/java/com/ruoyi/erp/service/impl/
ruoyi-admin/src/main/resources/mapper/erp/
```

All ERP business code lives in `ruoyi-admin`, not `ruoyi-system`. The `ruoyi-system` package contains only RuoYi framework system code (SysUser, SysRole, SysDept, etc.).

Recommended frontend structure in `D:\\erp\\ERP-UI-2`:

- `src/api/<module>.ts`
- `src/pages/<business>/<module>/`
- `src/components/business/<shared-module-component>.tsx`
- `src/utils/<module-support>.ts`

Recommended SQL structure:

- keep historical `phase*.sql` files as migration history (do not move them)
- add one new governance layer:
  - `sql/module-foundation/`
  - `sql/module-dict/`
  - `sql/module-schema/`
  - `sql/module-seed/`
  - `sql/module-hotfix/`

This prevents later module work from being scattered across unrelated phase files.

## Definition of done by layer

### 1. Dictionary

Each module must define:

- status dict
- type dict
- result dict where needed
- defect / abnormal / responsibility dict where needed
- approval node dict where needed

Rules:

- dict values use stable business codes in English
- labels can switch by language
- do not hardcode Chinese status text as business identity
- frontend pages must prefer `useDictOptions(dictType)`

### 2. SQL

Each module must have:

- table schema
- index strategy
- unique key strategy
- foreign key or logical association strategy
- seed dictionary data if required
- seed basic business data only when needed for smoke test

Rules:

- upstream id inheritance must be preserved
- style identity and business document identity must not be merged
- customer requirement fields must not be dropped just because current page does not show them

### 3. Domain

Each module domain model must include:

- header fields
- line fields when needed
- source linkage fields
- status / approval fields
- audit fields
- factory / workshop / team dimensions when execution-related

Rules:

- one domain model must reflect real business ownership
- avoid putting unrelated process logic into generic system entities

### 4. Mapper

Each module mapper must include:

- list query
- detail query
- insert
- update
- logical delete or delete policy
- joined lookup for labels only when necessary
- print / trace / progress query where required

Rules:

- XML query names and Java mapper names must be consistent
- trace queries should be separate from CRUD queries

### 5. Service

Each module service must own:

- validation
- source locking
- document inheritance
- status transition rules
- abnormal trigger rules
- approval log write-in where needed

Rules:

- service layer decides status transitions
- controller must not embed business transition logic

### 6. Controller API

Each module controller should expose:

- list
- get detail
- add
- update
- remove if allowed
- submit / approve / reject / confirm style actions where needed
- print / trace / progress endpoint where needed

Rules:

- action endpoints should be business verbs, not generic patch hacks
- permission codes must be registered together with menu/button SQL

### 7. Frontend API

Each frontend API file must map 1:1 with backend routes where possible.

Rules:

- no fake endpoints
- no hidden status writes from page-only logic
- no skipping backend action endpoint by overloading update unless that is the actual design

### 8. Frontend page

Each module page should include:

- list
- form or detail
- readable status tags from dict
- source linkage display
- only editable fields that belong to that department

Rules:

- upstream locked fields must be readonly
- dropdown first, free text last
- no duplicate maintenance of source quantity, style, customer, or schedule fields

### 9. Approval / print / scan linkage

Not every module needs all three, but each module must be classified:

- no approval needed
- lightweight confirm needed
- full submit / approve / reject needed

And also:

- whether printable
- whether scannable
- whether trace record is required

### 10. Live verification

Each module is not complete until verified with:

- real dictionary values
- real backend response
- real saved record
- real list/detail roundtrip
- abnormal path
- permission path if applicable

## Module classification

### A. Source-lock modules

These lock source truth and must be stabilized first:

- sales order
- sample / technical notice
- BOM
- production plan
- production job

Required strength:

- strongest source inheritance control
- strongest approval and change control

### B. Execution modules

These consume source truth and write operational truth:

- process reporting
- quality inspection
- outsource execution
- warehouse in/out
- abnormal pool

Required strength:

- workshop usability
- quantity traceability
- defect and abnormal linkage

### C. Settlement modules

These consume execution truth and write financial truth:

- purchase settlement
- outsource settlement
- piece wage
- invoice
- receivable / payable extensions later

Required strength:

- readonly source linkage
- strict confirm / lock behavior

### D. Master-data modules

These support all other modules:

- customer
- supplier
- employee
- department / role / post
- warehouse
- main material
- auxiliary material
- process definition
- work center
- dictionaries

Required strength:

- stable code systems
- clean dict references

## Recommended development order

### Phase 0: Governance baseline

Goal:

- make later module work consistent

Tasks:

- unify module folder rules for backend ERP code
- define SQL ownership rule by module
- define dict naming rule
- define domain and mapper naming rule
- define menu/button permission registration rule

Output:

- this plan
- backend folder governance checklist
- dict and status naming checklist

### Phase 1: Master data first

Goal:

- stop business modules from inventing local enums and fake associations

Priority modules:

- dictionary
- customer
- supplier
- employee
- organization / workshop / team
- process definition
- work center

Done means:

- all core selectors can come from backend
- no critical workflow relies on local hardcoded fallback lists

### Phase 2: Source truth modules

Priority modules:

- sales order
- sample / technical notice
- BOM
- production plan
- production job

Done means:

- style identity, sales number, plan number, job number are clearly layered
- source locking is enforceable
- approval chain is explicit
- print and scan identity is stable

### Phase 3: Execution truth modules

Priority modules:

- process reporting
- quality inspection
- outsource
- warehouse in/out
- abnormal pool

Done means:

- process quantity, defect, loss, rework, quality release are all traceable
- Japanese inspection booking and result are loggable
- workshop actions match actual operator flow

### Phase 4: Settlement truth modules

Priority modules:

- piece wage
- outsource settlement
- invoice
- purchase settlement extension

Done means:

- execution data flows into settlement without duplicate maintenance
- confirm and lock behavior is consistent

### Phase 5: Analysis and management cockpit

Priority modules:

- style progress
- product trace
- factory efficiency
- abnormal closure
- cost variance
- supplier rating

Done means:

- views and analysis pages read from stable source and execution tables

## Mandatory checklists per module

Before coding a module:

- identify source document
- identify owner department
- identify required dictionaries
- identify SQL tables and views
- identify approval level
- identify print / scan need

Before merging a module:

- SQL exists
- dict exists
- domain exists
- mapper exists
- service exists
- controller exists
- frontend API exists
- frontend page exists
- permissions registered
- build passes
- live smoke test passes

## Current project gap summary

### What is already comparatively strong

- frontend workflow restoration (74 React pages, 51 Vue2 pages)
- print and scan business thinking
- dictionary consumption pattern in frontend (`useDictOptions` hook)
- production execution and quality release direction (job → process → WAIT_CHECK → QC release is a real closed loop)
- backend controller / mapper / XML coverage is broad (63 controllers, 64 mappers, 64 XMLs confirmed)

### What is still weak and must be corrected

- **6 modules have Controller + Mapper but missing Service**: QcInspection, ProduceDefect, FinInvoice, StyleProgress, ProductTrace, MaterialSku
- **3 modules completely missing**: organization/workshop/team, inspection company, style master (t_erp_style)
- **All approval flows unimplemented**: sales order, BOM freeze, plan release, purchase, outsource, piece wage, invoice
- **Unified approval log table missing**: t_erp_approval_log does not exist yet
- **Employee missing fields**: workshop_id, team_id, skill_level, piece_category
- **Process definition missing fields**: product_family, workshop_type, qc_required, needle_check_required, loss_tracked, piece_wage_applicable, default_work_center_id
- **Process definition frontend must support adding new process steps**; this is required for real factory custom processes such as print, embroidery, washing, inspection company, and light inspection
- **Process route missing full item editor**: it needs publish_status / version fields, ordered items, insert before / after, reorder, optional / conditional steps, outsource/QC flags
- **Light inspection missing as formal process data**: `照灯/灯检` must be added to process seed data and exposed through reporting / QC / print / scan
- **Work center missing**: Mapper XML, Service, frontend page
- **ReportController has no @PreAuthorize** on two methods (P0 security gap)
- **11 roles missing** from RBAC (purchaser, QC, outsource, PMC, workshop leader, operator, HR, sample, outsource vendor, inspection company, management)
- **SQL file ownership unclear**: 23 phase*.sql files with no module-level governance structure

### Scan date
2026-04-25

## Immediate next action

The next development cycle should not start from a random page.

It should start from this fixed order:

1. build backend module governance skeleton
2. audit all current dict types in use
3. map each active frontend module to backend SQL/domain/mapper/controller status
4. classify each module as:
   - complete
   - frontend-only
   - backend-only
   - broken linkage
5. then choose the next module batch

## First recommended batch

The best next batch is:

1. `organization + workshop + team + work center`
2. `process definition + process route`
3. `sales approval + BOM approval + plan approval`

Reason:

- these are shared foundations
- they reduce repeated rework in later production, outsource, and quality modules
- they align exactly with the current project bottleneck:
  frontend exists, backend governance is not yet uniformly closed

## Batch 1 audit matrix

The first batch should be audited and delivered as the shared foundation layer.

### 1. Employee

Frontend status:

- page exists
- API exists
- currently uses department and position as loose text fields

Backend status:

- SQL table traces exist
- frontend route contract exists: `/erp/employee/*`
- backend module structure is not yet confirmed as a clean ERP package

Current risk:

- employee is not yet strongly linked to workshop, team, post, skill level, or wage category
- later process reporting and piece wage will keep compensating with weak fields

Priority:

- P0

### 2. Process definition

Frontend status:

- API exists
- menu traces exist in SQL
- process reporting and defect linkage already depend on it

Backend status:

- SQL traces exist for `t_erp_process_def`
- backend package and mapper organization are not yet audited as a clean module

Current risk:

- route, report, defect, and piece wage all depend on this table
- if process definition is loose, every downstream module becomes unstable

Priority:

- P0

### 3. Process route

Frontend status:

- page exists
- API exists
- page still contains historical garbled text

Backend status:

- SQL traces exist for process route evolution
- backend controller / domain / mapper closure is not yet confirmed

Current risk:

- job initialization and process sequencing depend on it
- current page quality indicates unfinished governance

Priority:

- P0

### 4. Work center

Frontend status:

- API exists
- no stable dedicated page is confirmed in current route set

Backend status:

- SQL traces exist
- backend code closure is not yet confirmed

Current risk:

- planning, capacity, and workshop execution cannot be analyzed by real center dimension

Priority:

- P1

### 5. Organization / workshop / team

Frontend status:

- system department and post already exist in base RuoYi
- ERP frontend has not yet formed factory / workshop / team business pages

Backend status:

- `sys_dept`, `sys_post`, and `sys_user_factory` exist
- ERP-specific organization modeling is still insufficient for workshop execution

Current risk:

- workshop execution modules have no stable organizational dimension
- permissions, reporting, and abnormal assignment cannot fully match real factory structure

Priority:

- P0

## Batch 1 implementation order

The first implementation batch should follow this exact order:

1. organization model
2. employee model
3. work center model
4. process definition model
5. process route model

Reason:

- organization decides ownership
- employee depends on organization and post
- work center depends on organization
- process definition depends on stable basic data
- process route depends on process definition and work center

## Batch 1 required deliverables

### A. Organization model

Must deliver:

- factory / branch factory / workshop / team dictionary or coded type model
- relationship to `sys_dept`
- user to factory / workshop scope rule
- department-page or ERP organization-page strategy

### B. Employee model

Must deliver:

- employee code
- employee name
- dept / workshop / team
- post
- skill level
- wage category
- active status

And must stop relying only on:

- free-text department
- free-text position

### C. Work center model

Must deliver:

- work center code
- work center name
- workshop ownership
- center type
- capacity-related fields
- active status

### D. Process definition model

Must deliver:

- process code
- process name
- product family
- workshop type
- quality control requirement
- needle detection / light inspection related requirement flags
- loss threshold linkage
- piece wage applicability
- default work center binding where applicable
- active status
- add / edit / disable UI
- seed and maintain `照灯/灯检` as a formal process

Process definition must cover at least these real factory variations:

- flat knitting / 横机
- linking / 套口
- sewing / 缝纫
- washing / 水洗
- finishing / 整烫
- light inspection / 照灯 or 灯检
- needle detection / 检针
- packing / 包装
- print / 印花
- embroidery / 绣花
- third-party inspection company / 检品公司

### E. Process route model

Must deliver:

- route code
- route name
- product family / style applicability
- ordered process steps
- work center binding where needed
- publish status
- version strategy
- route item required mode: `REQUIRED / OPTIONAL / CONDITIONAL`
- route item condition code: `HAS_PRINT`, `HAS_EMBROIDERY`, `JAPAN_ORDER`, `NEED_LIGHT_INSPECTION`, `THIRD_PARTY_INSPECTION`
- route item flags for outsource, QC, light inspection, needle detection, loss tracking, and piece wage applicability
- route editor operations: add step from process definition, insert before / after, reorder, disable step, and publish / freeze route version
- job initialization rule: route item `sort_order` must become job process `process_seq`

## Batch 1 acceptance rule

Batch 1 is complete only when:

- dictionaries are no longer hardcoded in these modules
- backend package structure is clean and repeatable
- SQL ownership is clear
- `employee / processDef / processRoute / workCenter` frontend pages read real backend data
- organization dimension can be reused by production, quality, and outsource modules

---

## Module status matrix (scan: 2026-04-25)

| Module | Controller | Mapper.java | Mapper.xml | Service | Frontend API | Frontend page | Status |
|---|---|---|---|---|---|---|---|
| Customer | ✅ | ✅ | ✅ | ✅ | ✅ customer.ts | ✅ customer/ | OK |
| Supplier | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ supplier/ | OK |
| Employee | ✅ | ✅ | ✅ | ✅ | ✅ employee.ts | ✅ employee/ | Missing workshop/skill fields |
| Main material | ✅ | ✅ | ✅ | ✅ | ✅ material.ts | ✅ material/main/ | OK |
| Auxiliary material | ✅ | ✅ | ✅ | ✅ | ✅ auxiliary.ts | ✅ material/auxiliary/ | OK |
| Material SKU | ✅ | ✅ | ✅ | ❌ | ✅ | — | Service missing |
| Standard color | ✅ | ✅ | — | ✅ | — | — | XML missing, no frontend page |
| Unit conversion | ✅ | ✅ | ✅ | ✅ | — | — | No frontend page |
| Warehouse | ✅ | ✅ | ✅ | ✅ | ✅ warehouse.ts | ✅ warehouse/ | OK |
| Process definition | ✅ | ✅ | ✅ | ✅ | ✅ processDef.ts | ✅ production/process/ | Missing product_family/qc fields |
| Process route | ✅ | ✅ | ✅ | ✅ | ✅ processRoute.ts | ❌ | Frontend page missing |
| Process price | ✅ | ✅ | ✅ | ✅ | — | — | No frontend page |
| Loss matrix | ✅ | ✅ | ✅ | ✅ | — | — | No frontend page |
| Work center | ✅ | ✅ | ❌ | ❌ | ✅ workCenter.ts | ❌ | XML + Service + page missing |
| Sales order | ✅ | ✅ | ✅ | ✅ | ✅ sales.ts | ✅ sales/order/ | No approval flow |
| Sample notice | ✅ | ✅ | ✅ | ✅ | ✅ notice.ts | ✅ production/notice/ | OK |
| Sample tech | ✅ | ✅ | ✅ | ✅ | — | — | No frontend page |
| BOM | ✅ | ✅ | ✅ | ✅ | ✅ bom.ts | ✅ material/bom/ | No version freeze approval |
| Production plan | ✅ | ✅ | ✅ | ✅ | ✅ production.ts | ✅ production/plan/ | No release approval |
| Production job | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ production/job/ | OK |
| Job process (reporting) | ✅ | ✅ | ✅ | ✅ | ✅ produceJobProcess.ts | ✅ production/job-process/ | Approval loop complete ✅ |
| Purchase | ✅ | ✅ | ✅ | ✅ | ✅ purchase.ts | ✅ purchase/ | No approval flow |
| Outsource | ✅ | ✅ | ✅ | ✅ | ✅ outsource.ts | ✅ outsource/ | No approval flow |
| QC inspection | ✅ | ✅ | ✅ | ❌ | ✅ quality.ts | ✅ quality/ | Service missing |
| Defect record | ✅ | ✅ | ✅ | ❌ | ✅ defect.ts | — | Service missing, no page |
| Abnormal pool | ✅ | ✅ | ✅ | ✅ | ✅ bizAbnormal.ts | ✅ biz/abnormal/ | No source classification |
| Stock in | ✅ | ✅ | ✅ | ✅ | ✅ inventory.ts | ✅ inventory/stock-in/ | OK |
| Stock out | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ inventory/stock-out/ | OK |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ inventory/list/ | OK |
| Piece wage | ✅ | ✅ | ✅ | ✅ | ✅ piecewage.ts | ✅ piecewage/ | No dual-confirm approval |
| Invoice | ✅ | ✅ | ✅ | ❌ | ✅ invoice.ts | ✅ finance/invoice/ | Service missing |
| Report | ✅ | — | — | — | — | — | **No @PreAuthorize — P0 security gap** |
| Style progress | ✅ | ✅ | ✅ | ❌ | ✅ styleProgress.ts | ✅ production/style-progress/ | Service missing |
| Product trace | ✅ | ✅ | ✅ | ❌ | ✅ productTrace.ts | ✅ production/product-trace/ | Service missing |
| **Org / workshop / team** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **Completely missing** |
| **Inspection company** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **Completely missing** |
| **Style master (t_erp_style)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **Completely missing** |
| **Approval log** | ❌ | ❌ | ❌ | ❌ | ✅ approval.ts | — | **Table not created yet** |

---

## Delivery roadmap (planned: 2026-04-25)

### Wave 0 — Immediate fixes (week 1)

| Task | Description | Depends on |
|---|---|---|
| #5 | ReportController: add @PreAuthorize to 2 methods + register permission codes | — |
| #4 | Add 11 missing roles + configure menu permissions per role matrix | — |
| #6 | Fix MODULE_DELIVERY backend path description (done in this session) | — |
| #22 | Create SQL directory governance structure | — |

### Wave 1 — Master data foundation / Batch 1 (weeks 2–4)

Must be done in this order:

| Task | Description | Depends on |
|---|---|---|
| #21 | Seed all P1 dictionaries (15 new dict types +补值 to 5 existing) | — |
| #7 | Organization model: factory / workshop / team | #21 |
| #9 | Employee extend: workshop_id, team_id, skill_level, piece_category | #7 |
| #8 | Work center: add XML + Service + frontend page | #7 |
| #11 | Process definition extend: product_family, workshop_type, qc_required, add/edit/disable UI, and seed `照灯/灯检` | #8 |
| #10 | Process route full editor: route items, publish_status, version, conditional/custom step insertion | #11 |

### Wave 2 — Business data gaps (weeks 4–6)

| Task | Description | Depends on |
|---|---|---|
| #13 | Add missing Service layer to 6 modules (QcInspection, ProduceDefect, FinInvoice, StyleProgress, ProductTrace, MaterialSku) | Wave 1 |
| #12 | Customer: Japan order quality profile fields | Wave 1 |
| #14 | Inspection company: new module (full stack) | #12 |
| #15 | Style master: new t_erp_style module (full stack) | Wave 1 |
| #18 | QC: IQC/IPQC/FQC/OQC split + defect segment dict | #13 |

### Wave 3 — Approval infrastructure + flows (weeks 7–10)

| Task | Description | Depends on |
|---|---|---|
| #17 | Approval log table t_erp_approval_log + service + API | Wave 2 |
| #16 | Sales order + BOM + production plan approval flows | #17 |
| #19 | Purchase + outsource + piece wage + invoice approval flows | #17 |
| #20 | Japan order inspection booking + shipment release node | #14, #17 |

### Wave 4 — P3–P5 (weeks 11+)

Planned in ERP_MASTER_PLAN.md §6 P3–P5. Not detailed here until Wave 3 is complete.

---

## Resume instructions

When resuming work in a new session:

1. Read this file (`MODULE_DELIVERY_MASTER_PLAN.md`) for current state
2. Read `ERP_MASTER_PLAN.md` for business rules, dict specs, approval design, and role matrix
3. Check the task list above — find the lowest-numbered pending task in the current wave
4. Verify the task's dependencies are complete before starting
5. Follow the 10-checkpoint delivery rule for every module
6. Write SQL to `sql/module-dict/` or `sql/module-schema/` (not phase*.sql)
7. Mark task complete only after live verification passes
