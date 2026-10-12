const fs = require('fs');
const { execSync } = require('child_process');
execSync('git reset --hard 1fb56a5c && git clean -fd', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod'});
execSync('git apply C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_7/solution-patch.patch', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod'});
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/traps.spec.ts', `
import { test } from 'vitest';
import { z } from '../index.js';
test('T', () => {
  const a = new Date(1);
  const s = z.any().default(a, { skipEncoding: true });
  const r = z.object({f: s}).encode({f: new Date(1)});
  console.log('RES:', r);
});
`);
try {
  console.log(execSync('pnpm vitest run packages/zod/src/v4/classic/tests/traps.spec.ts', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod'}).toString());
} catch(e) {
  console.log(e.stdout.toString());
}
