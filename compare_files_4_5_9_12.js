const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');
const p12 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_12/solution-patch.patch', 'utf8');

const patches = { '4': p4, '5': p5, '9': p9, '12': p12 };

// Extract all modified files in each patch
for (const [id, content] of Object.entries(patches)) {
  const files = content.match(/diff --git a\/.* b\/.*/g) || [];
  console.log(`\nAgent ${id} files modified (${files.length}):`);
  for (const f of files) {
    console.log('  ' + f);
  }
}
