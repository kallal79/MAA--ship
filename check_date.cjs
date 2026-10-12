const fs = require("fs");
for (let i = 1; i <= 12; i++) {
  try {
    const patch = fs.readFileSync(`C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch`, "utf8");
    if (patch.includes("instanceof Date") || patch.includes("Date")) {
      console.log(`Agent ${i} has Date`);
    }
  } catch (e) {}
}
