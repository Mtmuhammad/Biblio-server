"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Comment = require("./comment");
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
  const newComment = {
    creatorId: 1,
    text: "A new comment for admin.",
    postId: 1,
  };
  const newComment2 = {
    creatorId: 2,
    text: "A new comment for user.",
    postId: 2,
  };
  test("should create a comment for user", async () => {
    const res = await Comment.create(newComment2);
    expect(res).toEqual({
      ...newComment2,
      id: 7,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should create a comment for admin user", async () => {
    const res = await Comment.create(newComment);
    expect(res).toEqual({
      ...newComment,
      id: 8,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should fail if user does not exist", async () => {
    try {
      await Comment.create({
        creatorId: 4,
        text: "A new comment for admin.",
        postId: 1,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should fail if post does not exist", async () => {
    try {
      await Comment.create({
        creatorId: 1,
        text: "A new comment for admin.",
        postId: 8,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****findAllComments *****/
describe("findAll", () => {
  test("should return all comments", async () => {
    const res = await Comment.findAll();
    expect(res.length).toBe(6);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        creatorId: 2,
        text: "This is the second test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 3,
        creatorId: 1,
        text: "This is the third test comment.",
        postId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 4,
        creatorId: 2,
        text: "This is the fourth test comment.",
        postId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 5,
        creatorId: 1,
        text: "This is the fifth test comment.",
        postId: 5,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 6,
        creatorId: 2,
        text: "This is the sixth test comment.",
        postId: 6,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
});

/****findAllUser *****/
describe("findAllUser", () => {
  test("should return all user comments", async () => {
    const res = await Comment.findAllUser(2);
    expect(res).toEqual([
      {
        id: 2,
        creatorId: 2,
        text: "This is the second test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 4,
        creatorId: 2,
        text: "This is the fourth test comment.",
        postId: 4,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 6,
        creatorId: 2,
        text: "This is the sixth test comment.",
        postId: 6,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should find all admin user comments", async () => {
    const res = await Comment.findAllUser(1);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 3,
        creatorId: 1,
        text: "This is the third test comment.",
        postId: 3,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 5,
        creatorId: 1,
        text: "This is the fifth test comment.",
        postId: 5,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    ]);
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Comment.findAllUser(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****findCommentsByPost ****/
describe("findCommentsByPost", () => {
  test("should find all comments by post id", async () => {
    const res = await Comment.findCommentsByPost(1);
    expect(res).toEqual([
      {
        id: 1,
        creatorId: 1,
        text: "This is the first test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        creatorId: 2,
        text: "This is the second test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should throw error if post does not exist", async () => {
    try {
      await Comment.findCommentsByPost(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****findOne ******/
describe("findOne", () => {
  test("should find a user comment", async () => {
    const res = await Comment.findOne(2);
    expect(res).toEqual({
      id: 2,
      creatorId: 2,
      text: "This is the second test comment.",
      postId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should find an admin user comment", async () => {
    const res = await Comment.findOne(1);
    expect(res).toEqual({
      id: 1,
      creatorId: 1,
      text: "This is the first test comment.",
      postId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
});

/*****update *******/
describe("update", () => {
  test("should update a user comment field", async () => {
    const res = await Comment.update(2, { text: "This is the changed text." });
    expect(res).toEqual({
      id: 2,
      creatorId: 2,
      text: "This is the changed text.",
      postId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should update multiple user comment fields", async () => {
    const res = await Comment.update(2, {
      text: "This is the changed text.",
      postId: 3,
    });
    expect(res).toEqual({
      id: 2,
      creatorId: 2,
      text: "This is the changed text.",
      postId: 3,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should update an admin user comment field", async () => {
    const res = await Comment.update(1, { text: "This is the changed text." });
    expect(res).toEqual({
      id: 1,
      creatorId: 1,
      text: "This is the changed text.",
      postId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should update multiple user comment fields", async () => {
    const res = await Comment.update(1, {
      text: "This is the changed text.",
      postId: 3,
    });
    expect(res).toEqual({
      id: 1,
      creatorId: 1,
      text: "This is the changed text.",
      postId: 3,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should throw error if comment not found", async () => {
    try {
      await Comment.update(15, { text: "This is the eighth collection" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data included", async () => {
    try {
      await Comment.update(10);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a user comment", async () => {
    await Comment.remove(2);
    const res = await db.query("SELECT * FROM comments WHERE id = 2");
    expect(res.rows.length).toEqual(0);
  });
  test("should remove an admin user comment", async () => {
    await Comment.remove(1);
    const res = await db.query("SELECT * FROM comments WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if comment not found", async () => {
    try {
      await Comment.remove(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

