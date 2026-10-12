const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const agentData = {};

for (let i = 1; i <= 13; i++) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  agentData[i] = content;
}

console.log('Available agents:', Object.keys(agentData));

// Check specific keywords / patterns across all 13 agents
const patterns = [
  { name: 'skipEncoding predicate 2-args in zodDefault', re: /skipEncoding\([^)]*,[^)]*\)/ },
  { name: 'rawDefaultValue passed', re: /rawDefaultValue|def\.defaultValue/ },
  { name: 'Set bipartite matching', re: /bipartite|visited|matched/i },
  { name: 'Date getTime in deepEqual', re: /getTime/ },
  { name: 'Record encode key omission', re: /ZodRecord.*skipEncoding|record.*skipEncoding/s },
  { name: 'Map encode key omission', re: /ZodMap.*skipEncoding|map.*skipEncoding/s },
  { name: 'Tuple encode omission/splice/filter', re: /ZodTuple.*filter|ZodTuple.*splice|tuple.*skipEncoding/s },
  { name: 'Shallow mode Object.is on Set', re: /mode\s*===\s*["']shallow["'].*Set|shallow.*Set/s },
  { name: 'Shallow mode Object.is on Map', re: /mode\s*===\s*["']shallow["'].*Map|shallow.*Map/s },
  { name: 'Strict mode Object.is', re: /mode\s*===\s*["']strict["']|strict.*Object\.is/s },
  { name: 'Factory default error message with mode JSON', re: /JSON\.stringify.*mode|Cannot use skipEncoding: .* with a factory default/ },
  { name: 'Async predicate check in sync encode', re: /Cannot use async skipEncoding in synchronous encode/ },
  { name: 'nullish wrapper transparency in _clone', re: /nullish/ },
];

console.log('\n--- PATTERN MATRIX ---');
for (const pat of patterns) {
  const matching = [];
  for (const [id, content] of Object.entries(agentData)) {
    if (pat.re.test(content)) {
      matching.push(id);
    }
  }
  console.log(`${pat.name.padEnd(50)}: Agents [${matching.join(', ')}] (${matching.length}/13)`);
}
