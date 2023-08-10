"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Forum = require("./forum");

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

/*****create ******/
describe("create", () => {
  const newForum = {
    title: "TestForum1",
    description: "This is the first test forum.",
    creator: 1,
  };
  const newForum2 = {
    title: "TestForum2",
    description: "This is the second test forum.",
    creator: 3,
  };
  test("should create a new forum for admin user", async () => {
    const res = await Forum.create(newForum);
    expect(res).toEqual({ ...newForum, id: 4 });
  });
  test("should fail if user does not exist", async () => {
    try {
      await Forum.create(newForum2);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should fail if forum already exists", async () => {
    try {
      await Forum.create(newForum);
      await Forum.create(newForum);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****findAll*****/
describe("findAll", () => {
  test("should find all forums", async () => {
    const res = await Forum.findAll();
    expect(res.length).toBe(3);
    expect(res).toEqual([
      {
        id: 1,
        title: "Announcements",
        description: "This forum is a special forum for general announcements.",
        creator: 1,
      },
      {
        id: 2,
        title: "Technology",
        description: "Latest technology news and updates from our community.",
        creator: 1,
      },
      {
        id: 3,
        title: "Marketplaces",
        description: "This forum is a special forum for marketplace support.",
        creator: 1,
      },
    ]);
  });
});

/****findOne ******/
describe("findOne", () => {
  test("should find an admin forum", async () => {
    const res = await Forum.findOne(1);
    expect(res).toEqual({
      id: 1,
      title: "Announcements",
      description: "This forum is a special forum for general announcements.",
      creator: 1,
    });
  });
  test("should throw error if forum not found", async () => {
    try {
      await Forum.findOne(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****update *******/
describe("update", () => {
  test("should update one forum field", async () => {
    const res = await Forum.update(1, { title: "Test" });
    expect(res).toEqual({
      id: 1,
      title: "Test",
      description: "This forum is a special forum for general announcements.",
      creator: 1,
    });
  });
  test("should update multiple forum fields", async () => {
    const res = await Forum.update(1, {
      title: "Test",
      description: "This is a test.",
    });
    expect(res).toEqual({
      id: 1,
      title: "Test",
      description: "This is a test.",
      creator: 1,
    });
  });
  test("should throw error if no data included", async () => {
    try {
      await Forum.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  test("should throw error if no forum is found", async () => {
    try {
      await Forum.update(4, { title: "Test", description: "This is a test." });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a forum", async () => {
    await Forum.remove(1);
    const res = await db.query("SELECT * FROM forums WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if no forum is found", async () => {
    try {
      await Forum.remove(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
