const fs = require('fs');
const path = require('path');

function replace(file, search, replaceWith) {
  const p = path.resolve(file);
  const content = fs.readFileSync(p, 'utf8');
  if (!content.includes(search)) {
    console.error(`Could not find search string in ${file}:\n${search}`);
    process.exit(1);
  }
  fs.writeFileSync(p, content.replace(search, replaceWith));
}

function insertAfter(file, search, insert) {
  replace(file, search, search + '\n' + insert);
}

// 1. core/schemas.ts
replace('packages/zod/src/v4/core/schemas.ts',
`  fallback?: boolean | undefined;
}`,
`  fallback?: boolean | undefined;
  omit?: boolean | undefined;
}`);

insertAfter('packages/zod/src/v4/core/schemas.ts',
`export interface ParsePayload<T = unknown> {`,
`export const OMIT = Symbol("ZOD_OMIT");`);

replace('packages/zod/src/v4/core/schemas.ts',
`    if (result.value === undefined) {
      if (isPresent) {
        (final.value as any)[key] = undefined;`,
`    if (result.omit) return;
    if (result.value === undefined) {
      if (isPresent) {
        (final.value as any)[key] = undefined;`);

// $ZodObjectJIT
replace('packages/zod/src/v4/core/schemas.ts',
`        if (\${id}.value === undefined) {
          if (\${k} in input) {
            newResult[\${k}] = undefined;
          }
        } else {
          newResult[\${k}] = \${id}.value;
        }`,
`        if (!\${id}.omit) {
          if (\${id}.value === undefined) {
            if (\${k} in input) {
              newResult[\${k}] = undefined;
            }
          } else {
            newResult[\${k}] = \${id}.value;
          }
        }`);

replace('packages/zod/src/v4/core/schemas.ts',
`          if (\${id}.value === undefined) {
            newResult[\${k}] = undefined;
          } else {
            newResult[\${k}] = \${id}.value;
          }`,
`          if (!\${id}.omit) {
            if (\${id}.value === undefined) {
              newResult[\${k}] = undefined;
            } else {
              newResult[\${k}] = \${id}.value;
            }
          }`);

replace('packages/zod/src/v4/core/schemas.ts',
`        if (\${id}.value === undefined) {
          if (\${k} in input) {
            newResult[\${k}] = undefined;
          }
        } else {
          newResult[\${k}] = \${id}.value;
        }`,
`        if (!\${id}.omit) {
          if (\${id}.value === undefined) {
            if (\${k} in input) {
              newResult[\${k}] = undefined;
            }
          } else {
            newResult[\${k}] = \${id}.value;
          }
        }`);

// $ZodRecord
replace('packages/zod/src/v4/core/schemas.ts',
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(key, result.issues));
                }
                payload.value[outKey] = result.value;`,
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(key, result.issues));
                }
                if (!result.omit) payload.value[outKey] = result.value;`);

replace('packages/zod/src/v4/core/schemas.ts',
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;`,
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(key, result.issues));
            }
            if (!result.omit) payload.value[outKey] = result.value;`);

replace('packages/zod/src/v4/core/schemas.ts',
`              if (result.issues.length) {
                payload.issues.push(...util.prefixIssues(key, result.issues));
              }
              payload.value[keyResult.value as PropertyKey] = result.value;`,
`              if (result.issues.length) {
                payload.issues.push(...util.prefixIssues(key, result.issues));
              }
              if (!keyResult.omit && !result.omit) payload.value[keyResult.value as PropertyKey] = result.value;`);

replace('packages/zod/src/v4/core/schemas.ts',
`          if (result.issues.length) {
            payload.issues.push(...util.prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value as PropertyKey] = result.value;`,
`          if (result.issues.length) {
            payload.issues.push(...util.prefixIssues(key, result.issues));
          }
          if (!keyResult.omit && !result.omit) payload.value[keyResult.value as PropertyKey] = result.value;`);

// handleMapResult
insertAfter('packages/zod/src/v4/core/schemas.ts',
`  if (keyResult.issues.length) {`,
`  if (keyResult.omit || valueResult.omit) return;`);

// $ZodArray
replace('packages/zod/src/v4/core/schemas.ts',
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(i, result.issues));
                }
                payload.value.push(result.value);`,
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(i, result.issues));
                }
                if (!result.omit) payload.value.push(result.value);`);

replace('packages/zod/src/v4/core/schemas.ts',
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(i, result.issues));
            }
            payload.value.push(result.value);`,
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(i, result.issues));
            }
            if (!result.omit) payload.value.push(result.value);`);

// handleSetResult
insertAfter('packages/zod/src/v4/core/schemas.ts',
`function handleSetResult(payload: ParsePayload, result: ParsePayload, i: number) {`,
`  if (result.omit) return;`);

// $ZodTuple
replace('packages/zod/src/v4/core/schemas.ts',
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(i, result.issues));
                }
                payload.value.push(result.value);`,
`                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(i, result.issues));
                }
                if (!result.omit) payload.value.push(result.value);`);

replace('packages/zod/src/v4/core/schemas.ts',
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(i, result.issues));
            }
            payload.value.push(result.value);`,
`            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(i, result.issues));
            }
            if (!result.omit) payload.value.push(result.value);`);

// $ZodIntersection
replace('packages/zod/src/v4/core/schemas.ts',
`function mergeValues(a: any, b: any) {
  const aType = util.getParsedType(a);`,
`function mergeValues(a: any, b: any) {
  if (a === OMIT) return b;
  if (b === OMIT) return a;
  const aType = util.getParsedType(a);`);

replace('packages/zod/src/v4/core/schemas.ts',
`        if (rightResult instanceof Promise) {
          return rightResult.then((rightResult) => handleIntersectionResult(leftResult, rightResult, payload, ctx));
        }
        return handleIntersectionResult(leftResult, rightResult, payload, ctx);
      });
    }

    const rightResult = right._zod.run(payload, ctx);
    if (rightResult instanceof Promise) {
      return rightResult.then((rightResult) => handleIntersectionResult(leftResult, rightResult, payload, ctx));
    }
    return handleIntersectionResult(leftResult, rightResult, payload, ctx);`,
`        if (rightResult instanceof Promise) {
          return rightResult.then((rightResult) => {
             const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);
             if (leftResult.omit && rightResult.omit) final.omit = true;
             else if (leftResult.omit) final.value = rightResult.value;
             else if (rightResult.omit) final.value = leftResult.value;
             return final;
          });
        }
        const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);
        if (leftResult.omit && rightResult.omit) final.omit = true;
        else if (leftResult.omit) final.value = rightResult.value;
        else if (rightResult.omit) final.value = leftResult.value;
        return final;
      });
    }

    const rightResult = right._zod.run(payload, ctx);
    if (rightResult instanceof Promise) {
      return rightResult.then((rightResult) => {
         const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);
         if (leftResult.omit && rightResult.omit) final.omit = true;
         else if (leftResult.omit) final.value = rightResult.value;
         else if (rightResult.omit) final.value = leftResult.value;
         return final;
      });
    }
    const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);
    if (leftResult.omit && rightResult.omit) final.omit = true;
    else if (leftResult.omit) final.value = rightResult.value;
    else if (rightResult.omit) final.value = leftResult.value;
    return final;`);

// $ZodDefault
insertAfter('packages/zod/src/v4/core/schemas.ts',
`  defaultValue: util.NoUndefined<core.output<T>>;`,
`  skipEncoding?: $ZodDefaultSkipEncoding<core.output<T>>;`);

insertAfter('packages/zod/src/v4/core/schemas.ts',
`export interface $ZodDefaultDef<T extends SomeType = $ZodType> extends $ZodTypeDef {`,
`export type $ZodDefaultSkipEncoding<T> = boolean | { mode: "strict" | "shallow" | "deep" } | ((this: any, encoded: T, rawDefault: unknown) => boolean);`);

replace('packages/zod/src/v4/core/schemas.ts',
`    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }`,
`    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((res) => handleDefaultEncodeResult(res, def, inst, ctx));
        }
        return handleDefaultEncodeResult(result, def, inst, ctx);
      }`);

fs.appendFileSync('packages/zod/src/v4/core/schemas.ts', \`

function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, inst: $ZodDefault, ctx: ParseContextInternal) {
  if (payload.omit || payload.issues.length) return payload;

  const skipEncoding = def.skipEncoding;
  if (!skipEncoding) return payload;

  let shouldSkip = false;
  if (typeof skipEncoding === "function") {
    if (ctx.async) {
      // Async predicate in async encode -> not allowed if returning promise? Actually, prompt says: "Using an async predicate during a synchronous schema.encode() must throw". Wait, what if predicate is async?
      // Prompt says: "Using an async predicate during a synchronous schema.encode() must throw".
      // Let's execute predicate:
      const res = skipEncoding.call(inst, payload.value as never, def.defaultValueIsFactory ? undefined : def.defaultValue);
      if (res instanceof Promise) {
         if (!ctx.async) throw new Error("Cannot use async skipEncoding in synchronous encode");
         return res.then(r => {
            if (r) payload.omit = true;
            return payload;
         });
      }
      shouldSkip = Boolean(res);
    } else {
      const res = skipEncoding.call(inst, payload.value as never, def.defaultValueIsFactory ? undefined : def.defaultValue);
      if (res instanceof Promise) throw new Error("Cannot use async skipEncoding in synchronous encode");
      shouldSkip = Boolean(res);
    }
  } else {
    if (def.defaultValueIsFactory) throw new Error("Cannot use skipEncoding: true with a factory default");
    const mode = typeof skipEncoding === "boolean" ? "deep" : skipEncoding.mode;
    
    // Encode default to compare
    const defaultPayload = { value: def.defaultValue, issues: [] };
    const defaultRes = def.innerType._zod.run(defaultPayload, { ...ctx, skipChecks: true, direction: "backward" });
    
    if (defaultRes instanceof Promise) {
      if (!ctx.async) throw new Error("Cannot use skipEncoding predicate with an async factory default");
      return defaultRes.then(dRes => {
         payload.omit = isEncodingMatch(payload.value, dRes.value, mode);
         return payload;
      });
    }
    shouldSkip = isEncodingMatch(payload.value, defaultRes.value, mode);
  }

  if (shouldSkip) {
    payload.omit = true;
  }
  return payload;
}

function isEncodingMatch(a: any, b: any, mode: "strict" | "shallow" | "deep"): boolean {
  if (Object.is(a, b)) return true;
  if (mode === "strict") return false;
  
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    if (mode === "shallow") return a.every((v, i) => Object.is(v, b[i]));
    return a.every((v, i) => isEncodingMatch(v, b[i], "deep"));
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    const aArr = Array.from(a);
    const bArr = Array.from(b);
    if (mode === "shallow") {
       return aArr.every(v => bArr.some(bv => Object.is(v, bv))); // Need better bipartite for deep? Bipartite matching is complex, let's just do O(N^2) greedy for deep.
    }
    const matchedB = new Set<number>();
    for (const v of aArr) {
      let found = false;
      for (let i = 0; i < bArr.length; i++) {
        if (!matchedB.has(i) && isEncodingMatch(v, bArr[i], mode)) {
          matchedB.add(i);
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    if (mode === "shallow") {
       for (const [k, v] of a.entries()) {
         if (!b.has(k) || !Object.is(v, b.get(k))) return false;
       }
       return true;
    }
    const bArr = Array.from(b.entries());
    const matchedB = new Set<number>();
    for (const [ak, av] of a.entries()) {
      let found = false;
      for (let i = 0; i < bArr.length; i++) {
        if (!matchedB.has(i)) {
           const [bk, bv] = bArr[i];
           if (isEncodingMatch(ak, bk, mode) && isEncodingMatch(av, bv, mode)) {
             matchedB.add(i);
             found = true;
             break;
           }
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (util.isPlainObject(a) && util.isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    if (mode === "shallow") {
       return keysA.every(k => Object.prototype.hasOwnProperty.call(b, k) && Object.is(a[k], b[k]));
    }
    return keysA.every(k => Object.prototype.hasOwnProperty.call(b, k) && isEncodingMatch(a[k], b[k], "deep"));
  }

  return false;
}
\`);
`);
