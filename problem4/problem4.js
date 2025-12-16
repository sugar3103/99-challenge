// Problem 4 is identical with problem 1
// Please help me to check whether the question correct
// So i put the same answer for problem 1 here

// Provide 3 unique implementations of the following function in JavaScript.
// **Input**: `n` - any integer
// *Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.
// **Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

var sum_to_n_a = function (n) {
  if (n < 1) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  if (n < 0) return 0;
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  if (n < 0) return 0;
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
};

console.log("sum with for loop: ", sum_to_n_a(5));
console.log("sum with arithmetic series sum: ", sum_to_n_b(5));
console.log("sum with recursive: ", sum_to_n_c(5));
