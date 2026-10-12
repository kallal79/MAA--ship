const fs = require("fs");
const cp = require("child_process");

const solutionPatch = `diff --git a/packages/zod/src/v4/classic/schemas.ts b/packages/zod/src/v4/classic/schemas.ts
index e46abf57..5e98f098 100644
--- a/packages/zod/src/v4/classic/schemas.ts
+++ b/packages/zod/src/v4/classic/schemas.ts
@@ -164,8 +164,8 @@ export interface ZodType<
   nonoptional(params?: string | core.$ZodNonOptionalParams): ZodNonOptional<this>;
   nullable(): ZodNullable<this>;
   nullish(): ZodOptional<ZodNullable<this>>;
-  default(def: util.NoUndefined<core.output<this>>): ZodDefault<this>;
-  default(def: () => util.NoUndefined<core.output<this>>): ZodDefault<this>;
+  default(def: util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams): ZodDefault<this>;
+  default(def: () => util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams): ZodDefault<this>;
   prefault(def: () => core.input<this>): ZodPrefault<this>;
   prefault(def: core.input<this>): ZodPrefault<this>;
   array(): ZodArray<this>;
@@ -316,8 +316,8 @@ export const ZodType: core.$constructor<ZodType> = /*@__PURE__*/ core.$construct
     transform(tx) {
       return pipe(this, transform(tx));
     },
-    default(d) {
-      return _default(this, d);
+    default(d, params) {
+      return _default(this, d, params);
     },
     prefault(d) {
       return prefault(this, d);
@@ -2154,13 +2154,18 @@ export const ZodDefault: core.$constructor<ZodDefault> = /*@__PURE__*/ core.$con
 
 export function _default<T extends core.SomeType>(
   innerType: T,
-  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams
 ): ZodDefault<T> {
+  const defaultValueIsFactory = typeof defaultValue === "function";
   return new ZodDefault({
     type: "default",
     innerType: innerType as any as core.$ZodType,
+    rawDefaultValue: defaultValueIsFactory ? undefined : defaultValue,
+    defaultValueIsFactory,
+    skipEncoding: params?.skipEncoding,
     get defaultValue() {
-      return typeof defaultValue === "function" ? (defaultValue as Function)() : util.shallowClone(defaultValue);
+      return defaultValueIsFactory ? (defaultValue as Function)() : util.shallowClone(defaultValue);
     },
   }) as any;
 }
diff --git a/packages/zod/src/v4/core/api.ts b/packages/zod/src/v4/core/api.ts
index c1d2d7ef..c67c351f 100644
--- a/packages/zod/src/v4/core/api.ts
+++ b/packages/zod/src/v4/core/api.ts
@@ -1464,18 +1464,23 @@ export function _nullable<T extends schemas.$ZodObject>(
 }
 
 // ZodDefault
-export type $ZodDefaultParams = TypeParams<schemas.$ZodDefault, "innerType" | "defaultValue">;
+export type $ZodDefaultParams = { skipEncoding?: schemas.$ZodDefaultSkipEncoding | undefined };
 // @__NO_SIDE_EFFECTS__
-export function _default<T extends schemas.$ZodObject>(
+export function _default<T extends schemas.SomeType>(
   Class: util.SchemaClass<schemas.$ZodDefault>,
   innerType: T,
-  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: $ZodDefaultParams
 ): schemas.$ZodDefault<T> {
+  const defaultValueIsFactory = typeof defaultValue === "function";
   return new Class({
     type: "default",
-    innerType,
+    innerType: innerType as any as schemas.$ZodType,
+    rawDefaultValue: defaultValueIsFactory ? undefined : defaultValue,
+    defaultValueIsFactory,
+    skipEncoding: params?.skipEncoding,
     get defaultValue() {
-      return typeof defaultValue === "function" ? (defaultValue as Function)() : util.shallowClone(defaultValue);
+      return defaultValueIsFactory ? (defaultValue as Function)() : util.shallowClone(defaultValue);
     },
   }) as any;
 }
diff --git a/packages/zod/src/v4/core/schemas.ts b/packages/zod/src/v4/core/schemas.ts
index 4f85fbf0..e7885ad6 100644
--- a/packages/zod/src/v4/core/schemas.ts
+++ b/packages/zod/src/v4/core/schemas.ts
@@ -34,6 +34,8 @@ export interface ParseContextInternal<T extends errors.$ZodIssueBase = never> ex
 export interface ParsePayload<T = unknown> {
   value: T;
   issues: errors.$ZodRawIssue[];
+  /** @internal Marks an encoded value for omission by the nearest container. */
+  omit?: boolean | undefined;
   /** A way to mark a whole payload as aborted. Used in codecs/pipes. */
   aborted?: boolean;
   /** @internal Marks a value as a fallback that an outer wrapper (e.g.
@@ -45,6 +47,13 @@ export interface ParsePayload<T = unknown> {
 
 export type CheckFn<T> = (input: ParsePayload<T>) => util.MaybeAsync<void>;
 
+const omitted = Symbol("zod_omitted");
+
+function compactOmitted<T extends unknown[]>(payload: ParsePayload<T>) {
+  payload.value = payload.value.filter((value) => value !== omitted) as T;
+  return payload;
+}
+
 /////////////////////////////   SCHEMAS   //////////////////////////////
 
 export interface $ZodTypeDef {
@@ -1631,7 +1640,7 @@ function handleArrayResult(result: ParsePayload<any>, final: ParsePayload<any[]>
   if (result.issues.length) {
     final.issues.push(...util.prefixIssues(index, result.issues));
   }
-  final.value[index] = result.value;
+  final.value[index] = result.omit ? omitted : result.value;
 }
 
 export const $ZodArray: core.$constructor<$ZodArray> = /*@__PURE__*/ core.$constructor("$ZodArray", (inst, def) => {
@@ -1651,7 +1660,7 @@ export const $ZodArray: core.$constructor<$ZodArray> = /*@__PURE__*/ core.$const
       return payload;
     }
 
-    payload.value = Array(input.length);
+    payload.value = [];
     const proms: Promise<any>[] = [];
     for (let i = 0; i < input.length; i++) {
       const item = input[i];
@@ -1671,10 +1680,10 @@ export const $ZodArray: core.$constructor<$ZodArray> = /*@__PURE__*/ core.$const
     }
 
     if (proms.length) {
-      return Promise.all(proms).then(() => payload);
+      return Promise.all(proms).then(() => compactOmitted(payload));
     }
 
-    return payload; //handleArrayResultsAsync(parseResults, final);
+    return compactOmitted(payload); //handleArrayResultsAsync(parseResults, final);
   };
 });
 
@@ -1764,6 +1773,8 @@ function handlePropertyResult(
     final.issues.push(...util.prefixIssues(key, result.issues));
   }
 
+  if (result.omit) return;
+
   if (!isPresent && !isOptionalIn) {
     if (!result.issues.length) {
       final.issues.push({
@@ -2027,12 +2038,14 @@ export const $ZodObjectJIT: core.$constructor<$ZodObject> = /*@__PURE__*/ core.$
           }
         }
         
-        if (${id}.value === undefined) {
-          if (${k} in input) {
-            newResult[${k}] = undefined;
+        if (!${id}.omit) {
+          if (${id}.value === undefined) {
+            if (${k} in input) {
+              newResult[${k}] = undefined;
+            }
+          } else {
+            newResult[${k}] = ${id}.value;
           }
-        } else {
-          newResult[${k}] = ${id}.value;
         }
         
       `);
@@ -2054,7 +2067,7 @@ export const $ZodObjectJIT: core.$constructor<$ZodObject> = /*@__PURE__*/ core.$
           });
         }
 
-        if (${id}_present) {
+        if (!${id}.omit && ${id}_present) {
           if (${id}.value === undefined) {
             newResult[${k}] = undefined;
           } else {
@@ -2072,12 +2085,14 @@ export const $ZodObjectJIT: core.$constructor<$ZodObject> = /*@__PURE__*/ core.$
           })));
         }
         
-        if (${id}.value === undefined) {
-          if (${k} in input) {
-            newResult[${k}] = undefined;
+        if (!${id}.omit) {
+          if (${id}.value === undefined) {
+            if (${k} in input) {
+              newResult[${k}] = undefined;
+            }
+          } else {
+            newResult[${k}] = ${id}.value;
           }
-        } else {
-          newResult[${k}] = ${id}.value;
         }
         
       `);
@@ -2759,7 +2774,7 @@ function handleTupleResult(result: ParsePayload, final: ParsePayload<any[]>, ind
   if (result.issues.length) {
     final.issues.push(...util.prefixIssues(index, result.issues));
   }
-  final.value[index] = result.value;
+  final.value[index] = result.omit ? omitted : result.value;
 }
 
 function handleTupleResults(
@@ -2782,7 +2797,7 @@ function handleTupleResults(
       }
       final.issues.push(...util.prefixIssues(i, r.issues));
     }
-    final.value[i] = r.value;
+    final.value[i] = r.omit ? omitted : r.value;
   }
 
   // Drop trailing slots that produced `undefined` for absent input
@@ -2798,7 +2813,7 @@ function handleTupleResults(
       break;
     }
   }
-  return final;
+  return compactOmitted(final);
 }
 
 //////////////////////////////////////////
@@ -2913,6 +2928,7 @@ export const $ZodRecord: core.$constructor<$ZodRecord> = /*@__PURE__*/ core.$con
             });
             continue;
           }
+          if (keyResult.omit) continue;
           const outKey = keyResult.value as PropertyKey;
           const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
 
@@ -2922,14 +2938,14 @@ export const $ZodRecord: core.$constructor<$ZodRecord> = /*@__PURE__*/ core.$con
                 if (result.issues.length) {
                   payload.issues.push(...util.prefixIssues(key, result.issues));
                 }
-                payload.value[outKey] = result.value;
+                if (!result.omit) payload.value[outKey] = result.value;
               })
             );
           } else {
             if (result.issues.length) {
               payload.issues.push(...util.prefixIssues(key, result.issues));
             }
-            payload.value[outKey] = result.value;
+            if (!result.omit) payload.value[outKey] = result.value;
           }
         }
       }
@@ -2992,6 +3008,7 @@ export const $ZodRecord: core.$constructor<$ZodRecord> = /*@__PURE__*/ core.$con
           continue;
         }
 
+        if (keyResult.omit) continue;
         const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
 
         if (result instanceof Promise) {
@@ -3000,14 +3017,14 @@ export const $ZodRecord: core.$constructor<$ZodRecord> = /*@__PURE__*/ core.$con
               if (result.issues.length) {
                 payload.issues.push(...util.prefixIssues(key, result.issues));
               }
-              payload.value[keyResult.value as PropertyKey] = result.value;
+              if (!result.omit) payload.value[keyResult.value as PropertyKey] = result.value;
             })
           );
         } else {
           if (result.issues.length) {
             payload.issues.push(...util.prefixIssues(key, result.issues));
           }
-          payload.value[keyResult.value as PropertyKey] = result.value;
+          if (!result.omit) payload.value[keyResult.value as PropertyKey] = result.value;
         }
       }
     }
@@ -3121,6 +3138,7 @@ function handleMapResult(
       });
     }
   }
+  if (keyResult.omit || valueResult.omit) return;
   final.value.set(keyResult.value, valueResult.value);
 }
 
@@ -3181,6 +3199,7 @@ function handleSetResult(result: ParsePayload, final: ParsePayload<Set<any>>) {
   if (result.issues.length) {
     final.issues.push(...result.issues);
   }
+  if (result.omit) return;
   final.value.add(result.value);
 }
 
@@ -3614,8 +3633,16 @@ export interface $ZodDefaultDef<T extends SomeType = $ZodType> extends $ZodTypeD
   innerType: T;
   /** The default value. May be a getter. */
   defaultValue: util.NoUndefined<core.output<T>>;
+  rawDefaultValue?: util.NoUndefined<core.output<T>> | undefined;
+  defaultValueIsFactory?: boolean | undefined;
+  skipEncoding?: $ZodDefaultSkipEncoding | undefined;
 }
 
+export type $ZodDefaultSkipEncoding =
+  | boolean
+  | ((encodedValue: unknown, rawDefaultValue: unknown) => boolean | Promise<boolean>)
+  | { mode: "strict" | "shallow" | "deep" };
+
 export interface $ZodDefaultInternals<T extends SomeType = $ZodType>
   extends $ZodTypeInternals<util.NoUndefined<core.output<T>>, core.input<T> | undefined> {
   def: $ZodDefaultDef<T>;
@@ -3640,7 +3667,11 @@ export const $ZodDefault: core.$constructor<$ZodDefault> = /*@__PURE__*/ core.$c
 
     inst._zod.parse = (payload, ctx) => {
       if (ctx.direction === "backward") {
-        return def.innerType._zod.run(payload, ctx);
+        const result = def.innerType._zod.run(payload, ctx);
+        if (result instanceof Promise) {
+          return result.then((result) => handleDefaultEncodeResult(result, def, ctx));
+        }
+        return handleDefaultEncodeResult(result, def, ctx);
       }
 
       // Forward direction (decode): apply defaults for undefined input
@@ -3668,6 +3699,161 @@ function handleDefaultResult(payload: ParsePayload, def: $ZodDefaultDef) {
   return payload;
 }
 
+function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, ctx: ParseContextInternal) {
+  if (!def.skipEncoding || payload.issues.length) return payload;
+
+  if (def.defaultValueIsFactory && typeof def.skipEncoding !== "function") {
+    throw new Error(\`Cannot use skipEncoding: \${JSON.stringify(def.skipEncoding)} with a factory default\`);
+  }
+
+  const defaultResult = def.innerType._zod.run({ value: def.defaultValue, issues: [] }, ctx);
+  if (defaultResult instanceof Promise) {
+    return defaultResult.then((defaultResult) => handleDefaultSkipEncoding(payload, defaultResult, def, ctx));
+  }
+  return handleDefaultSkipEncoding(payload, defaultResult, def, ctx);
+}
+
+function handleDefaultSkipEncoding(
+  payload: ParsePayload,
+  defaultResult: ParsePayload,
+  def: $ZodDefaultDef,
+  ctx: ParseContextInternal
+) {
+  if (defaultResult.issues.length) return payload;
+
+  const shouldSkip = shouldSkipDefaultEncoding(payload.value, defaultResult.value, def);
+  if (shouldSkip instanceof Promise) {
+    if (!ctx.async) throw new Error("Cannot use async skipEncoding in synchronous encode");
+    return shouldSkip.then((shouldSkip) => {
+      if (shouldSkip) payload.omit = true;
+      return payload;
+    });
+  }
+  if (shouldSkip) payload.omit = true;
+  return payload;
+}
+
+function shouldSkipDefaultEncoding(encodedValue: unknown, encodedDefault: unknown, def: $ZodDefaultDef) {
+  const skipEncoding = def.skipEncoding;
+  if (typeof skipEncoding === "function") {
+    return skipEncoding(encodedValue, def.defaultValueIsFactory ? undefined : def.rawDefaultValue);
+  }
+
+  const mode =
+    skipEncoding === true ? "deep" : skipEncoding && typeof skipEncoding === "object" ? skipEncoding.mode : undefined;
+  if (mode === "strict") return Object.is(encodedValue, encodedDefault);
+  if (mode === "shallow") return shallowEqual(encodedValue, encodedDefault);
+  if (mode === "deep") return deepEqual(encodedValue, encodedDefault);
+  return false;
+}
+
+function shallowEqual(left: unknown, right: unknown): boolean {
+  if (Object.is(left, right)) return true;
+  if (Array.isArray(left) && Array.isArray(right)) {
+    return left.length === right.length && left.every((value, index) => Object.is(value, right[index]));
+  }
+  if (left instanceof Map && right instanceof Map) {
+    if (left.size !== right.size) return false;
+    // Shallow mode for Maps: same keys and same values (using Object.is)
+    for (const [key, value] of left) {
+      if (!right.has(key) || !Object.is(value, right.get(key))) return false;
+    }
+    return true;
+  }
+  if (left instanceof Set && right instanceof Set) {
+    if (left.size !== right.size) return false;
+    // Shallow mode for Sets: same elements (using Object.is)
+    for (const value of left) {
+      if (!right.has(value)) return false;
+    }
+    return true;
+  }
+  if (util.isPlainObject(left) && util.isPlainObject(right)) {
+    const leftKeys = Reflect.ownKeys(left).filter((key) => Object.prototype.propertyIsEnumerable.call(left, key));
+    const rightKeys = Reflect.ownKeys(right).filter((key) => Object.prototype.propertyIsEnumerable.call(right, key));
+    if (leftKeys.length !== rightKeys.length) return false;
+    for (const key of leftKeys) {
+      if (!rightKeys.includes(key) || !Object.is((left as any)[key], (right as any)[key])) return false;
+    }
+    return true;
+  }
+  return false;
+}
+
+function deepEqual(left: unknown, right: unknown): boolean {
+  if (Object.is(left, right)) return true;
+  if (left instanceof Date && right instanceof Date) return Object.is(left.getTime(), right.getTime());
+  if (Array.isArray(left) && Array.isArray(right)) {
+    return left.length === right.length && left.every((value, index) => deepEqual(value, right[index]));
+  }
+  if (left instanceof Map && right instanceof Map) {
+    if (left.size !== right.size) return false;
+    const matched = new Set<number>();
+    for (const [leftKey, leftValue] of left) {
+      let found = false;
+      let index = 0;
+      for (const [rightKey, rightValue] of right) {
+        if (!matched.has(index) && deepEqual(leftKey, rightKey) && deepEqual(leftValue, rightValue)) {
+          matched.add(index);
+          found = true;
+          break;
+        }
+        index++;
+      }
+      if (!found) return false;
+    }
+    return true;
+  }
+  if (left instanceof Set && right instanceof Set) {
+    if (left.size !== right.size) return false;
+    const matched = new Set<number>();
+    for (const leftValue of left) {
+      let found = false;
+      let index = 0;
+      for (const rightValue of right) {
+        if (!matched.has(index) && deepEqual(leftValue, rightValue)) {
+          matched.add(index);
+          found = true;
+          break;
+        }
+        index++;
+      }
+      if (!found) return false;
+    }
+    return true;
+  }
+  if (util.isPlainObject(left) && util.isPlainObject(right)) {
+    const leftKeys = Reflect.ownKeys(left).filter((key) => Object.prototype.propertyIsEnumerable.call(left, key));
+    const rightKeys = Reflect.ownKeys(right).filter((key) => Object.prototype.propertyIsEnumerable.call(right, key));
+    if (leftKeys.length !== rightKeys.length) return false;
+    for (const key of leftKeys) {
+      if (!rightKeys.includes(key) || !deepEqual((left as any)[key], (right as any)[key])) return false;
+    }
+    return true;
+  }
+  return false;
+}
+
 ////////////////////////////////////////////
 ////////////////////////////////////////////
 //////////                        //////////
diff --git a/packages/zod/src/v4/mini/schemas.ts b/packages/zod/src/v4/mini/schemas.ts
index 38978a03..4791c589 100644
--- a/packages/zod/src/v4/mini/schemas.ts
+++ b/packages/zod/src/v4/mini/schemas.ts
@@ -1474,13 +1474,18 @@ export const ZodMiniDefault: core.$constructor<ZodMiniDefault> = /*@__PURE__*/ c
 // @__NO_SIDE_EFFECTS__
 export function _default<T extends SomeType>(
   innerType: T,
-  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>)
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams
 ): ZodMiniDefault<T> {
+  const defaultValueIsFactory = typeof defaultValue === "function";
   return new ZodMiniDefault({
     type: "default",
     innerType: innerType as any as core.$ZodType,
+    rawDefaultValue: defaultValueIsFactory ? undefined : defaultValue,
+    defaultValueIsFactory,
+    skipEncoding: params?.skipEncoding,
     get defaultValue() {
-      return typeof defaultValue === "function" ? (defaultValue as Function)() : util.shallowClone(defaultValue);
+      return defaultValueIsFactory ? (defaultValue as Function)() : util.shallowClone(defaultValue);
     },
   }) as any;
 }
`;

const testPatch = `diff --git a/packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts b/packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts
new file mode 100644
index 00000000..c7847c50
--- /dev/null
+++ b/packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts
@@ -0,0 +1,18 @@
+import { expect, test } from "vitest";
+import { z } from "../../../index.js";
+
+test("TypeScript declaration surface for skipEncoding", () => {
+  z.number().default(0, { skipEncoding: true });
+  z.number().default(0, { skipEncoding: { mode: "shallow" } });
+  z.number().default(0, { skipEncoding: { mode: "deep" } });
+  z.number().default(0, { skipEncoding: { mode: "strict" } });
+  z.number().default(0, { skipEncoding: (v: number) => v === 0 });
+
+  const s = z.object({ a: z.number().default(0, { skipEncoding: true }) });
+  expect(s.encode({ a: 0 })).toEqual({});
+  
+  // @ts-expect-error
+  z.number().default(0, { skipEncoding: { mode: "invalid" } });
+  // @ts-expect-error
+  z.number().default(0, { skipEncoding: "true" });
+});
diff --git a/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts
new file mode 100644
index 00000000..11111111
--- /dev/null
+++ b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts
@@ -0,0 +1,507 @@
+import { expect, test } from "vitest";
+import { z, OMIT } from "../../../index.js";
+import * as zmini from "../../mini/index.js";
+
+test("encode skips default values in objects", () => {
+  const schema = z.object({ a: z.number().default(0, { skipEncoding: true }) });
+  expect(schema.encode({ a: 0 })).toEqual({});
+  expect(schema.encode({ a: 1 })).toEqual({ a: 1 });
+});
+
+test("encode skips default values in records", () => {
+  const schema = z.record(z.string(), z.number().default(0, { skipEncoding: true }));
+  expect(schema.encode({ a: 0, b: 1 })).toEqual({ b: 1 });
+});
+
+test("encode skips default values in maps", () => {
+  const schema = z.map(z.string(), z.number().default(0, { skipEncoding: true }));
+  const map = new Map([
+    ["a", 0],
+    ["b", 1],
+  ]);
+  expect(schema.encode(map)).toEqual(new Map([["b", 1]]));
+});
+
+test("encode skips default values in arrays", () => {
+  const schema = z.array(z.number().default(0, { skipEncoding: true }));
+  const result = schema.encode([1, 0, 2]);
+  
+  const isCompacted = result.length === 2 && result[0] === 1 && result[1] === 2;
+  const isSparse = result.length === 3 && result[0] === 1 && !(1 in result) && result[2] === 2;
+  
+  expect(isCompacted || isSparse).toBe(true);
+});
+
+test("encode skips default values in tuples", () => {
+  const schema = z.tuple([z.string(), z.boolean(), z.number().default(0, { skipEncoding: true })]);
+  expect(schema.encode(["a", true, 0])).toEqual(["a", true]);
+});
+
+test("encode skips multiple default values in tuples", () => {
+  const schema = z.tuple([
+    z.string().default("a", { skipEncoding: true }),
+    z.boolean().default(false, { skipEncoding: true }),
+    z.number().default(0, { skipEncoding: true }),
+  ]);
+  expect(schema.encode(["a", false, 0])).toEqual([]);
+});
+
+test("encode skips default values in sets", () => {
+  const schema = z.set(z.number().default(0, { skipEncoding: true }));
+  const set = new Set([1, 0, 2]);
+  expect(schema.encode(set)).toEqual(new Set([1, 2]));
+});
+
+test("encode skips default values with deep equality", () => {
+  const schema = z.object({
+    date: z.date().default(new Date(1000), { skipEncoding: true }),
+    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
+    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
+    prim: z.nan().default(Number.NaN, { skipEncoding: true }),
+    prim2: z.number().default(-0, { skipEncoding: true }),
+  });
+  expect(
+    schema.encode({
+      date: new Date(1000),
+      arr: [1, 2],
+      obj: { x: 1 },
+      prim: Number.NaN,
+      prim2: -0,
+    })
+  ).toEqual({});
+});
+
+test("sparse hole equivalence", () => {
+  const arr1: number[] = [];
+  arr1[2] = 1;
+  const schema = z.object({
+    a: z.any().default(arr1, { skipEncoding: true }),
+  });
+  expect(schema.encode({ a: [undefined, undefined, 1] })).toEqual({});
+});
+
+test("implicit default option behaves identically to skipEncoding: true", () => {
+  const schema = z.object({
+    a: z.number().default(0, { skipEncoding: true }),
+  });
+  expect(schema.encode({ a: 0 })).toEqual({});
+});
+
+test("async support", async () => {
+  const schema = z.object({
+    a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
+  });
+  await expect(schema.encodeAsync({ a: 0 })).resolves.toEqual({});
+  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use async skipEncoding in synchronous encode");
+});
+
+test("nested defaults", () => {
+  const inner = z.object({ x: z.number().default(0, { skipEncoding: true }) });
+  const outer = inner.default({ x: 0 }, { skipEncoding: true });
+  expect(outer.encode({ x: 0 })).toBe(OMIT);
+  expect(z.object({ o: outer }).encode({ o: { x: 0 } })).toEqual({});
+  expect(outer.encode({ x: 1 })).toEqual({ x: 1 });
+});
+
+test("chained defaulted schemas evaluate skipEncoding independently", () => {
+  const inner = z.number().default(0, { skipEncoding: true });
+  const outer = inner.default(5, { skipEncoding: true });
+  expect(outer.encode(5)).toBe(OMIT);
+  expect(outer.encode(0)).toBe(0);
+  expect(z.object({ a: outer }).encode({ a: 5 })).toEqual({});
+  expect(z.object({ a: outer }).encode({ a: 0 })).toEqual({ a: 0 });
+});
+
+test("factory defaults", () => {
+  expect(() => {
+    const schema = z.object({ a: z.number().default(() => Math.random(), { skipEncoding: true }) });
+    schema.encode({ a: 0 });
+  }).toThrow("factory default");
+  const schema2 = z.object({ a: z.number().default(() => 0, { skipEncoding: (v) => v === 0 }) });
+  expect(schema2.encode({ a: 0 })).toEqual({});
+});
+
+test("strict equality mode", () => {
+  const schema = z.object({
+    arr: z.array(z.number()).default([1, 2], { skipEncoding: { mode: "strict" } }),
+    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: { mode: "strict" } }),
+    prim: z.number().default(0, { skipEncoding: { mode: "strict" } }),
+  });
+  expect(schema.encode({ arr: [1, 2], obj: { x: 1 }, prim: 0 })).toEqual({
+    arr: [1, 2],
+    obj: { x: 1 },
+  });
+});
+
+test("shallow equality mode", () => {
+  const innerObj = { a: 1 };
+  const innerArr = [2];
+  const schema = z.object({
+    arr: z.array(z.any()).default([1, innerObj], { skipEncoding: { mode: "shallow" } }),
+    obj: z.record(z.string(), z.any()).default({ a: 1, b: innerArr }, { skipEncoding: { mode: "shallow" } }),
+  });
+  expect(schema.encode({ arr: [1, innerObj], obj: { a: 1, b: innerArr } })).toEqual({});
+  expect(schema.encode({ arr: [1, { a: 1 }], obj: { a: 1, b: [2] } })).toEqual({
+    arr: [1, { a: 1 }],
+    obj: { a: 1, b: [2] },
+  });
+});
+
+test("shallow Map and Set equality mode", () => {
+  const k1 = { id: 1 };
+  const v1 = { val: "v1" };
+  
+  const mapSchema = z.object({
+    m: z.map(z.any(), z.any()).default(new Map([[k1, v1]]), { skipEncoding: { mode: "shallow" } })
+  });
+  expect(mapSchema.encode({ m: new Map([[k1, v1]]) })).toEqual({});
+  // Same structure but different instances does not match in shallow mode
+  expect(mapSchema.encode({ m: new Map([[{ id: 1 }, { val: "v1" }]]) })).toEqual({ m: new Map([[{ id: 1 }, { val: "v1" }]]) });
+
+  const el1 = { id: 1 };
+  const setSchema = z.object({
+    s: z.set(z.any()).default(new Set([el1]), { skipEncoding: { mode: "shallow" } })
+  });
+  expect(setSchema.encode({ s: new Set([el1]) })).toEqual({});
+  // Same structure but different instance does not match in shallow mode
+  expect(setSchema.encode({ s: new Set([{ id: 1 }]) })).toEqual({ s: new Set([{ id: 1 }]) });
+});
+
+test("deep equality behaves identically to skipEncoding: true", () => {
+  const schemaDeep = z.object({
+    x: z.object({ a: z.array(z.number()) }).default({ a: [1] }, { skipEncoding: { mode: "deep" } }),
+  });
+  const schemaTrue = z.object({ x: z.object({ a: z.array(z.number()) }).default({ a: [1] }, { skipEncoding: true }) });
+  expect(schemaDeep.encode({ x: { a: [1] } })).toEqual({});
+  expect(schemaTrue.encode({ x: { a: [1] } })).toEqual({});
+});
+
+test("nested defaults skip independently", () => {
+  const schema = z.object({
+    outer: z
+      .object({
+        inner: z.number().default(0, { skipEncoding: true }),
+      })
+      .default({ inner: 1 }, { skipEncoding: true }),
+  });
+  expect(schema.encode({ outer: { inner: 0 } })).toEqual({ outer: {} });
+  expect(schema.encode({ outer: { inner: 1 } })).toEqual({});
+});
+
+test("Map deep equality is order-insensitive and deeply compares keys and values", () => {
+  const schema = z.object({
+    m: z.map(z.string(), z.object({ a: z.number() })).default(
+      new Map([
+        ["k1", { a: 1 }],
+        ["k2", { a: 2 }],
+      ]),
+      { skipEncoding: true }
+    ),
+  });
+  expect(
+    schema.encode({
+      m: new Map([
+        ["k2", { a: 2 }],
+        ["k1", { a: 1 }],
+      ]),
+    })
+  ).toEqual({});
+  expect(
+    schema.encode({
+      m: new Map([
+        ["k1", { a: 1 }],
+        ["k2", { a: 3 }],
+      ]),
+    })
+  ).toEqual({
+    m: new Map([
+      ["k1", { a: 1 }],
+      ["k2", { a: 3 }],
+    ]),
+  });
+});
+
+test("Set deep equality is order-insensitive and deeply compares elements", () => {
+  const schema = z.object({
+    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
+  });
+  expect(schema.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
+  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 3 }]) })).toEqual({
+    s: new Set([{ a: 1 }, { a: 3 }]),
+  });
+});
+
+test("sync predicate", () => {
+  const schema = z.object({ a: z.number().default(1, { skipEncoding: (v) => v === 1 }) });
+  expect(schema.encode({ a: 1 })).toEqual({});
+  expect(schema.encode({ a: 2 })).toEqual({ a: 2 });
+});
+
+test("container-level defaults", () => {
+  const schema = z.object({
+    obj: z.record(z.string(), z.number()).default({ a: 1 }, { skipEncoding: true }),
+    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
+  });
+  expect(schema.encode({ obj: { a: 1 }, arr: [1, 2] })).toEqual({});
+});
+
+test("wrapper interaction", () => {
+  const schema = z.object({
+    opt: z.number().default(0, { skipEncoding: true }).optional(),
+    nul: z.number().default(0, { skipEncoding: true }).nullable(),
+  });
+  expect(schema.encode({ opt: 0, nul: 0 })).toEqual({});
+});
+
+test("encodeAsync + factory + predicate", async () => {
+  const schema = z.object({
+    a: z.number().default(() => 0, { skipEncoding: async (v) => v === 0 }),
+  });
+  await expect(schema.encodeAsync({ a: 0 })).resolves.toEqual({});
+  await expect(schema.encodeAsync({ a: 1 })).resolves.toEqual({ a: 1 });
+});
+
+test("root-level encode", () => {
+  const schema = z.number().default(0, { skipEncoding: true });
+  expect(schema.encode(0)).toBe(OMIT);
+  expect(schema.encode(0)).toBe(z.OMIT);
+  expect(schema.encode(1)).toBe(1);
+  const objSchema = z.object({ a: schema });
+  expect(objSchema.encode({ a: 0 })).toEqual({});
+});
+
+test("skipEncoding: false explicitly does not skip", () => {
+  const schema = z.object({
+    a: z.number().default(0, { skipEncoding: false }),
+    b: z.number().default(0, { skipEncoding: true }),
+  });
+  expect(schema.encode({ a: 0, b: 0 })).toEqual({ a: 0 });
+});
+
+test("Set deep equality requires 1-to-1 bipartite matching (equal cardinality test)", () => {
+  const el1 = { a: 1 };
+  const el2 = { a: 1 };
+  const defaultSet = new Set([{ a: 1 }, { a: 2 }]);
+  const inputSet = new Set([el1, el2]);
+  const schema = z.object({
+    s: z.set(z.object({ a: z.number() })).default(defaultSet, { skipEncoding: true }),
+  });
+  expect(schema.encode({ s: inputSet })).toEqual({ s: inputSet });
+});
+
+test("tuple removes middle element and shifts left", () => {
+  const schema = z.tuple([z.string(), z.number().default(0, { skipEncoding: true }), z.boolean()]);
+  expect(schema.encode(["a", 0, true])).toEqual(["a", true]);
+});
+
+test("tuple removes rest elements if omitted", () => {
+  const schema = z.tuple([z.string()]).rest(z.number().default(0, { skipEncoding: true }));
+  expect(schema.encode(["a", 0, 1, 0])).toEqual(["a", 1]);
+});
+
+test("predicate receives the final encoded output, not the raw input, and exact defaultValue", () => {
+  const defaultObj = { y: 0 };
+  let capturedV: any;
+  let capturedDef: any;
+  let capturedThis: any;
+  const defSchema = z.object({ y: z.number() }).default(defaultObj, {
+    skipEncoding: function(v, def) {
+      capturedV = v;
+      capturedDef = def;
+      capturedThis = this;
+      return true;
+    },
+  });
+  const schema = z.object({
+    x: defSchema,
+  });
+  expect(schema.encode({ x: { y: 0 } })).toEqual({});
+  expect(capturedV).toEqual({ y: 0 });
+  expect(capturedDef).toEqual(defaultObj);
+  expect(capturedThis).toBe(defSchema);
+});
+
+test("predicate receives undefined for factory defaults", () => {
+  let capturedDef: any = "NOT_UNDEFINED";
+  const schema = z.object({
+    a: z.number().default(() => 0, {
+      skipEncoding: (_v, def) => {
+        capturedDef = def;
+        return true;
+      },
+    }),
+  });
+  expect(schema.encode({ a: 0 })).toEqual({});
+  expect(capturedDef).toBeUndefined();
+});
+
+test("async factory default with predicate throws error", () => {
+  const schema = z.object({
+    a: z.number().default(() => Promise.resolve(0) as any, {
+      skipEncoding: (v) => v === 0,
+    }),
+  });
+  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use skipEncoding predicate with an async factory default");
+});
+
+test("comparison against final encoded output not explicitly distinguished", () => {
+  const schema = z.object({ x: z.number().default(0, { skipEncoding: (v) => v === 0 }) });
+  expect(schema.encode({ x: 0 })).toEqual({});
+  expect(schema.encode({ x: 1 })).toEqual({ x: 1 });
+});
+
+test("encode correctly processes un-omitted array elements following omitted ones (LLM trap)", () => {
+  const schema = z.array(z.number().default(0, { skipEncoding: true }));
+  const result = schema.encode([1, 0, 2, 0, 3]);
+  
+  const isCompacted = result.length === 3 && result[0] === 1 && result[1] === 2 && result[2] === 3;
+  const isSparse = result.length === 5 && result[0] === 1 && !(1 in result) && result[2] === 2 && !(3 in result) && result[4] === 3;
+  
+  expect(isCompacted || isSparse).toBe(true);
+});
+
+test("encoded default comparison requires encoding the default first", () => {
+  const inner = z.object({ a: z.number().default(0, { skipEncoding: true }) });
+  const schema = inner.default({ a: 1 }, { skipEncoding: true });
+
+  expect(z.object({ s: schema }).encode({ s: { a: 1 } })).toEqual({});
+  expect(z.object({ s: schema }).encode({ s: { a: 0 } })).toEqual({ s: {} });
+
+  const schema2 = inner.default({ a: 0 }, { skipEncoding: true });
+  expect(z.object({ s: schema2 }).encode({ s: { a: 0 } })).toEqual({});
+  expect(z.object({ s: schema2 }).encode({ s: { a: 1 } })).toEqual({ s: { a: 1 } });
+});
+
+test("cascading omission from elements to parent container", () => {
+  const schema = z.array(z.number().default(0, { skipEncoding: true })).default([], { skipEncoding: true });
+  
+  const r1 = z.object({ a: schema }).encode({ a: [0, 0] });
+  const r1Compacted = Object.keys(r1).length === 0;
+  const r1Sparse = "a" in r1 && (r1 as any).a.length === 2 && !(0 in (r1 as any).a) && !(1 in (r1 as any).a);
+  expect(r1Compacted || r1Sparse).toBe(true);
+
+  const r2 = z.object({ a: schema }).encode({ a: [0] });
+  const r2Compacted = Object.keys(r2).length === 0;
+  const r2Sparse = "a" in r2 && (r2 as any).a.length === 1 && !(0 in (r2 as any).a);
+  expect(r2Compacted || r2Sparse).toBe(true);
+
+  expect(z.object({ a: schema }).encode({ a: [1] })).toEqual({ a: [1] });
+});
+
+test("deep equality ignores object key order", () => {
+  const schema = z.object({ o: z.any().default({ a: 1, b: 2 }, { skipEncoding: true }) });
+  expect(schema.encode({ o: { b: 2, a: 1 } })).toEqual({});
+});
+
+test("transparent pass-through via the .catch() wrapper", () => {
+  const schema = z.object({ val: z.number().default(0, { skipEncoding: true }).catch(10) });
+  expect(schema.encode({ val: 0 })).toEqual({});
+  expect(schema.encode({ val: 10 })).toEqual({ val: 10 });
+});
+
+test("throws when sync predicate returns a promise during sync encode", () => {
+  const schema = z.object({ a: z.number().default(0, { skipEncoding: () => Promise.resolve(true) }) });
+  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use async skipEncoding in synchronous encode");
+});
+
+test("deep equality mode for Maps with identical object keys", () => {
+  const map1 = new Map([[{ k: 1 }, "v"]]);
+  const map2 = new Map([[{ k: 1 }, "v"]]);
+  const schema = z.any().default(map1, { skipEncoding: true });
+  expect(z.object({ m: schema }).encode({ m: map2 })).toEqual({});
+});
+
+test("deep equality mode for Sets with identical object elements", () => {
+  const set1 = new Set([{ k: 1 }]);
+  const set2 = new Set([{ k: 1 }]);
+  const schema = z.any().default(set1, { skipEncoding: true });
+  expect(z.object({ s: schema }).encode({ s: set2 })).toEqual({});
+});
+
+test("deep map key equality", () => {
+  const schema = z.object({
+    m: z.map(z.object({ k: z.number() }), z.string()).default(new Map([[{ k: 1 }, "v"]]), { skipEncoding: true }),
+  });
+  expect(schema.encode({ m: new Map([[{ k: 1 }, "v"]]) })).toEqual({});
+  expect(schema.encode({ m: new Map([[{ k: 2 }, "v"]]) })).toEqual({ m: new Map([[{ k: 2 }, "v"]]) });
+});
+
+test("root-level non-omission across all option forms", () => {
+  const strictSchema = z.number().default(0, { skipEncoding: { mode: "strict" } });
+  const predSchema = z.number().default(0, { skipEncoding: (v) => v === 0 });
+  const trueSchema = z.number().default(0, { skipEncoding: true });
+  expect(strictSchema.encode(0)).toBe(OMIT);
+  expect(predSchema.encode(0)).toBe(OMIT);
+  expect(trueSchema.encode(0)).toBe(OMIT);
+  const obj = z.object({ a: strictSchema, b: predSchema, c: trueSchema });
+  expect(obj.encode({ a: 0, b: 0, c: 0 })).toEqual({});
+});
+
+test("mini API support", () => {
+  const schema = zmini.object({
+    a: z._default(zmini.number(), 0, { skipEncoding: true })
+  });
+  expect(zmini.encode(schema, { a: 0 })).toEqual({});
+  expect(zmini.encode(schema, { a: 1 })).toEqual({ a: 1 });
+  expect(zmini.OMIT).toBe(OMIT);
+});
+
+test("transparent wrappers pass through omission", () => {
+  const schema = z.object({
+    a: z.number().default(0, { skipEncoding: true }).optional(),
+    b: z.number().default(0, { skipEncoding: true }).nullable(),
+    c: z.number().default(0, { skipEncoding: true }).catch(1)
+  });
+  expect(schema.encode({ a: 0, b: 0, c: 0 })).toEqual({});
+  expect(schema.encode({ a: 1, b: 1, c: 1 })).toEqual({ a: 1, b: 1, c: 1 });
+});
+
+test("intersection handling of defaulted schema with skipEncoding", () => {
+  const left = z.object({ a: z.number().default(0, { skipEncoding: true }) });
+  const right = z.object({ b: z.string() });
+  const inter = z.intersection(left, right);
+  expect(inter.encode({ a: 0, b: "hello" })).toEqual({ b: "hello" });
+});
+
+test("deep equality handles sparse arrays (LLM trap)", () => {
+  const arr1: number[] = [];
+  arr1[2] = 1;
+  const arr2: number[] = [];
+  arr2[2] = 1;
+  
+  const schema = z.any().default(arr1, { skipEncoding: true });
+  expect(z.object({ a: schema }).encode({ a: arr2 })).toEqual({});
+});
+
+test("deep equality correctly matches NaN in Sets (LLM trap)", () => {
+  const schema = z.any().default(new Set([NaN]), { skipEncoding: true });
+  expect(z.object({ s: schema }).encode({ s: new Set([NaN]) })).toEqual({});
+  expect(z.object({ s: schema }).encode({ s: new Set([0]) })).toEqual({ s: new Set([0]) });
+});
+`
+fs.mkdirSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE", { recursive: true });
+fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/THE_FINAL_SOLUTION_PATCH.patch", solutionPatch);
+fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/THE_FINAL_TEST_PATCH.patch", testPatch);
+console.log("Patches written.");
