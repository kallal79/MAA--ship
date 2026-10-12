const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

for (const a of [1, 2]) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n=== AGENT ${a} DEFAULT IMPLEMENTATION ===`);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('rawDefaultValue') || lines[i].includes('_default') || lines[i].includes('skipEncoding(')) {
      for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 8); j++) {
        console.log(lines[j]);
      }
      i += 8;
    }
  }
}
