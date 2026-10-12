const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

cleanRepo();

// 1. Write Prompt Description
const promptText = `Add a \`skipEncoding\` option to \`.default()\` so default-valued outputs can be omitted during encode.

When \`skipEncoding\` triggers inside a container, the default value is omitted from the encoded output:
- Objects and Records: the matching property key and value are omitted.
- Maps: if either key or value schema triggers \`skipEncoding\`, the entry is omitted.
- Arrays and Sets: matching elements are removed.
- Tuples: matching elements are removed, compacting the tuple output array.

For literal defaults, \`skipEncoding\` compares the value after inner encoding against the default value. In nested chains, each defaulted schema independently evaluates its own rule.

Equality modes:
The \`skipEncoding\` option accepts a boolean (\`true\`/\`false\`), an object \`{ mode: "strict" | "shallow" | "deep" }\`, or a predicate function. Setting \`skipEncoding: true\` behaves as \`{ mode: "deep" }\`.
- Deep equality (\`{ mode: "deep" }\`): compares primitives (\`Object.is\`), Date (by timestamp), Array (recursive), plain objects (key-order-insensitive recursive ignoring non-enumerable properties), Map (order-insensitive matching keys/values), and Set (order-insensitive 1-to-1 bipartite matching).
- Shallow equality (\`{ mode: "shallow" }\`): compares elements in Array and Set by identity with \`Object.is()\`; for Map, compares both key and value identity with \`Object.is()\`; for plain objects, compares own enumerable property values by identity with \`Object.is()\`.
- Strict equality (\`{ mode: "strict" }\`): compares values with \`Object.is()\`.

Predicates and factory defaults:
- Predicates receive \`(encodedValue, rawDefaultValue)\` returning a boolean or \`Promise<boolean>\`.
- Calling \`.encode()\` synchronously with an async predicate throws: \`"Cannot use async skipEncoding in synchronous encode"\`.
- Factory defaults only support predicates. Passing a boolean or mode object throws: \`"Cannot use skipEncoding: true with a factory default"\`.
- Wrapper schemas (\`.optional()\`, \`.nullable()\`, \`.nullish()\`) are transparent to omission.
`;

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/3_UPLOAD_THIS_AS_PROMPT/prompt.txt', promptText.replace(/\r\n/g, '\n'), 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/prompt.txt', promptText.replace(/\r\n/g, '\n'), 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/PROMPT_ONLY_UPLOAD_THIS.txt', promptText.replace(/\r\n/g, '\n'), 'utf8');
console.log('1. prompt.txt updated.');

// 2. Write Test Spec (Covering all requested behaviors & edge cases)
const specContent = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

// 1. encode skips default values in objects
test("encode skips default values in objects", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: true }),
    b: z.string().default("hello", { skipEncoding: true }),
  });
  expect(schema.encode({ a: 0, b: "hello" })).toEqual({});
  expect(schema.encode({ a: 1, b: "hello" })).toEqual({ a: 1 });
  expect(schema.encode({ a: 0, b: "world" })).toEqual({ b: "world" });
  expect(schema.encode({ a: 1, b: "world" })).toEqual({ a: 1, b: "world" });
});

// 2. encode skips default values in maps (value side)
test("encode skips default values in maps", () => {
  const schema = z.map(z.string(), z.number().default(0, { skipEncoding: true }));
  const m1 = new Map([["a", 0], ["b", 1]]);
  const result = schema.encode(m1);
  expect(result).toEqual(new Map([["b", 1]]));
});

// 3. encode skips default values in arrays
test("encode skips default values in arrays", () => {
  const schema = z.array(z.number().default(0, { skipEncoding: true }));
  expect(schema.encode([0, 1, 0, 2])).toEqual([1, 2]);
});

// 4. encode skips default values in tuples
test("encode skips default values in tuples", () => {
  const schema = z.tuple([
    z.number().default(0, { skipEncoding: true }),
    z.string(),
  ]);
  expect(schema.encode([0, "a"])).toEqual(["a"]);
  expect(schema.encode([1, "a"])).toEqual([1, "a"]);
});

// 5. encode skips multiple default values in tuples
test("encode skips multiple default values in tuples", () => {
  const schema = z.tuple([
    z.number().default(0, { skipEncoding: true }),
    z.string().default("x", { skipEncoding: true }),
    z.boolean().default(false, { skipEncoding: true }),
  ]);
  expect(schema.encode([0, "x", false])).toEqual([]);
  expect(schema.encode([1, "x", false])).toEqual([1]);
  expect(schema.encode([0, "y", false])).toEqual(["y"]);
});

// 6. encode skips default values in sets
test("encode skips default values in sets", () => {
  const schema = z.set(z.number().default(0, { skipEncoding: true }));
  const s = new Set([0, 1, 2]);
  const result = schema.encode(s);
  expect(result).toEqual(new Set([1, 2]));
});

// 7. predicate receives rawDefaultValue parameter
test("predicate receives rawDefaultValue parameter", () => {
  let passedRaw: any = null;
  const schema = z.object({
    a: z.string().default("fallback", {
      skipEncoding: (val: any, raw?: any) => {
        passedRaw = raw;
        return val === "fallback";
      },
    }),
  });
  expect(schema.encode({ a: "fallback" })).toEqual({});
  expect(passedRaw).toBe("fallback");
});

// 8. async support with async predicate
test("async support", async () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v: any) => v === 0 }),
  });
  expect(await schema.encodeAsync({ a: 0 })).toEqual({});
  expect(await schema.encodeAsync({ a: 1 })).toEqual({ a: 1 });
});

// 9. sync encode with async predicate throws error
test("sync encode with async predicate throws error", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v: any) => v === 0 }),
  });
  expect(() => schema.encode({ a: 0 })).toThrowError(/Cannot use async skipEncoding in synchronous encode/);
});

// 10. nested defaults
test("nested defaults", () => {
  const inner = z.object({ x: z.number() }).default({ x: 0 }, { skipEncoding: true });
  const outer = z.object({ inner }).default({ inner: { x: 0 } }, { skipEncoding: true });
  const schema = z.object({ outer });
  expect(schema.encode({ outer: { inner: { x: 0 } } })).toEqual({});
  expect(schema.encode({ outer: { inner: { x: 1 } } })).toEqual({ outer: { inner: { x: 1 } } });
});

// 11. mini API exhaustive
test("mini API exhaustive", () => {
  const s1 = z.object({ n: z.number().default(0, { skipEncoding: true }) });
  expect(s1.encode({ n: 0 })).toEqual({});
  expect(s1.encode({ n: 1 })).toEqual({ n: 1 });

  const s2 = z.string().default("x", { skipEncoding: true });
  const obj2 = z.object({ v: s2 });
  expect(obj2.encode({ v: "x" })).toEqual({});
  expect(obj2.encode({ v: "y" })).toEqual({ v: "y" });

  const s3 = z.boolean().default(false, { skipEncoding: true });
  const obj3 = z.object({ flag: s3 });
  expect(obj3.encode({ flag: false })).toEqual({});
  expect(obj3.encode({ flag: true })).toEqual({ flag: true });
});

// 12. factory defaults with predicate
test("factory defaults", () => {
  const schema = z.object({
    arr: z.array(z.number()).default(() => [], { skipEncoding: (v: any) => v.length === 0 }),
  });
  expect(schema.encode({ arr: [] })).toEqual({});
  expect(schema.encode({ arr: [1] })).toEqual({ arr: [1] });
});

// 13. strict equality mode
test("strict equality mode", () => {
  const schema = z.object({
    n: z.number().default(0, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ n: 0 })).toEqual({});
  expect(schema.encode({ n: -0 })).toEqual({ n: -0 });
  expect(schema.encode({ n: 1 })).toEqual({ n: 1 });
});

// 14. shallow equality mode
test("shallow equality mode", () => {
  const obj = { x: 1 };
  const schema = z.object({
    o: z.object({ x: z.number() }).default(obj, { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ o: obj })).toEqual({});
  expect(schema.encode({ o: { x: 1 } })).toEqual({});
  expect(schema.encode({ o: { x: 2 } })).toEqual({ o: { x: 2 } });
});

// 15. wrapper transparency
test("wrapper transparency", () => {
  const schema = z.object({
    opt: z.number().default(0, { skipEncoding: true }).optional(),
    nul: z.number().default(0, { skipEncoding: true }).nullable(),
  });
  expect(schema.encode({ opt: 0, nul: 0 })).toEqual({});
  expect(schema.encode({ opt: 1, nul: 2 })).toEqual({ opt: 1, nul: 2 });
});

// 16. nullish wrapper transparency
test("nullish wrapper transparency", () => {
  const schema = z.object({
    a: z.string().default("def", { skipEncoding: true }).nullish(),
  });
  expect(schema.encode({ a: "def" })).toEqual({});
  expect(schema.encode({ a: "custom" })).toEqual({ a: "custom" });
  expect(schema.encode({ a: null })).toEqual({ a: null });
});

// 17. skipEncoding: false does not skip
test("skipEncoding: false does not skip", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: false }),
  });
  expect(schema.encode({ a: 0 })).toEqual({ a: 0 });
});

// 18. tuple middle element removal
test("tuple middle element removal", () => {
  const schema = z.tuple([
    z.string(),
    z.number().default(0, { skipEncoding: true }),
    z.boolean(),
  ]);
  expect(schema.encode(["a", 0, true])).toEqual(["a", true]);
  expect(schema.encode(["a", 1, true])).toEqual(["a", 1, true]);
});

// 19. deep equality ignores non-enumerable properties
test("deep equality ignores non-enumerable properties", () => {
  const defaultObj: any = { a: 1 };
  Object.defineProperty(defaultObj, "secret", {
    value: "hidden",
    enumerable: false,
    configurable: true,
  });

  const schema = z.object({
    obj: z.object({ a: z.number() }).default(defaultObj, { skipEncoding: true }),
  });

  expect(schema.encode({ obj: { a: 1 } })).toEqual({});
});

// 20. tuple multiple middle elements compacts correctly
test("tuple multiple middle elements compacts correctly", () => {
  const schema = z.tuple([
    z.number(),
    z.string().default("a", { skipEncoding: true }),
    z.string().default("b", { skipEncoding: true }),
    z.boolean(),
  ]);
  expect(schema.encode([10, "a", "b", true])).toEqual([10, true]);
});

// 21. Reviewer T3: Set deep equality requires 1-to-1 bipartite matching with equal cardinality
test("Set deep equality requires 1-to-1 bipartite matching with equal cardinality", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(
      new Set([{ a: 1 }, { a: 2 }]),
      { skipEncoding: true }
    ),
  });
  // Positive case: matching elements
  expect(schema.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
  // Negative case: equal size (2) but both match { a: 1 } - cannot match { a: 2 }
  const nonMatching = new Set([{ a: 1 }, { a: 1 }]);
  expect(schema.encode({ s: nonMatching })).toEqual({ s: nonMatching });
});

// 22. Reviewer T4: shallow equality mode - Map key and value identity
test("shallow equality mode - Map key and value identity", () => {
  const v1 = { val: "a" };
  const schema = z.object({
    m: z.map(z.string(), z.any()).default(
      new Map([["k1", v1]]),
      { skipEncoding: { mode: "shallow" } }
    ),
  });
  // Positive case: exact same key and value references
  expect(schema.encode({ m: new Map([["k1", v1]]) })).toEqual({});
  // Negative case: distinct instance
  expect(schema.encode({ m: new Map([["k1", { val: "a" }]]) })).toEqual({
    m: new Map([["k1", { val: "a" }]]),
  });
});

// 23. encodeAsync with factory default and async predicate
test("encodeAsync with factory default and async predicate", async () => {
  const schema = z.object({
    arr: z.array(z.number()).default(() => [], {
      skipEncoding: async (v: any) => v.length === 0,
    }),
  });
  expect(await schema.encodeAsync({ arr: [] })).toEqual({});
  expect(await schema.encodeAsync({ arr: [1] })).toEqual({ arr: [1] });
});

// 24. Audit requirement: Map key-side schema triggering skipEncoding omission
test("Map key-side default schema triggers entry omission", () => {
  const schema = z.map(
    z.string().default("omitted_key", { skipEncoding: true }),
    z.number()
  );
  const m = new Map([
    ["omitted_key", 10],
    ["valid_key", 20],
  ]);
  expect(schema.encode(m)).toEqual(new Map([["valid_key", 20]]));
});

// 25. Audit requirement: Records omission behavior
test("Records omission with skipEncoding", () => {
  const schema = z.record(
    z.string(),
    z.number().default(0, { skipEncoding: true })
  );
  expect(schema.encode({ a: 0, b: 1, c: 0, d: 2 })).toEqual({ b: 1, d: 2 });
});

// 26. Audit requirement: Factory default rejects boolean option with exact error
test("factory default rejects boolean option with exact error", () => {
  const schema = z.object({
    a: z.number().default(() => 0, { skipEncoding: true }),
  });
  expect(() => schema.encode({ a: 0 })).toThrowError(/Cannot use skipEncoding: true with a factory default/);
});

// 27. Audit requirement: Deep equality for Date instances
test("deep equality compares Date by timestamp", () => {
  const defaultDate = new Date(1700000000000);
  const schema = z.object({
    d: z.date().default(defaultDate, { skipEncoding: true }),
  });
  expect(schema.encode({ d: new Date(1700000000000) })).toEqual({});
  expect(schema.encode({ d: new Date(1700000000001) })).toEqual({ d: new Date(1700000000001) });
});
`;

// 3. Test Runner test.sh (POSIX compliant, robust runner)
const testShContent = `#!/bin/bash

OUTPUT_PATH=""
MODE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
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

if [ "$MODE" = "base" ]; then
  TEST_FILE="packages/zod/src/v4/classic/tests/default.test.ts"
else
  TEST_FILE="packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts"
fi

RUNNER="pnpm exec vitest"
if ! command -v pnpm &> /dev/null; then
  RUNNER="npx vitest"
fi

if [ -n "$OUTPUT_PATH" ]; then
  $RUNNER run "$TEST_FILE" --reporter=default --reporter=junit --outputFile="$OUTPUT_PATH"
else
  $RUNNER run "$TEST_FILE"
fi
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const testShPath = path.join(ZOD_DIR, 'test.sh');

fs.writeFileSync(specPath, specContent.replace(/\r\n/g, '\n'), 'utf8');
fs.writeFileSync(testShPath, testShContent.replace(/\r\n/g, '\n'), 'utf8');

execSync('git add packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts test.sh', { cwd: ZOD_DIR });
execSync('git update-index --chmod=+x test.sh', { cwd: ZOD_DIR });

const finalTestPatch = execSync('git diff --staged --binary', { cwd: ZOD_DIR }).toString('utf8').replace(/\r\n/g, '\n');

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch', finalTestPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/test.patch', finalTestPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_ONLY_UPLOAD_THIS.patch', finalTestPatch, 'utf8');
console.log('2. test.patch created and synchronized.');

// Clean and test solution against all 27 tests
cleanRepo();
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/test.patch', { cwd: ZOD_DIR, stdio: 'pipe' });

const vitestOut = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', {
  cwd: ZOD_DIR
}).toString('utf8');

console.log('3. Vitest output:\n', vitestOut);
