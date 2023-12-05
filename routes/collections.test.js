"use strict";

const request = require("supertest");

const app = require("../app");
const { getCurrentDate } = require("../helpers/getCurrentDate");

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

/******* POST /collections ******/

describe("POST /collections", () => {
  const newCollection = {
    creatorId: 1,
    title: "Test1 Collection",
    isPrivate: true,
  };
  const newCollection2 = {
    creatorId: 2,
    title: "Test2 Collection",
    isPrivate: false,
  };
  test("should work for user to add a new collection", async () => {
    const res = await request(app)
      .post("/collections")
      .send(newCollection2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      collection: {
        ...newCollection2,
        id: 4,
        date: getCurrentDate(),
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user to add a new collection", async () => {
    const res = await request(app)
      .post("/collections")
      .send(newCollection)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      collection: {
        ...newCollection,
        id: 5,
        date: getCurrentDate(),
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/collections")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/collections")
      .send({ creatorId: 1, title: 1, isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/collections");
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/collections")
      .send(newCollection2)
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/*****GET /collections/public *****/

describe("GET /collections/public", () => {
  test("should work for user to get all public collections", async () => {
    const res = await request(app)
      .get("/collections/public")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collections: [
        {
          id: 2,
          title: "Second Collection",
          creatorId: 2,
          date: getCurrentDate(),
          fullName: "Test2 User2",
        },
        {
          id: 3,
          title: "Third Collection",
          creatorId: 1,
          date: getCurrentDate(),
          fullName: "Test1 User1",
        },
      ],
    });
  });
  test("should work for admin user to get all public collections", async () => {
    const res = await request(app)
      .get("/collections/public")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collections: [
        {
          id: 2,
          title: "Second Collection",
          creatorId: 2,
          date: getCurrentDate(),
          fullName: "Test2 User2",
        },
        {
          id: 3,
          title: "Third Collection",
          creatorId: 1,
          date: getCurrentDate(),
          fullName: "Test1 User1",
        },
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/collections/public");
    expect(res.statusCode).toBe(401);
  });
});

/******GET /collections/user/:id ****/

describe("GET /collections/user/:id", () => {
  test("should work for user to get all collections", async () => {
    const res = await request(app)
      .get("/collections/user/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collections: [
        {
          id: 2,
          title: "Second Collection",
          creatorId: 2,
          date: getCurrentDate(),
          fullName: "Test2 User2",
          isPrivate: false,
        },
      ],
    });
  });
  test("should work for admin user to get all collections", async () => {
    const res = await request(app)
      .get("/collections/user/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collections: [
        {
          id: 1,
          title: "First Collection",
          creatorId: 1,
          date: getCurrentDate(),
          isPrivate: true,
          fullName: "Test1 User1",
        },
        {
          id: 3,
          title: "Third Collection",
          creatorId: 1,
          date: getCurrentDate(),
          isPrivate: false,
          fullName: "Test1 User1",
        },
      ],
    });
  });
  test("should throw UnauthorizedError if wrong user or not admin", async () => {
    const res = await request(app)
      .get("/collections/user/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/collections/user/1");
    expect(res.statusCode).toEqual(401);
  });
});

/*****GET /collections/:id ********/
describe("GET /collections/:id", () => {
  test("should work for correct user", async () => {
    const res = await request(app)
      .get("/collections/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collection: {
        id: 2,
        title: "Second Collection",
        creatorId: 2,
        date: getCurrentDate(),
        isPrivate: false,
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for any admin user to get collection", async () => {
    const res = await request(app)
      .get("/collections/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collection: {
        id: 2,
        title: "Second Collection",
        creatorId: 2,
        date: getCurrentDate(),
        isPrivate: false,
        fullName: "Test2 User2",
      },
    });
  });
  test("should work for admin user", async () => {
    const res = await request(app)
      .get("/collections/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      collection: {
        id: 1,
        title: "First Collection",
        creatorId: 1,
        date: getCurrentDate(),
        isPrivate: true,
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw ForbiddenError if wrong user or not admin", async () => {
    const res = await request(app)
      .get("/collections/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(403);
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).get("/collections/1");
    expect(res.statusCode).toEqual(401);
  });
});

/******PATCH /collections/:id *******/
describe("PATCH /collections/:id", () => {
  test("should allow user to update a collection field", async () => {
    const res = await request(app)
      .patch("/collections/2")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      collection: {
        id: 2,
        title: "Second Collection",
        creatorId: 2,
        date: getCurrentDate(),
        isPrivate: true,
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow user to update multiple collection fields", async () => {
    const res = await request(app)
      .patch("/collections/2")
      .send({ isPrivate: true, title: "New Collection" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      collection: {
        id: 2,
        title: "New Collection",
        creatorId: 2,
        date: getCurrentDate(),
        isPrivate: true,
        fullName: "Test2 User2",
      },
    });
  });
  test("should allow admin user to update a collection field", async () => {
    const res = await request(app)
      .patch("/collections/1")
      .send({ isPrivate: false })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      collection: {
        id: 1,
        title: "First Collection",
        creatorId: 1,
        date: getCurrentDate(),
        isPrivate: false,
        fullName: "Test1 User1",
      },
    });
  });
  test("should allow admin user to update multiple collection fields", async () => {
    const res = await request(app)
      .patch("/collections/1")
      .send({ isPrivate: false, title: "New Collection" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      collection: {
        id: 1,
        title: "New Collection",
        creatorId: 1,
        date: getCurrentDate(),
        isPrivate: false,
        fullName: "Test1 User1",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/collections/2")
      .send({ isPrivate: "yes" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app)
      .patch("/collections/3")
      .send({ isPrivate: "yes" });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/collections/1")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if collection doesn't exist", async () => {
    const res = await request(app)
      .patch("/collections/8")
      .send({ isPrivate: true })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /collections/:id *******/
describe("DELETE /collections/:id", () => {
  test("should allow user to remove a collection", async () => {
    const res = await request(app)
      .delete("/collections/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({ deleted: "Collection id: 2" });
  });
  test("should allow admin user to remove a collection", async () => {
    const res = await request(app)
      .delete("/collections/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ deleted: "Collection id: 1" });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).delete("/collections/1");
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .delete("/collections/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if collection doesn't exist", async () => {
    const res = await request(app)
      .delete("/collections/8")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});
