const { execSync } = require('child_process');
const fs = require('fs');
const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

function cleanRepo() {
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
}

// 1. Clean and apply solution + test patch
cleanRepo();
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/test.patch', { cwd: ZOD_DIR, stdio: 'pipe' });

// 2. Test base mode with test.sh (via bash)
try {
  const outBase = execSync('bash test.sh base --output_path junit-base.xml', { cwd: ZOD_DIR }).toString();
  console.log('test.sh base mode: SUCCESS');
  console.log('junit-base.xml exists:', fs.existsSync(ZOD_DIR + '/junit-base.xml'));
} catch (e) {
  console.log('test.sh base mode error:', e.stdout ? e.stdout.toString() : e.message);
}

// 3. Test new mode with test.sh
try {
  const outNew = execSync('bash test.sh new --output_path junit-new.xml', { cwd: ZOD_DIR }).toString();
  console.log('test.sh new mode: SUCCESS');
  console.log('junit-new.xml exists:', fs.existsSync(ZOD_DIR + '/junit-new.xml'));
  const junit = fs.readFileSync(ZOD_DIR + '/junit-new.xml', 'utf8');
  console.log('JUnit XML first 300 chars:', junit.substring(0, 300));
} catch (e) {
  console.log('test.sh new mode error:', e.stdout ? e.stdout.toString() : e.message);
}
