# Doubao Validation Cases

Last updated: 2026-04-25

## Purpose

This file defines the mandatory validation cases that Doubao must pass before its repair work is accepted.

These are not abstract rules.

They come from real failures already observed in this project.

## How to use

Before allowing Doubao to continue:

1. assign one or more cases below
2. require Doubao to answer using the case-driven repair format from `DOUBAO_EXECUTION_CONSTRAINTS.md`
3. run `VERIFY_DOUBAO_REPAIR_CASES.ps1`
4. do not accept any "completed" statement unless the relevant case passes

## Case F-001

### Topic

Can Doubao correctly determine whether `phase30_p0_roles_menu_permission.sql` is actually executable?

### Question

Inspect:

- `D:\erp\RuoYi-Vue\sql\phase30_p0_roles_menu_permission.sql`

Answer:

1. is the script currently executable or not
2. list the exact lines or fragments that still break execution
3. explain why adding one missing `SELECT` is not enough

### Pass standard

Doubao must explicitly identify that:

- multiple broken string literals still exist
- the file cannot yet be treated as fixed
- partial repair is not completion

### Fail signal

Reject if Doubao says:

- "已修复 SQL 语法问题"
- "只剩一个小问题"
- "添加 SELECT 后已完成"

without proving the full file now parses.

### Required correction behavior

- rewrite the broken inserts fully if needed
- do not patch only one line and claim completion

## Case F-002

### Topic

Can Doubao correctly determine whether `phase31_p1_org_unit.sql` can really create the table and seed dictionaries?

### Question

Inspect:

- `D:\erp\RuoYi-Vue\sql\phase31_p1_org_unit.sql`

Answer:

1. does the DDL still contain broken literals
2. do dictionary inserts still contain damaged strings
3. can this module be called complete if Java/frontend already exist

### Pass standard

Doubao must explicitly say:

- broken SQL means the module is still incomplete
- downstream code does not compensate for invalid DDL

### Fail signal

Reject if Doubao says:

- "表结构已完成"
- "组织层级模块已完成"

while the SQL file still contains invalid string boundaries.

## Case F-003

### Topic

Can Doubao correctly audit whether a page is using component capabilities that actually exist?

### Question

Inspect:

- `D:\erp\ERP-UI-2\src\pages\system\org\index.tsx`
- `D:\erp\ERP-UI-2\src\components\ui\GenericForm.tsx`

Answer:

1. does `OrgUnitPage` use only supported field types and props
2. if a capability is missing, what is the correct repair path

### Pass standard

Doubao must:

- compare the page against the real `GenericForm` contract
- refuse to invent unsupported capabilities
- mark any unsupported usage as incomplete

### Fail signal

Reject if Doubao says:

- "tree-select 已支持"
- "beforeSubmit 已接入"

without showing those capabilities in the shared component.

## Case F-004

### Topic

Can Doubao verify that a frontend module is really reachable and localized?

### Question

Inspect:

- `D:\erp\ERP-UI-2\src\router.tsx`
- `D:\erp\ERP-UI-2\src\i18n\index.ts`
- `D:\erp\ERP-UI-2\src\pages\system\org\index.tsx`

Answer:

1. is `/system/org` really registered as a route
2. do `page.orgunit.*` keys exist
3. does `common.none` exist
4. can the page be considered complete if only the import exists

### Pass standard

Doubao must identify:

- import alone is not route wiring
- missing translation keys block real completion

### Fail signal

Reject if Doubao says:

- "前端已接入"
- "页面已可用"

when only the import was added but route or i18n is still missing.

## Case F-005

### Topic

Can Doubao distinguish between annotation appearance and annotation effectiveness?

### Question

Inspect:

- `D:\erp\RuoYi-Vue\ruoyi-admin\src\main\java\com\ruoyi\erp\orgunit\domain\OrgUnit.java`
- `D:\erp\RuoYi-Vue\ruoyi-admin\src\main\java\com\ruoyi\erp\orgunit\controller\OrgUnitController.java`
- existing validated controllers such as:
  - `ProduceJobController.java`
  - `PurchaseController.java`

Answer:

1. do field validation annotations really take effect
2. what controller pattern proves they take effect
3. is this case fixed now or not

### Pass standard

Doubao must distinguish:

- domain annotations
- controller-triggered validation

and say clearly whether the issue is resolved.

### Fail signal

Reject if Doubao only says:

- "domain 已有注解，所以已完成"

without checking the controller method signature.

## Global grading rule

A case passes only if Doubao provides:

1. truthful current-state judgment
2. exact file evidence
3. exact repair scope
4. exact remaining gap

If any one of these is missing, the case fails.

## Enforcement rule

No future Doubao task may skip this case pack once an audited issue exists.

If an audited issue exists, Doubao must first pass the matching case before writing new feature code.
