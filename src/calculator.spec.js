const calculator = require('./calculator');

describe("calculator", function () {
  it("should multiply 2 and 3", function () {
    var result = calculator.multiply(2, 3);
    expect(result).toBe(6);
  });

  it("should add 3 and 4", function () {
    var result = calculator.add(3, 4);
    expect(result).toBe(7);
  });

  it("should subtract 5 and 2", function () {
    var result = calculator.subtract(5, 2);
    expect(result).toBe(3);
  });

  it("should divide 6 and 2", function () {
    var result = calculator.divide(6, 2);
    expect(result).toBe(3);
  });
});  