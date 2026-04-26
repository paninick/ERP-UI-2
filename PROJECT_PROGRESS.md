# ERP-UI-2 Progress

Last updated: 2026-04-25 (end of DeepSeek v4 4-round test + employee extension)

## Current focus

- Knitwear ERP/MES business flow correction.
- Frontend should follow upstream-to-downstream source locking.
- Printing and scanning should serve production-floor execution, not create duplicate maintenance.
- Long-term architecture is now explicitly governed to avoid a future large refactor.
- Full-score delivery target is now defined: business 100, purchase 100, production 120, finance 100, project landing 100.
- Development planning is now being reset from page-based delivery to module full-chain delivery:
  - dict
  - SQL
  - domain
  - mapper
  - service
  - controller
  - frontend API
  - frontend page
  - approval / print / scan linkage
  - live verification
- Process definition and route customization are now treated as shared factory foundation.
- `照灯 / 灯检` is now a required formal process node for route, reporting, QC, print, scan, progress, and trace.

## OrgUnit module status (2026-04-25 after Codex review)

- SQL fixed and executed: `t_erp_org_unit` table created, `erp_org_type` dict seeded (7 types)
- Service tree governance implemented: parentId validation, circular reference prevention, delete-with-children prevention
- `IOrgUnitService` interface converged (validation methods moved to private)
- BFS visited set added to prevent infinite loop from historical dirty cycles
- Backend `compile`: PASS
- Frontend `build`: PASS
- Runtime API e2e: NOT VERIFIED (Tomcat classloading issue in dev environment)
- Deployable package: NOT VERIFIED (spring-boot.repackage skipped)
- State: `candidate repair patch produced, runtime pending verification` — NOT marked final
- Next gate:
  - employee profile extension design can start
  - employee profile coding must wait until Codex reviews the OrgUnit diff and either runtime API e2e passes or the e2e blocker is explicitly accepted as an environment-only issue
  - no model may mark OrgUnit as final complete before runtime API and page operation verification
  - DeepSeek v4 crossed blind-test boundaries by entering unauthorized mainline coding; its output may be used only as candidate patch material, not as accepted delivery

## Employee profile extension design gate (2026-04-25)

- Current mode: design only, no coding until OrgUnit runtime gate is resolved.
- Coding authority gate:
  - Codex and Claude are allowed to run mainline coding under the project validation rules
  - other models may provide analysis, design, candidate patches, or limited validation only until they pass blind tests and are explicitly promoted in project docs
- Goal:
  - bind employee profile to ERP organization structure
  - support workshop/team/station responsibility tracking
  - provide stable personnel dimensions for production reporting, piece wage, quality responsibility, and abnormal responsibility
- Proposed backend fields:
  - `org_unit_id`: primary organization node for the employee
  - `workshop_id`: workshop-level node, derived or selected from `t_erp_org_unit`
  - `team_id`: team-level node, derived or selected from `t_erp_org_unit`
  - `station_id`: station/work-position node, replacing free-text station where applicable
  - `skill_level`: dictionary-backed skill level
  - `piece_category`: dictionary-backed piece wage category
- Proposed dictionaries:
  - `erp_skill_level`: trainee, junior, intermediate, senior, master
  - `erp_piece_category`: sewing, linking, ironing, inspection, packing, outsource_support
- Migration principle:
  - keep existing free-text fields during transition
  - add structured fields without deleting legacy fields
  - later migrate `department` and `station` text into organization references through a dedicated cleanup task
- Minimum delivery checklist after coding starts:
  - SQL migration adds fields and dictionaries idempotently
  - backend domain/mapper/service/controller expose the new fields
  - controller validation remains active
  - frontend employee form uses OrgUnit options and dictionaries
  - list/search/export include structured org fields where appropriate
  - backend compile passes
  - frontend build passes
  - runtime API or browser operation is verified when environment allows
- Hard gate:
  - coding must not start until OrgUnit diff review is complete
  - coding must not mark complete until OrgUnit runtime pending verification is either passed or explicitly accepted as environment-only risk

## Current recap (2026-04-25)

### Overall project state
- **OrgUnit**: candidate repair patch produced, code-level fix direction broadly correct, runtime API e2e pending verification, NOT marked final complete
- **Phase32 SQL (employee extension)**: 6 columns + 4 indexes implemented, per-column/per-index idempotency via PREPARED STATEMENT (Round 2E: **基本通过**). Dict seed + dedup included
- **Employee domain/Mapper/Service**: 6 new fields (orgUnitId, workshopId, teamId, stationId, skillLevel, pieceCategory) — SQL ↔ Domain ↔ Mapper XML fully consistent. `@NotBlank` validation added
- **Employee frontend**: GenericForm extended with `onFieldChange` callback; workshop→team→station cascading via parentId chain + edit-state backfill via useEffect. deptId/postId async loadOptions preserved. Build passes
- **Known incomplete**: API e2e, deployable package, frontend page operation, clean-database SQL idempotency, phase30 independent repair, orgType consistency validation in Service layer

### DeepSeek v4 test results (this session)
- Round 1-4 (4-round battery): 合规但无效 — no actual coding occurred
- Round 2B/3B (forced coding): produced real patches but hit off-target or had scope creep
- **Round 2C-2D** (SQL idempotency): count-based ALTER → partially improved → not passed
- **Round 2E** (per-column/per-index): **基本通过** — per-column Prepared Statement, no DELIMITER/PROCEDURE, 3 scenarios covered. Candidate patch acceptable
- Round 4B (frontend access): 部分通过 — fields added but no cascade
- Round 4C (cascade): EmployeeForm replacement → deptId/postId regression → fixed via GenericForm onFieldChange. **最终版: 基本通过**
- **DeepSeek v4 final status**: 接近受控可用，仍不具备主线编码资格。适合继续受控测试轮和候选补丁

### Coding authority
- **Accepted mainline coding authority**: Codex and Claude only; candidate models may code only in explicit test rounds as candidate-patch producers
- **Employee profile**: coding completed (6 backend fields + frontend cascade + i18n). Runtime browser verification pending due to backend environment issue

### Known technical debt
1. Backend Service layer: `validateOrgFields()` needs orgType consistency check (workshopId→WORKSHOP, teamId→TEAM, stationId→STATION)
2. Backend environment: Tomcat classloading issue with `mvn spring-boot:run` — blocks runtime API verification
3. Phase30: Doubao SQL remains unrepaired
4. Employee `department`/`station` legacy free-text fields to be migrated later

- Candidate models may be allowed to code during explicit test rounds
- Test-round coding does not grant mainline coding authority
- All candidate-model coding outputs remain candidate patches until Codex, Claude, or a human reviewer accepts them
- Test-round boundary violations must still be recorded in governance logs

## DeepSeek v4 test status (2026-04-25)

- Round 2E on `phase32_employee_org_extension.sql`: basically passed
- Improvement confirmed: moved from whole-block idempotency checks to per-column and per-index idempotent补齐 logic
- Output remains candidate patch only, not accepted mainline delivery
- Remaining gaps: empty-database first run and real partial-success database run still need fuller verification

- Added architecture document:
  - `LONG_TERM_PRODUCTION_MODEL_PLAN.md`
- Added full-score acceptance standard:
  - `FULL_SCORE_DELIVERY_STANDARD.md`
- Added material cost enhancement plan:
  - `MATERIAL_COST_ENHANCEMENT_PLAN.md`
- Confirmed production data layering:
  - source document truth
  - execution event truth
  - execution snapshot truth
- Confirmed current table role:
  - `t_erp_produce_job_process` remains job-process snapshot, not full execution log
- Confirmed required next architecture addition:
  - `t_erp_produce_report_log` as report/event layer
- Confirmed compatibility strategy:
  - keep current pages and snapshot table
  - add report-event layer
  - write validated cumulative values back into snapshot
  - later migrate wage / outsource / trace / abnormal aggregates to event-driven basis
- Confirmed future-proofing rule:
  - no parallel production model outside current ERP tables
  - no future finance or quality algorithm should depend only on snapshot records

## Confirmed process-route baseline on 2026-04-25

- Added planning document:
  - `PROCESS_ROUTE_CUSTOMIZATION_PLAN.md`
- Confirmed process model:
  - `ProcessDef` = controlled process master library
  - `ProcessRoute` = route template and ordered route items
  - `ProduceJobProcess` = actual job-level execution snapshot
- Confirmed frontend requirement:
  - process definition must support add / edit / disable
  - route editor must support add step, insert before / after, reorder, optional / conditional steps, outsource flag, QC flag, publish / freeze
- Confirmed execution requirement:
  - job process snapshot must preserve inserted / skipped / rework / outsourced steps
  - no report page should accept free-text process names
  - route item `sort_order` must initialize job process `process_seq`
- Confirmed formal process node:
  - `照灯/灯检`
  - recommended process code: `LIGHT_INSPECTION`
  - default placement: after finishing / pressing and before hangtag, needle detection, packing, or final OQC
- Confirmed optional real-factory steps that must be modeled through process definitions:
  - `印花`
  - `绣花`
  - `水洗`
  - `检品公司`
  - special finishing / repair / rework

## Completed process foundation frontend on 2026-04-25

- Added process definition maintenance page:
  - `src/pages/production/process-def/index.tsx`
- Added route:
  - `/production/process-def`
- Added sidebar entry:
  - production -> process definition
- Process definition page now supports current backend fields:
  - process code
  - process name
  - process type
  - quality check required
  - outsource enabled
  - default price
  - sort order
  - splice-related fields
  - status
  - remark
- Rebuilt process route page from a mismatched generic CRUD page into a route editor:
  - `src/pages/production/process/index.tsx`
- Process route editor now supports:
  - route header fields aligned to backend: routeName, productType, productCode, isDefault, status, remark
  - route item list loading from `/erp/processRoute/items/{routeId}`
  - add process step from `ProcessDef`
  - reorder by up/down controls
  - delete route item
  - control point flag
  - outsource flag
  - allow force start flag
  - require complete ratio
  - standard cycle hours
  - item remark
  - save through existing backend payload `{ route, items }`
- Updated process route frontend API so existing generic calls still work while full route payloads are also supported.
- Added Chinese / Japanese navigation keys for process definition.
- Validation completed:
  - `npm run lint` passed
  - `npm run build` passed

Remaining after this frontend foundation:

- add backend/schema fields for conditional steps, light inspection flags, job-level insertion reason, and source route item linkage
- add `LIGHT_INSPECTION / 照灯/灯检` SQL seed or hotfix data
- verify live backend roundtrip with a real database user and permissions

## Completed process foundation backend hotfix on 2026-04-25

- Added SQL hotfix:
  - `D:\erp\RuoYi-Vue\sql\phase25_process_light_inspection_hotfix.sql`
- SQL hotfix covers:
  - process master schema compatibility for historical `process_no/process_code` and `unit_price/default_price` variants
  - seed `LIGHT_INSPECTION / 照灯/灯检`
  - mark light inspection as quality-check required
  - recreate `sp_erp_init_job_processes` so it writes `process_seq`, not invalid `sort_order`
  - initialize job process status as `PENDING`
- Fixed production job creation initialization:
  - `D:\erp\RuoYi-Vue\ruoyi-admin\src\main\java\com\ruoyi\erp\service\impl\ProduceJobServiceImpl.java`
  - route item `sortOrder` now writes to job process `processSeq`
  - initializes in/out/defect/loss quantities
  - initializes `processStatus = PENDING`
  - carries route item outsource flag into job process
- Fixed current process lookup:
  - `D:\erp\RuoYi-Vue\ruoyi-admin\src\main\resources\mapper\erp\ProduceJobProcessMapper.xml`
  - current process now follows status model instead of only `finish_time IS NULL`
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed

## Completed custom job-process backend foundation on 2026-04-25

- Extended route item backend fields:
  - `requiredMode`
  - `conditionCode`
  - `qcRequired`
  - `needleCheckRequired`
  - `lossTracked`
  - `pieceWageApplicable`
- Extended job process snapshot backend fields:
  - `sourceRouteItemId`
  - `isInserted`
  - `insertReason`
  - `isSkipped`
  - `skipReason`
  - `isRework`
  - `reworkSourceProcessId`
  - `qcRequired`
  - `needleCheckRequired`
  - `lossTracked`
  - `pieceWageApplicable`
- Updated backend XML mappings for:
  - route item read / insert / update
  - job process read / insert / update
- Added job-process business actions:
  - `POST /erp/produceJobProcess/insertCustom`
  - `PUT /erp/produceJobProcess/skip`
  - `POST /erp/produceJobProcess/insertRework`
- Added frontend API wrappers:
  - `insertCustomProcess`
  - `skipProcess`
  - `insertReworkProcess`
- Updated `phase25_process_light_inspection_hotfix.sql`:
  - route item conditional fields
  - job process inserted / skipped / rework fields
  - procedure copies route item quality / needle / loss / wage flags into job process snapshot
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run lint` passed

## Completed job-process custom action UI on 2026-04-25

- Added frontend operation entry in process reporting page:
  - `src/pages/production/job-process/report.tsx`
- Operators can now:
  - insert a custom process into the current job
  - skip the current process with reason
  - insert a rework process linked to the current source process
- The custom action panel supports:
  - process selection from `ProcessDef`
  - insertion sequence
  - in-house / outsource flag
  - mandatory reason text for traceability
- Fixed process flow data normalization:
  - `src/pages/production/job-process/ProcessFlow.tsx`
  - supports backend AjaxResult `data` array and paged `rows`
- Validation completed:
  - frontend `npm run lint` passed
  - frontend `npm run build` passed

## Completed process-route conditional fields UI on 2026-04-25

- Extended process route editor:
  - `src/pages/production/process/index.tsx`
- Route item editor now supports:
  - required mode: `REQUIRED / OPTIONAL / CONDITIONAL`
  - condition code:
    - `HAS_PRINT`
    - `HAS_EMBROIDERY`
    - `JAPAN_ORDER`
    - `NEED_LIGHT_INSPECTION`
    - `THIRD_PARTY_INSPECTION`
  - QC required
  - needle check required
  - loss tracking
  - piece wage applicability
- Added frontend save validation:
  - conditional route items must select a condition code
- Route item payload now aligns with backend extension fields and job-process snapshot initialization.
- Validation completed:
  - frontend `npm run lint` passed
  - frontend `npm run build` passed

## Completed process-route dictionary governance on 2026-04-25

- Updated SQL hotfix:
  - `D:\erp\RuoYi-Vue\sql\phase25_process_light_inspection_hotfix.sql`
- Added dictionary seed data:
  - `erp_route_item_required_mode`
  - `erp_route_condition_code`
  - `erp_product_family`
  - `erp_process_type`
- Route editor now reads required-mode and condition-code options from dictionary:
  - fallback options remain only as UI resilience when dictionaries are not loaded
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run lint` passed
  - frontend `npm run build` passed

## Completed live process governance SQL closure on 2026-04-25

- Executed SQL hotfix against local `ry_vue` database:
  - `D:\erp\RuoYi-Vue\sql\phase25_process_light_inspection_hotfix.sql`
- Confirmed formal process master data:
  - `LIGHT_INSPECTION / 照灯/灯检`
  - `process_type = 0` according to current schema (`0=本厂工序`, `1=外协工序`)
  - `need_quality_check = 1`
  - `department = 质检/后整`
- Confirmed route customization dictionaries:
  - `erp_route_item_required_mode`
  - `erp_route_condition_code`
  - `erp_product_family`
  - `erp_process_type`
- Confirmed schema extension columns exist for:
  - route item optional / conditional / QC / needle / loss / wage flags
  - job process source route item / inserted / skipped / rework / QC / needle / loss / wage flags
- Confirmed `sp_erp_init_job_processes` exists and initializes job process snapshots from route items.
- Added SQL governance and permission patch:
  - `D:\erp\RuoYi-Vue\sql\phase26_process_governance_permission_fix.sql`
- `phase26` covers:
  - duplicate dictionary cleanup for repeated hotfix runs
  - `erp:processRoute:query`
  - `erp:processRouteItem:query/add/edit/remove/export`
  - `erp:produceJobProcess:query`
  - `erp:defect:query`
  - role menu inheritance for existing route / process / defect roles

## Completed database-level light-inspection smoke validation on 2026-04-25

- Created a temporary route and temporary production job in local DB.
- Called `sp_erp_init_job_processes`.
- Verified generated job process snapshot contained:
  - `P03 / 横机织片`
  - `LIGHT_INSPECTION / 照灯/灯检`
- Verified light inspection job-process snapshot copied:
  - `source_route_item_id`
  - `qc_required = 1`
  - `needle_check_required = 1`
  - `loss_tracked = 1`
  - `piece_wage_applicable = 1`
  - `process_status = PENDING`
- Cleaned all temporary route / job / job-process smoke data after validation.

## Latest validation on 2026-04-25

- SQL:
  - `phase25_process_light_inspection_hotfix.sql` executed successfully.
  - `phase25` was rerun successfully to verify repeatability.
  - `phase26_process_governance_permission_fix.sql` executed successfully.
  - duplicate dictionary query returned no rows after cleanup.
  - `LIGHT_INSPECTION` count remained `1` after repeated execution.
- Backend:
  - `mvn -pl ruoyi-admin -am -DskipTests compile` passed.
  - live backend returned `200` for:
    - `/erp/processDef/list`
    - `/erp/processRoute/list`
    - `/erp/produceJobProcess/list`
    - `/erp/defect/list`
- Frontend:
  - `npm run lint` passed.
  - `npm run build` passed.
  - existing large chunk warning remains, but no build error.

## Completed authenticated UI smoke validation on 2026-04-25

- Started local frontend on `http://localhost:3000`.
- Confirmed local backend on `http://localhost:8080`.
- Verified login through local backend using `admin / admin123`.
- Ran authenticated Playwright smoke validation for:
  - `/production/process-def`
  - `/production/process`
  - `/production/job-process`
  - `/quality/inspection`
  - `/system/dict`
  - `/production/style-progress`
  - `/production/product-trace`
- Result:
  - all tested pages rendered visible business content
  - process definition showed only valid process type options: `本厂工序`, `外协工序`
  - process route page showed product family dictionaries
  - job process and quality inspection pages read real backend data
  - dictionary management page is present and visible
  - browser console had `0` errors after the final fix
- Fixed during UI smoke:
  - `src/pages/production/style-progress/index.tsx`
  - replaced duplicate-prone `styleCode` table row key with a generated composite `progressRowKey`
  - reason: same style code can appear across multiple sales orders, customers, or batches

## Completed governance audit in this round

- Added Batch 1 foundation audit matrix:
  - `BATCH1_FOUNDATION_AUDIT_MATRIX.md`
- Confirmed that the current major gap is backend foundation closure, not only page coverage.
- Confirmed that the first shared-foundation batch should be governed as:
  - organization / workshop / team
  - employee
  - work center
  - process definition
  - process route
- Confirmed recommended organization modeling direction:
  - reuse `sys_dept` as the tree foundation
  - classify ERP business ownership on top of it
  - keep `sys_user_factory` for factory scope

## Completed business corrections

- Restored source-locking logic between core documents.
- Production plan now derives from sales order instead of re-entering source data.
- Production job now derives from production plan instead of re-entering source data.
- Downstream forms now treat upstream identifiers and quantities as inherited/read-only where appropriate.

## Completed business-heavy pages

- Restored sales detail page with business content:
  - `src/pages/sales/order/detail.tsx`
- Restored BOM detail page with business content:
  - `src/pages/material/bom/detail.tsx`
- Restored production notice detail page with business content:
  - `src/pages/production/notice/detail.tsx`

## Completed visible language switching in business detail pages

- Extended Chinese / Japanese switching into business detail editors:
  - `src/pages/sales/order/detail.tsx`
  - `src/pages/material/bom/detail.tsx`
  - `src/pages/production/notice/detail.tsx`
- Kept restored business containers while adding switching for:
  - bulk quantity allocation
  - color group structures
  - material detail sections
  - sample / notice detail structures
  - archive image and attachment containers

## Completed dictionary capability

- Restored dictionary API:
  - `src/api/dict.ts`
- Restored dictionary pages:
  - `src/pages/system/dict/index.tsx`
  - `src/pages/system/dict/data.tsx`
- Restored dict option hook:
  - `src/hooks/useDictOptions.ts`

## Completed language switching foundation

- Added i18n initialization:
  - `src/i18n/index.ts`
- Wired i18n bootstrapping in:
  - `src/main.tsx`
- Added Chinese / Japanese switcher in login page:
  - `src/pages/auth/Login.tsx`
- Added Chinese / Japanese switcher in main header:
  - `src/components/layout/Header.tsx`
- Rebuilt sidebar labels through translations:
  - `src/components/layout/Sidebar.tsx`
- Language choice is now persisted through `localStorage`.

## Completed visible language switching rollout

- Extended Chinese / Japanese switching into shared business UI:
  - `src/components/ui/SearchForm.tsx`
  - `src/components/ui/CrudPage.tsx`
  - `src/components/ui/GenericForm.tsx`
  - `src/components/ui/ConfirmDialog.tsx`
  - `src/components/business/PrintCodeStrip.tsx`
- Extended Chinese / Japanese switching into production execution pages:
  - `src/pages/production/job-process/report.tsx`
  - `src/pages/production/job-process/DefectForm.tsx`
- Extended Chinese / Japanese switching into quality workflow pages:
  - `src/pages/quality/inspection/index.tsx`
  - `src/pages/quality/inspection/print.tsx`
- Extended Chinese / Japanese switching into sales print workflow:
  - `src/pages/sales/order/print.tsx`
- Extended Chinese / Japanese switching into production print and execution dashboard:
  - `src/pages/production/plan/print.tsx`
  - `src/pages/production/job/print.tsx`
  - `src/pages/production/kanban/index.tsx`
- Added business-level translation keys for:
  - process reporting
  - defect recording
  - quality inspection / release
  - print pages
  - production execution dashboard
- Cleaned remaining garbled text in the above high-frequency workflow pages so switching is visible to end users.

## Completed shared CRUD and entry-page cleanup

- Cleaned garbled default text in shared CRUD / toast / confirm flows:
  - `src/components/ui/CrudPage.tsx`
  - `src/components/ui/GenericForm.tsx`
  - `src/components/ui/ConfirmDialog.tsx`
  - `src/hooks/useCrud.ts`
- Extended Chinese / Japanese switching into additional entry pages:
  - `src/pages/customer/index.tsx`
  - `src/pages/biz/abnormal/index.tsx`
  - `src/pages/dashboard/index.tsx`
- Added shared translation keys for:
  - CRUD modal titles
  - generic delete confirmation
  - select and input placeholders
  - generic success and failure toasts
  - customer management
  - abnormal pool
  - dashboard cards and quick actions

## Completed broader business CRUD rollout

- Extended Chinese / Japanese switching into more core business list pages:
  - `src/pages/supplier/index.tsx`
  - `src/pages/warehouse/index.tsx`
  - `src/pages/employee/index.tsx`
  - `src/pages/inventory/stock-in/index.tsx`
  - `src/pages/inventory/stock-out/index.tsx`
  - `src/pages/inventory/list/index.tsx`
  - `src/pages/purchase/index.tsx`
  - `src/pages/outsource/index.tsx`
  - `src/pages/finance/invoice/index.tsx`
- Extended Chinese / Japanese switching into materials, quality, wage, and system master pages:
  - `src/pages/material/main/index.tsx`
  - `src/pages/material/auxiliary/index.tsx`
  - `src/pages/material/bom/index.tsx`
  - `src/pages/quality/index.tsx`
  - `src/pages/piecewage/index.tsx`
  - `src/pages/system/user/index.tsx`
  - `src/pages/system/role/index.tsx`
- Added more translation domains for:
  - supplier
  - warehouse
  - employee
  - stock in / stock out / inventory list
  - main material / auxiliary material / BOM list
  - purchase / outsource / invoice
  - quality / piece wage
  - system user / system role

## Completed production execution features

- Added process reporting flow:
  - `src/pages/production/job-process/index.tsx`
  - `src/pages/production/job-process/report.tsx`
  - `src/pages/production/job-process/ProcessFlow.tsx`
  - `src/pages/production/job-process/DefectForm.tsx`
- Added production kanban:
  - `src/pages/production/kanban/index.tsx`
- Added quality release workflow:
  - `src/pages/quality/inspection/index.tsx`
  - `src/pages/quality/inspection/print.tsx`
- Added job process related APIs:
  - `src/api/produceJobProcess.ts`
  - `src/api/defect.ts`
  - `src/api/processDef.ts`
  - `src/api/workCenter.ts`

## Completed document numbering / printing corrections

- Clarified document hierarchy:
  - `styleCode` is product identity.
  - `salesNo` is demand/source number.
  - `planNo` is scheduling number.
  - `jobNo` is execution number.
- Added document hierarchy display component:
  - `src/components/business/DocumentCodeBoard.tsx`
- Added QR print strip component:
  - `src/components/business/PrintCodeStrip.tsx`
- Added QR support dependency:
  - `qrcode`

## Completed print pages

- Sales order print:
  - `src/pages/sales/order/print.tsx`
- Production plan print:
  - `src/pages/production/plan/print.tsx`
- Production job / route card print:
  - `src/pages/production/job/print.tsx`
- Quality inspection print:
  - `src/pages/quality/inspection/print.tsx`

## Completed scan-back business loop

- Added unified business link builder:
  - `src/utils/businessLinks.ts`
- QR codes now support real deep links instead of only opaque code strings.
- Sales print QR can route back to sales detail / print.
- Plan print QR can route back to plan print page.
- Job print QR can route into process report page.
- Quality print QR can route into quality inspection page or print page.
- Process report page now supports scanned `processId` query parameter.
- Quality inspection page now supports scanned `recordId` query parameter.

## Completed route / navigation support

- Added print routes:
  - `/sales/order/print/:id`
  - `/production/plan/print/:id`
  - `/production/job/print/:id`
  - `/quality/inspection/print/:id`
- Added process reporting routes:
  - `/production/job-process`
  - `/production/job-process/report/:jobId`
- Added quality release route:
  - `/quality/inspection`

## Validation completed

- Multiple earlier builds passed during feature batches.
- Latest `npm run build` passed on 2026-04-24 after QR deep-link integration.
- Latest `npm run build` also passed after cleaning garbled text in key entry pages on 2026-04-24.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into report and quality workflow pages.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into sales print and quality print pages.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into sales detail, BOM detail, and sample notice detail pages.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into plan print, job print, and production kanban pages.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into shared CRUD, customer, abnormal pool, and dashboard pages.
- Latest `npm run build` passed again on 2026-04-24 after extending Chinese / Japanese switching into supplier, warehouse, employee, inventory, purchase, outsource, invoice, materials, quality, piece wage, and system pages.
- Latest `npm run build` passed again on 2026-04-25 after repairing approval-related garbled text and extending approval record visibility for outsource, piecewage, and quality inspection workflows.

## Completed approval workflow reinforcement

- Added shared approval helper cleanup:
  - `src/utils/approval.ts`
- Cleaned approval modal / timeline copy:
  - `src/components/ui/BaseModal.tsx`
  - `src/components/business/ApprovalTimeline.tsx`
- Extended outsource approval workflow with readable actions and record viewing:
  - `src/pages/outsource/index.tsx`
  - `src/pages/outsource/form.tsx`
- Extended piecewage confirmation workflow with readable actions and record viewing:
  - `src/pages/piecewage/index.tsx`
- Extended quality inspection dialog with:
  - Japanese-order third-party inspection booking
  - inspection pass / fail logging
  - readable approval timeline display
  - file:
    - `src/pages/quality/inspection/index.tsx`

## Completed text cleanup in core entry pages

- Cleaned historical garbled Chinese text in these workflow entry pages:
  - `src/pages/sales/order/index.tsx`
  - `src/pages/production/plan/index.tsx`
  - `src/pages/production/job/index.tsx`
  - `src/pages/production/job-process/index.tsx`
- Restored readable labels for:
  - titles
  - table headers
  - search fields
  - action buttons
  - confirmation / toast messages

## Next recommended work

- Split print layouts by department:
  - sales
  - planning
  - production floor
  - quality
- Expand language coverage from frame layer to business pages.
- Continue extending language coverage from high-frequency pages into remaining detail pages and print pages.
- Add per-process printable cards instead of only job-level print entry.
- Continue optimization based on real database fields and available dictionaries.
- Continue restoring removed business content where workflow requires it.
- Start Batch 1 foundation delivery:
  - organization / workshop / team
  - employee
  - work center
  - process definition
  - process route

## Round update on 2026-04-25

- Added execution material-cost baseline:
  - backend execution attribution fields for `ProduceMaterialConsume`
  - SQL draft `D:\erp\RuoYi-Vue\sql\phase28_material_consume_execution_cost.sql`
  - backend compile passed
- Added execution material-cost visibility:
  - new frontend API `src/api/produceMaterialConsume.ts`
  - report page `src/pages/production/job-process/report.tsx` now shows:
    - actual quantity
    - actual cost
    - theoretical cost
    - cost variance
    - actual material loss
    - over-limit count
    - pending approval count
    - recent consume rows for current job / process
  - frontend build passed

## Updated maturity after this round

- production execution: `90`
- project landing: `91`
- lean-cost foundation: `76`

Reason:

- event layer is real and compiled
- snapshot writeback path exists
- execution-side material cost has entered the same chain
- but warehouse issue-out, freight, outsource settlement, and unified cost rollup are still not fully linked

## Progress anchor on 2026-04-25

- Added control document:
  - `PROJECT_POSITION_AND_EXECUTION_ROADMAP.md`
- Confirmed current project position:
  - source-chain correction materially completed
  - production execution truth materially established
  - event layer introduced
  - execution-cost visibility started
  - full cost closure not yet completed
- Confirmed next recommended development order:
  1. inventory execution closure
  2. material consume auto-linkage
  3. abnormal pool closure
  4. piece wage event-based strengthening
  5. outsource settlement strengthening
  6. unified cost rollup
- Confirmed current rating baseline:
  - business chain integrity: `88`
  - purchase readiness: `74`
  - production execution: `90`
  - finance readiness: `68`
  - project landing: `91`
  - lean-cost foundation: `76`

## Inventory execution alignment on 2026-04-25

- Reworked inventory entry pages so frontend fields now align with backend stock bill headers:
  - `src/pages/inventory/stock-in/index.tsx`
  - `src/pages/inventory/stock-out/index.tsx`
- Replaced previous pseudo-fields such as direct warehouse/material/quantity editing with current backend-owned header fields:
  - bill number
  - in/out date
  - source bill type
  - source bill no
  - purchase linkage
  - plan linkage
  - bulk order no
  - confirm status
  - confirmer / confirm time
  - business description
- Added current linkage selectors:
  - purchase options
  - production plan options
- Validation completed:
  - frontend `npm run build` passed

Interpretation:

- inventory module is now closer to real stock bill ownership
- but it is still header-only
- next required closure is source-detail and warehouse-detail truth, not cosmetic UI work

## Inventory item visibility closure on 2026-04-25

- Added backend bill-item query closure:
  - `GET /erp/stockIn/item/listByIn/{inId}`
  - `GET /erp/stockOut/item/listByOut/{outId}`
- Reworked backend service/controller contracts for:
  - `StockInItem`
  - `StockOutItem`
- Added frontend inventory item API:
  - `src/api/inventory.ts`
- Extended inventory pages with item-detail viewing:
  - `src/pages/inventory/stock-in/index.tsx`
  - `src/pages/inventory/stock-out/index.tsx`
- Current inventory pages now support:
  - header fields aligned with backend truth
  - per-bill detail lookup
  - item modal visibility for warehouse/material/location detail
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run build` passed

Interpretation:

- inventory is no longer only a bill-header surface
- item truth is now visible and queryable
- next closure should bind stock-out item truth into material consume generation and cost attribution

## Inventory to material consume visibility closure on 2026-04-25

- Added stock-out linkage fields into production material consume model and mapper:
  - `stock_out_id`
  - `stock_out_item_id`
- Added SQL draft:
  - `D:\erp\RuoYi-Vue\sql\phase29_material_consume_stockout_link.sql`
- Extended frontend consume API:
  - `src/api/produceMaterialConsume.ts`
  - supports query by stock-out bill and stock-out item
- Extended stock-out detail modal:
  - `src/pages/inventory\stock-out\index.tsx`
- Current stock-out detail flow now supports:
  - bill header lookup
  - bill item lookup
  - per-item linked production material consume lookup
  - visibility of execution and cost fields:
    - job id
    - job process id
    - report log id
    - actual qty
    - actual loss qty
    - unit price
    - theoretical cost
    - actual cost
    - cost diff
    - over-limit flag
    - approval status
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed

Interpretation:

- stock-out item truth is now connected to execution-side material consume truth
- inventory, production execution, and material cost can now be reconciled at query level
- next closure is automatic generation and writeback, not just visibility

## Inventory to material consume auto-sync baseline on 2026-04-25

- Added backend sync entry:
  - `POST /erp/materialconsume/syncByStockOut/{stockOutId}`
- Extended backend material consume service:
  - sync stock-out bill -> material consume baseline rows
  - idempotent matching by `stock_out_item_id`
  - write baseline ownership:
    - `stock_out_id`
    - `stock_out_item_id`
    - `produce_plan_id`
    - `job_id` when job can be derived from plan
    - material code / name / type
    - actual qty
    - default baseline loss-rate logic
- Extended stock-out frontend:
  - `src/pages/inventory/stock-out/index.tsx`
  - new action: `同步用料`
- Current business result:
  - stock-out bill can now trigger baseline material consume generation directly from the inventory page
  - inventory detail and consume detail can be cross-checked in the same workflow
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run build` passed

Interpretation:

- inventory is no longer only visible to production cost
- inventory can now actively seed production material consume baseline data
- this is the correct bridge before later event-level attribution to specific process/report rows

## Material over-limit abnormal closure started on 2026-04-25

- Extended backend material consume service so over-limit records now auto-link into abnormal governance:
  - over-limit consume row auto-creates abnormal pool record
  - returned-within-limit consume row auto-closes matching open abnormal record
- Current abnormal governance rule:
  - `biz_type = MATERIAL_CONSUME`
  - `abnormal_code = MATERIAL_OVER_LIMIT`
  - abnormal severity escalates by over-limit ratio
- Extended abnormal pool page:
  - `src/pages/biz/abnormal/index.tsx`
  - added `bizType` select options so material-consume anomalies are directly filterable
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run build` passed

Interpretation:

- material over-limit is no longer only a passive flag on consume rows
- abnormal pool has started taking over cross-module exception governance
- this is the first real bridge from cost variance into process governance and management action

## Material baseline attribution started on 2026-04-25

- Added backend binding entry:
  - `PUT /erp/materialconsume/bind/{consumeId}?jobProcessId=...&reportLogId=...`
- Current backend capability:
  - bind a baseline material consume row onto a concrete job-process snapshot
  - optionally keep report-log linkage for later event-level closure
  - reject cross-job mismatches
- Extended process report page:
  - `src/pages/production/job-process/report.tsx`
  - can now show `待归属用料`
  - operator can bind pending material rows to the current process directly from the reporting page
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run build` passed

Interpretation:

- the project has moved from material baseline visibility to controlled process attribution
- this avoids fake automatic cost splitting while still giving operations a real path to tighten attribution
- it is the right intermediate step before full event-driven wage / outsource / cost rollup

## Abnormal lock and piece-wage event tightening on 2026-04-25

- Added abnormal lock enforcement capability in backend abnormal service:
  - can now detect locked unhandled abnormal records
- Added write-path interception:
  - process reporting is now blocked when the current job-process has locked abnormal records
  - material consume binding is now blocked when the consume row itself is locked by abnormal governance
- Tightened piece-wage month generation:
  - `PieceWage` auto-generation no longer reads only the historical summary view as source truth
  - monthly wage generation now aggregates from `t_erp_produce_report_log`
  - respects validated report events and current piece-wage applicability flag
  - writes defect qty and event-source remarks into wage summary/detail rows
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed

Interpretation:

- abnormal pool has started acting as a real business gate, not just a passive dashboard
- piece wage has started moving from snapshot/view thinking to event-truth thinking
- finance readiness is now structurally improved, even though the frontend wage page still needs later model alignment

## Piece-wage frontend alignment and stock-out abnormal gate on 2026-04-25

- Reworked frontend piece-wage page:
  - `src/pages/piecewage/index.tsx`
  - no longer treats wage summary as a single-process flat record
  - now aligns to backend monthly summary truth:
    - `employeeName`
    - `wageMonth`
    - `totalProcessCount`
    - `totalOkQty`
    - `totalDefectQty`
    - `shouldWage`
    - `deductWage`
    - `actualWage`
    - `status`
- Added frontend wage actions:
  - monthly auto-generation trigger
  - wage detail modal via `piecewagedetail/listByWage/{wageId}`
  - confirm / reverse-confirm action retained
  - approval log modal retained
- Extended frontend wage API:
  - `autoGeneratePiecewage(wageMonth)`
  - `listPiecewageDetailByWage(wageId)`
- Extended backend abnormal lock enforcement:
  - `IProduceMaterialConsumeService.hasLockedAbnormalByStockOut(Long stockOutId)`
  - stock-out confirmation now blocks when linked material-consume rows contain locked open abnormalities
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed
  - frontend `npm run build` passed

Interpretation:

- piece wage frontend is now aligned to the event-source monthly generation model already implemented in backend
- finance users can inspect summary and detail without relying on the old pseudo-flat wage structure
- abnormal pool is no longer only blocking process reporting and consume binding; it now starts gating inventory execution continuation too

## Current recommended next order after phase29 visibility closure

1. expand abnormal lock enforcement into more critical write paths, especially material consume approval, stock confirmation, and selected settlement actions
2. align piece-wage frontend model and detail presentation to the new event-source summary structure
3. strengthen outsource settlement onto event and inventory issue/return truth
4. continue material attribution from job-process binding into true report-log/event-level linkage
5. build unified cost rollup across material, outsource, wage, freight, and quality loss
