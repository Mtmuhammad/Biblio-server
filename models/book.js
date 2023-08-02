"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for a users books in a collection */

class Book {
  /** adds a new book to user collection.
   *
   * Returns => {
   *  id, collectionId, userId, key, author,
   *  title, description, year, status, date
   * }
   *
   * Throws BadRequestError if book already exists in collection.
   * Throws NotFoundError if owner does not exist.
   */

  static async add({
    collectionId,
    userId,
    key,
    author,
    title,
    description,
    year,
  }) {
    /** Check to see if the book already exists in user collection.
     * If the book exists, throw error*/
    const duplicateCheck = await db.query(
      `SELECT * FROM books WHERE key =$1 AND collection_id =$2`,
      [key, collectionId]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`
    Book already exists in user collection!`);

    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // add book to collection
    const result = await db.query(
      `
   INSERT INTO books (collection_id, user_id, key, author,
    title, description, year)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, collection_id AS "collectionId", 
    user_id AS "userId", key, author,
    title, description, year, status, 
    to_char(date_added, 'MM-DD-YYYY') AS "date"`,
      [collectionId, userId, key, author, title, description, year]
    );

    const book = result.rows[0];

    return book;
  }

  /**Given a collection id, finds all books in the collection.
   *
   * Returns => [{id, userId, key, author, title, description, year, status, date}, {...}]
   */

  static async findAll(collectionId) {
    // Get all books in the collection
    const result = await db.query(
      `
   SELECT 
   id, user_id AS "userId", key, author, 
   title, description, year, status, 
   to_char(date_added, 'MM-DD-YYYY') AS "date"
   FROM books
   WHERE collection_id =$1`,
      [collectionId]
    );

    return result.rows;
  }

  /** Given a book id, finds a book in the collection
   *
   * Returns => {id, collectionId, userId, key, author, title, description, year, status, date}
   *
   * Throws NotFoundError if book does not exist in collection
   */

  static async findOne(id) {
    // fetch book by id from database
    const result = await db.query(
      `
    SELECT id, collection_id AS "collectionId",
    user_id AS "userId", key, author, 
    title, description, year, status, 
    to_char(date_added, 'MM-DD-YYYY') AS "date"
    FROM books
    WHERE id = $1`,
      [id]
    );

    const book = result.rows[0];

    // if not found, throw error
    if (!book) throw new NotFoundError(`No book found!`);

    return book;
  }

  /*** Given book id, Update book data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in users who own the collection
   * the book is in can update the given fields. This
   *
   * Data can include:
   * {collectionId, key, author, title, description, year, status }
   *
   * Returns => {id, collectionId, userId, key, author, title, description, year, status, date}
   *
   * Throws NotFoundError if no user found
   */

  static async update(id, data) {
    //if no data, throw an error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      collectionId: "collection_id",
    });

    // will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE books
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, collection_id AS "collectionId",
    user_id AS "userId", key, author, title,
    description, year, status,
    to_char(date_added, 'MM-DD-YYYY') AS "date"`;

    const result = await db.query(querySql, [...values, id]);
    const book = result.rows[0];

    // if no book found, throw error
    if (!book) throw new NotFoundError(`No book found!`);

    return book;
  }

  /** Given a book id, removes the book
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no book is found
   */

  static async remove(id) {
    // remove book from collection in database
    const result = await db.query(
      `
    DELETE FROM books WHERE id = $1 RETURNING id`,
      [id]
    );

    const book = result.rows[0];
    // if no book found, throw error
    if (!book) throw new NotFoundError(`No book found!`);
  }
}

module.exports = Book;
