const O1 = { val: 1 };
const O2 = { val: 2 };
const O1_COPY = { val: 1 };
const O2_COPY = { val: 2 };
const a = [ new Set([ O1, O2_COPY ]), O1 ];
const b = [ new Set([ O2, O1_COPY ]), O2 ];

const aClone = [...a]; // shallowClone of array

const active = new WeakMap();
const compare = (left, right) => {
  if (Object.is(left, right)) return true;
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) return false;
  const seen = active.get(left);
  if (seen && seen.has(right)) return true;
  if (seen) seen.add(right); else active.set(left, new WeakSet([right]));
  
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (!compare(left[i], right[i])) return false;
    }
    return true;
  }
  
  if (left instanceof Set && right instanceof Set) {
    if (left.size !== right.size) return false;
    const unmatched = new Set(right);
    for (const leftItem of left) {
      let found = false;
      for (const rightItem of unmatched) {
        if (compare(leftItem, rightItem)) {
          unmatched.delete(rightItem);
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }
  
  const aKeys = Object.keys(left);
  const bKeys = Object.keys(right);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
    if (!compare(left[key], right[key])) return false;
  }
  return true;
};

console.log("compare(b, aClone):", compare(b, aClone));
