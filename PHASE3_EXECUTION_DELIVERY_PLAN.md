# Phase 3 Execution Delivery Plan

Last updated: 2026-04-25

## Goal

Phase 3 is the execution-truth phase.

It covers:

1. process reporting
2. quality inspection / release
3. outsource execution
4. stock in / stock out / inventory pushdown
5. abnormal pool

The rule for this phase is simple:

- execution modules must consume locked source truth
- execution modules must write operational truth
- no execution page is allowed to stay frontend-only
- execution modules must consume the actual job process snapshot, including custom inserted steps
- execution write paths must evolve toward `event log -> validation -> snapshot writeback`
- future finance, outsource settlement, and quality traceability must share the same execution-event base
- `照灯 / 灯检` is a formal execution and quality node, not a remark field

## Current reality

Frontend already exists in meaningful form for:

- process reporting
- quality inspection / release
- outsource page
- stock in / stock out
- abnormal pool

Backend reality is much weaker:

- SQL tables exist for several execution modules
- frontend API contracts are already calling ERP routes
- backend controller / service / mapper closure is mostly missing

Conclusion:

- current execution still relies too heavily on job-process snapshot records and needs an explicit report-event layer

- the current bottleneck is backend execution closure
- the first priority should be the shortest path that unlocks the most pages
- process reporting cannot be considered complete until custom route steps such as `照灯/灯检`, `印花`, `绣花`, and outsource-return inspection can be reported as normal job processes

## Delivery order inside phase 3

### P0 prerequisite: Process definition and route extensibility

Reason:

- real knitwear production has optional steps that depend on style, fabric, customer, Japan-order requirements, and outsource work
- execution cannot be reliable if route steps are hardcoded
- `照灯/灯检` must exist as controlled master data before reporting and QC can analyze it

Must deliver:

- process definition add / edit / disable from UI
- seed `LIGHT_INSPECTION` / `照灯/灯检`
- route item editor with add step, insert before / after, reorder, optional / conditional flags, outsource flag, QC flag
- route publish / freeze before job initialization
- job initialization mapping from route item `sort_order` to job process `process_seq`
- job process snapshot fields for inserted / skipped / rework / outsourced steps

### P0: Process reporting + defect + quality release

Reason:

- this is the production-floor core loop
- process reporting page already exists
- quality release page already depends on the same process records
- one backend module family can unlock two major pages at once

Must deliver:

- `produceJobProcess` list / detail / listByJob / currentProcess / update
- `defect` list / add
- process status transition rule:
  - `PENDING`
  - `RUNNING`
  - `WAIT_CHECK`
  - `PASS`
  - `FAIL`
- quantity validation
- release fields write-back

### P0.5: Report event layer and pool validation

Reason:

- snapshot table alone is not enough for strong finance, quality, traceability, and clerk batch-entry scenarios
- this is the minimal architecture upgrade that avoids a later large rewrite

Must deliver:

- `t_erp_produce_report_log`
- backend domain / mapper / service / controller
- `singleReport` and `batchReport` service rule ownership
- upstream pool validation
- high-loss / overflow abnormal trigger baseline
- writeback from report log into `t_erp_produce_job_process`
- compatibility with current process report and quality pages

### P1: Outsource execution

Reason:

- knitwear factories often have real outsource handoff
- current page already has approval behavior
- execution truth should distinguish outsource dispatch / receive / defect

Must deliver:

- outsource order backend closure
- status flow
- quantity / receive confirmation fields
- linkage to job and process

### P1: Inventory execution

Reason:

- stock in and stock out are downstream physical actions
- they should inherit business source and warehouse truth

Must deliver:

- stock in / stock out backend closure
- item linkage if current schema already expects detail lines
- warehouse and material binding
- source-reference fields where required

### P2: Abnormal pool

Reason:

- abnormal pool is the outlet for execution exceptions
- it becomes valuable after reporting / quality / outsource start writing real events

Must deliver:

- abnormal CRUD backend closure
- source business reference
- handler / result / close loop
- later auto-trigger from high-loss / fail / overdue

## Phase 3 hard constraints

- no direct write from frontend to fake status fields without backend rule ownership
- execution quantities must not override source quantities
- process reporting and quality release must share the same process record truth
- defect data must not be stored only inside the quality page state
- outsource and inventory must keep real source linkage fields
- abnormal pool must reference source business type and business id
- dict-driven status only, no new hardcoded status identity
- custom or conditional process steps must be selected from `ProcessDef`, not typed as free text
- `照灯/灯检` must support normal reporting quantity, defect quantity, loss, operator, QC release, print, scan-back, progress, and trace
- inserted job process steps must keep insertion reason and source route item linkage

## Verification rule

Every execution module must pass:

1. frontend build
2. backend compile
3. list endpoint
4. detail endpoint
5. create / update roundtrip
6. at least one abnormal path
7. at least one job with `照灯/灯检`
8. at least one job with an inserted optional process step

## Immediate next implementation target

The next concrete implementation target is:

- `produceJobProcess + defect`

Because it unlocks:

- process report page
- process flow panel
- quality inspection entry list
- release / reject workflow foundation

## Delivery progress

### Completed on 2026-04-25

- `produceJobProcess` backend closure completed:
  - controller
  - service
  - mapper
  - xml mapping
  - quantity validation
  - current-process query
  - process status update compatibility for report and inspection pages
- `defect` backend closure completed:
  - controller
  - service
  - mapper
  - xml mapping
  - add / list / detail / update / delete contract closure
- `outsource` backend minimum viable closure completed:
  - controller
  - service
  - mapper
  - xml mapping
  - frontend-compatible list / detail / add / update / delete contract
  - compatibility strategy for `jobNo` / `styleCode` / `expectedDate`

### Validation completed

- Backend compile passed after `produceJobProcess + defect` closure.
- Backend compile passed again after `outsource` closure.

### Current phase interpretation

- P0 is now materially closed at backend compile and local DB-smoke level:
  - process reporting
  - defect recording
  - quality release shared process-record foundation
  - process definition / route conditional-step foundation
  - `LIGHT_INSPECTION / 照灯/灯检` formal process seed
  - route item flags copied into job process snapshot
- P1 has started and now has an outsource execution backend baseline.

### Remaining phase 3 work

- run authenticated browser roundtrip for process definition / route / report / quality release
- verify outsource page roundtrip against live database data
- close inventory execution backend
- close abnormal pool backend
- then run end-to-end validation on:
  - reporting
  - quality release
  - outsource
  - stock execution
  - light inspection reporting / release
  - inserted route step traceability

### Round update on 2026-04-25

- Added execution material-consume baseline to phase 3:
  - backend execution/cost attribution fields are in place
  - process reporting page can now see execution-side material cost variance
  - this is the first visible bridge from execution truth to lean-cost truth
- Additional remaining work added:
  - bind material consume creation to actual report events and/or issue-out actions
  - extend material consume with warehouse and stock-out linkage
  - include material consume variance capture in end-to-end verification
