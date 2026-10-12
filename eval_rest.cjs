const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testFileSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/2fabeeec-d12f-4941-bbf9-ce939f4abe27/patch_dir/encode-defaults.8a4f9b.test.final.ts';
const testFileContent = fs.readFileSync(testFileSource, 'utf8');

const agents = ['Nova_Nova_3', 'Nova_Nova_4', 'Nova_Nova_5', 'Nova_Nova_6', 'Nova_Nova_7', 'Nova_Nova_8', 'Nova_Nova_9', 'Nova_Nova_10', 'Nova_Nova_11'];

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    console.log(agent + ' NO_PATCH');
    return;
  }
  
  cp.execSync('git clean -fd && git reset HEAD --hard', {cwd: zodDir, stdio: 'ignore'});
  cp.execSync('git checkout 1fb56a5c', {cwd: zodDir, stdio: 'ignore'});
  cp.execSync('node -e "const fs=require(\'fs\'); [\'vitest.config.ts\', \'packages/zod/vitest.config.ts\'].forEach(f => { if(fs.existsSync(f)) { fs.writeFileSync(f, fs.readFileSync(f, \'utf8\').replace(/enabled:\\\\s*true/g, \'enabled: false\')); } });"', {cwd: zodDir, stdio: 'ignore'});
  
  try {
    cp.execSync('git apply "' + agentPatch + '"', {cwd: zodDir, stdio: 'ignore'});
  } catch (e) {
    try {
        cp.execSync('git apply --ignore-whitespace "' + agentPatch + '"', {cwd: zodDir, stdio: 'ignore'});
    } catch(e2) {
        console.log(agent + ' PATCH_FAIL');
        return;
    }
  }
  
  fs.writeFileSync(path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.test.ts'), testFileContent);
  
  return new Promise((resolve) => {
    const child = cp.spawn('node', ['node_modules/vitest/vitest.mjs', 'run', 'packages/zod/src/v4/classic/tests/encode-defaults.test.ts', '--no-typecheck'], { cwd: zodDir, stdio: 'ignore' });
    
    let isDone = false;
    let timer = setTimeout(() => {
      if (isDone) return;
      isDone = true;
      try { cp.execSync('taskkill /pid ' + child.pid + ' /T /F', {stdio: 'ignore'}); } catch(e){}
      console.log(agent + ' TIMEOUT');
      resolve();
    }, 15000);

    child.on('exit', (code) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      if (code === 0) {
        console.log(agent + ' PASS');
      } else {
        console.log(agent + ' FAIL');
      }
      resolve();
    });
  });
}

async function main() {
  for (const agent of agents) {
    await runTest(agent);
  }
}
main();
