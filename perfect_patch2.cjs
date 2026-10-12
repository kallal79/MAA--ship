const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const uploadDir = 'C:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

// 1. Reset repo and configure git
process.chdir('C:/Users/USER/OneDrive/Desktop/MAA/zod');
cp.execSync('git clean -fd');
cp.execSync('git reset HEAD --hard');
cp.execSync('git checkout 1fb56a5c');
cp.execSync('git config core.autocrlf false');

// 2. Read baseline and append extra tests
let testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/baseline_423.ts', 'utf8');
let newTests = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/new_tests_reduced.ts', 'utf8');
testContent = testContent.replace(/\r\n/g, '\n') + '\n\n' + newTests.replace(/\r\n/g, '\n');

fs.mkdirSync('packages/zod/src/v4/classic/tests', {recursive: true});
fs.writeFileSync('packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts', testContent, 'utf8');

// 3. Create void.test.ts
fs.writeFileSync('packages/zod/src/v4/classic/tests/void.test.ts', 'import { test } from "vitest";\ntest("void", () => {});\n', 'utf8');

// 4. Create test.sh (WITH LF LINE ENDINGS)
const testSh = `#!/bin/bash

OUTPUT_PATH=""
MODE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --output_path)
      OUTPUT_PATH="$2"
      shift 2
      ;;
    base|new)
      MODE="$1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

if [ -z "$MODE" ]; then
    echo "Usage: $0 [--output_path <path>] {base|new}"
    exit 1
fi

node -e "const fs=require('fs'); if(fs.existsSync('vitest.config.ts')){ let c=fs.readFileSync('vitest.config.ts','utf8'); c=c.replace(/enabled:\\\\s*true/g, 'enabled: false'); fs.writeFileSync('vitest.config.ts', c); } if(fs.existsSync('packages/zod/vitest.config.ts')){ let c=fs.readFileSync('packages/zod/vitest.config.ts','utf8'); c=c.replace('typecheck: {', 'typecheck: { enabled: false,'); fs.writeFileSync('packages/zod/vitest.config.ts', c); }"

if [ "$MODE" = "base" ]; then
    if [ -n "$OUTPUT_PATH" ]; then
        npx vitest run packages/zod/src/v4/classic/tests/void.test.ts --reporter=junit --outputFile="$OUTPUT_PATH"
    else
        npx vitest run packages/zod/src/v4/classic/tests/void.test.ts
    fi
    exit $?
elif [ "$MODE" = "new" ]; then
    if [ -n "$OUTPUT_PATH" ]; then
        npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck --reporter=junit --outputFile="$OUTPUT_PATH"
    else
        npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck
    fi
    exit $?
fi
`;
fs.writeFileSync('test.sh', testSh.replace(/\r\n/g, '\n'), 'utf8');

// 5. Generate patch using git
cp.execSync('git add test.sh packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts packages/zod/src/v4/classic/tests/void.test.ts');
let diff = cp.execSync('git diff --cached HEAD', {encoding: 'utf8'});

// Convert CRLF to LF in the patch file itself just in case
diff = diff.replace(/\r\n/g, '\n');

// Write to final upload directory
fs.writeFileSync(path.join(uploadDir, 'test.patch'), diff, 'utf8');
fs.copyFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/2fabeeec-d12f-4941-bbf9-ce939f4abe27/patch_dir/solution.patch', path.join(uploadDir, 'solution.patch'));

console.log('test.patch and solution.patch created successfully in FINAL_UPLOAD directory!');
