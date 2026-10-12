const fs = require('fs');
const path = require('path');

function read(file) {
  const p = path.resolve(__dirname, 'zod', file);
  return fs.readFileSync(p, 'utf8').replace(/\\r\\n/g, '\\n');
}

function write(file, content) {
  const p = path.resolve(__dirname, 'zod', file);
  fs.writeFileSync(p, content);
}

function replace(file, search, replaceWith) {
  const content = read(file);
  if (!content.includes(search)) {
    console.error("Could not find search string in " + file + ":\\n" + search);
    process.exit(1);
  }
  write(file, content.replace(search, replaceWith));
}

function insertAfter(file, search, insert) {
  replace(file, search, search + '\\n' + insert);
}

replace('packages/zod/src/v4/core/schemas.ts',
'  fallback?: boolean | undefined;\\n}',
'  fallback?: boolean | undefined;\\n  omit?: boolean | undefined;\\n}');

insertAfter('packages/zod/src/v4/core/schemas.ts',
'export interface ParsePayload<T = unknown> {',
'export const OMIT = Symbol("ZOD_OMIT");');

replace('packages/zod/src/v4/core/schemas.ts',
'    if (result.value === undefined) {\\n      if (isPresent) {\\n        (final.value as any)[key] = undefined;',
'    if (result.omit) return;\\n    if (result.value === undefined) {\\n      if (isPresent) {\\n        (final.value as any)[key] = undefined;');

replace('packages/zod/src/v4/core/schemas.ts',
'        if (${id}.value === undefined) {\\n          if (${k} in input) {\\n            newResult[${k}] = undefined;\\n          }\\n        } else {\\n          newResult[${k}] = ${id}.value;\\n        }',
'        if (!${id}.omit) {\\n          if (${id}.value === undefined) {\\n            if (${k} in input) {\\n              newResult[${k}] = undefined;\\n            }\\n          } else {\\n            newResult[${k}] = ${id}.value;\\n          }\\n        }');

replace('packages/zod/src/v4/core/schemas.ts',
'          if (${id}.value === undefined) {\\n            newResult[${k}] = undefined;\\n          } else {\\n            newResult[${k}] = ${id}.value;\\n          }',
'          if (!${id}.omit) {\\n            if (${id}.value === undefined) {\\n              newResult[${k}] = undefined;\\n            } else {\\n              newResult[${k}] = ${id}.value;\\n            }\\n          }');

replace('packages/zod/src/v4/core/schemas.ts',
'        if (${id}.value === undefined) {\\n          if (${k} in input) {\\n            newResult[${k}] = undefined;\\n          }\\n        } else {\\n          newResult[${k}] = ${id}.value;\\n        }',
'        if (!${id}.omit) {\\n          if (${id}.value === undefined) {\\n            if (${k} in input) {\\n              newResult[${k}] = undefined;\\n            }\\n          } else {\\n            newResult[${k}] = ${id}.value;\\n          }\\n        }');

replace('packages/zod/src/v4/core/schemas.ts',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(key, result.issues));\\n                }\\n                payload.value[outKey] = result.value;',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(key, result.issues));\\n                }\\n                if (!result.omit) payload.value[outKey] = result.value;');

replace('packages/zod/src/v4/core/schemas.ts',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(key, result.issues));\\n            }\\n            payload.value[outKey] = result.value;',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(key, result.issues));\\n            }\\n            if (!result.omit) payload.value[outKey] = result.value;');

replace('packages/zod/src/v4/core/schemas.ts',
'              if (result.issues.length) {\\n                payload.issues.push(...util.prefixIssues(key, result.issues));\\n              }\\n              payload.value[keyResult.value as PropertyKey] = result.value;',
'              if (result.issues.length) {\\n                payload.issues.push(...util.prefixIssues(key, result.issues));\\n              }\\n              if (!keyResult.omit && !result.omit) payload.value[keyResult.value as PropertyKey] = result.value;');

replace('packages/zod/src/v4/core/schemas.ts',
'          if (result.issues.length) {\\n            payload.issues.push(...util.prefixIssues(key, result.issues));\\n          }\\n          payload.value[keyResult.value as PropertyKey] = result.value;',
'          if (result.issues.length) {\\n            payload.issues.push(...util.prefixIssues(key, result.issues));\\n          }\\n          if (!keyResult.omit && !result.omit) payload.value[keyResult.value as PropertyKey] = result.value;');

insertAfter('packages/zod/src/v4/core/schemas.ts',
'  if (keyResult.issues.length) {',
'  if (keyResult.omit || valueResult.omit) return;');

replace('packages/zod/src/v4/core/schemas.ts',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(i, result.issues));\\n                }\\n                payload.value.push(result.value);',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(i, result.issues));\\n                }\\n                if (!result.omit) payload.value.push(result.value);');

replace('packages/zod/src/v4/core/schemas.ts',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(i, result.issues));\\n            }\\n            payload.value.push(result.value);',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(i, result.issues));\\n            }\\n            if (!result.omit) payload.value.push(result.value);');

insertAfter('packages/zod/src/v4/core/schemas.ts',
'function handleSetResult(payload: ParsePayload, result: ParsePayload, i: number) {',
'  if (result.omit) return;');

replace('packages/zod/src/v4/core/schemas.ts',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(i, result.issues));\\n                }\\n                payload.value.push(result.value);',
'                if (result.issues.length) {\\n                  payload.issues.push(...util.prefixIssues(i, result.issues));\\n                }\\n                if (!result.omit) payload.value.push(result.value);');

replace('packages/zod/src/v4/core/schemas.ts',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(i, result.issues));\\n            }\\n            payload.value.push(result.value);',
'            if (result.issues.length) {\\n              payload.issues.push(...util.prefixIssues(i, result.issues));\\n            }\\n            if (!result.omit) payload.value.push(result.value);');

replace('packages/zod/src/v4/core/schemas.ts',
'function mergeValues(a: any, b: any) {\\n  const aType = util.getParsedType(a);',
'function mergeValues(a: any, b: any) {\\n  if (a === OMIT) return b;\\n  if (b === OMIT) return a;\\n  const aType = util.getParsedType(a);');

replace('packages/zod/src/v4/core/schemas.ts',
'        if (rightResult instanceof Promise) {\\n          return rightResult.then((rightResult) => handleIntersectionResult(leftResult, rightResult, payload, ctx));\\n        }\\n        return handleIntersectionResult(leftResult, rightResult, payload, ctx);\\n      });\\n    }\\n\\n    const rightResult = right._zod.run(payload, ctx);\\n    if (rightResult instanceof Promise) {\\n      return rightResult.then((rightResult) => handleIntersectionResult(leftResult, rightResult, payload, ctx));\\n    }\\n    return handleIntersectionResult(leftResult, rightResult, payload, ctx);',
'        if (rightResult instanceof Promise) {\\n          return rightResult.then((rightResult) => {\\n             const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);\\n             if (leftResult.omit && rightResult.omit) final.omit = true;\\n             else if (leftResult.omit) final.value = rightResult.value;\\n             else if (rightResult.omit) final.value = leftResult.value;\\n             return final;\\n          });\\n        }\\n        const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);\\n        if (leftResult.omit && rightResult.omit) final.omit = true;\\n        else if (leftResult.omit) final.value = rightResult.value;\\n        else if (rightResult.omit) final.value = leftResult.value;\\n        return final;\\n      });\\n    }\\n\\n    const rightResult = right._zod.run(payload, ctx);\\n    if (rightResult instanceof Promise) {\\n      return rightResult.then((rightResult) => {\\n         const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);\\n         if (leftResult.omit && rightResult.omit) final.omit = true;\\n         else if (leftResult.omit) final.value = rightResult.value;\\n         else if (rightResult.omit) final.value = leftResult.value;\\n         return final;\\n      });\\n    }\\n    const final = handleIntersectionResult(leftResult, rightResult, payload, ctx);\\n    if (leftResult.omit && rightResult.omit) final.omit = true;\\n    else if (leftResult.omit) final.value = rightResult.value;\\n    else if (rightResult.omit) final.value = leftResult.value;\\n    return final;');

insertAfter('packages/zod/src/v4/core/schemas.ts',
'  defaultValue: util.NoUndefined<core.output<T>>;',
'  skipEncoding?: $ZodDefaultSkipEncoding<core.output<T>>;');

insertAfter('packages/zod/src/v4/core/schemas.ts',
'export interface $ZodDefaultDef<T extends SomeType = $ZodType> extends $ZodTypeDef {',
'export type $ZodDefaultSkipEncoding<T> = boolean | { mode: "strict" | "shallow" | "deep" } | ((this: any, encoded: T, rawDefault: unknown) => boolean);');

replace('packages/zod/src/v4/core/schemas.ts',
'    inst._zod.parse = (payload, ctx) => {\\n      if (ctx.direction === "backward") {\\n        return def.innerType._zod.run(payload, ctx);\\n      }',
'    inst._zod.parse = (payload, ctx) => {\\n      if (ctx.direction === "backward") {\\n        const result = def.innerType._zod.run(payload, ctx);\\n        if (result instanceof Promise) {\\n          return result.then((res) => handleDefaultEncodeResult(res, def, inst, ctx));\\n        }\\n        return handleDefaultEncodeResult(result, def, inst, ctx);\\n      }');

const addition = `
function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, inst: $ZodDefault, ctx: ParseContextInternal) {
  if (payload.omit || payload.issues.length) return payload;

  const skipEncoding = def.skipEncoding;
  if (!skipEncoding) return payload;

  let shouldSkip = false;
  if (typeof skipEncoding === "function") {
    if (ctx.async) {
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
       return aArr.every(v => bArr.some(bv => Object.is(v, bv)));
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
`;
write('packages/zod/src/v4/core/schemas.ts', read('packages/zod/src/v4/core/schemas.ts') + addition);

replace('packages/zod/src/v4/core/parse.ts',
'  if (result.issues.length) {\\n    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));\\n    util.captureStackTrace(e, _params?.callee);\\n    throw e;\\n  }\\n  return result.value as core.output<typeof schema>;',
'  if (result.issues.length) {\\n    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));\\n    util.captureStackTrace(e, _params?.callee);\\n    throw e;\\n  }\\n  if (result.omit) return schemas.OMIT as any;\\n  return result.value as core.output<typeof schema>;');

replace('packages/zod/src/v4/core/parse.ts',
'  if (result.issues.length) {\\n    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));\\n    util.captureStackTrace(e, params?.callee);\\n    throw e;\\n  }\\n  return result.value as core.output<typeof schema>;',
'  if (result.issues.length) {\\n    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));\\n    util.captureStackTrace(e, params?.callee);\\n    throw e;\\n  }\\n  if (result.omit) return schemas.OMIT as any;\\n  return result.value as core.output<typeof schema>;');

replace('packages/zod/src/v4/core/parse.ts',
'  return result.issues.length\\n    ? {\\n        success: false,\\n        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),\\n      }\\n    : ({ success: true, data: result.value } as any);',
'  return result.issues.length\\n    ? {\\n        success: false,\\n        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),\\n      }\\n    : ({ success: true, data: result.omit ? schemas.OMIT : result.value } as any);');

replace('packages/zod/src/v4/core/parse.ts',
'  return result.issues.length\\n    ? {\\n        success: false,\\n        error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),\\n      }\\n    : ({ success: true, data: result.value } as any);',
'  return result.issues.length\\n    ? {\\n        success: false,\\n        error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),\\n      }\\n    : ({ success: true, data: result.omit ? schemas.OMIT : result.value } as any);');

replace('packages/zod/src/v4/classic/schemas.ts',
'  default(def: util.NoUndefined<core.output<this>> | (() => util.NoUndefined<core.output<this>>)): ZodDefault<this> {',
'  default(def: util.NoUndefined<core.output<this>> | (() => util.NoUndefined<core.output<this>>), options?: { skipEncoding?: core.$ZodDefaultSkipEncoding<core.output<this>> }): ZodDefault<this> {');

replace('packages/zod/src/v4/classic/schemas.ts',
'        innerType: this,\\n        defaultValue: def as any,',
'        innerType: this,\\n        defaultValue: def as any,\\n        skipEncoding: options?.skipEncoding,');

replace('packages/zod/src/v4/classic/schemas.ts',
'  encode(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): core.input<this>;',
'  encode(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): typeof core.OMIT | core.input<this>;');

replace('packages/zod/src/v4/classic/schemas.ts',
'  safeEncode(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): ZodSafeParseResult<core.input<this>>;',
'  safeEncode(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): ZodSafeParseResult<typeof core.OMIT | core.input<this>>;');

replace('packages/zod/src/v4/classic/schemas.ts',
'  encodeAsync(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): Promise<core.input<this>>;',
'  encodeAsync(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): Promise<typeof core.OMIT | core.input<this>>;');

replace('packages/zod/src/v4/classic/schemas.ts',
'  safeEncodeAsync(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): Promise<ZodSafeParseResult<core.input<this>>>;',
'  safeEncodeAsync(\\n    data: core.output<this>,\\n    params?: Partial<core.ParseParams>\\n  ): Promise<ZodSafeParseResult<typeof core.OMIT | core.input<this>>>;');

replace('packages/zod/src/v4/classic/external.ts',
'  util,\\n  NEVER,\\n} from "../core/index.js";',
'  util,\\n  NEVER,\\n  OMIT,\\n} from "../core/index.js";');

console.log("All patches applied successfully!");
