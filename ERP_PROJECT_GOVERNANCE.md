# ERP Project Governance

Last updated: 2026-04-25

## Purpose

This is the entry file for every model, agent, or developer working on this ERP/MES project.

Its job is to prevent drift.

Before changing code, a model must know:

- what the project is trying to become
- which documents define the current state
- which rules define acceptable delivery
- which validation scripts must be used
- when a task may be called complete

## Project target

The target scores are:

- business: 100
- purchase: 100
- production: 120
- finance: 100
- project landing: 100

Production is intentionally rated above 100 because the system must absorb real factory variation:

- custom process insertion
- lighting inspection
- rework
- outsource
- Japan-order inspection company involvement
- paper flow card execution
- batch clerk entry
- future mobile scan reporting

## Mandatory reading order

Every model must read in this order before non-trivial work:

1. `ERP_PROJECT_GOVERNANCE.md`
2. `ERP_ENGINEERING_BASELINE.md`
3. `MODULE_DELIVERY_MASTER_PLAN.md`
4. `PROJECT_PROGRESS.md`
5. `PROJECT_ISSUES.md`
6. task-specific planning file, if one exists

For audited Doubao repair work, also read:

1. `DOUBAO_EXECUTION_CONSTRAINTS.md`
2. `DOUBAO_VALIDATION_CASES.md`
3. `DOUBAO_F001_FORCED_REPAIR_PROMPT.md`, if working on F-001

## Document ownership

Use the documents as follows:

- `MODULE_DELIVERY_MASTER_PLAN.md`: module delivery route and current module sequencing
- `FULL_SCORE_DELIVERY_STANDARD.md`: score target and what full-score delivery means
- `LONG_TERM_PRODUCTION_MODEL_PLAN.md`: future-compatible production/MES model
- `PROJECT_PROGRESS.md`: completed and verified progress
- `PROJECT_ISSUES.md`: unresolved risks, audit findings, and known gaps
- `PROJECT_POSITION_AND_EXECUTION_ROADMAP.md`: current position and next development order
- `ERP_ENGINEERING_BASELINE.md`: hard code rules and delivery rules
- `DOUBAO_EXECUTION_CONSTRAINTS.md`: Doubao behavior constraints
- `DOUBAO_VALIDATION_CASES.md`: audited repair cases

Do not duplicate large business rules across documents.

If a new rule belongs to code delivery, put it in `ERP_ENGINEERING_BASELINE.md`.

If a new rule belongs to model behavior or audited repair, put it in `DOUBAO_EXECUTION_CONSTRAINTS.md`.

If a new finding is unresolved, put it in `PROJECT_ISSUES.md`.

If a task is truly verified, put it in `PROJECT_PROGRESS.md`.

## Skill and workflow rule

Use the relevant skill, plugin, or validation workflow proactively.

Required examples:

- frontend route/page changes require browser or route validation when feasible
- audited Doubao repair requires `VERIFY_DOUBAO_REPAIR_CASES.ps1`
- OpenAI product/API questions require the OpenAI docs workflow
- image generation/editing requests require the image generation workflow

Do not claim a UI is usable only because `npm run build` passed.

Do not claim a backend module is complete only because Maven compiled.

Do not claim SQL is fixed until SQL-specific validation passes.

## Completion definition

A task is not complete because code was written.

A task is complete only when:

1. source ownership is clear
2. SQL is executable if SQL is involved
3. backend compiles if backend is involved
4. frontend builds if frontend is involved
5. route/page is reachable if frontend page is involved
6. form/API path is usable if data entry is involved
7. abnormal or negative path is considered when relevant
8. progress and issue documents are updated truthfully

If any required validation is missing, the status is:

- code written, pending validation

not:

- completed

## Reporting rule

For non-trivial work, report progress in three stages:

1. start: what will be checked and which contract is being followed
2. middle: what was learned and whether direction still holds
3. end: what passed, what failed, and what remains open

Reports must not hide partial failures.

## Task risk levels

Green tasks may be implemented directly:

- existing CRUD field alignment
- existing page/API field completion
- repetitive mapper/controller scaffolding under a proven pattern

Yellow tasks need explicit contract alignment before implementation:

- new module CRUD
- new dictionary type
- new SQL phase
- new page route
- permission/menu backfill

Red tasks should be led by Codex or reviewed before implementation:

- foundational schema changes
- event/snapshot/source-truth design
- cost and settlement architecture
- approval architecture
- abnormal governance architecture
- shared component extension

## Stop rules

Stop and report instead of continuing when:

- SQL validation fails
- a page uses unsupported shared-component capability
- route or i18n wiring is missing
- controller validation is only decorative and not triggered
- progress docs disagree with actual code
- another agent is editing the same files and conflict risk is high

## Restart rule

After shutdown, model switch, or conversation compaction, the next model must not rely on memory alone.

It must read this file first.

Then it must read the current progress and issue files before continuing.

If the next task is an audited repair, run or inspect the relevant validation script before writing more code.

## Test round protocol (candidate models)

Candidate models (e.g., DeepSeek, DoubaoCode) are NOT eligible for mainline coding. They may participate only in explicit test rounds with the following hard constraints.

### Mandatory: test license sheet

Before ANY code change, the model MUST output a test license sheet:

```
测试目标：
本轮身份：候选修复者
允许修改文件：
1. <file>
2. <file>
禁止修改文件：
1. 前端文件
2. service/controller
3. PROJECT_PROGRESS.md / PROJECT_ISSUES.md / README.md
4. 任何其他文件
允许执行命令：
1. mvn -pl ruoyi-admin -am -DskipTests compile
2. 指定 SQL 文件验证
禁止执行命令：
1. 杀进程
2. 启动服务
3. 修改环境
4. 后台运行命令
5. 进入下一任务
验收标准：
越界即失败：
```

If the model does not output this sheet before touching any file, the test round is immediately void.

### File-scope constraint

- Test rounds must be scoped to specific files, not modules.
- "允许修改" must list exact file paths.
- "禁止修改" must list forbidden file categories.
- Once a model crosses the file boundary, the test round is immediately void.

### No state document writes

- Candidate models must NEVER modify PROJECT_PROGRESS.md, PROJECT_ISSUES.md, README.md, or any governance document.
- All status conclusions are written ONLY by Codex, Claude, or human review.

### No self-declared completion

- Candidate models may only output:
  - 已改动：
  - 已验证：
  - 未验证：
  - 阻塞：
  - 等待 Codex / Claude 复审
- The following are FORBIDDEN in test round output:
  - 已完成 / 已通过
  - 可进入下一任务 / 可以开始下一个模块
  - Any equivalent completion claim
- Completion conclusions come only from Codex, Claude, or human.

### Command discipline

- Allowed commands must be listed in the test license sheet.
- The model must NOT:
  - kill processes
  - start services
  - modify environment
  - run background shells
  - proceed to next task
  - fix environmental issues beyond the license scope

### Single-round single-target

- One test round = one capability test.
  - SQL fix only
  - Mapper/Domain alignment only
  - Frontend form integration only
  - Service validation only
- Do NOT mix SQL + Java + frontend + documentation + environment in one round.
- Mixed rounds make it impossible to evaluate which capability caused what result.

### Cost note

- flash-tier: suitable for bulk audit, candidate patch, blind-test rounds
- pro-tier: suitable for complex patch testing
- Final merge and mainline conclusions remain with Codex/Claude
# ERP 项目治理入口

本文件受 `AI_COLLABORATION_RULES.md` 约束。任何 AI 助手在读取本文件前，必须先读取 `AI_COLLABORATION_RULES.md`，并以其中的证据优先、最小改动、失败案例驱动和关机恢复规则为最高协作准则。
