const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 6, 7, 9, 12];

for (const a of agents) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== AGENT ${a} SHALLOW LOGIC ==================`);
  
  // Find shallow or shallowEqual or mode === 'shallow'
  const lines = content.split('\n');
  let capturing = false;
  let block = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('shallow') || line.includes('shallowEqual')) {
      // Print context of 10 lines
      console.log(`--- Match at line ${i} ---`);
      for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 15); j++) {
        console.log(lines[j]);
      }
      i += 15;
    }
  }
}
