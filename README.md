# ERP-UI-2

Knitwear ERP / MES frontend project.

## Project navigation

- Current implementation progress:
  - [PROJECT_PROGRESS.md](D:\erp\ERP-UI-2\PROJECT_PROGRESS.md)
- Current issues / faults / risks:
  - [PROJECT_ISSUES.md](D:\erp\ERP-UI-2\PROJECT_ISSUES.md)
- Knitwear ERP / MES business blueprint:
  - [KNITWEAR_ERP_MES_BLUEPRINT.md](D:\erp\ERP-UI-2\KNITWEAR_ERP_MES_BLUEPRINT.md)
- Approval flow current-state and planning:
  - [APPROVAL_FLOW_BLUEPRINT.md](D:\erp\ERP-UI-2\APPROVAL_FLOW_BLUEPRINT.md)
- Approval nodes, dict plan, and role matrix:
  - [APPROVAL_MATRIX_AND_DICT_PLAN.md](D:\erp\ERP-UI-2\APPROVAL_MATRIX_AND_DICT_PLAN.md)
- Module delivery governance plan:
  - [MODULE_DELIVERY_MASTER_PLAN.md](D:\erp\ERP-UI-2\MODULE_DELIVERY_MASTER_PLAN.md)
  - [ERP_PROJECT_GOVERNANCE.md](D:\erp\ERP-UI-2\ERP_PROJECT_GOVERNANCE.md)
  - [ERP_ENGINEERING_BASELINE.md](D:\erp\ERP-UI-2\ERP_ENGINEERING_BASELINE.md)
  - [DOUBAO_EXECUTION_CONSTRAINTS.md](D:\erp\ERP-UI-2\DOUBAO_EXECUTION_CONSTRAINTS.md)
  - [DOUBAO_VALIDATION_CASES.md](D:\erp\ERP-UI-2\DOUBAO_VALIDATION_CASES.md)
  - [DOUBAO_F001_FORCED_REPAIR_PROMPT.md](D:\erp\ERP-UI-2\DOUBAO_F001_FORCED_REPAIR_PROMPT.md)
  - `VERIFY_DOUBAO_REPAIR_CASES.ps1`：Doubao 修复批次本地判题脚本
- Batch 1 foundation audit matrix:
  - [BATCH1_FOUNDATION_AUDIT_MATRIX.md](D:\erp\ERP-UI-2\BATCH1_FOUNDATION_AUDIT_MATRIX.md)

## Current direction

- Correct business flow before polishing screens.
- Keep source relationships stable:
  - sales -> plan -> job -> process -> quality
- Reduce duplicate entry.
- Make printing and scanning serve real workshop execution.
- Optimize only when business requirements stay intact.

## Local run

Prerequisites:

- Node.js

Commands:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Dictionary-driven behavior has been restored in key modules.
- Several business-heavy detail pages were restored after earlier removals.
- QR printing and scan-back business links are now connected in core flows.
# ERP AI 协作入口

所有 AI 助手进入本项目开发、修复、审计或验证前，必须先阅读并遵守：

1. `AI_COLLABORATION_RULES.md`
2. `AI_TASK_TEMPLATE.md`
3. `ERP_PROJECT_GOVERNANCE.md`
4. `ERP_ENGINEERING_BASELINE.md`
5. `MODULE_DELIVERY_MASTER_PLAN.md`
6. `PROJECT_ISSUES.md`
7. `CANDIDATE_MODEL_TEST_PROMPT_TEMPLATE.md`
8. `MODEL_BOUNDARY_VIOLATION_LOG_TEMPLATE.md`
9. `CANDIDATE_MODEL_TEST_QUESTION_BANK.md`
10. `MODEL_ADMISSION_TIERS.md`
11. `MODEL_EVALUATION_DUAL_TRACK.md`
12. `MODEL_EVIDENCE_SOURCE_TIERS.md`
13. `DEEPSEEK_V4_FINAL_EVAL.md`

涉及 DoubaoCode 输出、修复或复审时，还必须读取：

1. `DOUBAO_EXECUTION_CONSTRAINTS.md`
2. `DOUBAO_VALIDATION_CASES.md`
3. `VERIFY_DOUBAO_REPAIR_CASES.ps1`

本项目不接受“写完即完成”或“编译通过即完成”。所有完成结论必须附带可复跑验证证据。
