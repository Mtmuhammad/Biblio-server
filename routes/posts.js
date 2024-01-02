"use strict";

/**Routes for posts. */

const jsonschema = require("jsonschema");
const express = require("express");
const {
  ensureLoggedIn,
  checkUser,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Post = require("../models/post");
const postNewSchema = require("../schemas/postNew.json");
const postUpdateSchema = require("../schemas/postUpdate.json");

const router = express.Router();

/**POST "/" {post} => {post}
 *
 * Adds a new post. Any user can add a new post.
 *
 * Data can include:
 * { creatorId, title, postText, subject, forum }
 *
 * This returns newly added post:
 * Returns => {id, creatorId, date, title, postText, subject, forum, isPrivate, time, fullName}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creatorId: currentUser.id },
      postNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new post
    const post = await Post.create({ ...req.body, creatorId: currentUser.id });

    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

/**GET "/public" => {posts: [{post}, {...}]}
 *
 * Returns all public posts.
 *
 * Authorization required: login
 */

router.get("/public", ensureLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.findAllPublic();
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

/**GET "/user/:id" => {posts: [{post}, {...}]}
 *
 * Given a user id, returns all posts for that user.
 *
 * Authorization required: login and correct user or admin
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const posts = await Post.findAllUser(req.params.id);
      return res.json({ posts });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET "/posts/:id" => {post: {post}}
 *
 * Given a post id, returns info about the post.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

/**PATCH "/posts/:id" => {post: {post}}
 *
 * Given a post id, updates the post.
 *
 * Only admin users or users who created the post are allowed to edit it.
 *
 * Data can include:
 * {title, postText, subject, forum, isPrivate}
 *
 * This returns:
 * {id, creatorId, date, title, postText, subject, forum, isPrivate, time}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, postUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Post.findOne(req.params.id);
    checkUser(found, currUser);

    // update post
    const post = await Post.update(req.params.id, req.body);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Post id "id"}
 *
 * Deletes post.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Post.findOne(req.params.id);
    checkUser(found, currUser);

    // remove post
    await Post.remove(req.params.id);
    return res.json({ deleted: `Post id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
