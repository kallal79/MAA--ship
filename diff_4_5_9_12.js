const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 9, 12];

for (const a of agents) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n=================== NOVA #${a} FULL DIFF DETAILS ===================`);
  
  // Look at ZodArray
  const arrayMatch = content.match(/ZodArray[\s\S]{1,500}/);
  if (arrayMatch) console.log('--- ARRAY ---:\n', arrayMatch[0].slice(0, 300));

  // Look at ZodSet
  const setMatch = content.match(/ZodSet[\s\S]{1,500}/);
  if (setMatch) console.log('--- SET ---:\n', setMatch[0].slice(0, 300));

  // Look at ZodMap
  const mapMatch = content.match(/ZodMap[\s\S]{1,500}/);
  if (mapMatch) console.log('--- MAP ---:\n', mapMatch[0].slice(0, 300));

  // Look at ZodRecord
  const recordMatch = content.match(/ZodRecord[\s\S]{1,500}/);
  if (recordMatch) console.log('--- RECORD ---:\n', recordMatch[0].slice(0, 300));

  // Look at ZodTuple
  const tupleMatch = content.match(/ZodTuple[\s\S]{1,500}/);
  if (tupleMatch) console.log('--- TUPLE ---:\n', tupleMatch[0].slice(0, 300));
}
