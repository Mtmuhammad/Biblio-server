const jwt = require("jsonwebtoken");
const { createToken, createRefreshToken } = require("./tokens");
const { BadRequestError } = require("../expressError");
require("dotenv").config();

/*****createToken ******/
describe("createToken", () => {
  test("should create a token for user", () => {
    const token = createToken({
      id: 1,
      email: "new1@gmail.com",
      isAdmin: false,
    });
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    expect(payload).toEqual({
      iat: expect.any(Number),
      exp: expect.any(Number),
      id: 1,
      email: "new1@gmail.com",
      isAdmin: false,
    });
  });
  test("should create a token for admin user", () => {
    const token = createToken({
      id: 2,
      email: "new2@gmail.com",
      isAdmin: true,
    });
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    expect(payload).toEqual({
      iat: expect.any(Number),
      exp: expect.any(Number),
      id: 2,
      email: "new2@gmail.com",
      isAdmin: true,
    });
  });
  test("should throw BadRequestError if missing data", () => {
    try {
      const token = createToken({ id: 1 });
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/***createRefreshToken *****/
describe("createRefreshToken", () => {
  test("should create refresh token for user", () => {
    const token = createRefreshToken({
      id: 1,
      email: "new1@gmail.com",
      isAdmin: false,
    });
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    expect(payload).toEqual({
      iat: expect.any(Number),
      exp: expect.any(Number),
      id: 1,
      email: "new1@gmail.com",
      isAdmin: false,
    });
  });
  test("should create refresh token for admin user", () => {
    const token = createRefreshToken({
      id: 2,
      email: "new2@gmail.com",
      isAdmin: true,
    });
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    expect(payload).toEqual({
      iat: expect.any(Number),
      exp: expect.any(Number),
      id: 2,
      email: "new2@gmail.com",
      isAdmin: true,
    });
  });
  test("should throw BadRequestError is missing user data", () => {
    try {
      const token = createRefreshToken({ email: "user@gmail.com" });
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
