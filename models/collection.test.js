"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const Collection = require("./collection");
const { getCurrentDate } = require("../helpers/getCurrentDate");

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
  const newCollection1 = {
    userId: 1,
    title: "Test1 Collection",
    isPrivate: true,
  };
  const newCollection2 = {
    userId: 2,
    title: "Test2 Collection",
    isPrivate: false,
  };
  test("should create a user collection", async () => {
    const res = await Collection.create(newCollection2);
    expect(res).toEqual({
      id: 4,
      title: "Test2 Collection",
      owner: 2,
      date: getCurrentDate(),
      isPrivate: false,
    });
  });
  test("should create an admin user collection", async () => {
    const res = await Collection.create(newCollection1);
    expect(res).toEqual({
      id: 5,
      title: "Test1 Collection",
      owner: 1,
      date: getCurrentDate(),
      isPrivate: true,
    });
  });
  test("should fail if user does not exist", async () => {
    try {
      await Collection.create({
        userId: 4,
        title: "Test2 Collection",
        isPrivate: false,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should fail if collection already exists", async () => {
    try {
      await Collection.create({
        userId: 1,
        title: "First Collection",
        isPrivate: true,
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/*** findAllPublic *****/

describe("findAllPublic", () => {
  test("should return all public collections", async () => {
    const res = await Collection.findAllPublic();
    expect(res.length).toBe(2);
    expect(res).toEqual([
      {
        id: 2,
        owner: 2,
        title: "Second Collection",
        date: getCurrentDate(),
      },
      {
        id: 3,
        owner: 1,
        title: "Third Collection",
        date: getCurrentDate(),
      },
    ]);
  });
});

/****findAllUser */
describe("findAllUser", () => {
  test("should find all user related collections", async () => {
    const res = await Collection.findAllUser(2);
    expect(res.length).toEqual(1);
    expect(res).toEqual([
      {
        id: 2,
        title: "Second Collection",
        owner: 2,
        date: getCurrentDate(),
        isPrivate: false,
      },
    ]);
  });
  test("should find all admin user related collections", async () => {
    const res = await Collection.findAllUser(1);
    expect(res.length).toEqual(2);
    expect(res).toEqual([
      {
        id: 1,
        title: "First Collection",
        owner: 1,
        date: getCurrentDate(),
        isPrivate: true,
      },
      {
        id: 3,
        title: "Third Collection",
        owner: 1,
        date: getCurrentDate(),
        isPrivate: false,
      },
    ]);
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Collection.findAllUser(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/***** findOne ******/
describe("findOne", () => {
  test("should find a user collection", async () => {
    const res = await Collection.findOne(2);
    expect(res).toEqual({
      id: 2,
      title: "Second Collection",
      owner: 2,
      date: getCurrentDate(),
      isPrivate: false,
    });
  });
  test("should find an admin user collection", async () => {
    const res = await Collection.findOne(1);
    expect(res).toEqual({
      id: 1,
      title: "First Collection",
      owner: 1,
      date: getCurrentDate(),
      isPrivate: true,
    });
  });
  test("should throw error if collection not found", async () => {
    try {
      await Collection.findOne(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****update *****/
describe("update", () => {
  test("should update a user collection field", async () => {
    const res = await Collection.update(2, {
      title: "This is the second collection",
    });
    expect(res).toEqual({
      id: 2,
      title: "This is the second collection",
      owner: 2,
      date: getCurrentDate(),
      isPrivate: false,
    });
  });
  test("should update multiple user collection fields", async () => {
    const res = await Collection.update(2, {
      title: "This is the second collection",
      isPrivate: true,
    });
    expect(res).toEqual({
      id: 2,
      title: "This is the second collection",
      owner: 2,
      date: getCurrentDate(),
      isPrivate: true,
    });
  });
  test("should update an admin user collection field", async () => {
    const res = await Collection.update(1, {
      title: "This is the first collection",
    });
    expect(res).toEqual({
      id: 1,
      title: "This is the first collection",
      owner: 1,
      date: getCurrentDate(),
      isPrivate: true,
    });
  });
  test("should update multiple user collection fields", async () => {
    const res = await Collection.update(1, {
      title: "This is the first collection",
      isPrivate: false,
    });
    expect(res).toEqual({
      id: 1,
      title: "This is the first collection",
      owner: 1,
      date: getCurrentDate(),
      isPrivate: false,
    });
  });
  test("should throw error if collection not found", async () => {
    try {
      await Collection.update(8, { title: "This is the eighth collection" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a user collection", async () => {
    await Collection.remove(2);
    const res = await db.query("SELECT * FROM collections WHERE id = 2");
    expect(res.rows.length).toEqual(0);
  });
  test("should remove an admin user collection", async () => {
    await Collection.remove(1);
    const res = await db.query("SELECT * FROM collections WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if collection not found", async () => {
    try {
      await Collection.remove(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
