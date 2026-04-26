# ERP Engineering Baseline

Last updated: 2026-04-25

## Purpose

This file defines the code rules for ERP module delivery.

It is intentionally concrete.

Every module must follow the existing project style before inventing new patterns.

## One-module delivery chain

A module is incomplete if any required layer is missing.

Standard delivery chain:

1. dictionary
2. SQL
3. domain
4. mapper
5. mapper XML
6. service
7. controller
8. frontend API
9. frontend page
10. route/menu/i18n
11. approval/print/scan linkage, when relevant
12. validation evidence

## SQL rules

SQL phase scripts must be:

- executable
- idempotent where possible
- ordered in `sql/README.md`
- free of broken string literals
- free of duplicate README sequence rows
- explicit about dictionary ownership

Do:

- use `INSERT ... SELECT ... WHERE NOT EXISTS` or a safe equivalent for seed data
- use helper procedures when the project already uses them
- keep role/menu backfill scripts easy to re-run

Do not:

- mark SQL complete without SQL-specific validation
- rely on Maven or frontend build as SQL evidence
- append duplicate rows to `sql/README.md`
- leave damaged non-ASCII literals that break quotes

## Backend rules

ERP business code must live under `com.ruoyi.erp` ownership.

Do:

- follow existing RuoYi controller/service/mapper style
- use `@PreAuthorize` on controller endpoints
- use `@Validated @RequestBody` when domain validation annotations are intended to run
- put business checks in service layer
- keep mapper XML fields aligned with domain fields
- use transactions for multi-write business operations

Do not:

- place ERP business code under `ruoyi-system`
- claim validation works because domain annotations exist
- put complex business rules only in controller
- create duplicate entities when a domain already exists

## Frontend rules

Frontend pages must use existing component contracts.

Do:

- inspect shared components before using new props or field types
- register routes for reachable pages
- add i18n keys for visible labels
- keep frontend API paths aligned to backend endpoints
- use dictionary hooks for status/type/level fields

Do not:

- use unsupported `GenericForm` field types
- pass props a component does not accept
- claim a page is complete because the file exists
- claim build success proves the workflow is usable

## Dictionary rules

Status, type, level, and business category fields should be dictionary-driven when they are user-visible or reused.

Do:

- define dictionary SQL when adding a new business enum
- use dictionary hooks in frontend pages
- keep dictionary values stable and ASCII when they are codes

Do not:

- hardcode business status labels in pages when a dictionary exists
- create multiple dict types for the same business meaning

## Permission and menu rules

Permission scripts are high-risk.

Do:

- align role keys with existing role matrix
- align menu permissions with actual `sys_menu.perms`
- keep external/vendor roles read-only unless explicitly approved
- validate role-menu scripts separately

Do not:

- use guessed permission prefixes
- claim RBAC complete without script validation
- grant broad write permissions to external organizations by default

## Validation rules

Minimum checks by layer:

- SQL: quote/integrity check and preferably DB execution or dry-run
- backend: `mvn -pl ruoyi-admin -am -DskipTests compile`
- frontend: `npm run build`
- route: browser or route validation when page is user-facing
- audited Doubao repair: `VERIFY_DOUBAO_REPAIR_CASES.ps1`

Build success is necessary but not sufficient.

## Documentation rules

Progress docs must describe verified reality.

Use `PROJECT_PROGRESS.md` only for completed or strongly verified work.

Use `PROJECT_ISSUES.md` for:

- failed validation
- partial repair
- known gaps
- audit findings

Never write "complete" in progress docs when the validation status is still unknown.

## Default finish statement

Every completed implementation report must include:

- changed files
- validation commands
- pass/fail result
- remaining gaps

If validation was not run, say:

- not validated yet

not:

- complete
# ERP 工程交付基线

本文件受 `AI_COLLABORATION_RULES.md` 约束。若本文与协作总则存在冲突，以 `AI_COLLABORATION_RULES.md` 的完成定义、证据要求和失败案例规则为准。
