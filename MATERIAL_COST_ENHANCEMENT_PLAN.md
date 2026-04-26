# Material Cost Enhancement Plan

Last updated: 2026-04-25

## Current assessment

`ProduceMaterialConsume` already provides a useful starting point:

- material identity
- BOM theoretical quantity
- actual quantity
- standard loss rate
- actual loss quantity
- over-limit approval

This is good enough for basic material overuse control.

It is not yet enough for lean cost attribution because it still sits mainly at `producePlanId` level.

## Current gap

To become a real lean cost foundation, material consumption must also support:

- `job_id`
- `job_process_id`
- `report_log_id`
- `batch_no`
- `warehouse_id`
- `stock_out_id`
- `material_type` (`MAIN`, `AUXILIARY`)
- `unit_price`
- `theoretical_cost`
- `actual_cost`
- `cost_diff`

Without these fields:

- we can know there was excess consumption
- but we cannot reliably attribute it to a specific production job, process step, batch, or event

## Recommended next upgrade

### Phase M1: execution linkage

Add:

- `job_id`
- `job_process_id`
- `report_log_id`
- `batch_no`

Purpose:

- tie material consumption to the actual execution chain
- enable process-level material loss analysis

### Phase M2: warehouse linkage

Add:

- `warehouse_id`
- `stock_out_id`

Purpose:

- connect planned consumption to actual issue-out records
- make material cost traceable to inventory movement

### Phase M3: cost attribution

Add:

- `material_type`
- `unit_price`
- `theoretical_cost`
- `actual_cost`
- `cost_diff`

Purpose:

- let material overuse become cost variance, not only quantity variance

## Priority rule

The order should be:

1. event-layer report log
2. material execution linkage
3. material cost attribution
4. cross-cost aggregation with wage / outsource / freight

This keeps the model stable and avoids calculating cost on top of weak source linkage.

## Round update on 2026-04-25

- Backend execution-cost attribution has been implemented for `ProduceMaterialConsume`.
- Added SQL draft:
  - `D:\erp\RuoYi-Vue\sql\phase28_material_consume_execution_cost.sql`
- Added execution attribution fields:
  - `job_id`
  - `job_process_id`
  - `report_log_id`
  - `batch_no`
  - `material_type`
  - `unit_price`
  - `theoretical_cost`
  - `actual_cost`
  - `cost_diff`
- Backend service now derives:
  - limit quantity
  - actual loss
  - over-limit flag
  - approval fallback status
  - theoretical cost
  - actual cost
  - cost variance
- Validation completed:
  - backend `mvn -pl ruoyi-admin -am -DskipTests compile` passed

- Frontend visibility baseline added:
  - `src/api/produceMaterialConsume.ts`
  - `src/pages/production/job-process/report.tsx`
- Process reporting page now shows:
  - actual consumption quantity
  - actual cost
  - theoretical cost
  - cost variance
  - actual material loss
  - over-limit count
  - pending approval count
  - recent consume lines for current job / process
- Validation completed:
  - frontend `npm run build` passed

- Current interpretation:
  - enough for execution-side cost signal
  - not yet enough for full landed-cost settlement
  - next hard requirement remains warehouse / stock-out linkage and automatic consume generation from execution events
