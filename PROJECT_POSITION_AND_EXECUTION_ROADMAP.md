# Project Position And Execution Roadmap

Last updated: 2026-04-25

## Purpose

This document gives one stable control view for:

- current project position
- full business-process linkage
- module completion level
- dependency order
- execution sequence
- quality gate

It is intentionally written without tool-provider or model-provider details.

## Current project position

The project is no longer at page-prototype stage.

It is now at:

- source-chain correction completed in core modules
- production execution foundation materially established
- event-layer architecture introduced
- execution-cost visibility started
- full cost closure not yet completed

In practical terms:

- sales -> plan -> job source locking is already corrected
- process definition and route customization are already governed
- custom process insertion / skip / rework is already supported
- process reporting now writes into report-event layer
- job-process snapshot remains the fast execution state layer
- material consume has started moving from plan-only to execution-attributable cost signal

## Project stage interpretation

The project is currently between:

1. production execution truth establishment
2. lean-cost base establishment

It is not yet at:

- full settlement closure
- full warehouse-cost closure
- full abnormal auto-trigger closure
- full end-to-end production finance closure

## End-to-end business chain

The intended business chain is:

1. customer and style identity
2. sales order locking
3. sample / technical / BOM release
4. production plan generation
5. production job generation
6. process route snapshot initialization
7. process execution reporting
8. quality release / reject
9. outsource dispatch / return where applicable
10. material issue and execution consumption
11. warehouse in / out and finished goods movement
12. abnormal capture and closure
13. piece wage / outsource / invoice / cost settlement

## Core production data layers

The system now follows three-layer production ownership:

### 1. Source document truth

Used for:

- customer requirement
- style identity
- sales quantity and delivery
- technical and BOM baseline
- plan and job source inheritance

Main examples:

- sales order
- sample / technical notice
- BOM
- production plan
- production job

### 2. Execution event truth

Used for:

- each report action
- correction and rework behavior
- outsource return event
- future batch entry / scan / mobile reporting
- wage and trace source

Main example:

- `t_erp_produce_report_log`

### 3. Execution snapshot truth

Used for:

- current process state
- fast list page rendering
- current cumulative in / out / defect / loss
- current job execution status

Main example:

- `t_erp_produce_job_process`

## Process linkage map

The most important process linkage is:

1. `ProcessDef`
2. `ProcessRoute`
3. `ProcessRouteItem`
4. `ProduceJob`
5. `ProduceJobProcess`
6. `ProduceReportLog`
7. `ProduceDefect`
8. `QcInspection`
9. `PieceWage / Outsource / Abnormal`

Meaning:

- `ProcessDef` defines what a controlled process is
- `ProcessRoute` decides standard route by product family / condition
- `ProduceJobProcess` is copied snapshot per job
- `ProduceReportLog` records each effective execution action
- `ProduceDefect` holds defect detail
- `QcInspection` releases or rejects process result
- settlement and abnormal modules consume the same execution truth

## Current module completion view

### A. Strongly established

- sales -> plan -> job source locking
- process definition
- process route editor
- route conditional-step governance
- light inspection formal process governance
- job-process inserted / skipped / rework support
- process reporting main page
- report-event backend baseline
- defect backend baseline
- style progress and product trace query baseline
- dictionary governance recovery

### B. Established but still needs closure

- quality inspection / release
- outsource execution
- print / scan linkage
- multilingual cleanup across business pages
- material consume execution-cost baseline

### C. Not yet fully closed

- inventory execution full-chain linkage
- abnormal pool end-to-end closure
- material consume automatic generation from execution
- warehouse issue-out to consume linkage
- piece wage event-based settlement
- outsource settlement event-based settlement
- freight and landed-cost aggregation
- final finance-visible full cost dashboard

## Completion rating

Current working rating:

- business chain integrity: `88`
- purchase readiness: `74`
- production execution: `90`
- finance readiness: `68`
- project landing: `91`
- lean-cost foundation: `76`

## Why the current state is reasonable

The current architecture is reasonable because:

- it no longer mixes source truth and execution truth into one page flow
- it no longer treats process route as static hardcoded UI
- it no longer depends only on snapshot rows for future finance
- it already supports real factory variability:
  - optional process
  - inserted process
  - skipped process
  - rework
  - outsource
  - light inspection

## Why the current state is not yet full-score

The current state is still below full-score because:

- material issue and execution consume are not fully auto-linked
- inventory truth is not yet fully tied into execution events
- wage and outsource settlement are not yet fully based on event truth
- abnormal pool has not yet absorbed enough real auto-trigger logic
- cost composition is visible in part, not yet closed as one chain

## Process dependency order

The safest dependency order is:

1. source lock
2. process governance
3. execution event ownership
4. quality ownership
5. outsource ownership
6. inventory ownership
7. material consume ownership
8. abnormal ownership
9. wage and settlement ownership
10. full cost aggregation

## Recommended development order from now

### Order 1: inventory execution closure

Reason:

- inventory is the physical bridge between purchase and production
- without stock-out linkage, material cost remains semi-floating
- finished goods stock-in also affects downstream trace and shipment trust

Must include:

- stock in / stock out backend closure review
- item detail linkage review
- source-reference review
- warehouse truth review
- execution-side verification

### Order 2: material consume auto-linkage

Reason:

- this is the key bridge from production events to lean cost
- current visibility is already in place
- now the source of those records must become reliable

Must include:

- generate or attach consume records from issue-out and/or report events
- add warehouse and stock-out linkage
- preserve job / job process / report log linkage

### Order 3: abnormal pool closure

Reason:

- once execution and material start producing real signals, abnormal pool becomes useful
- it is the system outlet for overflow, over-loss, overdue, reject, and shortage

Must include:

- manual abnormal CRUD
- source business linkage
- auto-trigger baseline
- close-loop handling

### Order 4: piece wage event-based strengthening

Reason:

- wages should not stay on weak snapshot-only basis
- current production model already supports future wage correctness

Must include:

- report-event based aggregation
- billing-group preparation
- trace back to job / process / employee / source

### Order 5: outsource settlement strengthening

Reason:

- knitwear factories often rely on outsource
- outsource truth must link dispatch, return, accepted quantity, defect, and payable

### Order 6: unified cost rollup

Reason:

- only after execution, inventory, material, wage, outsource are stable
- then total cost can be trusted

Must include:

- material
- piece wage
- outsource
- freight
- rework
- defect / scrap / loss

## Cross-module linkage rules

### Sales to plan

- plan must inherit locked sales truth
- downstream must not re-enter style and quantity casually

### Plan to job

- job must inherit plan truth
- route selection must be controlled

### Job to process

- job process snapshot must come from route template
- later inserted process must keep reason

### Process to quality

- quality must release the same process truth that reporting writes

### Process to material

- material consume must eventually bind to actual execution context

### Process to wage

- wage must eventually aggregate from event truth

### Process to abnormal

- overflow, high loss, reject, and shortage should trigger abnormal records

### Inventory to cost

- issue-out and receive records must feed cost truth

## Development sequence calculation rule

Development order should be calculated by:

1. whether the module is upstream truth
2. whether downstream modules already depend on it
3. whether it reduces future rewrite risk
4. whether it creates real production trust quickly
5. whether it enables later cost correctness

By this rule:

- process governance came before advanced settlement
- report-event layer came before full wage refactor
- execution material visibility came before cost dashboard

This is correct and should continue.

## Quality gate

Each new module or module-extension must pass:

1. dictionary ownership is clear
2. SQL ownership is clear
3. domain / mapper / service / controller closure is real
4. frontend API is real
5. frontend page uses real backend data
6. build / compile passes
7. one normal path is verified
8. one abnormal path is verified
9. source linkage is preserved
10. no duplicate manual-entry field is introduced without business reason

## Current recommended next milestone

The next milestone should be:

- execution-to-cost closure baseline

Meaning:

- close inventory execution
- bind material consume to execution and stock-out
- close abnormal pool around real execution events

This milestone will lift:

- production execution from `90` to around `95`
- lean-cost foundation from `76` to around `85`
- finance readiness from `68` to around `78`

## Final interpretation

The project is on a correct architectural path.

It is already beyond simple UI restoration and has entered structured ERP/MES rebuilding.

The key from now is not adding more pages faster.

The key is:

- keep every new module on the same truth chain
- finish physical-execution linkage
- then finish settlement and total-cost linkage

## Updated position on 2026-04-25 (after wage frontend alignment)

Current position:

- sales / plan / job / process backbone: established
- report event truth: established and already feeding wage generation
- inventory to material-consume baseline: established
- abnormal pool as write gate: partially established
- finance wage summary UI: aligned to backend truth
- unified settlement and total-cost closure: not yet established

Current stage judgment:

- the project is no longer in page-restoration stage
- it is in the mid-stage of truth-chain tightening
- the core risk is no longer missing pages
- the core risk is partial linkage that allows downstream actions before upstream truth is fully closed

Next development order should be:

1. stock-in to production-completion linkage
2. material consume from job-process binding toward report-event binding
3. outsource settlement event tightening
4. wage payout governance and finance close actions
5. unified cost rollup across material, wage, outsource, freight, and quality loss

Why this order is still optimal:

- stock-in closure is the next missing physical truth edge after stock-out closure
- report-event attribution improves cost precision before total-cost reporting
- outsource and wage settlement should be tightened only after execution truth is reliable enough
- total-cost rollup should remain late, because it is a dependent layer rather than a source-truth layer
