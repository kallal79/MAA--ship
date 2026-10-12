const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ZOD = path.join(ROOT, 'zod');
const bundle = path.join(ROOT, 'zod_repo.bundle');
const targetGit = path.join(ZOD, '.git');
const internalGit = path.join(ZOD, '.git_internal');

if (!fs.existsSync(targetGit)) {
  if (fs.existsSync(internalGit)) {
    console.log('Restoring zod .git from local .git_internal...');
    fs.cpSync(internalGit, targetGit, { recursive: true });
    console.log('zod .git restored successfully!');
  } else if (fs.existsSync(bundle)) {
    console.log('Restoring zod .git from zod_repo.bundle...');
    const tempDir = path.join(ROOT, 'temp_zod_clone');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    cp.execSync(`git clone "${bundle}" "${tempDir}"`, { stdio: 'inherit' });
    fs.renameSync(path.join(tempDir, '.git'), targetGit);
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('zod .git restored successfully from bundle!');
  }
} else {
  console.log('zod .git already exists.');
}
