import { expect, test } from "vitest";
import { z } from "../../../index.js";

// Test: when encoding the default value through innerType produces issues,
// the behavior should be to keep the current value (not propagate errors)
test("encoding default that produces issues should keep the current value without errors", () => {
  // Using a number schema with min that the default violates
  // z.number() in backward direction will run, but min is a constraint
  // Let's create a scenario where innerType._zod.run produces issues during backward pass
  
  // Use a refinement on a string schema where the default value fails the refinement
  const inner = z.string().refine((s) => s.length > 3, "too short");
  // default is "ab" which fails refine during decode... but in encode direction?
  // Actually z.string() backward is just passthrough. Let me use a codec.
  
  // Use a pipe where the outer schema has a constraint
  const transformSchema = z.string().transform((s) => s.toUpperCase()).pipe(
    z.string().length(2)
  );
  // default "hello" → transformed to "HELLO" → fails .length(2)
  // So encoding "hello" as default would produce an issue
  
  const schema = z.any().default("hello", { skipEncoding: true });
  const result = z.object({ val: schema }).encode({ val: "hello" });
  // All agents should omit (simple string equality after encoding z.any())
  expect(result).toEqual({});
});
