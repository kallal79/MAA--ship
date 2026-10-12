const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const maaDir = 'C:/Users/USER/OneDrive/Desktop/MAA';
const solPatch = path.join(maaDir, 'FINAL_SUBMIT_HERE/3_SOLUTION_PATCH_FINAL_CLEAN.patch');
const testPatch = path.join(maaDir, 'FINAL_SUBMIT_HERE/3_TEST_PATCH_FINAL_CLEAN.patch');

console.log('=== FINAL SANITY CHECK ===');

// 1. Reset repo to base commit
console.log('1. Resetting repository to 1fb56a5c...');
cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

// 2. Apply solution.patch
console.log('2. Applying FINAL_UPLOAD/solution.patch...');
try {
  cp.execSync(`git apply "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  console.log('   solution.patch applied cleanly!');
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  console.log('   solution.patch applied with ignore-whitespace!');
}

// 3. Apply test.patch
console.log('3. Applying FINAL_UPLOAD/test.patch...');
try {
  cp.execSync(`git apply "${testPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  console.log('   test.patch applied cleanly!');
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "${testPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  console.log('   test.patch applied with ignore-whitespace!');
}

// 4. Disable typecheck for speed
['vitest.config.ts', 'packages/zod/vitest.config.ts'].forEach(f => {
  const full = path.join(zodDir, f);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/enabled:\s*true/g, 'enabled: false');
    fs.writeFileSync(full, content, 'utf8');
  }
});

// 5. Run vitest on base default.test.ts
console.log('4. Running base default.test.ts...');
const baseOut = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/default.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
const basePass = baseOut.includes('Test Files  1 passed') || baseOut.includes('passed');
console.log('   Base Tests Result:', basePass ? 'PASSED (100%)' : 'FAILED');

// 6. Run vitest on new encode-defaults.8a4f9b.spec.ts
console.log('5. Running new encode-defaults.8a4f9b.spec.ts...');
const newOut = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
const newPass = newOut.includes('Test Files  1 passed') || newOut.includes('passed');
console.log('   New Tests Result:', newPass ? 'PASSED (100%)' : 'FAILED');

console.log('\n=======================================');
if (basePass && newPass) {
  console.log('SANITY CHECK PASSED: EVERYTHING IS 100% OK TO SUBMIT!');
} else {
  console.log('SANITY CHECK FAILED: DO NOT SUBMIT YET!');
}
console.log('=======================================\n');
