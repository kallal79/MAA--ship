const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const trackedRaw = cp.execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const tracked = new Set(trackedRaw.map(s => s.trim().replace(/^"|"$/g, '')));
console.log('Total tracked files in git:', tracked.size);

let untrackedList = [];
function walk(dir) {
  let count = 0;
  for (const f of fs.readdirSync(dir)) {
    if (f === '.git' || f === 'node_modules' || f === '.git_internal') continue;
    const p = path.join(dir, f);
    const rel = path.relative('.', p).replace(/\\/g, '/');
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      count += walk(p);
    } else {
      count++;
      if (!tracked.has(rel)) {
        untrackedList.push(rel);
      }
    }
  }
  return count;
}

const totalDisk = walk('.');
console.log('Total files on disk (excluding node_modules, .git, .git_internal):', totalDisk);
console.log('Untracked files count:', untrackedList.length);
if (untrackedList.length > 0) {
  console.log('Untracked files:', untrackedList);
} else {
  console.log('>>> 100% PERFECT PARITY: ALL FILES ARE TRACKED IN GIT <<<');
}
