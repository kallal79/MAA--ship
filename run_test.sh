cd C:/Users/USER/OneDrive/Desktop/MAA/zod-v1
echo '# 🏆 Final Verification Run: All 12 Nova Agents' > ../final_verification_results.md
echo '' >> ../final_verification_results.md
echo '| Agent | Status | Reason |' >> ../final_verification_results.md
echo '|-------|--------|--------|' >> ../final_verification_results.md

PASS_COUNT=0

for i in {1..12}; do
  echo "Testing Agent $i"
  git reset --hard HEAD > /dev/null 2>&1
  git clean -fd > /dev/null 2>&1
  
  if ! git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch" > /dev/null 2>&1; then
    echo "| Nova Agent $i | ❌ FAIL | solution patch failed to apply |" >> ../final_verification_results.md
    continue
  fi
  
  if ! git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V18.patch" > /dev/null 2>&1; then
    echo "| Nova Agent $i | ❌ FAIL | test patch failed to apply |" >> ../final_verification_results.md
    continue
  fi
  
  if timeout 15 pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false > /dev/null 2>&1; then
    echo "| Nova Agent $i | ✅ PASS | Passed all tests |" >> ../final_verification_results.md
    ((PASS_COUNT++))
  else
    if [ $? -eq 124 ]; then
      echo "| Nova Agent $i | ❌ FAIL | TIMEOUT / INFINITE LOOP |" >> ../final_verification_results.md
    else
      echo "| Nova Agent $i | ❌ FAIL | TEST FAILED |" >> ../final_verification_results.md
    fi
  fi
done

echo '' >> ../final_verification_results.md
echo "**Total Passing Agents:** $PASS_COUNT/12" >> ../final_verification_results.md
if [ $PASS_COUNT -eq 2 ]; then
  echo "**Target Met:** ✅ Yes (Exactly 2 passed)" >> ../final_verification_results.md
else
  echo "**Target Met:** ❌ No" >> ../final_verification_results.md
fi
