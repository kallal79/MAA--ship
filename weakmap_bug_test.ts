import { test, expect } from "vitest";
import { z } from "../../../../index";

test("nova weakmap persistent state trap", () => {
  const a = { x: 1 };
  const b = { x: 2 };
  
  const setLeft = new Set([{ wrapper: a, id: 1 }, { wrapper: a, id: 2 }]);
  const setRight = new Set([{ wrapper: b, id: 2 }, { wrapper: a, id: 1 }]);
  
  const schema = z.object({ val: z.any().default(setRight, { skipEncoding: true }) });
  
  // Baseline correctly evaluates to false and keeps the value.
  // Nova_Nova incorrectly evaluates to true and omits the value.
  expect(z.encode(schema, { val: setLeft })).toEqual({ val: setLeft });
});
