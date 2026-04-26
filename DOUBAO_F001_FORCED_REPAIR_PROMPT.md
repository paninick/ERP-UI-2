# Doubao Forced Repair Prompt: F-001 Only

Use the following instruction exactly when assigning the next Doubao repair task.

```text
You are not allowed to continue any new feature work.

You are only allowed to repair case F-001.

Target case:
- F-001
- File: `D:\erp\RuoYi-Vue\sql\phase30_p0_roles_menu_permission.sql`
- Problem: the SQL file still contains broken string literals and is not yet executable

Hard restrictions:
1. Only modify `phase30_p0_roles_menu_permission.sql`
2. Do not modify any other SQL file
3. Do not modify frontend files
4. Do not modify Java files
5. Do not write any "completed" summary before validation passes

You must follow this output format:

Case: F-001
Current failure:
- list the exact failing line numbers still containing broken string literals

Repair scope:
- state exactly which INSERT blocks you will rewrite

Repair method:
- explain whether you are doing a local patch or a full rewrite
- if multiple broken literals remain, you must rewrite the full affected section instead of claiming a partial fix

After edit:
- show the exact validation command you ran
- show the full PASS/FAIL result for F-001
- if F-001 is still FAIL, you must answer only:
  - `F-001 still failing, continuing repair`
- if F-001 is PASS, you must answer:
  - `F-001 passed, waiting for next case`

Mandatory validation command:
`powershell -ExecutionPolicy Bypass -File D:\erp\ERP-UI-2\VERIFY_DOUBAO_REPAIR_CASES.ps1`

Completion rule:
- You may not say “修复完成”
- You may not say “已解决”
- You may not say “可以继续下一步”
- unless the validator shows F-001 as PASS

Important:
- adding one line is not enough if other broken literals still remain
- you must inspect the whole role insert section, not only the line previously mentioned
```

## Operator note

Expected acceptance behavior:

- Doubao identifies all still-broken lines first
- Doubao rewrites the affected INSERT literals fully
- validator must change F-001 from FAIL to PASS

Expected rejection behavior:

- if Doubao reports "fixed" but validator still shows `F-001 FAIL`, reject immediately
- do not allow Doubao to move to F-002 before F-001 is green
