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

replace('packages/zod/src/v4/core/parse.ts',
`  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
    util.captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value as core.output<typeof schema>;`,
`  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
    util.captureStackTrace(e, _params?.callee);
    throw e;
  }
  if (result.omit) return schemas.OMIT as any;
  return result.value as core.output<typeof schema>;`);

replace('packages/zod/src/v4/core/parse.ts',
`  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
    util.captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value as core.output<typeof schema>;`,
`  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config())));
    util.captureStackTrace(e, params?.callee);
    throw e;
  }
  if (result.omit) return schemas.OMIT as any;
  return result.value as core.output<typeof schema>;`);

replace('packages/zod/src/v4/core/parse.ts',
`  return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.value } as any);`,
`  return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.omit ? schemas.OMIT : result.value } as any);`);

replace('packages/zod/src/v4/core/parse.ts',
`  return result.issues.length
    ? {
        success: false,
        error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.value } as any);`,
`  return result.issues.length
    ? {
        success: false,
        error: new _Err(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.omit ? schemas.OMIT : result.value } as any);`);

// classic/schemas.ts
replace('packages/zod/src/v4/classic/schemas.ts',
`  default(def: util.NoUndefined<core.output<this>> | (() => util.NoUndefined<core.output<this>>)): ZodDefault<this> {`,
`  default(def: util.NoUndefined<core.output<this>> | (() => util.NoUndefined<core.output<this>>), options?: { skipEncoding?: core.$ZodDefaultSkipEncoding<core.output<this>> }): ZodDefault<this> {`);

replace('packages/zod/src/v4/classic/schemas.ts',
`        innerType: this,
        defaultValue: def as any,`,
`        innerType: this,
        defaultValue: def as any,
        skipEncoding: options?.skipEncoding,`);

replace('packages/zod/src/v4/classic/schemas.ts',
`  encode(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): core.input<this>;`,
`  encode(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): typeof core.OMIT | core.input<this>;`);

replace('packages/zod/src/v4/classic/schemas.ts',
`  safeEncode(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): ZodSafeParseResult<core.input<this>>;`,
`  safeEncode(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): ZodSafeParseResult<typeof core.OMIT | core.input<this>>;`);

replace('packages/zod/src/v4/classic/schemas.ts',
`  encodeAsync(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): Promise<core.input<this>>;`,
`  encodeAsync(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): Promise<typeof core.OMIT | core.input<this>>;`);

replace('packages/zod/src/v4/classic/schemas.ts',
`  safeEncodeAsync(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): Promise<ZodSafeParseResult<core.input<this>>>;`,
`  safeEncodeAsync(
    data: core.output<this>,
    params?: Partial<core.ParseParams>
  ): Promise<ZodSafeParseResult<typeof core.OMIT | core.input<this>>>;`);

replace('packages/zod/src/v4/classic/external.ts',
`  util,
  NEVER,
} from "../core/index.js";`,
`  util,
  NEVER,
  OMIT,
} from "../core/index.js";`);

console.log("All patches applied successfully!");
