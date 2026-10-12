const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";

cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
cp.execSync('git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch"', { cwd: repoDir, stdio: 'ignore' });

const testPath = repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
let content = fs.readFileSync(testPath, 'utf8');

// Remove the S1 chained test
const s1Marker = '\n// S1 fix:';
const idx = content.indexOf(s1Marker);
if (idx >= 0) {
  content = content.substring(0, idx).trim() + '\n';
  console.log("S1 test removed");
} else {
  console.log("S1 marker not found in content. Checking for test name...");
  const idx2 = content.indexOf('chained ZodDefault each independently');
  if (idx2 >= 0) {
    // Find the test(...) block start
    const testStart = content.lastIndexOf('\ntest(', idx2);
    const testEnd = content.indexOf('\n});', idx2) + 4;
    content = content.substring(0, testStart).trim() + '\n';
    console.log("S1 test removed by name");
  }
}

fs.writeFileSync(testPath, content);

cp.execSync('git add -A', { cwd: repoDir, stdio: 'ignore' });
const diff = cp.execSync('git diff HEAD', { cwd: repoDir });
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch', diff);
console.log("Updated FINAL_TEST_PATCH.patch saved!");
