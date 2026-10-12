const cp = require("child_process");
try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"print encode result\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"}).toString();
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log("FULL OUTPUT:");
  console.log(stdout);
}
