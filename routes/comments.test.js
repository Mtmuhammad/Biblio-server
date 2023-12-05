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

/******* POST /comments ******/

describe("POST /comments", () => {
  const newComment = {
    creatorId: 1,
    text: "Test comment 1",
    postId: 1,
  };
  const newComment2 = {
    creatorId: 2,
    text: "Test comment 2",
    postId: 2,
  };
  test("should allow user to post a comment", async () => {
    const res = await request(app)
      .post("/comments")
      .send(newComment2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      comment: {
        ...newComment2,
        id: 7,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to post a comment", async () => {
    const res = await request(app)
      .post("/comments")
      .send(newComment)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      comment: {
        ...newComment,
        id: 8,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/comments")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/comments")
      .send({ creatorId: 2, text: 3, postId: 2 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app)
      .post("/comments")
      .send({ creatorId: 2, text: "text", postId: 2 });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/comments")
      .send({ creatorId: 2, text: "text", postId: 2 })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/****** GET /comments *****/
describe("GET /comments", () => {
  test("should work for user to get comments", async () => {
    const res = await request(app)
      .get("/comments")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should work for admin user to get comments", async () => {
    const res = await request(app)
      .get("/comments")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/comments");
    expect(res.statusCode).toBe(401);
  });
});

/****** GET /comments/user/:id *******/
describe("GET /comments/user/:id", () => {
  test("should work for user to get all user comments", async () => {
    const res = await request(app)
      .get("/comments/user/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should work for admin to get all admin user comments", async () => {
    const res = await request(app)
      .get("/comments/user/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should throw UnauthorizedError if wrong user", async () => {
    const res = await request(app)
      .get("/comments/user/2")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if not admin user", async () => {
    const res = await request(app)
      .get("/comments/user/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/comments/user/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******GET /comments/post/:id *********/

describe("GET /comments/post/:id", () => {
  test("should work for user to get post comments", async () => {
    const res = await request(app)
      .get("/comments/post/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should work for admin user to get post comments", async () => {
    const res = await request(app)
      .get("/comments/post/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comments: [
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/comments/post/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******GET /comments/:id *******/

describe("GET /comments/:id", () => {
  test("should work for user to get one comment", async () => {
    const res = await request(app)
      .get("/comments/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 2,
        creatorId: 2,
        text: "This is the second test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to get one comment", async () => {
    const res = await request(app)
      .get("/comments/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 1,
        creatorId: 1,
        text: "This is the first test comment.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/comments/1");
    expect(res.statusCode).toEqual(401);
  });
});

/*****PATCH /comments/:id *******/
describe("PATCH /comments/:id", () => {
  test("should work for user to update on field", async () => {
    const res = await request(app)
      .patch("/comments/2")
      .send({ text: "This is a test." })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 2,
        creatorId: 2,
        text: "This is a test.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for user to update multiple fields", async () => {
    const res = await request(app)
      .patch("/comments/2")
      .send({ text: "This is a test.", postId: 2 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 2,
        creatorId: 2,
        text: "This is a test.",
        postId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to update one field", async () => {
    const res = await request(app)
      .patch("/comments/1")
      .send({ text: "This is a test." })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 1,
        creatorId: 1,
        text: "This is a test.",
        postId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should work for admin user to update multiple fields", async () => {
    const res = await request(app)
      .patch("/comments/1")
      .send({ text: "This is a test.", postId: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      comment: {
        id: 1,
        creatorId: 1,
        text: "This is a test.",
        postId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/comments/2")
      .send({ isPrivate: "yes" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app)
      .patch("/comments/3")
      .send({ isPrivate: "yes" });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/comments/1")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if comment doesn't exist", async () => {
    const res = await request(app)
      .patch("/comments/8")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /comments/:id *******/
describe("DELETE /comments/:id", () => {
  test("should allow user to remove a comment", async () => {
    const res = await request(app)
      .delete("/comments/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({ deleted: "Comment id: 2" });
  });
  test("should allow admin user to remove a comment", async () => {
    const res = await request(app)
      .delete("/comments/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ deleted: "Comment id: 1" });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).delete("/comments/1");
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .delete("/comments/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if comment doesn't exist", async () => {
    const res = await request(app)
      .delete("/comments/8")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});
