+  default(def: util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams<this>): ZodDefault<this>;
+  default(def: () => util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams<this>): ZodDefault<this>;
+    default(d, params) {
+      return _default(this, d, params);
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueSource: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+
+test("skipEncoding omits default values only inside containers", () => {
+  const value = z.string().default("x", { skipEncoding: true });
+
+  expect(z.encode(value, "x")).toBe("x");
+  expect(z.encode(z.object({ value }), { value: "x" })).toEqual({});
+  expect(z.encode(z.record(z.string(), value), { a: "x", b: "y" })).toEqual({ b: "y" });
+  expect(z.encode(z.record(z.string().default("a", { skipEncoding: true }), z.number()), { a: 1, b: 2 })).toEqual({
+    b: 2,
+  });
+  expect(z.encode(z.map(z.string(), value), new Map([["a", "x"]]))).toEqual(new Map());
+  expect(z.encode(z.array(value), ["x", "y", "x"])).toEqual(["y"]);
+  expect(z.encode(z.tuple([value, z.number(), value]), ["x", 1, "y"])).toEqual([1, "y"]);
+  expect(z.encode(z.set(value), new Set(["x", "y"]))).toEqual(new Set(["y"]));
+});
+
+test("skipEncoding equality modes", () => {
+  const nested = { value: 1 };
+  const strictDefault = { value: 1 };
+  const shallow = z
+    .object({ nested: z.object({ value: z.number() }) })
+    .default({ nested }, { skipEncoding: { mode: "shallow" } });
+  const deep = z.object({ date: z.date(), map: z.map(z.object({ id: z.number() }), z.set(z.number())) }).default(
+    {
+      date: new Date(1),
+      map: new Map([
+        [{ id: 1 }, new Set([1, 2])],
+        [{ id: 2 }, new Set([3])],
+      ]),
+    },
+    { skipEncoding: { mode: "deep" } }
+  );
+
+  expect(
+    z.encode(z.object({ value: z.number().default(1, { skipEncoding: { mode: "strict" } }) }), { value: 1 })
+  ).toEqual({});
+  expect(
+    z.encode(
+      z.object({ value: z.object({ value: z.number() }).default(strictDefault, { skipEncoding: { mode: "strict" } }) }),
+      { value: strictDefault }
+    )
+  ).toEqual({});
+  expect(z.encode(z.object({ value: shallow }), { value: { nested } })).toEqual({});
+  expect(z.encode(z.object({ value: shallow }), { value: { nested: { value: 1 } } })).toHaveProperty("value");
+  expect(
+    z.encode(z.object({ value: deep }), {
+      value: {
+        date: new Date(1),
+        map: new Map([
+          [{ id: 2 }, new Set([3])],
+          [{ id: 1 }, new Set([2, 1])],
+        ]),
+      },
+    })
+  ).toEqual({});
+});
+
+test("skipEncoding predicates and factory defaults", async () => {
+  const sync = z.number().default(1, { skipEncoding: (value) => value < 2 });
+  const async = z.number().default(1, { skipEncoding: async (value) => value < 2 });
+  const encodedPredicate = z
+    .codec(z.string(), z.number(), { decode: Number, encode: String })
+    .default(1, { skipEncoding: (value) => value === "1" });
+
+  expect(z.encode(z.object({ sync }), { sync: 1 })).toEqual({});
+  expect(z.encode(z.object({ encodedPredicate }), { encodedPredicate: 1 })).toEqual({});
+  await expect(z.encodeAsync(z.array(async), [1, 2])).resolves.toEqual([2]);
+  expect(() => z.encode(z.object({ async }), { async: 1 })).toThrow(
+    "Cannot use async skipEncoding in synchronous encode"
+  );
+  expect(() =>
+    z.encode(
+      z.string().default(() => "x", { skipEncoding: true }),
+      "x"
+    )
+  ).toThrow("Cannot use skipEncoding: true with a factory default");
+  expect(() =>
+    z.encode(
+      z.string().default(() => "x", { skipEncoding: { mode: "shallow" } }),
+      "x"
+    )
+  ).toThrow('Cannot use skipEncoding: {"mode":"shallow"} with a factory default');
+});
+
+test("nested defaults and wrappers preserve skipEncoding", () => {
+  const inner = z.string().default("inner", { skipEncoding: (value) => value === "inner" });
+  const chained = inner.default("outer", { skipEncoding: (value) => value === "outer" });
+  const schema = z.object({ optional: inner.optional(), nullable: inner.nullable(), chained });
+
+  expect(z.encode(schema, { optional: "inner", nullable: "inner", chained: "inner" })).toEqual({});
+  expect(z.encode(schema, { optional: "other", nullable: null, chained: "outer" })).toEqual({
+    optional: "other",
+    nullable: null,
+  });
+});
+
+  const c = z._default(z.string(), "default", { skipEncoding: true });
+  expect(z.encode(z.object({ c }), { c: "default" })).toEqual({});
+export type $ZodDefaultParams<T extends schemas.SomeType = schemas.$ZodType> = TypeParams<
+  schemas.$ZodDefault<T>,
+  "innerType" | "defaultValue" | "defaultValueFactory" | "defaultValueSource"
+>;
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: $ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueSource: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+  /** @internal Marks an encoded child value for omission by its container. */
+  skipEncoding?: boolean | undefined;
+  if (!result.skipEncoding) final.value[index] = result.value;
+}
+
+function handleArrayResults(final: ParsePayload<any[]>) {
+  final.value = final.value.filter((_, index) => index in final.value);
+  return final;
+      return Promise.all(proms).then(() => handleArrayResults(payload));
+    return handleArrayResults(payload);
+  if (result.skipEncoding) return;
+
+        doc.write(`if (${id}.skipEncoding) delete newResult[${k}];`);
+  if (!result.skipEncoding) final.value[index] = result.value;
+    if (!r.skipEncoding) final.value[i] = r.value;
+  final.value = final.value.filter((_, index) => index in final.value);
+                if (!keyResult.skipEncoding && !result.skipEncoding) payload.value[outKey] = result.value;
+            if (!keyResult.skipEncoding && !result.skipEncoding) payload.value[outKey] = result.value;
+              if (!keyResult.skipEncoding && !result.skipEncoding) {
+                payload.value[keyResult.value as PropertyKey] = result.value;
+              }
+          if (!keyResult.skipEncoding && !result.skipEncoding) {
+            payload.value[keyResult.value as PropertyKey] = result.value;
+          }
+  if (!keyResult.skipEncoding && !valueResult.skipEncoding) {
+    final.value.set(keyResult.value, valueResult.value);
+  }
+  if (!result.skipEncoding) final.value.add(result.value);
+export type $ZodDefaultSkipEncodingMode = { mode: "strict" | "shallow" | "deep" };
+export type $ZodDefaultSkipEncoding<T extends SomeType = $ZodType> =
+  | boolean
+  | $ZodDefaultSkipEncodingMode
+  | ((value: core.input<T>) => boolean | Promise<boolean>);
+
+  skipEncoding?: $ZodDefaultSkipEncoding<T> | undefined;
+  /** @internal */
+  defaultValueFactory?: boolean | undefined;
+  /** @internal */
+  defaultValueSource?: util.NoUndefined<core.output<T>> | undefined;
+        const input = payload.value;
+        const result = def.innerType._zod.run(payload, ctx);
+        if (!def.skipEncoding) return result;
+        if (result instanceof Promise) {
+          return result.then((result) => handleDefaultEncodeResult(result, input, def, ctx));
+        }
+        return handleDefaultEncodeResult(result, input, def, ctx);
+function handleDefaultEncodeResult(
+  payload: ParsePayload,
+  input: unknown,
+  def: $ZodDefaultDef,
+  ctx: ParseContextInternal
+) {
+  const skipEncoding = def.skipEncoding!;
+  if (typeof skipEncoding === "function") {
+    const result = skipEncoding(payload.value);
+    if (result instanceof Promise) {
+      if (!ctx.async) throw new Error("Cannot use async skipEncoding in synchronous encode");
+      return result.then((skip) => {
+        if (skip) payload.skipEncoding = true;
+        return payload;
+      });
+    }
+    if (result) payload.skipEncoding = true;
+    return payload;
+  }
+
+  if (def.defaultValueFactory) {
+    const option = skipEncoding === true ? "true" : JSON.stringify(skipEncoding);
+    throw new Error(`Cannot use skipEncoding: ${option} with a factory default`);
+  }
+
+  return handleDefaultComparison(payload, input, def.defaultValueSource, skipEncoding);
+}
+
+function handleDefaultComparison(
+  payload: ParsePayload,
+  value: unknown,
+  defaultValue: unknown,
+  skipEncoding: boolean | $ZodDefaultSkipEncodingMode
+) {
+  if (!skipEncoding) return payload;
+  const mode = skipEncoding === true ? "deep" : skipEncoding.mode;
+  if (isDefaultEqual(value, defaultValue, mode)) payload.skipEncoding = true;
+  return payload;
+}
+
+function isDefaultEqual(a: unknown, b: unknown, mode: "strict" | "shallow" | "deep"): boolean {
+  if (Object.is(a, b) || mode === "strict") return Object.is(a, b);
+
+  if (Array.isArray(a) && Array.isArray(b)) {
+    return a.length === b.length && a.every((value, index) => compareDefaultMember(value, b[index], mode));
+  }
+  if (util.isPlainObject(a) && util.isPlainObject(b)) {
+    const aKeys = enumerableOwnKeys(a);
+    const bKeys = enumerableOwnKeys(b);
+    return (
+      aKeys.length === bKeys.length &&
+      aKeys.every(
+        (key) => Object.prototype.propertyIsEnumerable.call(b, key) && compareDefaultMember(a[key], b[key], mode)
+      )
+    );
+  }
+  if (a instanceof Map && b instanceof Map) {
+    if (a.size !== b.size) return false;
+    if (mode === "shallow") {
+      for (const [key, value] of a) {
+        if (!b.has(key) || !Object.is(value, b.get(key))) return false;
+      }
+      return true;
+    }
+    return hasBipartiteMatch([...a], [...b], ([aKey, aValue], [bKey, bValue]) => {
+      return isDefaultEqual(aKey, bKey, "deep") && isDefaultEqual(aValue, bValue, "deep");
+    });
+  }
+  if (a instanceof Set && b instanceof Set) {
+    if (a.size !== b.size) return false;
+    if (mode === "shallow") {
+      return [...a].every((value) => b.has(value));
+    }
+    return hasBipartiteMatch([...a], [...b], (aValue, bValue) => isDefaultEqual(aValue, bValue, "deep"));
+  }
+  if (mode === "deep" && a instanceof Date && b instanceof Date) {
+    return Object.is(a.getTime(), b.getTime());
+  }
+  return false;
+}
+
+function compareDefaultMember(a: unknown, b: unknown, mode: "shallow" | "deep") {
+  return mode === "shallow" ? Object.is(a, b) : isDefaultEqual(a, b, "deep");
+}
+
+function enumerableOwnKeys(value: object): PropertyKey[] {
+  return Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
+}
+
+function hasBipartiteMatch<T>(left: T[], right: T[], matches: (left: T, right: T) => boolean): boolean {
+  const assigned = new Array<number>(right.length).fill(-1);
+  const visit = (leftIndex: number, seen: boolean[]): boolean => {
+    for (let rightIndex = 0; rightIndex < right.length; rightIndex++) {
+      if (seen[rightIndex] || !matches(left[leftIndex]!, right[rightIndex]!)) continue;
+      seen[rightIndex] = true;
+      if (assigned[rightIndex] === -1 || visit(assigned[rightIndex]!, seen)) {
+        assigned[rightIndex] = leftIndex;
+        return true;
+      }
+    }
+    return false;
+  };
+  return left.every((_, index) => visit(index, new Array<boolean>(right.length).fill(false)));
+}
+
+  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
+  params?: core.$ZodDefaultParams<T>
+    ...params,
+    defaultValueFactory: typeof defaultValue === "function",
+    defaultValueSource: typeof defaultValue === "function" ? undefined : defaultValue,
+  } as any) as any;
+
+  const c = z._default(z.string(), "default", { skipEncoding: true });
+  expect(z.encode(z.object({ c }), { c: "default" })).toEqual({});