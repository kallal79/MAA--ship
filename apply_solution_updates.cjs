const fs = require('fs');
const path = require('path');
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

// 1. Update core/schemas.ts
const coreSchemasPath = path.join(zodDir, 'packages/zod/src/v4/core/schemas.ts');
let cs = fs.readFileSync(coreSchemasPath, 'utf8');

cs = cs.replace('const OMIT = Symbol("zod.omit");', 'export const OMIT = Symbol("ZOD_OMIT");');

cs = cs.replace(
  'export type $ZodDefaultSkipEncoding =',
  'export type $ZodDefaultSkipEncoding<T extends SomeType = any> ='
);
cs = cs.replace(
  '| ((encodedValue: unknown, rawDefaultValue: unknown) => util.MaybeAsync<boolean>);',
  '| ((this: $ZodDefault<T>, encodedValue: core.input<T>, rawDefaultValue: core.output<T> | undefined) => util.MaybeAsync<boolean>);'
);

cs = cs.replace(
  'return handleDefaultEncode(payload, ctx, def);',
  'return handleDefaultEncode(payload, ctx, inst, def);'
);

cs = cs.replace(
  'function handleDefaultEncode(payload: ParsePayload, ctx: ParseContextInternal, def: $ZodDefaultDef) {',
  'function handleDefaultEncode(payload: ParsePayload, ctx: ParseContextInternal, inst: $ZodDefault, def: $ZodDefaultDef) {'
);

cs = cs.replace(
  'const defaultValue = def.isDefaultFactory ? def.defaultValue : def.rawDefaultValue;',
  'const defaultValue = def.isDefaultFactory ? def.defaultValue : def.rawDefaultValue;\n    if (defaultValue instanceof Promise && typeof def.skipEncoding === "function") {\n      throw new Error("Cannot use skipEncoding predicate with an async factory default");\n    }'
);

cs = cs.replace(
  'const shouldOmit = shouldSkipEncoding(def.skipEncoding!, result.value, defaultResult.value, def, ctx);',
  'const shouldOmit = shouldSkipEncoding(def.skipEncoding!, result.value, defaultResult.value, inst, def, ctx);'
);

cs = cs.replace(
  'const result = skipEncoding(encodedValue, def.isDefaultFactory ? undefined : def.rawDefaultValue);',
  'const result = skipEncoding.call(inst, encodedValue as any, def.isDefaultFactory ? undefined : (def.rawDefaultValue as any));'
);

// Record and Map result handlers: omit entry ONLY when valueResult is omitted
cs = cs.replace(
  'if (isOmitted(keyResult) || isOmitted(valueResult)) return;',
  'if (isOmitted(valueResult)) return;'
);

fs.writeFileSync(coreSchemasPath, cs, 'utf8');
console.log('Updated core/schemas.ts');

// 2. Update core/parse.ts
const coreParsePath = path.join(zodDir, 'packages/zod/src/v4/core/parse.ts');
let cp = fs.readFileSync(coreParsePath, 'utf8');

cp = cp.replace('import type * as schemas from "./schemas.js";', 'import * as schemas from "./schemas.js";');

cp = cp.replace(
  'return result.value as core.output<typeof schema>;',
  'return (result.omit ? schemas.OMIT : result.value) as core.output<typeof schema>;'
);

cp = cp.replace(
  `return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.value } as any);`,
  `return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? errors.$ZodError)(result.issues.map((iss) => util.finalizeIssue(iss, ctx, core.config()))),
      }
    : ({ success: true, data: result.omit ? schemas.OMIT : result.value } as any);`
);

cp = cp.replace(
  `export type $Encode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => core.input<T>;`,
  `export type $CanOmit<T> = T extends { _zod: { def: { type: "default" } } }
  ? true
  : T extends { _zod: { def: { innerType: infer Inner } } }
  ? $CanOmit<Inner>
  : false;

export type $EncodeResult<T extends schemas.$ZodType> =
  $CanOmit<T> extends true
    ? typeof schemas.OMIT | core.input<T>
    : core.input<T>;

export type $Encode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => $EncodeResult<T>;`
);

cp = cp.replace(
  `export type $EncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<core.input<T>>;`,
  `export type $EncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<$EncodeResult<T>>;`
);

cp = cp.replace(
  `export type $SafeEncode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<core.input<T>>;`,
  `export type $SafeEncode = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => util.SafeParseResult<$EncodeResult<T>>;`
);

cp = cp.replace(
  `export type $SafeEncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<core.input<T>>>;`,
  `export type $SafeEncodeAsync = <T extends schemas.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: schemas.ParseContext<errors.$ZodIssue>
) => Promise<util.SafeParseResult<$EncodeResult<T>>>;`
);

fs.writeFileSync(coreParsePath, cp, 'utf8');
console.log('Updated core/parse.ts');

// 3. Update classic/external.ts
const classicExtPath = path.join(zodDir, 'packages/zod/src/v4/classic/external.ts');
let cle = fs.readFileSync(classicExtPath, 'utf8');
if (!cle.includes('OMIT,')) {
  cle = cle.replace('NEVER,', 'NEVER,\n  OMIT,');
  fs.writeFileSync(classicExtPath, cle, 'utf8');
  console.log('Updated classic/external.ts');
}

// 4. Update mini/external.ts
const miniExtPath = path.join(zodDir, 'packages/zod/src/v4/mini/external.ts');
let me = fs.readFileSync(miniExtPath, 'utf8');
if (!me.includes('OMIT,')) {
  me = me.replace('NEVER,', 'NEVER,\n  OMIT,');
  fs.writeFileSync(miniExtPath, me, 'utf8');
  console.log('Updated mini/external.ts');
}

// 5. Update classic/parse.ts
const classicParsePath = path.join(zodDir, 'packages/zod/src/v4/classic/parse.ts');
let clp = fs.readFileSync(classicParsePath, 'utf8');
clp = clp.replace(
  `export const encode: <T extends core.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => core.input<T> = /* @__PURE__ */ core._encode(ZodRealError);`,
  `export const encode: core.$Encode = /* @__PURE__ */ core._encode(ZodRealError);`
);
clp = clp.replace(
  `export const encodeAsync: <T extends core.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: core.ParseContext<core.$ZodIssue>
) => Promise<core.input<T>> = /* @__PURE__ */ core._encodeAsync(ZodRealError);`,
  `export const encodeAsync: core.$EncodeAsync = /* @__PURE__ */ core._encodeAsync(ZodRealError);`
);
clp = clp.replace(
  `export const safeEncode: <T extends core.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: core.ParseContext<core.$ZodIssue>
): ZodSafeParseResult<core.input<T>> => core._safeEncode(ZodRealError)(schema, value, _ctx);`,
  `export const safeEncode: core.$SafeEncode = /* @__PURE__ */ core._safeEncode(ZodRealError);`
);
clp = clp.replace(
  `export const safeEncodeAsync: <T extends core.$ZodType>(
  schema: T,
  value: core.output<T>,
  _ctx?: core.ParseContext<core.$ZodIssue>
): Promise<ZodSafeParseResult<core.input<T>>> => core._safeEncodeAsync(ZodRealError)(schema, value, _ctx);`,
  `export const safeEncodeAsync: core.$SafeEncodeAsync = /* @__PURE__ */ core._safeEncodeAsync(ZodRealError);`
);
fs.writeFileSync(classicParsePath, clp, 'utf8');
console.log('Updated classic/parse.ts');

// 6. Update classic/schemas.ts
const classicSchemasPath = path.join(zodDir, 'packages/zod/src/v4/classic/schemas.ts');
let cls = fs.readFileSync(classicSchemasPath, 'utf8');
if (!cls.includes('export { OMIT }')) {
  cls = cls.replace('export type ZodStandardSchemaWithJSON', 'export { OMIT } from "../core/index.js";\nexport type ZodStandardSchemaWithJSON');
}

cls = cls.replace(
  'encode(data: core.output<this>, params?: core.ParseContext<core.$ZodIssue>): core.input<this>;',
  'encode(data: core.output<this>, params?: core.ParseContext<core.$ZodIssue>): core.$EncodeResult<this>;'
);
cls = cls.replace(
  'encodeAsync(data: core.output<this>, params?: core.ParseContext<core.$ZodIssue>): Promise<core.input<this>>;',
  'encodeAsync(data: core.output<this>, params?: core.ParseContext<core.$ZodIssue>): Promise<core.$EncodeResult<this>>;'
);
cls = cls.replace(
  `safeEncode(
    data: core.output<this>,
    params?: core.ParseContext<core.$ZodIssue>
  ): parse.ZodSafeParseResult<core.input<this>>;`,
  `safeEncode(
    data: core.output<this>,
    params?: core.ParseContext<core.$ZodIssue>
  ): parse.ZodSafeParseResult<core.$EncodeResult<this>>;`
);
cls = cls.replace(
  `safeEncodeAsync(
    data: core.output<this>,
    params?: core.ParseContext<core.$ZodIssue>
  ): Promise<parse.ZodSafeParseResult<core.input<this>>>;`,
  `safeEncodeAsync(
    data: core.output<this>,
    params?: core.ParseContext<core.$ZodIssue>
  ): Promise<parse.ZodSafeParseResult<core.$EncodeResult<this>>>;`
);

cls = cls.replace(
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<T> | undefined }',
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<this> | undefined }'
);
cls = cls.replace(
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding | undefined }',
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<this> | undefined }'
);
cls = cls.replace(
  'export function _default<T extends core.SomeType>(\n  innerType: T,\n  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),\n  params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<this> | undefined }\n): ZodDefault<T> {',
  'export function _default<T extends core.SomeType>(\n  innerType: T,\n  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),\n  params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<T> | undefined }\n): ZodDefault<T> {'
);

fs.writeFileSync(classicSchemasPath, cls, 'utf8');
console.log('Updated classic/schemas.ts');

// 7. Update mini/schemas.ts
const miniSchemasPath = path.join(zodDir, 'packages/zod/src/v4/mini/schemas.ts');
let ms = fs.readFileSync(miniSchemasPath, 'utf8');
ms = ms.replace(
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding | undefined }',
  'params?: { skipEncoding?: core.$ZodDefaultSkipEncoding<T> | undefined }'
);
fs.writeFileSync(miniSchemasPath, ms, 'utf8');
console.log('Updated mini/schemas.ts');
