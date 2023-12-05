"use strict";

/**Routes for comments. */

const jsonschema = require("jsonschema");
const express = require("express");
const {
  ensureLoggedIn,
  checkUser,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Comment = require("../models/comment");
const commentNewSchema = require("../schemas/commentNew.json");
const commentUpdateSchema = require("../schemas/collectionUpdate.json");

const router = express.Router();

/**POST "/" {comment} => {comment}
 *
 * Adds a new comment on a post. Any user can add a comment.
 *
 * Data can include:
 * { creatorId, text, postId }
 *
 * This returns newly added comment:
 * {comment: {id, creatorId, text, postId, date, time, fullName}}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creatorId: currentUser.id },
      commentNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new comment
    const comment = await Comment.create({
      ...req.body,
      creatorId: currentUser.id,
    });

    return res.status(201).json({ comment });
  } catch (err) {
    return next(err);
  }
});

/**GET "/" => {comments: [{comment}, {...}]}
 *
 * Returns all comments.
 *
 * Authorization required: login
 */

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const comments = await Comment.findAll();
    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
});

/**GET /user/:id => {comments: [{comment}, {...}]}
 *
 * Given a user id, returns all comments by that user.
 *
 * Authorization required: login and correct user or admin
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const comments = await Comment.findAllUser(req.params.id);
      return res.json({ comments });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET /post/:id => {comments: [{comment}, {...}]}
 *
 * Given a post id, returns all comments for that post.
 *
 * Authorization required: login
 */

router.get("/post/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const comments = await Comment.findCommentsByPost(req.params.id);
    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
});

/**GET /:id => {comment} => {comment}}
 *
 * Given a comment id, returns a comment.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findOne(req.params.id);
    return res.json({ comment });
  } catch (err) {
    return next(err);
  }
});

/**PATCH /:id  => {comment} => {comment}
 *
 * Given a comment id, edits the comment.
 *
 * Only admin users or users who created the comments are allowed to edit it.
 *
 * Data can include:
 * {text, postId, date, time, creatorId}
 *
 * Returns => {id, creatorId, text, postId, date, time, fullName}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, commentUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Comment.findOne(req.params.id);
    checkUser(found, currUser);

    // update comment
    const comment = await Comment.update(req.params.id, req.body);
    return res.json({ comment });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Comment id "id"}
 *
 * Deletes comment.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Comment.findOne(req.params.id);
    checkUser(found, currUser);

    // remove comment
    await Comment.remove(req.params.id);
    return res.json({ deleted: `Comment id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
