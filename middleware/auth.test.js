"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureCorrectUserOrAdmin,
} = require("./auth");
require("dotenv").config();

const testJWT = jwt.sign(
  { email: "test@example.com", isAdmin: false },
  process.env.ACCESS_TOKEN_SECRET
);
const badJWT = jwt.sign({ email: "test@example.com", isAdmin: false }, "wrong");

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
