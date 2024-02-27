"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");
const {
  ensureLoggedIn,
  ensureIsAdmin,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken, createRefreshToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/**POST "/" {user} => {user, token}
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add a new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an auth token:
 * {user: { firstName, lastName, email, password, isAdmin }}
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn, ensureIsAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const accessToken = createToken(user);
    const refreshToken = createRefreshToken(user);
    await User.saveRefreshToken(user.id, refreshToken);
    const role = user.isAdmin ? 1990 : 2024;

    return res.status(201).json({ role, user, token: accessToken });
  } catch (err) {
    return next(err);
  }
});

/** Get / => {users: [{user}, {...}]}
 *
 * Returns list of all users.
 *
 * Authorization required: login
 */

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /:id => {user}
 *
 * Returns {id, firstName, lastName, email, isAdmin}
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:id {user} => {user}
 *
 * Data can include:
 *    { firstName, lastName, password, email, isAdmin }
 *
 * Returns => { id, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login correct user or Admin
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.id, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /:id => {deleted: User number "id"}
 *
 * Authorization required: login correct user or Admin
 */

router.delete(
  "/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      await User.remove(req.params.id);
      return res.json({ deleted: `User number ${req.params.id}` });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
