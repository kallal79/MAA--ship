const cp = require("child_process");
cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

try {
  const out = cp.execSync("rg deepEqual packages/zod/src", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"}).toString();
  console.log(out.substring(0, 3000));
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout.substring(0, 3000));
}
