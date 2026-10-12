const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

for (const a of [4, 5, 6, 7, 9, 12]) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n======================================================`);
  console.log(`                 NOVA #${a} CONTAINERS                 `);
  console.log(`======================================================`);

  // Check how ZodTuple handles omission
  const tupleMatch = content.match(/ZodTuple[\s\S]{1,400}/);
  if (tupleMatch) {
    console.log('Tuple:', tupleMatch[0].slice(0, 200));
  }

  // Check how ZodObject handles omission
  const objMatch = content.match(/payload\.value\[outKey\][\s\S]{1,200}|newResult\[k\][\s\S]{1,200}/);
  if (objMatch) {
    console.log('Object:', objMatch[0].slice(0, 150));
  }
}
