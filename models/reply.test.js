"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Reply = require("./reply");
const { getCurrentDate } = require("../helpers/getCurrentDate");
const { getCurrentTime } = require("../helpers/getCurrentTime");

const {
  commonAfterAll,
  commonAfterEach,
  commonBeforeEach,
  commonBeforeAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******create *****/

describe("create", () => {
  const newReply = {
    creatorId: 1,
    text: "A test reply for admin.",
    commentId: 5,
  };
  const newReply2 = {
    creatorId: 2,
    text: "A test reply for user.",
    commentId: 6,
  };
  test("should create new reply for user", async () => {
    const res = await Reply.create(newReply2);
    expect(res).toEqual({
      ...newReply2,
      id: 9,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should create new reply for admin", async () => {
    const res = await Reply.create(newReply);
    expect(res).toEqual({
      ...newReply,
      id: 10,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should fail if user does not exist", async () => {
    try {
      await Reply.create({
        creatorId: 4,
        text: "A new reply for admin",
        commentId: 4,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should fail if comment does not exist", async () => {
    try {
      await Reply.create({
        creatorId: 1,
        text: "A new reply for admin",
        commentId: 11,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****findAllReplies ******/
describe("findAll", () => {
  test("should return all replies", async () => {
    const res = await Reply.findAll();
    expect(res.length).toBe(8);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        creatorId: 1,
        text: "This is the second test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 3,
        creatorId: 2,
        text: "This is the third test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 4,
        creatorId: 2,
        text: "This is the fourth test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 5,
        creatorId: 1,
        text: "This is the fifth test reply.",
        commentId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 6,
        creatorId: 1,
        text: "This is the sixth test reply.",
        commentId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 7,
        creatorId: 2,
        text: "This is the seventh test reply.",
        commentId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 8,
        creatorId: 2,
        text: "This is the eighth test reply.",
        commentId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
});

/*****findRepliesByComment ******/
describe("findRepliesByComment", () => {
  test("should find all replies on user comment", async () => {
    const res = await Reply.findRepliesByComment(2);
    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        id: 3,
        creatorId: 2,
        text: "This is the third test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 4,
        creatorId: 2,
        text: "This is the fourth test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should find all replies on admin user comment", async () => {
    const res = await Reply.findRepliesByComment(1);
    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        creatorId: 1,
        text: "This is the second test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    ]);
  });
  test("should throw error if comment does not exist", async () => {
    try {
      await Reply.findRepliesByComment(7);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/***findRepliesByUser ******/
describe("findRepliesByUser", () => {
  test("should find all replies by user", async () => {
    const res = await Reply.findRepliesByUser(2);
    expect(res.length).toBe(4);
    expect(res).toEqual([
      {
        id: 3,
        creatorId: 2,
        text: "This is the third test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 4,
        creatorId: 2,
        text: "This is the fourth test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 7,
        creatorId: 2,
        text: "This is the seventh test reply.",
        commentId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 8,
        creatorId: 2,
        text: "This is the eighth test reply.",
        commentId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should find all replies by admin user", async () => {
    const res = await Reply.findRepliesByUser(1);
    expect(res.length).toBe(4);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        creatorId: 1,
        text: "This is the second test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 5,
        creatorId: 1,
        text: "This is the fifth test reply.",
        commentId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 6,
        creatorId: 1,
        text: "This is the sixth test reply.",
        commentId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    ]);
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Reply.findRepliesByUser(7);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****findOne *****/
describe("findOne", () => {
  test("should find a user reply", async () => {
    const res = await Reply.findOne(3);
    expect(res).toEqual({
      id: 3,
      creatorId: 2,
      text: "This is the third test reply.",
      commentId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should find an admin user reply", async () => {
    const res = await Reply.findOne(6);
    expect(res).toEqual({
      id: 6,
      creatorId: 1,
      text: "This is the sixth test reply.",
      commentId: 3,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should throw error if reply does not exist", async () => {
    try {
      await Reply.findOne(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****update *****/
describe("update", () => {
  test("should update one user reply field", async () => {
    const res = await Reply.update(3, { text: "This is the changed text." });
    expect(res).toEqual({
      id: 3,
      creatorId: 2,
      text: "This is the changed text.",
      commentId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should update multiple user reply field", async () => {
    const res = await Reply.update(3, {
      text: "This is the changed text.",
      commentId: 3,
    });
    expect(res).toEqual({
      id: 3,
      creatorId: 2,
      text: "This is the changed text.",
      commentId: 3,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should update one admin user reply field", async () => {
    const res = await Reply.update(2, { text: "This is the changed text." });
    expect(res).toEqual({
      id: 2,
      creatorId: 1,
      text: "This is the changed text.",
      commentId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should update multiple user reply field", async () => {
    const res = await Reply.update(2, {
      text: "This is the changed text.",
      commentId: 2,
    });
    expect(res).toEqual({
      id: 2,
      creatorId: 1,
      text: "This is the changed text.",
      commentId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should throw error if reply does not exist", async () => {
    try {
      await Reply.update(10, { text: "This is a test." });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data submitted", async () => {
    try {
      await Reply.update(10);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/***remove *****/
describe("remove", () => {
  test("should remove a user reply", async () => {
    await Reply.remove(3);
    const res = await db.query("SELECT * FROM replies WHERE id = 3");
    expect(res.rows.length).toBe(0);
  });
  test("should remove an admin user reply", async () => {
    await Reply.remove(1);
    const res = await db.query("SELECT * FROM replies WHERE id = 1");
    expect(res.rows.length).toBe(0);
  });
  test("should throw error if reply does not exist", async () => {
    try {
      await Reply.remove(11);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
