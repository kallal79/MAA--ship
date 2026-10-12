const z = require('./zod/lib/index.js');

const a = { x: 1 };
const b = { x: 2 };

const setLeft = new Set([
  { wrapper: a, id: 1 }, 
  { wrapper: a, id: 2 }
]);

const setRight = new Set([
  { wrapper: b, id: 2 }, 
  { wrapper: a, id: 1 }, 
]);

const schema = z.object({
  val: z.any().default(setRight, { skipEncoding: true })
});

const result = schema.encode({ val: setLeft });
console.log("Result keys:", Object.keys(result));
