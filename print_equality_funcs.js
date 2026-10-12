const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

for (const a of [4, 5, 6, 7, 9]) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== AGENT ${a} EQUALITY IMPLEMENTATION ==================`);
  
  const lines = content.split('\n');
  let inFunc = false;
  let funcLines = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('function equalDefault') || l.includes('function isDefaultEqual') || l.includes('function deepEqual') || l.includes('function valuesEqual')) {
      inFunc = true;
    }
    if (inFunc) {
      funcLines.push(l);
      if (funcLines.length > 50) {
        console.log(funcLines.join('\n'));
        funcLines = [];
        inFunc = false;
      }
    }
  }
  if (funcLines.length > 0) {
    console.log(funcLines.join('\n'));
  }
}
