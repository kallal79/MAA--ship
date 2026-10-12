const cp = require("child_process");
try {
  const out = cp.execSync("rg deepEqual packages/zod/src/v4", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"}).toString();
  console.log(out.substring(0, 2000));
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout.substring(0, 2000));
}
