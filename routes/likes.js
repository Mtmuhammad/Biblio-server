"use strict";

/**Routes for likes. */

const jsonschema = require("jsonschema");
const express = require("express");
const {
  ensureLoggedIn,
  checkUser,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Like = require("../models/like");
const likeNewSchema = require("../schemas/likeNew.json");
const likeUpdateSchema = require("../schemas/likeUpdate.json");

const router = express.Router();

/**POST "/" {like} => {like}
 *
 * Adds a new like on a post. Any user can add a new like.
 *
 * Data can include:
 * {postId, creatorId}
 *
 * This returns newly added like:
 * {like: {id, postId, creatorId, time, date, fullName}}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creatorId: currentUser.id },
      likeNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new like
    const like = await Like.create({
      ...req.body,
      creatorId: currentUser.id,
    });

    return res.status(201).json({ like });
  } catch (err) {
    return next(err);
  }
});

/**GET "/" => {likes: [{like}, {...}]}
 *
 * Returns all likes.
 *
 * Authorization required: login
 */

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const likes = await Like.findAll();
    return res.json({ likes });
  } catch (err) {
    return next(err);
  }
});

/**GET "/post/:id"  => {likes: [{like}, {...}]}
 *
 * Given a post id, returns all likes on the post.
 *
 * Authorization required: login
 */

router.get("/post/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const likes = await Like.findLikesByPost(req.params.id);
    return res.json({ likes });
  } catch (err) {
    return next(err);
  }
});

/**GET "/user/:id" => {likes: [{like}, {...}]}
 *
 * Given a user id, returns all the likes from that user.
 *
 * Authorization required: login and correct user or admin
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const likes = await Like.findLikesByUser(req.params.id);
      return res.json({ likes });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET "/:id"  => {like}
 *
 * Given a like id, returns the like.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const like = await Like.findOne(req.params.id);
    return res.json({ like });
  } catch (err) {
    return next(err);
  }
});

/**PATCH /:id => {like} => {like}
 *
 * Given a like id, edits the like.
 *
 * Only admin users or users who created the like are allowed to edit it.
 *
 * Data can include:
 * {postId, creatorId, time, date}
 *
 * Returns => {id, postId, creatorId, time, date, fullName}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, likeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Like.findOne(req.params.id);
    checkUser(found, currUser);

    // update like
    const like = await Like.update(req.params.id, req.body);
    return res.json({ like });
  } catch (err) {
    return next(err);
  }
});

/***DELETE "/:id" => {like} => {deleted: Like id: "id"}
 *
 * Deletes like.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Like.findOne(req.params.id);
    checkUser(found, currUser);

    // remove like
    await Like.remove(req.params.id);
    return res.json({ deleted: `Like id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
