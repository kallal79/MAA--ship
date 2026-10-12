const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const maaDir = 'C:/Users/USER/OneDrive/Desktop/MAA';

// 1. Get solution patch diff
const solDiff = cp.execSync(
  'git diff -- packages/zod/src/v4/classic/external.ts packages/zod/src/v4/classic/parse.ts packages/zod/src/v4/classic/schemas.ts packages/zod/src/v4/core/api.ts packages/zod/src/v4/core/parse.ts packages/zod/src/v4/core/schemas.ts packages/zod/src/v4/mini/external.ts packages/zod/src/v4/mini/schemas.ts',
  { cwd: zodDir, encoding: 'utf8' }
);

// 2. Get test patch diff (for untracked encode-defaults.8a4f9b.spec.ts)
const testSpecPath = 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
const fullSpecPath = path.join(zodDir, testSpecPath);
const specContent = fs.readFileSync(fullSpecPath, 'utf8');

const specLines = specContent.split('\n');
let testDiff = `diff --git a/${testSpecPath} b/${testSpecPath}\nnew file mode 100644\nindex 00000000..11111111\n--- /dev/null\n+++ b/${testSpecPath}\n@@ -0,0 +1,${specLines.length} @@\n`;
for (const line of specLines) {
  testDiff += `+${line}\n`;
}

console.log('Solution patch size:', solDiff.length);
console.log('Test patch size:', testDiff.length);

const solDestinations = [
  'FINAL_UPLOAD/solution.patch',
  'FINAL_UPLOAD/DEFINITIVE_SOLUTION_PATCH.patch',
  'FINAL_UPLOAD/solution_v4.patch',
  '2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch',
  'CLEAN_SOLUTION_FINAL.patch',
  'CLEAN_SOLUTION_FOR_UPLOAD.patch',
  'SOLUTION_PATCH_ONLY_UPLOAD_THIS.patch',
  'solution.patch',
];

const testDestinations = [
  'FINAL_UPLOAD/test.patch',
  'FINAL_UPLOAD/DEFINITIVE_TEST_PATCH.patch',
  'FINAL_UPLOAD/DEFINITIVE_TEST_PATCH_v4.patch',
  '1_UPLOAD_THIS_AS_TEST_PATCH/test.patch',
  'CLEAN_TEST_FINAL.patch',
  'CLEAN_TEST_FOR_UPLOAD.patch',
  'TEST_PATCH_ONLY_UPLOAD_THIS.patch',
  'TEST_PATCH_3_PASS.patch',
  'TEST_PATCH_3_PASS_FIXED.patch',
  'test.patch',
];

for (const dest of solDestinations) {
  const full = path.join(maaDir, dest);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, solDiff, 'utf8');
  console.log(`Saved ${dest}`);
}

for (const dest of testDestinations) {
  const full = path.join(maaDir, dest);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, testDiff, 'utf8');
  console.log(`Saved ${dest}`);
}

console.log('ALL PATCHES EXPORTED SUCCESSFULLY!');
