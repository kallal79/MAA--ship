const fs = require('fs');
const cp = require('child_process');

// 1. Stage the test files
cp.execSync('git add -N packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts test.sh', { cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod' });

// 2. Generate the exact test patch
let diff = cp.execSync('git diff HEAD -- packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts packages/zod/src/v4/classic/tests/void.test.ts test.sh', { cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', encoding: 'utf8' });

// Ensure unix line endings
diff = diff.replace(/\r\n/g, '\n');

// 3. Write it to both locations
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_TEST_FOR_UPLOAD.patch', diff, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch', diff, 'utf8');

console.log('Test patch regenerated successfully. Length: ' + diff.length);
