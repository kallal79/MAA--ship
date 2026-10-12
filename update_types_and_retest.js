const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

// Apply solution patch
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', {
  cwd: ZOD_DIR,
  stdio: 'pipe'
});

// Update core/schemas.ts type definition for $ZodDefaultSkipEncoding
const schemasPath = path.join(ZOD_DIR, 'packages/zod/src/v4/core/schemas.ts');
let schemasContent = fs.readFileSync(schemasPath, 'utf8');
schemasContent = schemasContent.replace(
  `export type $ZodDefaultSkipEncoding<T extends SomeType = $ZodType> =
  | boolean
  | $ZodDefaultSkipEncodingMode
  | ((value: core.input<T>) => boolean | Promise<boolean>);`,
  `export type $ZodDefaultSkipEncoding<T extends SomeType = $ZodType> =
  | boolean
  | $ZodDefaultSkipEncodingMode
  | ((value: core.input<T>, rawDefaultValue?: unknown) => boolean | Promise<boolean>);`
);
fs.writeFileSync(schemasPath, schemasContent, 'utf8');

// Generate new solution.patch
const solPatch = execSync('git diff', { cwd: ZOD_DIR }).toString('utf8').replace(/\r\n/g, '\n');

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', solPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/SOLUTION_PATCH_ONLY_UPLOAD_THIS.patch', solPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', solPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch', solPatch, 'utf8');

console.log('Solution patch updated successfully!');

// Re-generate test.patch with typed predicate parameters
execSync('node export_2_pass_test_patch.js', { cwd: 'C:/Users/USER/OneDrive/Desktop/MAA', stdio: 'inherit' });

// Apply test patch to zod repo
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch', {
  cwd: ZOD_DIR,
  stdio: 'pipe'
});

// Run vitest with typecheck
console.log('\nRunning vitest with typecheck...');
const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', {
  cwd: ZOD_DIR,
  stdio: 'inherit'
});
