+  default(
+    def: util.NoUndefined<core.output<this>>,
+    options?: core.$ZodDefaultOptions<core.input<this>>
+  ): ZodDefault<this>;
+  default(
+    def: () => util.NoUndefined<core.output<this>>,
+    options?: core.$ZodDefaultOptions<core.input<this>>
+  ): ZodDefault<this>;
+    default(d, options) {
+      return _default(this, d, options);
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  options?: core.$ZodDefaultOptions<core.input<T>>
+    ...options,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueRaw: typeof defaultValue === "function" ? undefined : defaultValue,
+
+test("skipEncoding in containers and at the root", () => {
+  const value = z.string().default("x", { skipEncoding: true });
+  const functional = z._default(z.string(), "x", { skipEncoding: true });
+
+  expect(value.encode("x")).toBe("x");
+  expect(z.object({ functional }).encode({ functional: "x" })).toEqual({});
+  expect(z.object({ value }).encode({ value: "x" })).toEqual({});
+  expect(z.record(z.string(), value).encode({ a: "x", b: "y" })).toEqual({ b: "y" });
+  expect(
+    z.map(z.string(), value).encode(
+      new Map([
+        ["a", "x"],
+        ["b", "y"],
+      ])
+    )
+  ).toEqual(new Map([["b", "y"]]));
+  expect(z.array(value).encode(["x", "y", "x"])).toEqual(["y"]);
+  expect(z.tuple([value, z.string(), value]).encode(["x", "y", "x"])).toEqual(["y"]);
+  expect(z.set(value).encode(new Set(["x", "y"]))).toEqual(new Set(["y"]));
+});
+
+test("skipEncoding equality modes", () => {
+  const shared = { nested: { value: 1 } };
+  const strict = z.object({
+    value: z.object({ nested: z.object({ value: z.number() }) }).default(shared, { skipEncoding: { mode: "strict" } }),
+  });
+  const shallow = z.object({
+    value: z.object({ nested: z.object({ value: z.number() }) }).default(shared, { skipEncoding: { mode: "shallow" } }),
+  });
+  const deep = z.object({
+    value: z.object({ nested: z.object({ value: z.number() }) }).default(shared, { skipEncoding: { mode: "deep" } }),
+  });
+
+  expect(strict.encode({ value: shared })).toEqual({});
+  expect(strict.encode({ value: { nested: shared.nested } })).toHaveProperty("value");
+  expect(shallow.encode({ value: { nested: shared.nested } })).toEqual({});
+  expect(shallow.encode({ value: { nested: { value: 1 } } })).toHaveProperty("value");
+  expect(deep.encode({ value: { nested: { value: 1 } } })).toEqual({});
+
+  const complex = z.unknown().default(
+    {
+      date: new Date(1),
+      map: new Map([[{ id: 1 }, { value: 2 }]]),
+      set: new Set([{ id: 1 }, { id: 2 }]),
+    },
+    { skipEncoding: true }
+  );
+  expect(
+    z.object({ complex }).encode({
+      complex: {
+        set: new Set([{ id: 2 }, { id: 1 }]),
+        map: new Map([[{ id: 1 }, { value: 2 }]]),
+        date: new Date(1),
+      },
+    })
+  ).toEqual({});
+});
+
+test("skipEncoding predicates", async () => {
+  const predicate = z.string().default("x", { skipEncoding: (value) => value.startsWith("skip") });
+  expect(z.object({ value: predicate }).encode({ value: "skip-me" })).toEqual({});
+  expect(z.object({ value: predicate }).encode({ value: "keep" })).toEqual({ value: "keep" });
+
+  const asyncPredicate = z.string().default("x", { skipEncoding: async (value) => value === "x" });
+  expect(() => z.object({ value: asyncPredicate }).encode({ value: "x" })).toThrow(
+    "Cannot use async skipEncoding in synchronous encode"
+  );
+  await expect(z.object({ value: asyncPredicate }).encodeAsync({ value: "x" })).resolves.toEqual({});
+});
+
+test("factory defaults reject equality skipEncoding during encode", () => {
+  const bool = z.string().default(() => "x", { skipEncoding: true });
+  const mode = z.string().default(() => "x", { skipEncoding: { mode: "shallow" } });
+
+  expect(() => bool.encode("x")).toThrow("Cannot use skipEncoding: true with a factory default");
+  expect(() => mode.encode("x")).toThrow('Cannot use skipEncoding: {"mode":"shallow"} with a factory default');
+});
+
+test("nested defaults and wrappers preserve skipEncoding", () => {
+  const calls: string[] = [];
+  const value = z
+    .string()
+    .default("inner", {
+      skipEncoding: (value) => {
+        calls.push(`inner:${value}`);
+        return true;
+      },
+    })
+    .default("outer", {
+      skipEncoding: (value) => {
+        calls.push(`outer:${value}`);
+        return false;
+      },
+    })
+    .optional()
+    .nullable();
+
+  expect(z.object({ value }).encode({ value: "value" })).toEqual({});
+  expect(calls).toEqual(["inner:value", "outer:value"]);
+});
+export type $ZodDefaultParams = TypeParams<
+  schemas.$ZodDefault,
+  "innerType" | "defaultValue" | "defaultValueRaw" | "defaultValueFactory"
+>;
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  options?: schemas.$ZodDefaultOptions<core.input<T>>
+    ...options,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueRaw: typeof defaultValue === "function" ? undefined : defaultValue,
+  /** @internal Omit this value when it is consumed by a container during encoding. */
+  skipEncoding?: boolean | undefined;
+  if (!result.skipEncoding) final.value.push(result.value);
+    payload.value = [];
+    const results: ParsePayload[] = new Array(input.length);
+        proms.push(
+          result.then((result) => {
+            results[i] = result;
+          })
+        );
+        results[i] = result;
+      return Promise.all(proms).then(() => {
+        for (let i = 0; i < results.length; i++) handleArrayResult(results[i], payload, i);
+        return payload;
+      });
+    for (let i = 0; i < results.length; i++) handleArrayResult(results[i], payload, i);
+
+  if (result.skipEncoding) return;
+      if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true && ctx.direction !== "backward") {
+  final.value[index] = result.skipEncoding ? SKIP_ENCODING : result.value;
+    final.value[i] = r.skipEncoding ? SKIP_ENCODING : r.value;
+    if (items[i]?._zod.optout === "optional" && final.value[i] === undefined) {
+  final.value = final.value.filter((value) => value !== SKIP_ENCODING);
+const SKIP_ENCODING = Symbol("zod.skipEncoding");
+
+                if (!result.skipEncoding) payload.value[outKey] = result.value;
+            if (!result.skipEncoding) payload.value[outKey] = result.value;
+              if (!result.skipEncoding) payload.value[keyResult.value as PropertyKey] = result.value;
+          if (!result.skipEncoding) payload.value[keyResult.value as PropertyKey] = result.value;
+  if (!keyResult.skipEncoding && !valueResult.skipEncoding) {
+    final.value.set(keyResult.value, valueResult.value);
+  }
+  if (!result.skipEncoding) final.value.add(result.value);
+  defaultValueRaw?: util.NoUndefined<core.output<T>> | undefined;
+  skipEncoding?: $ZodDefaultSkipEncoding<any> | undefined;
+  defaultValueFactory?: boolean | undefined;
+}
+
+export type $ZodDefaultEquality = { mode: "strict" | "shallow" | "deep" };
+export type $ZodDefaultSkipEncoding<T = unknown> =
+  | true
+  | $ZodDefaultEquality
+  | ((value: T) => boolean | Promise<boolean>);
+export interface $ZodDefaultOptions<T = unknown> {
+  skipEncoding?: $ZodDefaultSkipEncoding<T> | undefined;
+        const skipEncoding = def.skipEncoding;
+        if (!skipEncoding) return def.innerType._zod.run(payload, ctx);
+        if (typeof skipEncoding !== "function" && def.defaultValueFactory) {
+          const option = skipEncoding === true ? "true" : JSON.stringify(skipEncoding);
+          throw new Error(`Cannot use skipEncoding: ${option} with a factory default`);
+        }
+        if (ctx.skipChecks) return def.innerType._zod.run(payload, ctx);
+
+        const originalValue = payload.value;
+        const result = def.innerType._zod.run(payload, ctx);
+        const handleResult = (result: ParsePayload) => {
+          const decision =
+            typeof skipEncoding === "function"
+              ? skipEncoding(result.value)
+              : defaultValuesEqual(
+                  originalValue,
+                  def.defaultValueRaw,
+                  skipEncoding === true ? "deep" : skipEncoding.mode
+                );
+          if (decision instanceof Promise) {
+            if (!ctx.async) throw new Error("Cannot use async skipEncoding in synchronous encode");
+            return decision.then((decision) => {
+              if (decision) result.skipEncoding = true;
+              return result;
+            });
+          }
+          if (decision) result.skipEncoding = true;
+          return result;
+        };
+        return result instanceof Promise ? result.then(handleResult) : handleResult(result);
+function defaultValuesEqual(a: unknown, b: unknown, mode: "strict" | "shallow" | "deep"): boolean {
+  if (Object.is(a, b)) return true;
+  if (mode === "strict") return false;
+  if (a instanceof Date || b instanceof Date) {
+    return mode === "deep" && a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
+  }
+  const equal =
+    mode === "deep" ? (left: unknown, right: unknown) => defaultValuesEqual(left, right, "deep") : Object.is;
+  if (Array.isArray(a) || Array.isArray(b)) {
+    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, i) => equal(value, b[i]));
+  }
+  if (a instanceof Map || b instanceof Map) {
+    if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) return false;
+    return hasPerfectMatching([...a], [...b], ([ak, av], [bk, bv]) => equal(ak, bk) && equal(av, bv));
+  }
+  if (a instanceof Set || b instanceof Set) {
+    if (!(a instanceof Set) || !(b instanceof Set) || a.size !== b.size) return false;
+    return hasPerfectMatching([...a], [...b], equal);
+  }
+  if (util.isPlainObject(a) || util.isPlainObject(b)) {
+    if (!util.isPlainObject(a) || !util.isPlainObject(b)) return false;
+    const aKeys = Reflect.ownKeys(a).filter((key) => Object.prototype.propertyIsEnumerable.call(a, key));
+    const bKeys = Reflect.ownKeys(b).filter((key) => Object.prototype.propertyIsEnumerable.call(b, key));
+    return (
+      aKeys.length === bKeys.length &&
+      aKeys.every((key) => Object.prototype.propertyIsEnumerable.call(b, key) && equal(a[key], b[key]))
+    );
+  }
+  return false;
+}
+
+function hasPerfectMatching<A, B>(left: A[], right: B[], equal: (a: A, b: B) => boolean): boolean {
+  const matched = new Array<number>(right.length).fill(-1);
+  const visit = (leftIndex: number, seen: boolean[]): boolean => {
+    for (let rightIndex = 0; rightIndex < right.length; rightIndex++) {
+      if (seen[rightIndex] || !equal(left[leftIndex], right[rightIndex])) continue;
+      seen[rightIndex] = true;
+      if (matched[rightIndex] === -1 || visit(matched[rightIndex], seen)) {
+        matched[rightIndex] = leftIndex;
+        return true;
+      }
+    }
+    return false;
+  };
+  return left.every((_, index) => visit(index, new Array<boolean>(right.length).fill(false)));
+}
+
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  options?: core.$ZodDefaultOptions<core.input<T>>
+    ...options,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueRaw: typeof defaultValue === "function" ? undefined : defaultValue,
+
+  const c = z._default(z.string(), "default", { skipEncoding: true });
+  expect(z.encode(c, "default")).toBe("default");
+  expect(z.encode(z.object({ c }), { c: "default" })).toEqual({});