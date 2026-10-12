const a = new Set([{a: 1}]);
const b = new Set([{a: 1}]);
console.log([...a].every((value) => [...b].some((other) => Object.is(value, other))));
