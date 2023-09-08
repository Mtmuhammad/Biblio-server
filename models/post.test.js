"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Post = require("./post");
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
  const newPost1 = {
    creator: 1,
    title: "First Test Post",
    postText: "This is the first test post text.",
    subject: 1,
    forum: 1,
  };
  const newPost2 = {
    creator: 2,
    title: "Second Test Post",
    postText: "This is the second test post text.",
    subject: 2,
    forum: 2,
  };
  test("should create a post for user", async () => {
    const res = await Post.create(newPost2);
    expect(res).toEqual({
      ...newPost2,
      isPrivate: false,
      date: getCurrentDate(),
      id: 7,
    });
  });
  test("should create a post for admin user", async () => {
    const res = await Post.create(newPost1);
    expect(res).toEqual({
      ...newPost1,
      isPrivate: false,
      date: getCurrentDate(),
      id: 8,
    });
  });
  test("should fail if user does not exist", async () => {
    try {
      await Post.create({
        creator: 8,
        title: "First Test Post",
        postText: "This is the first test post text.",
        subject: 1,
        forum: 1,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should fail if post already exists", async () => {
    try {
      await Post.create(newPost1);
      await Post.create(newPost1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****findAllPublic *****/
describe("findAllPublic", () => {
  test("should find all public posts", async () => {
    const res = await Post.findAllPublic();
    expect(res.length).toBe(3);
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
      },
    ]);
  });
});

/****findAllUser *****/

describe("findAllUser", () => {
  test("should find all user related posts", async () => {
    const res = await Post.findAllUser(2);
    expect(res).toEqual([
      {
        fullName: "Test2 User2",
        creatorId: 2,
        date: getCurrentDate(),
        forum: "Technology",
        id: 3,
        isPrivate: false,
        postText: "This is the third post description.",
        subject: "Ideas",
        title: "This is the third post.",
      },
      {
        fullName: "Test2 User2",
        creatorId: 2,
        date: getCurrentDate(),
        forum: "Technology",
        id: 4,
        isPrivate: true,
        postText: "This is the fourth post description.",
        subject: "Ideas",
        title: "This is the fourth post.",
      },
      {
        fullName: "Test2 User2",
        creatorId: 2,
        date: getCurrentDate(),
        forum: "Marketplaces",
        id: 5,
        isPrivate: true,
        postText: "This is the fifth post description.",
        subject: "Help",
        title: "This is the fifth post.",
      },
    ]);
  });
  test("should find all admin user related posts", async () => {
    const res = await Post.findAllUser(1);
    expect(res).toEqual([
      {
        fullName: "Test1 User1",
        creatorId: 1,
        date: getCurrentDate(),
        forum: "Announcements",
        id: 1,
        isPrivate: false,
        postText: "This is the first post description.",
        subject: "General",
        title: "This is the first post.",
      },
      {
        fullName: "Test1 User1",
        creatorId: 1,
        date: getCurrentDate(),
        forum: "Announcements",
        id: 2,
        isPrivate: false,
        postText: "This is the second post description.",
        subject: "General",
        title: "This is the second post.",
      },
      {
        fullName: "Test1 User1",
        creatorId: 1,
        date: getCurrentDate(),
        forum: "Marketplaces",
        id: 6,
        isPrivate: true,
        postText: "This is the sixth post description.",
        subject: "Help",
        title: "This is the sixth post.",
      },
    ]);
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Post.findAllUser(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****findOne ******/
describe("findOne", () => {
  test("should find a user post", async () => {
    const res = await Post.findOne(5);
    expect(res).toEqual({
      creatorId: 2,
      date: getCurrentDate(),
      forum: "Marketplaces",
      id: 5,
      isPrivate: true,
      postText: "This is the fifth post description.",
      subject: "Help",
      title: "This is the fifth post.",
      fullName: "Test2 User2"
    });
  });
  test("should find an admin user post", async () => {
    const res = await Post.findOne(6);
    expect(res).toEqual({
      creatorId: 1,
      date: getCurrentDate(),
      forum: "Marketplaces",
      id: 6,
      isPrivate: true,
      postText: "This is the sixth post description.",
      subject: "Help",
      title: "This is the sixth post.",
      fullName: "Test1 User1"
    });
  });
  test("should throw error if post not found", async () => {
    try {
      await Post.findOne(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****update *****/
describe("update", () => {
  test("should update a user post field", async () => {
    const res = await Post.update(5, { title: "This is a test." });
    expect(res).toEqual({
      creator: 2,
      date: getCurrentDate(),
      forum: 3,
      id: 5,
      isPrivate: true,
      postText: "This is the fifth post description.",
      subject: 3,
      title: "This is a test.",
    });
  });
  test("should update multiple user post fields", async () => {
    const res = await Post.update(5, {
      title: "This is a test.",
      isPrivate: false,
      postText: "This is a test post field.",
    });
    expect(res).toEqual({
      creator: 2,
      date: getCurrentDate(),
      forum: 3,
      id: 5,
      isPrivate: false,
      postText: "This is a test post field.",
      subject: 3,
      title: "This is a test.",
    });
  });
  test("should update an admin user post field", async () => {
    const res = await Post.update(6, { title: "This is a test." });
    expect(res).toEqual({
      creator: 1,
      date: getCurrentDate(),
      forum: 3,
      id: 6,
      isPrivate: true,
      postText: "This is the sixth post description.",
      subject: 3,
      title: "This is a test.",
    });
  });
  test("should update multiple admin user post fields", async () => {
    const res = await Post.update(6, {
      title: "This is a test.",
      isPrivate: false,
    });
    expect(res).toEqual({
      creator: 1,
      date: getCurrentDate(),
      forum: 3,
      id: 6,
      isPrivate: false,
      postText: "This is the sixth post description.",
      subject: 3,
      title: "This is a test.",
    });
  });
  test("should throw error if post not found", async () => {
    try {
      await Post.update(8, { title: "This is the eighth collection" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data included", async () => {
    try {
      await Post.update(8);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a user post", async () => {
    await Post.remove(5);
    const res = await db.query("SELECT * FROM posts WHERE id = 5");
    expect(res.rows.length).toEqual(0);
  });
  test("should remove an admin user post", async () => {
    await Post.remove(6);
    const res = await db.query("SELECT * FROM posts WHERE id = 6");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if post not found", async () => {
    try {
      await Post.remove(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
