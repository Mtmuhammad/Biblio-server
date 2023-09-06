"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const User = require("./user");

const {
  commonAfterAll,
  commonAfterEach,
  commonBeforeEach,
  commonBeforeAll,
  u1refreshToken,
  u2refreshToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*******authenticate *******/
describe("authenticate", () => {
  test("should login user", async () => {
    const user = await User.authenticate("test2@yahoo.com", "password2");
    expect(user).toEqual({
      id: 2,
      email: "test2@yahoo.com",
      firstName: "Test2",
      lastName: "User2",
      isAdmin: false,
    });
  });
  test("should login admin user", async () => {
    const user = await User.authenticate("test1@yahoo.com", "password1");
    expect(user).toEqual({
      id: 1,
      email: "test1@yahoo.com",
      firstName: "Test1",
      lastName: "User1",
      isAdmin: true,
    });
  });
  test("should fail if wrong email", async () => {
    try {
      await User.authenticate("wrong@email.com", "password1");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
  test("should fail if wrong password", async () => {
    try {
      await User.authenticate("test1@yahoo.com", "password3");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/*****register ******/
describe("register", () => {
  const newUser = {
    email: "sample1@yahoo.com",
    firstName: "Sample1",
    lastName: "User1",
    password: "password1",
    isAdmin: false,
  };
  const newAdmin = {
    email: "sample2@yahoo.com",
    firstName: "Sample2",
    lastName: "User2",
    password: "password2",
    isAdmin: true,
  };

  test("should register a user", async () => {
    const user = await User.register(newUser);
    expect(user).toEqual({
      id: 3,
      email: "sample1@yahoo.com",
      firstName: "Sample1",
      lastName: "User1",
      isAdmin: false,
    });
    const found = await db.query(
      `SELECT * FROM users WHERE email = 'sample1@yahoo.com'`
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toBe(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });
  test("should register an admin user", async () => {
    const user = await User.register(newAdmin);
    expect(user).toEqual({
      id: 4,
      email: "sample2@yahoo.com",
      firstName: "Sample2",
      lastName: "User2",
      isAdmin: true,
    });
    const found = await db.query(
      `SELECT * FROM users WHERE email = 'sample2@yahoo.com'`
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toBe(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });
  test("should throw bad request error if duplicate data", async () => {
    try {
      await User.register(newUser);
      await User.register(newUser);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/*****findAll ******/
describe("findAll", () => {
  test("should get all users", async () => {
    const users = await User.findAll();
    expect(users.length).toBe(2);
    expect(users).toEqual([
      {
        id: 1,
        email: "test1@yahoo.com",
        firstName: "Test1",
        lastName: "User1",
        isAdmin: true,
      },
      {
        id: 2,
        email: "test2@yahoo.com",
        firstName: "Test2",
        lastName: "User2",
        isAdmin: false,
      },
    ]);
  });
});

/*******findOne *******/
describe("get", () => {
  test("should find a user", async () => {
    const user = await User.findOne(2);

    expect(user).toEqual({
      email: "test2@yahoo.com",
      firstName: "Test2",
      lastName: "User2",
      isAdmin: false,
    });
  });
  test("should find an admin user", async () => {
    const user = await User.findOne(1);

    expect(user).toEqual({
      email: "test1@yahoo.com",
      firstName: "Test1",
      lastName: "User1",
      isAdmin: true,
    });
  });
  test("should throw Not found error", async () => {
    try {
      await User.findOne(3);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******update ********/

describe("update", () => {
  test("should update one user field", async () => {
    const user = await User.update(2, { email: "new2@gmail.com" });
    expect(user).toEqual({
      id: 2,
      firstName: "Test2",
      lastName: "User2",
      email: "new2@gmail.com",
      isAdmin: false,
    });
  });
  test("should update multiple user fields", async () => {
    const user = await User.update(2, {
      email: "new2@gmail.com",
      firstName: "New2",
    });
    expect(user).toEqual({
      id: 2,
      firstName: "New2",
      lastName: "User2",
      email: "new2@gmail.com",
      isAdmin: false,
    });
  });
  test("should update one admin user field", async () => {
    const user = await User.update(1, { email: "new1@gmail.com" });
    expect(user).toEqual({
      id: 1,
      firstName: "Test1",
      lastName: "User1",
      email: "new1@gmail.com",
      isAdmin: true,
    });
  });
  test("should update multiple admin user fields", async () => {
    const user = await User.update(1, {
      email: "new1@gmail.com",
      firstName: "New1",
    });
    expect(user).toEqual({
      id: 1,
      firstName: "New1",
      lastName: "User1",
      email: "new1@gmail.com",
      isAdmin: true,
    });
  });
  test("should throw error if user not found", async () => {
    try {
      await User.update(4, { email: "new1@gmail.com" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data included", async () => {
    try {
      await User.update(4);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/******* remove *******/

describe("remove", () => {
  test("should remove user", async () => {
    await User.remove(2);
    const res = await db.query(`SELECT * FROM users WHERE id=2`);
    expect(res.rows.length).toEqual(0);
  });
  test("should remove admin user", async () => {
    await User.remove(1);
    const res = await db.query(`SELECT * FROM users WHERE id=1`);
    expect(res.rows.length).toEqual(0);
  });
  test("should throw not found error", async () => {
    try {
      await User.remove(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*******save refresh token  *******/
describe("saveRefreshToken", () => {
  test("should save user refresh token", async () => {
    const { refreshToken } = await User.saveRefreshToken(2, u2refreshToken);
    const res = await db.query(`SELECT token FROM users WHERE id = 2`);
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].token).toEqual(refreshToken);
  });
  test("should save admin user refresh token", async () => {
    const { refreshToken } = await User.saveRefreshToken(1, u1refreshToken);
    const res = await db.query(`SELECT token FROM users WHERE id = 1`);
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].token).toEqual(refreshToken);
  });
  test("should throw not found if user does not exist", async () => {
    try {
      await User.saveRefreshToken(4, u1refreshToken);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****find token ******/

describe("findToken", () => {
  test("should find and return user given a refresh token", async () => {
    await User.saveRefreshToken(2, u2refreshToken);
    const foundUser = await User.findToken(u2refreshToken);
    expect(foundUser).toEqual({
      email: "test2@yahoo.com",
      firstName: "Test2",
      id: 2,
      isAdmin: false,
      lastName: "User2",
    });
  });
  test("should find and return admin user given a refresh token", async () => {
    await User.saveRefreshToken(1, u1refreshToken);
    const foundUser = await User.findToken(u1refreshToken);
    expect(foundUser).toEqual({
      email: "test1@yahoo.com",
      firstName: "Test1",
      id: 1,
      isAdmin: true,
      lastName: "User1",
    });
  });
  test("should throw not found if user not found", async () => {
    try {
      await User.findToken(u1refreshToken);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*** removeRefreshToken *****/

describe("removeRefreshToken", () => {
  test("should remove user refresh token", async () => {
    await User.saveRefreshToken(2, u2refreshToken);
    await User.removeRefreshToken(2);
    const res = await db.query(`SELECT token FROM users WHERE id = 2`);
    expect(res.rows[0]).toEqual({ token: null });
  });
  test("should remove admin user refresh token", async () => {
    await User.saveRefreshToken(1, u1refreshToken);
    await User.removeRefreshToken(1);
    const res = await db.query(`SELECT token FROM users WHERE id = 1`);
    expect(res.rows[0]).toEqual({ token: null });
  });
  test("should throw NotFoundError", async () => {
    try {
      await User.removeRefreshToken(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/***getFullName*****/
describe("getFullName", () => {
  test("should return a user's full name", async () => {
    const res = await User.getFullName(2);
    expect(res).toEqual({ fullName: "Test2 User2" });
  });
  test("should return an admin user's full name", async () => {
    const res = await User.getFullName(1);
    expect(res).toEqual({ fullName: "Test1 User1" });
  });
  test("should throw NotFoundError", async () => {
    try {
      await User.getFullName(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
