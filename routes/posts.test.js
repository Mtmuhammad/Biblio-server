"use strict";

const request = require("supertest");

const app = require("../app");
const { getCurrentDate } = require("../helpers/getCurrentDate");
const { getCurrentTime } = require("../helpers/getCurrentTime");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******* POST /posts ******/

describe("POST /posts", () => {
  const newPost = {
    creatorId: 1,
    title: "First Test Post",
    postText: "This is the first test post text.",
    subject: 1,
    forum: 1,
  };
  const newPost2 = {
    creatorId: 2,
    title: "Second Test Post",
    postText: "This is the second test post text.",
    subject: 2,
    forum: 2,
  };
  test("should allow user to make a post", async () => {
    const res = await request(app)
      .post("/posts")
      .send(newPost2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      post: {
        id: 7,
        creatorId: 2,
        date: getCurrentDate(),
        title: "Second Test Post",
        postText: "This is the second test post text.",
        subject: 2,
        forum: 2,
        isPrivate: false,
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to make a post", async () => {
    const res = await request(app)
      .post("/posts")
      .send(newPost)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      post: {
        id: 8,
        creatorId: 1,
        date: getCurrentDate(),
        title: "First Test Post",
        postText: "This is the first test post text.",
        subject: 1,
        forum: 1,
        isPrivate: false,
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/posts")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/posts")
      .send({
        creatorId: 1,
        title: "First Test Post",
        postText: "This is the first test post text.",
        subject: 1,
        forum: "yes",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/posts").send(newPost);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/posts")
      .send(newPost)
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/****GET /posts/public ******/
describe("GET /posts/public", () => {
  test("should return public post for user", async () => {
    const res = await request(app)
      .get("/posts/public")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      posts: [
        {
          id: 1,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the first post.",
          postText: "This is the first post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 2,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the second post.",
          postText: "This is the second post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 3,
          creatorId: 2,
          date: getCurrentDate(),
          title: "This is the third post.",
          postText: "This is the third post description.",
          subject: "Ideas",
          forum: "Technology",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test2 User2",
        },
      ],
    });
  });
  test("should return public post for admin user", async () => {
    const res = await request(app)
      .get("/posts/public")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      posts: [
        {
          id: 1,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the first post.",
          postText: "This is the first post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 2,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the second post.",
          postText: "This is the second post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 3,
          creatorId: 2,
          date: getCurrentDate(),
          title: "This is the third post.",
          postText: "This is the third post description.",
          subject: "Ideas",
          forum: "Technology",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test2 User2",
        },
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/posts/public");
    expect(res.statusCode).toEqual(401);
  });
});

/******GET /posts/user/:id ******/
describe("GET /posts/user/:id", () => {
  test("should work for user to get all user posts", async () => {
    const res = await request(app)
      .get("/posts/user/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      posts: [
        {
          id: 3,
          creatorId: 2,
          date: getCurrentDate(),
          title: "This is the third post.",
          postText: "This is the third post description.",
          subject: "Ideas",
          forum: "Technology",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test2 User2",
        },
        {
          id: 4,
          creatorId: 2,
          date: getCurrentDate(),
          title: "This is the fourth post.",
          postText: "This is the fourth post description.",
          subject: "Ideas",
          forum: "Technology",
          isPrivate: true,
          time: getCurrentTime(),
          fullName: "Test2 User2",
        },
        {
          id: 5,
          creatorId: 2,
          date: getCurrentDate(),
          title: "This is the fifth post.",
          postText: "This is the fifth post description.",
          subject: "Help",
          forum: "Marketplaces",
          isPrivate: true,
          time: getCurrentTime(),
          fullName: "Test2 User2",
        },
      ],
    });
  });
  test("should work for admin user to get all admin user posts", async () => {
    const res = await request(app)
      .get("/posts/user/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      posts: [
        {
          id: 1,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the first post.",
          postText: "This is the first post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 2,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the second post.",
          postText: "This is the second post description.",
          subject: "General",
          forum: "Announcements",
          isPrivate: false,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
        {
          id: 6,
          creatorId: 1,
          date: getCurrentDate(),
          title: "This is the sixth post.",
          postText: "This is the sixth post description.",
          subject: "Help",
          forum: "Marketplaces",
          isPrivate: true,
          time: getCurrentTime(),
          fullName: "Test1 User1",
        },
      ],
    });
  });
  test("should throw UnauthorizedError if wrong user", async () => {
    const res = await request(app)
      .get("/posts/user/2")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if not admin user", async () => {
    const res = await request(app)
      .get("/posts/user/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/posts/user/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******GET /posts/:id ******/
describe("GET /posts/:id", () => {
  test("should work for user to get a post", async () => {
    const res = await request(app)
      .get("/posts/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 3,
        creatorId: 2,
        date: getCurrentDate(),
        title: "This is the third post.",
        postText: "This is the third post description.",
        subject: "Ideas",
        forum: "Technology",
        isPrivate: false,
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to get a post", async () => {
    const res = await request(app)
      .get("/posts/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 1,
        creatorId: 1,
        date: getCurrentDate(),
        title: "This is the first post.",
        postText: "This is the first post description.",
        subject: "General",
        forum: "Announcements",
        isPrivate: false,
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/posts/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******PATCH /posts/:id ******/
describe("PATCH /posts/:id", () => {
  test("should work for user to update one field", async () => {
    const res = await request(app)
      .patch("/posts/3")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 3,
        creatorId: 2,
        date: getCurrentDate(),
        title: "This is the third post.",
        postText: "This is the third post description.",
        subject: "Ideas",
        forum: "Technology",
        isPrivate: true,
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for user to update multiple fields", async () => {
    const res = await request(app)
      .patch("/posts/3")
      .send({ isPrivate: true, title: "This is a test." })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 3,
        creatorId: 2,
        date: getCurrentDate(),
        title: "This is a test.",
        postText: "This is the third post description.",
        subject: "Ideas",
        forum: "Technology",
        isPrivate: true,
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to update one field", async () => {
    const res = await request(app)
      .patch("/posts/1")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 1,
        creatorId: 1,
        date: getCurrentDate(),
        title: "This is the first post.",
        postText: "This is the first post description.",
        subject: "General",
        forum: "Announcements",
        isPrivate: true,
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should work for admin user to update multiple fields", async () => {
    const res = await request(app)
      .patch("/posts/1")
      .send({
        isPrivate: true,
        forum: 2,
        subject: 2,
        postText: "This is a test.",
        title: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      post: {
        id: 1,
        creatorId: 1,
        date: getCurrentDate(),
        title: "New",
        postText: "This is a test.",
        subject: "Ideas",
        forum: "Technology",
        isPrivate: true,
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/posts/2")
      .send({ postText: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app)
      .patch("/posts/3")
      .send({ isPrivate: true });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/posts/1")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if post doesn't exist", async () => {
    const res = await request(app)
      .patch("/posts/10")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /posts/:id *******/
describe("DELETE /posts/:id", () => {
   test("should allow user to remove a post", async () => {
     const res = await request(app)
       .delete("/posts/3")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.body).toEqual({ deleted: "Post id: 3" });
   });
   test("should allow admin user to remove a post", async () => {
     const res = await request(app)
       .delete("/posts/1")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.body).toEqual({ deleted: "Post id: 1" });
   });
   test("should throw UnauthorizedError if anon user", async () => {
     const res = await request(app).delete("/posts/1");
     expect(res.statusCode).toBe(401);
   });
   test("should throw ForbiddenError if not admin or correct user", async () => {
     const res = await request(app)
       .delete("/posts/1")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toBe(403);
   });
   test("should throw NotFoundError if post doesn't exist", async () => {
     const res = await request(app)
       .delete("/posts/10")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toBe(404);
   });
 });
 