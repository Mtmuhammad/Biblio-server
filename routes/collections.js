"use strict";

/**Routes for collections. */

const jsonschema = require("jsonschema");
const express = require("express");
const {
  ensureLoggedIn,
  checkUser,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Collection = require("../models/collection");
const collectionNewSchema = require("../schemas/collectionNew.json");
const collectionUpdateSchema = require("../schemas/collectionUpdate.json");

const router = express.Router();



/** POST "/" {collection} => {collection}
 *
 * Adds a new collection for books. Any user can add a new collection.
 *
 * Data can include:
 * { userId, title, isPrivate }
 *
 * This returns a newly added collection:
 * {collection: {id, title, owner, date, isPrivate}}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    // get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, userId: currentUser.id },
      collectionNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create new collection
    const collection = await Collection.create({
      ...req.body,
      userId: currentUser.id,
    });

    return res.status(201).json({ collection });
  } catch (err) {
    return next(err);
  }
});

/**GET "/public" => {collections: [{collection}, {...}]}
 *
 * Returns all public collections
 *
 * Authorization required: login
 */

router.get("/public", ensureLoggedIn, async (req, res, next) => {
  try {
    const collections = await Collection.findAllPublic();
    return res.json({ collections });
  } catch (err) {
    return next(err);
  }
});

/**GET "/user/:id" => {collections: [{collection}, {...}]}
 *
 * Given a user id, returns all collections owned by that user.
 *
 * Authorization required: login and correct user
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const collections = await Collection.findAllUser(req.params.id);
      return res.json({ collections });
    } catch (err) {
      return next(err);
    }
  }
);

/**GET "/:id" => {collection: {collection}}
 *
 * Given a collection id, returns info about the collection.
 *
 * Authorization required: login and correct user or admin
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const currUser = res.locals.user;
    const collection = await Collection.findOne(req.params.id);
    checkUser(collection, currUser);

    return res.json({ collection });
  } catch (err) {
    return next(err);
  }
});

/**PATCH "/:id"  => {collection} => {collection}
 * Given a collection id, edits the collection.
 *
 * Only admin users, or users who created the collection can edit it.
 *
 * Data can include:
 * { title, isPrivate }
 *
 * Returns => {id, title, creatorId, date, isPrivate, fullName}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, collectionUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Collection.findOne(req.params.id);
    checkUser(found, currUser);

    // update collection
    const collection = await Collection.update(req.params.id, req.body);
    return res.json({ collection });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Collection id "id"}
 *
 * Deletes collection.
 *
 * Authorization required: login and correct user or admin
 */
router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Collection.findOne(req.params.id);
    checkUser(found, currUser);

    // remove collection
    await Collection.remove(req.params.id);
    return res.json({ deleted: `Collection id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
