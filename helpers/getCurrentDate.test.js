"use strict";

const db = require("../db");
const { getCurrentDate } = require("./getCurrentDate");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("getCurrentDate", () => {
  test("should return new collection date", async () => {
    const result = await db.query(
      `
      INSERT INTO collections (title, owner)
      VALUES ($1,$2)
      RETURNING id, title, owner, to_char(date_created, 'MM-DD-YYYY') AS "date"`,
      ["Time test collection", 1]
    );
    const collection = result.rows[0];
    expect(collection.date).toEqual(getCurrentDate());
  });
});
