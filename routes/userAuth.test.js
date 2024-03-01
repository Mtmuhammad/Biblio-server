"use strict";

const request = require("supertest");
const User = require("../models/user");
const app = require("../app");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u3Token,
  u1Refresh,
  u2Refresh,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********POST /auth/login *******/

describe("POST /auth/login", () => {
  test("should login non-admin user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test2@yahoo.com",
      password: "password2",
    });

    const cookie = res.header["set-cookie"][0].split(";")[0];
    const tokenRes = await db.query(
      `SELECT token FROM users WHERE email='test2@yahoo.com'`
    );
    expect(tokenRes.rows.length).toEqual(1);
    expect(res.body).toEqual({
      role: 2024,
      user: {
        email: "test2@yahoo.com",
        id: 2,
        firstName: "Test2",
        isAdmin: false,
        lastName: "User2",
      },
      token: expect.any(String),
    });
    expect(cookie).toEqual(expect.any(String));
  });
  test("should login an admin user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test1@yahoo.com",
      password: "password1",
    });

    const cookie = res.header["set-cookie"][0].split(";")[0];
    const tokenRes = await db.query(
      `SELECT token FROM users WHERE email='test1@yahoo.com'`
    );
    expect(tokenRes.rows.length).toEqual(1);
    expect(res.body).toEqual({
      role: 1990,
      user: {
        email: "test1@yahoo.com",
        id: 1,
        firstName: "Test1",
        isAdmin: true,
        lastName: "User1",
      },
      token: expect.any(String),
    });
    expect(cookie).toEqual(expect.any(String));
  });
  test("should throw UnauthorizedError for missing data", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test1@yahoo.com",
    });

    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app).post("/auth/login").send({
      email: 42,
      password: "thisiswrong",
    });
    expect(res.statusCode).toEqual(400);
  });
  test("should throw UnauthorizedError for wrong email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@yahoo.com",
      password: "password1",
    });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw BadRequestError for wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test1@yahoo.com",
      password: "extra",
    });
    expect(res.statusCode).toEqual(401);
  });
});

/********POST /auth/register *******/

describe("POST /auth/register", () => {
  const newUser = {
    firstName: "u3first",
    lastName: "u3last",
    email: "u3@yahoo.com",
    password: "u3password",
    isAdmin: false,
  };
  test("should register a user", async () => {
    const res = await request(app).post("/auth/register").send(newUser);
    const cookie = res.header["set-cookie"][0].split(";")[0];
    const tokenRes = await db.query(
      `SELECT token FROM users WHERE email='u3@yahoo.com'`
    );
    expect(tokenRes.rows.length).toEqual(1);
    expect(cookie).toEqual(expect.any(String));
    expect(res.body).toEqual({
      role: 2024,
      user: {
        firstName: "u3first",
        lastName: "u3last",
        email: "u3@yahoo.com",
        id: 3,
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });
  test("should throw BadRequestError if user exists", async () => {
    const res = await request(app).post("/auth/register").send({
      firstName: "Test2",
      lastName: "User2",
      email: "test2@yahoo.com",
      password: "password2",
      isAdmin: false,
    });
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError if invalid data", async () => {
    const res = await request(app).post("/auth/register").send({
      firstName: 42,
      lastName: "u2last",
      email: "u2yahoo.com",
      password: "u2password",
      isAdmin: false,
    });
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError if missing data", async () => {
    const res = await request(app).post("/auth/register").send({
      firstName: "u2first",
      lastName: "u2last",
    });
    expect(res.statusCode).toEqual(400);
  });
});

/********GET /auth/refresh *******/

describe("GET /auth/refresh", () => {
  test("should refresh admin user access token", async () => {
    await User.saveRefreshToken(1, u1Refresh);
    const res = await request(app)
      .get("/auth/refresh")
      .set("Cookie", [`jwt=${u1Refresh}`]);
    expect(res.body).toEqual({
      user: {
        email: "test1@yahoo.com",
        id: 1,
        firstName: "Test1",
        isAdmin: true,
        lastName: "User1",
      },
      token: expect.any(String),
    });
    expect(res.status).toEqual(202);
  });
  test("should refresh non-admin user access token", async () => {
    await User.saveRefreshToken(2, u2Refresh);
    const res = await request(app)
      .get("/auth/refresh")
      .set("Cookie", [`jwt=${u2Refresh}`]);
    expect(res.body).toEqual({
      user: {
        email: "test2@yahoo.com",
        id: 2,
        firstName: "Test2",
        isAdmin: false,
        lastName: "User2",
      },
      token: expect.any(String),
    });
    expect(res.status).toEqual(202);
  });
  test("should throw UnauthorizedError if anon user (no cookie)", async () => {
    const res = await request(app).get("/auth/refresh");
    expect(res.statusCode).toEqual(401);
  });
  test("should throw ForbiddenError if decoded user doesn't match user in database", async () => {
    await User.saveRefreshToken(1, u3Token);
    const res = await request(app)
      .get("/auth/refresh")
      .set("Cookie", [`jwt=${u3Token}`]);
    expect(res.statusCode).toEqual(403);
  });
  test("should throw NotFoundError if cookie not found in database", async () => {
    const res = await request(app)
      .get("/auth/refresh")
      .set("Cookie", [`jwt=${u3Token}`]);
    expect(res.statusCode).toEqual(404);
  });
});

/********GET /auth/logout *******/

describe("GET /auth/logout", () => {
  test("should logout admin user", async () => {
    await User.saveRefreshToken(1, u1Refresh);
    const res = await request(app)
      .get("/auth/logout")
      .set("Cookie", [`jwt=${u1Refresh}`]);
    expect(res.body).toEqual({
      Message: "User number 1 logged out successfully!",
    });
    expect(res.status).toEqual(200);
  });
  test("should logout non-admin user", async () => {
    await User.saveRefreshToken(2, u2Refresh);
    const res = await request(app)
      .get("/auth/logout")
      .set("Cookie", [`jwt=${u2Refresh}`]);
    expect(res.body).toEqual({
      Message: "User number 2 logged out successfully!",
    });
    expect(res.status).toEqual(200);
  });
  test("should return NotFoundError if user not found", async () => {
    const res = await request(app)
      .get("/auth/logout")
      .set("Cookie", [`jwt=${u3Token}`]);
    expect(res.status).toEqual(404);
  });
  test("should return 204 status if no cookie provided", async () => {
    const res = await request(app).get("/auth/logout");
    expect(res.status).toEqual(204);
  });
});
