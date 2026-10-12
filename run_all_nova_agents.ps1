# run_all_nova_agents.ps1 - Tests all 13 Nova agent patches locally
$ZodDir      = "C:\Users\USER\OneDrive\Desktop\MAA\zod"
$AgentRoot   = "C:\Users\USER\OneDrive\Desktop\MAA\agent-runs-LAST-FINAL-NEW"
$TestSpec    = "packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts"
$BaselineSpec= "packages/zod/src/v4/classic/tests/default.test.ts"
$SolPatch    = "C:\Users\USER\OneDrive\Desktop\MAA\solution_utf8.patch"
$TestPatch   = "C:\Users\USER\OneDrive\Desktop\MAA\test_utf8.patch"
$ResultFile  = "C:\Users\USER\OneDrive\Desktop\MAA\nova_local_results.md"

$OfficialVerdict = @{1="FAIL";2="FAIL";3="FAIL";4="FAIL";5="PASS";6="FAIL";7="FAIL";8="FAIL";9="FAIL";10="FAIL";11="PASS";12="FAIL";13="FAIL"}
$Results = @()

Write-Host ""
Write-Host "=================================================="
Write-Host "   LOCAL NOVA AGENT TEST RUNNER  (v3)"
Write-Host "=================================================="

for ($i = 1; $i -le 13; $i++) {
    $PatchFile = "$AgentRoot\Nova_Nova_$i\solution-patch.patch"
    Write-Host ""
    Write-Host "--- Agent $i ---"

    if (-not (Test-Path $PatchFile)) {
        Write-Host "  [SKIP] No patch"
        $Results += [PSCustomObject]@{Agent=$i;Baseline="SKIP";NewTests="SKIP";LocalVerdict="SKIP";Official=$OfficialVerdict[$i];Match="?"}
        continue
    }

    Push-Location $ZodDir
    git checkout HEAD -- . 2>&1 | Out-Null
    git clean -fd --quiet 2>&1 | Out-Null

    # Normalize agent patch to LF  
    $raw = [System.IO.File]::ReadAllBytes($PatchFile)
    $txt = [System.Text.Encoding]::UTF8.GetString($raw)
    if ($txt.Contains("`r`n")) { $txt = $txt -replace "`r`n","`n" }
    $tmpPatch = "$ZodDir\_agent_tmp.patch"
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tmpPatch, $txt, $utf8)

    git apply --whitespace=fix $tmpPatch 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Agent patch failed to apply"
        $Results += [PSCustomObject]@{Agent=$i;Baseline="ERR";NewTests="ERR";LocalVerdict="PATCH_ERR";Official=$OfficialVerdict[$i];Match="?"}
        Remove-Item $tmpPatch -ErrorAction SilentlyContinue
        Pop-Location; continue
    }
    Remove-Item $tmpPatch -ErrorAction SilentlyContinue

    # Run BASELINE first (before test patch)
    Write-Host "  Running baseline..."
    npx vitest run $BaselineSpec --no-typecheck 2>&1 | Out-Null
    $basePass = ($LASTEXITCODE -eq 0)

    # Apply test patch
    git apply --whitespace=fix $TestPatch 2>&1 | Out-Null

    # Run NEW tests
    Write-Host "  Running new tests..."
    npx vitest run $TestSpec --no-typecheck 2>&1 | Out-Null
    $newPass = ($LASTEXITCODE -eq 0)

    Pop-Location

    if ($basePass -and $newPass)  { $local = "PASS" }
    elseif (-not $basePass)       { $local = "FAIL_BASELINE" }
    else                          { $local = "FAIL_NEW" }

    $match = if (($OfficialVerdict[$i] -eq "PASS") -eq ($local -eq "PASS")) { "YES" } else { "NO" }
    Write-Host "  Base=$(if($basePass){'PASS'}else{'FAIL'})  New=$(if($newPass){'PASS'}else{'FAIL'})  Match=$match"

    $Results += [PSCustomObject]@{Agent=$i;Baseline=if($basePass){"PASS"}else{"FAIL"};NewTests=if($newPass){"PASS"}else{"FAIL"};LocalVerdict=$local;Official=$OfficialVerdict[$i];Match=$match}
}

# Restore our implementation
Push-Location $ZodDir
git checkout HEAD -- . 2>&1 | Out-Null
git clean -fd --quiet 2>&1 | Out-Null
git apply --whitespace=fix $SolPatch 2>&1 | Out-Null
git apply --whitespace=fix $TestPatch 2>&1 | Out-Null
Pop-Location

$pass   = ($Results | Where-Object { $_.LocalVerdict -eq "PASS" }).Count
$fail   = ($Results | Where-Object { $_.LocalVerdict -like "FAIL*" }).Count
$errors = ($Results | Where-Object { $_.LocalVerdict -notmatch "^PASS|^FAIL" }).Count
$match  = ($Results | Where-Object { $_.Match -eq "YES" }).Count

$md = "# Nova Agent Local Test Results`n`n> Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$md += "## Summary`n`n| | Count |`n|---|---|`n"
$md += "| Total Agents | 13 |`n| Local PASS | $pass |`n| Local FAIL | $fail |`n| Errors/Skip | $errors |`n| Match Official | $match/13 |`n`n"
$md += "## Results`n`n| Agent | Baseline | New Tests | Local | Official | Match |`n|---|---|---|---|---|---|`n"
foreach ($r in $Results) {
    $bI = if($r.Baseline -eq "PASS"){"✅"}elseif($r.Baseline -eq "FAIL"){"❌"}else{"⚠️"}
    $nI = if($r.NewTests -eq "PASS"){"✅"}elseif($r.NewTests -eq "FAIL"){"❌"}else{"⚠️"}
    $mI = if($r.Match -eq "YES"){"✅"}elseif($r.Match -eq "NO"){"❌"}else{"❓"}
    $md += "| Agent $($r.Agent) | $bI $($r.Baseline) | $nI $($r.NewTests) | $($r.LocalVerdict) | $($r.Official) | $mI $($r.Match) |`n"
}
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($ResultFile, $md, $utf8)

Write-Host ""
Write-Host "=================================================="
Write-Host "  DONE  →  nova_local_results.md"
Write-Host "  Local PASS: $pass/13  |  FAIL: $fail/13  |  Match: $match/13"
Write-Host "=================================================="
