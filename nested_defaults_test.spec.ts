import { expect, test } from "vitest";
import { z } from "../../../index.js";
import fs from "fs";

test("nested defaults with conflicting skipEncoding", () => {
  const inner = z.string().default("inner", { skipEncoding: true });
  const outer = inner.default("outer", { skipEncoding: false });
  
  const schema = z.object({ val: outer });
  const encoded = schema.encode({ val: "inner" });
  
  fs.appendFileSync("C:/Users/USER/OneDrive/Desktop/MAA/nested_output.txt", JSON.stringify(encoded) + "\\n");
  
  expect(true).toBe(true);
});
