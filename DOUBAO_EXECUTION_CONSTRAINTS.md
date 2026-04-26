# Doubao Execution Constraints

Last updated: 2026-04-25

## Purpose

This file defines how Doubao must be constrained in this project.

The goal is not "faster output".

The goal is:

- executable output
- contract-aligned output
- evidence-backed output
- low-rewrite output

Doubao can continue to be used, but only as a constrained implementer.

It must not be treated as an unconstrained planner or architecture owner.

## Core rule

Doubao is not allowed to claim a task is complete unless it can provide real evidence for that task.

From now on, "compiled" is not equal to "complete".

A task is complete only when:

1. the implementation follows existing project contracts
2. the SQL is executable if SQL is involved
3. the backend path is callable if backend is involved
4. the frontend page is reachable and usable if frontend is involved
5. the output states what is still not complete

## Proactive skill rule

During project execution, the model must proactively use the appropriate skill, plugin, or specialized workflow when the task matches.

This is not optional.

The model must not default to generic coding behavior if a specialized path exists.

Examples:

- use browser validation skills or browser tools for localhost route checks after frontend changes
- use project delivery and validation documents before audited repair work
- use official-doc workflow when the task is specifically about OpenAI product usage

Required behavior:

1. identify whether a relevant skill/plugin exists
2. state which skill/workflow is being used
3. use that skill before making unsupported assumptions
4. include skill-based validation evidence in the report

Forbidden behavior:

- skipping available skill support and guessing
- claiming UI usability without browser-based route validation when the page changed materially
- claiming audited repair completion without using the case-driven validation workflow

## Role positioning

Doubao is suitable for:

- CRUD skeletons under an existing pattern
- bounded field completion
- repetitive page/API alignment work
- low-risk refactor follow-up under an already defined contract

Doubao is not suitable as the primary owner for:

- new SQL phase design without review
- new foundational data model design
- generic component contract extension
- cross-module truth-chain design
- approval / permission / dictionary strategy design
- declaring project stage completion without evidence

For high-risk work, Codex defines the contract first.

Doubao may implement only after the contract is explicit.

## Mandatory delivery template

Every Doubao task must be delivered in this format.

If any section is missing, the task is not accepted.

### 1. Task scope

Must state:

- exact task name
- module name
- whether this is SQL / backend / frontend / doc / mixed
- whether it overlaps active Codex work

Example:

- Task: `OrgUnit base CRUD`
- Module: `system / org unit`
- Type: `SQL + backend + frontend`
- Overlap: `no overlap with wage/event work`

### 2. Alignment basis

Must state which existing files or modules it is following.

At least 2 concrete references are required.

Example:

- backend controller style follows `ProduceJobController.java`
- frontend CRUD style follows `src/pages/warehouse/index.tsx`
- validation style follows `PurchaseController.java`

If no alignment basis is given, the task is not accepted.

### 3. Changed files

Must list:

- created files
- modified files
- deleted files

No vague phrases like "backend completed" are allowed.

### 4. Verification evidence

Must list the actual checks run.

Allowed evidence types:

- SQL execution or dry-run result
- backend compile result
- frontend build result
- route reachability
- one normal-path verification
- one abnormal-path verification
- skill/plugin-based verification if a relevant skill exists

Example:

- backend compile: passed
- frontend build: passed
- route `/production/job-process` reachable
- abnormal path: locked abnormal blocks stock-out confirm

### 5. Known gaps

Must explicitly state:

- what is not wired yet
- what is assumed but not verified
- what still needs Codex review

Without this section, the task is not accepted.

### 6. Progress report

Every non-trivial task must include short progress reporting during execution.

Required checkpoints:

1. start report
2. mid-task report after meaningful discovery or first validation
3. end report with evidence and remaining gaps

Start report must include:

- what is being done
- what contract or case is being followed
- what will be checked first

Mid-task report must include:

- what was learned
- whether the current direction still holds
- whether a blocker or risk appeared

End report must include:

- what changed
- what passed
- what failed
- what remains open

No silent long-running implementation is allowed for audited or high-risk work.

## Mandatory acceptance checklist

Every Doubao-delivered task must pass these checks before it is treated as complete.

### A. SQL acceptance

If the task contains SQL, all of the following must be true:

1. SQL is syntactically executable
2. strings are not corrupted
3. comments do not break statements
4. script is idempotent where possible
5. insertion rules are deduplicated
6. script order is reflected correctly in `sql/README.md`
7. README numbering is unique and consistent

Fail example from this project:

- `phase30_p0_roles_menu_permission.sql` had broken string literals and a missing `SELECT`
- `phase31_p1_org_unit.sql` had broken DDL/comment strings
- `sql/README.md` had duplicated numbering

These are not style issues.

These are delivery-invalidating issues.

### B. Backend acceptance

If the task contains backend code, all of the following must be true:

1. package placement follows existing project ownership
2. domain / mapper / XML / service / controller are complete
3. controller permission annotations exist
4. validation annotations actually take effect
5. mapper XML matches domain fields
6. naming follows existing ERP conventions

Fail example from this project:

- `OrgUnit` domain added validation annotations
- but `OrgUnitController` did not use `@Validated @RequestBody`
- result: validation looked present but did not actually run

This is a false-completion pattern and is not allowed.

### C. Frontend acceptance

If the task contains frontend code, all of the following must be true:

1. route is registered if the page is meant to be reachable
2. i18n keys exist if translation keys are referenced
3. API methods correspond to real backend endpoints
4. page only uses component capabilities that actually exist
5. page can submit real data if it is a form page
6. page does not rely on fake props or unsupported field types
7. browser-based route validation is used when the page is expected to be reachable now

Fail example from this project:

- `src/pages/system/org/index.tsx` used `tree-select`
- `GenericForm.tsx` does not support `tree-select`
- it also passed `beforeSubmit`
- `GenericForm.tsx` does not accept `beforeSubmit`
- route and i18n were also not wired

This means "page file exists" but "module is still not delivered".

### D. Documentation acceptance

If docs are updated, they must reflect real state.

The following are forbidden:

- writing "completed" before executable verification exists
- writing "all checks passed" when only compile/build passed
- writing "feature online" when route or SQL is still broken

## Prohibited behaviors

The following behaviors are not allowed in Doubao output.

### 1. False completion language

Forbidden phrases unless fully evidenced:

- completed
- fully done
- 10/10 passed
- end-to-end closed
- production ready

If only compile/build passed, the correct status is:

- code written
- compile passed
- still pending runtime or business verification

### 2. Unsupported component assumptions

Doubao must not invent capabilities for shared components.

Before using a shared component, it must inspect the component contract.

If capability is missing, it must say so explicitly.

### 3. Cross-layer optimism

Doubao must not claim:

- "backend complete" if SQL is broken
- "page complete" if route is missing
- "validation complete" if controller does not trigger validation
- "RBAC complete" if permission SQL is not executable

### 4. README pollution

Doubao must not append execution-order docs carelessly.

Before changing `sql/README.md`, it must check:

- no duplicated row number
- no duplicated script entry
- sequence remains valid

## Case-based judgment standard

Use the following case questions to decide whether a Doubao result is acceptable.

### Case 1. Can it execute?

Question:

- can SQL really run?

If no:

- task is invalid

Example:

- broken string literals in `phase30` and `phase31`

### Case 2. Can it actually be used?

Question:

- can the user perform the intended action?

If no:

- task is invalid

Example:

- `OrgUnitPage` built successfully
- but parent tree selection and submit preprocessing did not really exist

### Case 3. Is it really connected to the system?

Question:

- is route/menu/i18n/API wiring complete?

If no:

- task is incomplete

Example:

- page file existed
- but route was missing
- translation keys were missing

### Case 4. Does the protection logic really run?

Question:

- are validation / permissions / abnormal locks actually enforced?

If no:

- task is incomplete

Example:

- domain annotations existed
- controller did not use validation trigger

### Case 5. Does the documentation tell the truth?

Question:

- does the progress statement match actual evidence?

If no:

- task is invalid for planning use

## Mandatory case-driven repair loop

When Doubao is repairing an audited issue, it must not respond with a generic "fixed" statement.

It must use the exact audited case as the writing and verification target.

For every audited finding, it must answer in this structure:

1. case id
2. original failure
3. exact file and line area being repaired
4. repair method
5. verification method
6. verification result
7. remaining gap

Template:

```text
Case: F-001
Original failure:
- `phase30_p0_roles_menu_permission.sql` contains broken string literals and cannot execute

Repair scope:
- file: `sql/phase30_p0_roles_menu_permission.sql`
- area: role inserts + inspection company role-menu insert

Repair method:
- rewrite broken string literals
- restore missing SELECT clause
- check all role inserts for quote integrity

Verification:
- SQL syntax reviewed line by line
- actual execution or dry-run performed

Result:
- pass / fail

Remaining gap:
- if execution was not run against DB, explicitly state that
```

If this structure is missing, the repair is not accepted.

## Real project cases Doubao must learn from

These cases are not examples only.

They are permanent constraints for future tasks.

### Case F-001: SQL string corruption is a delivery blocker

Observed in this project:

- `sql/phase30_p0_roles_menu_permission.sql`

Failure pattern:

- script looked long and complete
- compile/build elsewhere passed
- but SQL itself still had broken string literals and a missing `SELECT`

Rule extracted:

- no SQL script may be marked completed without script-level verification
- "I added one missing line" is not enough if the file still contains damaged literals

### Case F-002: DDL is not complete until the table can really be created

Observed in this project:

- `sql/phase31_p1_org_unit.sql`

Failure pattern:

- Java and frontend files existed
- but DDL still contained broken comment strings and invalid inserts

Rule extracted:

- if table creation is not verified, the whole module remains incomplete
- downstream Java/frontend work does not rescue broken DDL

### Case F-003: Shared component contracts may not be imagined

Observed in this project:

- `src/pages/system/org/index.tsx`
- `src/components/ui/GenericForm.tsx`

Failure pattern:

- page used `tree-select`
- page passed `beforeSubmit`
- shared component supported neither

Rule extracted:

- before using a shared component, Doubao must inspect the actual component contract
- unsupported props or field types are forbidden

### Case F-004: Route and i18n are part of feature completion

Observed in this project:

- `src/pages/system/org/index.tsx`
- `src/router.tsx`
- `src/i18n/index.ts`

Failure pattern:

- page file existed
- route was not wired
- i18n keys were missing

Rule extracted:

- a frontend module is incomplete if users cannot reach it
- a page using missing translation keys is not accepted as complete
- frontend route checks should use browser validation, not only build output

### Case F-005: Validation annotations are fake unless the controller triggers them

Observed in this project:

- `ruoyi-admin/.../orgunit/domain/OrgUnit.java`
- `ruoyi-admin/.../orgunit/controller/OrgUnitController.java`

Failure pattern:

- domain used validation annotations
- controller initially did not trigger validation

Rule extracted:

- validation claims are accepted only when controller wiring matches existing validated controllers

## Repair acceptance examples

Use these examples to judge future Doubao repairs.

### Bad repair statement

```text
已修复 SQL 语法问题，新增了缺失的 SELECT。
```

Why rejected:

- does not prove the whole file is executable
- does not say whether other broken literals still remain
- does not contain verification evidence

### Good repair statement

```text
Case: F-001
Repair scope:
- `sql/phase30_p0_roles_menu_permission.sql`

Repair:
- fixed missing SELECT in inspection-company block
- rechecked all role-name string literals

Verification:
- line-by-line SQL review completed
- dry-run execution still not performed

Result:
- partial fix only

Remaining gap:
- broken string literals still exist in multiple INSERT statements
- task must remain open
```

Why accepted:

- it tells the truth
- it shows whether the repair is partial or complete
- it avoids false completion

## Persistent restart rule

These constraints must survive shutdown, model switching, and conversation compaction.

Therefore:

1. this file must remain in repo root
2. this file must be referenced from project index docs
3. every future model must read this file before continuing audited repair work
4. every audited repair batch must update progress only after checking against this file
5. every audited repair batch should also use:
   - `DOUBAO_VALIDATION_CASES.md`
   - `VERIFY_DOUBAO_REPAIR_CASES.ps1`
6. if frontend pages are involved, browser-based validation must be attempted and reported

## Restart protocol for any model

After restart, the model must do these steps before coding:

1. read `DOUBAO_EXECUTION_CONSTRAINTS.md`
2. read `DOUBAO_VALIDATION_CASES.md`
3. run or inspect `VERIFY_DOUBAO_REPAIR_CASES.ps1`
4. read `MODULE_DELIVERY_MASTER_PLAN.md`
5. read `PROJECT_PROGRESS.md`
6. read current audited findings or unresolved issue list
7. state whether the next task is:
   - fresh development
   - audited repair
   - evidence completion
8. identify which skill/plugin/workflow will be used proactively

If the task is an audited repair, the model must use the case-driven repair loop above.

## Progress-writing rule

When the machine is shut down or the thread is resumed later, future models must not rely on memory alone.

Any important audit conclusion must be written into repo documents.

At minimum:

- audited blocker
- current true status
- next required verification

If it is not written, it is not protected against restart loss.

## Required prompt for Doubao

Use this exact instruction when assigning future tasks to Doubao.

```text
You are working under evidence-driven delivery constraints.

You must not call a task complete unless you can prove it with concrete evidence.

For every task, you must provide:
1. exact task scope
2. alignment basis (existing files/modules you followed)
3. changed files
4. verification evidence
5. known gaps

Rules:
- compile/build alone is not enough to claim completion
- if SQL is involved, verify SQL executability or explicitly mark it unverified
- if frontend is involved, route reachability and real form usability must be checked
- if backend validation is claimed, controller-triggered validation must be verified
- do not assume shared components support new field types or props; inspect first
- do not update progress docs with “completed” unless the above evidence exists

If anything is unsupported, unclear, or unverified, say so explicitly instead of pretending the module is complete.
```

## Simple execution policy

Use this lightweight policy going forward.

### Green tasks: Doubao can do directly

- existing-page field alignment
- existing CRUD extension under a proven pattern
- low-risk API wrapper creation
- repetitive mapper/domain/controller scaffolding under a checked contract

### Yellow tasks: Doubao can do after Codex defines the contract

- new module CRUD
- new SQL phase script
- new dictionary type
- new route and page
- permission and menu backfill

### Red tasks: Codex should lead

- foundational schema changes
- event/snapshot/source-truth design
- generic component extension
- cross-module cost/settlement logic
- approval architecture
- abnormal governance architecture

## Final rule

Doubao is useful when constrained.

Without constraints, its biggest risk is not "bad code".

Its biggest risk is producing believable but non-executable progress.

That is exactly what this file is designed to prevent.
# DoubaoCode 执行约束

本文件受 `AI_COLLABORATION_RULES.md` 约束。DoubaoCode 的所有输出必须先满足项目 AI 协作总则，再满足本文的模型专项约束。

DoubaoCode 不得使用自我声明作为完成证据。任何“已完成”“已修复”“已通过”都必须附带可复跑命令和 PASS 结果。
