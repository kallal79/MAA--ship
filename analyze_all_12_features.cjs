const fs = require("fs");
const cp = require("child_process");

const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const summary = {};

for (const i of agents) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  try {
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    const diff = cp.execSync("git diff HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"}).toString();
    summary[i] = {
      size: diff.length,
      hasSkipChecks: diff.includes("skipChecks"),
      hasShallowEqual: diff.includes("shallowEqual"),
      hasCompareMembers: diff.includes("compareMembers"),
      hasDefaultValueFactory: diff.includes("defaultValueFactory"),
      hasRawDefaultValue: diff.includes("rawDefaultValue"),
      hasSkipEncodingOptionMode: diff.includes("skipEncoding") && diff.includes("shallow"),
      hasAsyncCheck: diff.includes("Cannot use async"),
      hasFunctionSkipEncoding: diff.includes("typeof option === \"function\"") || diff.includes("typeof skipEncoding === \"function\"")
    };
  } catch (e) {
    summary[i] = { error: e.message };
  }
}

console.log(JSON.stringify(summary, null, 2));
