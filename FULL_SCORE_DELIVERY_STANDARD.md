# Full Score Delivery Standard

Last updated: 2026-04-25

## Purpose

This project target is not "usable ERP".

The target is:

- business: 100
- purchase: 100
- production: 120
- finance: 100
- project landing: 100

Production is intentionally rated above 100 because factory execution must absorb real-world variation:

- inserted processes
- skipped processes
- rework
- outsource
- third-party inspection
- Japan-order quality requirements
- paper execution
- scan execution
- batch clerk entry
- future mobile worker reporting

## Scoring principle

A module is not full score because it has a page.

A module reaches full score only when it has:

- correct business ownership
- complete source linkage
- dictionary-driven statuses
- SQL schema and indexes
- domain / mapper / service / controller closure
- frontend API and page closure
- print / scan / approval linkage where needed
- real backend verification
- abnormal path handling
- future migration path

## Business 100

Business means the system respects the full upstream order chain.

Must satisfy:

- customer style and sales order are separate identities
- sales order locks customer, style, color, size, quantity, delivery, and Japan-order requirements
- removed sales details, sample BOM, and print drawing information must be restored or replaced by equal business fields
- sales data flows downstream without repeated manual entry
- source fields become readonly after downstream documents are generated
- approval and change history exist for important changes
- print outputs preserve customer-facing and internal production information
- Chinese / Japanese labels are available for high-frequency business pages

Full-score result:

- sales can place, review, print, trace, and hand off a real order without losing business detail.

## Purchase 100

Purchase must protect material availability, price control, and supplier responsibility.

Must satisfy:

- purchase demand derives from sales / BOM / plan where applicable
- material, color, spec, unit, supplier, price, and delivery are structured fields
- purchase order has header and item detail
- supplier selection is controlled, not free text
- safe stock and shortage warning exist
- purchase receive links to inventory stock-in
- supplier rating can consume quality, delivery, and price data later
- purchase changes preserve source linkage and approval records

Full-score result:

- purchasing knows what to buy, why to buy, when to arrive, who supplies it, and whether it actually arrived.

## Production 120

Production must exceed the current page requirement and become the core factory execution engine.

Must satisfy 100-point baseline:

- production plan inherits locked sales and technical truth
- production job inherits plan and route template
- job process snapshot is copied from route template
- process definition supports add / edit / disable
- route item supports order, optional, conditional, outsource, QC, needle check, loss tracking, and wage applicability
- formal processes include light inspection
- processes such as print, embroidery, washing, special finishing, and third-party inspection are configurable
- reporting validates quantity and status transition in backend service layer
- quality release shares the same job process truth
- defect data is structured and traceable
- production progress and product trace consume real backend data

Must satisfy extra 20-point future-proofing:

- add `t_erp_produce_report_log` event layer
- support paper batch entry, scan entry, mobile entry, outsource return, rework, and correction events
- implement pool validation from event and snapshot data
- implement event-to-snapshot writeback
- support billing group configuration for merged piece-rate calculation
- support per-process card or QR where needed
- support abnormal trigger from overflow, high loss, failed QC, overdue, and negative pool
- keep production reporting compatible with future mobile worker reporting

Full-score result:

- production can handle sweater, knit shirt, mixed factory, outsource, inserted process, Japan inspection, and future scan reporting without model rewrite.

## Finance 100

Finance must calculate money from operational truth, not from manual re-entry.

Must satisfy:

- piece wage derives from process report events and approved snapshots
- wage detail can trace back to job, process, employee, and report source
- billing group supports merged process settlement
- defect, scrap, rework, and penalty rules are configurable
- outsource payable derives from dispatch / return / accepted / defect records
- invoice and payment documents link to upstream business documents
- finance-visible fields are permission controlled
- monthly generation is repeat-safe and auditable
- manual adjustment requires reason and operator record

Full-score result:

- finance can explain every yuan paid or deducted from the original production or outsource event.

## Project Landing 100

Landing means the system can be used by a real small factory without special hardware or a large IT team.

Must satisfy:

- A4 paper flow is supported from day one
- clerk batch entry is fast and keyboard-friendly
- mobile scan pages are lightweight and permission-aware
- anonymous QR pages are readonly and do not leak sensitive data
- write actions require login or signed limited token
- backend compiles
- frontend builds
- database migration is repeat-safe
- dictionary seed is repeat-safe
- permissions and menus are included with module SQL
- every delivered module has smoke verification notes
- failures are recorded in `PROJECT_ISSUES.md`
- progress is recorded in `PROJECT_PROGRESS.md`

Full-score result:

- the system can be deployed, used, tested, explained, and continued by another developer without guessing the business intent.

## Non-negotiable architecture constraints

- Do not collapse style, sales order, production job, and process identity into one field.
- Do not make `t_erp_produce_job_process` carry every execution event.
- Do not create a parallel production model that ignores existing ERP tables.
- Do add an execution event layer for report logs.
- Do keep snapshot records for fast screens and current status.
- Do keep event records for accounting, traceability, validation, and future AI.
- Do keep dictionaries as stable business codes, not display labels.
- Do keep ERP backend code in `ruoyi-admin/com/ruoyi/erp`.

## Immediate upgrade required for full-score path

The next implementation block must be:

- SQL for `t_erp_produce_report_log`
- dictionary seeds for report source / report type / validation status
- backend domain / mapper / service / controller
- `singleReport` and `batchReport` APIs
- pool validation
- event-to-snapshot writeback
- abnormal trigger baseline
- frontend compatibility with existing process report page

This block is the bridge from current good foundation to full-score architecture.
