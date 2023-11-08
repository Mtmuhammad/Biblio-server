"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureCorrectUserOrAdmin,
  checkUser,
} = require("./auth");
const User = require("../models/user");
const Book = require("../models/book");

const { commonAfterAll } = require("../models/_testCommon");
require("dotenv").config();

const testJWT = jwt.sign(
  { email: "test@example.com", isAdmin: false },
  process.env.ACCESS_TOKEN_SECRET
);
const badJWT = jwt.sign({ email: "test@example.com", isAdmin: false }, "wrong");

afterAll(commonAfterAll);

describe("authenticateJWT", () => {
  test("should work via header", () => {
    expect.assertions(2);

    const req = { headers: { authorization: `Bearer ${testJWT}` } };
    const res = { locals: {} };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        email: "test@example.com",
        isAdmin: false,
      },
    });
  });

  test("should work with no header", () => {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("should work with invalid token", () => {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJWT}` } };
    const res = { locals: {} };
    const next = (err) => {
      expect(err).toBeTruthy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", () => {
  test("should work", () => {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: { user: { email: "test@example.com", isAdmin: false } },
    };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });
  test("should throw UnauthorizedError if no login", () => {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: {},
    };
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureIsAdmin", () => {
  test("should work", () => {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: { user: { email: "test@example.com", isAdmin: true } },
    };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    ensureIsAdmin(req, res, next);
  });
  test("should throw ForbiddenError is user is not admin", () => {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: { user: { email: "test@example.com", isAdmin: false } },
    };
    const next = (err) => {
      expect(err instanceof ForbiddenError).toBeTruthy();
    };
    ensureIsAdmin(req, res, next);
  });
});

describe("ensureCorrectUserOrAdmin", () => {
  test("should work with admin", () => {
    expect.assertions(1);
    const req = { params: { id: 1, email: "test@example.com" } };
    const res = {
      locals: { user: { id: 1, email: "test@example.com", isAdmin: true } },
    };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });
  test("should work with same user", () => {
    expect.assertions(1);
    const req = { params: { id: 2, email: "test@example.com" } };
    const res = {
      locals: { user: { id: 2, email: "test@example.com", isAdmin: false } },
    };
    const next = (err) => {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });
  test("should throw UnauthorizedError for anon user", () => {
    expect.assertions(1);
    const req = { params: { email: "test@example.com" } };
    const res = { locals: {} };
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });
});

describe("checkUser", () => {
  test("should work for user", async () => {
    const currUser2 = await User.findOne(2);
    const found2 = await Book.findOne(3);
    const res = checkUser(found2, currUser2);
    expect(res).toEqual(undefined);
  });
  test("should work for admin user", async () => {
    const currUser1 = await User.findOne(1);
    const found1 = await Book.findOne(1);
    const res = checkUser(found1, currUser1);
    expect(res).toEqual(undefined);
  });
  test("should throw ForbiddenError for wrong user or not admin", async () => {
    try {
      const currUser2 = await User.findOne(2);
      const found1 = await Book.findOne(1);
      checkUser(found1, currUser2);
      fail();
    } catch (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
  });
});
