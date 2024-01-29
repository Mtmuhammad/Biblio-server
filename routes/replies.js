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
const Reply = require("../models/reply");
const replyNewSchema = require("../schemas/replyNew.json");
const replyUpdateSchema = require("../schemas/replyUpdate.json");

const router = express.Router();

/**POST "/" {reply} => {reply}
 *
 * Adds a new reply to a post. Any user can add a new reply.
 *
 * Data can include:
 * {creatorId, text, commentId}
 *
 * This returns newly added reply:
 * Returns => {id, creatorId, text, commentId, time, date, fullName}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creatorId: currentUser.id },
      replyNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new reply
    const reply = await Reply.create({
      ...req.body,
      creatorId: currentUser.id,
    });

    return res.status(201).json({ reply });
  } catch (err) {
    return next(err);
  }
});

/**GET "/" => {replies: [{reply}, {...}]}
 *
 * Returns all replies.
 *
 * Authorization required: login
 */

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const replies = await Reply.findAll();
    return res.json({ replies });
  } catch (err) {
    return next(err);
  }
});

/**GET "/comment/:id" => {replies: [{reply}, {...}]}
 *
 * Given a comment id, returns all replies for the comment.
 *
 * Authorization required: login
 */

router.get("/comment/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const replies = await Reply.findRepliesByComment(req.params.id);
    return res.json({ replies });
  } catch (err) {
    return next(err);
  }
});

/**GET "/user/:id" => {replies: [{reply}, {...}]}
 *
 * Given a user id, returns all replies from that user.
 *
 * Authorization required: login and correct user or admin
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const replies = await Reply.findRepliesByUser(req.params.id);
      return res.json({ replies });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET /:id => {reply: {reply}}
 *
 * Given a reply id, returns the reply.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const reply = await Reply.findOne(req.params.id);
    return res.json({ reply });
  } catch (err) {
    return next(err);
  }
});

/**PATCH "/replies/:id" => {reply: {reply}}
 *
 * Given a reply id, updates the reply.
 *
 * Only admin users or users who created the reply are allowed to edit it.
 *
 * Data can include:
 * {text, commentId, creatorId, date, time}
 *
 * This returns:
 * {id, creatorId, text, commentId, time, date, fullName}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, replyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Reply.findOne(req.params.id);
    checkUser(found, currUser);

    // update reply
    const reply = await Reply.update(req.params.id, req.body);
    return res.json({ reply });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Reply id "id"}
 *
 * Deleted reply.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Reply.findOne(req.params.id);
    checkUser(found, currUser);

    // remove reply
    await Reply.remove(req.params.id);
    return res.json({ deleted: `Reply id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
