# Process Route Customization Plan

Last updated: 2026-04-25

## Purpose

This document fixes the process-modeling rule for the knitwear ERP / MES project.

The factory route must not be treated as a fixed hardcoded sequence. A knitwear order can add, skip, outsource, or repeat steps depending on product family, customer requirement, material behavior, Japan-order inspection rules, and factory reality.

The system must support:

- adding process definitions from the frontend
- maintaining route templates by product / customer / style version
- inserting actual job-level process steps with traceable reason
- treating `照灯 / 灯检` as a formal quality-related process node

## Core Decision

Process data has three layers:

1. `ProcessDef`: the controlled process master library.
2. `ProcessRoute`: reusable route template and ordered route items.
3. `ProduceJobProcess`: the actual process snapshot for one production job.

Rules:

- no free-text process names in reporting pages
- new processes must first be added to `ProcessDef`
- route templates can choose and order `ProcessDef` rows
- production jobs copy route items into `ProduceJobProcess`
- job-level inserted steps must record source, reason, operator, and approval / review status when required

## Required Formal Process: Light Inspection

`照灯 / 灯检` must be added as a standard process definition.

Recommended seed:

- process code: `LIGHT_INSPECTION`
- process name: `照灯/灯检`
- process type: `QUALITY` or `FINISHING_QC`
- workshop type: `INSPECTION`
- quality required: yes
- piece wage applicable: configurable
- loss tracked: yes when defects are found
- outsource allowed: normally no, unless inspection company handles it
- default placement: after finishing / pressing and before hangtag, needle detection, packing, or final OQC

Business reason:

- Japan-order and high-quality knitwear often need stricter visible-defect control.
- Light inspection catches holes, stains, yarn defects, color shading, thin spots, skipped stitches, linking defects, and post-finishing issues that normal table inspection can miss.
- If this step is not recorded, quality cost and rework responsibility become invisible.

## Route Placement Guidance

### Sweater / 毛衫

Recommended default:

```
横机织片 -> 查片/织片检验 -> 套口 -> 水洗/定型 -> 初检 -> 锁眼/钉扣/钉标 -> 整烫 -> 照灯/灯检 -> 吊牌 -> 检针 -> 包装 -> 成品检验/OQC -> 入库/出货
```

Optional variations:

- add `印花` after panel / body preparation when print is required
- add `绣花` after panel / body preparation or before final assembly depending on embroidery method
- add third-party inspection before shipment for Japan-order customer requirements
- add rework route after failed inspection

### Splicing / 拼接款

Recommended default:

```
织片/布片准备 -> 套口/局部成型 -> 拼接/缝制 -> 水洗/定型 -> 中查 -> 整烫 -> 照灯/灯检 -> 检针 -> 包装 -> OQC
```

Optional variations:

- insert `绣花`, `印花`, `特种工艺`, or `外发加工` based on style requirement
- add extra inspection before and after outsource return

### Regular Knit Garment / 普通针织衫

Recommended default:

```
面辅料准备 -> 裁剪 -> 缝制 -> 整烫 -> 照灯/灯检 -> 检验 -> 检针 -> 包装
```

Optional variations:

- add washing / enzyme wash / special finishing when needed
- add inspection company booking for Japan-order shipment release

## Required Data Model Extensions

### ProcessDef

Existing fields should be preserved. Required extension fields:

- `product_family`
- `workshop_type`
- `qc_required`
- `needle_check_required`
- `piece_wage_applicable`
- `loss_tracked`
- `default_work_center_id`
- `standard_cycle_hours`
- `enable_outsource`
- `status`

Frontend requirement:

- provide a process definition page or tab with add / edit / disable
- process code must be unique
- disabled processes cannot be selected for new route templates
- existing historical job snapshots must remain readable

### ProcessRouteItem

Required extension fields:

- `required_mode`: `REQUIRED / OPTIONAL / CONDITIONAL`
- `condition_code`: examples `HAS_PRINT`, `HAS_EMBROIDERY`, `JAPAN_ORDER`, `NEED_LIGHT_INSPECTION`, `THIRD_PARTY_INSPECTION`
- `qc_required`
- `needle_check_required`
- `loss_tracked`
- `piece_wage_applicable`
- `default_work_center_id`
- `allow_insert_before`
- `allow_insert_after`

Frontend requirement:

- add step from `ProcessDef`
- insert before / after selected step
- drag or controlled reorder
- mark outsource, QC, control point, optional, conditional
- publish / freeze route version before production job initialization

### ProduceJobProcess

Required extension fields:

- `process_seq`
- `source_route_item_id`
- `is_inserted`
- `insert_reason`
- `is_skipped`
- `skip_reason`
- `is_rework`
- `rework_source_process_id`
- `outsourcing_order_id`
- `qc_required`
- `needle_check_required`
- `loss_tracked`

Rules:

- production job initialization must map route item `sort_order` to job process `process_seq`
- job-level route changes after release must be audited
- inserted `照灯/灯检`, `印花`, `绣花`, or outsource steps must be visible in process flow, reporting, quality release, print, scan, and trace pages

## Dictionary Requirements

Required dict types:

- `erp_process_type`
- `erp_product_family`
- `erp_workshop_type`
- `erp_route_publish_status`
- `erp_route_item_required_mode`
- `erp_route_condition_code`
- `erp_qc_stage`
- `erp_process_status`

Required dict examples:

- `QUALITY`
- `FINISHING_QC`
- `REQUIRED`
- `OPTIONAL`
- `CONDITIONAL`
- `HAS_PRINT`
- `HAS_EMBROIDERY`
- `JAPAN_ORDER`
- `NEED_LIGHT_INSPECTION`
- `THIRD_PARTY_INSPECTION`

## Implementation Order

1. Add / verify dictionary SQL for process type, route status, required mode, and condition code.
2. Add `LIGHT_INSPECTION` seed data to `t_erp_process_def`.
3. Extend `ProcessDef` full stack fields and frontend add / edit / disable page.
4. Extend `ProcessRouteItem` full stack fields and route editor UI.
5. Fix job initialization so route `sort_order` becomes job `process_seq`.
6. Add controlled job-level step insertion with reason and audit trail.
7. Verify process reporting, quality release, print, scan-back, style progress, and product trace all show inserted steps.

## Acceptance Criteria

This plan is complete only when:

- a user can add a new process definition from the UI
- `照灯/灯检` exists as selectable master data
- route templates can include `照灯/灯检`
- production job process snapshots preserve `照灯/灯检`
- process reporting can report quantity, defect, loss, and operator for `照灯/灯检`
- quality release can pass / fail `照灯/灯检`
- print and QR scan can route back to the exact job process
- style progress and product trace show the actual route, not only the original template
- backend compile and frontend build pass
- live database smoke test passes with at least one sweater job containing `照灯/灯检`
