import { expect, test } from "vitest";
import { z } from "../../../index.js";

test("true sparse array deep equality", () => {
  const sparse: string[] = [];
  sparse.length = 1;
  const sparseInput = Array<string>(1);
  const sparseSchema = z.object({ value: z.any().default(sparse) });
  expect(z.encode(sparseSchema, { value: sparseInput })).toEqual({});
});
