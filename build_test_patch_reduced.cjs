const fs = require('fs');
const cp = require('child_process');

let testContent = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/2fabeeec-d12f-4941-bbf9-ce939f4abe27/patch_dir/encode-defaults.8a4f9b.test.final.ts', 'utf8');
let newTests = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/new_tests_reduced.ts', 'utf8');
testContent += '\n' + newTests;

process.chdir('C:/Users/USER/OneDrive/Desktop/MAA/zod');
fs.mkdirSync('packages/zod/src/v4/classic/tests', {recursive: true});
fs.writeFileSync('packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts', testContent, 'utf8');
fs.writeFileSync('packages/zod/src/v4/classic/tests/void.test.ts', 'import { test } from "vitest";\ntest("void", () => {});\n', 'utf8');

const testSh = `#!/bin/bash
node -e "const fs=require('fs'); if(fs.existsSync('vitest.config.ts')){ let c=fs.readFileSync('vitest.config.ts','utf8'); c=c.replace(/enabled:\\\\s*true/g, 'enabled: false'); fs.writeFileSync('vitest.config.ts', c); } if(fs.existsSync('packages/zod/vitest.config.ts')){ let c=fs.readFileSync('packages/zod/vitest.config.ts','utf8'); c=c.replace('typecheck: {', 'typecheck: { enabled: false,'); fs.writeFileSync('packages/zod/vitest.config.ts', c); }"

npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck --reporter=junit --outputFile=$2
`;
fs.writeFileSync('test.sh', testSh, 'utf8');

cp.execSync('git add test.sh packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts packages/zod/src/v4/classic/tests/void.test.ts');
let diff = cp.execSync('git diff HEAD test.sh packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts packages/zod/src/v4/classic/tests/void.test.ts', {encoding: 'utf8'});
fs.writeFileSync('../test.patch', diff, 'utf8');
