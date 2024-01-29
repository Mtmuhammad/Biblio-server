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

/******* POST /replies ******/

describe("POST /replies", () => {
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
  test("should allow user to reply a post", async () => {
    const res = await request(app)
      .post("/replies")
      .send(newReply2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      reply: {
        id: 9,
        creatorId: 2,
        text: "A test reply for user.",
        commentId: 6,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to reply a post", async () => {
    const res = await request(app)
      .post("/replies")
      .send(newReply)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      reply: {
        id: 10,
        creatorId: 1,
        text: "A test reply for admin.",
        commentId: 5,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/replies")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/replies")
      .send({
        creatorId: 1,
        text: "A test reply for admin.",
        commentId: "yes",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/replies").send(newReply);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app)
      .post("/replies")
      .send(newReply)
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/******GET /replies *******/
describe("GET /replies", () => {
  test("should work for user to get all replies", async () => {
    const res = await request(app)
      .get("/replies")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should work for admin user to get all replies", async () => {
    const res = await request(app)
      .get("/replies")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/replies");
    expect(res.statusCode).toEqual(401);
  });
});

/*******GET /replies/comment/:id ********/
describe("GET /replies/comment/:id", () => {
  test("should work for user to get replies to a comment", async () => {
    const res = await request(app)
      .get("/replies/comment/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should work for admin user to get replies to a comment", async () => {
    const res = await request(app)
      .get("/replies/comment/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/replies/comment/3");
    expect(res.statusCode).toEqual(401);
  });
});

/*****GET /replies/user/:id ******/
describe("GET /replies/user/:id", () => {
  test("should allow user to get their replies", async () => {
    const res = await request(app)
      .get("/replies/user/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should allow admin user to get their replies", async () => {
    const res = await request(app)
      .get("/replies/user/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      replies: [
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
      ],
    });
  });
  test("should throw UnauthorizedError if wrong user", async () => {
    const res = await request(app)
      .get("/replies/user/2")
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if not admin user", async () => {
    const res = await request(app)
      .get("/replies/user/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/replies/user/1");
    expect(res.statusCode).toEqual(401);
  });
});

/*****GET /replies/:id *******/
describe("GET /replies/:id", () => {
  test("should allow user to get a reply", async () => {
    const res = await request(app)
      .get("/replies/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 3,
        creatorId: 2,
        text: "This is the third test reply.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to get a reply", async () => {
    const res = await request(app)
      .get("/replies/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 1,
        creatorId: 1,
        text: "This is the first test reply.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/replies/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******PATCH /replies/:id ******/
describe("PATCH /replies/:id", () => {
  test("should work for user to update a reply field", async () => {
    const res = await request(app)
      .patch("/replies/3")
      .send({ text: "This is a test." })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 3,
        creatorId: 2,
        text: "This is a test.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for user to update multiple reply fields", async () => {
    const res = await request(app)
      .patch("/replies/3")
      .send({ text: "This is a test.", commentId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 3,
        creatorId: 2,
        text: "This is a test.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to update a reply field", async () => {
    const res = await request(app)
      .patch("/replies/1")
      .send({ text: "This is a test." })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 1,
        creatorId: 1,
        text: "This is a test.",
        commentId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should work for admin user to update multiple reply fields", async () => {
    const res = await request(app)
      .patch("/replies/1")
      .send({ text: "This is a test.", commentId: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      reply: {
        id: 1,
        creatorId: 1,
        text: "This is a test.",
        commentId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/replies/3")
      .send({ text: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app)
      .patch("/replies/3")
      .send({text: "yes" });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/replies/1")
      .send({ text: "yes"})
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if reply doesn't exist", async () => {
    const res = await request(app)
      .patch("/replies/10")
      .send({ text: "yes" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /replies/:id *******/
describe("DELETE /replies/:id", () => {
  test("should allow user to remove a reply", async () => {
    const res = await request(app)
      .delete("/replies/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({ deleted: "Reply id: 3" });
  });
  test("should allow admin user to remove a reply", async () => {
    const res = await request(app)
      .delete("/replies/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ deleted: "Reply id: 1" });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).delete("/replies/1");
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .delete("/replies/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if reply doesn't exist", async () => {
    const res = await request(app)
      .delete("/replies/10")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});