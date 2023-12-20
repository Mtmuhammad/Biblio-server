"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******* POST /forums ******/

describe("POST /forums", () => {
  const newForum = {
    title: "Test Forum1",
    description: "This is test forum 1.",
    creator: 1,
  };
  const newForum2 = {
    title: "Test Forum2",
    description: "This is test forum 2.",
    creator: 2,
  };
  test("should allow admin user to create a forum", async () => {
    const res = await request(app)
      .post("/forums")
      .send(newForum)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      forum: {
        ...newForum,
        id: 4,
      },
    });
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/forums")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/forums")
      .send({ title: "Test Forum1", description: 2, creator: 1 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app)
      .post("/forums")
      .send({ creator: 2, text: "text", description: "test" });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw ForbiddenError for non admin user", async () => {
    const res = await request(app)
      .post("/forums")
      .send({ creator: 2, text: "text", description: "test" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(403);
  });
});

/******GET /forums *******/
describe("GET /forums", () => {
  test("should work for user to get forums", async () => {
    const res = await request(app)
      .get("/forums")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forums: [
        {
          id: 1,
          title: "Announcements",
          description:
            "This forum is a special forum for general announcements.",
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
      ],
    });
  });
  test("should work for admin user to get forums", async () => {
    const res = await request(app)
      .get("/forums")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forums: [
        {
          id: 1,
          title: "Announcements",
          description:
            "This forum is a special forum for general announcements.",
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
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/forums");
    expect(res.statusCode).toBe(401);
  });
});

/******GET /forums/:id *******/

describe("GET /forums/:id", () => {
  test("should work for user to get a forum", async () => {
    const res = await request(app)
      .get("/forums/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forum: {
        id: 2,
        title: "Technology",
        description: "Latest technology news and updates from our community.",
        creator: 1,
      },
    });
  });
  test("should work for admin user to get a forum", async () => {
    const res = await request(app)
      .get("/forums/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forum: {
        id: 1,
        title: "Announcements",
        description: "This forum is a special forum for general announcements.",
        creator: 1,
      },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/forums/3");
    expect(res.statusCode).toBe(401);
  });
});

/******PATCH /forums/:id *******/
describe("PATCH /forums/:id", () => {
  test("should work for admin user to update a forum field", async () => {
    const res = await request(app)
      .patch("/forums/1")
      .send({ title: "text" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forum: {
        id: 1,
        creator: 1,
        title: "text",
        description: "This forum is a special forum for general announcements.",
      },
    });
  });
  test("should work for admin user to update multiple forum fields", async () => {
    const res = await request(app)
      .patch("/forums/1")
      .send({ title: "text", description: "test" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      forum: {
        id: 1,
        creator: 1,
        title: "text",
        description: "test",
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/forums/2")
      .send({ title: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(400);
  });
  test("should throw ForbiddenError if not admin", async () => {
    const res = await request(app)
      .patch("/forums/1")
      .send({ title: "text" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if forum doesn't exist", async () => {
    const res = await request(app)
      .patch("/forums/8")
      .send({ title: "text" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /forums/:id *******/
describe("DELETE /forums/:id", () => {
  test("should allow admin user to delete a forum", async () => {
    const res = await request(app)
      .delete("/forums/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ deleted: "Forum id: 1" });
  });
  test("should throw ForbiddenError if not admin", async () => {
    const res = await request(app)
      .delete("/forums/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if forum doesn't exist", async () => {
    const res = await request(app)
      .delete("/forums/8")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(404);
  });
});
