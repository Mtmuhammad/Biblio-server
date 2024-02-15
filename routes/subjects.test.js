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

/******* POST /subjects ******/

describe("POST /subjects", () => {
  const newSubject = {
    name: "First Subject",
    creator: 1,
  };
  const newSubject2 = {
    name: "Second Subject",
    creator: 2,
  };
  test("should allow user to create a subject", async () => {
    const res = await request(app)
      .post("/subjects")
      .send(newSubject2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      subject: { id: 4, name: "Second Subject", creator: 2 },
    });
  });
  test("should allow admin user to create a subject", async () => {
    const res = await request(app)
      .post("/subjects")
      .send(newSubject)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      subject: { id: 5, name: "First Subject", creator: 1 },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/subjects").send(newSubject);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/subjects")
      .send(newSubject)
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
});

/******GET /subjects ******/
describe("GET /subjects", () => {
  test("should allow user to get all subjects", async () => {
    const res = await request(app)
      .get("/subjects")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      subjects: [
        { id: 1, name: "General", creator: 1 },
        { id: 2, name: "Ideas", creator: 2 },
        { id: 3, name: "Help", creator: 1 },
      ],
    });
  });
  test("should allow admin user to get all subjects", async () => {
    const res = await request(app)
      .get("/subjects")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      subjects: [
        { id: 1, name: "General", creator: 1 },
        { id: 2, name: "Ideas", creator: 2 },
        { id: 3, name: "Help", creator: 1 },
      ],
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/subjects");
    expect(res.statusCode).toEqual(401);
  });
});

/******GET /subjects/:id ********/
describe("GET /subjects/:id", () => {
  test("should work for user to get a subject", async () => {
    const res = await request(app)
      .get("/subjects/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ subject: { id: 2, name: "Ideas", creator: 2 } });
  });
  test("should work for admin user to get a subject", async () => {
    const res = await request(app)
      .get("/subjects/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      subject: { id: 1, name: "General", creator: 1 },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).get("/subjects/3");
    expect(res.statusCode).toEqual(401);
  });
});

/*****PATCH /subjects/:id ********/
describe("PATCH /subjects/:id", () => {
  test("should allow user to update a subject", async () => {
    const res = await request(app)
      .patch("/subjects/2")
      .send({ name: "test" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ subject: { id: 2, name: "test", creator: 2 } });
  });
  test("should allow admin user to update a subject", async () => {
    const res = await request(app)
      .patch("/subjects/1")
      .send({ name: "test" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ subject: { id: 1, name: "test", creator: 1 } });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/subjects/2")
      .send({ name: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).patch("/subjects/3").send({ name: "test" });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/subjects/1")
      .send({ name: "test" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if subject doesn't exist", async () => {
    const res = await request(app)
      .patch("/subjects/10")
      .send({ name: "test" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/******DELETE /subjects/:id *******/
describe("DELETE /subjects/:id", () => {
   test("should allow user to remove a subject", async () => {
     const res = await request(app)
       .delete("/subjects/2")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.body).toEqual({ deleted: "Subject id: 2" });
   });
   test("should allow admin user to remove a subject", async () => {
     const res = await request(app)
       .delete("/subjects/1")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.body).toEqual({ deleted: "Subject id: 1" });
   });
   test("should throw UnauthorizedError if anon user", async () => {
     const res = await request(app).delete("/subjects/1");
     expect(res.statusCode).toBe(401);
   });
   test("should throw ForbiddenError if not admin or correct user", async () => {
     const res = await request(app)
       .delete("/subjects/1")
       .set("authorization", `Bearer ${u3Token}`);
     expect(res.statusCode).toBe(403);
   });
   test("should throw NotFoundError if subject doesn't exist", async () => {
     const res = await request(app)
       .delete("/subjects/10")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toBe(404);
   });
 });
