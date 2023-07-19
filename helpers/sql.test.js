const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("should work with 1 item", () => {
    const res = sqlForPartialUpdate({ f1: "v1" }, { f1: "f1", fF2: "f2" });
    expect(res).toEqual({ setCols: '"f1"=$1', values: ["v1"] });
  });
  test("should work with multiple items", () => {
    const res = sqlForPartialUpdate({ f1: "v1", jsF2: "v2" }, { jsF2: "f2" });
    expect(res).toEqual({
      setCols: '"f1"=$1, "f2"=$2',
      values: ["v1", "v2"],
    });
  });
});
