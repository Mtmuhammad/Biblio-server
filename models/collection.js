"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");
const { appendName } = require("../helpers/appendName");

/** Related functions for a user collection */

class Collection {
  /** create a new collection to store books
   *
   * Returns => {id, title, creatorId, date, isPrivate, fullName}
   *
   * Throws BadRequestError if duplicate title and owner.
   * Throws NotFoundError if owner does not exist.
   */

  static async create({ userId, title, isPrivate }) {
    /* Check to see if a collection with the same title exists from user.
      If the collection exists, throw error*/
    const duplicateCheck = await db.query(
      `SELECT * FROM collections WHERE id=$1 AND title=$2`,
      [userId, title]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        "Collection name already exists on this account!"
      );

    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [userId]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // create collection
    const result = await db.query(
      `
   INSERT INTO collections (title, creator_id, is_private)
   VALUES ($1,$2, $3)
   RETURNING id, title, creator_id AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date",
   is_private AS "isPrivate"`,
      [title, userId, isPrivate]
    );
    let collection = result.rows;

    collection = await appendName(collection);

    return collection[0];
  }

  /** Finds all public collections
   *
   * Returns => [{id, title, creatorId, date, fullName}, {...}, {...}]
   */

  static async findAllPublic() {
    const result = await db.query(
      `
    SELECT id, title, creator_id AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date"
    FROM collections
    WHERE is_private=$1`,
      [false]
    );

    let collections = result.rows;

    collections = await appendName(collections);
    return collections;
  }

  /**Given a userId, finds all collections owned by that user
   *
   * Returns => [{id, title, creatorId, date, isPrivate, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if user not found
   */

  static async findAllUser(userId) {
    // fetch collections by user id
    const result = await db.query(
      `SELECT
    id, title, creator_id AS "creatorId", 
    to_char(date_created, 'MM-DD-YYYY') AS "date", 
    is_private AS "isPrivate"
    FROM collections
    WHERE creator_id =$1`,
      [userId]
    );

    let collections = result.rows;

    if (collections.length === 0)
      throw new NotFoundError("Invalid data, user does not exist!");

    collections = await appendName(collections)

    return collections;
  }

  /** Given a collection id, finds individual collection
   *
   * Returns => {id, title, creatorId, date, isPrivate, fullName}
   *
   * Throws NotFoundError if no collection found
   */

  static async findOne(id) {
    // fetch collection by id in database
    const result = await db.query(
      `
    SELECT id, title, creator_id AS "creatorId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", 
    is_private AS "isPrivate" 
    FROM collections
    WHERE id = $1`,
      [id]
    );

    let collection = result.rows;

    // if not found, throw error
    if (!collection[0]) throw new NotFoundError(`No collection found!`);

    collection = await appendName(collection);

    return collection[0];
  }

  /** Update collection data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in owners of the collection can
   * update the given fields.
   *
   * Data can include:
   * { title, isPrivate }
   *
   * Returns => {id, title, creatorId, date, isPrivate, fullName}
   *
   * Throws NotFoundError if no collection found.
   * Throws BadRequestError if no data submitted.
   */

  static async update(id, data) {
    //if no data, throw an error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      isPrivate: "is_private",
    });

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE collections
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, title, creator_id AS "creatorId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", 
    is_private AS "isPrivate"
    `;

    const result = await db.query(querySql, [...values, id]);
    let collection = result.rows;

    // if no collection found, throw error
    if (!collection[0]) throw new NotFoundError(`No collection found!`);

    collection = await appendName(collection)

    return collection[0];
  }

  /** Given a collection id, deletes the collection
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no collection is found
   */

  static async remove(id) {
    // remove collection from the database
    const result = await db.query(
      `
    DELETE FROM collections WHERE id = $1 RETURNING id`,
      [id]
    );

    const collection = result.rows[0];
    // if no collection found, throw error
    if (!collection) throw new NotFoundError(`No collection found!`);
  }
}

module.exports = Collection;
