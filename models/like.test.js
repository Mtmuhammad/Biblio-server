"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Like = require("./like");
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
  const newLike = {
    creatorId: 1,
    postId: 6,
  };
  const newLike2 = {
    creatorId: 2,
    postId: 6,
  };

  test("should create a new like for user", async () => {
    const res = await Like.create(newLike2);
    expect(res).toEqual({
      ...newLike2,
      id: 8,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should create a new like for admin user", async () => {
    const res = await Like.create(newLike);
    expect(res).toEqual({
      ...newLike,
      id: 9,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Like.create({
        creatorId: 3,
        postId: 4,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if post does not exist", async () => {
    try {
      await Like.create({
        creatorId: 2,
        postId: 8,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if user already liked post", async () => {
    try {
      await Like.create({
        creatorId: 1,
        postId: 1,
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/***findAllLikes *****/
describe("findAll", () => {
  test("should return all likes", async () => {
    const res = await Like.findAll();
    expect(res.length).toBe(7);
    expect(res).toEqual([
      {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        postId: 1,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 3,
        postId: 2,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 4,
        postId: 2,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 5,
        postId: 3,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 6,
        postId: 4,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 7,
        postId: 5,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
});

/****findLikesByPost *****/
describe("findLikesByPost", () => {
  test("should find all likes on a post", async () => {
    const res = await Like.findLikesByPost(1);
    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 2,
        postId: 1,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
    const res2 = await Like.findLikesByPost(2);
    expect(res2.length).toBe(2);
    expect(res2).toEqual([
      {
        id: 3,
        postId: 2,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 4,
        postId: 2,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should throw error if post does not exist", async () => {
    try {
      await Like.findLikesByPost(11);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****findLikesByUser ******/
describe("findLikesByUser", () => {
  test("should find all likes by a user", async () => {
    const res = await Like.findLikesByUser(2);
    expect(res.length).toBe(4);
    expect(res).toEqual([
      {
        id: 2,
        postId: 1,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 4,
        postId: 2,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 6,
        postId: 4,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
      {
        id: 7,
        postId: 5,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    ]);
  });
  test("should find all likes by an admin user", async () => {
    const res = await Like.findLikesByUser(1);
    expect(res.length).toBe(3);
    expect(res).toEqual([
      {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 3,
        postId: 2,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
      {
        id: 5,
        postId: 3,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    ]);
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Like.findLikesByUser(7);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****findOne *****/
describe("findOne", () => {
  test("should find a user like", async () => {
    const res = await Like.findOne(7);
    expect(res).toEqual({
      id: 7,
      postId: 5,
      creatorId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should find an admin user like", async () => {
    const res = await Like.findOne(5);
    expect(res).toEqual({
      id: 5,
      postId: 3,
      creatorId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should throw error if like does not exist", async () => {
    try {
      await Like.findOne(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****update ****/
describe("update", () => {
  test("should update one user like field", async () => {
    const res = await Like.update(7, { postId: 6 });
    expect(res).toEqual({
      id: 7,
      postId: 6,
      creatorId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should update multiple user like fields", async () => {
    const res = await Like.update(7, { postId: 6, creatorId: 1 });
    expect(res).toEqual({
      id: 7,
      postId: 6,
      creatorId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should update one admin user like field", async () => {
    const res = await Like.update(5, { postId: 6 });
    expect(res).toEqual({
      id: 5,
      postId: 6,
      creatorId: 1,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test1 User1",
    });
  });
  test("should update multiple user like fields", async () => {
    const res = await Like.update(5, { postId: 6, creatorId: 2 });
    expect(res).toEqual({
      id: 5,
      postId: 6,
      creatorId: 2,
      date: getCurrentDate(),
      time: getCurrentTime(),
      fullName: "Test2 User2",
    });
  });
  test("should throw error if like does not exist", async () => {
    try {
      await Like.update(10, { postId: 5 });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data submitted", async () => {
    try {
      await Like.update(10);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****remove ****/
describe("remove", () => {
  test("should remove a user like", async () => {
    await Like.remove(7);
    const res = await db.query("SELECT * FROM likes WHERE id = 7");
    expect(res.rows.length).toBe(0);
  });
  test("should remove an admin user like", async () => {
    await Like.remove(5);
    const res = await db.query("SELECT * FROM likes WHERE id = 5");
    expect(res.rows.length).toBe(0);
  });
  test("should throw error if like does not exist", async () => {
    try {
      await Like.remove(11);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
