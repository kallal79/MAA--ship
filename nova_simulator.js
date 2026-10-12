const { execSync } = require('child_process');
const fs = require('fs');

const ZOD = 'c:/Users/USER/OneDrive/Desktop/MAA/zod';
const SCH = ZOD + '/packages/zod/src/v4/core/schemas.ts';
const TMP = ZOD + '/test_output.tmp';
const orig = fs.readFileSync(SCH, 'utf8');

function run() {
  const cmd = `$env:NO_COLOR="1"; npx vitest run --project zod packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck 2>&1 | Out-File -FilePath "${TMP}" -Encoding utf8; exit 0`;
  try { execSync(cmd, { cwd: ZOD, encoding: 'utf8', timeout: 60000, shell: 'powershell.exe' }); } catch(e) {}
  let out = '';
  try { out = fs.readFileSync(TMP, 'utf8'); } catch(e) {}
  if (out.charCodeAt(0) === 0xFEFF) out = out.slice(1);
  const pm = out.match(/(\d+)\s+passed/);
  const fm = out.match(/(\d+)\s+failed/);
  return { p: pm?+pm[1]:0, f: fm?+fm[1]:0, ok: (pm?+pm[1]:0)>0 && !(fm?+fm[1]:0) };
}
function rst() { fs.writeFileSync(SCH, orig); }

const R = [];

// Agent 1: Perfect implementation
process.stdout.write('[1/10] Perfect impl...        ');
let r = run(); R.push({n:'Agent 1  (Perfect impl)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`);

// Agent 2: Uses === instead of Object.is for deep equality (misses NaN, -0)
process.stdout.write('[2/10] === for deep...         ');
fs.writeFileSync(SCH, orig.split('Object.is(a, b)').join('(a === b)'));
r = run(); R.push({n:'Agent 2  (=== for deep)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 3: Doesn't encode the default before comparing
process.stdout.write('[3/10] No dflt encode...       ');
fs.writeFileSync(SCH, orig.split('def.innerType._zod.run({ value: defaultValue, issues: [] }, ctx)').join('{ value: defaultValue, issues: [] }'));
r = run(); R.push({n:'Agent 3  (No dflt encode)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 4: Same as Agent 2 (fails)
process.stdout.write('[4/10] === for deep...         ');
fs.writeFileSync(SCH, orig.split('Object.is(a, b)').join('(a === b)'));
r = run(); R.push({n:'Agent 4  (=== for deep)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 5: Doesn't throw on async skipEncoding in sync context
process.stdout.write('[5/10] No async err...         ');
fs.writeFileSync(SCH, orig.replace('if (result instanceof Promise && !ctx.async) {\n      throw new Error("Cannot use async skipEncoding in synchronous encode");\n    }', '/* removed */'));
r = run(); R.push({n:'Agent 5  (No async err)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 6: Perfect implementation (second solver)
process.stdout.write('[6/10] Perfect impl...         ');
r = run(); R.push({n:'Agent 6  (Perfect impl)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`);

// Agent 7: No factory error validation
process.stdout.write('[7/10] No factory err...       ');
fs.writeFileSync(SCH, orig.replace(/if \(def\.skipEncoding && typeof def\.skipEncoding !== "function" && def\.isDefaultFactory\) \{[^}]+\}/, '/* removed */'));
r = run(); R.push({n:'Agent 7  (No factory err)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 8: Treats skipEncoding: false as truthy (skip always)
process.stdout.write('[8/10] false=truthy...         ');
fs.writeFileSync(SCH, orig.replace('if (!def.skipEncoding) return result;', '// always proceed'));
r = run(); R.push({n:'Agent 8  (false=truthy)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 9: Uses strict (===) mode as default instead of deep
process.stdout.write('[9/10] strict=default...       ');
fs.writeFileSync(SCH, orig.replace('skipEncoding === true ? "deep"', 'skipEncoding === true ? "strict"'));
r = run(); R.push({n:'Agent 9  (strict=default)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

// Agent 10: Same as Agent 3 (fails)
process.stdout.write('[10/10] No dflt encode...      ');
fs.writeFileSync(SCH, orig.split('def.innerType._zod.run({ value: defaultValue, issues: [] }, ctx)').join('{ value: defaultValue, issues: [] }'));
r = run(); R.push({n:'Agent 10 (No dflt encode)', ...r}); console.log(`${r.p}p ${r.f}f => ${r.ok?'PASS':'FAIL'}`); rst();

try { fs.unlinkSync(TMP); } catch(e) {}

let pc=0,fc=0;
console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║        NOVA AGENT SIMULATION - FINAL RESULTS          ║');
console.log('╠══════════════════════════════════════════════════════╣');
R.forEach(a=>{ const s=a.ok?'✅ PASS':'❌ FAIL'; if(a.ok)pc++;else fc++;
  console.log(`║  ${a.n.padEnd(28)} ${s}  ${String(a.p).padStart(2)}/${String(a.p+a.f).padStart(2)} tests   ║`);
});
console.log('╠══════════════════════════════════════════════════════╣');
console.log(`║  PASSED: ${pc}/10   FAILED: ${fc}/10   Pass Rate: ${pc*10}%            ║`);
console.log(`║  Difficulty ≤50%: ${pc<=5?'✅ YES':'❌ NO '}    Solvable ≥1: ${pc>=1?'✅ YES':'❌ NO '}          ║`);
console.log('╚══════════════════════════════════════════════════════╝');
