# Long-Term Production Model And Compatibility Plan

Last updated: 2026-04-25

## Purpose

This document defines the long-term production execution model for the knitwear ERP / MES project.

It exists for one reason:

- avoid short-term compatibility work that creates a future full-system rewrite

The project must support:

- knitwear sweater factories
- knit shirt / T-shirt workflows
- mixed factories with full in-house processes
- partial subcontracting
- Japan-order quality and inspection requirements
- paper-based execution in early stage
- scan/mobile execution in later stage

## Core architecture rule

The system must separate three layers clearly:

1. source document truth
2. execution event truth
3. execution snapshot / aggregate truth

If these three layers are mixed into one table, later extension will become expensive and risky.

## Long-term business chain

The production chain should be governed as:

- customer style identity
- sales order identity
- technical process / BOM identity
- production plan identity
- production job identity
- route template identity
- job process snapshot
- process report event log
- defect / inspection / abnormal / wage / outsource aggregates

This means:

- customer style code is not the same as sales order number
- sales order number is not the same as production job number
- process route template is not the same as the execution snapshot of one job
- one production job may have inserted, skipped, outsourced, or rework steps that do not exist in the original template

## Current table mapping

The current schema already contains useful building blocks and should be retained as the base:

- `t_erp_sales_order`
- `t_erp_bom`
- `t_erp_process_def`
- `t_erp_process_route`
- `t_erp_process_route_item`
- `t_erp_produce_plan`
- `t_erp_produce_job`
- `t_erp_produce_job_process`
- `t_erp_produce_defect`
- `t_erp_piece_wage`
- `t_erp_piece_wage_detail`
- `t_erp_outsource_order`
- `t_erp_biz_abnormal_pool`

## Role of each production table

### 1. Route template layer

Use:

- `t_erp_process_def`
- `t_erp_process_route`
- `t_erp_process_route_item`

Responsibility:

- controlled process master library
- standard route templates by product family and business condition
- optional / conditional / outsource / QC / needle / loss / wage flags

This layer is configuration truth, not execution truth.

### 2. Job execution snapshot layer

Use:

- `t_erp_produce_job`
- `t_erp_produce_job_process`

Responsibility:

- one job owns one copied route snapshot
- current state of each process node for that job
- process order, operator assignment, cumulative in/out/defect/loss, release status
- inserted / skipped / rework / outsource flags and reasons

This layer is current execution state, not the full audit trail.

### 3. Execution event layer

Must be added:

- `t_erp_produce_report_log`

Responsibility:

- every paper entry, scan entry, mobile entry, outsource return, rework entry, and correction event
- immutable or append-first operational truth
- source for pool validation, wage aggregation, traceability, and abnormal trigger

Without this event layer, later wage, outsource settlement, and quality tracing will remain weak.

## Recommended new event table

Suggested table:

- `t_erp_produce_report_log`

Suggested minimum fields:

- `id`
- `job_id`
- `job_process_id`
- `process_id`
- `process_seq`
- `employee_id`
- `employee_name`
- `paper_operator_name`
- `team_name`
- `machine_no`
- `report_qty`
- `ok_qty`
- `defect_qty`
- `loss_qty`
- `report_type`
- `report_source`
- `batch_no`
- `scan_token`
- `is_outsource`
- `outsource_id`
- `validation_status`
- `validation_message`
- `event_time`
- `remark`
- audit fields

Suggested `report_source` values:

- `PAPER_BATCH`
- `SCAN`
- `MOBILE`
- `OUTSOURCE_RETURN`
- `MANUAL_ADJUST`

## Compatibility strategy

The project should not replace current execution tables immediately.

Instead it should follow this rule:

- keep `t_erp_produce_job_process` as snapshot table
- add `t_erp_produce_report_log` as event table
- compute aggregates from event table
- write selected cumulative values back into snapshot table for fast list pages

This gives us:

- backward compatibility for current pages
- forward compatibility for future algorithms
- no need to rebuild route / job / reporting pages from scratch later

## Process reporting rule

Process reporting must follow this sequence:

1. receive report input
2. load current job process and previous executable pool
3. run pool validation and quantity validation
4. insert report event log
5. update job process cumulative snapshot
6. write defect records when applicable
7. trigger abnormal pool when thresholds are exceeded
8. refresh board / progress aggregates asynchronously where possible

The UI may preview validation, but final rule ownership must stay in backend service layer.

## Pool validation rule

The most important backend rule is:

- downstream cumulative accepted quantity must not exceed upstream available pool

Available pool should be derived from:

- previous process cumulative pass quantity
- minus downstream already consumed quantity
- adjusted by approved rework / reverse / correction events where needed

This rule must be enforced in:

- single report
- batch report
- scan report
- outsource return receive

## Financial algorithm rule

Financial calculation should not be based only on the snapshot table.

Long-term financial basis:

- use report events as accounting source
- use nightly or scheduled aggregation into wage summary tables

Current compatibility approach:

- continue using `t_erp_piece_wage` and `t_erp_piece_wage_detail`
- keep monthly auto-generation
- later move generation basis from snapshot summary to event-log summary

### Billing group extension

The idea of `billing_group_id` is valid and should be supported later.

Recommended location:

- add `billing_group_id` to `t_erp_process_route_item`
- optionally add `billing_group_role` or separate config table later if allocation rules become complex

Do not create a parallel `production_routing` model outside the current ERP route structure.

## Quality algorithm rule

Quality logic should also be driven by execution events, not only final inspection results.

Minimum algorithm set:

- per-process defect rate warning
- whole-job cumulative scrap warning
- downstream shortage warning
- release / reject linkage to the same job process snapshot
- reverse trace from finished issue back to report log and responsible process node

Quality responsibility fields should remain compatible with current schema:

- `need_quality_check`
- `qc_required`
- `needle_check_required`

Do not overload `process_type` for quality semantics.

## Outsource rule

Outsource is not a separate universe.

It should remain linked to:

- production job
- process step
- outsource order
- return receive / quality result / settlement result

Near-term approach:

- continue using `t_erp_outsource_order`
- extend dispatch / return / accepted / defect / compensation fields there or through linked detail/event tables

Long-term approach:

- outsource return can also write into `t_erp_produce_report_log` with source `OUTSOURCE_RETURN`

## Print and scan rule

Early-stage production should support paper-first execution.

Required rule:

- paper cards are operational carriers
- system event logs are accounting and trace carriers

Meaning:

- paper card may be handwritten
- clerk may batch scan and batch input later
- system still records one event per effective report action

Read-only QR can be public or semi-public.

Writable execution actions must use signed and time-bound tokens when exposed outside authenticated ERP pages.

## Custom process rule

The process model must support:

- standard required steps
- optional steps
- conditional steps
- inserted temporary steps
- outsourced steps
- rework steps
- skipped steps

Examples that must remain configurable:

- `LIGHT_INSPECTION`
- `PRINT`
- `EMBROIDERY`
- `WASHING`
- `THIRD_PARTY_INSPECTION`
- special finishing

These must be maintained through controlled `ProcessDef` and route items, not free-text page fields.

## Phase implementation order

### Phase A: freeze the long-term model

Deliver:

- this architecture rule set
- confirm snapshot vs event separation
- confirm route / job / report / wage / quality ownership

### Phase B: add report event layer

Deliver:

- `t_erp_produce_report_log`
- backend domain / mapper / service / controller
- `batchReport` API
- single report and batch report validation ownership

### Phase C: strengthen execution governance

Deliver:

- backend pool validation
- abnormal trigger on overflow / high scrap / negative pool
- event-to-snapshot writeback

### Phase D: migrate finance and quality aggregates

Deliver:

- wage summary from report log
- outsource settlement basis from report log + outsource order
- quality trace basis from report log + defect + inspection

### Phase E: scan/mobile evolution

Deliver:

- scan entry
- clerk batch entry
- later supervisor mobile entry
- finally worker self-service where business is ready

## Hard constraints

- no new parallel order/routing/log model that ignores current ERP tables
- no future algorithm should depend only on `t_erp_produce_job_process`
- no frontend page should own final quantity transition logic
- no free-text process identity in reporting
- style identity, sales identity, technical identity, and production identity must remain distinct
- all new process execution rules must stay dictionary-friendly and SQL-friendly

## Immediate next development target

The next most correct implementation target is:

- `t_erp_produce_report_log`
- backend `batchReport` with pool validation
- snapshot writeback
- abnormal trigger baseline

This is the lowest-risk step that protects future finance, quality, and traceability work from a later full rewrite.
