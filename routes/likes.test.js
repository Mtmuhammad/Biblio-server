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

/******* POST /likes ******/

describe("/POST /likes", () => {
  const newLike = {
    creatorId: 1,
    postId: 5,
  };
  const newLike2 = {
    postId: 3,
    creatorId: 2,
  };
  test("should allow user to add a new like", async () => {
    const res = await request(app)
      .post("/likes")
      .send(newLike2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      like: {
        id: 8,
        postId: 3,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to add a new like", async () => {
    const res = await request(app)
      .post("/likes")
      .send(newLike)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      like: {
        id: 9,
        postId: 5,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BaqRequestError for missing data", async () => {
    const res = await request(app)
      .post("/likes")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BaqRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/likes")
      .send({ creatorId: "yes", postId: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app)
      .post("/likes")
      .send({ creatorId: "yes", postId: 2 });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/likes")
      .send({ creatorId: 1, postId: 2 })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/*****GET /likes *******/
describe("GET /likes", () => {
  test("should work for user to get all likes", async () => {
    const res = await request(app)
      .get("/likes")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should work for admin user to get all likes", async () => {
    const res = await request(app)
      .get("/likes")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/likes");
    expect(res.statusCode).toBe(401);
  });
});

/*****GET /likes/post/:id *******/
describe("GET /likes/post/:id", () => {
  test("should work for user to get likes on a post", async () => {
    const res = await request(app)
      .get("/likes/post/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should work for admin user to get likes on a post", async () => {
    const res = await request(app)
      .get("/likes/post/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/likes/post/1");
    expect(res.statusCode).toEqual(401);
  });
});

/*****GET /likes/user/:id *******/
describe("GET /likes/user/:id", () => {
  test("should work to get user likes", async () => {
    const res = await request(app)
      .get("/likes/user/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should work to get user likes", async () => {
    const res = await request(app)
      .get("/likes/user/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      likes: [
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
      ],
    });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/likes/user/1");
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if wrong user or not admin", async () => {
    const res = await request(app)
      .get("/likes/user/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
});

/*****GET /likes/:id *******/

describe("GET /likes/:id", () => {
  test("should work for user to get one like", async () => {
    const res = await request(app)
      .get("/likes/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 2,
        postId: 1,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to get one like", async () => {
    const res = await request(app)
      .get("/likes/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/likes/1");
    expect(res.statusCode).toEqual(401);
  });
});

/*****PATCH /likes/:id *******/
describe("PATCH /likes/:id", () => {
  test("should work for user to update one like field", async () => {
    const res = await request(app)
      .patch("/likes/2")
      .send({ postId: 2 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 2,
        postId: 2,
        creatorId: 2,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for user to update multiple like fields", async () => {
    const res = await request(app)
      .patch("/likes/2")
      .send({ postId: 2, time: "now" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 2,
        postId: 2,
        creatorId: 2,
        date: getCurrentDate(),
        time: "now",
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to update one like field", async () => {
    const res = await request(app)
      .patch("/likes/1")
      .send({ postId: 1 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: getCurrentTime(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should work for admin user to update multiple like fields", async () => {
    const res = await request(app)
      .patch("/likes/1")
      .send({ postId: 1, time: "now" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      like: {
        id: 1,
        postId: 1,
        creatorId: 1,
        date: getCurrentDate(),
        time: "now",
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/likes/1")
      .send({ postId: "yes" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).patch("/likes/1").send({ postId: "yes" });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/likes/1")
      .send({ postId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(403);
  });
  test("should throw NotFoundError if like doesn't exist", async () => {
    const res = await request(app)
      .patch("/likes/9")
      .send({ postId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/*****DELETE /likes/:id *******/
describe("DELETE /likes/:id", () => {
  test("should work for user to delete a like", async () => {
    const res = await request(app)
      .delete("/likes/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ deleted: "Like id: 2" });
  });
  test("should work for admin user to delete a like", async () => {
    const res = await request(app)
      .delete("/likes/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ deleted: "Like id: 1" });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).delete("/likes/1");
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .delete("/likes/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if like doesn't exist", async () => {
    const res = await request(app)
      .delete("/likes/8")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});
