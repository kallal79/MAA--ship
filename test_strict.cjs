const fs = require('fs');
const cp = require('child_process');

function runTest(testCode) {
  let p = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', 'utf8');
  // Skip all 3
  p = p.replace(/\+test\("encode skips default values with deep equality"/, '+test.skip("encode skips default values with deep equality"');
  p = p.replace(/\+test\("chained defaulted schemas evaluate skipEncoding independently"/, '+test.skip("chained defaulted schemas evaluate skipEncoding independently"');
  p = p.replace(/\+test\("implicit default option behaves as deep"/, '+test.skip("implicit default option behaves as deep"');
  
  // Unskip the specific test
  p = p.replace('+test.skip("' + testCode + '"', '+test("' + testCode + '"');
  
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', p);
  cp.execSync('node ../evaluate_all_12_agents_final.cjs', { cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore' });
  const md = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md', 'utf8');
  const match = md.match(/\*\*Total Passing Agents:\*\* (\d+)\/12/);
  console.log(`Test: ${testCode} -> ${match ? match[1] : '?'} passed`);
}

runTest('encode skips default values with deep equality');
runTest('chained defaulted schemas evaluate skipEncoding independently');
runTest('implicit default option behaves as deep');

