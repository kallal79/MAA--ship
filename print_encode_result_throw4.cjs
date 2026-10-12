const cp = require("child_process");
try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"print encode result\"", {
    cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod",
    env: { ...process.env, CI: "true" },
    stdio: "pipe"
  });
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : "";
  const stderr = e.stderr ? e.stderr.toString() : "";
  console.log("STDOUT:\n" + stdout);
  console.log("STDERR:\n" + stderr);
}
