const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');
const p12 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_12/solution-patch.patch', 'utf8');

function extractCoreSchemas(p) {
  const parts = p.split('diff --git a/packages/zod/src/v4/core/schemas.ts b/packages/zod/src/v4/core/schemas.ts');
  if (parts.length < 2) return '';
  return parts[1].split('diff --git')[0];
}

const c4 = extractCoreSchemas(p4);
const c5 = extractCoreSchemas(p5);
const c9 = extractCoreSchemas(p9);
const c12 = extractCoreSchemas(p12);

console.log('Core schemas diff lengths:', { 4: c4.length, 5: c5.length, 9: c9.length, 12: c12.length });

// Check how each container schema handles omission in schemas.ts:
const containers = ['$ZodArray', '$ZodObject', '$ZodObjectJIT', '$ZodRecord', '$ZodMap', '$ZodSet', '$ZodTuple', '$ZodDefault'];

for (const c of containers) {
  console.log(`\n=== CONTAINER: ${c} ===`);
  for (const [id, code] of Object.entries({ 4: c4, 5: c5, 9: c9, 12: c12 })) {
    const idx = code.indexOf(c);
    if (idx !== -1) {
      const snippet = code.slice(idx, idx + 200).replace(/\n/g, ' ');
      console.log(`  Agent ${id}: ${snippet.slice(0, 100)}...`);
    } else {
      console.log(`  Agent ${id}: (not explicitly modified)`);
    }
  }
}
