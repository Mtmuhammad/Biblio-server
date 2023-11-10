"use strict";

/**Routes for collections. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, checkUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Collection = require("../models/collection");
const collectionNewSchema = require("../schemas/collectionNew.json");
const bookUpdateSchema = require("../schemas/bookUpdate.json");

const router = express.Router();

/** POST A BOOK
 * FIND ALL PUBLIC COLLECTIONS
 * GIVEN A USER ID, FINDS ALL COLLECTIONS BY USER
 * GIVEN A COLLECTION ID, FINDS THAT COLLECTION
 * UPDATE A COLLECTION
 * DELETE A COLLECTION
 */

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
    const collection = await Collection.add({
      ...req.body,
      userId: currentUser.id,
    });

    return res.status(201).json({ collection });
  } catch (err) {
    return next(err);
  }
});
