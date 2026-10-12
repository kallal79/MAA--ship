const fs = require('fs');
let code = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch', 'utf8');

// Fix permissions
code = code.replace('new file mode 100644', 'new file mode 100755');

// Fix test.sh commands to add typecheck.enabled=true for the new mode ONLY
const findStr1 = 'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts --reporter';
const replaceStr1 = 'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts --typecheck.enabled=true --reporter';

const findStr2 = 'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts\n';
const replaceStr2 = 'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts --typecheck.enabled=true\n';

code = code.replace(findStr1, replaceStr1);
code = code.replace(findStr2, replaceStr2);

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V6.patch', code, 'utf8');
console.log("Done");
