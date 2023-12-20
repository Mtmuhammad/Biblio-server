"use strict";

/**Routes for forums. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Forum = require("../models/forum");
const forumNewSchema = require("../schemas/forumNew.json");
const forumUpdateSchema = require("../schemas/forumUpdate.json");

const router = express.Router();

/**POST "/" {forum} => {forum}
 *
 * Adds a new forum. Only admin users are allowed to create a forum.
 *
 * Data can include:
 * {title, description, creator}
 *
 * Returns => {forum: {id, title, description, creator}}
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn, ensureIsAdmin, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creator: currentUser.id },
      forumNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new forum
    const forum = await Forum.create({ ...req.body, creator: currentUser.id });

    return res.status(201).json({ forum });
  } catch (err) {
    return next(err);
  }
});

/**GET "/" => {forums: [{forums}, {...}]}
 *
 * Returns all forums.
 *
 * Authorization required: login
 */

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const forums = await Forum.findAll();
    return res.json({ forums });
  } catch (err) {
    return next(err);
  }
});

/**GET "/:id" => {forum: {forum}}
 *
 * Given a forum id, returns the forum.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const forum = await Forum.findOne(req.params.id);
    return res.json({ forum });
  } catch (err) {
    return next(err);
  }
});

/**PATCH /:id  => {comment} => {comment}
 *
 * Given a forum id, edits the forum.
 *
 * Only admin users are allowed to edit forum info.
 *
 * Data can include:
 * {title, description}
 *
 * Returns => {id, title, description, creator}
 *
 * Authorization required: login and admin
 */

router.patch("/:id", ensureLoggedIn, ensureIsAdmin, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, forumUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // update forum
    const forum = await Forum.update(req.params.id, req.body);
    return res.json({ forum });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Forum id "id"}
 *
 * Deletes forum. Only admin users can delete a forum.
 *
 * Authorization required: login and admin
 */

router.delete("/:id", ensureLoggedIn, ensureIsAdmin, async (req, res, next) => {
  try {
    await Forum.remove(req.params.id);
    return res.json({ deleted: `Forum id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
