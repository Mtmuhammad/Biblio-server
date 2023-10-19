"use strict";

const db = require("../db");
const { appendName } = require("./appendName");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");
const { getCurrentDate } = require("./getCurrentDate");
const { getCurrentTime } = require("./getCurrentTime");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("appendName", () => {
  test("should append full name key/value pairs to objects in array", async () => {
    const result = await db.query(
      `
      SELECT posts.id, posts.creator_id AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date",
      posts.title, post_text AS "postText", subjects.name AS "subject", forums.title AS "forum", is_private AS "isPrivate", posts.time
      FROM posts
      JOIN subjects
      ON subjects.id = posts.subject
      JOIN forums
      ON forums.id = posts.forum
      WHERE posts.is_private = $1`,
      [false]
    );
    const res = await appendName(result.rows);
    expect(res).toEqual([
      {
        creatorId: 1,
        date: getCurrentDate(),
        forum: "Announcements",
        id: 1,
        isPrivate: false,
        postText: "This is the first post description.",
        subject: "General",
        title: "This is the first post.",
        fullName: "Test1 User1",
        time: getCurrentTime(),
      },
      {
        creatorId: 1,
        date: getCurrentDate(),
        forum: "Announcements",
        id: 2,
        isPrivate: false,
        postText: "This is the second post description.",
        subject: "General",
        title: "This is the second post.",
        fullName: "Test1 User1",
        time: getCurrentTime(),
      },
      {
        creatorId: 2,
        date: getCurrentDate(),
        forum: "Technology",
        id: 3,
        isPrivate: false,
        postText: "This is the third post description.",
        subject: "Ideas",
        title: "This is the third post.",
        fullName: "Test2 User2",
        time: getCurrentTime(),
      },
    ]);
  });
});
