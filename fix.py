import sys
import re

with open('C:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/test.patch', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Factory defaults Regex to JSON
c = c.replace(
    '    z.number()\n      .default(() => Math.random(), { skipEncoding: { mode: "deep" } })\n      .encode(0);\n  }).toThrow(/Cannot use skipEncoding.*mode.*deep.*with a factory default/);\n});',
    '    z.number()\n      .default(() => Math.random(), { skipEncoding: { mode: "deep" } })\n      .encode(0);\n  }).toThrow(\'Cannot use skipEncoding: {"mode":"deep"} with a factory default\');\n});'
)

# 2. TS API Surface
c = c.replace(
    '+test("root-level encode", () => {\n+  const schema = z.number().default(0, { skipEncoding: true });\n+  expect(schema.encode(0)).toEqual(0);\n+  const objSchema = z.object({ a: schema });\n+  expect(objSchema.encode({ a: 0 })).toEqual({});\n+});',
    '+test("root-level encode", () => {\n+  const schema = z.number().default(0, { skipEncoding: true });\n+  expect(schema.encode(0)).toEqual(0);\n+  const objSchema = z.object({ a: schema });\n+  expect(objSchema.encode({ a: 0 })).toEqual({});\n+});\n+\n+test("TypeScript API surface", () => {\n+  // @ts-expect-error\n+  z.number().default(0, { skipEncoding: { mode: "invalid" } });\n+  // @ts-expect-error\n+  z.number().default(0, { skipEncoding: (v: string) => true });\n+  \n+  z.number().default(0, { skipEncoding: true });\n+  z.number().default(0, { skipEncoding: { mode: "shallow" } });\n+  z.number().default(0, { skipEncoding: (v: number) => true });\n+});'
)

# 3. Bipartite match logic
c = c.replace(
    '+test("Set deep equality requires 1-to-1 bipartite matching", () => {\n+  const schema = z.object({\n+    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 1 }]), { skipEncoding: true }),\n+  });\n+  expect(schema.encode({ s: new Set([{ a: 1 }]) })).toEqual({\n+    s: new Set([{ a: 1 }]),\n+  });\n+\n+  // Exact match - should skip. Fails on base branch.\n+  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) })).toEqual({});\n+});',
    '+test("Set deep equality requires 1-to-1 bipartite matching", () => {\n+  const schema = z.object({\n+    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),\n+  });\n+  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) })).toEqual({ s: new Set([{ a: 1 }, { a: 1 }]) });\n+  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 2 }]) })).toEqual({});\n+});'
)

# 4. Shallow mode Map
c = c.replace(
    '+test("shallow equality mode", () => {\n+  const innerObj = { a: 1 };\n+  const innerArr = [2];\n+  const schema = z.object({\n+    arr: z.array(z.any()).default([1, innerObj], { skipEncoding: { mode: "shallow" } }),\n+    obj: z.record(z.string(), z.any()).default({ a: 1, b: innerArr }, { skipEncoding: { mode: "shallow" } }),\n+  });\n+  expect(schema.encode({ arr: [1, innerObj], obj: { a: 1, b: innerArr } })).toEqual({});\n+  expect(schema.encode({ arr: [1, { a: 1 }], obj: { a: 1, b: [2] } })).toEqual({\n+    arr: [1, { a: 1 }],\n+    obj: { a: 1, b: [2] },\n+  });\n+});',
    '+test("shallow equality mode", () => {\n+  const innerObj = { a: 1 };\n+  const innerArr = [2];\n+  const schema = z.object({\n+    arr: z.array(z.any()).default([1, innerObj], { skipEncoding: { mode: "shallow" } }),\n+    obj: z.record(z.string(), z.any()).default({ a: 1, b: innerArr }, { skipEncoding: { mode: "shallow" } }),\n+  });\n+  expect(schema.encode({ arr: [1, innerObj], obj: { a: 1, b: innerArr } })).toEqual({});\n+  expect(schema.encode({ arr: [1, { a: 1 }], obj: { a: 1, b: [2] } })).toEqual({\n+    arr: [1, { a: 1 }],\n+    obj: { a: 1, b: [2] },\n+  });\n+});\n+\n+test("shallow equality mode - Map", () => {\n+  const innerKey = { k: 1 };\n+  const innerVal = { v: 1 };\n+  const schema = z.object({\n+    m: z.map(z.any(), z.any()).default(new Map([[innerKey, innerVal]]), { skipEncoding: { mode: "shallow" } }),\n+  });\n+  expect(schema.encode({ m: new Map([[{ k: 1 }, innerVal]]) })).toEqual({ m: new Map([[{ k: 1 }, innerVal]]) });\n+  expect(schema.encode({ m: new Map([[innerKey, { v: 1 }]]) })).toEqual({ m: new Map([[innerKey, { v: 1 }]]) });\n+  expect(schema.encode({ m: new Map([[innerKey, innerVal]]) })).toEqual({});\n+});'
)

# Convert all CRLF to LF to avoid issues
c = c.replace('\r\n', '\n')

with open('C:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/test.patch', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print("Done")
