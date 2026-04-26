$ErrorActionPreference = 'Stop'

$frontendRoot = 'D:\erp\ERP-UI-2'
$backendRoot = 'D:\erp\RuoYi-Vue'

function Write-CaseResult {
    param(
        [string]$CaseId,
        [string]$Title,
        [bool]$Passed,
        [string]$Detail
    )

    $status = if ($Passed) { 'PASS' } else { 'FAIL' }
    Write-Host "[$status] $CaseId - $Title"
    if ($Detail) {
        Write-Host "       $Detail"
    }
}

function Get-OddSingleQuoteLines {
    param([string]$Path)

    $bad = @()
    $lineNo = 0
    Get-Content -Path $Path | ForEach-Object {
        $lineNo++
        $count = ([regex]::Matches($_, "'")).Count
        if (($count % 2) -ne 0) {
            $bad += [pscustomobject]@{
                Line = $lineNo
                Text = $_.Trim()
            }
        }
    }
    return $bad
}

$failed = $false

# F-001
$phase30 = Join-Path $backendRoot 'sql\phase30_p0_roles_menu_permission.sql'
$phase30Odd = Get-OddSingleQuoteLines -Path $phase30
$f001Pass = $phase30Odd.Count -eq 0
if (-not $f001Pass) {
    $failed = $true
}
$f001Detail = if ($f001Pass) {
    'No odd single-quote lines detected in phase30.'
} else {
    'Odd single-quote lines still present: ' + (($phase30Odd | Select-Object -First 5 | ForEach-Object { "$($_.Line)" }) -join ', ')
}
Write-CaseResult -CaseId 'F-001' -Title 'phase30 SQL quote integrity' -Passed $f001Pass -Detail $f001Detail

# F-002
$phase31 = Join-Path $backendRoot 'sql\phase31_p1_org_unit.sql'
$phase31Odd = Get-OddSingleQuoteLines -Path $phase31
$f002Pass = $phase31Odd.Count -eq 0
if (-not $f002Pass) {
    $failed = $true
}
$f002Detail = if ($f002Pass) {
    'No odd single-quote lines detected in phase31.'
} else {
    'Odd single-quote lines still present: ' + (($phase31Odd | Select-Object -First 5 | ForEach-Object { "$($_.Line)" }) -join ', ')
}
Write-CaseResult -CaseId 'F-002' -Title 'phase31 SQL quote integrity' -Passed $f002Pass -Detail $f002Detail

# F-003
$orgPagePath = Join-Path $frontendRoot 'src\pages\system\org\index.tsx'
$orgPageRaw = Get-Content -Path $orgPagePath -Raw
$usesTreeSelect = $orgPageRaw -match 'tree-select'
$usesBeforeSubmit = $orgPageRaw -match 'beforeSubmit'
$f003Pass = (-not $usesTreeSelect) -and (-not $usesBeforeSubmit)
if (-not $f003Pass) {
    $failed = $true
}
$f003Problems = @()
if ($usesTreeSelect) { $f003Problems += 'tree-select still present' }
if ($usesBeforeSubmit) { $f003Problems += 'beforeSubmit still present' }
$f003Detail = if ($f003Pass) { 'Org page no longer uses unsupported GenericForm contracts.' } else { $f003Problems -join '; ' }
Write-CaseResult -CaseId 'F-003' -Title 'Org page respects GenericForm contract' -Passed $f003Pass -Detail $f003Detail

# F-004
$routerPath = Join-Path $frontendRoot 'src\router.tsx'
$routerRaw = Get-Content -Path $routerPath -Raw
$i18nPath = Join-Path $frontendRoot 'src\i18n\index.ts'
$i18nRaw = Get-Content -Path $i18nPath -Raw
$hasOrgRoute = $routerRaw -match "path:\s*'system/org'"
$hasOrgunitI18n = $i18nRaw -match '\borgunit\s*:'
$hasCommonNone = $i18nRaw -match '\bnone\s*:'
$f004Pass = $hasOrgRoute -and $hasOrgunitI18n -and $hasCommonNone
if (-not $f004Pass) {
    $failed = $true
}
$f004Problems = @()
if (-not $hasOrgRoute) { $f004Problems += 'missing /system/org route' }
if (-not $hasOrgunitI18n) { $f004Problems += 'missing page.orgunit i18n keys' }
if (-not $hasCommonNone) { $f004Problems += 'missing common.none i18n key' }
$f004Detail = if ($f004Pass) { 'Route and i18n coverage present for Org page.' } else { $f004Problems -join '; ' }
Write-CaseResult -CaseId 'F-004' -Title 'Org page route and i18n closure' -Passed $f004Pass -Detail $f004Detail

# F-005
$orgControllerPath = Join-Path $backendRoot 'ruoyi-admin\src\main\java\com\ruoyi\erp\orgunit\controller\OrgUnitController.java'
$orgControllerRaw = Get-Content -Path $orgControllerPath -Raw
$hasAddValidated = $orgControllerRaw -match 'add\(@RequestBody\s+@Validated\s+OrgUnit\s+orgUnit\)'
$hasEditValidated = $orgControllerRaw -match 'edit\(@RequestBody\s+@Validated\s+OrgUnit\s+orgUnit\)'
$f005Pass = $hasAddValidated -and $hasEditValidated
if (-not $f005Pass) {
    $failed = $true
}
$f005Problems = @()
if (-not $hasAddValidated) { $f005Problems += 'add() missing validated request signature' }
if (-not $hasEditValidated) { $f005Problems += 'edit() missing validated request signature' }
$f005Detail = if ($f005Pass) { 'Org controller request validation wiring present.' } else { $f005Problems -join '; ' }
Write-CaseResult -CaseId 'F-005' -Title 'OrgUnit controller validation wiring' -Passed $f005Pass -Detail $f005Detail

Write-Host ''
if ($failed) {
    Write-Host 'Doubao repair validation: FAIL'
    exit 1
}

Write-Host 'Doubao repair validation: PASS'
exit 0
