const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 6, 7, 9, 12];

for (const a of agents) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n=== AGENT ${a} PATCH SUMMARY ===`);
  console.log(`Patch length: ${content.length} bytes`);
  
  // Check deepEqual features
  const hasBipartite = content.includes('bipartite') || content.includes('match') || content.includes('used');
  const hasDate = content.includes('getTime') || content.includes('Date');
  const hasMap = content.includes('Map') && content.includes('keys');
  const hasSet = content.includes('Set');
  const hasRawDefault = content.includes('rawDefaultValue') || content.includes('rawDefault') || content.includes('def.defaultValue');
  const hasFactory = content.includes('factory') || content.includes('Cannot use skipEncoding: true with a factory default');
  const hasTuple = content.includes('tuple') || content.includes('ZodTuple');
  const hasRecord = content.includes('record') || content.includes('ZodRecord');
  const hasShallow = content.includes('shallow');
  const hasStrict = content.includes('strict');

  console.log({
    hasBipartite,
    hasDate,
    hasMap,
    hasSet,
    hasRawDefault,
    hasFactory,
    hasTuple,
    hasRecord,
    hasShallow,
    hasStrict
  });
}
