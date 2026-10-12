const fs = require("fs");
const { execSync } = require("child_process");

// Generate the updated solution patch (includes S1 fix in schemas.ts)
execSync("git add packages/zod/src/v4/core/schemas.ts", {stdio: "ignore"});
const solutionDiff = execSync("git diff --staged").toString();
console.log("Solution diff length:", solutionDiff.length);

// Write it
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch", solutionDiff);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_SOLUTION_TO_UPLOAD.patch", solutionDiff);
execSync("git reset HEAD", {stdio: "ignore"});
console.log("Done");
