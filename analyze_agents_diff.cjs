const fs = require("fs");
const cp = require("child_process");

const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
for (let i = 1; i <= 12; i++) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  try {
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    const diff = cp.execSync("git diff HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"}).toString();
    console.log(`Agent ${i} diff size: ${diff.length} bytes`);
    if (diff.includes("skipChecks")) console.log(`Agent ${i} has skipChecks`);
    if (diff.includes("shallowEqual")) console.log(`Agent ${i} has shallowEqual`);
    if (diff.includes("compareMembers")) console.log(`Agent ${i} has compareMembers`);
  } catch (e) {
    console.log(`Agent ${i} failed`);
  }
}
