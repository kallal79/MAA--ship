const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

for (const i of [4, 5, 6, 7, 8, 9, 10]) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  
  const lines = content.split('\n');
  const equalLines = [];
  let inSection = false;
  for (let j = 0; j < lines.length; j++) {
    const l = lines[j];
    if (l.includes('function equal') || l.includes('function isDefaultEqual') || l.includes('function defaultValuesEqual') || l.includes('function deepEqual') || l.includes('function shallowEqual') || l.includes('function valuesEqual') || l.includes('function isDeepEqual')) {
      inSection = true;
    }
    if (inSection) {
      equalLines.push(l);
      if (equalLines.length > 50) {
        break;
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`                 NOVA #${i} EQUALITY LOGIC             `);
  console.log(`======================================================`);
  console.log(equalLines.slice(0, 35).join('\n'));
}
