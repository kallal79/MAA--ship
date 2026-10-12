import { expect, test } from "vitest";
import { z } from "../../../index.js";

test("pipe with default skipEncoding", () => {
  const schema = z.object({
    piped: z.string().default("piped", { skipEncoding: true }).pipe(z.string())
  });
  expect(schema.encode({ piped: "piped" })).toEqual({});
});
