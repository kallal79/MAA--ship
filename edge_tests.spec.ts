import { expect, test } from "vitest";
import { z } from "../../../index.js";

test("ZodDefault throws if skipEncoding used with factory default", () => {
  expect(() => z.string().default(() => "factory", { skipEncoding: true })).toThrow();
});

test("implicit default option behaves as deep", () => {
  const schema = z.object({ a: z.number().default(0) });
  expect(schema.encode({ a: 0 })).toEqual({});
});
