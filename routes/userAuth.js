"use strict";

/** Routes for authentication */

const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken, createRefreshToken } = require("../helpers/tokens");
const userLoginSchema = require("../schemas/userLogin.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} = require("../expressError");

/** POST /auth/login: {email, password} => {token}
 *
 * Creates an accessToken and refreshToken saved in a "jwt" cookie.
 *
 * Saves refreshToken to database and returns accessToken for login.
 *
 * Authorization required: none
 */

router.post("/login", async (req, res, next) => {
  try {
    // validate input data
    const validator = jsonschema.validate(req.body, userLoginSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const user = await User.authenticate(email, password);
    const accessToken = createToken(user);
    const refreshToken = createRefreshToken(user);
    await User.saveRefreshToken(user.id, refreshToken);
    const role = user.isAdmin ? 1990 : 2024;

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
      secure: true,
      sameSite: "Strict",
    });

    return res.json({ role, user, token: accessToken });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register: {user} => {token}
 *
 * user must include {firstName, lastName, email, password}
 *
 * Creates an accessToken and refreshToken saved in a "jwt" cookie.
 *
 * Saves refreshToken to database and returns accessToken for login.
 *
 * Authorization required: none
 */

router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const accessToken = createToken(newUser);
    const refreshToken = createRefreshToken(newUser);
    await User.saveRefreshToken(newUser.id, refreshToken);
    const role = newUser.isAdmin ? 1990 : 2024;

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(201).json({ role, user: newUser, token: accessToken });
  } catch (err) {
    return next(err);
  }
});

/** GET  /auth/refresh: => {token}
 *
 * Looks for "jwt" cookie in request that has signed user info
 *
 * Returns JWT token from
 *
 * Authorization required: a signed refresh token must be provided with correct
 * info from user in database.
 */

router.get("/refresh", async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) throw new UnauthorizedError();
    const refreshToken = cookies.jwt;

    const foundUser = await User.findToken(refreshToken);
    const decoded = jwt.decode(refreshToken);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err || foundUser.id !== decoded.id) throw new ForbiddenError();
      const accessToken = createToken(foundUser);
      res.status(202).json({ user: foundUser, token: accessToken });
    });
  } catch (err) {
    return next(err);
  }
});

/** GET /auth/logout: => {message}
 *
 * Looks for "jwt" cookie in request that has signed user info
 *
 * Removes user refresh token from database, and clears cookie from requests.
 *
 * Authorization required: a signed refresh token must be provided with correct
 * info from user in database.
 */

router.get("/logout", async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findToken(refreshToken);

    await User.removeRefreshToken(foundUser.id);
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.status(200).json({
      Message: `User number ${foundUser.id} logged out successfully!`,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
