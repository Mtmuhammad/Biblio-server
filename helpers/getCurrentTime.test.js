"use strict";

const { getCurrentTime } = require("./getCurrentTime");
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
const Comment = require("../models/comment");

describe("getCurrentTime", () => {
  test("should return new comment time", async () => {
    const result = await Comment.create({
      creatorId: 1,
      text: "This is a test.",
      postId: 1,
    });
    expect(result.time).toEqual(getCurrentTime());
  });
});
