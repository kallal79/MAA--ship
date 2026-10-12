+  default(def: util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams<this>): ZodDefault<this>;
+  default(def: () => util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams<this>): ZodDefault<this>;
+    default(d, params) {
+      return _default(this, d, params);
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueForEncoding: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+
+test("skipEncoding omits defaults inside containers but not at the root", () => {
+  const value = z.string().default("default", { skipEncoding: true });
+
+  expect(z.encode(value, "default")).toBe("default");
+  expect(z.encode(z.object({ value, kept: z.string() }), { value: "default", kept: "yes" })).toEqual({ kept: "yes" });
+  expect(z.encode(z.record(z.string(), value), { a: "default", b: "kept" })).toEqual({ b: "kept" });
+  expect(
+    z.encode(
+      z.map(z.string(), value),
+      new Map([
+        ["a", "default"],
+        ["b", "kept"],
+      ])
+    )
+  ).toEqual(new Map([["b", "kept"]]));
+  expect(z.encode(z.array(value), ["kept", "default", "also kept"])).toEqual(["kept", "also kept"]);
+  expect(z.encode(z.tuple([value, z.string(), value]), ["default", "kept", "default"])).toEqual(["kept"]);
+  expect(z.encode(z.set(value), new Set(["default", "kept"]))).toEqual(new Set(["kept"]));
+});
+
+test("skipEncoding supports equality modes", () => {
+  const reference = { nested: { value: 1 } };
+  const equal = { nested: { value: 1 } };
+
+  expect(z.encode(z.array(z.any().default(reference, { skipEncoding: { mode: "strict" } })), [reference])).toEqual([]);
+  expect(z.encode(z.array(z.any().default(reference, { skipEncoding: { mode: "strict" } })), [equal])).toEqual([equal]);
+  expect(z.encode(z.array(z.any().default(reference, { skipEncoding: { mode: "shallow" } })), [equal])).toEqual([
+    equal,
+  ]);
+  expect(
+    z.encode(z.array(z.any().default(reference, { skipEncoding: { mode: "shallow" } })), [{ nested: reference.nested }])
+  ).toEqual([]);
+
+  const complex = {
+    date: new Date("2020-01-01"),
+    map: new Map<object, object>([
+      [{ id: 1 }, { values: [1, 2] }],
+      [{ id: 2 }, { values: [3, 4] }],
+    ]),
+    set: new Set([{ id: 1 }, { id: 2 }]),
+  };
+  const reordered = {
+    date: new Date("2020-01-01"),
+    map: new Map<object, object>([
+      [{ id: 2 }, { values: [3, 4] }],
+      [{ id: 1 }, { values: [1, 2] }],
+    ]),
+    set: new Set([{ id: 2 }, { id: 1 }]),
+  };
+  expect(z.encode(z.array(z.any().default(complex, { skipEncoding: true })), [reordered])).toEqual([]);
+  expect(z.encode(z.array(z.any().default(complex, { skipEncoding: { mode: "deep" } })), [reordered])).toEqual([]);
+});
+
+test("skipEncoding predicates support encoded values and async traversal", async () => {
+  const codec = z.codec(z.string(), z.number(), {
+    decode: (value) => Number(value),
+    encode: (value) => String(value),
+  });
+  const encodedPredicate = codec.default(1, { skipEncoding: (value) => value === "1" });
+  expect(z.encode(z.array(encodedPredicate), [1, 2])).toEqual(["2"]);
+
+  const asyncDefault = z.string().default("default", {
+    skipEncoding: async (value) => value === "default",
+  });
+  expect(() => z.encode(z.array(asyncDefault), ["default"])).toThrow(
+    "Cannot use async skipEncoding in synchronous encode"
+  );
+  await expect(z.encodeAsync(z.array(asyncDefault), ["default", "kept"])).resolves.toEqual(["kept"]);
+});
+
+test("skipEncoding composes through wrappers and nested defaults", () => {
+  const calls: string[] = [];
+  const nested = z
+    .string()
+    .default("inner", {
+      skipEncoding: (value) => {
+        calls.push(`inner:${value}`);
+        return value === "inner";
+      },
+    })
+    .default("outer", {
+      skipEncoding: (value) => {
+        calls.push(`outer:${value}`);
+        return value === "outer";
+      },
+    });
+
+  expect(z.encode(z.array(nested.optional().nullable()), ["inner", "outer", "kept", null])).toEqual(["kept", null]);
+  expect(calls).toEqual(["inner:inner", "outer:inner", "inner:outer", "outer:outer", "inner:kept", "outer:kept"]);
+});
+
+test("factory defaults reject equality skipEncoding modes during encode", () => {
+  const trueSchema = z.string().default(() => "default", { skipEncoding: true });
+  const modeSchema = z.string().default(() => "default", { skipEncoding: { mode: "shallow" } });
+
+  expect(() => z.encode(trueSchema, "default")).toThrow("Cannot use skipEncoding: true with a factory default");
+  expect(() => z.encode(modeSchema, "default")).toThrow(
+    'Cannot use skipEncoding: {"mode":"shallow"} with a factory default'
+  );
+});
+export type $ZodDefaultParams<T extends schemas.SomeType = schemas.$ZodType> = TypeParams<
+  schemas.$ZodDefault<T>,
+  "innerType" | "defaultValue" | "defaultValueFactory" | "defaultValueForEncoding"
+>;
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: $ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueForEncoding: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+  /** @internal Marks this value for omission by its containing schema during encoding. */
+  skipEncoding?: boolean | undefined;
+  /** @internal Tracks encoded array-like elements that should be omitted. */
+  skippedIndices?: Set<number> | undefined;
+  if (result.skipEncoding) {
+    final.skippedIndices ??= new Set();
+    final.skippedIndices.add(index);
+    return;
+  }
+function handleArrayResults(final: ParsePayload<any[]>): ParsePayload<any[]> {
+  if (final.skippedIndices?.size) {
+    final.value = final.value.filter((_, index) => !final.skippedIndices!.has(index));
+    final.skippedIndices = undefined;
+  }
+  return final;
+}
+
+      return Promise.all(proms).then(() => handleArrayResults(payload));
+    return handleArrayResults(payload);
+  if (result.skipEncoding) return;
+
+      if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true && ctx.direction !== "backward") {
+      final.skipEncoding = result.skipEncoding;
+    final.skipEncoding = successes[0].skipEncoding;
+  result.skipEncoding = left.skipEncoding || right.skipEncoding;
+  if (result.skipEncoding) {
+    final.skippedIndices ??= new Set();
+    final.skippedIndices.add(index);
+    return;
+  }
+    if (r.skipEncoding) {
+      final.skippedIndices ??= new Set();
+      final.skippedIndices.add(i);
+      continue;
+    }
+  if (final.skippedIndices?.size) {
+    final.value = final.value.filter((_, index) => !final.skippedIndices!.has(index));
+    final.skippedIndices = undefined;
+  }
+                if (!result.skipEncoding) payload.value[outKey] = result.value;
+            if (!result.skipEncoding) payload.value[outKey] = result.value;
+              if (!result.skipEncoding) payload.value[keyResult.value as PropertyKey] = result.value;
+          if (!result.skipEncoding) payload.value[keyResult.value as PropertyKey] = result.value;
+  if (keyResult.skipEncoding || valueResult.skipEncoding) return;
+  if (result.skipEncoding) return;
+  defaultValueFactory?: boolean | undefined;
+  defaultValueForEncoding?: util.NoUndefined<core.output<T>> | undefined;
+  skipEncoding?: $ZodDefaultSkipEncoding<core.input<T>> | undefined;
+export type $ZodDefaultSkipEncoding<T = unknown> =
+  | boolean
+  | { mode: "strict" | "shallow" | "deep" }
+  | ((value: T) => unknown | Promise<unknown>);
+
+        const input = payload.value;
+        const result = def.innerType._zod.run(payload, ctx);
+        if (result instanceof Promise) {
+          return result.then((result) => handleDefaultEncodeResult(result, input, def, ctx));
+        }
+        return handleDefaultEncodeResult(result, input, def, ctx);
+function handleDefaultEncodeResult(
+  payload: ParsePayload,
+  input: unknown,
+  def: $ZodDefaultDef,
+  ctx: ParseContextInternal
+): util.MaybeAsync<ParsePayload> {
+  const skipEncoding = def.skipEncoding;
+  if (!skipEncoding) return payload;
+
+  if (typeof skipEncoding === "function") {
+    const result = skipEncoding(payload.value);
+    if (result instanceof Promise) {
+      if (!ctx.async) {
+        void result.catch(() => {});
+        throw new Error("Cannot use async skipEncoding in synchronous encode");
+      }
+      return result.then((skip) => {
+        payload.skipEncoding ||= !!skip;
+        return payload;
+      });
+    }
+    payload.skipEncoding ||= !!result;
+    return payload;
+  }
+
+  if (def.defaultValueFactory) {
+    const option = skipEncoding === true ? "true" : JSON.stringify(skipEncoding);
+    throw new Error(`Cannot use skipEncoding: ${option} with a factory default`);
+  }
+
+  const mode = skipEncoding === true ? "deep" : skipEncoding.mode;
+  payload.skipEncoding ||= valuesEqual(input, def.defaultValueForEncoding, mode);
+  return payload;
+}
+
+function valuesEqual(a: unknown, b: unknown, mode: "strict" | "shallow" | "deep"): boolean {
+  if (mode === "strict") return Object.is(a, b);
+  if (Object.is(a, b)) return true;
+
+  if (Array.isArray(a) && Array.isArray(b)) {
+    if (a.length !== b.length) return false;
+    return a.every((value, index) =>
+      mode === "shallow" ? Object.is(value, b[index]) : valuesEqual(value, b[index], mode)
+    );
+  }
+
+  if (mode === "deep" && a instanceof Date && b instanceof Date) {
+    return Object.is(a.getTime(), b.getTime());
+  }
+
+  if (a instanceof Map && b instanceof Map) {
+    if (a.size !== b.size) return false;
+    if (mode === "shallow") {
+      for (const [key, value] of a) if (!b.has(key) || !Object.is(value, b.get(key))) return false;
+      return true;
+    }
+    return unorderedMatch(
+      [...a],
+      [...b],
+      ([aKey, aValue], [bKey, bValue]) => valuesEqual(aKey, bKey, mode) && valuesEqual(aValue, bValue, mode)
+    );
+  }
+
+  if (a instanceof Set && b instanceof Set) {
+    if (a.size !== b.size) return false;
+    if (mode === "shallow") {
+      for (const value of a) if (!b.has(value)) return false;
+      return true;
+    }
+    return unorderedMatch([...a], [...b], (aValue, bValue) => valuesEqual(aValue, bValue, mode));
+  }
+
+  if (util.isPlainObject(a) && util.isPlainObject(b)) {
+    const aKeys = Reflect.ownKeys(a).filter((key) => Object.prototype.propertyIsEnumerable.call(a, key));
+    const bKeys = Reflect.ownKeys(b).filter((key) => Object.prototype.propertyIsEnumerable.call(b, key));
+    if (aKeys.length !== bKeys.length) return false;
+    for (const key of aKeys) {
+      if (!Object.prototype.propertyIsEnumerable.call(b, key)) return false;
+      if (mode === "shallow" ? !Object.is(a[key], b[key]) : !valuesEqual(a[key], b[key], mode)) return false;
+    }
+    return true;
+  }
+
+  return false;
+}
+
+function unorderedMatch<T>(a: T[], b: T[], matches: (a: T, b: T) => boolean): boolean {
+  const edges = a.map((aValue) => b.flatMap((bValue, index) => (matches(aValue, bValue) ? [index] : [])));
+  const assigned = new Array<number>(b.length).fill(-1);
+
+  const assign = (aIndex: number, seen: boolean[]): boolean => {
+    for (const bIndex of edges[aIndex]) {
+      if (seen[bIndex]) continue;
+      seen[bIndex] = true;
+      if (assigned[bIndex] === -1 || assign(assigned[bIndex], seen)) {
+        assigned[bIndex] = aIndex;
+        return true;
+      }
+    }
+    return false;
+  };
+
+  return a.every((_, index) => assign(index, new Array<boolean>(b.length).fill(false)));
+}
+
+  return next._zod.run(
+    { value: left.value, issues: left.issues, fallback: left.fallback, skipEncoding: left.skipEncoding },
+    ctx
+  );
+  return nextSchema._zod.run({ value, issues: left.issues, skipEncoding: left.skipEncoding }, ctx);
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueForEncoding: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+
+  const c = z._default(z.string(), "default", { skipEncoding: true });
+  expect(z.encode(c, "default")).toEqual("default");
+  expect(z.encode(z.array(c), ["default", "hello"])).toEqual(["hello"]);