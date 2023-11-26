"use strict";

/**Routes for books. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, checkUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Book = require("../models/book");
const bookNewSchema = require("../schemas/bookNew.json");
const bookUpdateSchema = require("../schemas/bookUpdate.json");

const router = express.Router();

/**POST "/" {book} => {book}
 *
 * Adds a book to a collection. Any user can add a book to their collection.
 *
 * Data can include:
 * {collectionId, userId, key, author, title, description, year}
 *
 * This returns the newly added book:
 * {book: {id, collectionId, userId, key, author,
 *  title, description, year, status, date}}
 *
 * Auth required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, userId: currentUser.id },
      bookNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create book and add to collection
    const book = await Book.add({ ...req.body, userId: currentUser.id });

    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** GET "/collection/:id" => {books: [{id, userId, key, author,
 *  title, description, year, status, date}, {...}]}
 *
 * Given a collection id, returns list of all books in collection.
 *
 * Authorization required: login
 */

router.get("/collection/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const books = await Book.findAll(req.params.id);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/**GET "/:id"  => {book}
 *
 * Given a book id, returns info about saved book.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PATCH "/:id" {book} => {book}
 *
 * Only admin users, or users who added the book to the collection
 * can edit the book.
 *
 * Data can include:
 *  {collectionId, key, author, title, description, year, status }
 *
 * Returns => {id, collectionId, userId, key, author, title, description, year, status, date}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, bookUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Book.findOne(req.params.id);
    checkUser(found, currUser);

    // update book
    const book = await Book.update(req.params.id, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Book id "id"}
 * 
 * Deletes book.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Book.findOne(req.params.id);
    checkUser(found, currUser);

    // remove book
    await Book.remove(req.params.id);
    return res.json({ deleted: `Book id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
