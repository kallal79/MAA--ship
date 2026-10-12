const { spawnSync } = require('child_process');
const fs = require('fs');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

let config = fs.readFileSync(ZOD_DIR + '/vitest.config.ts', 'utf8');
config = config.replace('enabled: true,', 'enabled: false,');
fs.writeFileSync(ZOD_DIR + '/vitest.config.ts', config);

const res = spawnSync('npx vitest run packages/zod/src/v4/classic/tests/default.test.ts --reporter=default --reporter=junit --outputFile=./test_results.xml', { cwd: ZOD_DIR, shell: true });

console.log('With vitest.config.ts enabled: false -> Status:', res.status);
console.log('Stdout:\n', res.stdout ? res.stdout.toString() : '');
console.log('Stderr:\n', res.stderr ? res.stderr.toString() : '');
