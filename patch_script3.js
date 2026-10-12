const fs = require('fs');
const path = require('path');

function read(file) {
  return fs.readFileSync(path.resolve(__dirname, 'zod', file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.resolve(__dirname, 'zod', file), content);
}

let schemas = read('packages/zod/src/v4/core/schemas.ts');

schemas = schemas.replace(/fallback\?: boolean \| undefined;\r?\n\}/, 'fallback?: boolean | undefined;\n  omit?: boolean | undefined;\n}');
schemas = schemas.replace(/export interface ParsePayload<T = unknown> \{/, 'export const OMIT = Symbol("ZOD_OMIT");\nexport interface ParsePayload<T = unknown> {');

// ZodObjectJIT third occurrence (the first two were done by multi_replace)
schemas = schemas.replace(/if \(\$\{id\}\.value === undefined\) \{\s*if \(\$\{k\} in input\) \{\s*newResult\[\$\{k\}\] = undefined;\s*\}\s*\} else \{\s*newResult\[\$\{k\}\] = \$\{id\}\.value;\s*\}/g,
`if (!\${id}.omit) {
          if (\${id}.value === undefined) {
            if (\${k} in input) {
              newResult[\${k}] = undefined;
            }
          } else {
            newResult[\${k}] = \${id}.value;
          }
        }`);

// $ZodRecord
schemas = schemas.replace(/payload\.value\[outKey\] = result\.value;/g, 'if (!result.omit) payload.value[outKey] = result.value;');
schemas = schemas.replace(/payload\.value\[keyResult\.value as PropertyKey\] = result\.value;/g, 'if (!keyResult.omit && !result.omit) payload.value[keyResult.value as PropertyKey] = result.value;');

// handleMapResult
schemas = schemas.replace(/if \(keyResult\.issues\.length\) \{/, 'if (keyResult.omit || valueResult.omit) return;\n  if (keyResult.issues.length) {');

// $ZodArray & $ZodTuple
schemas = schemas.replace(/payload\.value\.push\(result\.value\);/g, 'if (!result.omit) payload.value.push(result.value);');

// handleSetResult
schemas = schemas.replace(/function handleSetResult\(payload: ParsePayload, result: ParsePayload, i: number\) \{/, 'function handleSetResult(payload: ParsePayload, result: ParsePayload, i: number) {\n  if (result.omit) return;');

// $ZodIntersection
schemas = schemas.replace(/function mergeValues\(a: any, b: any\) \{/, 'function mergeValues(a: any, b: any) {\n  if (a === OMIT) return b;\n  if (b === OMIT) return a;');

schemas = schemas.replace(/const rightResult = right\._zod\.run\(payload, ctx\);[\s\S]*?handleIntersectionResult\(leftResult, rightResult, payload, ctx\);/g,
`const rightResult = right._zod.run(payload, ctx);
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
schemas = schemas.replace(/defaultValue: util\.NoUndefined<core\.output<T>>;/, 'defaultValue: util.NoUndefined<core.output<T>>;\n  skipEncoding?: $ZodDefaultSkipEncoding<core.output<T>>;');
schemas = schemas.replace(/export interface \$ZodDefaultDef<T extends SomeType = \$ZodType> extends \$ZodTypeDef \{/, 'export type $ZodDefaultSkipEncoding<T> = boolean | { mode: "strict" | "shallow" | "deep" } | ((this: any, encoded: T, rawDefault: unknown) => boolean);\nexport interface $ZodDefaultDef<T extends SomeType = $ZodType> extends $ZodTypeDef {');

schemas = schemas.replace(/inst\._zod\.parse = \(payload, ctx\) => \{\s*if \(ctx\.direction === "backward"\) \{\s*return def\.innerType\._zod\.run\(payload, ctx\);\s*\}/,
`inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((res) => handleDefaultEncodeResult(res, def, inst, ctx));
        }
        return handleDefaultEncodeResult(result, def, inst, ctx);
      }`);

write('packages/zod/src/v4/core/schemas.ts', schemas);

// parse.ts
let parseTs = read('packages/zod/src/v4/core/parse.ts');

parseTs = parseTs.replace(/return result\.value as core\.output<typeof schema>;/g, 'if (result.omit) return schemas.OMIT as any;\n  return result.value as core.output<typeof schema>;');
parseTs = parseTs.replace(/data: result\.value/g, 'data: result.omit ? schemas.OMIT : result.value');

write('packages/zod/src/v4/core/parse.ts', parseTs);

// classic/schemas.ts
let classicSchemas = read('packages/zod/src/v4/classic/schemas.ts');

classicSchemas = classicSchemas.replace(/default\(def: util\.NoUndefined<core\.output<this>> \| \(\(\) => util\.NoUndefined<core\.output<this>>\)\): ZodDefault<this> \{/, 'default(def: util.NoUndefined<core.output<this>> | (() => util.NoUndefined<core.output<this>>), options?: { skipEncoding?: core.$ZodDefaultSkipEncoding<core.output<this>> }): ZodDefault<this> {');
classicSchemas = classicSchemas.replace(/innerType: this,\r?\n\s*defaultValue: def as any,/, 'innerType: this,\n        defaultValue: def as any,\n        skipEncoding: options?.skipEncoding,');

classicSchemas = classicSchemas.replace(/data: core\.output<this>,\r?\n\s*params\?: Partial<core\.ParseParams>\r?\n\s*\): core\.input<this>;/, 'data: core.output<this>,\n    params?: Partial<core.ParseParams>\n  ): typeof core.OMIT | core.input<this>;');
classicSchemas = classicSchemas.replace(/data: core\.output<this>,\r?\n\s*params\?: Partial<core\.ParseParams>\r?\n\s*\): ZodSafeParseResult<core\.input<this>>;/, 'data: core.output<this>,\n    params?: Partial<core.ParseParams>\n  ): ZodSafeParseResult<typeof core.OMIT | core.input<this>>;');
classicSchemas = classicSchemas.replace(/data: core\.output<this>,\r?\n\s*params\?: Partial<core\.ParseParams>\r?\n\s*\): Promise<core\.input<this>>;/, 'data: core.output<this>,\n    params?: Partial<core.ParseParams>\n  ): Promise<typeof core.OMIT | core.input<this>>;');
classicSchemas = classicSchemas.replace(/data: core\.output<this>,\r?\n\s*params\?: Partial<core\.ParseParams>\r?\n\s*\): Promise<ZodSafeParseResult<core\.input<this>>>;/, 'data: core.output<this>,\n    params?: Partial<core.ParseParams>\n  ): Promise<ZodSafeParseResult<typeof core.OMIT | core.input<this>>>;');

write('packages/zod/src/v4/classic/schemas.ts', classicSchemas);

// classic/external.ts
let ext = read('packages/zod/src/v4/classic/external.ts');
ext = ext.replace(/NEVER,\r?\n\} from "\.\.\/core\/index\.js";/, 'NEVER,\n  OMIT,\n} from "../core/index.js";');
write('packages/zod/src/v4/classic/external.ts', ext);

console.log("Regex patch applied successfully!");
