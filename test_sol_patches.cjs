const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const solFiles = [
  "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_SOLUTION_PATCH_FINAL_CLEAN.patch",
  "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CORRECT_SOLUTION_PATCH_UPLOAD_THIS.patch",
  "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_SOLUTION_PATCH_100_PERCENT.patch",
  "C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch",
  "C:/Users/USER/OneDrive/Desktop/MAA/SOLUTION_PATCH_ONLY_UPLOAD_THIS.patch"
];

for (const sf of solFiles) {
  try {
    cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync(`git apply "${sf}"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    console.log(`Successfully applied: ${sf}`);
  } catch (e) {
    console.log(`Failed to apply: ${sf}`);
  }
}
