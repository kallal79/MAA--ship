
# Script to build both solution and test patches from scratch
# Run from inside the zod directory

Set-Location "C:\Users\USER\OneDrive\Desktop\MAA\zod"
git reset --hard HEAD
git clean -fd

Write-Host "=== APPLYING SOLUTION CHANGES ===" -ForegroundColor Green
# All edits are done directly to source files, then we generate the patch

