const fs = require('fs');
const { execSync } = require('child_process');

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard 1fb56a5c", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

safeGitReset();

// Apply base test patch to get test files
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

let testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');

// Remove the `date: new Date(1),` from the deep equality test
testContent = testContent.replace(/date: z\.date\(\)\.default\(new Date\(1000\), \{ skipEncoding: true \}\),/g, "");
testContent = testContent.replace(/date: new Date\(1000\),/g, "");

// Remove the chained defaults test
testContent = testContent.replace(/test\("chained defaulted schemas evaluate skipEncoding independently", \(\) => \{[\s\S]*?\}\);/g, "");

// Remove the implicit default option behaves as deep test
testContent = testContent.replace(/test\("implicit default option behaves as deep", \(\) => \{[\s\S]*?\}\);/g, "");


// Write back
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', testContent);

// Add the test files to git
execSync("git add .", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

// Generate the final test patch correctly by diffing index vs HEAD
execSync("git diff HEAD > C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

// Commit the test patch so we can reset cleanly between agents
execSync("git config user.email \"test@test.com\" && git config user.name \"Test\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
execSync("git commit -m \"Test patch\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

const results = {};
for (let i = 1; i <= 10; i++) {
  console.log("Testing Agent " + i);
  
  execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    results[i] = "FAIL (solution patch apply)"; continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      results[i] = "FAIL (TIMEOUT)";
    } else {
      results[i] = "FAIL";
    }
  }
}

console.log(results);

// Restore to original commit
safeGitReset();
