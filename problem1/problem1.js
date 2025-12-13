// Provide 3 unique implementations of the following function in JavaScript.
// **Input**: `n` - any integer
// *Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.
// **Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

var sum_to_n_a = function (n) {
  if (typeof n !== "number") return "n is not a number";
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  if (typeof n !== "number") return "n is not a number";
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  if (typeof n !== "number") return "n is not a number";
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
};

console.log("sum with for loop: ", sum_to_n_a(5));
console.log("sum with arithmetic series sum: ", sum_to_n_b(5));
console.log("sum with recursive: ", sum_to_n_c(5));
