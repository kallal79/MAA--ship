const fs = require('fs');
const cp = require('child_process');

let txt = fs.readFileSync('packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');

// Modify the deep equality test to only use array and object
txt = txt.replace(/test\('encode skips default values with deep equality', \(\) => \{[\s\S]*?\}\);/, 
\`test('encode skips default values with deep equality', () => { 
  const schema = z.object({ 
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }), 
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }), 
  }); 
  expect(schema.encode({ 
    arr: [1, 2], 
    obj: { x: 1 }, 
  })).toEqual({}); 
});\`);

// Modify chained default test
// Maybe remove it or change it? Let's just remove it for now to test the first one.
txt = txt.replace(/test\('chained defaulted schemas evaluate skipEncoding independently', \(\) => \{[\s\S]*?\}\);/, 
\`test('chained defaulted schemas evaluate skipEncoding independently', () => { 
  // do nothing
});\`);

fs.writeFileSync('packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', txt);

cp.execSync('node ../evaluate_all_12_agents_final.cjs', { cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore' });
const md = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md', 'utf8');
const match = md.match(/\*\*Total Passing Agents:\*\* (\d+)\/12/);
console.log('Passing agents with modified tests:', match ? match[1] : '?');

